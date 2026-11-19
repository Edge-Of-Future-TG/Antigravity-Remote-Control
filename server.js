#!/usr/bin/env node
import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';
import http from 'http';
import https from 'https';
import net from 'net';
import fs from 'fs';
import os from 'os';
import WebSocket from 'ws';
import { fileURLToPath } from 'url';
import { basename, dirname, join } from 'path';
import { inspectUI } from './ui_inspector.js';
import {
    AntigravityHubBridge,
    DEFAULT_ANTIGRAVITY_MODELS,
    DEFAULT_SLASH_COMMANDS,
    resolveAttachmentMimeType
} from './hub_bridge.js';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORTS = [9000, 9001, 9002, 9003, 9222, 9223, 9229];
const POLL_INTERVAL = 1000; // 1 second
const SERVER_PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || 'antigravity';
const AUTH_COOKIE_NAME = 'ag_auth_token';

// Security warning for default credentials
if (APP_PASSWORD === 'antigravity') {
    console.warn('\n\x1b[33m%s\x1b[0m', '⚠️  SECURITY WARNING: Using default APP_PASSWORD ("antigravity").');
    console.warn('\x1b[33m%s\x1b[0m', '   Set a strong APP_PASSWORD in your .env file for production use.\n');
}

// Note: hashString is defined later, so we'll initialize the token inside createServer or use a simple string for now.
let AUTH_TOKEN = 'ag_default_token';


// Shared Hub RPC & CDP connections
const hubBridge = new AntigravityHubBridge();
let cdpConnection = null;
let lastSnapshot = null;
let lastSnapshotHash = null;
let lastSwarmEtag = '';

// Kill any existing process on the server port (prevents EADDRINUSE)
function killPortProcess(port) {
    try {
        if (process.platform === 'win32') {
            // Windows: Find PID using netstat and kill it
            const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            const lines = result.trim().split('\n');
            const pids = new Set();
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0' && pid !== process.pid.toString()) pids.add(pid);
            }
            for (const pid of pids) {
                try {
                    execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                    console.log(`⚠️  Killed existing process on port ${port} (PID: ${pid})`);
                } catch (e) { /* Process may have already exited */ }
            }
        } else {
            // Linux/macOS: Use lsof first, then fuser / ss fallback on minimal distros
            let rawPids = '';
            try {
                rawPids = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            } catch {
                try {
                    rawPids = execSync(`fuser ${port}/tcp 2>/dev/null || true`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
                } catch {}
                if (!rawPids.trim()) {
                    try {
                        const ssOut = execSync(`ss -tlnp "sport = :${port}" 2>/dev/null || true`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
                        const ssMatches = [...ssOut.matchAll(/pid=(\d+)/g)].map(m => m[1]);
                        rawPids = ssMatches.join('\n');
                    } catch {}
                }
            }
            const pids = rawPids
                .trim()
                .split(/\s+/)
                .filter(p => /^\d+$/.test(p) && p !== process.pid.toString());
            for (const pid of pids) {
                try {
                    execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
                    console.log(`⚠️  Killed existing process on port ${port} (PID: ${pid})`);
                } catch (e) { /* Process may have already exited */ }
            }
        }
        // Delay to let the port be released by the OS
        return new Promise(resolve => setTimeout(resolve, 1200));
    } catch (e) {
        // No process found on port - this is fine
        return Promise.resolve();
    }
}

// Get local IP address for mobile access
// Prefers real network IPs (192.168.x.x, 10.x.x.x) over virtual adapters (172.x.x.x from WSL/Docker)
function getLocalIP() {
    if (process.env.HOST_IP && process.env.HOST_IP.trim()) {
        return process.env.HOST_IP.trim();
    }
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                candidates.push({
                    address: iface.address,
                    name: name,
                    // Prioritize common home/office network ranges
                    priority: iface.address.startsWith('192.168.') ? 1 :
                        iface.address.startsWith('10.') ? 2 :
                            iface.address.startsWith('172.') ? 3 : 4
                });
            }
        }
    }

    // Sort by priority and return the best one
    candidates.sort((a, b) => a.priority - b.priority);
    return candidates.length > 0 ? candidates[0].address : 'localhost';
}

// Helper: HTTP GET JSON (with fast loopback timeout so closed CDP ports don't stall startup on Windows)
function getJson(url, timeoutMs = 450) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`Timeout after ${timeoutMs}ms`));
        });
    });
}

// Find Antigravity CDP endpoint
// Find Antigravity CDP endpoint
async function discoverCDP() {
    const errors = [];
    for (const port of PORTS) {
        try {
            const list = await getJson(`http://127.0.0.1:${port}/json/list`);

            // Priority 1: Standard Workbench (The main window)
            const workbench = list.find(t => t.url?.includes('workbench.html') || (t.title && t.title.includes('workbench')));
            if (workbench && workbench.webSocketDebuggerUrl) {
                console.log('Found Workbench target:', workbench.title);
                return { port, url: workbench.webSocketDebuggerUrl };
            }

            // Priority 2: Jetski/Launchpad (Fallback)
            const jetski = list.find(t => t.url?.includes('jetski') || t.title === 'Launchpad');
            if (jetski && jetski.webSocketDebuggerUrl) {
                console.log('Found Jetski/Launchpad target:', jetski.title);
                return { port, url: jetski.webSocketDebuggerUrl };
            }

            // Priority 3: Antigravity IDE Page Target (Fallback for Antigravity, excluding self-targets)
            const isSelfTarget = (t) => {
                const u = (t.url || '').toLowerCase();
                const title = (t.title || '').toLowerCase();
                return u.includes(':3000') || u.includes('snapshot') || title.includes('phone connect') || title.includes('omnibox') || u.includes('devtools');
            };
            const anyTarget = list.find(t => t.webSocketDebuggerUrl && !isSelfTarget(t) && (t.type === 'page' || t.url?.includes('127.0.0.1') || t.url?.includes('localhost')));
            if (anyTarget && anyTarget.webSocketDebuggerUrl) {
                console.log('Found Antigravity target:', anyTarget.title || anyTarget.url);
                return { port, url: anyTarget.webSocketDebuggerUrl };
            }
        } catch (e) {
            errors.push(`${port}: ${e.message}`);
        }
    }
    const errorSummary = errors.length ? `Errors: ${errors.join(', ')}` : 'No ports responding';
    throw new Error(`CDP not found. ${errorSummary}`);
}

// Connect to CDP
async function connectCDP(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
    });

    let idCounter = 1;
    const pendingCalls = new Map(); // Track pending calls by ID
    const contexts = [];
    const CDP_CALL_TIMEOUT = 30000; // 30 seconds timeout

    // Single centralized message handler (fixes MaxListenersExceeded warning)
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);

            // Handle CDP method responses
            if (data.id !== undefined && pendingCalls.has(data.id)) {
                const { resolve, reject, timeoutId } = pendingCalls.get(data.id);
                clearTimeout(timeoutId);
                pendingCalls.delete(data.id);

                if (data.error) reject(data.error);
                else resolve(data.result);
            }

            // Handle execution context events
            if (data.method === 'Runtime.executionContextCreated') {
                const ctx = data.params.context;
                if (ctx.name === 'Electron Isolated Context') {
                    contexts.unshift(ctx);
                } else {
                    contexts.push(ctx);
                }
            } else if (data.method === 'Runtime.executionContextDestroyed') {
                const id = data.params.executionContextId;
                const idx = contexts.findIndex(c => c.id === id);
                if (idx !== -1) contexts.splice(idx, 1);
            } else if (data.method === 'Runtime.executionContextsCleared') {
                contexts.length = 0;
            }
        } catch (e) { }
    });

    const call = (method, params) => new Promise((resolve, reject) => {
        const id = idCounter++;

        // Setup timeout to prevent memory leaks from never-resolved calls
        const timeoutId = setTimeout(() => {
            if (pendingCalls.has(id)) {
                pendingCalls.delete(id);
                reject(new Error(`CDP call ${method} timed out after ${CDP_CALL_TIMEOUT}ms`));
            }
        }, CDP_CALL_TIMEOUT);

        pendingCalls.set(id, { resolve, reject, timeoutId });
        ws.send(JSON.stringify({ id, method, params }));
    });

    await call("Runtime.enable", {});
    await new Promise(r => setTimeout(r, 1000));

    return { ws, call, contexts };
}

