import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import WebSocket from 'ws';
import {
    AntigravityHubBridge,
    classifyMediaAttachment,
    parseFamilyAndEffort,
    parseVoiceContextText,
    renderMarkdownLite,
    resolveAttachmentMimeType,
    sanitizeMediaDisplayName
} from '../hub_bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const TEST_PORT = 3199;
const TEST_PASS = 'test_secret_600';

function httpRequest(path, { method = 'GET', headers = {}, body = null } = {}) {
    return new Promise((resolve, reject) => {
        const payload = body ? Buffer.from(JSON.stringify(body), 'utf-8') : null;
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: TEST_PORT,
                path,
                method,
                headers: {
                    ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}),
                    Accept: 'application/json',
                    ...headers
                }
            },
            res => {
                let raw = '';
                res.setEncoding('utf-8');
                res.on('data', chunk => (raw += chunk));
                res.on('end', () => {
                    let json = null;
                    try { json = JSON.parse(raw); } catch {}
                    resolve({ status: res.statusCode, headers: res.headers, raw, json });
                });
            }
        );
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('=== 1. Unit & Regression Checks (Markdown, Models, Modes, Mixins) ===');

    // Regression 1: Claude 4.6 & 5.5 model variants must NOT collide on effort labels
    const sonnetParsed = parseFamilyAndEffort('Claude Sonnet 4.6 (Thinking)');
    const opusParsed = parseFamilyAndEffort('Claude Opus 4.6 (Thinking)');
    assert.equal(sonnetParsed.family, 'Claude 4.6');
    assert.equal(opusParsed.family, 'Claude 4.6');
    assert.notEqual(sonnetParsed.effort, opusParsed.effort, 'Claude 4.6 variants must have distinct effort labels');
    assert.equal(sonnetParsed.effort, 'Sonnet 4.6');
    assert.equal(opusParsed.effort, 'Opus 4.6');
    const opus55High = parseFamilyAndEffort('Claude Opus 5.5 (High)');
    const sonnet55Low = parseFamilyAndEffort('Claude Sonnet 5.5 (Low)');
    assert.deepEqual(opus55High, { family: 'Claude Opus 5.5', effort: 'High' });
    assert.deepEqual(sonnet55Low, { family: 'Claude Sonnet 5.5', effort: 'Low' });
    assert.deepEqual(parseFamilyAndEffort('Gemini 4 Neon (XHigh)'), { family: 'Gemini 4 Neon', effort: 'XHigh' });
    assert.deepEqual(parseFamilyAndEffort('Gemini 4 Neon (High)'), { family: 'Gemini 4 Neon', effort: 'High' });
    assert.deepEqual(parseFamilyAndEffort('Gemini 4 Neon (Medium)'), { family: 'Gemini 4 Neon', effort: 'Medium' });
    assert.deepEqual(parseFamilyAndEffort('Gemini 4 Neon (Low)'), { family: 'Gemini 4 Neon', effort: 'Low' });
    assert.deepEqual(parseFamilyAndEffort('Orchestrator (Neon)'), { family: 'Orchestrator', effort: 'Neon' });
    assert.deepEqual(parseFamilyAndEffort('Orchestrator (Argon)'), { family: 'Orchestrator', effort: 'Argon' });
    assert.deepEqual(parseFamilyAndEffort('Gemini 4 Carbon'), { family: 'Gemini 4 Carbon', effort: 'Default' });
    assert.deepEqual(
        parseFamilyAndEffort('Gemini 4 Carbon', { disabled: true, tagTitle: 'Unavailable' }),
        { family: 'Gemini 4 Carbon', effort: 'Unavailable' }
    );
    assert.deepEqual(
        parseFamilyAndEffort('Gemini 4 Carbon', { tagTitle: 'Unavailable' }),
        { family: 'Gemini 4 Carbon', effort: 'Unavailable' }
    );
    const labelCheckBridge = new AntigravityHubBridge();
    assert.equal(labelCheckBridge.resolveModelLabel('MODEL_PLACEHOLDER_M669'), 'Orchestrator (Execution)');
    assert.equal(labelCheckBridge.resolveModelLabel('MODEL_PLACEHOLDER_M427'), 'Gemini 4 (Legacy)');
    assert.equal(labelCheckBridge.resolveModelLabel('MODEL_PLACEHOLDER_M999'), 'Antigravity Model');
    console.log('✔ Verified parseFamilyAndEffort & resolveModelLabel fallback aliases (Gemini 4 Neon, Orchestrator, M669/M427, no raw placeholders)');

    // Regression 1B: Attachment MIME resolution, display-name sanitization & media classification across all file types
    assert.equal(resolveAttachmentMimeType('photo.jpg', 'image/jpg'), 'image/jpeg');
    assert.equal(resolveAttachmentMimeType('clip.mp4', 'application/octet-stream'), 'video/mp4');
    assert.equal(resolveAttachmentMimeType('voice.mp3', 'audio/mpeg'), 'audio/mp3');
    assert.equal(resolveAttachmentMimeType('script.py', 'application/octet-stream'), 'text/x-python');
    assert.equal(resolveAttachmentMimeType('module.ts', ''), 'text/x-typescript');
    assert.equal(resolveAttachmentMimeType('app-release.apk', ''), 'application/octet-stream');
    assert.equal(sanitizeMediaDisplayName('my screenshot 100%.png', 'image/png'), 'my_screenshot_100_.png');
    assert.equal(sanitizeMediaDisplayName('photo_\uD800.png', 'image/png'), 'photo_.png', 'Unpaired UTF-16 surrogates must be stripped');
    assert.equal(classifyMediaAttachment('', 'report.pdf').accentClass, 'is-pdf');
    assert.equal(classifyMediaAttachment('', 'demo.mp4').accentClass, 'is-video');
    assert.equal(classifyMediaAttachment('', 'build.apk').accentClass, 'is-binary');
    assert.deepEqual(
        { badge: classifyMediaAttachment('', 'backup.tar.gz').badgeLabel, cls: classifyMediaAttachment('', 'backup.tar.gz').accentClass },
        { badge: 'TAR.GZ', cls: 'is-archive' }
    );
    console.log('✔ Verified resolveAttachmentMimeType, sanitizeMediaDisplayName (incl. unpaired surrogates) & classifyMediaAttachment (incl. .tar.gz)');

    // Regression 2: renderMarkdownLite must preserve $&, $', $$ inside code blocks & render tables + conversation:// pills
    const trickyMd = [
        'Check `[Swarm Worker](conversation://12345678-aaaa-bbbb-cccc-1234567890ab)` output:',
        '',
        '| Feature | Status |',
        '|---|---|',
        '| Hub RPC | Ready |',
        '',
        '```js',
        'const replaced = str.replace(/foo/, "$& and $$ and $\'");',
        '```'
    ].join('\n');
    const renderedMd = renderMarkdownLite(trickyMd);
    assert.ok(
        renderedMd.includes('$&amp; and $$ and $&#39;'),
        `Expected $&, $$, $' preserved verbatim in code block, got: ${renderedMd}`
    );
    assert.ok(renderedMd.includes('data-select-cascade="12345678-aaaa-bbbb-cccc-1234567890ab"'), 'Expected clickable conversation:// pill');
    assert.ok(renderedMd.includes('<table class="agy-md-table">'), 'Expected rendered markdown table');

    const nestedAndHeadingsMd = [
        '### Summary',
        'Line one',
        'Line two',
        'Issues found:',
        '1. First item',
        '   - Nested sub-item',
        '2. Second item with [Home Script](file:///C:/Users/demo/Antigravity/Remote-Control/shortcuts/Phone%20Connect%20(Home).bat)'
    ].join('\n');
    const renderedNested = renderMarkdownLite(nestedAndHeadingsMd);
    assert.ok(
        renderedNested.includes('<h3>Summary</h3>\n<p>Line one<br>Line two<br>Issues found:</p>'),
        `Expected heading separated from paragraph lines, got: ${renderedNested}`
    );
    assert.ok(
        renderedNested.includes('<ol><li>First item<ul><li>Nested sub-item</li></ul></li><li>Second item'),
        `Expected valid nested <ol>/<ul> without <p> or <br> corruption, got: ${renderedNested}`
    );
    assert.ok(
        renderedNested.includes('href="file:///C:/Users/demo/Antigravity/Remote-Control/shortcuts/Phone%20Connect%20(Home).bat"'),
        `Expected markdown link with balanced parentheses preserved, got: ${renderedNested}`
    );

    // Regression 2A-Swarm: renderMarkdownLite must turn Antigravity 2.33 sidecar://swarm/... links (inline & backticked) into Swarm UI buttons
    const sidecarMd = [
        'Swarm started: [Open the Swarm UI](sidecar://swarm/swarm_board/?auto_open=false)',
        'Also wrapped: `[Open the Swarm UI](sidecar://swarm/swarm_board/?swarm=8c04825f-2cfa-46c7-a414-2f60a5785448)`'
    ].join('\n\n');
    const renderedSidecar = renderMarkdownLite(sidecarMd);
    assert.equal(
        (renderedSidecar.match(/data-open-swarm-ui="1"/g) || []).length,
        2,
        `Expected both inline & backticked sidecar://swarm links to render Swarm UI pills, got: ${renderedSidecar}`
    );
    assert.ok(!renderedSidecar.includes('href="sidecar://'), 'sidecar:// links must not render as dead <a href="sidecar://"> anchors');

    // Regression 2A-List/Blockquote/Voice: <ol start="N">, + bullets, <blockquote>, and parseVoiceContextText
    const orderedAndQuoteMd = [
        '3. Third item',
        '4. Fourth item',
        '',
        '+ Plus bullet',
        '',
        '> Quoted insight'
    ].join('\n');
    const renderedOrderedAndQuote = renderMarkdownLite(orderedAndQuoteMd);
    assert.ok(renderedOrderedAndQuote.includes('<ol start="3"><li>Third item</li><li>Fourth item</li></ol>'), `Expected <ol start="3">, got: ${renderedOrderedAndQuote}`);
    assert.ok(renderedOrderedAndQuote.includes('<ul><li>Plus bullet</li></ul>'), `Expected + bullet <ul>, got: ${renderedOrderedAndQuote}`);
    assert.ok(renderedOrderedAndQuote.includes('<blockquote>Quoted insight</blockquote>'), `Expected <blockquote>, got: ${renderedOrderedAndQuote}`);

    const sampleVoicePrompt = [
        '<voice_instructions>',
        '1. Share one persona with the voice.',
        '</voice_instructions>',
        '<talker_agent_context>',
        '[2026-11-19T09:02:20-08:00] user: "Check the port 3000 server status."',
        '[2026-11-19T09:02:27-08:00] talker: "Checking it right away"',
        '</talker_agent_context>'
    ].join('\n');
    const parsedVoice = parseVoiceContextText(sampleVoicePrompt);
    assert.deepEqual(parsedVoice, { isVoice: true, text: 'Check the port 3000 server status.' }, 'parseVoiceContextText must extract clean spoken user lines');
    assert.deepEqual(parseVoiceContextText('Normal typed message'), { isVoice: false, text: 'Normal typed message' }, 'Non-voice text must pass through unchanged');

    // Verify Android bundled assets match public/ byte-for-byte
    for (const relAsset of ['index.html', 'login.html', 'manifest.json', 'js/app.js', 'css/style.css']) {
        const pubBuf = fs.readFileSync(join(ROOT_DIR, 'public', relAsset));
        const andBuf = fs.readFileSync(join(ROOT_DIR, 'android/app/src/main/assets/www', relAsset));
        assert.equal(Buffer.compare(pubBuf, andBuf), 0, `Android asset www/${relAsset} must match public/${relAsset} byte-for-byte`);
    }
    console.log('✔ renderMarkdownLite preserves $&/$$ in code blocks, nested lists, tables, sidecar:// Swarm pills & byte-for-byte Android asset parity');

    // Regression 2B: Antigravity 2.33 userConfig parity + CODE_ACTION (write_file/edit_file diffs) + GENERIC steps + SDK reminder isolation
    const mockBridge = new AntigravityHubBridge();
    const defaultCfg = mockBridge.buildCascadeConfig();
    assert.deepEqual(defaultCfg.conversationHistoryConfig, {}, 'buildCascadeConfig must include conversationHistoryConfig: {}');
    assert.deepEqual(defaultCfg.executorConfig, { useCoreDirect: true }, 'buildCascadeConfig must include executorConfig.useCoreDirect');
    const defaultToolNames = defaultCfg.plannerConfig.declarativeMixinConfig.tools.map(t => t.name);
    assert.ok(!defaultToolNames.includes('generate_image'), 'declarativeMixinConfig.tools must not include non-existent builtin generate_image');
    assert.ok(
        defaultCfg.plannerConfig.customizationDiscoveryConfig.agents.builtinAgentNames.includes('image-generator'),
        'builtinAgentNames must include image-generator'
    );
    // Even if an older trajectory or Orchestrator template had builtin generate_image or plan-execute mixins without executionModel, buildCascadeConfig must strip them
    mockBridge.templateUserConfig = {
        plannerConfig: {
            declarativeMixinConfig: {
                promptSections: [{ builtinName: 'identity' }, { builtinName: 'plan_execute_protocol' }],
                tools: [
                    { name: 'read_file', builtin: true },
                    { name: 'generate_image', builtin: true },
                    { name: 'enter_plan_mode', builtin: true },
                    { name: 'exit_plan_mode', builtin: true }
                ],
                preInvocationHooks: [{ name: 'message_delivery', builtin: true }, { name: 'plan_mode_review', builtin: true }],
                preToolHooks: [{ name: 'command_assessor', builtin: true }, { name: 'plan_mode_gate', builtin: true }]
            }
        }
    };
    const strippedCfg = mockBridge.buildCascadeConfig();
    assert.deepEqual(
        strippedCfg.plannerConfig.declarativeMixinConfig.tools.map(t => t.name),
        ['read_file'],
        'buildCascadeConfig must strip stale builtin generate_image and Orchestrator plan-execute tools when executionModel is absent'
    );
    assert.deepEqual(
        strippedCfg.plannerConfig.declarativeMixinConfig.promptSections.map(p => p.builtinName),
        ['identity'],
        'buildCascadeConfig must strip plan_execute_protocol when executionModel is absent'
    );
    assert.deepEqual(
        strippedCfg.plannerConfig.declarativeMixinConfig.preInvocationHooks.map(h => h.name),
        ['message_delivery']
    );
    assert.deepEqual(
        strippedCfg.plannerConfig.declarativeMixinConfig.preToolHooks.map(h => h.name),
        ['command_assessor']
    );
    mockBridge.templateUserConfig = null;

    mockBridge.hubInfo = { pid: 1, httpPort: 59999, lsVersion: '2.33.0', csrfToken: 'mock' };
    mockBridge.discoverHub = async () => mockBridge.hubInfo;
    mockBridge.callRpc = async (method) => {
        if (method === 'GetAllCascadeTrajectories') {
            return {
                trajectorySummaries: {
                    'mock-cid-1': {
                        trajectoryId: 'mock-traj-1',
                        status: 'CASCADE_RUN_STATUS_RUNNING',
                        trajectoryMetadata: { parentConversationId: 'parent-cid-0', nestingDepth: 1, subagentSpec: { role: 'DeepCoder' } }
                    }
                }
            };
        }
        if (method === 'GetCascadeTrajectory') {
            const unchangedPrefix = Array.from({ length: 20 }, (_, k) => ({
                text: `const line${k} = ${k};`,
                type: 'UNIFIED_DIFF_LINE_TYPE_UNCHANGED'
            }));
            return {
                status: 'CASCADE_RUN_STATUS_RUNNING',
                trajectory: {
                    trajectoryId: 'mock-traj-1',
                    steps: [
                        {
                            type: 'CORTEX_STEP_TYPE_SYSTEM_MESSAGE',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_SYSTEM_SDK' },
                            systemMessage: {
                                message: 'This is a periodic system reminder.\nUNIQUE_SDK_PROMPT_SENTINEL_999',
                                renderInfo: { title: 'Internal SDK', contentBlocks: [{ text: 'UNIQUE_SDK_PROMPT_SENTINEL_999' }] }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_SYSTEM_MESSAGE',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_SYSTEM' },
                            systemMessage: {
                                message: 'Task id "mock-cid-1/task-599" was canceled\nHIDDEN_TASK_CANCEL_SENTINEL',
                                renderInfo: { title: 'Start updated Remote Control server on port 3000 was canceled', hidden: true },
                                agentMessage: { sender: 'mock-cid-1/task-599', hideFromUser: true, content: 'HIDDEN_TASK_CANCEL_SENTINEL' }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_SYSTEM_MESSAGE',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_SYSTEM' },
                            systemMessage: {
                                message: 'Task id "mock-cid-1/task-651" finished with result:\nCommand exited with code 0.',
                                renderInfo: {
                                    title: 'Check port 3000 finished',
                                    contentBlocks: [{ terminal: { command: 'netstat', output: 'LISTENING' } }]
                                },
                                agentMessage: {
                                    sender: 'mock-cid-1/task-651',
                                    content: 'Command exited with code 0'
                                }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_USER_INPUT',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_USER_EXPLICIT' },
                            userInput: {
                                items: [
                                    { item: { slashCommand: { info: { name: 'compact', type: 'SLASH_COMMAND_TYPE_SYSTEM' } } } },
                                    { text: ' ' }
                                ],
                                userResponse: '/compact '
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_CODE_ACTION',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL', toolCall: { name: 'write_file', argumentsJson: '{"Path":"C:\\\\repo\\\\src\\\\new_module.js"}' } },
                            codeAction: {
                                actionSpec: { createFile: { path: { absoluteUri: 'file:///C:/repo/src/new_module.js' } } },
                                actionResult: {
                                    edit: {
                                        createFile: true,
                                        absoluteUri: 'file:///C:/repo/src/new_module.js',
                                        diff: {
                                            unifiedDiff: {
                                                lines: [
                                                    { text: 'export const ready = true;', type: 'UNIFIED_DIFF_LINE_TYPE_INSERT' }
                                                ]
                                            }
                                        }
                                    }
                                },
                                diffStats: { additions: 1 }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_CODE_ACTION',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL', toolCall: { name: 'edit_file' } },
                            codeAction: {
                                actionSpec: { command: { isEdit: true, file: { absoluteUri: 'file:///C:/repo/android/MainActivity.kt' } } },
                                actionResult: {
                                    edit: {
                                        absoluteUri: 'file:///C:/repo/android/MainActivity.kt',
                                        diff: {
                                            unifiedDiff: {
                                                lines: [
                                                    ...unchangedPrefix,
                                                    { text: 'val oldFlag = false', type: 'UNIFIED_DIFF_LINE_TYPE_DELETE' },
                                                    { text: 'val shouldOverride = true', type: 'UNIFIED_DIFF_LINE_TYPE_INSERT' }
                                                ]
                                            }
                                        }
                                    }
                                },
                                diffStats: { additions: 1, deletions: 1 }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_GENERIC',
                            status: 'CORTEX_STEP_STATUS_RUNNING',
                            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL', toolCall: { name: 'run_command' } },
                            generic: {
                                args: { CommandLine: 'npm run verify:hub', toolSummary: 'Verify Hub RPC' },
                                result: {
                                    stepRenderInfo: {
                                        titlePrefix: 'Running',
                                        aggregationKey: 'terminal',
                                        contentBlocks: [{ terminal: { command: 'npm run verify:hub', output: 'Checking...' } }]
                                    }
                                }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_GENERIC',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL', toolCall: { name: 'swarm_post_message' } },
                            generic: {
                                args: { Channel: 'architecture', Summary: 'Hub schema verified' },
                                result: { result: 'Posted to #architecture' }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_GENERIC',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL', toolCall: { name: 'send_message' } },
                            generic: {
                                args: { Recipient: 'parent-cid-0', Message: 'Completed verification.' },
                                result: { payload: { recipientName: 'Parent Coordinator' } }
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_ASK_QUESTION',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL' },
                            completedInteractions: [
                                {
                                    response: {
                                        askQuestion: {
                                            responses: [
                                                {
                                                    question: 'Target SDK?',
                                                    selectedOptionIds: ['2'],
                                                    writeInResponse: 'API 35 verified'
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            askQuestion: {
                                questions: [
                                    {
                                        question: 'Target SDK?',
                                        options: [
                                            { id: '1', text: 'API 34' },
                                            { id: '2', text: 'API 35' }
                                        ],
                                        selectedOptionIds: ['2']
                                    }
                                ]
                            }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_GREP_SEARCH',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL' },
                            grepSearch: { query: 'shouldOverrideUrlLoading' }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_ERROR_MESSAGE',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_SYSTEM' },
                            errorMessage: { error: { userErrorMessage: 'Rate limit exceeded on upstream model' } }
                        },
                        {
                            type: 'CORTEX_STEP_TYPE_USER_INPUT',
                            status: 'CORTEX_STEP_STATUS_DONE',
                            metadata: { source: 'CORTEX_STEP_SOURCE_USER' },
                            userInput: {
                                items: [
                                    {
                                        item: {
                                            textBlock: {
                                                content: 'const port = 3000;',
                                                fileLineRange: {
                                                    absoluteUri: 'file:///C:/repo/src/server.js',
                                                    startLine: 11,
                                                    endLine: 24
                                                }
                                            }
                                        }
                                    },
                                    {
                                        item: {
                                            textBlock: {
                                                content: 'WAL allows concurrent readers.',
                                                label: 'Side question (conversation abcdef12): Why use WAL?'
                                            }
                                        }
                                    },
                                    { text: 'Apply this configuration.\n\n[Attached: legacy_screen.png](file:///C:/Users/demo/Antigravity/Remote-Control/uploads/170000_legacy_screen.png)' }
                                ],
                                media: [
                                    {
                                        mediaId: 'm-img-unnamed-legacy',
                                        mimeType: 'image/png',
                                        uri: 'C:/Users/demo/.gemini/antigravity/brain/mock-cid-1/.user_uploaded/uploaded_media_170000.png',
                                        inlineData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                                    },
                                    {
                                        mediaId: 'm-img-1',
                                        mimeType: 'image/png',
                                        description: 'phone_screen_1.png',
                                        displayName: 'phone_screen_1.png',
                                        inlineData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                                    },
                                    {
                                        mediaId: 'm-img-2',
                                        mimeType: 'image/jpeg',
                                        description: 'phone_screen_2.jpg',
                                        displayName: 'phone_screen_2.jpg',
                                        inlineData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                                    },
                                    {
                                        mediaId: 'm-pdf-1',
                                        mimeType: 'application/pdf',
                                        description: 'spec_doc.pdf',
                                        displayName: 'spec_doc.pdf',
                                        uri: 'file:///C:/Users/demo/.gemini/antigravity/brain/mock-cid-1/.tempmediaStorage/spec_doc.pdf'
                                    },
                                    {
                                        mediaId: 'm-vid-1',
                                        mimeType: 'video/mp4',
                                        description: 'demo_clip.mp4',
                                        displayName: 'demo_clip.mp4',
                                        uri: 'file:///C:/Users/demo/.gemini/antigravity/brain/mock-cid-1/.tempmediaStorage/demo_clip.pdf'
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        }
        return {};
    };
    const mockSnap = await mockBridge.buildSnapshotFromHub('mock-cid-1');
    const mockExport = await mockBridge.exportConversationMarkdown('mock-cid-1');
    assert.ok(!mockSnap.html.includes('This is a periodic system reminder'), 'SDK reminder text must never render');
    assert.ok(!mockSnap.html.includes('UNIQUE_SDK_PROMPT_SENTINEL_999'), 'SDK sentinel must never render even with renderInfo');
    assert.ok(!mockSnap.html.includes('data-step-index="0"'), 'Step 0 (CORTEX_STEP_SOURCE_SYSTEM_SDK) must be skipped');
    assert.ok(!mockSnap.html.includes('HIDDEN_TASK_CANCEL_SENTINEL') && !mockSnap.html.includes('Start updated Remote Control server on port 3000 was canceled'), 'Hidden SYSTEM_MESSAGE task cancel must never render');
    assert.ok(mockSnap.html.includes('⌘ Task') && mockSnap.html.includes('Check port 3000 finished') && !mockSnap.html.includes('agy-delegated-task-card'), 'Background task SYSTEM_MESSAGE must render as compact tool pill instead of delegated card');
    assert.ok(mockSnap.html.includes('/compact') && !mockSnap.html.includes('<div class="whitespace-pre-wrap agy-user-text">/compact</div>'), 'Bare /compact command must render pill without duplicate body text');
    assert.ok(!mockSnap.html.includes('workspace file'), 'CODE_ACTION steps must render real file names, not fallback "workspace file"');
    assert.ok(mockSnap.html.includes('📝 Wrote') && mockSnap.html.includes('src/new_module.js'), 'write_file must show file name');
    assert.ok(mockSnap.html.includes('✏️ Edited') && mockSnap.html.includes('android/MainActivity.kt'), 'edit_file must show file name');
    assert.ok(mockSnap.html.includes('+1') && mockSnap.html.includes('-1'), 'CODE_ACTION must render diffStats badges');
    assert.ok(mockSnap.html.includes('val shouldOverride = true'), 'Mid-file edit_file diff hunk must be extracted');
    assert.ok(mockSnap.html.includes('npm run verify:hub') && mockSnap.html.includes('Running'), 'Running GENERIC run_command must render');
    assert.ok(mockSnap.html.includes('🐝 Swarm Post') && mockSnap.html.includes('#architecture'), 'GENERIC swarm tool must render');
    assert.ok(mockSnap.html.includes('✉️ Messaged') && mockSnap.html.includes('Parent Coordinator'), 'GENERIC send_message must render');
    assert.ok(mockSnap.html.includes('agy-question-opt-btn selected') && mockSnap.html.includes('API 35 verified'), 'Completed ASK_QUESTION must highlight selected option & write-in');
    assert.ok(mockSnap.html.includes('🔍 Find') && mockSnap.html.includes('shouldOverrideUrlLoading'), 'GREP_SEARCH step must render');
    assert.ok(mockSnap.html.includes('agy-error-card') && mockSnap.html.includes('Rate limit exceeded'), 'ERROR_MESSAGE step must render');
    assert.ok(mockSnap.html.includes('📄 src/server.js:12-25'), 'fileLineRange textBlock must render file:start-end header');
    assert.ok(mockSnap.html.includes('💬 Side Question · Why use WAL?'), 'Side question textBlock must render custom label header');
    assert.ok(mockSnap.html.includes('data-testid="user-media-attachments"'), 'USER_INPUT media must render .agy-user-media-grid');
    assert.ok(mockSnap.html.includes('phone_screen_1.png') && mockSnap.html.includes('phone_screen_2.jpg'), 'Both uploaded images must render as .agy-user-media-thumb');
    assert.ok(mockSnap.html.includes('legacy_screen.png') && !mockSnap.html.includes('uploaded_media_170000.png'), 'Unnamed historical ui.media must adopt legacy [Attached: ...] filename without rendering a duplicate thumbnail');
    assert.equal((mockSnap.html.match(/data-testid="user-media-thumb"/g) || []).length, 3, 'Expected exactly 3 image thumbnails (no duplicate from legacy [Attached: ...] note)');
    assert.ok(mockSnap.html.includes('spec_doc.pdf') && mockSnap.html.includes('demo_clip.mp4'), 'PDF and MP4 attachments must render as .agy-user-media-file cards');
    assert.ok(!mockSnap.html.includes('[Attached:'), 'Legacy [Attached: ...](file:///...) location text must be stripped from user prompt bubble');
    assert.ok(!mockSnap.html.includes('170000_legacy_screen.png'), 'Raw uploads/ file path must never leak into user prompt text');
    assert.ok(!mockExport.markdown.includes('[Attached:') && !mockExport.markdown.includes('170000_legacy_screen.png') && mockExport.markdown.includes('📎 `legacy_screen.png`'), 'exportConversationMarkdown must strip legacy [Attached: ...] notes and emit clean attachment lines');

    // Regression 2C: Synthetic Swarm Engine edge cases (channels, @mentions, @all, view.json, plan.json, quota/error alerts, worker->parent resolution, etag)
    const tmpSwarmRoot = fs.mkdtempSync(join(os.tmpdir(), 'agy-rc-swarm-test-'));
    const coordSwarmCid = '11111111-2222-3333-4444-555555555555';
    const workerAlphaCid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const workerEditorCid = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
    const workerQuotaCid = '99999999-8888-7777-6666-555555555555';
    const retiredWorkerCid = 'deadbeef-0000-1111-2222-333333333333';
    try {
        const swDir = join(tmpSwarmRoot, 'brain', coordSwarmCid, '.system_generated', 'swarm');
        const alphaLogDir = join(tmpSwarmRoot, 'brain', workerAlphaCid, '.system_generated', 'logs');
        const editorLogDir = join(tmpSwarmRoot, 'brain', workerEditorCid, '.system_generated', 'logs');
        const quotaLogDir = join(tmpSwarmRoot, 'brain', workerQuotaCid, '.system_generated', 'logs');
        fs.mkdirSync(swDir, { recursive: true });
        fs.mkdirSync(alphaLogDir, { recursive: true });
        fs.mkdirSync(editorLogDir, { recursive: true });
        fs.mkdirSync(quotaLogDir, { recursive: true });

        fs.writeFileSync(
            join(swDir, 'swarm.json'),
            JSON.stringify({ id: coordSwarmCid, created_at: '2026-11-18T07:59:00Z' }),
            'utf-8'
        );
        fs.writeFileSync(
            join(swDir, 'members.json'),
            JSON.stringify({
                title: 'Synthetic Hive Edge-Case Swarm',
                members: {
                    coordinator: { conversation_id: coordSwarmCid, role: 'coordinator', model: 'MODEL_PLACEHOLDER_M320', wake_mode: 'mentions', last_read_seq: 5 },
                    'alpha-coder': { conversation_id: workerAlphaCid, role: 'worker', model: 'MODEL_PLACEHOLDER_M320', wake_mode: 'mentions', last_read_seq: 4 },
                    'active-editor': { conversation_id: workerEditorCid, role: 'worker', model: 'MODEL_PLACEHOLDER_M320', wake_mode: 'mentions', last_read_seq: 0 },
                    'quota-worker': { conversation_id: workerQuotaCid, role: 'worker', model: 'MODEL_PLACEHOLDER_M318', wake_mode: 'mentions', last_read_seq: 2 },
                    monitor: { conversation_id: '77777777-6666-5555-4444-333333333333', role: 'monitor', model: 'MODEL_PLACEHOLDER_M318', wake_mode: 'never', last_read_seq: 0 },
                    'old-scout': { conversation_id: retiredWorkerCid, role: 'worker', killed: true, last_read_seq: 1 }
                }
            }),
            'utf-8'
        );
        fs.writeFileSync(
            join(swDir, 'board.jsonl'),
            [
                JSON.stringify({ seq: 1, agent: 'coordinator', control: { op: 'create', channel: 'security', topic: 'Auth hardening', members: ['coordinator', 'alpha-coder'] }, time: '2026-11-18 08:00:00' }),
                JSON.stringify({ seq: 2, agent: 'coordinator', text: '@all Starting parallel security & UI review in @#security', time: '2026-11-18 08:01:00' }),
                JSON.stringify({ seq: 3, agent: 'alpha-coder', channel: 'security', text: '@coordinator [done] Completed path-traversal check (re #2)', time: '2026-11-18 08:02:00' }),
                '{"torn_json_line_while_flushing',
                JSON.stringify({ seq: 4, agent: 'quota-worker', text: '@alpha-coder Could you confirm token expiry?', time: '2026-11-18 08:03:00' })
            ].join('\n') + '\n',
            'utf-8'
        );
        fs.writeFileSync(
            join(swDir, 'view.json'),
            JSON.stringify({
                headline: 'Harden Mobile Auth',
                phase: { label: 'Audit & Fix', index: 2, total: 3 },
                attention: [
                    {
                        id: 'att-token',
                        kind: 'blocked',
                        title: 'Confirm Token TTL',
                        why: 'Need 24h vs 7d decision before merging',
                        refs: [{ seq: 4 }]
                    }
                ],
                workstreams: [
                    { id: 'ws-alpha', title: 'Path Traversal Guard', state: 'done', owners: ['alpha-coder'], refs: [{ seq: 3 }] },
                    { id: 'ws-editor', title: 'Live UI Patch', state: 'running', owners: ['active-editor'] }
                ]
            }),
            'utf-8'
        );
        fs.writeFileSync(
            join(swDir, 'plan.json'),
            JSON.stringify({
                goal: { title: 'Harden Mobile Auth' },
                tasks: {
                    'alpha-coder': 'Path Traversal Guard',
                    'active-editor': 'Live UI Patch',
                    'quota-worker': 'Token Expiry Audit'
                }
            }),
            'utf-8'
        );
        fs.writeFileSync(
            join(alphaLogDir, 'transcript.jsonl'),
            [
                JSON.stringify({ type: 'PLANNER_RESPONSE', tool_calls: [{ name: 'swarm_wait', args: {} }] }),
                JSON.stringify({ type: 'GENERIC', status: 'DONE' })
            ].join('\n') + '\n',
            'utf-8'
        );
        fs.writeFileSync(
            join(editorLogDir, 'transcript.jsonl'),
            JSON.stringify({ type: 'PLANNER_RESPONSE', tool_calls: [{ name: 'edit_file', args: { Path: 'C:/repo/server.js' } }] }) + '\n',
            'utf-8'
        );
        fs.writeFileSync(
            join(quotaLogDir, 'transcript.jsonl'),
            JSON.stringify({ type: 'ERROR_MESSAGE', status: 'DONE', errorMessage: { error: { message: 'RESOURCE_EXHAUSTED: 429 quota exceeded' } } }) + '\n',
            'utf-8'
        );

        const swBridge = new AntigravityHubBridge();
        swBridge.customSwarmAppDataDirs = [tmpSwarmRoot];
        swBridge.discoverHub = async () => null;
        swBridge.ensureActiveConversationSelected = async () => workerAlphaCid;

        // Protobuf3 0.0 scalar omission regression: bucket with resetTime and omitted remainingFraction MUST report 0%, NOT 100%!
        const zeroQuotaGroups = swBridge._normalizeQuotaGroups([
            {
                displayName: 'Gemini Models',
                buckets: [
                    { bucketId: 'gemini-5h', window: '5h', resetTime: '2026-11-18T12:00:00Z' },
                    { bucketId: 'gemini-weekly', window: 'weekly', resetTime: '2026-11-22T00:00:00Z' }
                ]
            }
        ]);
        const zero5h = zeroQuotaGroups[0].buckets.find(b => b.window === '5h');
        const zeroWeekly = zeroQuotaGroups[0].buckets.find(b => b.window === 'weekly');
        assert.equal(zero5h?.remainingPercent, 0, 'Omitted Protobuf3 0.0 remainingFraction on 5h bucket with resetTime must be 0%, not 100%');
        assert.equal(zeroWeekly?.remainingPercent, 0, 'Omitted Protobuf3 0.0 remainingFraction on weekly bucket with resetTime must be 0%, not 100%');
        assert.equal(zeroWeekly?.usedPercent, 100);
        assert.equal(swBridge._computeQuotaHeadline(zeroQuotaGroups).weeklyRemainingPercent, 0);
        swBridge.ingestUserStatus({
            cascadeModelConfigData: {
                clientModelConfigs: [
                    {
                        label: 'Claude Sonnet 4.6 (Thinking)',
                        modelOrAlias: { model: 'MODEL_CLAUDE_4_SONNET' },
                        quotaInfo: { resetTime: '2026-11-22T00:00:00Z' }
                    }
                ]
            }
        });
        assert.equal(
            swBridge.cachedModels.find(m => m.label === 'Claude Sonnet 4.6 (Thinking)')?.remainingFraction,
            0,
            'ingestUserStatus must map omitted Protobuf3 0.0 remainingFraction with resetTime to 0, not null/1'
        );

        // Resolving from workerAlphaCid MUST resolve parent swarm coordSwarmCid with member === 'alpha-coder'!
        const swSnap = await swBridge.getSwarmSnapshot({ conversationId: workerAlphaCid });
        assert.equal(swSnap.success, true);
        assert.equal(swSnap.kind, 'native_swarm');
        assert.equal(swSnap.id, coordSwarmCid);
        assert.equal(swSnap.member, 'alpha-coder');
        assert.equal(swSnap.title, 'Synthetic Hive Edge-Case Swarm');
        assert.equal(swSnap.createdAt, '2026-11-18T07:59:00Z');
        assert.ok(swSnap.raw?.swarm?.includes(coordSwarmCid), 'raw.swarm must expose swarm.json');
        assert.equal(swSnap.channels?.length, 1);
        assert.equal(swSnap.channels[0].name, 'security');
        assert.equal(swSnap.messages.length, 4, 'Torn JSONL line must be skipped cleanly without throwing');

        // Alert non-duplication + narrator view.json title/why preservation
        assert.equal(swSnap.systemAttention.length, 1, 'Expected exactly 1 systemAttention item for quota-worker');
        assert.equal(swSnap.systemAttention[0].member, 'quota-worker');
        assert.equal(swSnap.systemAttention[0].kind, 'quota');
        assert.equal(swSnap.overview.attention.length, 1, 'systemAttention must NOT be duplicated into overview.attention');
        assert.equal(swSnap.overview.attention[0].title, 'Confirm Token TTL');
        assert.equal(swSnap.overview.attention[0].why, 'Need 24h vs 7d decision before merging');
        assert.equal(swSnap.overview.attention[0].post, 4);
        const quickHeadline = swBridge.getQuickSwarmHeadline(coordSwarmCid);
        assert.equal(quickHeadline.alertCount, 2, 'Quick headline alertCount must equal 1 systemAttention + 1 narrator attention (no double-counting)');

        // channels.mjs unread visibility parity: active-editor (unsubscribed from #security, last_read_seq=0) only sees #main seq 2 & seq 4 -> unread === 2!
        const activeEditorMem = swSnap.members.find(m => m.name === 'active-editor');
        assert.equal(
            activeEditorMem?.unread,
            2,
            `Unsubscribed active-editor must have unread=2 (visible #main posts seq 2 & 4, excluding control seq 1 & #security seq 3), got ${activeEditorMem?.unread}`
        );

        // @#security channel mention in seq 2 must populate via_channel & graph edge coordinator -> alpha-coder
        const seq2Msg = swSnap.messages.find(m => m.seq === 2);
        assert.ok(seq2Msg?.via_channel?.includes('alpha-coder'), 'Expected @#security in seq 2 to resolve via_channel subscriber alpha-coder');
        assert.ok(swSnap.edges.some(e => e.from === 'coordinator' && e.to === 'alpha-coder' && e.direct >= 1), 'Expected @#security channel mention edge coordinator -> alpha-coder');

        assert.ok(swSnap.overview.workstreams.some(w => w.title === 'Path Traversal Guard' && w.state === 'done'), 'Expected done workstream');
        assert.ok(swSnap.overview.workstreams.some(w => w.title === 'Live UI Patch' && w.state === 'running' && w.liveActivity.includes('server.js')), 'Expected active-editor tool call to enrich running workstream with liveActivity');
        assert.ok(swSnap.edges.some(e => e.from === 'alpha-coder' && e.to === 'coordinator' && e.direct === 1), 'Expected @coordinator mention edge');

        // Etag fast-path check
        const unchangedSnap = await swBridge.getSwarmSnapshot({ conversationId: workerAlphaCid, etag: swSnap.etag });
        assert.equal(unchangedSnap.unchanged, true, 'Matching etag must return unchanged: true');

        // Nonexistent explicit valid UUID swarmId must NOT silently fall back to workerAlphaCid's swarm
        const missingSwarm = await swBridge.getSwarmSnapshot({
            conversationId: workerAlphaCid,
            swarmId: 'deadbeef-dead-beef-dead-beef00000001'
        });
        assert.equal(missingSwarm.swarm, null, 'Explicit nonexistent swarmId must return swarm: null');
        assert.equal(missingSwarm.notFoundSwarmId, 'deadbeef-dead-beef-dead-beef00000001');

        // Invalid path-traversal swarmId must NOT crash or escape brain/
        const traversalSwarm = await swBridge.getSwarmSnapshot({ conversationId: 'no-such-conv', swarmId: '../../Windows' });
        assert.equal(traversalSwarm.swarm, null, 'Path traversal swarmId must be rejected by _isValidSwarmConvId');

        // Nested L1 -> L2 /boost subagent tree must link L2 child to its L1 parent (not flatten to coordinator)
        const boostRootCid = '12121212-3434-5656-7878-909090909090';
        const boostL1Cid = '21212121-4343-6565-8787-090909090909';
        const boostL2Cid = '31313131-5353-7575-9797-191919191919';
        swBridge.discoverHub = async () => ({ pid: 1, httpPort: 59999 });
        swBridge.callRpc = async (method) => {
            if (method === 'GetAllCascadeTrajectories') {
                return {
                    trajectorySummaries: {
                        [boostRootCid]: { summary: 'Root Boost Orchestrator', status: 'CASCADE_RUN_STATUS_RUNNING', stepCount: 6 },
                        [boostL1Cid]: {
                            summary: 'Backend Lead',
                            status: 'CASCADE_RUN_STATUS_RUNNING',
                            stepCount: 8,
                            trajectoryMetadata: { parentConversationId: boostRootCid, nestingDepth: 1, subagentSpec: { name: 'backend-lead' } }
                        },
                        [boostL2Cid]: {
                            summary: 'SQL Verifier',
                            status: 'CASCADE_RUN_STATUS_IDLE',
                            stepCount: 5,
                            trajectoryMetadata: { parentConversationId: boostL1Cid, nestingDepth: 2, subagentSpec: { name: 'sql-verifier' } }
                        }
                    }
                };
            }
            return {};
        };
        const subTreeSnap = await swBridge.getSwarmSnapshot({ conversationId: boostL2Cid });
        assert.equal(subTreeSnap.kind, 'subagent_tree');
        assert.equal(subTreeSnap.id, boostRootCid);
        assert.equal(subTreeSnap.member, 'sql-verifier');
        assert.ok(
            subTreeSnap.edges.some(e => e.from === 'backend-lead' && e.to === 'sql-verifier'),
            `Expected L1 -> L2 parent-to-child edge backend-lead -> sql-verifier, got: ${JSON.stringify(subTreeSnap.edges)}`
        );
        assert.ok(
            subTreeSnap.edges.some(e => e.from === 'sql-verifier' && e.to === 'backend-lead'),
            'Expected completed L2 child return edge sql-verifier -> backend-lead'
        );
        assert.equal(subTreeSnap.members.find(m => m.name === 'sql-verifier')?.nestingDepth, 2);
    } finally {
        try { fs.rmSync(tmpSwarmRoot, { recursive: true, force: true }); } catch {}
    }
    console.log('✔ Verified userConfig parity, CODE_ACTION diffs, GENERIC/ASK_QUESTION rendering, SDK filtering, and synthetic Swarm Engine edge cases');

    console.log('\n=== 2. Direct Antigravity 2.33 HubBridge Verification ===');
    const bridge = new AntigravityHubBridge();
    assert.equal(bridge.selectedModelLabel, 'Gemini 4 Neon (High)', 'Fresh bridge default model must be Gemini 4 Neon (High)');
    assert.equal(bridge.selectedModelEnum, 'MODEL_PLACEHOLDER_M532', 'Fresh bridge default enum must be MODEL_PLACEHOLDER_M532');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.planModel, 'MODEL_PLACEHOLDER_M532', 'Default cascade planModel must be MODEL_PLACEHOLDER_M532');

    // Verify ingestUserStatus selects Gemini 4 Neon (High) (M532) when no disk override exists & flags disabled Carbon
    const fallbackStatusBridge = new AntigravityHubBridge();
    fallbackStatusBridge.readLastSelectedModelFromDisk = () => null;
    fallbackStatusBridge.ingestUserStatus({
        cascadeModelConfigData: {
            defaultOverrideModelConfig: { modelOrAlias: { model: 'MODEL_PLACEHOLDER_M532' } },
            clientModelConfigs: [
                { label: 'Gemini 4 Neon (High)', modelId: 'gemini-4-neon-high', modelOrAlias: { model: 'MODEL_PLACEHOLDER_M532' }, supportsImages: true },
                { label: 'Gemini 4 Carbon', modelId: 'gemini-4-carbon-disabled', modelOrAlias: { model: 'MODEL_PLACEHOLDER_M670' }, tagTitle: 'Unavailable', tagDescription: 'Gemini 4 Carbon is currently available to Ultra plan subscribers.' }
            ]
        }
    });
    assert.equal(fallbackStatusBridge.selectedModelLabel, 'Gemini 4 Neon (High)');
    assert.equal(fallbackStatusBridge.selectedModelEnum, 'MODEL_PLACEHOLDER_M532');
    assert.equal(fallbackStatusBridge.cachedModels.find(m => m.label === 'Gemini 4 Carbon')?.disabled, true);
    assert.equal(fallbackStatusBridge.cachedModels.find(m => m.label === 'Gemini 4 Carbon')?.effort, 'Unavailable');

    // Regression 3: Mode -> CascadeCommandsAutoExecution mapping & Fast override + restoration
    bridge.setModelByLabel('Claude Opus 4.6 (Thinking)');
    assert.equal(bridge.selectedModelLabel, 'Claude Opus 4.6 (Thinking)');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.planModel, 'MODEL_PLACEHOLDER_M26');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.toolConfig.runCommand.autoCommandConfig.autoExecutionPolicy, 'CASCADE_COMMANDS_AUTO_EXECUTION_AUTO');
    bridge.setMode('Autonomous');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.toolConfig.runCommand.autoCommandConfig.autoExecutionPolicy, 'CASCADE_COMMANDS_AUTO_EXECUTION_EAGER');
    bridge.setMode('Planning');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.toolConfig.runCommand.autoCommandConfig.autoExecutionPolicy, 'CASCADE_COMMANDS_AUTO_EXECUTION_OFF');
    bridge.setMode('Fast');
    assert.equal(bridge.selectedModelLabel, 'Gemini 3.8 Flash (High)');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.planModel, 'MODEL_PLACEHOLDER_M318', 'Setting Fast mode after model selection must switch planModel to Flash');
    bridge.setMode('Agent');
    assert.equal(bridge.selectedModelLabel, 'Claude Opus 4.6 (Thinking)', 'Leaving Fast mode must restore the previously selected model label');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.planModel, 'MODEL_PLACEHOLDER_M26', 'Leaving Fast mode must restore the previously selected planModel enum');
    bridge.setModelByLabel('Gemini 4 Argon (High)');
    assert.equal(bridge.buildCascadeConfig().plannerConfig.planModel, 'MODEL_PLACEHOLDER_M417');
    console.log('✔ Verified default M532 Gemini 4 Neon (High), Agent/Autonomous/Planning/Fast execution policies & Fast model override/restoration');

    const hub = await bridge.discoverHub(true);
    assert.ok(hub, 'Expected live Antigravity 2.33 Hub daemon to be discovered');
    console.log(`✔ Discovered Hub v${hub.lsVersion} on HTTP port ${hub.httpPort}`);

    const modelRes = await bridge.refreshModels();
    assert.ok(modelRes.models.length >= 10, 'Expected live models from Hub');
    for (const mustModel of ['Gemini 4 Neon (High)', 'Gemini 4 Neon (XHigh)', 'Gemini 4 Neon (Medium)', 'Gemini 4 Neon (Low)', 'Orchestrator (Neon)', 'Orchestrator (Argon)']) {
        assert.ok(modelRes.models.includes(mustModel), `Expected live Hub refreshModels() to include ${mustModel}`);
    }
    for (const fam of ['Gemini 4 Neon', 'Orchestrator', 'Claude 4.6', 'Claude Opus 5.5', 'Claude Sonnet 5.5', 'Gemini 4 Argon', 'Gemini 4 Hydrogen']) {
        const famDetails = modelRes.modelDetails.filter(m => m.family === fam && !m.disabled);
        if (famDetails.length >= 2) {
            const efforts = new Set(famDetails.map(c => c.effort));
            assert.equal(efforts.size, famDetails.length, `Live ${fam} models must have unique effort pills`);
        }
    }
    const carbonMeta = modelRes.modelDetails.find(m => /gemini 4 carbon/i.test(m.label));
    if (carbonMeta) {
        assert.equal(carbonMeta.disabled, true, 'Live Gemini 4 Carbon must be marked disabled');
        assert.equal(carbonMeta.effort, 'Unavailable', 'Live disabled Gemini 4 Carbon must have effort=Unavailable');
    }

    // Verify disabled Carbon rejection & 3-group quota headline switching on live Hub
    bridge.setModelByLabel('Gemini 4 Argon (High)');
    let quotaCheck = await bridge.getQuotaSummary(true);
    assert.ok(quotaCheck.groups.some(g => g.displayName === 'Gemini Models'), 'Expected Gemini Models quota group');
    assert.ok(quotaCheck.groups.some(g => g.displayName === 'Gemini 4 Argon' && g.isArgon), 'Expected Gemini 4 Argon quota group');
    assert.ok(quotaCheck.groups.some(g => g.displayName === 'Claude and GPT models' && g.isThirdParty), 'Expected Claude and GPT models quota group');
    assert.equal(quotaCheck.headline.groupName, 'Gemini 4 Argon', 'Gemini 4 Argon (High) must map headline to Gemini 4 Argon');

    bridge.setModelByLabel('Orchestrator (Argon)');
    quotaCheck = await bridge.getQuotaSummary(false);
    assert.equal(quotaCheck.headline.groupName, 'Gemini 4 Argon', 'Orchestrator (Argon) must map headline to Gemini 4 Argon');

    const neonSet = bridge.setModelByLabel('Gemini 4 Neon (XHigh)');
    assert.equal(neonSet.selectedModel, 'Gemini 4 Neon (XHigh)');
    assert.equal(neonSet.modelEnum, 'MODEL_PLACEHOLDER_M535');
    quotaCheck = await bridge.getQuotaSummary(false);
    assert.equal(quotaCheck.headline.groupName, 'Gemini Models', 'Gemini 4 Neon (XHigh) must map headline to Gemini Models');

    const orchNeonSet = bridge.setModelByLabel('Orchestrator (Neon)');
    assert.equal(orchNeonSet.selectedModel, 'Orchestrator (Neon)');
    assert.equal(orchNeonSet.modelEnum, 'MODEL_PLACEHOLDER_M537');
    quotaCheck = await bridge.getQuotaSummary(false);
    assert.equal(quotaCheck.headline.groupName, 'Gemini Models', 'Orchestrator (Neon) must map headline to Gemini Models');

    bridge.setModelByLabel('Claude Opus 5.5 (High)');
    quotaCheck = await bridge.getQuotaSummary(false);
    assert.equal(quotaCheck.headline.groupName, 'Claude and GPT models', 'Claude Opus 5.5 must map headline to Claude and GPT models');

    for (const badCarbonQuery of ['Gemini 4 Carbon', 'g4 carbon', 'carbon high', 'Orchestrator (Carbon)']) {
        const disabledReject = bridge.setModelByLabel(badCarbonQuery);
        assert.ok(disabledReject.error && disabledReject.disabled === true, `setModelByLabel(${badCarbonQuery}) must return disabled error`);
        assert.equal(bridge.selectedModelLabel, 'Claude Opus 5.5 (High)', `Disabled model attempt (${badCarbonQuery}) must NOT mutate selectedModelLabel`);
    }

    const argonGrp = quotaCheck.groups.find(g => g.isArgon);
    if (argonGrp && !argonGrp.buckets.some(b => b.window === '5h')) {
        const argonHighMeta = bridge.cachedModels.find(m => m.label === 'Gemini 4 Argon (High)');
        assert.equal(argonHighMeta?.remainingFraction, null, 'Weekly-only Argon model must not fabricate 5h remainingFraction');
        assert.equal(typeof argonHighMeta?.weeklyRemainingFraction, 'number', 'Weekly-only Argon model must retain weeklyRemainingFraction');
    }

    bridge.setModelByLabel('Gemini 4 Neon (High)');
    console.log(`✔ Loaded ${modelRes.models.length} live models from Hub (incl. Neon & Orchestrator Neon), verified 3-group quota headlines & disabled Carbon rejection`);

    // Regression 4: Live slash commands catalog from Hub (System + /btw + Skills + Plugins + Controls, real descriptions, >50 items)
    const slashRes = await bridge.getSlashCommands(true);
    assert.equal(slashRes.success, true);
    assert.ok(slashRes.commands.length >= 25, `Expected full slash commands catalog (>=25), got ${slashRes.commands.length}`);
    for (const mustHave of ['btw', 'boost', 'swarm', 'plan', 'goal', 'compact', 'teamwork', 'grill-me', 'browser', 'learn', 'schedule', 'help', 'new', 'stop', 'model', 'mode', 'fast', 'theme', 'clear', 'history']) {
        assert.ok(slashRes.commands.some(c => c.name === mustHave), `Expected /${mustHave} in slash commands catalog`);
    }
    const goalCmd = slashRes.commands.find(c => c.name === 'goal');
    assert.ok(goalCmd?.description && !goalCmd.description.includes('Antigravity system workflow'), 'Expected real description from GetSlashCommands entry.description');
    assert.ok(slashRes.commands.some(c => c.category === 'Plugin' && c.pluginDisplayName), 'Expected plugin-scoped skills with pluginDisplayName');
    assert.ok(bridge.knownWorkspaceUris.size >= 1, 'Expected _discoverWorkspaceUris to populate knownWorkspaceUris Set from cwd / Hub projects');

    // Regression 4B: Slash tokenizer edge cases (mid-sentence /, sentence-ending /boost. & /plan:, query args, URLs, paths, code blocks)
    const tokenized = await bridge.tokenizePromptText(
        'Check https://example.com/plan and /usr/bin/plan and `/boost` and ```\n/swarm\n``` then (/plan?depth=2) and /boost.'
    );
    const slashItemsInTokens = tokenized.filter(ch => ch.item?.slashCommand);
    assert.equal(slashItemsInTokens.length, 2, `Expected ONLY the 2 real slash commands (/plan and /boost), got: ${JSON.stringify(slashItemsInTokens)}`);
    assert.equal(slashItemsInTokens[0].item.slashCommand.info.name, 'plan');
    assert.equal(slashItemsInTokens[0].item.slashCommand.argumentValues.depth, '2');
    assert.ok(slashItemsInTokens[0].item.slashCommand.info.modelFacingText, 'Expected full modelFacingText hydrated on /plan');
    assert.equal(slashItemsInTokens[1].item.slashCommand.info.name, 'boost');
    assert.ok(slashItemsInTokens[1].item.slashCommand.info.modelFacingText, 'Expected full modelFacingText hydrated on /boost');
    const reconstructedPlain = tokenized.filter(ch => ch.text).map(ch => ch.text).join('');
    assert.ok(reconstructedPlain.includes('https://example.com/plan'), 'URL /plan must stay untouched');
    assert.ok(reconstructedPlain.includes('/usr/bin/plan'), 'File path /usr/bin/plan must stay untouched');
    assert.ok(reconstructedPlain.includes('`/boost`'), 'Inline code `/boost` must stay untouched');
    assert.ok(reconstructedPlain.includes('```\n/swarm\n```'), 'Fenced code block `/swarm` must stay untouched');
    assert.ok(reconstructedPlain.endsWith('.'), 'Trailing period after /boost. must remain intact');
    console.log(`✔ Loaded ${slashRes.commands.length} live / actions (incl. /btw & /fast) & verified tokenizer safety`);

    // Regression 4C: Real workspace .agent/workflows discovery + file:/// URI normalization + live WORKFLOW & MCP_PROMPT RPC round-trip
    const tempWfDir = join(ROOT_DIR, '.agent', 'workflows');
    const tempWfFile = join(tempWfDir, 'rc-verify-wf.md');
    const hadWfDir = fs.existsSync(tempWfDir);
    const hadAgentDir = fs.existsSync(join(ROOT_DIR, '.agent'));
    fs.mkdirSync(tempWfDir, { recursive: true });
    fs.writeFileSync(
        tempWfFile,
        '---\ndescription: Temporary Remote Control verification workflow\n---\nReply with ONLY the exact word WORKFLOW_ROUNDTRIP_OK.\n',
        'utf-8'
    );
    bridge.setModelByLabel('Gemini 3.8 Flash (Low)');
    let wfTestCid = null;
    try {
        const wfCatalog = await bridge.getSlashCommands(true);
        const discoveredWf = wfCatalog.commands.find(c => c.name === 'rc-verify-wf');
        assert.ok(discoveredWf, 'Expected .agent/workflows/rc-verify-wf.md discovered by getSlashCommands(true)');
        assert.equal(discoveredWf.type, 'WORKFLOW');
        const wfRegEntry = bridge.slashRegistry.get('rc-verify-wf');
        assert.ok(
            wfRegEntry?.workflowSpec?.uri?.startsWith('file:///'),
            `Expected normalized file:/// URI on Windows workflow, got: ${wfRegEntry?.workflowSpec?.uri}`
        );

        // Inject a synthetic MCP_PROMPT entry & reset lastSlashFetchMs=0 to prove initial hydration preserves custom entries
        bridge.slashRegistry.set('mcp-verify-prompt', {
            name: 'mcp-verify-prompt',
            type: 'MCP_PROMPT',
            category: 'MCP',
            description: 'Synthetic MCP prompt round-trip check',
            serverName: 'verify-mcp-srv',
            promptName: 'echo_prompt',
            renderedPrompt: 'Include MCP_ROUNDTRIP_OK if asked.'
        });
        bridge.lastSlashFetchMs = 0;

        const wfStarted = await bridge.startNewConversation();
        assert.equal(wfStarted.success, true);
        wfTestCid = wfStarted.cascadeId;

        const wfSend = await bridge.sendMessage({
            message: '/rc-verify-wf /mcp-verify-prompt?topic=wal Reply with ONLY WORKFLOW_ROUNDTRIP_OK.',
            targetCascadeId: wfTestCid
        });
        assert.equal(wfSend.ok, true);

        let sawRecipeAndMcp = false;
        for (let attempt = 0; attempt < 16; attempt++) {
            await new Promise(r => setTimeout(r, 450));
            const traj = await bridge.callRpc('GetCascadeTrajectory', { cascadeId: wfTestCid });
            const steps = traj.trajectory?.steps || [];
            const uStep = steps.find(s => s.type === 'CORTEX_STEP_TYPE_USER_INPUT');
            const items = uStep?.userInput?.items || [];
            const hasRecipe = items.some(it => it.item?.recipe?.recipeId === 'rc-verify-wf' && it.item?.recipe?.uri?.startsWith('file:///'));
            const hasMcp = items.some(it => it.item?.mcpPrompt?.serverName === 'verify-mcp-srv' && it.item?.mcpPrompt?.argumentValues?.topic === 'wal');
            const doneReply = steps.find(s => s.type === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE' && s.status === 'CORTEX_STEP_STATUS_DONE');
            if (hasRecipe && hasMcp && doneReply) {
                sawRecipeAndMcp = true;
                break;
            }
        }
        assert.ok(sawRecipeAndMcp, 'Expected Hub trajectory to persist both recipe (file:/// URI) and mcpPrompt (argumentValues) scope items');
        const wfSnap = await bridge.buildSnapshotFromHub(wfTestCid);
        assert.ok(wfSnap.html.includes('agy-workflow-badge') && wfSnap.html.includes('/rc-verify-wf'), 'Snapshot must render workflow badge');
        assert.ok(wfSnap.html.includes('agy-mcp-badge') && wfSnap.html.includes('echo_prompt'), 'Snapshot must render MCP prompt badge');
        console.log('✔ Verified real .agent/workflows discovery, Windows file:/// URI normalization, and live WORKFLOW + MCP_PROMPT RPC round-trip');
    } finally {
        bridge.slashRegistry.delete('mcp-verify-prompt');
        try { fs.unlinkSync(tempWfFile); } catch {}
        if (!hadWfDir) { try { fs.rmdirSync(tempWfDir); } catch {} }
        if (!hadAgentDir) { try { fs.rmdirSync(join(ROOT_DIR, '.agent')); } catch {} }
        if (wfTestCid) {
            await bridge.stopGeneration(wfTestCid).catch(() => {});
            await bridge.deleteConversation(wfTestCid).catch(() => {});
        }
        await bridge.getSlashCommands(true);
    }

    // Regression 5: Recursive multi-depth subagent discovery, SDK step filtering, and live CODE_ACTION / GENERIC rendering
    const convos = await bridge.listConversations();
    assert.equal(convos.success, true);
    assert.ok(Array.isArray(convos.chats));
    let verifiedSdkStepsSkipped = 0;
    let verifiedLiveCodeActions = 0;
    let verifiedLiveGenerics = 0;

    const allCascadeIdsToInspect = [];
    for (const rootChat of convos.chats) {
        allCascadeIdsToInspect.push(rootChat.cascadeId);
        for (const sub of rootChat.subagents || []) {
            allCascadeIdsToInspect.push(sub.cascadeId);
        }
    }

    for (const cidToCheck of allCascadeIdsToInspect) {
        const [rawTraj, snap] = await Promise.all([
            bridge.callRpc('GetCascadeTrajectory', { cascadeId: cidToCheck }),
            bridge.buildSnapshotFromHub(cidToCheck)
        ]);
        const steps = rawTraj?.trajectory?.steps || [];
        const renderedIndices = new Set(
            Array.from(snap.html.matchAll(/data-step-index="(\d+)"/g), m => Number(m[1]))
        );

        let nonSdkMentionsReminderPhrase = false;
        steps.forEach((s, idx) => {
            if (s.metadata?.source === 'CORTEX_STEP_SOURCE_SYSTEM_SDK') {
                verifiedSdkStepsSkipped++;
                assert.ok(
                    !renderedIndices.has(idx),
                    `Trajectory ${cidToCheck} step ${idx} (CORTEX_STEP_SOURCE_SYSTEM_SDK) must never be rendered`
                );
            } else {
                if (JSON.stringify(s).includes('This is a periodic system reminder')) {
                    nonSdkMentionsReminderPhrase = true;
                }
                if (s.type === 'CORTEX_STEP_TYPE_CODE_ACTION') {
                    verifiedLiveCodeActions++;
                    assert.ok(
                        renderedIndices.has(idx),
                        `Trajectory ${cidToCheck} CODE_ACTION step ${idx} must be rendered`
                    );
                }
                if (s.type === 'CORTEX_STEP_TYPE_GENERIC') {
                    verifiedLiveGenerics++;
                    assert.ok(
                        renderedIndices.has(idx),
                        `Trajectory ${cidToCheck} GENERIC step ${idx} (${s.metadata?.toolCall?.name}) must be rendered`
                    );
                }
            }
        });

        for (const rIdx of renderedIndices) {
            assert.notEqual(
                steps[rIdx]?.metadata?.source,
                'CORTEX_STEP_SOURCE_SYSTEM_SDK',
                `Rendered step ${rIdx} in ${cidToCheck} must not originate from CORTEX_STEP_SOURCE_SYSTEM_SDK`
            );
        }

        if (!nonSdkMentionsReminderPhrase) {
            assert.ok(
                !snap.html.includes('This is a periodic system reminder'),
                `Trajectory ${cidToCheck} snapshot must not leak internal SDK system prompt reminders`
            );
        }
        assert.ok(
            !snap.html.includes('<span>workspace file</span>') && !snap.html.includes('>workspace file<'),
            `Trajectory ${cidToCheck} CODE_ACTION steps must resolve actual file paths instead of "workspace file"`
        );
    }
    console.log(
        `✔ Verified ${convos.chats.length} root conversation(s), ${verifiedSdkStepsSkipped} skipped SDK steps, ${verifiedLiveCodeActions} live CODE_ACTION diffs, and ${verifiedLiveGenerics} live GENERIC steps`
    );

    // Regression 6: Live end-to-end StartCascade -> SendUserCascadeMessage (/boost) -> GetCascadeTrajectory -> DeleteCascadeTrajectory
    bridge.setModelByLabel('Gemini 3.8 Flash (Low)');
    const tempStarted = await bridge.startNewConversation();
    assert.equal(tempStarted.success, true);
    try {
        const sent = await bridge.sendMessage({
            message: '/boost Reply with ONLY the single word PONG.',
            targetCascadeId: tempStarted.cascadeId
        });
        assert.equal(sent.ok, true);

        let hydratedBoost = false;
        for (let attempt = 0; attempt < 16; attempt++) {
            await new Promise(r => setTimeout(r, 450));
            const t = await bridge.callRpc('GetCascadeTrajectory', { cascadeId: tempStarted.cascadeId });
            const steps = t.trajectory?.steps || [];
            const uiStep = steps.find(s => s.type === 'CORTEX_STEP_TYPE_USER_INPUT');
            if (uiStep?.userInput?.items?.some(it => it.item?.slashCommand?.info?.name === 'boost' && it.item?.slashCommand?.info?.modelFacingText)) {
                hydratedBoost = true;
            }
            const aiDone = steps.find(s => s.type === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE' && s.status === 'CORTEX_STEP_STATUS_DONE');
            if (hydratedBoost && aiDone) break;
        }
        assert.ok(hydratedBoost, 'Expected language_server to hydrate /boost slashCommand.info.modelFacingText');
        console.log(`✔ Verified live end-to-end SendUserCascadeMessage with /boost on ${tempStarted.cascadeId}`);
    } finally {
        await bridge.stopGeneration(tempStarted.cascadeId).catch(() => {});
        const del = await bridge.deleteConversation(tempStarted.cascadeId);
        assert.equal(del.success, true);
    }

    console.log('\n=== 3. Express Server + WebSocket + Binary Upload + Fresh Snapshot Verification ===');
    const srv = spawn(process.execPath, ['server.js'], {
        cwd: ROOT_DIR,
        env: { ...process.env, PORT: String(TEST_PORT), APP_PASSWORD: TEST_PASS, AGY_DISABLE_DESKTOP_LAUNCH: '1' },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    try {
        let ready = false;
        for (let i = 0; i < 20; i++) {
            try {
                const h = await httpRequest('/health');
                if (h.status === 200 && h.json?.status === 'ok') {
                    ready = true;
                    assert.equal(h.json.hubConnected, true);
                    break;
                }
            } catch {}
            await new Promise(r => setTimeout(r, 300));
        }
        assert.ok(ready, 'Server failed to start on test port');
        console.log('✔ Server /health reports hubConnected=true over HTTP');

        // Verify simultaneous HTTPS on the exact same port
        const httpsHealth = await new Promise((resolve, reject) => {
            const req = https.request(
                { hostname: '127.0.0.1', port: TEST_PORT, path: '/health', method: 'GET', rejectUnauthorized: false },
                res => {
                    let b = '';
                    res.on('data', c => (b += c));
                    res.on('end', () => resolve({ status: res.statusCode, json: JSON.parse(b) }));
                }
            );
            req.on('error', reject);
            req.end();
        });
        assert.equal(httpsHealth.status, 200);
        assert.equal(httpsHealth.json.apkAvailable, true);
        console.log('✔ Server /health responds over HTTPS on the exact same port');

        // Regression 7: Immediate /snapshot freshness right after /new-chat (no stale previous conversation!)
        await httpRequest('/snapshot');
        const createdChat = await httpRequest('/new-chat', { method: 'POST' });
        assert.equal(createdChat.status, 200);
        assert.ok(createdChat.json.cascadeId);
        try {
            const snapImmediate = await httpRequest('/snapshot');
            assert.equal(
                snapImmediate.json.cascadeId,
                createdChat.json.cascadeId,
                'Immediate GET /snapshot after POST /new-chat must return the new conversation, not stale cache'
            );
            console.log('✔ Immediate GET /snapshot after POST /new-chat returns fresh new conversation');
        } finally {
            await httpRequest('/delete-chat', { method: 'POST', body: { cascadeId: createdChat.json.cascadeId } });
        }

        // Regression 8: Binary file upload preserves exact non-UTF8 bytes on disk + /hub/media HTTP Range streaming & security boundary
        const rawBinary = crypto.randomBytes(512);
        rawBinary[0] = 0x25; // %PDF-like header + arbitrary high bytes 0xff 0xfe 0x80
        rawBinary[1] = 0xff;
        rawBinary[2] = 0xfe;
        rawBinary[3] = 0x80;
        const upRes = await httpRequest('/upload-attachment', {
            method: 'POST',
            body: {
                fileName: 'binary_test.pdf',
                fileType: 'application/pdf',
                dataUrl: `data:application/pdf;base64,${rawBinary.toString('base64')}`
            }
        });
        assert.equal(upRes.status, 200);
        assert.equal(upRes.json.success, true);
        const diskBytes = fs.readFileSync(upRes.json.filePath);
        try {
            assert.equal(Buffer.compare(rawBinary, diskBytes), 0, 'Uploaded binary PDF bytes must match byte-for-byte');

            // Verify /hub/media full GET and HTTP Range (206 Partial Content) streaming + 403 outside-storage block
            const mediaFull = await httpRequest(`/hub/media?uri=${encodeURIComponent(upRes.json.filePath)}`);
            assert.equal(mediaFull.status, 200);
            assert.equal(mediaFull.headers['content-type'], 'application/pdf');
            assert.equal(mediaFull.headers['accept-ranges'], 'bytes');

            const mediaRange = await httpRequest(`/hub/media?uri=${encodeURIComponent(upRes.json.filePath)}`, {
                headers: { Range: 'bytes=0-15' }
            });
            assert.equal(mediaRange.status, 206, 'Expected HTTP 206 Partial Content for Range request on /hub/media');
            assert.equal(mediaRange.headers['content-range'], 'bytes 0-15/512');
            assert.equal(mediaRange.headers['content-length'], '16');

            const forbiddenMedia = await httpRequest(`/hub/media?uri=${encodeURIComponent('file:///C:/Windows/win.ini')}`);
            assert.equal(forbiddenMedia.status, 403, 'Expected HTTP 403 when requesting file outside allowed media storage');
            const forbiddenPkg = await httpRequest(`/hub/media?uri=${encodeURIComponent(join(ROOT_DIR, 'package.json'))}`);
            assert.equal(forbiddenPkg.status, 403, 'Expected HTTP 403 when requesting arbitrary project file via /hub/media');
            console.log('✔ Binary PDF upload preserved 512 bytes intact & /hub/media verified (200 full, 206 Range, 403 traversal guard)');
        } finally {
            try { fs.unlinkSync(upRes.json.filePath); } catch {}
        }

        // Regression 8B: Live Multi-File Direct Upload (2 Images + PDF + MP4 + Python Code + Binary APK) -> Clean Prompt with ZERO file:/// location text!
        await httpRequest('/set-model', { method: 'POST', body: { model: 'Gemini 3.8 Flash (Low)' } });
        const mediaChat = await httpRequest('/new-chat', { method: 'POST' });
        assert.equal(mediaChat.status, 200);
        const mediaCid = mediaChat.json.cascadeId;
        const stagedPathsToClean = [];
        try {
            const tinyPngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            const upImg1 = await httpRequest('/upload-attachment', {
                method: 'POST',
                body: { fileName: 'phone_shot_1.png', fileType: 'image/png', dataUrl: `data:image/png;base64,${tinyPngB64}` }
            });
            const upImg2 = await httpRequest('/upload-attachment', {
                method: 'POST',
                body: { fileName: 'phone_shot_2.jpg', fileType: 'image/jpeg', dataUrl: `data:image/jpeg;base64,${tinyPngB64}` }
            });
            const upPdf = await httpRequest('/upload-attachment', {
                method: 'POST',
                body: { fileName: 'architecture_notes.pdf', fileType: 'application/pdf', dataUrl: `data:application/pdf;base64,${Buffer.from('%PDF-1.4 clean upload test').toString('base64')}` }
            });
            const upMp4 = await httpRequest('/upload-attachment', {
                method: 'POST',
                body: { fileName: 'capture.mp4', fileType: 'application/octet-stream', dataUrl: `data:application/octet-stream;base64,${Buffer.from('00000018667479706d703432', 'hex').toString('base64')}` }
            });
            const upPy = await httpRequest('/upload-attachment', {
                method: 'POST',
                body: { fileName: 'helper.py', fileType: 'text/plain', textContent: 'def greet():\n    return "CLEAN_UPLOAD_OK"\n' }
            });
            const upApk = await httpRequest('/upload-attachment', {
                method: 'POST',
                body: { fileName: 'sample.apk', fileType: 'application/octet-stream', dataUrl: `data:application/octet-stream;base64,${Buffer.from([0x50, 0x4b, 0x03, 0x04, 0xaa, 0xbb]).toString('base64')}` }
            });

            for (const r of [upImg1, upImg2, upPdf, upMp4, upPy, upApk]) {
                assert.equal(r.status, 200);
                if (r.json?.filePath) stagedPathsToClean.push(r.json.filePath);
            }
            assert.equal(upMp4.json.fileType, 'video/mp4', 'Expected extension-based MIME resolution for .mp4 with application/octet-stream');
            assert.equal(upPy.json.fileType, 'text/x-python', 'Expected extension-based MIME resolution for .py');

            const sendMultiRes = await httpRequest('/send', {
                method: 'POST',
                body: {
                    cascadeId: mediaCid,
                    message: 'Reply with ONLY the single word MEDIA_CLEAN_OK.',
                    attachments: [upImg1.json, upImg2.json, upPdf.json, upMp4.json, upPy.json, upApk.json]
                }
            });
            assert.equal(sendMultiRes.status, 200, `Expected 200 on multi-attachment /send, got ${sendMultiRes.status}: ${sendMultiRes.raw}`);
            assert.equal(sendMultiRes.json.success, true);

            const trajAfterSend = await bridge.callRpc('GetCascadeTrajectory', { cascadeId: mediaCid });
            const uStep = (trajAfterSend.trajectory?.steps || []).find(s => s.type === 'CORTEX_STEP_TYPE_USER_INPUT');
            assert.ok(uStep, 'Expected USER_INPUT step in trajectory after multi-file send');
            const rawItemsStr = JSON.stringify(uStep.userInput?.items || []);
            assert.ok(!rawItemsStr.includes('[Attached:'), `USER_INPUT items must NEVER contain [Attached: ...], got: ${rawItemsStr}`);
            assert.ok(!rawItemsStr.includes('file:///'), `USER_INPUT items must NEVER contain file:/// location paths, got: ${rawItemsStr}`);
            assert.ok(!rawItemsStr.includes('/uploads/'), `USER_INPUT items must NEVER contain /uploads/ paths, got: ${rawItemsStr}`);
            assert.equal((uStep.userInput?.media || []).length, 6, 'Expected all 6 attachments registered in userInput.media');

            const snapAfterMedia = await httpRequest('/snapshot');
            const snapHtml = snapAfterMedia.json?.html || '';
            assert.ok(!snapHtml.includes('[Attached:'), 'Snapshot HTML must contain zero [Attached: ...] strings');
            assert.ok(snapHtml.includes('data-testid="user-media-attachments"'), 'Snapshot HTML must render .agy-user-media-grid');
            assert.ok(snapHtml.includes('phone_shot_1.png') && snapHtml.includes('phone_shot_2.jpg'), 'Both uploaded images must render as thumbnails');
            assert.ok(snapHtml.includes('architecture_notes.pdf') && snapHtml.includes('capture.mp4') && snapHtml.includes('helper.py') && snapHtml.includes('sample.apk'), 'All non-image file pills must render cleanly');

            // Also verify POST /upload-media with empty caption (attachment-only turn) writes zero location text
            const directMediaRes = await httpRequest('/upload-media', {
                method: 'POST',
                body: {
                    fileName: 'direct_no_caption.png',
                    fileType: 'image/png',
                    dataUrl: `data:image/png;base64,${tinyPngB64}`,
                    caption: ''
                }
            });
            assert.equal(directMediaRes.status, 200);
            assert.equal(directMediaRes.json.success, true);
            if (directMediaRes.json?.filePath) stagedPathsToClean.push(directMediaRes.json.filePath);
            const trajAfterDirect = await bridge.callRpc('GetCascadeTrajectory', { cascadeId: mediaCid });
            const allUserInputsJson = JSON.stringify(
                (trajAfterDirect.trajectory?.steps || [])
                    .filter(s => s.type === 'CORTEX_STEP_TYPE_USER_INPUT')
                    .map(s => s.userInput?.items || [])
            );
            assert.ok(!allUserInputsJson.includes('[Attached:') && !allUserInputsJson.includes('/uploads/'), 'POST /upload-media must never inject file location text into items');
            console.log('✔ Verified live multi-file direct upload & /upload-media (2 images + PDF + MP4 + Python + APK) with ZERO file:/// location clutter in prompt');
        } finally {
            await httpRequest('/stop', { method: 'POST', body: { cascadeId: mediaCid } }).catch(() => {});
            await httpRequest('/delete-chat', { method: 'POST', body: { cascadeId: mediaCid } }).catch(() => {});
            for (const p of stagedPathsToClean) {
                try { fs.unlinkSync(p); } catch {}
            }
        }

        // Verify /slash-commands, empty quote/message boundary validation & /hub-interact boundary validation
        const slashHttp = await httpRequest('/slash-commands');
        assert.equal(slashHttp.status, 200);
        assert.ok(slashHttp.json.commands.length >= 25, 'Expected full /slash-commands catalog over HTTP');

        const emptyQuoteSend = await httpRequest('/send', {
            method: 'POST',
            body: { message: '   ', quotes: [{ content: '   ', answer: '' }] }
        });
        assert.equal(emptyQuoteSend.status, 400, 'Whitespace-only message and empty quotes must return HTTP 400');

        // Verify live end-to-end Quote + Specific Answer (with inline /plan) + Code Quote + Quote-with-/compact + /btw Side Question over HTTP -> Hub RPC -> /snapshot
        await httpRequest('/set-model', { method: 'POST', body: { model: 'Gemini 3.8 Flash (Low)' } });
        const quoteChat = await httpRequest('/new-chat', { method: 'POST' });
        assert.equal(quoteChat.status, 200);
        const quoteCid = quoteChat.json.cascadeId;
        let forkedSideCid = null;
        try {
            // Bare /btw must return HTTP 400 validation error (NOT fall through to 503 CDP fallback)
            const bareBtwRes = await httpRequest('/send', {
                method: 'POST',
                body: { cascadeId: quoteCid, message: '/btw    ' }
            });
            assert.equal(bareBtwRes.status, 400, `Expected HTTP 400 for bare /btw, got ${bareBtwRes.status}: ${bareBtwRes.raw}`);
            assert.match(bareBtwRes.json?.error || '', /side question/i);

            const quoteSendRes = await httpRequest('/send', {
                method: 'POST',
                body: {
                    cascadeId: quoteCid,
                    quotes: [
                        {
                            content: 'Question 1: Should we use SQLite WAL or JSON files?',
                            label: 'Quote',
                            answer: 'Use SQLite WAL for Question 1 with /boost.'
                        },
                        {
                            content: 'const timeoutMs = 1000;',
                            label: 'code_block',
                            answer: 'Increase timeoutMs to 5000.'
                        }
                    ],
                    message: 'Remember code 7741 and reply with ONLY: QUOTES_RECEIVED 7741'
                }
            });
            assert.equal(quoteSendRes.status, 200);
            assert.equal(quoteSendRes.json.success, true);

            let quoteRenderedOk = false;
            for (let poll = 0; poll < 28; poll++) {
                await new Promise(r => setTimeout(r, 450));
                const sRes = await httpRequest('/snapshot');
                const html = sRes.json?.html || '';
                if (
                    !sRes.json?.isGenerating &&
                    html.includes('agy-ai-turn') &&
                    html.includes('data-testid="user-quote-block"') &&
                    html.includes('Question 1: Should we use SQLite WAL') &&
                    html.includes('class="whitespace-pre-wrap agy-user-text agy-quote-specific-answer"') &&
                    html.includes('Use SQLite WAL for Question 1 with <span class="is-inline agy-slash-badge">/boost</span>.') &&
                    html.includes('Quoted Code') &&
                    html.includes('Increase timeoutMs to 5000.') &&
                    html.includes('QUOTES_RECEIVED')
                ) {
                    quoteRenderedOk = true;
                    break;
                }
            }
            assert.ok(quoteRenderedOk, 'Expected quoted textBlock + code_block + paired specific answers (preserving inline /boost. badge) rendered in /snapshot');

            // Verify live /btw side question forking on a conversation with >=1 step without mutating parent trajectory
            const parentBeforeBtw = await bridge.callRpc('GetCascadeTrajectory', { cascadeId: quoteCid });
            const parentStepsBeforeBtw = (parentBeforeBtw.trajectory?.steps || []).length;
            assert.ok(parentStepsBeforeBtw >= 2, 'Expected parent conversation to have steps before /btw');

            const btwSendRes = await httpRequest('/send', {
                method: 'POST',
                body: {
                    cascadeId: quoteCid,
                    message: '/btw What 4-digit code did we just mention? Reply ONLY with the 4 digits.'
                }
            });
            assert.equal(btwSendRes.status, 200, `Expected 200 on /btw fork, got ${btwSendRes.status}: ${btwSendRes.raw}`);
            assert.equal(btwSendRes.json.success, true);
            assert.equal(btwSendRes.json.isSideQuestion, true, 'Expected isSideQuestion=true on /btw response');
            assert.equal(btwSendRes.json.parentCascadeId, quoteCid, 'Expected parentCascadeId to point to main conversation');
            forkedSideCid = btwSendRes.json.cascadeId;
            assert.ok(forkedSideCid && forkedSideCid !== quoteCid, 'Expected distinct side-question cascadeId');

            let sideBannerAndAnswerOk = false;
            for (let bPoll = 0; bPoll < 24; bPoll++) {
                await new Promise(r => setTimeout(r, 450));
                const sideSnap = await httpRequest('/snapshot');
                const sideHtml = sideSnap.json?.html || '';
                if (
                    !sideSnap.json?.isGenerating &&
                    sideSnap.json?.cascadeId === forkedSideCid &&
                    sideHtml.includes('data-testid="side-question-banner"') &&
                    sideHtml.includes('data-testid="side-question-insert-to-main"') &&
                    sideHtml.includes('7741')
                ) {
                    sideBannerAndAnswerOk = true;
                    break;
                }
            }
            assert.ok(sideBannerAndAnswerOk, 'Expected /btw side question banner, Insert-to-Main button, and forked context answer (7741) in /snapshot');

            const parentAfterBtw = await bridge.callRpc('GetCascadeTrajectory', { cascadeId: quoteCid });
            assert.equal(
                (parentAfterBtw.trajectory?.steps || []).length,
                parentStepsBeforeBtw,
                '/btw side question must NOT append steps to the parent conversation'
            );

            const historyWithBtw = await httpRequest('/chat-history');
            const rootLeakedSide = (historyWithBtw.json?.chats || []).some(c => c.cascadeId === forkedSideCid);
            assert.equal(rootLeakedSide, false, 'SIDE_QUESTION trajectory must NOT leak as a duplicate root chat');
            const parentHistoryEntry = (historyWithBtw.json?.chats || []).find(c => c.cascadeId === quoteCid);
            assert.ok(
                parentHistoryEntry?.subagents?.some(s => s.cascadeId === forkedSideCid && s.isSideQuestion === true),
                'Expected SIDE_QUESTION trajectory nested under parent chat subagents with isSideQuestion=true'
            );

            // Switch back to parent chat and verify COMBINED Quote + /compact in the same turn creates a checkpoint!
            await httpRequest('/select-chat', { method: 'POST', body: { cascadeId: quoteCid } });
            const compactWithQuoteRes = await httpRequest('/send', {
                method: 'POST',
                body: {
                    cascadeId: quoteCid,
                    quotes: [{ content: 'Context note right before compacting', label: 'Quote', answer: '' }],
                    message: '/compact'
                }
            });
            assert.equal(compactWithQuoteRes.status, 200);
            assert.equal(compactWithQuoteRes.json.success, true);
            let compactBadgeSeen = false;
            let checkpointSeen = false;
            for (let cpPoll = 0; cpPoll < 28; cpPoll++) {
                const postCompactSnap = await httpRequest('/snapshot');
                const cpHtml = postCompactSnap.json?.html || '';
                if (cpHtml.includes('/compact')) compactBadgeSeen = true;
                if (cpHtml.includes('Conversation context compacted')) checkpointSeen = true;
                if (compactBadgeSeen && checkpointSeen) break;
                await new Promise(r => setTimeout(r, 450));
            }
            assert.ok(compactBadgeSeen, 'Expected /compact badge in snapshot after Quote + /compact');
            assert.ok(checkpointSeen, 'Expected Conversation context compacted checkpoint step even when /compact is sent WITH a quote');
            console.log('✔ Verified multi-quote + inline /plan in specific answer + live /btw side-question fork + combined Quote + /compact checkpoint');
        } finally {
            if (forkedSideCid) {
                await httpRequest('/stop', { method: 'POST', body: { cascadeId: forkedSideCid } }).catch(() => {});
                await httpRequest('/delete-chat', { method: 'POST', body: { cascadeId: forkedSideCid } }).catch(() => {});
            }
            await httpRequest('/stop', { method: 'POST', body: { cascadeId: quoteCid } }).catch(() => {});
            await httpRequest('/delete-chat', { method: 'POST', body: { cascadeId: quoteCid } }).catch(() => {});
        }

        const badInteract = await httpRequest('/hub-interact', { method: 'POST', body: {} });
        assert.equal(badInteract.status, 400);

        // Verify external tunnel 401 enforcement, login cookie, x-ag-key header, and cookie-only WebSocket auth
        const unauthSlash = await httpRequest('/slash-commands', { headers: { 'x-forwarded-for': '203.0.113.55' } });
        assert.equal(unauthSlash.status, 401);

        const unauthInteract = await httpRequest('/hub-interact', {
            method: 'POST',
            headers: { 'x-forwarded-for': '203.0.113.55' },
            body: { trajectoryId: 'x', stepIndex: 0 }
        });
        assert.equal(unauthInteract.status, 401);

        const goodLogin = await httpRequest('/login', {
            method: 'POST',
            headers: { 'x-forwarded-for': '203.0.113.55' },
            body: { password: TEST_PASS }
        });
        assert.equal(goodLogin.status, 200);
        const rawSetCookie = (goodLogin.headers['set-cookie'] || [])[0] || '';
        assert.ok(/SameSite=Lax/i.test(rawSetCookie), 'POST /login cookie must include SameSite=Lax');
        const cookieHdr = rawSetCookie.split(';')[0] || '';
        assert.ok(cookieHdr.startsWith('ag_auth_token='), 'Expected signed cookie');

        const wsCookieAuth = await new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${TEST_PORT}/`, {
                headers: { 'x-forwarded-for': '203.0.113.55', Cookie: cookieHdr }
            });
            let unauthorized = false;
            ws.on('message', m => {
                const msg = JSON.parse(m.toString());
                if (msg.type === 'error' && msg.message === 'Unauthorized') unauthorized = true;
            });
            ws.on('error', reject);
            setTimeout(() => {
                const ok = ws.readyState === WebSocket.OPEN && !unauthorized;
                ws.close();
                resolve(ok);
            }, 300);
        });
        assert.equal(wsCookieAuth, true, 'Cookie-only WebSocket connection over tunnel must stay authenticated');

        const wsHeaderKeyAuth = await new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${TEST_PORT}/`, {
                headers: { 'x-forwarded-for': '203.0.113.55', 'x-ag-key': TEST_PASS }
            });
            let unauthorized = false;
            ws.on('message', m => {
                const msg = JSON.parse(m.toString());
                if (msg.type === 'error' && msg.message === 'Unauthorized') unauthorized = true;
            });
            ws.on('error', reject);
            setTimeout(() => {
                const ok = ws.readyState === WebSocket.OPEN && !unauthorized;
                ws.close();
                resolve(ok);
            }, 300);
        });
        assert.equal(wsHeaderKeyAuth, true, 'x-ag-key WebSocket connection over tunnel must stay authenticated');

        // Live end-to-end WAITING ask_question -> /hub-interact submission -> answered snapshot verification
        await httpRequest('/set-model', { method: 'POST', body: { model: 'Gemini 3.8 Flash (Low)' } });
        const interactChat = await httpRequest('/new-chat', { method: 'POST' });
        assert.equal(interactChat.status, 200);
        const interactCid = interactChat.json.cascadeId;
        try {
            await httpRequest('/send', {
                method: 'POST',
                body: {
                    cascadeId: interactCid,
                    message: 'Call ask_question right now with 1 question "Pick color" and options ["Red", "Blue"]. After I answer, reply ONLY with the chosen word.'
                }
            });
            let waitingCardMatch = null;
            for (let pollIdx = 0; pollIdx < 40; pollIdx++) {
                await new Promise(r => setTimeout(r, 500));
                const sRes = await httpRequest('/snapshot');
                const html = sRes.json?.html || '';
                const m = /data-hub-question-card="1"\s+data-cascade-id="([^"]+)"\s+data-trajectory-id="([^"]+)"\s+data-step-index="(\d+)"/.exec(html);
                if (m && html.includes('is-waiting')) {
                    waitingCardMatch = { cascadeId: m[1], trajectoryId: m[2], stepIndex: Number(m[3]) };
                    break;
                }
            }
            assert.ok(waitingCardMatch, 'Expected live WAITING ask_question card in /snapshot');
            const submitInteract = await httpRequest('/hub-interact', {
                method: 'POST',
                body: {
                    cascadeId: waitingCardMatch.cascadeId,
                    trajectoryId: waitingCardMatch.trajectoryId,
                    stepIndex: waitingCardMatch.stepIndex,
                    interactionCase: 'askQuestion',
                    responses: [
                        {
                            question: 'Pick color',
                            selectedOptionIds: ['2'],
                            writeInResponse: '',
                            skipped: false
                        }
                    ],
                    cancelled: false
                }
            });
            assert.equal(submitInteract.status, 200);
            assert.equal(submitInteract.json.success, true);

            const postInteractSnap = await httpRequest('/snapshot');
            assert.ok(
                postInteractSnap.json.html.includes('Question Answered') &&
                    postInteractSnap.json.html.includes('agy-question-opt-btn selected'),
                'Post-interaction /snapshot must immediately show Question Answered with selected option highlighted'
            );
        } finally {
            await httpRequest('/stop', { method: 'POST', body: { cascadeId: interactCid } }).catch(() => {});
            await httpRequest('/delete-chat', { method: 'POST', body: { cascadeId: interactCid } }).catch(() => {});
            await httpRequest('/set-model', { method: 'POST', body: { model: 'Gemini 4 Neon (High)' } }).catch(() => {});
        }
        console.log('✔ Verified /slash-commands, live WAITING /hub-interact round-trip, 401 tunnel guards, and cookie/x-ag-key WebSocket auth');

        // === 3B. Verify Models, Disabled-Model Guard, 3-Group Weekly Quota, QoL (/export-chat), IDE Workspace, and Swarm HTTP Endpoints ===
        for (const protectedRoute of ['/quota', '/ide/status', '/ide/files', '/ide/file?path=package.json', '/swarm', '/swarm/list', '/export-chat']) {
            const unauth = await httpRequest(protectedRoute, { headers: { 'x-forwarded-for': '203.0.113.55' } });
            assert.equal(unauth.status, 401, `Expected HTTP 401 over unauthenticated tunnel for ${protectedRoute}, got ${unauth.status}`);
        }

        const getModelsHttp = await httpRequest('/get-models');
        assert.equal(getModelsHttp.status, 200);
        assert.equal(getModelsHttp.json.success, true);
        for (const reqModel of ['Gemini 4 Neon (High)', 'Gemini 4 Neon (XHigh)', 'Gemini 4 Neon (Medium)', 'Gemini 4 Neon (Low)', 'Orchestrator (Neon)', 'Orchestrator (Argon)']) {
            assert.ok(getModelsHttp.json.models.includes(reqModel), `Expected GET /get-models to include ${reqModel}`);
        }
        const httpCarbonMeta = getModelsHttp.json.modelDetails?.find(m => /gemini 4 carbon/i.test(m.label));
        if (httpCarbonMeta) {
            assert.equal(httpCarbonMeta.disabled, true, 'GET /get-models must expose Gemini 4 Carbon as disabled');
        }

        const setNeonXHighHttp = await httpRequest('/set-model', { method: 'POST', body: { model: 'Gemini 4 Neon (XHigh)' } });
        assert.equal(setNeonXHighHttp.status, 200);
        assert.equal(setNeonXHighHttp.json.selectedModel, 'Gemini 4 Neon (XHigh)');
        let quotaRes = await httpRequest('/quota?refresh=1');
        assert.equal(quotaRes.status, 200);
        assert.equal(quotaRes.json.success, true);
        assert.equal(quotaRes.json.groups?.length, 3, `Expected 3 quota groups from /quota, got ${quotaRes.json.groups?.length}`);
        assert.deepEqual(
            quotaRes.json.groups.map(g => g.displayName).sort(),
            ['Claude and GPT models', 'Gemini 4 Argon', 'Gemini Models']
        );
        assert.equal(typeof quotaRes.json.headline?.weeklyRemainingPercent, 'number', 'Expected numeric weeklyRemainingPercent in /quota headline');
        assert.equal(quotaRes.json.headline?.groupName, 'Gemini Models', 'Gemini 4 Neon (XHigh) headline must use Gemini Models');

        const setOrchNeonHttp = await httpRequest('/set-model', { method: 'POST', body: { model: 'Orchestrator (Neon)' } });
        assert.equal(setOrchNeonHttp.status, 200);
        assert.equal(setOrchNeonHttp.json.selectedModel, 'Orchestrator (Neon)');
        quotaRes = await httpRequest('/quota');
        assert.equal(quotaRes.json.headline?.groupName, 'Gemini Models', 'Orchestrator (Neon) headline must use Gemini Models');

        // Disabled Gemini 4 Carbon variants must return HTTP 400 and NOT mutate active model
        for (const badCarbonBody of ['Gemini 4 Carbon', 'g4 carbon', 'carbon high', 'Orchestrator (Carbon)']) {
            const setDisabledCarbonHttp = await httpRequest('/set-model', { method: 'POST', body: { model: badCarbonBody } });
            assert.equal(setDisabledCarbonHttp.status, 400, `Expected HTTP 400 on disabled ${badCarbonBody}, got ${setDisabledCarbonHttp.status}`);
            assert.equal(setDisabledCarbonHttp.json?.disabled, true);
        }
        const stateAfterCarbon = await httpRequest('/app-state');
        assert.equal(stateAfterCarbon.status, 200);
        assert.equal(stateAfterCarbon.json?.model, 'Orchestrator (Neon)', 'Disabled POST /set-model must not mutate active model');

        // Argon & Orchestrator (Argon) -> Gemini 4 Argon headline; Claude Opus 5.5 -> Claude and GPT models headline
        const setArgonHttp = await httpRequest('/set-model', { method: 'POST', body: { model: 'Gemini 4 Argon (High)' } });
        assert.equal(setArgonHttp.status, 200);
        quotaRes = await httpRequest('/quota');
        assert.equal(quotaRes.json.headline?.groupName, 'Gemini 4 Argon', 'Gemini 4 Argon (High) headline must use Gemini 4 Argon');

        const setOrchArgonHttp = await httpRequest('/set-model', { method: 'POST', body: { model: 'Orchestrator (Argon)' } });
        assert.equal(setOrchArgonHttp.status, 200);
        quotaRes = await httpRequest('/quota');
        assert.equal(quotaRes.json.headline?.groupName, 'Gemini 4 Argon', 'Orchestrator (Argon) headline must use Gemini 4 Argon');

        const setOpusHttp = await httpRequest('/set-model', { method: 'POST', body: { model: 'Claude Opus 5.5 (High)' } });
        assert.equal(setOpusHttp.status, 200);
        quotaRes = await httpRequest('/quota');
        assert.equal(quotaRes.json.headline?.groupName, 'Claude and GPT models', 'Claude Opus 5.5 headline must use Claude and GPT models');

        // Restore default Gemini 4 Neon (High) before live Chrome verification
        const restoreNeonHttp = await httpRequest('/set-model', { method: 'POST', body: { model: 'Gemini 4 Neon (High)' } });
        assert.equal(restoreNeonHttp.status, 200);
        assert.equal(restoreNeonHttp.json.selectedModel, 'Gemini 4 Neon (High)');

        const ideStatusRes = await httpRequest('/ide/status');
        assert.equal(ideStatusRes.status, 200);
        assert.equal(ideStatusRes.json.success, true);
        assert.ok(ideStatusRes.json.activeWorkspace?.path, 'Expected activeWorkspace.path in /ide/status');

        const ideSwitchIde = await httpRequest('/ide/switch-target', {
            method: 'POST',
            body: { target: 'ide', workspacePath: ROOT_DIR }
        });
        assert.equal(ideSwitchIde.status, 200);
        assert.equal(ideSwitchIde.json.targetApp, 'ide');
        await httpRequest('/ide/switch-target', { method: 'POST', body: { target: 'antigravity', workspacePath: ROOT_DIR } });

        const ideDryOpen = await httpRequest('/ide/open-desktop', {
            method: 'POST',
            body: { target: 'ide', filePath: 'package.json', line: 5 }
        });
        assert.equal(ideDryOpen.status, 200);
        assert.equal(ideDryOpen.json.dryRun, true);

        const ideFilesRes = await httpRequest('/ide/files?search=server.js');
        assert.equal(ideFilesRes.status, 200);
        assert.ok(ideFilesRes.json.entries?.some(e => e.name === 'server.js'), 'Expected server.js in /ide/files search');

        const ideReadPkg = await httpRequest('/ide/file?path=package.json');
        assert.equal(ideReadPkg.status, 200);
        assert.ok(/antigravity/i.test(ideReadPkg.json.content || ''), 'Expected package.json content from /ide/file');

        // Security boundary: path traversal outside workspace MUST return HTTP 403
        const traversalRead = await httpRequest('/ide/file?path=..%2F..%2FWindows%2Fwin.ini');
        assert.equal(traversalRead.status, 403, `Expected HTTP 403 on ../ path traversal, got ${traversalRead.status}`);
        const absOutsideRead = await httpRequest('/ide/file?path=' + encodeURIComponent('C:/Windows/win.ini'));
        assert.equal(absOutsideRead.status, 403, `Expected HTTP 403 on absolute path outside workspace, got ${absOutsideRead.status}`);

        // IDE file write + read round-trip inside workspace (cleaned up immediately)
        const tempIdeRel = 'uploads/.rc_ide_write_verify.tmp';
        const tempIdeFull = join(ROOT_DIR, tempIdeRel);
        try {
            const writeIdeRes = await httpRequest('/ide/file', {
                method: 'POST',
                body: { path: tempIdeRel, content: 'const verified = 42;\n' }
            });
            assert.equal(writeIdeRes.status, 200);
            assert.equal(writeIdeRes.json.success, true);
            const readBackIde = await httpRequest(`/ide/file?path=${encodeURIComponent(tempIdeRel)}`);
            assert.equal(readBackIde.status, 200);
            assert.equal(readBackIde.json.content, 'const verified = 42;\n');
        } finally {
            try { fs.unlinkSync(tempIdeFull); } catch {}
        }

        const ideGitRes = await httpRequest('/ide/git');
        assert.equal(ideGitRes.status, 200);
        assert.equal(ideGitRes.json.success, true);

        // Live Swarm endpoints (/swarm/list & /swarm)
        const swarmListRes = await httpRequest('/swarm/list');
        assert.equal(swarmListRes.status, 200);
        assert.equal(swarmListRes.json.success, true);
        assert.ok(Array.isArray(swarmListRes.json.swarms), 'Expected swarms array from GET /swarm/list');
        if (swarmListRes.json.swarms.length > 0) {
            const firstSwId = swarmListRes.json.swarms[0].swarmId;
            const explicitSwarmRes = await httpRequest(`/swarm?swarmId=${encodeURIComponent(firstSwId)}`);
            assert.equal(explicitSwarmRes.status, 200);
            assert.equal(explicitSwarmRes.json.id, firstSwId);
            assert.ok(Array.isArray(explicitSwarmRes.json.members) && explicitSwarmRes.json.members.length >= 1);
            assert.ok(explicitSwarmRes.json.overview && Array.isArray(explicitSwarmRes.json.overview.workstreams));
            const etagSwarmRes = await httpRequest(
                `/swarm?swarmId=${encodeURIComponent(firstSwId)}&etag=${encodeURIComponent(explicitSwarmRes.json.etag)}`
            );
            assert.equal(etagSwarmRes.status, 200);
            assert.equal(etagSwarmRes.json.unchanged, true, 'GET /swarm with matching etag must return unchanged: true');
        }
        const missingHttpSwarmRes = await httpRequest('/swarm?swarmId=deadbeef-dead-beef-dead-beef00000001');
        assert.equal(missingHttpSwarmRes.status, 200);
        assert.equal(missingHttpSwarmRes.json.swarm, null);
        assert.equal(missingHttpSwarmRes.json.notFoundSwarmId, 'deadbeef-dead-beef-dead-beef00000001');

        const exportRes = await httpRequest('/export-chat');
        assert.ok(exportRes.status === 200 || exportRes.status === 404);
        if (exportRes.status === 200) {
            assert.ok(exportRes.json.markdown?.startsWith('# '), 'Expected clean Markdown export starting with # heading');
        }
        console.log('✔ Verified /quota, /ide/* (incl. 403 path-traversal block & write round-trip), /swarm & /swarm/list (incl. etag), /export-chat, and 401 tunnel guards');

        // === 4. Real Headless Chrome Mobile UI & Android Offline Asset Verification ===
        const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
        if (fs.existsSync(chromePath)) {
            console.log('\n=== 4. Headless Chrome Live Mobile UI & Android Offline Preview Verification ===');
            const verifyPageInChrome = async (url, port, evalExpr, windowSize = '360,800') => {
                const chrome = spawn(
                    chromePath,
                    [
                        '--headless=new',
                        '--disable-gpu',
                        '--no-first-run',
                        `--remote-debugging-port=${port}`,
                        `--window-size=${windowSize}`,
                        url
                    ],
                    { stdio: 'ignore' }
                );
                try {
                    let target = null;
                    for (let i = 0; i < 20; i++) {
                        try {
                            const r = await fetch(`http://127.0.0.1:${port}/json/list`);
                            const list = await r.json();
                            target = list.find(t => t.type === 'page');
                            if (target) break;
                        } catch {}
                        await new Promise(r => setTimeout(r, 250));
                    }
                    assert.ok(target, `Chrome DevTools target not found on port ${port}`);
                    const ws = new WebSocket(target.webSocketDebuggerUrl);
                    await new Promise(r => ws.on('open', r));
                    let id = 1;
                    const exceptions = [];
                    ws.on('message', m => {
                        const d = JSON.parse(m.toString());
                        if (d.method === 'Runtime.exceptionThrown') {
                            exceptions.push(d.params.exceptionDetails.text + ' ' + (d.params.exceptionDetails.exception?.description || ''));
                        }
                    });
                    const call = (method, params = {}) =>
                        new Promise(resolve => {
                            const cur = id++;
                            const handler = m => {
                                const d = JSON.parse(m.toString());
                                if (d.id === cur) {
                                    ws.off('message', handler);
                                    resolve(d.result);
                                }
                            };
                            ws.on('message', handler);
                            ws.send(JSON.stringify({ id: cur, method, params }));
                        });
                    await call('Runtime.enable');
                    await call('Page.reload');
                    await new Promise(r => setTimeout(r, 1200));
                    const res = await call('Runtime.evaluate', { expression: evalExpr, awaitPromise: true, returnByValue: true });
                    if (res?.exceptionDetails) {
                        exceptions.push(res.exceptionDetails.text + ' ' + (res.exceptionDetails.exception?.description || ''));
                    }
                    ws.close();
                    return { exceptions, value: res?.result?.value };
                } finally {
                    chrome.kill();
                }
            };

            // 4A. Test Android Offline Asset Preview (file:///.../assets/www/index.html) on 360x800 narrow handset viewport
            const assetUrl = 'file:///' + join(ROOT_DIR, 'android/app/src/main/assets/www/index.html').replace(/\\/g, '/');
            const offlineCheck = await verifyPageInChrome(
                assetUrl,
                9446,
                `(async () => {
                    const initialModelText = document.getElementById('modelText')?.textContent?.trim() || '';
                    document.getElementById('modelBtn').click();
                    const modelItems = Array.from(document.querySelectorAll('[data-testid="model-selector-item"]')).map(el => el.textContent.trim());
                    const getFamilyCard = name =>
                        Array.from(document.querySelectorAll('.model-family-card')).find(
                            c => c.querySelector('.model-family-name span:first-child')?.textContent?.trim() === name
                        );
                    const neonCard = getFamilyCard('Gemini 4 Neon');
                    const orchCard = getFamilyCard('Orchestrator');
                    const carbonCard = getFamilyCard('Gemini 4 Carbon');
                    const offlineNeonPills = Array.from(neonCard?.querySelectorAll('[data-testid="model-selector-item"]') || []).map(el => el.textContent.trim());
                    const offlineOrchPills = Array.from(orchCard?.querySelectorAll('[data-testid="model-selector-item"]') || []).map(el => el.textContent.trim());
                    const offlineHasNeonDesc = Boolean(neonCard?.querySelector('.model-family-desc')?.textContent?.trim());
                    const offlineCarbonBtn = carbonCard?.querySelector('[data-testid="model-selector-item"]');
                    const offlineCarbonDisabledOk = Boolean(
                        carbonCard?.classList.contains('is-disabled') &&
                        carbonCard?.querySelector('.model-tag-pill.unavailable')?.textContent?.trim() === 'Unavailable' &&
                        offlineCarbonBtn?.disabled === true &&
                        offlineCarbonBtn?.getAttribute('aria-disabled') === 'true'
                    );
                    carbonCard?.click();
                    const toastAfterCarbonClick = document.getElementById('appToast')?.textContent || '';
                    const modelAfterCarbonClick = currentModel;
                    document.getElementById('closeModalBtn').click();

                    // Verify /model slash control offline (neon xhigh, orchestrator neon, blocked carbon, restore neon high)
                    const inputEl = document.getElementById('messageInput');
                    const sendBtnEl = document.getElementById('sendBtn');
                    inputEl.value = '/model neon xhigh';
                    sendBtnEl.click();
                    await new Promise(r => setTimeout(r, 60));
                    const offlineSlashNeonXHighText = document.getElementById('modelText')?.textContent?.trim() || '';

                    inputEl.value = '/model orchestrator neon';
                    sendBtnEl.click();
                    await new Promise(r => setTimeout(r, 60));
                    const offlineSlashOrchNeonText = document.getElementById('modelText')?.textContent?.trim() || '';

                    inputEl.value = '/model carbon high';
                    sendBtnEl.click();
                    await new Promise(r => setTimeout(r, 60));
                    const offlineSlashCarbonKeptModel =
                        document.getElementById('modalOverlay')?.classList.contains('show')
                            ? 'MODAL_OPENED_ERR'
                            : currentModel;

                    inputEl.value = '/model neon high';
                    sendBtnEl.click();
                    await new Promise(r => setTimeout(r, 60));
                    const offlineRestoredNeonHighText = document.getElementById('modelText')?.textContent?.trim() || '';

                    // Verify 3-group quota modal in offline preview
                    document.getElementById('quotaPillBtn')?.click();
                    await new Promise(r => setTimeout(r, 60));
                    const offlineQuotaGroupTitles = Array.from(
                        document.querySelectorAll('#modalList [data-testid="quota-group-card"] .quota-group-title')
                    ).map(el => el.textContent.trim());
                    document.getElementById('closeModalBtn').click();

                    const clearAllDraftQuotes = () => {
                        let rmBtn;
                        while ((rmBtn = document.querySelector('[data-quote-remove]'))) rmBtn.click();
                    };

                    // 1. Verify single-quote button immediately displays & focuses specific answer input
                    const quoteBtn = document.querySelector('[data-testid="quote-response-btn"]');
                    const hasQuoteBtn = !!quoteBtn;
                    let singleQuoteInputShown = false;
                    if (quoteBtn) {
                        quoteBtn.click();
                        const singleAnsEl = document.querySelector('[data-testid="composer-quote-card"] .quote-draft-answer-input');
                        singleQuoteInputShown = !!singleAnsEl && getComputedStyle(singleAnsEl).display !== 'none';
                        clearAllDraftQuotes();
                    }

                    // 2. Verify structured table & list extraction + Quote Parts empty-answer guard + multi-quote insertion
                    const mdBody = document.querySelector('#chatContent .agy-ai-turn .agy-markdown-body');
                    const targetTurn = mdBody?.closest('.agy-ai-turn');
                    if (mdBody) {
                        const tbl = document.createElement('table');
                        tbl.className = 'agy-md-table';
                        tbl.innerHTML = '<thead><tr><th>ColA</th><th>ColB</th></tr></thead><tbody><tr><td>Val1</td><td>Val2</td></tr></tbody>';
                        const ul = document.createElement('ul');
                        ul.innerHTML = '<li>Item 1</li><li>Item 2</li>';
                        mdBody.appendChild(tbl);
                        mdBody.appendChild(ul);
                    }

                    // Full-turn Quote & Reply must serialize table cells with " | " and list items with "• ...\\n• ..."
                    const turnQuoteBtn = targetTurn?.querySelector('[data-testid="quote-response-btn"]');
                    let fullTurnStructuredOk = false;
                    if (turnQuoteBtn) {
                        turnQuoteBtn.click();
                        const fullQuotedText = document.querySelector('[data-testid="composer-quote-card"] .quote-draft-text')?.textContent || '';
                        fullTurnStructuredOk =
                            fullQuotedText.includes('ColA | ColB\\nVal1 | Val2') &&
                            fullQuotedText.includes('• Item 1\\n• Item 2');
                        clearAllDraftQuotes();
                    }

                    const partsBtn = targetTurn?.querySelector('[data-testid="quote-parts-btn"]');
                    let addedQuoteCards = 0;
                    let emptySendBlocked = false;
                    let tablePartSerializedOk = false;
                    let listPartSerializedOk = false;
                    if (partsBtn) {
                        partsBtn.click();
                        const partPreviews = Array.from(document.querySelectorAll('#quotePartsList .quote-part-excerpt')).map(el => el.textContent);
                        tablePartSerializedOk = partPreviews.some(t => t.includes('ColA | ColB\\nVal1 | Val2'));
                        listPartSerializedOk =
                            partPreviews.some(t => t.trim() === '• Item 1') &&
                            partPreviews.some(t => t.trim() === '• Item 2') &&
                            fullTurnStructuredOk;

                        const partRows = document.querySelectorAll('[data-toggle-part]');
                        if (partRows[0]) partRows[0].click();
                        // Empty specific answer & empty messageInput must block #quotePartsSendBtn from closing/sending blank turn
                        document.getElementById('messageInput').value = '';
                        document.getElementById('quotePartsSendBtn').click();
                        emptySendBlocked = document.getElementById('quotePartsOverlay').classList.contains('show');

                        if (partRows[1]) partRows[1].click();
                        const ans0 = document.querySelector('[data-part-answer="0"]');
                        if (ans0) {
                            ans0.value = 'Specific offline answer 1';
                            ans0.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        document.getElementById('quotePartsInsertBtn').click();
                        addedQuoteCards = document.querySelectorAll('[data-testid="composer-quote-card"]').length;
                    }

                    // 3. Verify 360px code-block toolbar does NOT overlap line 1 of code & codeViewerQuoteBtn works
                    let codeToolbarNonOverlapping = false;
                    let codeViewerQuotedOk = false;
                    const preEl = Array.from(document.querySelectorAll('#chatContent pre')).find(p => p.querySelector('.code-block-toolbar'));
                    const toolbarEl = preEl?.querySelector('.code-block-toolbar');
                    const codeEl = preEl?.querySelector('code');
                    if (toolbarEl && codeEl) {
                        const tbRect = toolbarEl.getBoundingClientRect();
                        const codeRect = codeEl.getBoundingClientRect();
                        codeToolbarNonOverlapping = tbRect.bottom <= codeRect.top + 1;
                        preEl.querySelector('.code-expand-btn')?.click();
                        clearAllDraftQuotes();
                        document.getElementById('codeViewerQuoteBtn')?.click();
                        codeViewerQuotedOk = document.querySelectorAll('[data-testid="composer-quote-card"]').length === 1;
                        clearAllDraftQuotes();
                    }

                    // 4. Verify quick-strip / chip ordering & toggle (/boost then /swarm -> "/boost /swarm ", tap /swarm again -> "/boost ")
                    const input = document.getElementById('messageInput');
                    input.value = '';
                    const boostChip = document.querySelector('.quick-actions [data-action="/boost"]');
                    const swarmChip = document.querySelector('.quick-actions [data-action="/swarm"]');
                    boostChip?.click();
                    swarmChip?.click();
                    const afterBoostThenSwarm = input.value;
                    const bothChipsActive = !!(boostChip?.classList.contains('is-active') && swarmChip?.classList.contains('is-active'));
                    swarmChip?.click();
                    const afterToggleOffSwarm = input.value;

                    // 5. Test Slash Catalog Sheet & uncapped / autocomplete offline
                    document.getElementById('slashBtn').click();
                    const slashSheetCount = document.querySelectorAll('[data-testid="slash-sheet-item"]').length;
                    document.getElementById('closeModalBtn').click();

                    input.value = '/';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    const slashPopupItems = document.querySelectorAll('#slashMenuPopup .slash-menu-item').length;
                    const slashVisible = document.getElementById('slashMenuPopup')?.style.display !== 'none';
                    input.value = '';
                    input.dispatchEvent(new Event('input', { bubbles: true }));

                    // 6. Verify 360px surface-mode-bar zero horizontal overflow/badge clipping + ordered list indentation + thought-only turn skip + Offline Swarm UI across all 5 subtabs!
                    const testOl = document.createElement('ol');
                    testOl.innerHTML = '<li>Ordered One</li><li>Ordered Two</li>';
                    mdBody?.appendChild(testOl);
                    const olPaddingLeftPx = testOl ? parseFloat(getComputedStyle(testOl).paddingLeft || '0') : 0;

                    const thoughtOnlyEl = document.createElement('article');
                    thoughtOnlyEl.className = 'agy-turn agy-ai-turn';
                    thoughtOnlyEl.innerHTML =
                        '<div class="agy-model-meta">Orchestrator (Neon)</div><details class="agy-thought-accordion"><summary class="agy-thought-summary">Thought process</summary><div class="agy-thought-body">Internal</div></details>';
                    document.querySelector('#cascade')?.appendChild(thoughtOnlyEl);
                    setupMessageCopyButtons();
                    const thoughtOnlySkippedOk = thoughtOnlyEl.querySelectorAll('.agy-turn-actions').length === 0;
                    thoughtOnlyEl.remove();

                    const swBadgeEl = document.getElementById('swarmNavBadge');
                    const ideBadgeEl = document.getElementById('ideChangedBadge');
                    if (swBadgeEl) {
                        swBadgeEl.style.display = 'inline-block';
                        swBadgeEl.classList.add('active-work');
                        swBadgeEl.textContent = '1⚡';
                    }
                    if (ideBadgeEl) {
                        ideBadgeEl.style.display = 'inline-block';
                        ideBadgeEl.textContent = '6';
                    }
                    const segWrap = document.querySelector('.surface-segmented');
                    const ideBtnEl = document.getElementById('switchIdeBtn');
                    const segRect = segWrap?.getBoundingClientRect();
                    const ideRect = ideBtnEl?.getBoundingClientRect();
                    const ideBadgeFitsSegmented360 = Boolean(segRect && ideRect && ideRect.right <= segRect.right + 1);

                    const modeBar = document.getElementById('surfaceModeBar');
                    const modeBarFits360 = !!modeBar && modeBar.scrollWidth <= window.innerWidth + 1;

                    const inlineOpenSwarmBtn = document.querySelector('[data-testid="inline-open-swarm-btn"]');
                    inlineOpenSwarmBtn?.click();
                    const swarmVisibleAfterPill = getComputedStyle(document.getElementById('swarmContainer')).display !== 'none';
                    const swarmGoalRendered = !!document.querySelector('[data-testid="swarm-overview-goal"]');
                    const swarmWorkstreamCount = document.querySelectorAll('[data-testid="swarm-workstream-row"]').length;

                    // Verify Pixel-Bee canvas drew non-zero RGBA pixels & maintains 1:1 square aspect ratio
                    let beeCanvasHasPixels = false;
                    let beeCanvasSquareAspect = false;
                    const beeCanvas = document.querySelector('#swarmContainer canvas.sw-bee-f0');
                    if (beeCanvas) {
                        const rect = beeCanvas.getBoundingClientRect();
                        beeCanvasSquareAspect = rect.width > 0 && Math.abs(rect.width - rect.height) <= 0.5;
                        const ctx = beeCanvas.getContext('2d');
                        const img = ctx.getImageData(0, 0, beeCanvas.width, beeCanvas.height).data;
                        for (let i = 3; i < img.length; i += 4) {
                            if (img[i] > 0) { beeCanvasHasPixels = true; break; }
                        }
                    }

                    // Board tab: search focus preservation + #seq citation jump
                    document.querySelector('[data-testid="swarm-tab-feed"]')?.click();
                    const boardPostsCount = document.querySelectorAll('[data-testid="swarm-post-card"]').length;
                    const boardSearch = document.getElementById('swarmBoardSearchInput');
                    let searchKeptFocus = false;
                    if (boardSearch) {
                        boardSearch.focus();
                        boardSearch.value = 'verifier';
                        boardSearch.dispatchEvent(new Event('input', { bubbles: true }));
                        searchKeptFocus = document.activeElement === boardSearch;
                        boardSearch.value = '';
                        boardSearch.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    const citePill = document.querySelector('#swarmBodyScroll .sw-seq-cite-pill[data-jump-seq]');
                    let seqCiteFlashed = false;
                    if (citePill) {
                        const targetSeq = citePill.getAttribute('data-jump-seq');
                        citePill.click();
                        seqCiteFlashed = !!document.querySelector(\`[data-post-seq="\${targetSeq}"].flash-seq\`);
                    }

                    // Members tab: retired toggle
                    document.querySelector('[data-testid="swarm-tab-members"]')?.click();
                    const activeMemberCards = document.querySelectorAll('[data-testid="swarm-member-card"]').length;
                    document.querySelector('[data-testid="swarm-show-retired-btn"]')?.click();
                    const withRetiredMemberCards = document.querySelectorAll('[data-testid="swarm-member-card"]').length;

                    // Graph tab: SVG nodes & edges + Expand @all
                    document.querySelector('[data-testid="swarm-tab-graph"]')?.click();
                    const graphNodesCount = document.querySelectorAll('[data-testid="swarm-graph-svg"] .sw-graph-node').length;
                    const graphEdgesCount = document.querySelectorAll('[data-testid="swarm-graph-svg"] .sw-graph-edge').length;

                    // Raw tab: members.json + swarm.json
                    document.querySelector('[data-testid="swarm-tab-raw"]')?.click();
                    const rawText = document.querySelector('[data-testid="swarm-raw"]')?.textContent || '';
                    const rawHasMembers = rawText.includes('Antigravity Mobile Swarm');
                    const rawHasSwarmBtn = !!document.querySelector('[data-raw-file="swarm"]');

                    // Adversarial Swarm UI Edge-Case Suite (Overview attention title/why, Board control + unread grouping + code/#0, @monitor role badge, Graph Expand @all, Gapped #seq replay, 16-worker non-overlap)
                    const advMembers = [
                        { name: 'coordinator', role: 'coordinator', status: 'waiting', last_read_seq: 9, steps: 10, posts: 2, killed: false },
                        { name: 'ui-viewer', role: 'worker', status: 'working', last_read_seq: 0, unread: 3, steps: 12, posts: 0, killed: false },
                        { name: 'verifier', role: 'worker', status: 'working', last_read_seq: 9, steps: 9, posts: 2, killed: false },
                        { name: 'monitor', role: 'monitor', roleWorker: true, status: 'waiting', last_read_seq: 0, steps: 2, posts: 0, killed: false },
                        ...Array.from({ length: 14 }, (_, k) => ({
                            name: \`worker-\${k + 1}\`,
                            role: 'worker',
                            status: k % 2 === 0 ? 'working' : 'waiting',
                            last_read_seq: 9,
                            steps: 4,
                            posts: 0,
                            killed: false
                        }))
                    ];
                    const advSnap = {
                        ...cachedSwarmSnapshot,
                        id: 'adv-swarm-test',
                        member: 'ui-viewer',
                        head: 9,
                        unseen: [2, 5, 9],
                        members: advMembers,
                        channels: [{ name: 'security', topic: 'Sec', archived: false }],
                        messages: [
                            { seq: 1, agent: 'coordinator', control: { action: 'create', channel: 'security', topic: 'Sec' }, time: '2026-11-18 09:00:00', ts: 1000 },
                            { seq: 2, agent: 'coordinator', channel: 'main', text: '@all Kickoff check \\x60#0 and @raw\\x60 vs #0', all: true, mentions: [], time: '2026-11-18 09:01:00', ts: 2000 },
                            { seq: 5, agent: 'verifier', channel: 'main', text: '@all First consecutive update', all: true, mentions: [], time: '2026-11-18 09:02:00', ts: 3000 },
                            { seq: 9, agent: 'verifier', channel: 'main', text: '@all Second consecutive update [done]', all: true, mentions: [], time: '2026-11-18 09:02:20', ts: 3020 }
                        ],
                        edges: [{ from: 'coordinator', to: 'verifier', count: 1, direct: 0, viaAll: 1 }],
                        systemAttention: [],
                        overview: {
                            goal: { title: 'Adversarial Edge Suite', line: 'Testing edge cases' },
                            counts: { total: 2, done: 1, running: 1, blocked: 0, queued: 0 },
                            attention: [{ id: 'att-1', kind: 'blocked', title: 'Approve Migration', why: 'Schema v4 ready', post: 5 }],
                            workstreams: [{ id: 'w1', title: 'UI Stream', state: 'running', owners: ['ui-viewer'] }]
                        }
                    };
                    cachedSwarmSnapshot = advSnap;
                    renderSwarmTopChrome(advSnap);

                    // Check 1: Overview renders narrator attention title & why (not generic fallback)
                    setSwarmSubtab('overview');
                    const advAlertText = document.querySelector('[data-testid="swarm-alerts-strip"]')?.textContent || '';
                    const overviewNarratorAlertOk =
                        advAlertText.includes('Approve Migration') &&
                        advAlertText.includes('Schema v4 ready') &&
                        !advAlertText.includes('Blocked / awaiting reply');

                    // Check 2: Board renders control row (#1), single unread divider when last_read_seq === 0, preserves post grouping AFTER unread divider (#9 grouped with #5), protects inline code, and ignores #0
                    setSwarmSubtab('feed');
                    const hasControlRow = !!document.querySelector('[data-testid="swarm-control-message"][data-post-seq="1"]');
                    const unreadDividerCount = document.querySelectorAll('[data-testid="swarm-unread-divider"]').length;
                    const post9GroupedAfterUnread = !!document.querySelector('[data-post-seq="9"].grouped-followup');
                    const post2Html = document.querySelector('[data-post-seq="2"] .sw-post-body')?.innerHTML || '';
                    const inlineCodeProtectedAndNoZeroCite =
                        post2Html.includes('<code class="sw-inline-code">#0 and @raw</code>') &&
                        !post2Html.includes('data-jump-seq="0"');

                    // Check 3: Members count pill excludes @monitor roleWorker & @monitor renders Monitor badge
                    setSwarmSubtab('members');
                    const membersPillCount = Number(document.getElementById('swarmMembersCountPill')?.textContent || '0');
                    const monitorPillText = document.querySelector('[data-member-name="monitor"] .sw-role-pill')?.textContent?.trim() || '';
                    const monitorBadgeAndCountOk = membersPillCount === 17 && monitorPillText === 'Monitor';

                    // Check 4: Graph Expand @all toggle on @all-only messages + gapped #seq [2, 5, 9] replay + 17-node non-overlapping layout
                    swarmGraphExpandAll = false;
                    swarmGraphReplaySeq = null;
                    setSwarmSubtab('graph');
                    const edgesWhenExpandOff = document.querySelectorAll('[data-testid="swarm-graph-svg"] .sw-graph-edge').length;
                    const bcastBadgesWhenOff = document.querySelectorAll('[data-testid="swarm-graph-bcast-badge"]').length;
                    document.getElementById('swGraphExpandAllBtn')?.click();
                    const edgesWhenExpandOn = document.querySelectorAll('[data-testid="swarm-graph-svg"] .sw-graph-edge').length;
                    document.getElementById('swGraphExpandAllBtn')?.click();

                    document.getElementById('swGraphStartBtn')?.click();
                    const capStart = document.querySelector('[data-testid="swarm-graph-caption"]')?.textContent?.trim() || '';
                    document.getElementById('swGraphNextBtn')?.click();
                    const capNext1 = document.querySelector('[data-testid="swarm-graph-caption"]')?.textContent?.trim() || '';
                    document.getElementById('swGraphNextBtn')?.click();
                    const capNext2 = document.querySelector('[data-testid="swarm-graph-caption"]')?.textContent?.trim() || '';
                    document.getElementById('swGraphPrevBtn')?.click();
                    const capPrev = document.querySelector('[data-testid="swarm-graph-caption"]')?.textContent?.trim() || '';
                    const gappedReplayOk =
                        capStart.startsWith('#2 ') &&
                        capNext1.startsWith('#5 ') &&
                        capNext2.startsWith('#9 ') &&
                        capPrev.startsWith('#5 ');

                    const nodeCircles = Array.from(document.querySelectorAll('[data-testid="swarm-graph-svg"] .sw-graph-node > circle:first-of-type')).map(c => ({
                        x: Number(c.getAttribute('cx')),
                        y: Number(c.getAttribute('cy'))
                    }));
                    let minPairDist = Infinity;
                    for (let i = 0; i < nodeCircles.length; i++) {
                        for (let j = i + 1; j < nodeCircles.length; j++) {
                            const d = Math.hypot(nodeCircles[i].x - nodeCircles[j].x, nodeCircles[i].y - nodeCircles[j].y);
                            if (d < minPairDist) minPairDist = d;
                        }
                    }
                    const largeSwarmLayoutOk = nodeCircles.length === 17 && minPairDist >= 55;

                    // Check 5: setIdeSubtab('code') must NEVER strip .active from .swarm-subtab, and openChatFindBar from Swarm switches cleanly to Antigravity chat
                    document.getElementById('switchIdeBtn')?.click();
                    setIdeSubtab('code');
                    document.getElementById('switchSwarmBtn')?.click();
                    const activeSwarmSubtabsAfterIdeCode = document.querySelectorAll('.swarm-subtab.active').length;
                    openChatFindBar('Swarm');
                    const backInChat = getComputedStyle(document.getElementById('chatContainer')).display !== 'none';
                    closeChatFindBar();

                    // Check 6: Direct User Media Thumbnails & File Pills + Media Lightbox Modal + Clipboard Paste Disambiguation in Offline Preview
                    const mediaThumbEl = document.querySelector('[data-testid="user-media-thumb"]');
                    const mediaFileEl = document.querySelector('[data-testid="user-media-file"]');
                    const mediaThumbSizeOk = !!mediaThumbEl && Math.round(mediaThumbEl.getBoundingClientRect().width) === 96;
                    const mediaFileRenderedOk = !!mediaFileEl && mediaFileEl.classList.contains('is-pdf');
                    let mediaLightboxOpenedOk = false;
                    let mediaLightboxClosedOk = false;
                    let mediaFileLightboxOk = false;
                    if (mediaThumbEl) {
                        mediaThumbEl.click();
                        mediaLightboxOpenedOk = document.getElementById('mediaLightboxModal')?.classList.contains('show') === true;
                        document.getElementById('closeMediaLightboxBtn')?.click();
                        mediaLightboxClosedOk = document.getElementById('mediaLightboxModal')?.classList.contains('show') === false;
                    }
                    if (mediaFileEl) {
                        mediaFileEl.click();
                        mediaFileLightboxOk =
                            document.getElementById('mediaLightboxModal')?.classList.contains('show') === true &&
                            !!document.querySelector('[data-testid="media-lightbox-doc-card"]');
                        document.getElementById('closeMediaLightboxBtn')?.click();
                    }

                    // Synthetic clipboard paste with two identical "image.png" files -> disambiguated names & 2 chips
                    const dt = new DataTransfer();
                    dt.items.add(new File([new Uint8Array([137, 80, 78, 71])], 'image.png', { type: 'image/png' }));
                    dt.items.add(new File([new Uint8Array([137, 80, 78, 71])], 'image.png', { type: 'image/png' }));
                    const pasteEv = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
                    input.dispatchEvent(pasteEv);
                    await new Promise(r => setTimeout(r, 80));
                    const pastedChipNames = Array.from(document.querySelectorAll('#attachmentPreviewBar .attachment-chip-name')).map(el => el.textContent.trim());
                    const clipboardPasteDisambiguatedOk =
                        pastedChipNames.length === 2 &&
                        pastedChipNames[0] === 'image.png' &&
                        pastedChipNames[1] === 'image_2.png';
                    document.querySelectorAll('#attachmentPreviewBar [data-remove-idx]').forEach(btn => btn.click());

                    return {
                        statusText: document.getElementById('statusText')?.textContent,
                        offlineBannerVisible: document.getElementById('offlinePreviewBanner')?.style.display === 'flex',
                        hasSpinner: !!document.querySelector('#chatContent .loading-spinner'),
                        initialModelText,
                        modelItemCount: modelItems.length,
                        offlineNeonPills,
                        offlineOrchPills,
                        offlineHasNeonDesc,
                        offlineCarbonDisabledOk,
                        toastAfterCarbonClick,
                        modelAfterCarbonClick,
                        offlineSlashNeonXHighText,
                        offlineSlashOrchNeonText,
                        offlineSlashCarbonKeptModel,
                        offlineRestoredNeonHighText,
                        offlineQuotaGroupTitles,
                        hasSonnetAndOpus: modelItems.includes('Sonnet 4.6') && modelItems.includes('Opus 4.6'),
                        hasQuoteBtn,
                        singleQuoteInputShown,
                        tablePartSerializedOk,
                        listPartSerializedOk,
                        emptySendBlocked,
                        addedQuoteCards,
                        codeToolbarNonOverlapping,
                        codeViewerQuotedOk,
                        afterBoostThenSwarm,
                        bothChipsActive,
                        afterToggleOffSwarm,
                        slashSheetCount,
                        slashPopupItems,
                        slashVisible,
                        modeBarFits360,
                        ideBadgeFitsSegmented360,
                        olPaddingLeftPx,
                        thoughtOnlySkippedOk,
                        swarmVisibleAfterPill,
                        swarmGoalRendered,
                        swarmWorkstreamCount,
                        beeCanvasHasPixels,
                        beeCanvasSquareAspect,
                        boardPostsCount,
                        searchKeptFocus,
                        seqCiteFlashed,
                        activeMemberCards,
                        withRetiredMemberCards,
                        graphNodesCount,
                        graphEdgesCount,
                        rawHasMembers,
                        rawHasSwarmBtn,
                        overviewNarratorAlertOk,
                        hasControlRow,
                        unreadDividerCount,
                        post9GroupedAfterUnread,
                        inlineCodeProtectedAndNoZeroCite,
                        monitorBadgeAndCountOk,
                        edgesWhenExpandOff,
                        bcastBadgesWhenOff,
                        edgesWhenExpandOn,
                        gappedReplayOk,
                        largeSwarmLayoutOk,
                        activeSwarmSubtabsAfterIdeCode,
                        backInChat,
                        mediaThumbSizeOk,
                        mediaFileRenderedOk,
                        mediaLightboxOpenedOk,
                        mediaLightboxClosedOk,
                        mediaFileLightboxOk,
                        clipboardPasteDisambiguatedOk
                    };
                })()`
            );
            assert.equal(offlineCheck.exceptions.length, 0, `Expected 0 exceptions in offline preview, got: ${offlineCheck.exceptions.join('; ')}`);
            assert.equal(offlineCheck.value.statusText, 'Preview');
            assert.equal(offlineCheck.value.offlineBannerVisible, true);
            assert.equal(offlineCheck.value.hasSpinner, false);
            assert.equal(offlineCheck.value.initialModelText, 'Gemini 4 Neon (High)', 'Offline preview must start on Gemini 4 Neon (High)');
            assert.deepEqual(offlineCheck.value.offlineNeonPills, ['Low', 'Medium', 'High', 'XHigh'], 'Gemini 4 Neon pills must be ordered Low..XHigh');
            assert.deepEqual(offlineCheck.value.offlineOrchPills, ['Neon', 'Argon'], 'Orchestrator pills must show Neon before Argon');
            assert.equal(offlineCheck.value.offlineHasNeonDesc, true, 'Gemini 4 Neon card must display subtle family description');
            assert.equal(offlineCheck.value.offlineCarbonDisabledOk, true, 'Gemini 4 Carbon card/pill must be muted and disabled offline');
            assert.match(offlineCheck.value.toastAfterCarbonClick, /ultra|unavailable/i, 'Clicking disabled Carbon card must show unavailable toast');
            assert.equal(offlineCheck.value.modelAfterCarbonClick, 'Gemini 4 Neon (High)', 'Clicking disabled Carbon must not mutate active model');
            assert.equal(offlineCheck.value.offlineSlashNeonXHighText, 'G4 Neon (XHigh)', '/model neon xhigh must switch model offline');
            assert.equal(offlineCheck.value.offlineSlashOrchNeonText, 'Orchestrator (Neon)', '/model orchestrator neon must switch model offline');
            assert.equal(offlineCheck.value.offlineSlashCarbonKeptModel, 'Orchestrator (Neon)', '/model carbon must be blocked offline');
            assert.equal(offlineCheck.value.offlineRestoredNeonHighText, 'G4 Neon (High)', '/model neon high must restore G4 Neon (High)');
            assert.deepEqual(
                offlineCheck.value.offlineQuotaGroupTitles,
                ['Gemini Models', 'Gemini 4 Argon', 'Claude and GPT models'],
                'Offline quota modal must render all 3 quota groups'
            );
            assert.equal(offlineCheck.value.hasSonnetAndOpus, true);
            assert.equal(offlineCheck.value.hasQuoteBtn, true, 'Expected Quote & Reply button in offline preview');
            assert.equal(offlineCheck.value.singleQuoteInputShown, true, 'Single quote card must display specific answer input');
            assert.equal(offlineCheck.value.tablePartSerializedOk, true, 'Table part extraction must preserve ColA | ColB delimiters & row newlines');
            assert.equal(offlineCheck.value.listPartSerializedOk, true, 'List part extraction must preserve • bullets & item newlines');
            assert.equal(offlineCheck.value.emptySendBlocked, true, 'Quote Parts Send button must guard against empty answers + empty message');
            assert.equal(offlineCheck.value.addedQuoteCards, 2, 'Expected 2 quote cards inserted from Quote Parts modal');
            assert.equal(offlineCheck.value.codeToolbarNonOverlapping, true, 'Code block toolbar must not overlap line 1 of code on 360px viewport');
            assert.equal(offlineCheck.value.codeViewerQuotedOk, true, 'Full-screen code viewer Quote button must quote code into composer');
            assert.equal(offlineCheck.value.afterBoostThenSwarm, '/boost /swarm ', 'Tapping /boost then /swarm must preserve tap order and trailing space');
            assert.equal(offlineCheck.value.bothChipsActive, true, 'Active leading / chips must highlight with .is-active');
            assert.equal(offlineCheck.value.afterToggleOffSwarm, '/boost ', 'Tapping active /swarm chip again must toggle it off cleanly');
            assert.ok(offlineCheck.value.slashSheetCount >= 20, `Expected >=20 offline slash actions in catalog sheet, got ${offlineCheck.value.slashSheetCount}`);
            assert.ok(offlineCheck.value.slashPopupItems >= 20, `Expected uncapped slash popup items (>=20), got ${offlineCheck.value.slashPopupItems}`);
            assert.equal(offlineCheck.value.slashVisible, true);
            assert.equal(offlineCheck.value.modeBarFits360, true, '#surfaceModeBar must fit cleanly on 360px viewport without horizontal overflow');
            assert.equal(offlineCheck.value.ideBadgeFitsSegmented360, true, '#switchIdeBtn with 1⚡ and 6 badges must not clip inside .surface-segmented on 360px viewport');
            assert.ok(offlineCheck.value.olPaddingLeftPx >= 24, `Expected .agy-markdown-body ol paddingLeft >= 24px, got ${offlineCheck.value.olPaddingLeftPx}`);
            assert.equal(offlineCheck.value.thoughtOnlySkippedOk, true, 'Thought-only .agy-ai-turn without .agy-markdown-body must not receive Quote/Copy action buttons');
            assert.equal(offlineCheck.value.swarmVisibleAfterPill, true, 'Clicking [Open the Swarm UI] pill must open #swarmContainer');
            assert.equal(offlineCheck.value.swarmGoalRendered, true, 'Swarm Overview must render mission goal & progress card');
            assert.ok(offlineCheck.value.swarmWorkstreamCount >= 3, 'Swarm Overview must render parallel workstreams');
            assert.equal(offlineCheck.value.beeCanvasHasPixels, true, 'Swarm Pixel-Bee <canvas> must render visible pixels');
            assert.equal(offlineCheck.value.beeCanvasSquareAspect, true, 'Swarm Pixel-Bee <canvas> must render square 1:1 pixels without 22x18 distortion');
            assert.ok(offlineCheck.value.boardPostsCount >= 5, 'Swarm Board must render shared board posts');
            assert.equal(offlineCheck.value.searchKeptFocus, true, 'Typing in Swarm Board search input must preserve focus');
            assert.equal(offlineCheck.value.seqCiteFlashed, true, 'Clicking #seq citation pill must jump & highlight target post');
            assert.ok(offlineCheck.value.withRetiredMemberCards > offlineCheck.value.activeMemberCards, 'Show retired button must reveal retired agents');
            assert.ok(offlineCheck.value.graphNodesCount >= 4 && offlineCheck.value.graphEdgesCount >= 3, 'Swarm Graph SVG must render member nodes & @mention edges');
            assert.equal(offlineCheck.value.rawHasMembers, true, 'Swarm Raw tab must display members.json content');
            assert.equal(offlineCheck.value.rawHasSwarmBtn, true, 'Swarm Raw tab must include swarm.json tab');
            assert.equal(offlineCheck.value.overviewNarratorAlertOk, true, 'Overview must render narrator attention title & why instead of generic fallback');
            assert.equal(offlineCheck.value.hasControlRow, true, 'Board must render channel control system rows with data-post-seq');
            assert.equal(offlineCheck.value.unreadDividerCount, 1, 'Board must render exactly 1 New Posts unread divider even when last_read_seq === 0');
            assert.equal(offlineCheck.value.post9GroupedAfterUnread, true, 'Consecutive posts after New Posts divider must still group');
            assert.equal(offlineCheck.value.inlineCodeProtectedAndNoZeroCite, true, 'Board post formatter must protect inline code and ignore #0');
            assert.equal(offlineCheck.value.monitorBadgeAndCountOk, true, 'Members tab must give @monitor a Monitor badge and exclude roleWorker from task member count pill');
            assert.equal(offlineCheck.value.edgesWhenExpandOff, 0, 'Graph Expand @all OFF must show 0 edges on @all-only board');
            assert.ok(offlineCheck.value.bcastBadgesWhenOff >= 2, 'Graph Expand @all OFF must render @all×N badges on broadcasting nodes');
            assert.ok(offlineCheck.value.edgesWhenExpandOn >= 16, 'Graph Expand @all ON must expand @all broadcast edges');
            assert.equal(offlineCheck.value.gappedReplayOk, true, 'Graph Replay Prev/Next must step cleanly across gapped #seq numbers [2, 5, 9]');
            assert.equal(offlineCheck.value.largeSwarmLayoutOk, true, '17-node Swarm Graph must use multi-row layout with >=55px node spacing on 360px viewport');
            assert.equal(offlineCheck.value.activeSwarmSubtabsAfterIdeCode, 1, 'setIdeSubtab("code") must NOT strip .active from .swarm-subtab');
            assert.equal(offlineCheck.value.backInChat, true, 'openChatFindBar while on Swarm must switch back to #chatContainer');
            assert.equal(offlineCheck.value.mediaThumbSizeOk, true, 'User media thumbnail must render 96x96 styled card');
            assert.equal(offlineCheck.value.mediaFileRenderedOk, true, 'User media PDF file pill must render with .is-pdf accent');
            assert.equal(offlineCheck.value.mediaLightboxOpenedOk, true, 'Clicking user media thumbnail must open #mediaLightboxModal');
            assert.equal(offlineCheck.value.mediaLightboxClosedOk, true, 'Clicking close button must dismiss #mediaLightboxModal');
            assert.equal(offlineCheck.value.mediaFileLightboxOk, true, 'Clicking user media PDF pill must open #mediaLightboxModal document card');
            assert.equal(offlineCheck.value.clipboardPasteDisambiguatedOk, true, 'Pasting two image.png files from clipboard must disambiguate names to image.png and image_2.png');
            console.log('✔ Verified Android Offline Preview on 360x800 Chrome (Quotes, Chips, 3-way Switcher, and all 5 Swarm UI tabs w/ Pixel-Bee canvas & SVG Graph)');

            // 4B. Test Live Server Mobile UI in Chrome (360x800)
            const liveCheck = await verifyPageInChrome(
                `http://127.0.0.1:${TEST_PORT}/`,
                9447,
                `(async () => {
                    const waitUntil = async (fn, timeoutMs = 2000) => {
                        const start = Date.now();
                        while (Date.now() - start < timeoutMs) {
                            const v = fn();
                            if (v) return v;
                            await new Promise(r => setTimeout(r, 40));
                        }
                        return fn();
                    };

                    await waitUntil(() => document.getElementById('statusText')?.textContent === 'Live' && (document.getElementById('modelText')?.textContent || '').includes('Neon'), 2500);
                    const liveInitialModelText = document.getElementById('modelText')?.textContent?.trim() || '';

                    document.getElementById('modelBtn').click();
                    await waitUntil(() => document.getElementById('modalOverlay')?.classList.contains('show') && document.querySelectorAll('[data-testid="model-selector-item"]').length >= 10, 2000);
                    const modelItems = Array.from(document.querySelectorAll('[data-testid="model-selector-item"]')).map(el => el.textContent.trim());
                    const familyNames = Array.from(document.querySelectorAll('.model-family-name span:first-child')).map(el => el.textContent.trim());
                    const getLiveFamilyCard = name =>
                        Array.from(document.querySelectorAll('.model-family-card')).find(
                            c => c.querySelector('.model-family-name span:first-child')?.textContent?.trim() === name
                        );
                    const liveNeonCard = getLiveFamilyCard('Gemini 4 Neon');
                    const liveOrchCard = getLiveFamilyCard('Orchestrator');
                    const liveCarbonCard = getLiveFamilyCard('Gemini 4 Carbon');
                    const liveNeonPills = Array.from(liveNeonCard?.querySelectorAll('[data-testid="model-selector-item"]') || []).map(el => el.textContent.trim());
                    const liveOrchPills = Array.from(liveOrchCard?.querySelectorAll('[data-testid="model-selector-item"]') || []).map(el => el.textContent.trim());
                    const liveCarbonBtn = liveCarbonCard?.querySelector('[data-testid="model-selector-item"]');
                    const liveCarbonDisabledOk = Boolean(
                        liveCarbonCard?.classList.contains('is-disabled') &&
                        liveCarbonCard?.querySelector('.model-tag-pill.unavailable')?.textContent?.trim() === 'Unavailable' &&
                        liveCarbonBtn?.disabled === true &&
                        liveCarbonBtn?.getAttribute('aria-disabled') === 'true'
                    );
                    liveCarbonCard?.click();
                    const liveModelAfterCarbonClick = document.getElementById('modelText')?.textContent?.trim() || '';
                    const hasSonnetAndOpus =
                        (modelItems.includes('Sonnet 4.6') && modelItems.includes('Opus 4.6')) ||
                        (familyNames.includes('Claude Sonnet 5.5') && familyNames.includes('Claude Opus 5.5'));
                    document.getElementById('closeModalBtn').click();

                    // Verify live /model neon xhigh, /model orchestrator neon, /model carbon (blocked), /model neon high
                    const input = document.getElementById('messageInput');
                    input.value = '/model neon xhigh';
                    document.getElementById('sendBtn').click();
                    const liveSlashNeonXHighText = (await waitUntil(() => {
                        const t = document.getElementById('modelText')?.textContent?.trim();
                        return t === 'G4 Neon (XHigh)' ? t : null;
                    }, 2000)) || (document.getElementById('modelText')?.textContent?.trim() || '');

                    input.value = '/model orchestrator neon';
                    document.getElementById('sendBtn').click();
                    const liveSlashOrchNeonText = (await waitUntil(() => {
                        const t = document.getElementById('modelText')?.textContent?.trim();
                        return t === 'Orchestrator (Neon)' ? t : null;
                    }, 2000)) || (document.getElementById('modelText')?.textContent?.trim() || '');

                    input.value = '/model carbon high';
                    document.getElementById('sendBtn').click();
                    await new Promise(r => setTimeout(r, 150));
                    const liveSlashCarbonKeptText =
                        document.getElementById('modalOverlay')?.classList.contains('show')
                            ? 'MODAL_OPENED_ERR'
                            : (document.getElementById('modelText')?.textContent?.trim() || '');

                    input.value = '/model neon high';
                    document.getElementById('sendBtn').click();
                    const liveRestoredNeonHighText = (await waitUntil(() => {
                        const t = document.getElementById('modelText')?.textContent?.trim();
                        return t === 'G4 Neon (High)' ? t : null;
                    }, 2000)) || (document.getElementById('modelText')?.textContent?.trim() || '');

                    // Verify live uncapped / autocomplete popup (>25 items, incl. /btw & /fast)
                    input.value = '/';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    const popupText = document.getElementById('slashMenuPopup')?.textContent || '';
                    const liveSlashPopupCount = document.querySelectorAll('#slashMenuPopup .slash-menu-item').length;
                    const popupHasBtwAndFast = popupText.includes('/btw') && popupText.includes('/fast');

                    // Verify full / Actions Sheet & Plugin category tab
                    document.getElementById('slashBtn').click();
                    await new Promise(r => setTimeout(r, 300));
                    const pluginTab = document.querySelector('[data-slash-cat="Plugin"]');
                    let pluginSheetCount = 0;
                    if (pluginTab) {
                        pluginTab.click();
                        pluginSheetCount = document.querySelectorAll('[data-testid="slash-sheet-item"]').length;
                    }
                    document.getElementById('closeModalBtn').click();

                    // Verify client /theme & /fast slash command execution
                    input.value = '/theme light';
                    document.getElementById('sendBtn').click();
                    await new Promise(r => setTimeout(r, 120));
                    const switchedLight = document.body.classList.contains('theme-light');
                    input.value = '/theme dark';
                    document.getElementById('sendBtn').click();
                    await new Promise(r => setTimeout(r, 120));
                    const switchedBackDark = document.body.classList.contains('theme-dark');

                    const clearLiveDraftQuotes = () => {
                        let rmBtn;
                        while ((rmBtn = document.querySelector('[data-quote-remove]'))) rmBtn.click();
                    };

                    input.value = '/fast';
                    document.getElementById('sendBtn').click();
                    await new Promise(r => setTimeout(r, 250));
                    const fastModeApplied = document.getElementById('modeText')?.textContent === 'Fast';
                    input.value = '/mode Agent';
                    document.getElementById('sendBtn').click();
                    await new Promise(r => setTimeout(r, 250));
                    const agentModeRestored = document.getElementById('modeText')?.textContent === 'Agent';

                    // Verify realistic mobile touch race on #composerSelectionQuoteBtn (touchstart -> WebView selection collapse -> 120ms tap -> click)
                    let mobileTouchRaceQuoted = false;
                    let nativeActionModeBtwOk = false;
                    const pNode = document.querySelector('#chatContent p, #chatContent .agy-markdown-body, #chatContent h2');
                    if (pNode && pNode.firstChild) {
                        const range = document.createRange();
                        range.selectNodeContents(pNode);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                        document.dispatchEvent(new Event('selectionchange'));
                        await new Promise(r => setTimeout(r, 150));
                        const qBtn = document.getElementById('composerSelectionQuoteBtn');
                        qBtn.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
                        sel.removeAllRanges();
                        document.dispatchEvent(new Event('selectionchange'));
                        await new Promise(r => setTimeout(r, 120));
                        qBtn.click();
                        mobileTouchRaceQuoted = document.querySelectorAll('[data-testid="composer-quote-card"]').length === 1;
                        clearLiveDraftQuotes();

                        // Also verify Android QuotableWebView native ActionMode bridge window.__quoteNativeSelection('btw')
                        const range2 = document.createRange();
                        range2.selectNodeContents(pNode);
                        sel.removeAllRanges();
                        sel.addRange(range2);
                        const nativeRes = window.__quoteNativeSelection('btw');
                        nativeActionModeBtwOk =
                            nativeRes === true &&
                            document.querySelectorAll('[data-testid="composer-quote-card"]').length === 1 &&
                            input.value.startsWith('/btw ');
                        clearLiveDraftQuotes();
                        input.value = '';
                    }

                    document.getElementById('historyBtn').click();
                    await new Promise(r => setTimeout(r, 450));
                    const historyCards = document.querySelectorAll('#historyList .history-card').length;
                    document.getElementById('closeSidebarBtn')?.click();

                    // Verify Weekly Quota Modal on live server (3-group breakdown + Context Window)
                    document.getElementById('quotaPillBtn')?.click();
                    await waitUntil(() => document.querySelector('[data-testid="quota-breakdown-sheet"]'), 2000);
                    const quotaModalHtml = document.getElementById('modalList')?.innerHTML || '';
                    const liveQuotaGroupTitles = Array.from(
                        document.querySelectorAll('#modalList [data-testid="quota-group-card"] .quota-group-title')
                    ).map(el => el.textContent.trim());
                    const quotaModalRendered = quotaModalHtml.includes('Weekly') && quotaModalHtml.includes('Context Window');
                    document.getElementById('closeModalBtn')?.click();

                    // Verify Antigravity IDE Workspace Section (Explorer -> open package.json -> line-range quote into composer)
                    document.getElementById('switchIdeBtn')?.click();
                    await new Promise(r => setTimeout(r, 550));
                    const ideVisible = getComputedStyle(document.getElementById('ideContainer')).display !== 'none';
                    const pkgFileRow = Array.from(document.querySelectorAll('#ideBodyScroll [data-ide-entry-path]')).find(el =>
                        (el.getAttribute('data-ide-entry-path') || '').endsWith('package.json')
                    );
                    let ideLineQuoteOk = false;
                    if (pkgFileRow) {
                        pkgFileRow.click();
                        await new Promise(r => setTimeout(r, 450));
                        document.querySelector('#ideBodyScroll [data-ide-line="1"]')?.click();
                        document.querySelector('#ideBodyScroll [data-ide-line="3"]')?.click();
                        document.getElementById('ideQuoteToAgentBtn')?.click();
                        await new Promise(r => setTimeout(r, 150));
                        ideLineQuoteOk =
                            getComputedStyle(document.getElementById('chatContainer')).display !== 'none' &&
                            document.querySelectorAll('[data-testid="composer-quote-card"]').length === 1;
                        clearLiveDraftQuotes();
                    }

                    // Verify Live Swarm UI Section (either active swarm or picking a real PC swarm from Recent Swarms / Selector)
                    document.getElementById('switchSwarmBtn')?.click();
                    await new Promise(r => setTimeout(r, 550));
                    const liveSwarmSectionVisible = getComputedStyle(document.getElementById('swarmContainer')).display !== 'none';
                    const liveActiveSwarmSubtabCount = document.querySelectorAll('.swarm-subtab.active').length;
                    const pickRecentBtn = document.querySelector('[data-testid="pick-recent-swarm-btn"]');
                    if (pickRecentBtn) {
                        pickRecentBtn.click();
                        await new Promise(r => setTimeout(r, 500));
                    }
                    const liveSwarmRendered = Boolean(
                        document.querySelector('[data-testid="swarm-overview-goal"]') ||
                        document.querySelector('[data-testid="swarm-empty-state"]')
                    );
                    let liveSwarmQuoteOk = false;
                    if (document.querySelector('[data-testid="swarm-overview-goal"]')) {
                        document.querySelector('[data-testid="swarm-tab-feed"]')?.click();
                        await new Promise(r => setTimeout(r, 150));
                        const qPostBtn = document.querySelector('[data-testid="swarm-quote-post-btn"]');
                        if (qPostBtn) {
                            qPostBtn.click();
                            await new Promise(r => setTimeout(r, 350));
                            liveSwarmQuoteOk = document.querySelectorAll('[data-testid="composer-quote-card"]').length === 1;
                            clearLiveDraftQuotes();
                        }
                    } else {
                        liveSwarmQuoteOk = true;
                        document.getElementById('switchNormalBtn')?.click();
                    }

                    // Verify QoL /find in-conversation search bar
                    document.getElementById('switchNormalBtn')?.click();
                    document.getElementById('chatFindToggleBtn')?.click();
                    const findBarShown = document.getElementById('chatFindBar')?.style.display !== 'none';
                    document.getElementById('chatFindCloseBtn')?.click();

                    return {
                        statusText: document.getElementById('statusText')?.textContent,
                        hasStream: !!document.querySelector('#chatContent .agy-hub-stream'),
                        liveInitialModelText,
                        modelItemCount: modelItems.length,
                        liveNeonPills,
                        liveOrchPills,
                        liveCarbonDisabledOk,
                        liveModelAfterCarbonClick,
                        liveSlashNeonXHighText,
                        liveSlashOrchNeonText,
                        liveSlashCarbonKeptText,
                        liveRestoredNeonHighText,
                        liveQuotaGroupTitles,
                        hasSonnetAndOpus,
                        liveSlashPopupCount,
                        popupHasBtwAndFast,
                        pluginSheetCount,
                        switchedLight,
                        switchedBackDark,
                        fastModeApplied,
                        agentModeRestored,
                        mobileTouchRaceQuoted,
                        nativeActionModeBtwOk,
                        historyCards,
                        quotaModalRendered,
                        ideVisible,
                        ideLineQuoteOk,
                        liveSwarmSectionVisible,
                        liveActiveSwarmSubtabCount,
                        liveSwarmRendered,
                        liveSwarmQuoteOk,
                        findBarShown
                    };
                })()`
            );
            assert.equal(liveCheck.exceptions.length, 0, `Expected 0 exceptions on live mobile UI, got: ${liveCheck.exceptions.join('; ')}`);
            assert.equal(liveCheck.value.statusText, 'Live');
            assert.equal(liveCheck.value.hasStream, true);
            assert.equal(liveCheck.value.liveInitialModelText, 'G4 Neon (High)', 'Live UI must display G4 Neon (High) after default restore');
            assert.ok(liveCheck.value.modelItemCount >= 18);
            assert.deepEqual(liveCheck.value.liveNeonPills, ['Low', 'Medium', 'High', 'XHigh'], 'Live Gemini 4 Neon pills must be ordered Low..XHigh');
            assert.deepEqual(liveCheck.value.liveOrchPills, ['Neon', 'Argon'], 'Live Orchestrator pills must order Neon before Argon');
            assert.equal(liveCheck.value.liveCarbonDisabledOk, true, 'Live Gemini 4 Carbon card/pill must be muted and disabled');
            assert.equal(liveCheck.value.liveModelAfterCarbonClick, 'G4 Neon (High)', 'Clicking disabled Carbon live must not mutate active model');
            assert.equal(liveCheck.value.liveSlashNeonXHighText, 'G4 Neon (XHigh)', 'Live /model neon xhigh must switch model');
            assert.equal(liveCheck.value.liveSlashOrchNeonText, 'Orchestrator (Neon)', 'Live /model orchestrator neon must switch model');
            assert.equal(liveCheck.value.liveSlashCarbonKeptText, 'Orchestrator (Neon)', 'Live /model carbon must be blocked without mutating model');
            assert.equal(liveCheck.value.liveRestoredNeonHighText, 'G4 Neon (High)', 'Live /model neon high must restore G4 Neon (High)');
            assert.deepEqual(
                [...liveCheck.value.liveQuotaGroupTitles].sort(),
                ['Claude and GPT models', 'Gemini 4 Argon', 'Gemini Models'],
                'Live quota modal must display all 3 quota groups'
            );
            assert.equal(liveCheck.value.hasSonnetAndOpus, true);
            assert.ok(liveCheck.value.liveSlashPopupCount >= 25, `Expected uncapped live / popup (>=25), got ${liveCheck.value.liveSlashPopupCount}`);
            assert.equal(liveCheck.value.popupHasBtwAndFast, true, 'Expected /btw and /fast in live / autocomplete');
            assert.ok(liveCheck.value.pluginSheetCount >= 1, `Expected >=1 plugin skill in Plugin tab, got ${liveCheck.value.pluginSheetCount}`);
            assert.equal(liveCheck.value.switchedLight, true, 'Expected /theme light client slash command to switch theme');
            assert.equal(liveCheck.value.switchedBackDark, true, 'Expected /theme dark client slash command to restore dark theme');
            assert.equal(liveCheck.value.fastModeApplied, true, 'Expected /fast client slash command to switch mode to Fast');
            assert.equal(liveCheck.value.agentModeRestored, true, 'Expected /mode Agent to restore Agent mode');
            assert.equal(liveCheck.value.mobileTouchRaceQuoted, true, 'Mobile touch race (touchstart -> selection collapse -> 120ms -> click) must still quote selection');
            assert.equal(liveCheck.value.nativeActionModeBtwOk, true, 'Android native ActionMode window.__quoteNativeSelection("btw") must quote selection & prefix /btw');
            assert.ok(liveCheck.value.historyCards >= 1);
            assert.equal(liveCheck.value.quotaModalRendered, true, 'Expected Weekly Quota + Context Window breakdown modal on live server');
            assert.equal(liveCheck.value.ideVisible, true, 'Expected Antigravity IDE workspace section to open');
            assert.equal(liveCheck.value.ideLineQuoteOk, true, 'Expected IDE Code line-range selection quote to insert fileLineRange quote into composer');
            assert.equal(liveCheck.value.liveSwarmSectionVisible, true, 'Expected Swarm UI section to open on live server');
            assert.equal(liveCheck.value.liveActiveSwarmSubtabCount, 1, 'Expected active Swarm subtab preserved after opening file in IDE');
            assert.equal(liveCheck.value.liveSwarmRendered, true, 'Expected Swarm UI to render real PC swarm overview or empty state');
            assert.equal(liveCheck.value.liveSwarmQuoteOk, true, 'Expected Swarm Board post Quote button to quote post into Coordinator composer');
            assert.equal(liveCheck.value.findBarShown, true, 'Expected /find in-conversation search bar to toggle open');
            console.log(`✔ Verified Live Mobile UI on 360x800 Chrome (Neon/Orchestrator/Carbon UI, 3-Group Quota Modal, Swarm UI, IDE Line-Range Quoting, /find, ${liveCheck.value.modelItemCount} Models)`);
        }

        console.log('\nALL INTEGRATION, REGRESSION & HEADLESS CHROME TESTS PASSED!');
    } finally {
        srv.kill('SIGTERM');
    }
}

runTests().catch(err => {
    console.error('TEST FAILURE:', err);
    process.exit(1);
});