// Capture chat snapshot
async function captureSnapshot(cdp) {
    const CAPTURE_SCRIPT = `(async () => {
        let cascade = document.getElementById('conversation') || document.getElementById('chat') || document.getElementById('cascade');
        if (!cascade) {
            cascade = document.querySelector('[class*="cascade"]') ||
                      document.querySelector('[class*="chat-container"]') ||
                      document.querySelector('[class*="conversation"]') ||
                      document.querySelector('main') ||
                      document.body;
        }
        if (!cascade) {
            // Debug info
            const body = document.body;
            const childIds = Array.from(body.children).map(c => c.id).filter(id => id).join(', ');
            return { error: 'chat container not found', debug: { hasBody: !!body, availableIds: childIds } };
        }
        
        const cascadeStyles = window.getComputedStyle(cascade);
        
        // Find the main scrollable container
        const scrollContainer = cascade.querySelector('.overflow-y-auto, [data-scroll-area]') || cascade;
        const scrollInfo = {
            scrollTop: scrollContainer.scrollTop,
            scrollHeight: scrollContainer.scrollHeight,
            clientHeight: scrollContainer.clientHeight,
            scrollPercent: scrollContainer.scrollTop / (scrollContainer.scrollHeight - scrollContainer.clientHeight) || 0
        };
        
        // Mark fixed/absolute elements in the original DOM before cloning
        // This is the only way to reliably catch CSS-class-based positioning
        const candidates = cascade.querySelectorAll('*');
        candidates.forEach(el => {
            try {
                const pos = window.getComputedStyle(el).position;
                if (pos === 'fixed' || pos === 'absolute') {
                    el.setAttribute('data-ag-rem', 'true');
                }
            } catch(e) {}
        });

        // Clone cascade to modify it without affecting the original
        const clone = cascade.cloneNode(true);
        
        // Clean up markers from the original DOM immediately after cloning
        candidates.forEach(el => el.removeAttribute('data-ag-rem'));
        
        // Safe cleanup: Hide input/editor elements and desktop toolbar artifacts
        try {
            // Override desktop bottom padding on clone root and inner wrappers
            try {
                clone.style.paddingBottom = '8px';
                clone.style.marginBottom = '0px';
                const innerEls = clone.querySelectorAll('*');
                innerEls.forEach(el => {
                    if (el.style && el.style.paddingBottom && parseInt(el.style.paddingBottom) > 20) {
                        el.style.paddingBottom = '8px';
                    }
                    if (el.style && el.style.marginBottom && parseInt(el.style.marginBottom) > 20) {
                        el.style.marginBottom = '0px';
                    }
                });
            } catch(e) {}
            // 1. Remove bottom toolbar/review/input child rows from top-level cascade container
            const cascadeRows = Array.from(clone.children);
            cascadeRows.forEach(row => {
                try {
                    const text = (row.textContent || '').trim();
                    const html = (row.innerHTML || '').toLowerCase();

                    const isBottomToolbar = html.includes('ask anything') || 
                                            html.includes('/ for actions') || 
                                            html.includes('@ to mention') ||
                                            html.includes('lucide-mic') ||
                                            html.includes('review changes') ||
                                            text.includes('Files With') || 
                                            text.includes('File With') || 
                                            text.includes('Review Changes') || 
                                            (text.includes('Reject all') && text.includes('Accept all'));

                    const isMessageTurn = row.querySelector('[class*="message"], [class*="turn"], [class*="bubble"], p, pre, code');

                    if (isBottomToolbar && !isMessageTurn) {
                        row.remove();
                    }
                } catch(e) {}
            });

            // 2. Bottom-up traversal cleanup for nested desktop bottom bar elements
            const allNodes = Array.from(clone.querySelectorAll('*')).reverse();
            allNodes.forEach(el => {
                try {
                    const text = (el.textContent || '').trim();
                    const html = (el.innerHTML || '').toLowerCase();

                    const isDesktopArtifact = html.includes('ask anything') || 
                                               html.includes('/ for actions') || 
                                               html.includes('@ to mention') ||
                                               html.includes('lucide-mic') ||
                                               text.includes('Files With') || 
                                               text.includes('File With') || 
                                               text.includes('Review Changes') || 
                                               text === 'Reject all' || 
                                               text === 'Accept all' ||
                                               (text.includes('Gemini 3.6') && (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button'));

                    if (isDesktopArtifact) {
                        const isInsideMessage = el.closest('[class*="message"], [class*="turn"], [class*="bubble"]');
                        if (!isInsideMessage) {
                            // Find the outermost bottom bar container that is not a message turn
                            let container = el;
                            while (container.parentElement && 
                                   container.parentElement !== clone && 
                                   !container.parentElement.querySelector('[class*="message"], [class*="turn"], [class*="bubble"], p, pre, code')) {
                                container = container.parentElement;
                            }
                            container.remove();
                        }
                    }
                } catch(e) {}
            });

            // 3. Strip residual input editors, textareas, forms, and desktop buttons
            const editors = clone.querySelectorAll('[contenteditable="true"], [data-lexical-editor], [role="textbox"], textarea, form, svg.lucide-mic, button:has(svg.lucide-mic)');
            editors.forEach(el => {
                const isInsideMessage = el.closest('[class*="message"], [class*="turn"], [class*="bubble"]');
                if (!isInsideMessage) el.remove();
            });

            // 4. Remove empty wrapper containers left behind to eliminate black empty space
            const emptyContainers = Array.from(clone.querySelectorAll('div, section, p')).reverse();
            emptyContainers.forEach(el => {
                if (!el.children.length && !(el.textContent || '').trim() && !el.classList.contains('mobile-copy-btn')) {
                    const isInsideMessage = el.closest('[class*="message"], [class*="turn"], [class*="bubble"]');
                    if (!isInsideMessage) {
                        try { el.remove(); } catch(e) {}
                    }
                }
            });

            // 3. Fix background/border box artifacts on elements (without ruining icon buttons)
            const styledEls = clone.querySelectorAll('*');
            styledEls.forEach(el => {
                try {
                    const tag = el.tagName.toLowerCase();
                    if (['svg', 'path', 'circle', 'line', 'polyline', 'polygon', 'rect', 'g'].includes(tag)) return;

                    const style = el.getAttribute('style') || '';
                    const classList = typeof el.className === 'string' ? el.className : '';

                    if (style.includes('background: white') || style.includes('background-color: white') || 
                        style.includes('background: #fff') || style.includes('background-color: #fff') || 
                        style.includes('rgb(255, 255, 255)') || classList.includes('bg-white')) {
                        
                        if (tag === 'button' || tag === 'a' || (el.offsetWidth && el.offsetWidth < 36 && el.offsetHeight < 36)) {
                            el.style.backgroundColor = 'transparent';
                            el.style.background = 'transparent';
                            el.style.boxShadow = 'none';
                        } else {
                            el.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                            el.style.background = 'rgba(255, 255, 255, 0.04)';
                            el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            el.style.boxShadow = 'none';
                            el.style.color = '#f8fafc';
                        }
                    }
                } catch(e) {}
            });
        } catch (globalErr) { }

        // Convert local images to base64
        const images = clone.querySelectorAll('img');
        const promises = Array.from(images).map(async (img) => {
            const rawSrc = img.getAttribute('src');
            if (rawSrc && (rawSrc.startsWith('/') || rawSrc.startsWith('vscode-file:')) && !rawSrc.startsWith('data:')) {
                try {
                    const res = await fetch(rawSrc);
                    const blob = await res.blob();
                    await new Promise(r => {
                        const reader = new FileReader();
                        reader.onloadend = () => { img.src = reader.result; r(); };
                        reader.onerror = () => r();
                        reader.readAsDataURL(blob);
                    });
                } catch(e) {}
            }
        });
        await Promise.all(promises);

        // Fix inline file references: Antigravity nests <div> elements inside
        // <span> and <p> tags (e.g. file-type icons). Browsers auto-close <p> and
        // <span> when they encounter a <div>, causing unwanted line breaks.
        // Solution: Convert any <div> inside an inline parent to a <span>.
        try {
            const inlineTags = new Set(['SPAN', 'P', 'A', 'LABEL', 'EM', 'STRONG', 'CODE']);
            const allDivs = Array.from(clone.querySelectorAll('div'));
            for (const div of allDivs) {
                try {
                    if (!div.parentNode) continue;
                    const parent = div.parentElement;
                    if (!parent) continue;
                    
                    const parentIsInline = inlineTags.has(parent.tagName) || 
                        (parent.className && (parent.className.includes('inline-flex') || parent.className.includes('inline-block')));
                        
                    if (parentIsInline) {
                        const span = document.createElement('span');
                        // MOVE children instead of copying (prevents orphaning nested divs)
                        while (div.firstChild) {
                            span.appendChild(div.firstChild);
                        }
                        if (div.className) span.className = div.className;
                        if (div.getAttribute('style')) span.setAttribute('style', div.getAttribute('style'));
                        span.style.display = 'inline-flex';
                        span.style.alignItems = 'center';
                        span.style.verticalAlign = 'middle';
                        div.replaceWith(span);
                    }
                } catch(e) {}
            }
        } catch(e) {}
        
        const html = clone.outerHTML;
        
        const rules = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    rules.push(rule.cssText);
                }
            } catch (e) { }
        }
        const allCSS = rules.join('\\n');
        
        return {
            html: html,
            css: allCSS,
            backgroundColor: cascadeStyles.backgroundColor,
            color: cascadeStyles.color,
            fontFamily: cascadeStyles.fontFamily,
            scrollInfo: scrollInfo,
            stats: {
                nodes: clone.getElementsByTagName('*').length,
                htmlSize: html.length,
                cssSize: allCSS.length
            }
        };
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            // console.log(`Trying context ${ctx.id} (${ctx.name || ctx.origin})...`);
            const result = await cdp.call("Runtime.evaluate", {
                expression: CAPTURE_SCRIPT,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });

            if (result.exceptionDetails) {
                // console.log(`Context ${ctx.id} exception:`, result.exceptionDetails);
                continue;
            }

            if (result.result && result.result.value) {
                const val = result.result.value;
                if (val.error) {
                    // console.log(`Context ${ctx.id} script error:`, val.error);
                    // if (val.debug) console.log(`   Debug info:`, JSON.stringify(val.debug));
                } else {
                    return val;
                }
            }
        } catch (e) {
            console.log(`Context ${ctx.id} connection error:`, e.message);
        }
    }

    return null;
}

// Inject message (and optional direct native file attachments) into Antigravity DOM via CDP
async function injectMessage(cdp, text, attachments = []) {
    const safeText = JSON.stringify(text || '');
    const cdpFiles = [];
    if (Array.isArray(attachments) && attachments.length > 0) {
        const uploadsRoot = join(__dirname, 'uploads');
        for (const att of attachments) {
            const fileName = basename(String(att.fileName || att.name || 'attachment').replace(/\\/g, '/')) || 'attachment';
            const mimeType = resolveAttachmentMimeType(fileName, att.fileType || att.type || '');
            let base64 = '';
            const safeDisk = att.filePath ? hubBridge.resolveSafeMediaFilePath(att.filePath, [uploadsRoot]) : null;
            if (safeDisk) {
                try {
                    base64 = fs.readFileSync(safeDisk).toString('base64');
                } catch {}
            } else if (typeof att.dataUrl === 'string' && att.dataUrl.includes(';base64,')) {
                base64 = att.dataUrl.split(';base64,')[1] || '';
            } else if (typeof att.content === 'string') {
                base64 = Buffer.from(att.content, 'utf-8').toString('base64');
            }
            if (base64 || safeDisk) {
                cdpFiles.push({ fileName, mimeType, base64 });
            }
        }
    }
    const safeFilesJson = JSON.stringify(cdpFiles);

    const EXPRESSION = `(async () => {
        const cancel = document.querySelector('[data-testid="input-cancel-button"], [data-tooltip-id="input-send-button-cancel-tooltip"]');
        if (cancel && cancel.offsetParent !== null) return { ok:false, reason:"busy" };

        let editors = Array.from(document.querySelectorAll(
            '[data-testid="agent-input-box"] [contenteditable="true"], [data-testid="agent-input-box"] [data-lexical-editor], [data-testid="agent-input-box"] textarea, ' +
            '#conversation [contenteditable="true"], #chat [contenteditable="true"], #cascade [contenteditable="true"], ' +
            '[contenteditable="true"], [data-lexical-editor], [role="textbox"], textarea'
        )).filter(el => el.offsetParent !== null);

        let editor = editors.at(-1);
        if (!editor) return { ok:false, error:"editor_not_found" };

        const filesToAttach = ${safeFilesJson};
        if (Array.isArray(filesToAttach) && filesToAttach.length > 0) {
            try {
                const dt = new DataTransfer();
                for (const f of filesToAttach) {
                    const bin = atob(f.base64 || '');
                    const bytes = new Uint8Array(bin.length);
                    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    dt.items.add(new File([bytes], f.fileName || 'attachment', { type: f.mimeType || 'application/octet-stream' }));
                }
                const fileInput =
                    document.querySelector('[data-testid="agent-input-box"] input[type="file"]') ||
                    document.querySelector('input[type="file"]');
                if (fileInput) {
                    fileInput.files = dt.files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    editor.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
                }
                await new Promise(r => setTimeout(r, 420));
            } catch (attachErr) {}
        }

        const textToInsert = ${safeText};

        editor.focus();

        try {
            document.execCommand?.("selectAll", false, null);
            document.execCommand?.("delete", false, null);
        } catch(e) {}

        if (textToInsert) {
            let inserted = false;
            try { inserted = !!document.execCommand?.("insertText", false, textToInsert); } catch {}
            if (!inserted) {
                if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
                    editor.value = textToInsert;
                } else {
                    editor.textContent = textToInsert;
                }
                editor.dispatchEvent(new InputEvent("beforeinput", { bubbles:true, inputType:"insertText", data: textToInsert }));
                editor.dispatchEvent(new InputEvent("input", { bubbles:true, inputType:"insertText", data: textToInsert }));
            }
        }

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // Find send button (Antigravity 2.33 data-testid="send-button" first)
        const submit = document.querySelector('[data-testid="send-button"]') ||
                       document.querySelector("svg.lucide-arrow-right")?.closest("button") ||
                       document.querySelector("svg.lucide-arrow-up")?.closest("button") ||
                       document.querySelector("svg.lucide-send")?.closest("button") ||
                       document.querySelector('button[type="submit"]') ||
                       document.querySelector('[aria-label*="send" i]') ||
                       document.querySelector('[title*="send" i]');

        if (submit && !submit.disabled) {
            submit.click();
            submit.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            submit.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            return { ok:true, method:"click_submit" };
        }

        // Submit button fallback: Enter keypress
        editor.dispatchEvent(new KeyboardEvent("keydown", { bubbles:true, key:"Enter", code:"Enter", keyCode: 13, which: 13 }));
        editor.dispatchEvent(new KeyboardEvent("keyup", { bubbles:true, key:"Enter", code:"Enter", keyCode: 13, which: 13 }));
        
        return { ok:true, method:"enter_keypress" };
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const result = await cdp.call("Runtime.evaluate", {
                expression: EXPRESSION,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });

            if (result.result && result.result.value && result.result.value.ok !== false) {
                return result.result.value;
            }
        } catch (e) { }
    }

    return { ok: false, reason: "no_context" };
}

// Set functionality mode (Fast vs Planning)
async function setMode(cdp, mode) {
    if (!['Fast', 'Planning'].includes(mode)) return { error: 'Invalid mode' };

    const EXP = `(async () => {
        try {
            // STRATEGY: Find the element that IS the current mode indicator.
            // It will have text 'Fast' or 'Planning'.
            // It might not be a <button>, could be a <div> with cursor-pointer.
            
            // 1. Get all elements with text 'Fast' or 'Planning'
            const allEls = Array.from(document.querySelectorAll('*'));
            const candidates = allEls.filter(el => {
                // Must have single text node child to avoid parents
                if (el.children.length > 0) return false;
                const txt = el.textContent.trim();
                return txt === 'Fast' || txt === 'Planning';
            });

            // 2. Find the one that looks interactive (cursor-pointer)
            // Traverse up from text node to find clickable container
            let modeBtn = null;
            
            for (const el of candidates) {
                let current = el;
                // Go up max 4 levels
                for (let i = 0; i < 4; i++) {
                    if (!current) break;
                    const style = window.getComputedStyle(current);
                    if (style.cursor === 'pointer' || current.tagName === 'BUTTON') {
                        modeBtn = current;
                        break;
                    }
                    current = current.parentElement;
                }
                if (modeBtn) break;
            }

            if (!modeBtn) return { error: 'Mode indicator/button not found' };

            // Check if already set
            if (modeBtn.innerText.includes('${mode}')) return { success: true, alreadySet: true };

            // 3. Click to open menu
            modeBtn.click();
            await new Promise(r => setTimeout(r, 600));

            // 4. Find the dialog
            let visibleDialog = Array.from(document.querySelectorAll('[role="dialog"]'))
                                    .find(d => d.offsetHeight > 0 && d.innerText.includes('${mode}'));
            
            // Fallback: Just look for any new visible container if role=dialog is missing
            if (!visibleDialog) {
                // Maybe it's not role=dialog? Look for a popover-like div
                 visibleDialog = Array.from(document.querySelectorAll('div'))
                    .find(d => {
                        const style = window.getComputedStyle(d);
                        return d.offsetHeight > 0 && 
                               (style.position === 'absolute' || style.position === 'fixed') && 
                               d.innerText.includes('${mode}') &&
                               !d.innerText.includes('Files With Changes'); // Anti-context menu
                    });
            }

            if (!visibleDialog) return { error: 'Dropdown not opened or options not visible' };

            // 5. Click the option
            const allDialogEls = Array.from(visibleDialog.querySelectorAll('*'));
            const target = allDialogEls.find(el => 
                el.children.length === 0 && el.textContent.trim() === '${mode}'
            );

            if (target) {
                target.click();
                await new Promise(r => setTimeout(r, 200));
                return { success: true };
            }
            
            return { error: 'Mode option text not found in dialog. Dialog text: ' + visibleDialog.innerText.substring(0, 50) };

        } catch(err) {
            return { error: 'JS Error: ' + err.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Context failed' };
}

// Stop Generation (Antigravity 2.33 Hub DOM + Legacy DOM)
async function stopGeneration(cdp) {
    const EXP = `(async () => {
        const cancel = document.querySelector('[data-testid="input-cancel-button"], [data-testid="running-row-stop"], [data-tooltip-id="input-send-button-cancel-tooltip"]');
        if (cancel && cancel.offsetParent !== null) {
            cancel.click();
            return { success: true };
        }
        
        // Fallback: Look for a square icon in the send button area
        const stopBtn = document.querySelector('button svg.lucide-square')?.closest('button');
        if (stopBtn && stopBtn.offsetParent !== null) {
            stopBtn.click();
            return { success: true, method: 'fallback_square' };
        }

        return { error: 'No active generation found to stop' };
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Context failed' };
}

// Click Element (Remote)
async function clickElement(cdp, { selector, index, textContent }) {
    const safeText = JSON.stringify(textContent || '');

    const EXP = `(async () => {
        try {
            // Priority: Search inside the chat container first for better accuracy
            const root = document.getElementById('conversation') || document.getElementById('chat') || document.getElementById('cascade') || document;
            
            // Strategy: Find all elements matching the selector
            let elements = Array.from(root.querySelectorAll('${selector}'));
            
            // Safety: Exclude microphone / voice recording buttons from generic button clicks
            elements = elements.filter(el => {
                const html = (el.innerHTML || '').toLowerCase();
                const aria = (el.getAttribute('aria-label') || '').toLowerCase();
                const title = (el.getAttribute('title') || '').toLowerCase();
                return !html.includes('lucide-mic') && !aria.includes('mic') && !title.includes('mic');
            });
            
            const filterText = ${safeText};
            if (filterText) {
                elements = elements.filter(el => {
                    const txt = (el.innerText || el.textContent || '').trim();
                    const firstLine = txt.split('\\n')[0].trim();
                    // Match if first line matches (thought blocks) or if it contains the label (buttons)
                    return firstLine === filterText || txt.includes(filterText);
                });
                
                // CRITICAL: If elements are nested (e.g. <div><span>Text</span></div>), 
                // both will match. We only want the most specific (inner-most) one.
                elements = elements.filter(el => {
                    return !elements.some(other => other !== el && el.contains(other));
                });
            }

            const target = elements[${index}];

            if (target) {
                // Focus and Click
                if (target.focus) target.focus();
                target.click();
                return { success: true, found: elements.length, indexUsed: ${index} };
            }
            
            return { error: 'Element not found at index ' + ${index} + ' among ' + elements.length + ' matches' };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
            // If we found it but click didn't return success (unlikely with this script), continue to next context
        } catch (e) { }
    }
    return { error: 'Click failed in all contexts or element not found at index' };
}

// Remote scroll - sync phone scroll to desktop
async function remoteScroll(cdp, { scrollTop, scrollPercent }) {
    // Try to scroll the chat container in Antigravity
    const EXPRESSION = `(async () => {
        try {
            // Find the main scrollable chat container
            const scrollables = [...document.querySelectorAll('#conversation [class*="scroll"], #chat [class*="scroll"], #cascade [class*="scroll"], #conversation [style*="overflow"], #chat [style*="overflow"], #cascade [style*="overflow"]')]
                .filter(el => el.scrollHeight > el.clientHeight);
            
            // Also check for the main chat area
            const chatArea = document.querySelector('#conversation .overflow-y-auto, #chat .overflow-y-auto, #cascade .overflow-y-auto, #conversation [data-scroll-area], #chat [data-scroll-area], #cascade [data-scroll-area]');
            if (chatArea) scrollables.unshift(chatArea);
            
            if (scrollables.length === 0) {
                // Fallback: scroll the main container element
                const cascade = document.getElementById('conversation') || document.getElementById('chat') || document.getElementById('cascade');
                if (cascade && cascade.scrollHeight > cascade.clientHeight) {
                    scrollables.push(cascade);
                }
            }
            
            if (scrollables.length === 0) return { error: 'No scrollable element found' };
            
            const target = scrollables[0];
            
            // Use percentage-based scrolling for better sync
            if (${scrollPercent} !== undefined) {
                const maxScroll = target.scrollHeight - target.clientHeight;
                target.scrollTop = maxScroll * ${scrollPercent};
            } else {
                target.scrollTop = ${scrollTop || 0};
            }
            
            return { success: true, scrolled: target.scrollTop };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXPRESSION,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Scroll failed in all contexts' };
}

// Set AI Model (Antigravity 2.33 Hub DOM + Legacy DOM)
async function setModel(cdp, targetModel) {
    const safeModel = JSON.stringify(targetModel);

    const EXP = `(async () => {
        try {
            const targetModel = ${safeModel};

            let modelBtn = document.querySelector('[data-testid="model-selector-trigger"]') ||
                           document.querySelector('[aria-label*="Select model"]') ||
                           document.querySelector('[data-tooltip-id*="model"]');

            if (!modelBtn) {
                const buttons = Array.from(document.querySelectorAll('button'));
                modelBtn = buttons.find(b => {
                    const aria = (b.getAttribute('aria-label') || '').toLowerCase();
                    const txt = b.innerText || '';
                    return aria.includes('select model') || txt.includes('Gemini') || txt.includes('Orchestrator') || txt.includes('Claude') || txt.includes('GPT');
                });
            }

            if (!modelBtn) return { error: 'Model selector button not found' };

            modelBtn.click();
            modelBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            modelBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            await new Promise(r => setTimeout(r, 600));

            const popovers = Array.from(document.querySelectorAll('[data-testid="model-selector-panel"], div, [role="listbox"], [role="menu"]')).filter(el => {
                const txt = (el.innerText || el.textContent || '');
                const rect = el.getBoundingClientRect();
                return rect.height > 80 && (el.getAttribute('data-testid') === 'model-selector-panel' || txt.includes('Model') || txt.includes('Gemini') || txt.includes('Orchestrator') || txt.includes('Claude'));
            });

            if (popovers.length === 0) return { error: 'Model dropdown popover not found' };

            const popover = popovers[popovers.length - 1];
            const optionRows = Array.from(popover.querySelectorAll('[data-testid="model-selector-item"], div.cursor-pointer, [class*="cursor-pointer"], [role="option"], button'));

            let targetRow = null;
            for (const row of optionRows) {
                const txt = (row.innerText || row.textContent || '').trim();
                const titleSpan = Array.from(row.querySelectorAll('span, div')).find(s => {
                    const t = (s.innerText || s.textContent || '').trim();
                    return s.children.length === 0 && (t.includes('Gemini') || t.includes('Orchestrator') || t.includes('Claude') || t.includes('GPT'));
                });

                const rowTitle = titleSpan ? titleSpan.innerText.trim() : txt.split(String.fromCharCode(10))[0].trim();
                if (rowTitle.toLowerCase() === targetModel.toLowerCase() || rowTitle.toLowerCase().includes(targetModel.toLowerCase()) || targetModel.toLowerCase().includes(rowTitle.toLowerCase())) {
                    targetRow = row;
                    break;
                }
            }

            if (!targetRow) return { error: 'Model "' + targetModel + '" not found.' };

            targetRow.click();
            targetRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            targetRow.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            targetRow.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

            return { success: true, selectedModel: targetModel };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
            if (res.result?.value?.error) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Failed to set model' };
}

// Dynamically scrape available AI models from open menu
async function getModels(cdp) {
    const EXP = `(async () => {
        try {
            let modelBtn = document.querySelector('[data-testid="model-selector-trigger"]') ||
                           document.querySelector('[aria-label*="Select model"]') ||
                           document.querySelector('[data-tooltip-id*="model"]');

            if (!modelBtn) {
                const buttons = Array.from(document.querySelectorAll('button'));
                modelBtn = buttons.find(b => {
                    const aria = (b.getAttribute('aria-label') || '').toLowerCase();
                    const txt = b.innerText || '';
                    return aria.includes('select model') || txt.includes('Gemini') || txt.includes('Orchestrator') || txt.includes('Claude') || txt.includes('GPT');
                });
            }

            if (!modelBtn) return { error: 'Model selector button not found', models: [] };

            modelBtn.click();
            modelBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            modelBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            await new Promise(r => setTimeout(r, 600));

            const popovers = Array.from(document.querySelectorAll('[data-testid="model-selector-panel"], div, [role="listbox"], [role="menu"]')).filter(el => {
                const txt = (el.innerText || el.textContent || '');
                const rect = el.getBoundingClientRect();
                return rect.height > 80 && (el.getAttribute('data-testid') === 'model-selector-panel' || txt.includes('Model') || txt.includes('Gemini') || txt.includes('Orchestrator') || txt.includes('Claude'));
            });

            if (popovers.length === 0) return { error: 'Model dropdown popover not found', models: [] };

            const popover = popovers[popovers.length - 1];
            const optionRows = Array.from(popover.querySelectorAll('[data-testid="model-selector-item"], div.cursor-pointer, [class*="cursor-pointer"], [role="option"], button'));

            const models = [];
            const seen = new Set();
            for (const row of optionRows) {
                const titleSpan = Array.from(row.querySelectorAll('span, div')).find(s => {
                    const t = (s.innerText || s.textContent || '').trim();
                    return s.children.length === 0 && (t.includes('Gemini') || t.includes('Orchestrator') || t.includes('Claude') || t.includes('GPT'));
                });

                const rowTitle = titleSpan ? titleSpan.innerText.trim() : (row.innerText || '').trim().split(String.fromCharCode(10))[0].trim();
                if (rowTitle && !seen.has(rowTitle) && (rowTitle.includes('Gemini') || rowTitle.includes('Orchestrator') || rowTitle.includes('Claude') || rowTitle.includes('GPT'))) {
                    seen.add(rowTitle);
                    models.push(rowTitle);
                }
            }

            // Close menu via Escape key
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));

            return { success: true, models };
        } catch(e) {
            return { error: e.toString(), models: [] };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.models?.length) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Failed to fetch models', models: [] };
}

// Trigger Desktop Attach / Add Context Button
async function triggerAttach(cdp) {
    const EXP = `(async () => {
        try {
            // 1. Target active prompt editor in Antigravity IDE
            let editor = document.querySelector('#conversation [contenteditable="true"], #chat [contenteditable="true"], #cascade [contenteditable="true"], [contenteditable="true"], textarea');
            if (!editor) {
                const candidates = Array.from(document.querySelectorAll('[contenteditable="true"], textarea'));
                editor = candidates.find(el => el.offsetParent !== null);
            }

            if (!editor) return { error: 'Prompt editor not found' };

            // 2. Check for context / attachment button near editor wrapper
            const wrapper = editor.closest('form, div[class*="container"], div[class*="input"], div[class*="cascade"], div[class*="interaction"]') || editor.parentElement;
            if (wrapper) {
                const buttonCandidates = Array.from(wrapper.querySelectorAll('button, [role="button"], a'));
                const attachBtn = buttonCandidates.find(btn => {
                    const label = (btn.getAttribute('aria-label') || btn.getAttribute('title') || '').toLowerCase();
                    const tooltip = (btn.getAttribute('data-tooltip-id') || '').toLowerCase();
                    const hasPlusIcon = !!btn.querySelector('svg.lucide-plus, svg.lucide-paperclip, svg.lucide-file-plus');
                    return label.includes('context') || label.includes('attach') || label.includes('file') || tooltip.includes('context') || tooltip.includes('attach') || hasPlusIcon;
                });

                if (attachBtn) {
                    attachBtn.click();
                    attachBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                    attachBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                    return { success: true, method: 'clicked_context_button' };
                }
            }

            // 3. Focus editor and insert '@' character with full Keyboard and Input events
            editor.focus();
            
            // Dispatch keydown for '@'
            editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '@', code: 'Digit2', shiftKey: true, keyCode: 50 }));

            let inserted = false;
            try { inserted = !!document.execCommand('insertText', false, '@'); } catch(e) {}
            if (!inserted) {
                editor.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText', data: '@' }));
                if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
                    editor.value += '@';
                } else {
                    editor.textContent += '@';
                }
                editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '@' }));
            }

            editor.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: '@', code: 'Digit2', shiftKey: true, keyCode: 50 }));

            return { success: true, method: 'inserted_at_event' };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Failed to trigger attach in all contexts' };
}

// Start New Chat - Click the + button at the TOP of the chat window (NOT the context/media + button)
async function startNewChat(cdp) {
    const EXP = `(async () => {
        try {
            // Priority 1: Antigravity 2.33 data-testid & Legacy data-tooltip-id
            const exactBtn = document.querySelector('[data-testid="new-conversation-button"], [data-testid="app-icon-new-conversation-button"], [data-tooltip-id="new-conversation-tooltip"]');
            if (exactBtn) {
                exactBtn.click();
                return { success: true, method: 'exact-selector' };
            }

            // Fallback: Use previous heuristics
            const allButtons = Array.from(document.querySelectorAll('button, [role="button"], a'));
            
            // Find all buttons with plus icons
            const plusButtons = allButtons.filter(btn => {
                if (btn.offsetParent === null) return false; // Skip hidden
                const hasPlusIcon = btn.querySelector('svg.lucide-plus') || 
                                   btn.querySelector('svg.lucide-square-plus') ||
                                   btn.querySelector('svg[class*="plus"]');
                return hasPlusIcon;
            });
            
            // Filter only top buttons (toolbar area)
            const topPlusButtons = plusButtons.filter(btn => {
                const rect = btn.getBoundingClientRect();
                return rect.top < 200;
            });

            if (topPlusButtons.length > 0) {
                 topPlusButtons.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
                 topPlusButtons[0].click();
                 return { success: true, method: 'filtered_top_plus', count: topPlusButtons.length };
            }
            
            // Fallback: aria-label
             const newChatBtn = allButtons.find(btn => {
                const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
                const title = btn.getAttribute('title')?.toLowerCase() || '';
                return (ariaLabel.includes('new') || title.includes('new')) && btn.offsetParent !== null;
            });
            
            if (newChatBtn) {
                newChatBtn.click();
                return { success: true, method: 'aria_label_new' };
            }
            
            return { error: 'New chat button not found' };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Context failed' };
}
// Get Chat History - Click history button and scrape conversations
async function getChatHistory(cdp) {
    const EXP = `(async () => {
        try {
            const chats = [];
            const seenTitles = new Set();

            let historyBtn = document.querySelector('[data-tooltip-id="history-tooltip"]') ||
                             document.querySelector('svg.lucide-history')?.closest('a, button') ||
                             document.querySelector('[data-tooltip-id*="history"], [aria-label*="History"], [title*="History"]');
            
            // Priority 2: Look for button ADJACENT to the new chat button
            if (!historyBtn) {
                const newChatBtn = document.querySelector('[data-tooltip-id="new-conversation-tooltip"], [aria-label*="New Conversation"], [title*="New Conversation"]');
                if (newChatBtn) {
                    const parent = newChatBtn.parentElement;
                    if (parent) {
                        const siblings = Array.from(parent.children).filter(el => el !== newChatBtn);
                        historyBtn = siblings.find(el => el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button');
                    }
                }
            }

            // Click history button with mouse events
            if (historyBtn) {
                historyBtn.click();
                historyBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                historyBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            }

            // Poll for history popover container via search input (up to 1.5s)
            let popover = null;
            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 150));
                
                const searchInput = Array.from(document.querySelectorAll('input')).find(inp => {
                    const ph = (inp.placeholder || '').toLowerCase();
                    return ph.includes('convos') || ph.includes('search all convos');
                });

                if (searchInput) {
                    let curr = searchInput;
                    while (curr && curr.parentElement) {
                        curr = curr.parentElement;
                        const cls = curr.className || '';
                        if (cls.includes('z-[')) {
                            popover = curr;
                            break;
                        }
                    }
                }
                if (popover) break;
            }

            if (!popover) {
                return { error: 'History popover did not open', chats: [] };
            }

            const rows = Array.from(popover.querySelectorAll('div.cursor-pointer, [class*="cursor-pointer"]'));
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const titleSpan = Array.from(row.querySelectorAll('span')).find(s => {
                    const txt = (s.innerText || s.textContent || '').trim();
                    const cls = s.className || '';
                    return s.children.length === 0 && txt.length > 1 && !cls.includes('text-xs') && !cls.includes('opacity');
                });

                if (titleSpan) {
                    const title = titleSpan.innerText.trim();
                    if (!seenTitles.has(title)) {
                        seenTitles.add(title);
                        chats.push({ title: title, index: i, date: 'Recent' });
                    }
                }
            }

            // Press Escape to close popover overlay after reading
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));

            return { success: true, chats: chats };
        } catch(e) {
            return { error: e.toString(), chats: [] };
        }
    })()`;

    let lastError = null;
    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value) return res.result.value;
            // If result.value is null/undefined but no error thrown, check exceptionDetails
            if (res.exceptionDetails) {
                lastError = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
            }
        } catch (e) {
            lastError = e.message;
        }
    }
    return { error: 'Context failed: ' + (lastError || 'No contexts available'), chats: [] };
}

async function selectChat(cdp, options) {
    const title = typeof options === 'string' ? options : options?.title || '';
    const index = typeof options === 'object' && typeof options?.index === 'number' ? options.index : -1;
    const safeTitle = JSON.stringify(title);

    const EXP = `(async () => {
        try {
            const targetTitle = ${safeTitle};
            const targetIndex = ${index};

            function getHistoryButton() {
                let btn = document.querySelector('[data-tooltip-id="history-tooltip"]') ||
                          document.querySelector('svg.lucide-history')?.closest('a, button') ||
                          document.querySelector('[data-tooltip-id*="history"], [aria-label*="History"], [title*="History"]');
                if (!btn) {
                    const newChatBtn = document.querySelector('[data-tooltip-id="new-conversation-tooltip"], [aria-label*="New Conversation"], [title*="New Conversation"]');
                    if (newChatBtn && newChatBtn.parentElement) {
                        const siblings = Array.from(newChatBtn.parentElement.children).filter(el => el !== newChatBtn);
                        btn = siblings.find(el => el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button');
                    }
                }
                return btn;
            }

            // 1. Check if history popover is open
            let searchInput = Array.from(document.querySelectorAll('input')).find(i => {
                const ph = (i.placeholder || '').toLowerCase();
                return ph.includes('convo') || ph.includes('search') || ph.includes('history') || ph.includes('chat');
            });

            if (!searchInput) {
                const historyBtn = getHistoryButton();
                if (historyBtn) {
                    historyBtn.click();
                    await new Promise(r => setTimeout(r, 600));
                }
            }

            // 2. Locate search input and popover
            for (let i = 0; i < 10; i++) {
                searchInput = Array.from(document.querySelectorAll('input')).find(inp => {
                    const ph = (inp.placeholder || '').toLowerCase();
                    return ph.includes('convo') || ph.includes('search') || ph.includes('history') || ph.includes('chat');
                });
                if (searchInput) break;
                await new Promise(r => setTimeout(r, 150));
            }

            let popover = null;
            if (searchInput) {
                let curr = searchInput;
                while (curr && curr.parentElement && curr.parentElement !== document.body) {
                    curr = curr.parentElement;
                    const cls = curr.className || '';
                    const role = curr.getAttribute('role') || '';
                    if (cls.includes('z-') || cls.includes('popover') || cls.includes('dropdown') || cls.includes('content') || role === 'dialog' || role === 'menu') {
                        popover = curr;
                        break;
                    }
                }
                if (!popover) popover = searchInput.parentElement?.parentElement || document.body;
            } else {
                popover = document.querySelector('[class*="popover"], [role="dialog"], [role="menu"]') || document.body;
            }

            // 3. Locate history rows in popover
            const rows = Array.from(popover.querySelectorAll('div.cursor-pointer, [class*="cursor-pointer"], [role="option"], [role="menuitem"], li, div[onclick]'));
            let targetRow = null;

            // Strategy A: Direct Index Match
            if (targetIndex >= 0 && targetIndex < rows.length) {
                targetRow = rows[targetIndex];
            }

            // Strategy B: Clean Title Match
            if (!targetRow && targetTitle) {
                const cleanTarget = targetTitle.replace(/[\\.\\.]{2,}$/, '').trim().toLowerCase();
                for (const row of rows) {
                    const txt = (row.innerText || row.textContent || '').trim().toLowerCase();
                    const cleanTxt = txt.replace(/[\\.\\.]{2,}$/, '').trim();
                    if (cleanTxt === cleanTarget || txt.includes(cleanTarget) || (cleanTarget.length > 5 && cleanTxt.includes(cleanTarget.substring(0, 15)))) {
                        targetRow = row;
                        break;
                    }
                }
            }

            if (!targetRow && rows.length > 0) {
                targetRow = rows[0];
            }

            if (!targetRow) return { error: 'No history rows found in popover' };

            // 4. Click target row
            targetRow.scrollIntoView({ block: 'nearest' });
            
            const childClickable = targetRow.querySelector('a, button, [role="button"], span') || targetRow;
            childClickable.click();
            if (childClickable !== targetRow) {
                try { targetRow.click(); } catch(e){}
            }

            // 5. Poll for VS Code QuickInput modal ("Open in current window")
            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 150));
                const qWidget = document.querySelector('.quick-input-widget, [class*="quick-input"]');
                const openInCurrent = Array.from(document.querySelectorAll('*')).find(el => (el.innerText || el.textContent || '').includes('Open in current window'));
                if (qWidget || openInCurrent) {
                    const targetEl = openInCurrent || qWidget?.querySelector('.quick-input-list-entry, .monaco-list-row') || qWidget;
                    if (targetEl) {
                        targetEl.click();
                    }
                    return { success: true, selected: targetTitle, needsNativeEnter: true };
                }
            }

            // Clean up popover overlay after selection
            await new Promise(r => setTimeout(r, 300));
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));

            return { success: true, selected: targetTitle };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) {
                if (res.result.value.needsNativeEnter) {
                    await cdp.call("Input.dispatchKeyEvent", {
                        type: "rawKeyDown",
                        windowsVirtualKeyCode: 13,
                        key: "Enter",
                        code: "Enter",
                        text: "\r"
                    });
                    await new Promise(r => setTimeout(r, 100));
                    await cdp.call("Input.dispatchKeyEvent", {
                        type: "keyUp",
                        windowsVirtualKeyCode: 13,
                        key: "Enter",
                        code: "Enter"
                    });
                }
                return res.result.value;
            }
        } catch (e) { }
    }
    return { error: 'Failed to select conversation' };
}

// Close History Panel (Escape)
async function closeHistory(cdp) {
    const EXP = `(async () => {
        try {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
            document.dispatchEvent(new KeyboardEvent('keyup',   { key: 'Escape', code: 'Escape', bubbles: true }));
            return { success: true };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Failed to close history panel' };
}

// Check if a chat is currently open (has cascade element)
async function hasChatOpen(cdp) {
    const EXP = `(() => {
    try {
        const input = document.querySelector('textarea, [contenteditable="true"], [data-lexical-editor="true"], [placeholder*="Ask"], [placeholder*="Message"], [placeholder*="Type"]');
        const messages = document.querySelectorAll('[class*="message"], [data-message], [class*="chat"], [class*="turn"], [class*="bubble"]');
        const cascade = document.getElementById('conversation') || document.getElementById('chat') || document.getElementById('cascade') || document.querySelector('[class*="cascade"]') || document.querySelector('main');
        const hasContainer = !!(cascade || input || messages.length > 0);
        return {
            hasChat: hasContainer,
            hasMessages: messages.length > 0 || (cascade && cascade.innerText.length > 30),
            editorFound: !!input
        };
    } catch(e) {
        return { hasChat: false, hasMessages: false, editorFound: false };
    }
})()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                contextId: ctx.id
            });
            if (res.result?.value) return res.result.value;
        } catch (e) { }
    }
    return { hasChat: false, hasMessages: false, editorFound: false };
}

// Get App State (Mode & Model)
async function getAppState(cdp) {
    const EXP = `(async () => {
    try {
        const state = { mode: 'Unknown', model: 'Unknown' };

        // 1. Get Mode (Fast/Planning)
        // Strategy: Find the clickable mode button which contains either "Fast" or "Planning"
        // It's usually a button or div with cursor:pointer containing the mode text
        const allEls = Array.from(document.querySelectorAll('*'));

        // Find elements that are likely mode buttons
        for (const el of allEls) {
            if (el.children.length > 0) continue;
            const text = (el.innerText || '').trim();
            if (text !== 'Fast' && text !== 'Planning') continue;

            // Check if this or a parent is clickable (the actual mode selector)
            let current = el;
            for (let i = 0; i < 5; i++) {
                if (!current) break;
                const style = window.getComputedStyle(current);
                if (style.cursor === 'pointer' || current.tagName === 'BUTTON') {
                    state.mode = text;
                    break;
                }
                current = current.parentElement;
            }
            if (state.mode !== 'Unknown') break;
        }

        // Fallback: Just look for visible text
        if (state.mode === 'Unknown') {
            const textNodes = allEls.filter(el => el.children.length === 0 && el.innerText);
            if (textNodes.some(el => el.innerText.trim() === 'Planning')) state.mode = 'Planning';
            else if (textNodes.some(el => el.innerText.trim() === 'Fast')) state.mode = 'Fast';
        }

        // 2. Get Model (Antigravity 2.33 model-selector-trigger + Legacy)
        const triggerBtn = document.querySelector('[data-testid="model-selector-trigger"]');
        if (triggerBtn) {
            const aria = triggerBtn.getAttribute('aria-label') || '';
            const m = /current:\s*(.+)$/i.exec(aria);
            state.model = m ? m[1].trim() : (triggerBtn.innerText || '').replace(/[\^v∨▼▲]/g, '').trim();
            if (state.mode === 'Unknown') state.mode = 'Agent';
            return state;
        }

        const KNOWN_MODELS = ["Gemini", "Orchestrator", "Claude", "GPT", "DeepSeek", "o1", "o3"];
        const inputArea = document.querySelector('form, [class*="interaction"], [class*="cascade"], main') || document.body;
        const candidates = Array.from(inputArea.querySelectorAll('button, [role="button"], div, span'));
        
        let modelEl = candidates.find(b => {
            if (b.children.length > 2) return false;
            const txt = (b.innerText || '').trim();
            if (!KNOWN_MODELS.some(k => txt.includes(k))) return false;
            const style = window.getComputedStyle(b);
            return (b.tagName === 'BUTTON' || style.cursor === 'pointer');
        });
        
        if (!modelEl) {
            const textNodes2 = allEls.filter(el => el.children.length === 0 && el.innerText);
            modelEl = textNodes2.find(el => {
                const txt = el.innerText.trim();
                return KNOWN_MODELS.some(k => txt.includes(k)) && txt.length < 60;
            });
        }

        if (modelEl) {
            let cleanTxt = modelEl.innerText.trim();
            if (cleanTxt.startsWith('+')) cleanTxt = cleanTxt.substring(1).trim();
            // Remove trailing dropdown arrows if present
            cleanTxt = cleanTxt.replace(/[\^v∨▼▲]/g, '').trim();
            state.model = cleanTxt;
        }

        return state;
    } catch (e) { return { error: e.toString() }; }
})()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call("Runtime.evaluate", {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value) return res.result.value;
        } catch (e) { }
    }
    return { error: 'Context failed' };
}

// Simple hash function
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Check if a request is from the same Wi-Fi / private RFC-1918 LAN
function isLocalRequest(req) {
    // 1. Check for proxy headers (Cloudflare, ngrok, Pinggy, etc.)
    if (
        req.headers['x-forwarded-for'] ||
        req.headers['x-forwarded-host'] ||
        req.headers['x-real-ip'] ||
        req.headers['cf-connecting-ip']
    ) {
        return false;
    }

    // 2. Normalize IPv6-mapped IPv4 addresses (e.g. ::ffff:192.168.1.5)
    const rawIp = String(req.ip || req.socket?.remoteAddress || '').trim();
    if (!rawIp) return false;
    if (rawIp === '::1') return true;

    const ip = rawIp.replace(/^::ffff:/i, '');
    if (ip === '127.0.0.1' || ip.startsWith('127.')) return true;
    if (ip.startsWith('192.168.') || ip.startsWith('10.')) return true;

    // Exact RFC-1918 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
    const m172 = /^172\.(\d{1,2})\.\d{1,3}\.\d{1,3}$/.exec(ip);
    if (m172) {
        const second = Number(m172[1]);
        return second >= 16 && second <= 31;
    }

    return false;
}

// Initialize CDP connection
async function initCDP({ silent = false } = {}) {
    if (!silent) console.log('🔍 Discovering Antigravity CDP endpoint...');
    const cdpInfo = await discoverCDP();
    console.log(`✅ Found Antigravity on port ${cdpInfo.port}`);

    console.log('🔌 Connecting to CDP...');
    cdpConnection = await connectCDP(cdpInfo.url);
    console.log(`✅ Connected! Found ${cdpConnection.contexts.length} execution contexts\n`);
}

// Background polling (Hybrid: Antigravity 2.33 Hub RPC Primary + CDP Fallback)
async function startPolling(wss) {
    let lastErrorLog = 0;
    let isConnecting = false;
    let lastGeneratingState = false;

    const getAdaptiveHubPollMs = (isGenerating) => {
        const hasClients = wss.clients.size > 0;
        if (isGenerating && hasClients) return 450;
        if (hasClients) return POLL_INTERVAL;
        return 2500;
    };

    const poll = async () => {
        // 1. Try zero-config Antigravity 2.33 Hub RPC first
        try {
            const hub = await hubBridge.discoverHub();
            if (hub) {
                isConnecting = false;
                const requestedCid = hubBridge.activeCascadeId;
                const snapshot = await hubBridge.buildSnapshotFromHub(requestedCid);
                if (snapshot && !snapshot.error) {
                    // Discard stale poll if activeCascadeId changed mid-RPC
                    if (
                        hubBridge.activeCascadeId &&
                        snapshot.cascadeId &&
                        snapshot.cascadeId !== hubBridge.activeCascadeId
                    ) {
                        setTimeout(poll, 350);
                        return;
                    }
                    const hash = hashString(snapshot.html + '|' + Boolean(snapshot.isGenerating));
                    snapshot.hash = hash;
                    const nextSwarmEtag = snapshot.activeSwarm?.etag || '';

                    if (hash !== lastSnapshotHash || Boolean(snapshot.isGenerating) !== lastGeneratingState) {
                        lastSnapshot = snapshot;
                        lastSnapshotHash = hash;
                        lastGeneratingState = Boolean(snapshot.isGenerating);
                        lastSwarmEtag = nextSwarmEtag;

                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'snapshot_update',
                                    source: 'hub',
                                    isGenerating: Boolean(snapshot.isGenerating),
                                    cascadeId: snapshot.cascadeId || null,
                                    activeSwarm: snapshot.activeSwarm || null,
                                    timestamp: new Date().toISOString()
                                }));
                            }
                        });
                    } else if (nextSwarmEtag !== lastSwarmEtag) {
                        lastSnapshot = snapshot;
                        lastSwarmEtag = nextSwarmEtag;
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'swarm_update',
                                    source: 'hub',
                                    cascadeId: snapshot.cascadeId || null,
                                    activeSwarm: snapshot.activeSwarm || null,
                                    timestamp: new Date().toISOString()
                                }));
                            }
                        });
                    }
                    setTimeout(poll, getAdaptiveHubPollMs(Boolean(snapshot.isGenerating)));
                    return;
                }
            }
        } catch (hubErr) {
            // Fall through to CDP polling if Hub RPC is temporarily unreachable
        }

        // 2. Fallback to CDP polling (--remote-debugging-port=9000)
        if (!cdpConnection || (cdpConnection.ws && cdpConnection.ws.readyState !== WebSocket.OPEN)) {
            if (!isConnecting) {
                console.log('🔍 Looking for Antigravity Hub or CDP connection...');
                isConnecting = true;
            }
            if (cdpConnection) {
                console.log('🔄 CDP connection lost. Attempting to reconnect...');
                cdpConnection = null;
            }
            try {
                await initCDP({ silent: true });
                if (cdpConnection) {
                    console.log('✅ CDP Connection established from polling loop');
                    isConnecting = false;
                }
            } catch (err) {
                // Not found yet, wait for next cycle
            }
            setTimeout(poll, 2000);
            return;
        }

        try {
            const snapshot = await captureSnapshot(cdpConnection);
            if (snapshot && !snapshot.error) {
                const hash = hashString(snapshot.html);
                snapshot.hash = hash;

                // Only update if content changed
                if (hash !== lastSnapshotHash) {
                    lastSnapshot = snapshot;
                    lastSnapshotHash = hash;

                    // Broadcast to all connected clients
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'snapshot_update',
                                source: 'cdp',
                                timestamp: new Date().toISOString()
                            }));
                        }
                    });

                    console.log(`📸 Snapshot updated(hash: ${hash})`);
                }
            } else {
                const now = Date.now();
                if (!lastErrorLog || now - lastErrorLog > 10000) {
                    const errorMsg = snapshot?.error || 'No valid snapshot captured (check contexts)';
                    console.warn(`⚠️  Snapshot capture issue: ${errorMsg} `);
                    lastErrorLog = now;
                }
            }
        } catch (err) {
            console.error('Poll error:', err.message);
        }

        setTimeout(poll, POLL_INTERVAL);
    };

    poll();
}

// Create Express app
async function createServer() {
    const app = express();

    // Check for SSL certificates
    const keyPath = join(__dirname, 'certs', 'server.key');
    const certPath = join(__dirname, 'certs', 'server.cert');
    const hasSSL = fs.existsSync(keyPath) && fs.existsSync(certPath);

    const httpServer = http.createServer(app);
    let httpsServer = null;
    let server;

    const wss = new WebSocketServer({ noServer: true });
    const handleWsUpgrade = (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    };
    httpServer.on('upgrade', handleWsUpgrade);

    if (hasSSL) {
        const sslOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
        httpsServer = https.createServer(sslOptions, app);
        httpsServer.on('upgrade', handleWsUpgrade);

        // Dual HTTP + HTTPS multiplexer on the same port (0x16 = TLS ClientHello)
        server = net.createServer((socket) => {
            const handshakeTimer = setTimeout(() => {
                socket.destroy();
            }, 6000);
            const onReadable = () => {
                const firstByte = socket.read(1);
                if (!firstByte) return;
                clearTimeout(handshakeTimer);
                socket.removeListener('readable', onReadable);
                socket.unshift(firstByte);
                const target = firstByte[0] === 0x16 ? httpsServer : httpServer;
                target.emit('connection', socket);
            };
            socket.on('readable', onReadable);
            socket.once('close', () => clearTimeout(handshakeTimer));
            socket.on('error', () => clearTimeout(handshakeTimer));
        });
    } else {
        server = httpServer;
    }

    wss.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️  WebSocketServer port in use: ${err.message}`);
        } else {
            console.error('❌ WebSocketServer error:', err.message);
        }
    });

    // Initialize Auth Token using a unique salt from environment
    const authSalt = process.env.AUTH_SALT || 'antigravity_default_salt_99';
    AUTH_TOKEN = hashString(APP_PASSWORD + authSalt);

    app.use(compression());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Use a secure session secret from .env if available
    const sessionSecret = process.env.SESSION_SECRET || 'antigravity_secret_key_1337';

    if (sessionSecret === 'antigravity_secret_key_1337') {
        console.warn('\n\x1b[33m%s\x1b[0m', '⚠️  SECURITY WARNING: Using default SESSION_SECRET ("antigravity_secret_key_1337").');
        console.warn('\x1b[33m%s\x1b[0m', '   Set a strong SESSION_SECRET in your .env file for production use.\n');
    }
    app.use(cookieParser(sessionSecret));

    // Ngrok Bypass Middleware
    app.use((req, res, next) => {
        // Tell ngrok to skip the "visit" warning for API requests
        res.setHeader('ngrok-skip-browser-warning', 'true');
        next();
    });

    // Auth Middleware
    app.use((req, res, next) => {
        const publicPaths = ['/login', '/login.html', '/favicon.ico', '/health', '/apk-status'];
        if (publicPaths.includes(req.path) || req.path.startsWith('/css/') || req.path.startsWith('/assets/')) {
            return next();
        }

        // Exempt local Wi-Fi devices from authentication
        if (isLocalRequest(req)) {
            return next();
        }

        // Header token auth for Android Native APK & authenticated fetch (also syncs cookie for media subrequests)
        const headerKey = req.headers['x-ag-key'];
        if (headerKey && headerKey === APP_PASSWORD) {
            if (req.signedCookies[AUTH_COOKIE_NAME] !== AUTH_TOKEN) {
                res.cookie(AUTH_COOKIE_NAME, AUTH_TOKEN, {
                    httpOnly: true,
                    signed: true,
                    sameSite: 'lax',
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                });
            }
            return next();
        }

        // Magic Link / QR Code Auto-Login
        if (req.query.key === APP_PASSWORD) {
            res.cookie(AUTH_COOKIE_NAME, AUTH_TOKEN, {
                httpOnly: true,
                signed: true,
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            if (req.method === 'GET' && !req.path.startsWith('/download/') && !req.path.startsWith('/hub/')) {
                return res.redirect('/');
            }
            return next();
        }

        const token = req.signedCookies[AUTH_COOKIE_NAME];
        if (token === AUTH_TOKEN) {
            return next();
        }

        // If it's an API request, return 401 JSON instead of HTML redirect
        const isApi = req.xhr || 
                      req.headers.accept?.includes('json') || 
                      req.headers['content-type']?.includes('json') ||
                      req.path.startsWith('/snapshot') || 
                      req.path.startsWith('/send') || 
                      req.path.startsWith('/upload') || 
                      req.path.startsWith('/click') || 
                      req.path.startsWith('/remote') || 
                      req.path.startsWith('/attach') || 
                      req.path.startsWith('/set') || 
                      req.path.startsWith('/get-') ||
                      req.path.startsWith('/app-state') ||
                      req.path.startsWith('/chat-') ||
                      req.path.startsWith('/new-chat') ||
                      req.path.startsWith('/select-chat') ||
                      req.path.startsWith('/delete-chat') ||
                      req.path.startsWith('/slash-commands') ||
                      req.path.startsWith('/hub-interact') ||
                      req.path.startsWith('/hub/') ||
                      req.path.startsWith('/quota') ||
                      req.path.startsWith('/swarm') ||
                      req.path.startsWith('/ide') ||
                      req.path.startsWith('/export-chat') ||
                      req.path.startsWith('/stop');

        if (isApi) {
            res.status(401).json({ error: 'Unauthorized' });
        } else {
            res.redirect('/login.html');
        }
    });

    app.get('/favicon.ico', (_req, res) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#101010"/><path d="M32 10L10 21l22 11 22-11-22-11zm-22 22l22 11 22-11M10 43l22 11 22-11" fill="none" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(svg);
    });

    app.use(express.static(join(__dirname, 'public'), {
        etag: false,
        maxAge: 0,
        setHeaders: (res, path) => {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }));

    // Login endpoint
    app.post('/login', (req, res) => {
        const { password } = req.body;
        if (password === APP_PASSWORD) {
            res.cookie(AUTH_COOKIE_NAME, AUTH_TOKEN, {
                httpOnly: true,
                signed: true,
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
        }
    });

    // Logout endpoint
    app.post('/logout', (req, res) => {
        res.clearCookie(AUTH_COOKIE_NAME);
        res.json({ success: true });
    });

    // Helper to locate built Android APK
    function resolveApkPath() {
        const candidates = [
            join(__dirname, '..', 'Antigravity-Remote-Control-v6.0.apk'),
            join(__dirname, 'Antigravity-Remote-Control-v6.0.apk'),
            join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
        ];
        return candidates.find(p => fs.existsSync(p)) || null;
    }

    // Get current snapshot (or build on demand from Hub)
    app.get('/snapshot', async (req, res) => {
        if (!lastSnapshot) {
            try {
                const snap = await hubBridge.buildSnapshotFromHub();
                if (snap && !snap.error) {
                    snap.hash = hashString(snap.html + '|' + Boolean(snap.isGenerating));
                    lastSnapshot = snap;
                    lastSnapshotHash = snap.hash;
                }
            } catch {}
        }
        if (!lastSnapshot) {
            return res.status(503).json({ error: 'No snapshot available yet' });
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(lastSnapshot);
    });

    // Health check endpoint (also used by Android LAN Auto-Discovery)
    app.get('/health', async (req, res) => {
        if (!hubBridge.isConnected()) {
            try { await hubBridge.discoverHub(); } catch {}
        }
        const apkPath = resolveApkPath();
        res.json({
            status: 'ok',
            service: 'antigravity-remote-control',
            version: '6.0.0',
            hubConnected: hubBridge.isConnected(),
            lsVersion: hubBridge.hubInfo?.lsVersion || null,
            targetApp: hubBridge.targetApp || 'antigravity',
            cdpConnected: cdpConnection?.ws?.readyState === 1,
            apkAvailable: !!apkPath,
            hostname: os.hostname(),
            localIp: getLocalIP(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            https: hasSSL
        });
    });

    // APK Status & Direct Mobile Download Endpoints
    app.get('/apk-status', (req, res) => {
        const apkPath = resolveApkPath();
        if (!apkPath) return res.json({ available: false });
        const stat = fs.statSync(apkPath);
        res.json({
            available: true,
            fileName: 'Antigravity-Remote-Control-v6.0.apk',
            sizeBytes: stat.size,
            sizeMb: (stat.size / (1024 * 1024)).toFixed(1),
            downloadUrl: '/download/apk'
        });
    });

    app.get('/download/apk', (req, res) => {
        const apkPath = resolveApkPath();
        if (!apkPath) return res.status(404).json({ error: 'Android APK not built yet' });
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="Antigravity-Remote-Control-v6.0.apk"');
        fs.createReadStream(apkPath).pipe(res);
    });

    // SSL status endpoint
    app.get('/ssl-status', (req, res) => {
        const keyPath = join(__dirname, 'certs', 'server.key');
        const certPath = join(__dirname, 'certs', 'server.cert');
        const certsExist = fs.existsSync(keyPath) && fs.existsSync(certPath);
        res.json({
            enabled: hasSSL,
            certsExist: certsExist,
            message: hasSSL ? 'HTTPS is active' :
                certsExist ? 'Certificates exist, restart server to enable HTTPS' :
                    'No certificates found'
        });
    });

    // Generate SSL certificates endpoint
    app.post('/generate-ssl', async (req, res) => {
        try {
            const { execSync } = await import('child_process');
            execSync('node generate_ssl.js', { cwd: __dirname, stdio: 'pipe' });
            res.json({
                success: true,
                message: 'SSL certificates generated! Restart the server to enable HTTPS.'
            });
        } catch (e) {
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    });

    // Debug UI Endpoint
    app.get('/debug-ui', async (req, res) => {
        if (!cdpConnection) return res.status(503).json({ error: 'CDP not connected' });
        const uiTree = await inspectUI(cdpConnection);
        console.log('--- UI TREE ---');
        console.log(uiTree);
        console.log('---------------');
        res.type('json').send(uiTree);
    });

    // Stop Generation (Hub RPC + CDP)
    app.post('/stop', async (req, res) => {
        const { cascadeId } = req.body || {};
        if (await hubBridge.discoverHub()) {
            const hubRes = await hubBridge.stopGeneration(cascadeId);
            if (hubRes.success) return res.json(hubRes);
        }
        if (!cdpConnection) return res.status(503).json({ error: 'Antigravity disconnected' });
        const result = await stopGeneration(cdpConnection);
        res.json(result);
    });

    // Ensure uploads directory exists
    const UPLOADS_DIR = join(__dirname, 'uploads');
    if (!fs.existsSync(UPLOADS_DIR)) {
        try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch(e) {}
    }

    let uploadFileCounter = 0;
    const buildUniqueUploadFileName = (rawName = 'attachment') => {
        uploadFileCounter = (uploadFileCounter + 1) % 1000000;
        const base = basename(String(rawName || 'attachment').replace(/\\/g, '/')) || 'attachment';
        const sanitized = base.replace(/[^a-zA-Z0-9_.-]/g, '_');
        return `${Date.now()}_${uploadFileCounter}_${sanitized}`;
    };

    // Secure Trajectory & Uploaded Media Streaming Endpoint (supports HTTP Range for video/audio)
    app.get('/hub/media', (req, res) => {
        try {
            const rawUri = req.query.uri ? String(req.query.uri) : '';
            const safePath = hubBridge.resolveSafeMediaFilePath(rawUri, [UPLOADS_DIR]);
            if (!safePath) {
                return res.status(403).json({ error: 'Media file outside allowed storage or not found' });
            }

            const stat = fs.statSync(safePath);
            const totalSize = stat.size;
            const mime = resolveAttachmentMimeType(safePath, '');
            res.setHeader('Content-Type', mime);
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'private, max-age=86400');

            const rangeHeader = req.headers.range;
            if (rangeHeader && totalSize > 0) {
                const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
                if (match) {
                    let start = match[1] ? parseInt(match[1], 10) : 0;
                    let end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
                    if (!match[1] && match[2]) {
                        start = Math.max(0, totalSize - parseInt(match[2], 10));
                        end = totalSize - 1;
                    }
                    if (start >= totalSize || end >= totalSize || start > end) {
                        res.setHeader('Content-Range', `bytes */${totalSize}`);
                        return res.status(416).end();
                    }
                    res.status(206);
                    res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
                    res.setHeader('Content-Length', String(end - start + 1));
                    fs.createReadStream(safePath, { start, end }).pipe(res);
                    return;
                }
            }

            res.setHeader('Content-Length', String(totalSize));
            fs.createReadStream(safePath).pipe(res);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Upload Attachment Endpoint
    app.post('/upload-attachment', (req, res) => {
        try {
            const { fileName, fileType, dataUrl, textContent } = req.body;
            if (!fileName) return res.status(400).json({ error: 'fileName required' });

            const resolvedMime = resolveAttachmentMimeType(fileName, fileType || '');
            const safeFileName = buildUniqueUploadFileName(fileName);
            const targetPath = join(UPLOADS_DIR, safeFileName);

            if (dataUrl && dataUrl.startsWith('data:')) {
                const base64Data = dataUrl.split(',')[1] || '';
                fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
            } else if (typeof textContent === 'string') {
                fs.writeFileSync(targetPath, textContent, 'utf-8');
            } else {
                return res.status(400).json({ error: 'No file content provided' });
            }

            res.json({
                success: true,
                fileName: fileName,
                savedName: safeFileName,
                fileType: resolvedMime,
                filePath: targetPath.replace(/\\/g, '/'),
                isImage: resolvedMime.startsWith('image/')
            });
        } catch (err) {
            console.error('Upload error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // Upload Media & Send Endpoint (direct native attachment, zero location clutter in prompt)
    app.post('/upload-media', async (req, res) => {
        try {
            const { fileName, fileType, dataUrl, textContent, caption } = req.body;
            if (!fileName) return res.status(400).json({ error: 'fileName required' });

            const resolvedMime = resolveAttachmentMimeType(fileName, fileType || '');
            const safeFileName = buildUniqueUploadFileName(fileName);
            const targetPath = join(UPLOADS_DIR, safeFileName).replace(/\\/g, '/');

            if (dataUrl && dataUrl.startsWith('data:')) {
                const base64Data = dataUrl.split(',')[1] || '';
                fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
            } else if (typeof textContent === 'string') {
                fs.writeFileSync(targetPath, textContent, 'utf-8');
            } else {
                return res.status(400).json({ error: 'No file content provided' });
            }

            console.log(`💾 Saved uploaded media to disk: ${targetPath}`);

            const isImg = resolvedMime.startsWith('image/');
            const cleanCaption = String(caption || '').trim();
            const attachmentItem = {
                fileName,
                filePath: targetPath,
                fileType: resolvedMime,
                isImage: isImg,
                dataUrl: dataUrl || '',
                content: typeof textContent === 'string' ? textContent : ''
            };

            if (await hubBridge.discoverHub()) {
                const hubRes = await hubBridge.sendMessage({
                    message: cleanCaption,
                    attachments: [attachmentItem]
                });
                return res.json({
                    success: hubRes.ok !== false,
                    filePath: targetPath,
                    cascadeId: hubRes.cascadeId,
                    method: hubRes.method || 'hub_rpc'
                });
            }

            if (!cdpConnection) {
                return res.json({ success: true, filePath: targetPath, cdp: false });
            }

            const result = await injectMessage(cdpConnection, cleanCaption, [attachmentItem]);
            res.json({
                success: result.ok !== false,
                filePath: targetPath,
                method: result.method || 'attempted',
                details: result
            });
        } catch (err) {
            console.error('Upload media error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // Send message endpoint (Hub RPC Primary + CDP Fallback)
    app.post('/send', async (req, res) => {
        let { message, attachments, quotes, cascadeId } = req.body || {};

        const hasQuotes =
            Array.isArray(quotes) &&
            quotes.some(q => String(typeof q === 'string' ? q : q?.content || q?.text || '').trim().length > 0);
        const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

        if (!String(message || '').trim() && !hasAttachments && !hasQuotes) {
            return res.status(400).json({ error: 'Message, quote, or attachment required' });
        }

        // Validate existing staged paths inside UPLOADS_DIR or stage unsaved payloads to disk
        if (hasAttachments) {
            for (const att of attachments) {
                if (att.filePath) {
                    const validated = hubBridge.resolveSafeMediaFilePath(att.filePath, [UPLOADS_DIR]);
                    att.filePath = validated ? validated.replace(/\\/g, '/') : '';
                }
                if (!att.filePath && att.dataUrl && att.dataUrl.startsWith('data:')) {
                    try {
                        const fileName = att.fileName || att.name || `file_${Date.now()}`;
                        const safeName = buildUniqueUploadFileName(fileName);
                        const savedPath = join(UPLOADS_DIR, safeName).replace(/\\/g, '/');
                        const base64Data = att.dataUrl.split(',')[1] || '';
                        fs.writeFileSync(savedPath, Buffer.from(base64Data, 'base64'));
                        att.filePath = savedPath;
                    } catch (e) {
                        console.error('Error writing file attachment:', e);
                    }
                } else if (!att.filePath && typeof att.content === 'string') {
                    try {
                        const fileName = att.fileName || att.name || `file_${Date.now()}.txt`;
                        const safeName = buildUniqueUploadFileName(fileName);
                        const savedPath = join(UPLOADS_DIR, safeName).replace(/\\/g, '/');
                        fs.writeFileSync(savedPath, att.content, 'utf-8');
                        att.filePath = savedPath;
                    } catch (e) {}
                }
            }
        }

        // 1. Primary: Antigravity 2.33 Hub RPC
        if (await hubBridge.discoverHub()) {
            try {
                const hubRes = await hubBridge.sendMessage({
                    message,
                    attachments,
                    quotes,
                    targetCascadeId: cascadeId || null
                });
                if (hubRes.ok !== false) {
                    lastSnapshot = null;
                    lastSnapshotHash = null;
                    // Brief settle delay so language_server persists the new USER_INPUT step before immediate snapshot
                    await new Promise(r => setTimeout(r, 140));
                    try {
                        const snap = await hubBridge.buildSnapshotFromHub(hubRes.cascadeId);
                        if (snap && !snap.error) {
                            snap.hash = hashString(snap.html + '|' + Boolean(snap.isGenerating));
                            lastSnapshot = snap;
                            lastSnapshotHash = snap.hash;
                            lastSwarmEtag = snap.activeSwarm?.etag || '';
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'snapshot_update',
                                        source: 'hub',
                                        isGenerating: Boolean(snap.isGenerating),
                                        cascadeId: snap.cascadeId || null,
                                        activeSwarm: snap.activeSwarm || null,
                                        timestamp: new Date().toISOString()
                                    }));
                                }
                            });
                        }
                    } catch {}
                    return res.json({
                        success: true,
                        cascadeId: hubRes.cascadeId,
                        parentCascadeId: hubRes.parentCascadeId || null,
                        isSideQuestion: Boolean(hubRes.isSideQuestion),
                        method: hubRes.method || 'hub_rpc',
                        details: hubRes
                    });
                }
                if (hubRes && hubRes.error && !/disconnected/i.test(hubRes.error)) {
                    return res.status(400).json({ success: false, error: hubRes.error });
                }
            } catch (hubSendErr) {
                console.warn('Hub sendMessage error, attempting CDP fallback:', hubSendErr.message);
            }
        }

        // 2. Secondary: CDP DOM Injection (attaches files directly to file input without polluting prompt text)
        if (!cdpConnection) {
            return res.status(503).json({ error: 'Antigravity Hub & CDP not connected' });
        }

        let formattedText = message || '';

        if (hasQuotes) {
            let leadingSlashes = '';
            const leadSlashMatch = /^(\s*\/[a-zA-Z0-9][a-zA-Z0-9_.:-]*(?:\?[^\s)]+)?(?=\s|$))+/.exec(formattedText);
            if (leadSlashMatch) {
                leadingSlashes = leadSlashMatch[0].trim() + ' ';
                formattedText = formattedText.slice(leadSlashMatch[0].length).trim();
            }

            const formattedQuotes = quotes
                .map(q => {
                    const content = String(typeof q === 'string' ? q : q?.content || q?.text || '').trim();
                    if (!content) return '';
                    const isCode = typeof q === 'object' && (q?.label === 'code_block' || q?.isCode);
                    const ans = typeof q === 'object' ? String(q?.answer || '').trim() : '';
                    const quotedBlock = isCode
                        ? `\`\`\`\n${content}\n\`\`\``
                        : content
                              .split(/\r?\n/)
                              .map(ln => `> ${ln}`)
                              .join('\n');
                    return ans ? `${quotedBlock}\n\n${ans}` : quotedBlock;
                })
                .filter(Boolean)
                .join('\n\n');
            if (formattedQuotes) {
                formattedText = `${leadingSlashes}${formattedQuotes}${formattedText.trim() ? `\n\n${formattedText.trim()}` : ''}`.trim();
            }
        }

        const result = await injectMessage(cdpConnection, formattedText, hasAttachments ? attachments : []);

        res.json({
            success: result.ok !== false,
            method: result.method || 'attempted',
            details: result
        });
    });

    // UI Inspection endpoint - Returns all buttons as JSON for debugging
    app.get('/ui-inspect', async (req, res) => {
        if (!cdpConnection) return res.status(503).json({ error: 'CDP disconnected' });

        const EXP = `(() => {
    try {
        // Safeguard for non-DOM contexts
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return { error: 'Non-DOM context' };
        }

        // Helper to get string class name safely (handles SVGAnimatedString)
        function getCls(el) {
            if (!el) return '';
            if (typeof el.className === 'string') return el.className;
            if (el.className && typeof el.className.baseVal === 'string') return el.className.baseVal;
            return '';
        }

        // Helper to pierce Shadow DOM
        function findAllElements(selector, root = document) {
            let results = Array.from(root.querySelectorAll(selector));
            const elements = root.querySelectorAll('*');
            for (const el of elements) {
                try {
                    if (el.shadowRoot) {
                        results = results.concat(Array.from(el.shadowRoot.querySelectorAll(selector)));
                    }
                } catch (e) { }
            }
            return results;
        }

        // Get standard info
        const url = window.location ? window.location.href : '';
        const title = document.title || '';
        const bodyLen = document.body ? document.body.innerHTML.length : 0;
        const hasCascade = !!document.getElementById('cascade') || !!document.querySelector('.cascade');

        // Scan for buttons
        const allLucideElements = findAllElements('svg[class*="lucide"]').map(svg => {
            const parent = svg.closest('button, [role="button"], div, span, a');
            if (!parent || parent.offsetParent === null) return null;
            const rect = parent.getBoundingClientRect();
            return {
                type: 'lucide-icon',
                tag: parent.tagName.toLowerCase(),
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                svgClasses: getCls(svg),
                className: getCls(parent).substring(0, 100),
                ariaLabel: parent.getAttribute('aria-label') || '',
                title: parent.getAttribute('title') || '',
                parentText: (parent.innerText || '').trim().substring(0, 50)
            };
        }).filter(Boolean);

        const buttons = findAllElements('button, [role="button"]').map((btn, i) => {
            const rect = btn.getBoundingClientRect();
            const svg = btn.querySelector('svg');

            return {
                type: 'button',
                index: i,
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                text: (btn.innerText || '').trim().substring(0, 50) || '(empty)',
                ariaLabel: btn.getAttribute('aria-label') || '',
                title: btn.getAttribute('title') || '',
                svgClasses: getCls(svg),
                className: getCls(btn).substring(0, 100),
                visible: btn.offsetParent !== null
            };
        }).filter(b => b.visible);

        return {
            url, title, bodyLen, hasCascade,
            buttons, lucideIcons: allLucideElements
        };
    } catch (err) {
        return { error: err.toString(), stack: err.stack };
    }
})()`;

        try {
            // 1. Get Frames
            const { frameTree } = await cdpConnection.call("Page.getFrameTree");
            function flattenFrames(node) {
                let list = [{
                    id: node.frame.id,
                    url: node.frame.url,
                    name: node.frame.name,
                    parentId: node.frame.parentId
                }];
                if (node.childFrames) {
                    for (const child of node.childFrames) list = list.concat(flattenFrames(child));
                }
                return list;
            }
            const allFrames = flattenFrames(frameTree);

            // 2. Map Contexts
            const contexts = cdpConnection.contexts.map(c => ({
                id: c.id,
                name: c.name,
                origin: c.origin,
                frameId: c.auxData ? c.auxData.frameId : null,
                isDefault: c.auxData ? c.auxData.isDefault : false
            }));

            // 3. Scan ALL Contexts
            const contextResults = [];
            for (const ctx of contexts) {
                try {
                    const result = await cdpConnection.call("Runtime.evaluate", {
                        expression: EXP,
                        returnByValue: true,
                        contextId: ctx.id
                    });

                    if (result.result?.value) {
                        const val = result.result.value;
                        contextResults.push({
                            contextId: ctx.id,
                            frameId: ctx.frameId,
                            url: val.url,
                            title: val.title,
                            hasCascade: val.hasCascade,
                            buttonCount: val.buttons.length,
                            lucideCount: val.lucideIcons.length,
                            buttons: val.buttons, // Store buttons for analysis
                            lucideIcons: val.lucideIcons
                        });
                    } else if (result.exceptionDetails) {
                        contextResults.push({
                            contextId: ctx.id,
                            frameId: ctx.frameId,
                            error: `Script Exception: ${result.exceptionDetails.text} ${result.exceptionDetails.exception?.description || ''} `
                        });
                    } else {
                        contextResults.push({
                            contextId: ctx.id,
                            frameId: ctx.frameId,
                            error: 'No value returned (undefined)'
                        });
                    }
                } catch (e) {
                    contextResults.push({ contextId: ctx.id, error: e.message });
                }
            }

            // 4. Match and Analyze
            const cascadeFrame = allFrames.find(f => f.url.includes('cascade'));
            const matchingContext = contextResults.find(c => c.frameId === cascadeFrame?.id);
            const contentContext = contextResults.sort((a, b) => (b.buttonCount || 0) - (a.buttonCount || 0))[0];

            // Prepare "useful buttons" from the best context
            const bestContext = matchingContext || contentContext;
            const usefulButtons = bestContext ? (bestContext.buttons || []).filter(b =>
                b.ariaLabel?.includes('New Conversation') ||
                b.title?.includes('New Conversation') ||
                b.ariaLabel?.includes('Past Conversations') ||
                b.title?.includes('Past Conversations') ||
                b.ariaLabel?.includes('History')
            ) : [];

            res.json({
                summary: {
                    frameFound: !!cascadeFrame,
                    cascadeFrameId: cascadeFrame?.id,
                    contextFound: !!matchingContext,
                    bestContextId: bestContext?.contextId
                },
                frames: allFrames,
                contexts: contexts,
                scanResults: contextResults.map(c => ({
                    id: c.contextId,
                    frameId: c.frameId,
                    url: c.url,
                    hasCascade: c.hasCascade,
                    buttons: c.buttonCount,
                    error: c.error
                })),
                usefulButtons: usefulButtons,
                bestContextData: bestContext // Full data for the best context
            });

        } catch (e) {
            res.status(500).json({ error: e.message, stack: e.stack });
        }
    });

    // Endpoint to list all CDP targets - helpful for debugging connection issues
    app.get('/cdp-targets', async (req, res) => {
        const results = {};
        for (const port of PORTS) {
            try {
                const list = await getJson(`http://127.0.0.1:${port}/json/list`);
                results[port] = list;
            } catch (e) {
                results[port] = e.message;
            }
        }
        res.json(results);
    });

    // WebSocket connection with Auth check
    wss.on('connection', (ws, req) => {
        // Parse cookies from headers
        const rawCookies = req.headers.cookie || '';
        const parsedCookies = {};
        rawCookies.split(';').forEach(c => {
            const [k, v] = c.trim().split('=');
            if (k && v) {
                try {
                    parsedCookies[k] = decodeURIComponent(v);
                } catch (e) {
                    parsedCookies[k] = v;
                }
            }
        });

        // Verify signed cookie manually
        const signedToken = parsedCookies[AUTH_COOKIE_NAME];
        let isAuthenticated = false;

        // Exempt local Wi-Fi devices or valid key query/header param from authentication
        let wsKeyValid = req.headers['x-ag-key'] === APP_PASSWORD;
        try {
            const parsedUrl = new URL(req.url || '/', 'http://localhost');
            if (parsedUrl.searchParams.get('key') === APP_PASSWORD) wsKeyValid = true;
        } catch {}

        if (isLocalRequest(req) || wsKeyValid) {
            isAuthenticated = true;
        } else if (signedToken) {
            const sessionSecret = process.env.SESSION_SECRET || 'antigravity_secret_key_1337';

            if (sessionSecret === 'antigravity_secret_key_1337') {
                // Warning already printed on startup, but we check here for token verification
            }

            const token = cookieParser.signedCookie(signedToken, sessionSecret);
            if (token === AUTH_TOKEN) {
                isAuthenticated = true;
            }
        }

        if (!isAuthenticated) {
            console.log('🚫 Unauthorized WebSocket connection attempt');
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
            setTimeout(() => ws.close(), 100);
            return;
        }

        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        console.log('📱 Client connected (Authenticated)');

        ws.on('close', () => {
            console.log('📱 Client disconnected');
        });
        ws.on('error', () => {});
    });

    // Keep WebSocket connections alive across mobile Wi-Fi NATs & Cloudflare/ngrok/Pinggy tunnels
    const wsHeartbeatInterval = setInterval(() => {
        wss.clients.forEach(client => {
            if (client.isAlive === false) {
                try { client.terminate(); } catch {}
                return;
            }
            client.isAlive = false;
            try { client.ping(); } catch {}
        });
    }, 25000);
    wsHeartbeatInterval.unref?.();
    wss.on('close', () => clearInterval(wsHeartbeatInterval));

    return { server, wss, app, hasSSL };
}

// Main
async function main() {
    try {
        const hub = await hubBridge.discoverHub(true);
        if (hub) {
            console.log(`✅ Connected to Antigravity Hub v${hub.lsVersion} (HTTP port ${hub.httpPort}, zero-flag RPC mode)`);
        }
    } catch (e) {}

    if (hubBridge.isConnected()) {
        // Silent background CDP probe when Zero-Flag Hub RPC is already active
        initCDP({ silent: true }).catch(() => {});
    } else {
        try {
            await initCDP();
        } catch (err) {
            console.warn(`⚠️  Initial CDP discovery failed: ${err.message}`);
            console.log('💡 Open Antigravity 2.33+ (auto-detected via Hub daemon) or pass --remote-debugging-port=9000.');
        }
    }

    try {
        const { server, wss, app, hasSSL } = await createServer();

        // Start background polling (handles both Hub RPC and CDP reconnections)
        startPolling(wss);

        // Remote Click
        app.post('/remote-click', async (req, res) => {
            const { selector, index, textContent } = req.body;
            if (!cdpConnection) return res.json({ skipped: true, reason: 'Hub RPC mode active' });
            const result = await clickElement(cdpConnection, { selector, index, textContent });
            res.json(result);
        });

        // Click Element (alias for /remote-click)
        app.post('/click', async (req, res) => {
            const { selector, index, textContent } = req.body;
            if (!cdpConnection) return res.json({ skipped: true, reason: 'Hub RPC mode active' });
            const result = await clickElement(cdpConnection, { selector, index, textContent });
            res.json(result);
        });

        // Trigger Attach / Add Context
        app.post('/attach', async (req, res) => {
            if (!cdpConnection) return res.json({ success: true, mode: 'hub' });
            const result = await triggerAttach(cdpConnection);
            res.json(result);
        });

        // Remote Scroll - sync phone scroll to desktop
        app.post('/remote-scroll', async (req, res) => {
            const { scrollTop, scrollPercent } = req.body;
            if (!cdpConnection) return res.json({ skipped: true });
            const result = await remoteScroll(cdpConnection, { scrollTop, scrollPercent });
            res.json(result);
        });

        // Get App State
        app.get('/app-state', async (req, res) => {
            if (await hubBridge.discoverHub()) {
                if (!hubBridge.cachedQuotaSummary) {
                    await hubBridge.getQuotaSummary(false).catch(() => {});
                }
                return res.json({
                    ...hubBridge.getAppState(),
                    isGenerating: Boolean(lastSnapshot?.isGenerating),
                    connectionType: 'hub'
                });
            }
            if (!cdpConnection) {
                return res.json({
                    mode: hubBridge.selectedMode || 'Agent',
                    model: hubBridge.selectedModelLabel || 'Gemini 4 Neon (High)',
                    targetApp: hubBridge.targetApp || 'antigravity',
                    hubConnected: false,
                    connectionType: 'offline'
                });
            }
            const result = await getAppState(cdpConnection);
            res.json({ ...result, targetApp: hubBridge.targetApp || 'antigravity', connectionType: 'cdp' });
        });

        // Helper: immediately rebuild & broadcast Hub snapshot after state-mutating endpoints
        async function refreshHubSnapshotNow(targetCid = null) {
            lastSnapshot = null;
            lastSnapshotHash = null;
            try {
                const snap = await hubBridge.buildSnapshotFromHub(targetCid);
                if (snap && !snap.error) {
                    snap.hash = hashString(snap.html + '|' + Boolean(snap.isGenerating));
                    lastSnapshot = snap;
                    lastSnapshotHash = snap.hash;
                    lastSwarmEtag = snap.activeSwarm?.etag || '';
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'snapshot_update',
                                source: 'hub',
                                isGenerating: Boolean(snap.isGenerating),
                                cascadeId: snap.cascadeId || null,
                                activeSwarm: snap.activeSwarm || null,
                                timestamp: new Date().toISOString()
                            }));
                        }
                    });
                }
            } catch {}
        }

        // Start New Chat
        app.post('/new-chat', async (req, res) => {
            if (await hubBridge.discoverHub()) {
                const hubRes = await hubBridge.startNewConversation();
                if (hubRes.success) {
                    await refreshHubSnapshotNow(hubRes.cascadeId);
                    return res.json(hubRes);
                }
            }
            if (!cdpConnection) return res.status(503).json({ error: 'Antigravity disconnected' });
            const result = await startNewChat(cdpConnection);
            res.json(result);
        });

        // Get Chat History
        app.get('/chat-history', async (req, res) => {
            if (await hubBridge.discoverHub()) {
                try {
                    const result = await hubBridge.listConversations();
                    return res.json(result);
                } catch (e) {
                    return res.json({ error: e.message, chats: [] });
                }
            }
            if (!cdpConnection) return res.json({ error: 'Antigravity not running', chats: [] });
            const result = await getChatHistory(cdpConnection);
            res.json(result);
        });

        // Select a Chat (by cascadeId, title, or index)
        app.post('/select-chat', async (req, res) => {
            const { cascadeId, title, index } = req.body;
            if (!cascadeId && !title && typeof index !== 'number') {
                return res.status(400).json({ error: 'cascadeId, title, or index required' });
            }
            if (await hubBridge.discoverHub()) {
                const result = await hubBridge.selectConversation({ cascadeId, title, index });
                if (result.success) {
                    await refreshHubSnapshotNow(result.cascadeId);
                }
                return res.json(result);
            }
            if (!cdpConnection) return res.status(503).json({ error: 'Antigravity disconnected' });
            const result = await selectChat(cdpConnection, { title, index });
            res.json(result);
        });

        // Set AI Mode (Agent / Autonomous / Planning / Fast)
        app.post('/set-mode', async (req, res) => {
            const { mode } = req.body;
            if (!mode) return res.status(400).json({ error: 'Mode required' });
            if (await hubBridge.discoverHub()) {
                return res.json(hubBridge.setMode(mode));
            }
            if (!cdpConnection) {
                return res.json(hubBridge.setMode(mode));
            }
            const legacyMode = mode === 'Fast' ? 'Fast' : 'Planning';
            const result = await setMode(cdpConnection, legacyMode);
            res.json(result);
        });

        // Set AI Model (Gemini 4 Neon / Argon / Hydrogen / Orchestrator / Gemini 3.8 Flash / Claude 5.5 / 4.6 / GPT-OSS)
        app.post('/set-model', async (req, res) => {
            const { model } = req.body;
            if (!model) return res.status(400).json({ error: 'Model required' });
            if (await hubBridge.discoverHub()) {
                const hubRes = hubBridge.setModelByLabel(model);
                if (hubRes?.error) {
                    return res.status(400).json(hubRes);
                }
                if (cdpConnection) {
                    setModel(cdpConnection, hubRes.selectedModel || model).catch(() => {});
                }
                return res.json(hubRes);
            }
            if (!cdpConnection) {
                const offlineRes = hubBridge.setModelByLabel(model);
                if (offlineRes?.error) {
                    return res.status(400).json(offlineRes);
                }
                return res.json(offlineRes);
            }
            const result = await setModel(cdpConnection, model);
            res.json(result);
        });

        // Get Available Models Dynamically
        app.get('/get-models', async (req, res) => {
            if (await hubBridge.discoverHub()) {
                const result = await hubBridge.refreshModels();
                return res.json(result);
            }
            if (cdpConnection) {
                const result = await getModels(cdpConnection);
                if (result.models?.length) return res.json(result);
            }
            res.json({
                success: true,
                models: DEFAULT_ANTIGRAVITY_MODELS.map(m => m.label),
                modelDetails: DEFAULT_ANTIGRAVITY_MODELS,
                selectedModel: hubBridge.selectedModelLabel
            });
        });

        // Get Available Antigravity 2.33 Slash Commands, Skills, Workflows, MCP Prompts & Controls
        app.get('/slash-commands', async (req, res) => {
            const force = req.query.refresh === '1' || req.query.force === '1';
            if (await hubBridge.discoverHub()) {
                const out = await hubBridge.getSlashCommands(force);
                return res.json(out);
            }
            res.json({
                success: true,
                commands: DEFAULT_SLASH_COMMANDS
            });
        });

        // Handle Interactive Hub Approvals & Questions (HandleCascadeUserInteraction RPC)
        app.post('/hub-interact', async (req, res) => {
            const { cascadeId, trajectoryId, stepIndex, interactionCase, allow, responses, cancelled } = req.body || {};
            if (!trajectoryId || typeof stepIndex !== 'number') {
                return res.status(400).json({ error: 'trajectoryId and numeric stepIndex required' });
            }
            if (await hubBridge.discoverHub()) {
                try {
                    const out = await hubBridge.handleInteraction({
                        cascadeId,
                        trajectoryId,
                        stepIndex,
                        interactionCase,
                        allow,
                        responses,
                        cancelled
                    });
                    if (out.error) return res.status(400).json(out);
                    await refreshHubSnapshotNow(out.cascadeId);
                    return res.json(out);
                } catch (e) {
                    return res.status(500).json({ error: e.message });
                }
            }
            res.status(503).json({ error: 'Antigravity Hub disconnected' });
        });

        // Delete a Conversation (used for cleanup / management)
        app.post('/delete-chat', async (req, res) => {
            const { cascadeId } = req.body || {};
            if (!cascadeId) return res.status(400).json({ error: 'cascadeId required' });
            if (await hubBridge.discoverHub()) {
                try {
                    const out = await hubBridge.deleteConversation(cascadeId);
                    await refreshHubSnapshotNow();
                    return res.json(out);
                } catch (e) {
                    return res.status(500).json({ error: e.message });
                }
            }
            res.status(503).json({ error: 'Hub disconnected' });
        });

        // Close Chat History
        app.post('/close-history', async (req, res) => {
            if (!cdpConnection) return res.json({ success: true });
            const result = await closeHistory(cdpConnection);
            res.json(result);
        });

        // Check if Chat is Open
        app.get('/chat-status', async (req, res) => {
            if (await hubBridge.discoverHub()) {
                const cid = await hubBridge.ensureActiveConversationSelected();
                return res.json({
                    hasChat: true,
                    hasMessages: !!cid,
                    editorFound: true,
                    activeCascadeId: cid
                });
            }
            if (!cdpConnection) return res.json({ hasChat: false, hasMessages: false, editorFound: false });
            const result = await hasChatOpen(cdpConnection);
            res.json(result);
        });

        // Live Weekly Quota, 5-Hour Quota, Plan Tier & Context Window Breakdown
        app.get('/quota', async (req, res) => {
            try {
                const force = req.query.refresh === '1' || req.query.force === '1';
                const summary = await hubBridge.getQuotaSummary(force);
                res.json(summary);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Export Conversation as Clean Markdown
        app.get('/export-chat', async (req, res) => {
            try {
                const cid = req.query.cascadeId ? String(req.query.cascadeId) : null;
                const out = await hubBridge.exportConversationMarkdown(cid);
                if (out.error) return res.status(404).json(out);
                res.json(out);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // --- Antigravity IDE Section & Target Switcher Endpoints ---
        app.get('/ide/status', async (req, res) => {
            try {
                const cdpOk = cdpConnection?.ws?.readyState === 1;
                const status = await hubBridge.getIdeStatus(cdpOk);
                res.json(status);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/ide/switch-target', async (req, res) => {
            try {
                const { target, workspacePath } = req.body || {};
                const out = await hubBridge.switchTargetApp({ target, workspacePath });
                if (out.error) return res.status(400).json(out);
                await refreshHubSnapshotNow();
                res.json(out);
            } catch (err) {
                res.status(err.statusCode || 500).json({ error: err.message });
            }
        });

        app.post('/ide/open-desktop', async (req, res) => {
            try {
                const { target, workspacePath, filePath, line } = req.body || {};
                const out = await hubBridge.openInDesktopApp({ target, workspacePath, filePath, line });
                if (out.error) return res.status(400).json(out);
                res.json(out);
            } catch (err) {
                res.status(err.statusCode || 500).json({ error: err.message });
            }
        });

        app.get('/ide/files', async (req, res) => {
            try {
                if (req.query.workspace) {
                    const wsRes = hubBridge.setActiveWorkspace(String(req.query.workspace));
                    if (wsRes.error) return res.status(400).json(wsRes);
                }
                const out = await hubBridge.listWorkspaceFiles({
                    dir: req.query.dir ? String(req.query.dir) : '',
                    search: req.query.search ? String(req.query.search) : ''
                });
                res.json(out);
            } catch (err) {
                res.status(err.statusCode || 500).json({ error: err.message });
            }
        });

        app.get('/ide/file', async (req, res) => {
            try {
                const filePathParam = req.query.path ? String(req.query.path) : '';
                const allowKnownWorkspaceSwitch = req.query.autoSwitchWorkspace === '1';
                const out = await hubBridge.readWorkspaceFile(filePathParam, { allowKnownWorkspaceSwitch });
                res.json(out);
            } catch (err) {
                res.status(err.statusCode || 500).json({ error: err.message });
            }
        });

        app.post('/ide/file', async (req, res) => {
            try {
                const { path: filePathParam, content } = req.body || {};
                const out = await hubBridge.writeWorkspaceFile({ path: filePathParam, content });
                res.json(out);
            } catch (err) {
                res.status(err.statusCode || 500).json({ error: err.message });
            }
        });

        app.get('/ide/git', async (req, res) => {
            try {
                const diffFile = req.query.diffFile ? String(req.query.diffFile) : '';
                const out = await hubBridge.getWorkspaceGitStatus({ diffFile });
                res.json(out);
            } catch (err) {
                res.status(err.statusCode || 500).json({ error: err.message });
            }
        });

        // --- Native & Subagent Swarm UI Endpoints (Overview, Shared Board, Members, Graph & Raw) ---
        app.get('/swarm', async (req, res) => {
            try {
                const conversationId = req.query.conversationId ? String(req.query.conversationId) : null;
                const swarmId = req.query.swarmId ? String(req.query.swarmId) : null;
                const etag = req.query.etag ? String(req.query.etag) : null;
                const out = await hubBridge.getSwarmSnapshot({ conversationId, swarmId, etag });
                res.json(out);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/swarm/list', async (req, res) => {
            try {
                const conversationId = req.query.conversationId ? String(req.query.conversationId) : null;
                const out = hubBridge.listSwarms(conversationId);
                res.json(out);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Kill any existing process on the port before starting
        await killPortProcess(SERVER_PORT);

        // Start server
        const localIP = getLocalIP();
        const protocol = hasSSL ? 'https' : 'http';

        server.on('error', async (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`⚠️  Port ${SERVER_PORT} is currently busy, retrying cleanup...`);
                await killPortProcess(SERVER_PORT);
                setTimeout(() => {
                    try { server.listen(SERVER_PORT, '0.0.0.0'); } catch(e) {}
                }, 1000);
            } else {
                console.error(`❌ Server error:`, err.message);
                process.exit(1);
            }
        });

        server.listen(SERVER_PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on ${protocol}://${localIP}:${SERVER_PORT}`);
            if (hasSSL) {
                console.log(`💡 First time on phone? Accept the security warning to proceed.`);
            }
        });

        // Graceful shutdown handlers
        const gracefulShutdown = (signal) => {
            console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
            wss.close(() => {
                console.log('   WebSocket server closed');
            });
            server.close(() => {
                console.log('   HTTP server closed');
            });
            if (cdpConnection?.ws) {
                cdpConnection.ws.close();
                console.log('   CDP connection closed');
            }
            setTimeout(() => process.exit(0), 1000);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (err) {
        console.error('❌ Fatal error:', err.message);
        process.exit(1);
    }
}

main();
