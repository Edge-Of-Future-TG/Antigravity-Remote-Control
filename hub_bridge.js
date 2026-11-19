import fs from 'fs';
import os from 'os';
import http from 'http';
import https from 'https';
import crypto from 'crypto';
import { execFile, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { basename, dirname, extname, join, relative, resolve, sep } from 'path';

const __hubBridgeDir = dirname(fileURLToPath(import.meta.url));

/**
 * Antigravity 2.33+ Hub / LanguageServer ConnectRPC Bridge
 * Automatically discovers live Antigravity Hub daemons from
 * ~/.gemini/antigravity/daemon/hub_*.json without requiring --remote-debugging-port.
 */

export const DEFAULT_ANTIGRAVITY_MODELS = [
    {
        label: 'Gemini 4 Neon (High)',
        modelId: 'gemini-4-neon-high',
        modelEnum: 'MODEL_PLACEHOLDER_M532',
        family: 'Gemini 4 Neon',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Neon (XHigh)',
        modelId: 'gemini-4-neon-xhigh',
        modelEnum: 'MODEL_PLACEHOLDER_M535',
        family: 'Gemini 4 Neon',
        effort: 'XHigh',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Neon (Medium)',
        modelId: 'gemini-4-neon-medium',
        modelEnum: 'MODEL_PLACEHOLDER_M533',
        family: 'Gemini 4 Neon',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Neon (Low)',
        modelId: 'gemini-4-neon-low',
        modelEnum: 'MODEL_PLACEHOLDER_M534',
        family: 'Gemini 4 Neon',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Orchestrator (Neon)',
        modelId: 'gemini-pro-orchestrator-neon',
        modelEnum: 'MODEL_PLACEHOLDER_M537',
        family: 'Orchestrator',
        effort: 'Neon',
        tagTitle: 'New',
        tagDescription: 'Neon that may offload routine steps to Hydrogen. Same Neon-level quality, fewer tokens used.',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Orchestrator (Argon)',
        modelId: 'gemini-pro-orchestrator-g1-pro',
        modelEnum: 'MODEL_PLACEHOLDER_M668',
        family: 'Orchestrator',
        effort: 'Argon',
        tagTitle: 'New',
        tagDescription: 'Argon that may offload routine steps to Hydrogen. Same Argon-level quality, fewer tokens used.',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Argon (High)',
        modelId: 'gemini-4-argon-high',
        modelEnum: 'MODEL_PLACEHOLDER_M417',
        family: 'Gemini 4 Argon',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: 'The original Gemini 4 model for advanced workflows',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Argon (Medium)',
        modelId: 'gemini-4-argon-medium',
        modelEnum: 'MODEL_PLACEHOLDER_M418',
        family: 'Gemini 4 Argon',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: 'The original Gemini 4 model for advanced workflows',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Argon (Low)',
        modelId: 'gemini-4-argon-low',
        modelEnum: 'MODEL_PLACEHOLDER_M419',
        family: 'Gemini 4 Argon',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: 'The original Gemini 4 model for advanced workflows',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (XHigh)',
        modelId: 'gemini-4-hydrogen-xhigh',
        modelEnum: 'MODEL_PLACEHOLDER_M528',
        family: 'Gemini 4 Hydrogen',
        effort: 'XHigh',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (High)',
        modelId: 'gemini-4-hydrogen-high',
        modelEnum: 'MODEL_PLACEHOLDER_M525',
        family: 'Gemini 4 Hydrogen',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (Medium)',
        modelId: 'gemini-4-hydrogen-medium',
        modelEnum: 'MODEL_PLACEHOLDER_M526',
        family: 'Gemini 4 Hydrogen',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (Low)',
        modelId: 'gemini-4-hydrogen-low',
        modelEnum: 'MODEL_PLACEHOLDER_M527',
        family: 'Gemini 4 Hydrogen',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 3.8 Flash (High)',
        modelId: 'gemini-3.8-flash-high',
        modelEnum: 'MODEL_PLACEHOLDER_M318',
        family: 'Gemini 3.8 Flash',
        effort: 'High',
        tagTitle: 'Fast',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 3.8 Flash (Medium)',
        modelId: 'gemini-3.8-flash-medium',
        modelEnum: 'MODEL_PLACEHOLDER_M319',
        family: 'Gemini 3.8 Flash',
        effort: 'Medium',
        tagTitle: 'Fast',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Gemini 3.8 Flash (Low)',
        modelId: 'gemini-3.8-flash-low',
        modelEnum: 'MODEL_PLACEHOLDER_M320',
        family: 'Gemini 3.8 Flash',
        effort: 'Low',
        tagTitle: 'Fast',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Opus 5.5 (High)',
        modelId: 'claude-opus-5-5-high',
        modelEnum: 'MODEL_PLACEHOLDER_M402',
        family: 'Claude Opus 5.5',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Opus 5.5 (Medium)',
        modelId: 'claude-opus-5-5-medium',
        modelEnum: 'MODEL_PLACEHOLDER_M401',
        family: 'Claude Opus 5.5',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Opus 5.5 (Low)',
        modelId: 'claude-opus-5-5-low',
        modelEnum: 'MODEL_PLACEHOLDER_M400',
        family: 'Claude Opus 5.5',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Sonnet 5.5 (High)',
        modelId: 'claude-sonnet-5-5-high',
        modelEnum: 'MODEL_PLACEHOLDER_M405',
        family: 'Claude Sonnet 5.5',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Sonnet 5.5 (Medium)',
        modelId: 'claude-sonnet-5-5-medium',
        modelEnum: 'MODEL_PLACEHOLDER_M404',
        family: 'Claude Sonnet 5.5',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Sonnet 5.5 (Low)',
        modelId: 'claude-sonnet-5-5-low',
        modelEnum: 'MODEL_PLACEHOLDER_M403',
        family: 'Claude Sonnet 5.5',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Sonnet 4.6 (Thinking)',
        modelId: 'claude-sonnet-4-6',
        modelEnum: 'MODEL_PLACEHOLDER_M35',
        family: 'Claude 4.6',
        effort: 'Sonnet 4.6',
        tagTitle: 'Notice',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'Claude Opus 4.6 (Thinking)',
        modelId: 'claude-opus-4-6-thinking',
        modelEnum: 'MODEL_PLACEHOLDER_M26',
        family: 'Claude 4.6',
        effort: 'Opus 4.6',
        tagTitle: 'Notice',
        tagDescription: '',
        disabled: false,
        supportsImages: true
    },
    {
        label: 'GPT-OSS 120B (Medium)',
        modelId: 'gpt-oss-120b-medium',
        modelEnum: 'MODEL_OPENAI_GPT_OSS_120B_MEDIUM',
        family: 'GPT-OSS 120B',
        effort: 'Medium',
        tagTitle: 'Notice',
        tagDescription: 'GPT-OSS will be removed from Antigravity on November 30, 2026.',
        disabled: false,
        supportsImages: false
    },
    {
        label: 'Gemini 4 Carbon',
        modelId: 'gemini-4-carbon-disabled',
        modelEnum: 'MODEL_PLACEHOLDER_M670',
        family: 'Gemini 4 Carbon',
        effort: 'Unavailable',
        tagTitle: 'Unavailable',
        tagDescription: 'Gemini 4 Carbon is currently available to Ultra plan subscribers.',
        disabled: true,
        supportsImages: true
    }
];

export const RUNTIME_MODEL_LABEL_ALIASES = {
    MODEL_PLACEHOLDER_M669: 'Orchestrator (Execution)',
    MODEL_PLACEHOLDER_M427: 'Gemini 4 (Legacy)',
    MODEL_PLACEHOLDER_M437: 'Gemini 4 (Legacy)',
    MODEL_PLACEHOLDER_M438: 'Gemini 4 (Legacy)'
};

const EXTENSION_TO_ANTIGRAVITY_MIME = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    avif: 'image/avif',
    heic: 'image/heic',
    heif: 'image/heif',
    // Documents & Archives
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    doc: 'application/msword',
    xls: 'application/vnd.ms-excel',
    ppt: 'application/vnd.ms-powerpoint',
    zip: 'application/zip',
    // Video
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    // Audio (Antigravity 2.33 D_a / C_a)
    wav: 'audio/wav',
    mp3: 'audio/mp3',
    m4a: 'audio/m4a',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    opus: 'audio/opus',
    weba: 'audio/webm',
    // Structured / Code / Text (Antigravity 2.33 E_a)
    txt: 'text/plain',
    log: 'text/plain',
    env: 'text/plain',
    ini: 'text/plain',
    conf: 'text/plain',
    cfg: 'text/plain',
    csv: 'text/csv',
    tsv: 'text/csv',
    json: 'application/json',
    jsonc: 'application/json',
    jsonl: 'application/json',
    md: 'text/markdown',
    markdown: 'text/markdown',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    scss: 'text/plain',
    less: 'text/plain',
    js: 'text/javascript',
    mjs: 'text/javascript',
    cjs: 'text/javascript',
    jsx: 'text/javascript',
    ts: 'text/x-typescript',
    tsx: 'text/x-typescript',
    mts: 'text/x-typescript',
    cts: 'text/x-typescript',
    py: 'text/x-python',
    xml: 'text/xml',
    go: 'text/plain',
    rs: 'text/plain',
    java: 'text/plain',
    kt: 'text/plain',
    kts: 'text/plain',
    cs: 'text/plain',
    c: 'text/plain',
    cc: 'text/plain',
    cpp: 'text/plain',
    cxx: 'text/plain',
    h: 'text/plain',
    hh: 'text/plain',
    hpp: 'text/plain',
    swift: 'text/plain',
    rb: 'text/plain',
    php: 'text/plain',
    sh: 'text/plain',
    bash: 'text/plain',
    zsh: 'text/plain',
    ps1: 'text/plain',
    bat: 'text/plain',
    cmd: 'text/plain',
    sql: 'text/plain',
    yaml: 'text/plain',
    yml: 'text/plain',
    toml: 'text/plain',
    proto: 'text/plain',
    graphql: 'text/plain',
    gql: 'text/plain',
    vue: 'text/plain',
    svelte: 'text/plain',
    astro: 'text/plain',
    lua: 'text/plain',
    r: 'text/plain',
    dart: 'text/plain',
    scala: 'text/plain',
    gradle: 'text/plain'
};

export function resolveAttachmentMimeType(fileName = '', rawMime = '') {
    const cleanMime = String(rawMime || '')
        .split(';')[0]
        .trim()
        .toLowerCase();
    const cleanName = String(fileName || '').replace(/\\/g, '/').split('/').pop() || '';
    const dotIdx = cleanName.lastIndexOf('.');
    const ext = dotIdx > 0 ? cleanName.slice(dotIdx + 1).toLowerCase() : '';

    if (cleanMime === 'image/jpg') return 'image/jpeg';
    if (cleanMime === 'application/xml') return 'text/xml';
    if (cleanMime === 'audio/mpeg') return 'audio/mp3';
    if (cleanMime === 'audio/x-wav' || cleanMime === 'audio/wave' || cleanMime === 'audio/vnd.wave') return 'audio/wav';
    if (cleanMime === 'audio/mp4') return 'audio/m4a';
    if (cleanMime === 'application/x-zip-compressed' || cleanMime === 'application/x-zip') return 'application/zip';

    // Prefer extension mapping when browser/WebView reports generic or empty MIME (common on Android for .md, .ts, .py, .apk, .mkv)
    if (ext && EXTENSION_TO_ANTIGRAVITY_MIME[ext]) {
        if (
            !cleanMime ||
            cleanMime === 'application/octet-stream' ||
            cleanMime === 'binary/octet-stream' ||
            (cleanMime === 'text/plain' && EXTENSION_TO_ANTIGRAVITY_MIME[ext] !== 'text/plain')
        ) {
            return EXTENSION_TO_ANTIGRAVITY_MIME[ext];
        }
    }

    if (cleanMime && cleanMime !== 'binary/octet-stream') {
        if (cleanMime.startsWith('text/') && !Object.values(EXTENSION_TO_ANTIGRAVITY_MIME).includes(cleanMime)) {
            return 'text/plain';
        }
        return cleanMime;
    }

    if (ext && EXTENSION_TO_ANTIGRAVITY_MIME[ext]) {
        return EXTENSION_TO_ANTIGRAVITY_MIME[ext];
    }

    return 'application/octet-stream';
}

export function sanitizeMediaDisplayName(fileName = '', mimeType = '') {
    const base = String(fileName || '')
        .replace(/\\/g, '/')
        .split('/')
        .pop() || '';
    const cleaned = Array.from(base.trim(), ch =>
        /[\p{Cc}\p{Cs}]/u.test(ch) ? '' : /[\s%]/u.test(ch) ? '_' : ch
    ).join('');
    if (!cleaned || cleaned === '.' || cleaned === '..') {
        const fallbackExt =
            mimeType === 'application/pdf'
                ? 'pdf'
                : mimeType === 'application/zip'
                  ? 'zip'
                  : mimeType.startsWith('image/')
                    ? mimeType.slice(6).replace('jpeg', 'jpg').replace('svg+xml', 'svg')
                    : mimeType.startsWith('video/')
                      ? mimeType.slice(6)
                      : mimeType.startsWith('audio/')
                        ? mimeType.slice(6)
                        : mimeType.startsWith('text/')
                          ? 'txt'
                          : '';
        return fallbackExt ? `file.${fallbackExt}` : 'file';
    }
    const chars = Array.from(cleaned);
    if (chars.length <= 255) return cleaned;
    const dotIdx = cleaned.lastIndexOf('.');
    const extChars = dotIdx > 0 ? Array.from(cleaned.slice(dotIdx)) : [];
    if (extChars.length >= 255) return chars.slice(0, 255).join('');
    return [...chars.slice(0, 255 - extChars.length), ...extChars].join('');
}

export function classifyMediaAttachment(mimeType = '', fileName = '') {
    const resolved = resolveAttachmentMimeType(fileName, mimeType);
    const cleanName = String(fileName || '').replace(/\\/g, '/').split('/').pop() || '';
    const lowerName = cleanName.toLowerCase();
    const isTarDoubleExt = /\.(tar\.(?:gz|bz2|xz|zst))$/i.test(lowerName);
    const dotIdx = cleanName.lastIndexOf('.');
    const rawExt = isTarDoubleExt
        ? 'TAR.GZ'
        : dotIdx > 0
          ? cleanName.slice(dotIdx + 1).toUpperCase()
          : '';
    const lowerExt = rawExt.toLowerCase();

    if (resolved.startsWith('image/')) {
        return { category: 'image', badgeLabel: rawExt || 'IMG', accentClass: 'is-image', isImage: true, isVideo: false, isAudio: false, isPdf: false };
    }
    if (resolved.startsWith('video/')) {
        return { category: 'video', badgeLabel: rawExt || 'VIDEO', accentClass: 'is-video', isImage: false, isVideo: true, isAudio: false, isPdf: false };
    }
    if (resolved.startsWith('audio/')) {
        return { category: 'audio', badgeLabel: rawExt || 'AUDIO', accentClass: 'is-audio', isImage: false, isVideo: false, isAudio: true, isPdf: false };
    }
    if (resolved === 'application/pdf') {
        return { category: 'pdf', badgeLabel: 'PDF', accentClass: 'is-pdf', isImage: false, isVideo: false, isAudio: false, isPdf: true };
    }
    if (resolved === 'text/csv') {
        return { category: 'csv', badgeLabel: rawExt || 'CSV', accentClass: 'is-csv', isImage: false, isVideo: false, isAudio: false, isPdf: false };
    }
    if (resolved === 'application/json') {
        return { category: 'json', badgeLabel: rawExt || 'JSON', accentClass: 'is-json', isImage: false, isVideo: false, isAudio: false, isPdf: false };
    }
    if (resolved === 'text/markdown') {
        return { category: 'md', badgeLabel: rawExt || 'MD', accentClass: 'is-md', isImage: false, isVideo: false, isAudio: false, isPdf: false };
    }
    if (
        resolved === 'application/zip' ||
        isTarDoubleExt ||
        ['zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar'].includes(lowerExt)
    ) {
        return { category: 'archive', badgeLabel: rawExt || 'ZIP', accentClass: 'is-archive', isImage: false, isVideo: false, isAudio: false, isPdf: false };
    }
    if (resolved.includes('officedocument') || resolved.includes('msword') || resolved.includes('ms-excel') || resolved.includes('ms-powerpoint')) {
        return { category: 'document', badgeLabel: rawExt || 'DOC', accentClass: 'is-doc', isImage: false, isVideo: false, isAudio: false, isPdf: false };
    }
    if (resolved.startsWith('text/')) {
        return { category: 'text', badgeLabel: (rawExt && rawExt.length <= 6 ? rawExt : 'TXT'), accentClass: 'is-code', isImage: false, isVideo: false, isAudio: false, isPdf: false };
    }
    return {
        category: 'file',
        badgeLabel: rawExt && rawExt.length <= 6 ? rawExt : 'FILE',
        accentClass: 'is-binary',
        isImage: false,
        isVideo: false,
        isAudio: false,
        isPdf: false
    };
}

export const DEFAULT_SLASH_COMMANDS = [
    { name: 'boost', type: 'SYSTEM', category: 'System', icon: 'bolt', description: 'Invoke the Boost multi-agent orchestrator (DeepCoder / DeepInvestigator)' },
    { name: 'swarm', type: 'SKILL', category: 'Skill', icon: 'hub', description: 'Coordinate multi-agent parallel swarm workflows' },
    { name: 'btw', type: 'WORKFLOW', category: 'System', icon: 'chat_add_on', description: 'Ask a quick side question without interrupting the main conversation' },
    { name: 'plan', type: 'SYSTEM', category: 'System', icon: 'map', description: 'Draft an architectural implementation plan before coding' },
    { name: 'goal', type: 'SYSTEM', category: 'System', icon: 'timer', description: 'Run autonomously until the specified goal is completely finished' },
    { name: 'compact', type: 'SYSTEM', category: 'System', icon: 'collapse_all', description: 'Compact conversation history now to free up the context window' },
    { name: 'teamwork', type: 'SYSTEM', category: 'System', icon: 'groups', description: 'Invoke a team of specialized agents for large projects' },
    { name: 'grill-me', type: 'SYSTEM', category: 'System', icon: 'quiz', description: 'Interview me interactively to align on requirements and plan' },
    { name: 'browser', type: 'SYSTEM', category: 'System', icon: 'language', description: 'Invoke a browser subagent for web inspection and automation' },
    { name: 'learn', type: 'SYSTEM', category: 'System', icon: 'school', description: 'Reflect on recent work to capture reusable knowledge and patterns' },
    { name: 'schedule', type: 'SYSTEM', category: 'System', icon: 'schedule', description: 'Run an instruction on a recurring schedule or one-time timer' },
    { name: 'help', type: 'SYSTEM', category: 'System', icon: 'help', description: 'Troubleshoot issues, configure Antigravity, or get guided help' },
    { name: 'new', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'add', description: 'Start a new conversation (or /new <prompt> to start & send)' },
    { name: 'stop', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'stop_circle', description: 'Stop active agent or subagent swarm execution' },
    { name: 'quota', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'donut_large', description: 'Open live Weekly & 5-Hour Model Quota and Context Window breakdown' },
    { name: 'swarm-ui', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'hub', description: 'Open the live Swarm UI (Overview, Shared Board, Pixel-Bee Members & @Mention Graph)' },
    { name: 'ide', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'code', description: 'Switch between Normal Antigravity and Antigravity IDE workspace (/ide or /ide <file>)' },
    { name: 'model', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'auto_awesome', description: 'Switch model (/model <name> or open grouped model selector)' },
    { name: 'mode', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'tune', description: 'Switch execution mode (/mode Agent | Autonomous | Planning | Fast)' },
    { name: 'fast', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'bolt', description: 'Switch to Fast mode (/fast or /fast <prompt>)' },
    { name: 'find', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'search', description: 'Search and highlight messages inside the active conversation' },
    { name: 'export', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'download', description: 'Export or copy the active conversation as clean Markdown' },
    { name: 'prompts', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'history_edu', description: 'Recall and reuse your recent sent prompts' },
    { name: 'theme', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'contrast', description: 'Toggle Dark Obsidian / Light UI theme' },
    { name: 'clear', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'ink_eraser', description: 'Clear current composer draft, quotes, and attachments' },
    { name: 'history', type: 'CONTROL', category: 'Control', clientAction: true, icon: 'history', description: 'Open Hub Conversations & Swarm drawer' }
];

export const CLIENT_SLASH_CONTROLS = DEFAULT_SLASH_COMMANDS.filter(c => c.clientAction);

const DEFAULT_DECLARATIVE_MIXIN_CONFIG = {
    promptSections: [
        { builtinName: 'identity' },
        { builtinName: 'terminal_sandbox' },
        { builtinName: 'artifacts' },
        { builtinName: 'conversation_transcript' },
        { builtinName: 'guidelines' },
        { builtinName: 'communication_style' },
        { builtinName: 'slash_commands' },
        { builtinName: 'messaging' },
        { builtinName: 'mcp_servers' },
        { builtinName: 'subagents' },
        { builtinName: 'skills' },
        { builtinName: 'featured_plugins' },
        { builtinName: 'flows' },
        { builtinName: 'user_rules' },
        { builtinName: 'user_information' },
        { builtinName: 'subagent_reminder' }
    ],
    tools: [
        { name: 'read_file', builtin: true },
        { name: 'run_command', builtin: true },
        { name: 'list_plugin_accounts', builtin: true },
        { name: 'manage_task', builtin: true },
        { name: 'send_message', builtin: true },
        { name: 'schedule', builtin: true },
        { name: 'invoke_subagent', builtin: true },
        { name: 'define_subagent', builtin: true },
        { name: 'manage_subagents', builtin: true },
        { name: 'write_file', builtin: true },
        { name: 'edit_file', builtin: true },
        { name: 'search_web', builtin: true },
        { name: 'run_workflow', builtin: true },
        { name: 'search_marketplace', builtin: true },
        { name: 'swarm_manage', builtin: true },
        { name: 'swarm_post_message', builtin: true },
        { name: 'swarm_read_board', builtin: true },
        { name: 'swarm_wait', builtin: true },
        { name: 'ask_question', builtin: true }
    ],
    preInvocationHooks: [
        { name: 'message_delivery', builtin: true },
        { name: 'swarm_board_head', builtin: true },
        { name: 'context_summary', builtin: true }
    ],
    postInvocationHooks: [
        { name: 'chain_check', builtin: true },
        { name: 'message_continue_check', builtin: true },
        { name: 'terminal_step_check', builtin: true },
        { name: 'max_generator_invocations_check', builtin: true },
        { name: 'empty_output_continuation_check', builtin: true },
        { name: 'force_invocation', builtin: true },
        { name: 'no_tool_call_check', builtin: true },
        { name: 'swarm_wait_check', builtin: true }
    ],
    preToolHooks: [
        { name: 'battle_mode_tool_args', builtin: true },
        { name: 'command_assessor', builtin: true },
        { name: 'auto_run_safety_gate', builtin: true }
    ],
    postToolHooks: [
        { name: 'command_assessor', builtin: true }
    ],
    stopHooks: [
        { name: 'goal_stop', builtin: true },
        { name: 'idle_subagent_guard', builtin: true },
        { name: 'swarm_park_guard', builtin: true }
    ],
    toolDecorators: [
        { name: 'tool_timestamp', builtin: true },
        { name: 'output_truncation', builtin: true }
    ],
    forceDisableFundamentalComponents: true
};

const DEFAULT_CUSTOMIZATION_DISCOVERY = {
    skills: {
        builtinSkillNames: [
            'agy-customizations',
            'antigravity_guide',
            'migrate-agent-settings',
            'automation',
            'generative_ui',
            'migrate-workflows',
            'plugin',
            'run-workflow',
            'ui-plugin-navigation',
            'native_swarm',
            'swarm_monitor'
        ]
    },
    agents: {
        builtinAgentNames: [
            'self',
            'research',
            'browser',
            'teamwork',
            'DeepCoder',
            'DeepInvestigator',
            'image-generator'
        ]
    }
};

export function parseFamilyAndEffort(label, options = null) {
    const cleanLabel = String(label || '').trim();
    const match = /^(.+?)\s*\(([^)]+)\)$/.exec(cleanLabel);
    if (match) {
        const base = match[1].trim();
        const effort = match[2].trim();
        if (base.startsWith('Claude ') && /^thinking$/i.test(effort)) {
            // Preserve variant name (e.g. "Sonnet 4.6", "Opus 4.6") so buttons never collide as duplicate "Thinking"
            const variant = base.replace(/^Claude\s+/i, '').trim();
            return { family: 'Claude 4.6', effort: variant || effort };
        }
        return { family: base, effort };
    }
    const isUnavailable =
        Boolean(options?.disabled) ||
        String(options?.tagTitle || '').trim().toLowerCase() === 'unavailable';
    return {
        family: cleanLabel || 'Models',
        effort: isUnavailable ? 'Unavailable' : 'Default'
    };
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function formatShortWorkspacePath(rawUri, fallback = 'workspace file') {
    if (!rawUri || typeof rawUri !== 'string') return fallback;
    let cleaned = rawUri.trim().replace(/^file:\/\/\/?/i, '');
    if (cleaned.includes('%')) {
        try {
            cleaned = decodeURIComponent(cleaned);
        } catch {
            // Keep raw string if malformed percent sequence
        }
    }
    const parts = cleaned.replace(/\\/g, '/').split('/').filter(Boolean);
    if (parts.length === 0) return fallback;
    return parts.slice(-2).join('/');
}

export function uriToLocalPath(rawUri) {
    if (!rawUri || typeof rawUri !== 'string') return '';
    let cleaned = rawUri.trim();
    if (!cleaned) return '';
    if (/^file:\/\//i.test(cleaned)) {
        cleaned = cleaned.replace(/^file:\/\/\/?/i, '');
        if (cleaned.includes('%')) {
            try {
                cleaned = decodeURIComponent(cleaned);
            } catch {}
        }
        if (process.platform === 'win32') {
            if (/^[a-zA-Z]:/.test(cleaned)) {
                return cleaned.replace(/\//g, '\\');
            }
            return ('\\' + cleaned).replace(/\//g, '\\');
        }
        return '/' + cleaned.replace(/^\/+/, '');
    }
    return cleaned;
}

export function formatResetCountdown(resetIso, nowMs = Date.now()) {
    if (!resetIso || typeof resetIso !== 'string') return '';
    const targetMs = Date.parse(resetIso);
    if (Number.isNaN(targetMs)) return '';
    const diffMs = targetMs - nowMs;
    if (diffMs <= 0) return 'Refreshing soon';
    const totalMin = Math.max(1, Math.round(diffMs / 60000));
    if (totalMin < 60) return `${totalMin}m`;
    const totalHours = Math.floor(totalMin / 60);
    const remMin = totalMin % 60;
    if (totalHours < 24) {
        return remMin > 0 ? `${totalHours}h ${remMin}m` : `${totalHours}h`;
    }
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

function execFileAsync(cmd, args = [], opts = {}) {
    return new Promise((resolvePromise, rejectPromise) => {
        execFile(cmd, args, { timeout: 6000, maxBuffer: 2 * 1024 * 1024, ...opts }, (err, stdout, stderr) => {
            if (err) {
                err.stdout = stdout;
                err.stderr = stderr;
                return rejectPromise(err);
            }
            resolvePromise({ stdout: String(stdout ?? ''), stderr: String(stderr ?? '') });
        });
    });
}

function parseToolCallArgs(step) {
    let parsed = {};
    const rawJson = step?.metadata?.toolCall?.argumentsJson;
    if (typeof rawJson === 'string' && rawJson.trim()) {
        try {
            const obj = JSON.parse(rawJson);
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                parsed = { ...obj };
            }
        } catch {
            // Partial or non-JSON arguments while streaming
        }
    }
    const genArgs = step?.generic?.args;
    if (genArgs && typeof genArgs === 'object' && !Array.isArray(genArgs)) {
        parsed = { ...parsed, ...genArgs };
    }
    return parsed;
}

function humanizeToolName(name) {
    if (!name) return 'Tool';
    return String(name)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, ch => ch.toUpperCase());
}

function extractCodeActionDetails(step) {
    const ca = step?.codeAction || {};
    const spec = ca.actionSpec || {};
    const resEdit = ca.actionResult?.edit || {};
    const legacyObj = step?.editFile || step?.writeFile || {};
    const args = parseToolCallArgs(step);

    const rawUri =
        spec.createFile?.path?.absoluteUri ||
        spec.command?.file?.absoluteUri ||
        spec.editFile?.path?.absoluteUri ||
        spec.deleteFile?.path?.absoluteUri ||
        resEdit.absoluteUri ||
        ca.absolutePathUri ||
        ca.absoluteUri ||
        legacyObj.absolutePathUri ||
        ca.targetFile ||
        legacyObj.targetFile ||
        (typeof ca.path === 'string' ? ca.path : ca.path?.absoluteUri) ||
        (typeof legacyObj.path === 'string' ? legacyObj.path : legacyObj.path?.absoluteUri) ||
        args.Path ||
        args.TargetFile ||
        args.file_path ||
        args.path ||
        '';

    const shortName = formatShortWorkspacePath(rawUri, 'workspace file');
    const toolName = step?.metadata?.toolCall?.name || '';
    const isDelete = Boolean(spec.deleteFile || toolName === 'delete_file');
    const isCreate = Boolean(spec.createFile || resEdit.createFile || toolName === 'write_file' || step?.writeFile);
    const actionLabel = isDelete ? '🗑️ Deleted' : isCreate ? '📝 Wrote' : '✏️ Edited';

    const rawLines = Array.isArray(resEdit.diff?.unifiedDiff?.lines) ? resEdit.diff.unifiedDiff.lines : [];
    let countedIns = 0;
    let countedDel = 0;
    for (const ln of rawLines) {
        if (ln?.type === 'UNIFIED_DIFF_LINE_TYPE_INSERT') countedIns++;
        else if (ln?.type === 'UNIFIED_DIFF_LINE_TYPE_DELETE') countedDel++;
    }

    let additions = typeof ca.diffStats?.additions === 'number' ? ca.diffStats.additions : countedIns;
    let deletions = typeof ca.diffStats?.deletions === 'number' ? ca.diffStats.deletions : countedDel;

    if (rawLines.length === 0 && additions === 0 && deletions === 0) {
        if (isCreate && typeof args.Content === 'string' && args.Content.length > 0) {
            additions = args.Content.split(/\r?\n/).length;
        } else if (!isCreate && (typeof args.Replacement === 'string' || typeof args.Target === 'string')) {
            if (typeof args.Replacement === 'string' && args.Replacement.length > 0) {
                additions = args.Replacement.split(/\r?\n/).length;
            }
            if (typeof args.Target === 'string' && args.Target.length > 0) {
                deletions = args.Target.split(/\r?\n/).length;
            }
        }
    }

    const includeSet = new Set();
    for (let idx = 0; idx < rawLines.length; idx++) {
        const t = rawLines[idx]?.type;
        if (t === 'UNIFIED_DIFF_LINE_TYPE_INSERT' || t === 'UNIFIED_DIFF_LINE_TYPE_DELETE') {
            const from = Math.max(0, idx - 2);
            const to = Math.min(rawLines.length - 1, idx + 2);
            for (let k = from; k <= to; k++) includeSet.add(k);
        }
    }

    const sortedIndices = Array.from(includeSet).sort((a, b) => a - b);
    const MAX_DIFF_LINES = 60;
    const diffHtmlLines = [];
    let prevIdx = -1;
    const limit = Math.min(sortedIndices.length, MAX_DIFF_LINES);

    for (let p = 0; p < limit; p++) {
        const idx = sortedIndices[p];
        if (prevIdx !== -1 && idx > prevIdx + 1) {
            diffHtmlLines.push(`<span class="agy-diff-hunk">@@ line ${idx + 1} @@</span>`);
        } else if (prevIdx === -1 && idx > 0) {
            diffHtmlLines.push(`<span class="agy-diff-hunk">@@ line ${idx + 1} @@</span>`);
        }
        const entry = rawLines[idx] || {};
        const cleanText = String(entry.text ?? '').replace(/\r$/, '');
        if (entry.type === 'UNIFIED_DIFF_LINE_TYPE_INSERT') {
            diffHtmlLines.push(`<span class="agy-diff-line agy-diff-line-add">+ ${escapeHtml(cleanText)}</span>`);
        } else if (entry.type === 'UNIFIED_DIFF_LINE_TYPE_DELETE') {
            diffHtmlLines.push(`<span class="agy-diff-line agy-diff-line-del">- ${escapeHtml(cleanText)}</span>`);
        } else {
            diffHtmlLines.push(`<span class="agy-diff-line agy-diff-line-ctx">  ${escapeHtml(cleanText)}</span>`);
        }
        prevIdx = idx;
    }

    if (sortedIndices.length > MAX_DIFF_LINES) {
        diffHtmlLines.push(
            `<span class="agy-diff-hunk">… (${sortedIndices.length - MAX_DIFF_LINES} more diff lines)</span>`
        );
    }

    return {
        rawUri,
        shortName,
        actionLabel,
        additions,
        deletions,
        diffPreviewHtml: diffHtmlLines.join('\n')
    };
}

export function parseVoiceContextText(rawText = '') {
    const raw = String(rawText || '');
    if (!raw.includes('<voice_instructions>') && !raw.includes('<talker_agent_context>')) {
        return { isVoice: false, text: raw };
    }
    let remainder = raw.replace(/<voice_instructions>[\s\S]*?<\/voice_instructions>/gi, '');
    const contextBlocks = [];
    remainder = remainder.replace(/<talker_agent_context>([\s\S]*?)<\/talker_agent_context>/gi, (_, inner) => {
        if (inner && inner.trim()) contextBlocks.push(inner);
        return '';
    });

    const userLines = [];
    const fallbackLines = [];
    for (const block of contextBlocks) {
        for (const rawLine of block.split(/\r?\n/)) {
            const trimmed = rawLine.trim();
            if (!trimmed) continue;
            const userMatch = /^(?:\[[^\]]+\]\s*)?user:\s*(.+)$/i.exec(trimmed);
            if (userMatch) {
                let spoken = userMatch[1].trim();
                if (spoken.length >= 2 && spoken.startsWith('"') && spoken.endsWith('"')) {
                    spoken = spoken.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                }
                if (spoken) userLines.push(spoken);
            } else {
                const cleanedFallback = trimmed.replace(/^\[[^\]]+\]\s*/, '').trim();
                if (cleanedFallback) fallbackLines.push(cleanedFallback);
            }
        }
    }

    const extra = remainder.trim();
    const parts = [];
    if (userLines.length > 0) {
        parts.push(userLines.join('\n'));
    } else if (fallbackLines.length > 0) {
        parts.push(fallbackLines.join('\n'));
    }
    if (extra) parts.push(extra);

    return {
        isVoice: true,
        text: parts.join('\n\n').trim()
    };
}

export function renderMarkdownLite(md) {
    if (!md) return '';
    const codeBlocks = [];
    let text = String(md).replace(/```([a-zA-Z0-9_+-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
        const idx = codeBlocks.length;
        const cleanLang = escapeHtml(lang || 'code');
        codeBlocks.push(
            `<pre class="agy-code-block"><code class="language-${cleanLang}">${escapeHtml(code.replace(/\r?\n$/, ''))}</code></pre>`
        );
        return `\n@@CODEBLOCK_${idx}@@\n`;
    });

    text = escapeHtml(text);

    // Inline code (protect inline code contents from bold/italic/link parsing)
    const inlineCodes = [];
    text = text.replace(/`([^`\n]+)`/g, (_, codeContent) => {
        const trimmedCode = codeContent.trim();
        // Also detect `[Label](conversation://uuid)` or `[Label](sidecar://...)` wrapped in backticks
        const convMatch = /^\[([^\]]+)\]\(conversation:\/\/([a-zA-Z0-9-]+)\)$/.exec(trimmedCode);
        const sideMatch = /^\[([^\]]+)\]\((sidecar:\/\/[^\s)]+)\)$/i.exec(trimmedCode);
        const idx = inlineCodes.length;
        if (convMatch) {
            inlineCodes.push(
                `<button type="button" class="agy-inline-conv-pill" data-select-cascade="${convMatch[2]}">↳ ${convMatch[1]}</button>`
            );
        } else if (sideMatch) {
            const sUri = sideMatch[2];
            if (/^sidecar:\/\/swarm/i.test(sUri)) {
                inlineCodes.push(
                    `<button type="button" class="agy-inline-swarm-pill" data-open-swarm-ui="1" data-testid="inline-open-swarm-btn" data-sidecar-uri="${sUri}">🐝 ${sideMatch[1]}</button>`
                );
            } else {
                inlineCodes.push(
                    `<span class="agy-inline-conv-pill" data-sidecar-uri="${sUri}">⚡ ${sideMatch[1]}</span>`
                );
            }
        } else {
            inlineCodes.push(`<code class="agy-inline-code">${codeContent}</code>`);
        }
        return `@@INLINECODE_${idx}@@`;
    });

    const formatInline = line => {
        let out = line;
        // Conversation deep links: [Title](conversation://cascadeId)
        out = out.replace(
            /\[([^\]]+)\]\(conversation:\/\/([a-zA-Z0-9-]+)\)/g,
            (_, label, cid) => `<button type="button" class="agy-inline-conv-pill" data-select-cascade="${cid}">↳ ${label}</button>`
        );
        // Sidecar deep links: [Open the Swarm UI](sidecar://swarm/swarm_board/?auto_open=false)
        out = out.replace(
            /\[([^\]]+)\]\((sidecar:\/\/[^\s)]+)\)/gi,
            (_, label, sUri) =>
                /^sidecar:\/\/swarm/i.test(sUri)
                    ? `<button type="button" class="agy-inline-swarm-pill" data-open-swarm-ui="1" data-testid="inline-open-swarm-btn" data-sidecar-uri="${sUri}">🐝 ${label}</button>`
                    : `<span class="agy-inline-conv-pill" data-sidecar-uri="${sUri}">⚡ ${label}</span>`
        );
        // Markdown external / file links (supports single-level balanced parentheses in paths/URLs)
        out = out.replace(
            /\[([^\]]+)\]\(((?:https?:\/\/|file:\/\/\/)(?:[^\s()]|\([^\s()]*\))+)\)/g,
            (_, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
        );
        // Bold & Italic
        out = out.replace(/\*\*([^*\n]+)\*\*/g, (_, inner) => `<strong>${inner}</strong>`);
        out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, (_, pre, inner) => `${pre}<em>${inner}</em>`);
        return out;
    };

    const lines = text.replace(/\r\n/g, '\n').split('\n');
    const htmlBlocks = [];
    let paraLines = [];

    const flushParagraph = () => {
        if (paraLines.length > 0) {
            htmlBlocks.push(`<p>${paraLines.join('<br>')}</p>`);
            paraLines = [];
        }
    };

    const listLineRegex = /^(\s*)(?:(-|\*|\+)|(\d+)\.)\s+(.+)$/;
    const isTableRow = ln => /^\|.+\|$/.test(ln.trim());
    const isTableDivider = ln => /^\|[-:\s|]+\|$/.test(ln.trim());

    let idx = 0;
    while (idx < lines.length) {
        const rawLine = lines[idx];
        const trimmed = rawLine.trim();

        if (!trimmed) {
            flushParagraph();
            idx++;
            continue;
        }

        if (/^@@CODEBLOCK_\d+@@$/.test(trimmed)) {
            flushParagraph();
            htmlBlocks.push(trimmed);
            idx++;
            continue;
        }

        if (/^(?:---+|\*\*\*+)$/.test(trimmed)) {
            flushParagraph();
            htmlBlocks.push('<hr class="agy-md-hr">');
            idx++;
            continue;
        }

        const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
        if (headingMatch) {
            flushParagraph();
            const level = headingMatch[1].length;
            htmlBlocks.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
            idx++;
            continue;
        }

        if (/^&gt;(?:\s|$)/.test(trimmed)) {
            flushParagraph();
            const quoteLines = [];
            while (idx < lines.length && /^&gt;(?:\s|$)/.test(lines[idx].trim())) {
                quoteLines.push(formatInline(lines[idx].trim().replace(/^&gt;\s?/, '')));
                idx++;
            }
            htmlBlocks.push(`<blockquote>${quoteLines.join('<br>')}</blockquote>`);
            continue;
        }

        if (isTableRow(trimmed) && idx + 1 < lines.length && isTableDivider(lines[idx + 1])) {
            flushParagraph();
            const parseCells = rowStr =>
                rowStr
                    .trim()
                    .replace(/^\|/, '')
                    .replace(/\|$/, '')
                    .split('|')
                    .map(c => formatInline(c.trim()));
            const headerCells = parseCells(lines[idx]);
            idx += 2;
            const bodyRows = [];
            while (idx < lines.length && isTableRow(lines[idx])) {
                bodyRows.push(parseCells(lines[idx]));
                idx++;
            }
            const thead = `<thead><tr>${headerCells.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
            const tbody = bodyRows.length
                ? `<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`
                : '';
            htmlBlocks.push(`<div class="agy-table-wrap"><table class="agy-md-table">${thead}${tbody}</table></div>`);
            continue;
        }

        if (listLineRegex.test(rawLine)) {
            flushParagraph();
            const items = [];
            while (idx < lines.length) {
                const m = listLineRegex.exec(lines[idx]);
                if (!m) break;
                const indent = (m[1] || '').replace(/\t/g, '    ').length;
                const tag = m[3] ? 'ol' : 'ul';
                const startNum = m[3] ? Math.max(1, parseInt(m[3], 10) || 1) : 1;
                items.push({ indent, tag, startNum, content: formatInline(m[4]) });
                idx++;
            }

            const baseIndent = Math.min(...items.map(it => it.indent));
            let listOut = '';
            let rootTag = null;
            let rootLiOpen = false;
            let nestedTag = null;

            const openListTag = (tag, startNum) =>
                tag === 'ol' && startNum > 1 ? `<ol start="${startNum}">` : `<${tag}>`;

            const closeNested = () => {
                if (nestedTag) {
                    listOut += `</${nestedTag}>`;
                    nestedTag = null;
                }
            };
            const closeRootLi = () => {
                closeNested();
                if (rootLiOpen) {
                    listOut += '</li>';
                    rootLiOpen = false;
                }
            };

            for (const it of items) {
                const isNested = it.indent >= baseIndent + 2 && rootLiOpen;
                if (!isNested) {
                    closeRootLi();
                    if (rootTag !== it.tag) {
                        if (rootTag) listOut += `</${rootTag}>`;
                        rootTag = it.tag;
                        listOut += openListTag(rootTag, it.startNum);
                    }
                    listOut += `<li>${it.content}`;
                    rootLiOpen = true;
                } else {
                    if (nestedTag !== it.tag) {
                        closeNested();
                        nestedTag = it.tag;
                        listOut += openListTag(nestedTag, it.startNum);
                    }
                    listOut += `<li>${it.content}</li>`;
                }
            }
            closeRootLi();
            if (rootTag) listOut += `</${rootTag}>`;
            htmlBlocks.push(listOut);
            continue;
        }

        paraLines.push(formatInline(trimmed));
        idx++;
    }

    flushParagraph();
    text = htmlBlocks.join('\n');

    // Use callback replacers so $&, $', $$ inside code never get mangled by String.prototype.replace!
    inlineCodes.forEach((html, cIdx) => {
        text = text.replace(`@@INLINECODE_${cIdx}@@`, () => html);
    });
    codeBlocks.forEach((html, bIdx) => {
        text = text.replace(`@@CODEBLOCK_${bIdx}@@`, () => html);
    });

    return text;
}

export class AntigravityHubBridge {
    constructor() {
        this.hubInfo = null; // { pid, httpsPort, httpPort, lsVersion, csrfToken, filePath, kind }
        this.liveDaemons = []; // [{ pid, httpPort, httpsPort, lsVersion, csrfToken, filePath, kind }]
        this.targetApp = 'antigravity'; // 'antigravity' | 'ide'
        this.activeWorkspacePath = null;
        this.cachedModels = [...DEFAULT_ANTIGRAVITY_MODELS];
        this.cachedSlashCommands = [...DEFAULT_SLASH_COMMANDS];
        this.slashRegistry = new Map();
        this._seedDefaultSlashRegistry();
        this.knownWorkspaceUris = new Set();
        this.lastSlashFetchMs = 0;
        this.selectedModelLabel = 'Gemini 4 Neon (High)';
        this.selectedModelEnum = 'MODEL_PLACEHOLDER_M532';
        this.selectedMode = 'Agent'; // 'Agent' | 'Autonomous' | 'Planning' | 'Fast'
        this._modeOverridesModelToFast = false;
        this._preFastModel = null;
        this._userExplicitlySelectedModel = false;
        this.activeCascadeId = null;
        this.parentCascadeMap = new Map();
        this.sideQuestionParentMap = new Map();
        this.sideQuestionTitleMap = new Map();
        this.userProfile = null;
        this.cachedQuotaSummary = null;
        this.lastQuotaFetchMs = 0;
        this.lastContextUsageByCascade = new Map();
        this.lastChangedFilesByCascade = new Map();
        this.templateUserConfig = null;
        this.lastDiscoveryAttempt = 0;
        this.lastProcessInspectMs = 0;
        this.cachedProcessSnapshot = { ideRunning: false, hubAppRunning: false, ideLsPids: new Set(), hubLsPids: new Set() };
        this.customSwarmAppDataDirs = null;
        this._swarmFileCache = new Map();
        this._swarmTranscriptCache = new Map();
        this._swarmViewJsonCache = new Map();
        this._swarmDirScanCache = { builtAt: 0, list: [] };
    }

    _seedDefaultSlashRegistry() {
        for (const cmd of DEFAULT_SLASH_COMMANDS) {
            if (cmd.clientAction) continue;
            const key = cmd.name.toLowerCase();
            if (!this.slashRegistry.has(key)) {
                if (key === 'btw') {
                    this.slashRegistry.set('btw', {
                        ...cmd,
                        workflowSpec: {
                            recipeId: 'btw',
                            title: 'btw',
                            description: cmd.description
                        }
                    });
                } else {
                    this.slashRegistry.set(key, {
                        ...cmd,
                        rawInfo: {
                            name: cmd.name,
                            type: cmd.type === 'SKILL' ? 'SLASH_COMMAND_TYPE_SKILL' : 'SLASH_COMMAND_TYPE_SYSTEM',
                            ...(cmd.icon ? { icon: cmd.icon } : {})
                        }
                    });
                }
            }
        }
    }

    _toFileUri(rawPathOrUri) {
        if (!rawPathOrUri || typeof rawPathOrUri !== 'string') return '';
        const trimmed = rawPathOrUri.trim();
        if (!trimmed) return '';
        if (/^file:\/\//i.test(trimmed)) return trimmed;
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed;
        return 'file:///' + trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
    }

    isConnected() {
        return !!this.hubInfo;
    }

    getDaemonDir() {
        return join(os.homedir(), '.gemini', 'antigravity', 'daemon');
    }

    getStatePbtxtPath() {
        return join(os.homedir(), '.gemini', 'antigravity', 'antigravity_state.pbtxt');
    }

    readLastSelectedModelFromDisk() {
        try {
            const pbPath = this.getStatePbtxtPath();
            if (!fs.existsSync(pbPath)) return null;
            const raw = fs.readFileSync(pbPath, 'utf-8');
            const m = /last_selected_agent_model:\s*([A-Z0-9_]+)/.exec(raw);
            return m ? m[1].trim() : null;
        } catch {
            return null;
        }
    }

    callRpc(method, payload = {}, timeoutMs = 6000, customHub = null) {
        const hub = customHub || this.hubInfo;
        if (!hub) return Promise.reject(new Error('Antigravity Hub not connected'));

        const useHttp = !!hub.httpPort;
        const port = hub.httpPort || hub.httpsPort;
        const transport = useHttp ? http : https;
        const body = Buffer.from(JSON.stringify(payload), 'utf-8');

        return new Promise((resolve, reject) => {
            const req = transport.request(
                {
                    hostname: '127.0.0.1',
                    port,
                    path: `/exa.language_server_pb.LanguageServerService/${method}`,
                    method: 'POST',
                    rejectUnauthorized: false,
                    headers: {
                        'Content-Type': 'application/json',
                        'Connect-Protocol-Version': '1',
                        'x-codeium-csrf-token': hub.csrfToken,
                        'Content-Length': body.length
                    },
                    timeout: timeoutMs
                },
                res => {
                    let chunks = '';
                    res.setEncoding('utf-8');
                    res.on('data', d => (chunks += d));
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            try {
                                resolve(chunks ? JSON.parse(chunks) : {});
                            } catch (e) {
                                reject(new Error(`Invalid JSON from ${method}: ${e.message}`));
                            }
                        } else {
                            reject(new Error(`RPC ${method} HTTP ${res.statusCode}: ${chunks.substring(0, 240)}`));
                        }
                    });
                }
            );

            req.on('timeout', () => {
                req.destroy(new Error(`RPC ${method} timed out`));
            });
            req.on('error', err => reject(err));
            req.write(body);
            req.end();
        });
    }

    async _inspectRunningDesktopProcesses(force = false) {
        const now = Date.now();
        if (!force && now - this.lastProcessInspectMs < 6000) {
            return this.cachedProcessSnapshot;
        }
        this.lastProcessInspectMs = now;
        const snap = { ideRunning: false, hubAppRunning: false, ideLsPids: new Set(), hubLsPids: new Set() };

        try {
            if (process.platform === 'win32') {
                const { stdout } = await execFileAsync(
                    'powershell.exe',
                    [
                        '-NoProfile',
                        '-NonInteractive',
                        '-Command',
                        'Get-CimInstance Win32_Process | Where-Object { $_.Name -match "Antigravity|language_server" } | Select-Object ProcessId,Name,ExecutablePath,CommandLine | ConvertTo-Json -Compress'
                    ],
                    { timeout: 3500 }
                );
                const trimmed = stdout.trim();
                if (trimmed) {
                    const parsed = JSON.parse(trimmed);
                    const list = Array.isArray(parsed) ? parsed : [parsed];
                    for (const proc of list) {
                        const name = String(proc?.Name || '').toLowerCase();
                        const exe = String(proc?.ExecutablePath || '').toLowerCase();
                        const cmd = String(proc?.CommandLine || '');
                        const pid = Number(proc?.ProcessId || 0);
                        if (name.includes('antigravity ide') || exe.includes('antigravity ide')) {
                            snap.ideRunning = true;
                        } else if (name.startsWith('antigravity') && !exe.includes('antigravity ide')) {
                            snap.hubAppRunning = true;
                        }
                        if (name.includes('language_server') && pid > 0) {
                            if (cmd.includes('--subclient_type hub') || cmd.includes('--subclient_type=hub')) {
                                snap.hubLsPids.add(pid);
                            } else {
                                snap.ideLsPids.add(pid);
                            }
                        }
                    }
                }
            } else {
                const { stdout } = await execFileAsync('ps', ['-ax', '-o', 'pid=,command='], { timeout: 2500 });
                for (const line of stdout.split(/\r?\n/)) {
                    const m = /^\s*(\d+)\s+(.+)$/.exec(line);
                    if (!m) continue;
                    const pid = Number(m[1]);
                    const cmd = m[2];
                    const lower = cmd.toLowerCase();
                    if (lower.includes('antigravity ide') || lower.includes('antigravity-ide')) snap.ideRunning = true;
                    else if (lower.includes('antigravity') && !lower.includes('remote-control') && !lower.includes('server.js')) {
                        snap.hubAppRunning = true;
                    }
                    if (lower.includes('language_server')) {
                        if (cmd.includes('--subclient_type hub') || cmd.includes('--subclient_type=hub')) {
                            snap.hubLsPids.add(pid);
                        } else {
                            snap.ideLsPids.add(pid);
                        }
                    }
                }
            }
        } catch {
            // Best-effort OS process classification
        }

        this.cachedProcessSnapshot = snap;
        return snap;
    }

    async discoverHub(force = false) {
        const now = Date.now();
        if (!force && this.hubInfo && now - this.lastDiscoveryAttempt < 5000) {
            return this.hubInfo;
        }
        this.lastDiscoveryAttempt = now;

        if (this.hubInfo && !force) {
            try {
                await this.callRpc('GetUserStatus', {}, 1500, this.hubInfo);
                return this.hubInfo;
            } catch {
                this.hubInfo = null;
            }
        }

        const candidateDirs = [
            this.getDaemonDir(),
            join(os.homedir(), '.gemini', 'antigravity-ide', 'daemon')
        ];
        const fileEntries = [];
        for (const dir of candidateDirs) {
            if (!fs.existsSync(dir)) continue;
            try {
                for (const f of fs.readdirSync(dir)) {
                    if (!f.endsWith('.json')) continue;
                    if (!f.startsWith('hub_') && !f.startsWith('ls_') && !f.startsWith('ide_')) continue;
                    const full = join(dir, f);
                    const stat = fs.statSync(full);
                    fileEntries.push({ full, mtimeMs: stat.mtimeMs, fromIdeDir: dir.includes('antigravity-ide') });
                }
            } catch {}
        }
        fileEntries.sort((a, b) => b.mtimeMs - a.mtimeMs);
        if (fileEntries.length === 0) return null;

        const procSnap = force ? await this._inspectRunningDesktopProcesses(false).catch(() => null) : this.cachedProcessSnapshot;
        const verifiedDaemons = [];

        for (const item of fileEntries.slice(0, 10)) {
            try {
                const candidate = JSON.parse(fs.readFileSync(item.full, 'utf-8'));
                if (!candidate.csrfToken || (!candidate.httpPort && !candidate.httpsPort)) continue;

                const statusResp = await this.callRpc('GetUserStatus', {}, 1200, candidate);
                if (statusResp && statusResp.userStatus) {
                    const pid = Number(candidate.pid || 0);
                    let kind = item.fromIdeDir ? 'ide' : 'antigravity';
                    if (procSnap?.ideLsPids?.has(pid)) kind = 'ide';
                    else if (procSnap?.hubLsPids?.has(pid)) kind = 'antigravity';

                    const enriched = { ...candidate, filePath: item.full, kind };
                    verifiedDaemons.push({ daemon: enriched, userStatus: statusResp.userStatus });
                    // Fast-path when not forcing full multi-daemon scan and matching preferred target
                    if (!force && kind === this.targetApp) break;
                    if (verifiedDaemons.length >= 3) break;
                }
            } catch {
                // Stale daemon file from older session
            }
        }

        this.liveDaemons = verifiedDaemons.map(v => v.daemon);
        if (verifiedDaemons.length === 0) return null;

        const preferred =
            verifiedDaemons.find(v => v.daemon.kind === this.targetApp) ||
            verifiedDaemons[0];

        this.hubInfo = {
            ...preferred.daemon,
            sharedHubBackend: this.targetApp === 'ide' && preferred.daemon.kind !== 'ide'
        };
        this.ingestUserStatus(preferred.userStatus);
        await this.ensureActiveConversationSelected();
        return this.hubInfo;
    }

    ingestUserStatus(userStatus) {
        if (!userStatus) return;
        const planInfo = userStatus.planStatus?.planInfo || {};
        const userTier = userStatus.userTier || {};
        this.userProfile = {
            name: userStatus.name || 'Antigravity User',
            email: userStatus.email || '',
            planName: planInfo.planName || 'Pro',
            teamsTier: planInfo.teamsTier || '',
            tierName: userTier.name || userTier.description || planInfo.planName || 'Pro',
            tierId: userTier.id || '',
            upgradeSubscriptionText: userTier.upgradeSubscriptionText || '',
            availablePromptCredits: userStatus.planStatus?.availablePromptCredits ?? null,
            monthlyPromptCredits: planInfo.monthlyPromptCredits ?? null,
            availableFlowCredits: userStatus.planStatus?.availableFlowCredits ?? null,
            monthlyFlowCredits: planInfo.monthlyFlowCredits ?? null
        };

        const prevWeeklyByLabel = new Map(
            this.cachedModels
                .filter(m => typeof m.weeklyRemainingFraction === 'number')
                .map(m => [m.label, { frac: m.weeklyRemainingFraction, reset: m.weeklyResetTime || null }])
        );

        const configs = userStatus.cascadeModelConfigData?.clientModelConfigs;
        if (Array.isArray(configs) && configs.length > 0) {
            this.cachedModels = configs.map(c => {
                const prevWk = prevWeeklyByLabel.get(c.label);
                const hasQuotaObj = Boolean(c.quotaInfo && typeof c.quotaInfo === 'object');
                const isDisabled =
                    Boolean(c.disabled) ||
                    String(c.tagTitle || '').trim().toLowerCase() === 'unavailable' ||
                    String(c.modelId || '').toLowerCase().endsWith('-disabled');
                const { family, effort } = parseFamilyAndEffort(c.label, {
                    disabled: isDisabled,
                    tagTitle: c.tagTitle
                });
                // Protobuf3 ConnectRPC omits scalar float 0.0 when remainingFraction is completely exhausted
                const remFrac =
                    typeof c.quotaInfo?.remainingFraction === 'number'
                        ? c.quotaInfo.remainingFraction
                        : hasQuotaObj && c.quotaInfo.resetTime
                          ? 0
                          : null;
                return {
                    label: c.label,
                    modelId: c.modelId || '',
                    modelEnum: c.modelOrAlias?.model || c.modelOrAlias?.alias || '',
                    family,
                    effort,
                    tagTitle: c.tagTitle || '',
                    tagDescription: c.tagDescription || '',
                    disabled: isDisabled,
                    supportsImages: !!c.supportsImages,
                    remainingFraction: remFrac,
                    resetTime: c.quotaInfo?.resetTime || null,
                    weeklyRemainingFraction: prevWk ? prevWk.frac : null,
                    weeklyResetTime: prevWk ? prevWk.reset : null
                };
            });
        }

        const diskEnum = this.readLastSelectedModelFromDisk();
        const overrideEnum =
            userStatus.cascadeModelConfigData?.defaultOverrideModelConfig?.modelOrAlias?.model || null;
        const defaultEnum = diskEnum || overrideEnum || 'MODEL_PLACEHOLDER_M532';

        const currentInLiveCatalog = this.cachedModels.find(
            m => m.modelEnum === this.selectedModelEnum && !m.disabled
        );

        if ((!this._userExplicitlySelectedModel || !currentInLiveCatalog) && !this._modeOverridesModelToFast) {
            const matched =
                this.cachedModels.find(m => m.modelEnum === defaultEnum && !m.disabled) ||
                (overrideEnum ? this.cachedModels.find(m => m.modelEnum === overrideEnum && !m.disabled) : null) ||
                this.cachedModels.find(m => m.modelEnum === 'MODEL_PLACEHOLDER_M532' && !m.disabled) ||
                this.cachedModels.find(m => m.modelEnum === 'MODEL_PLACEHOLDER_M417' && !m.disabled) ||
                this.cachedModels.find(m => !m.disabled);
            if (matched) {
                this.selectedModelLabel = matched.label;
                this.selectedModelEnum = matched.modelEnum;
            }
        }

        if (this.cachedQuotaSummary?.groups?.length) {
            this._applyWeeklyGroupsToCachedModels(this.cachedQuotaSummary.groups);
        }
    }

    _getFallbackModelEnum() {
        const preferred =
            this.cachedModels.find(m => m.modelEnum === 'MODEL_PLACEHOLDER_M532' && !m.disabled) ||
            this.cachedModels.find(m => m.modelEnum === 'MODEL_PLACEHOLDER_M417' && !m.disabled) ||
            this.cachedModels.find(m => !m.disabled);
        return preferred?.modelEnum || 'MODEL_PLACEHOLDER_M532';
    }

    _classifyModelQuotaKind(modelOrLabel) {
        const text =
            typeof modelOrLabel === 'string'
                ? modelOrLabel
                : `${modelOrLabel?.family || ''} ${modelOrLabel?.label || ''} ${modelOrLabel?.modelId || ''}`;
        if (/claude|gpt/i.test(text)) return '3p';
        if (/\bargon\b/i.test(text) || /orchestrator-g1-pro/i.test(text)) return 'argon';
        return 'gemini';
    }

    _applyWeeklyGroupsToCachedModels(groups = []) {
        if (!Array.isArray(groups) || groups.length === 0) return;
        const geminiGroup = groups.find(g => !g.isThirdParty && !g.isArgon) || groups[0];
        const argonGroup = groups.find(g => g.isArgon) || null;
        const thirdPartyGroup = groups.find(g => g.isThirdParty) || null;

        const pickBuckets = grp => ({
            wk: grp?.buckets?.find(b => b.window === 'weekly') || null,
            fh: grp?.buckets?.find(b => b.window === '5h') || null
        });

        const gem = pickBuckets(geminiGroup);
        const arg = pickBuckets(argonGroup);
        const tp = pickBuckets(thirdPartyGroup);

        this.cachedModels = this.cachedModels.map(m => {
            if (m.disabled) return m;
            const kind = this._classifyModelQuotaKind(m);
            let wk = gem.wk;
            let fh = gem.fh;
            let isWeeklyOnlyGroup = false;
            if (kind === '3p') {
                wk = tp.wk || gem.wk;
                fh = tp.fh || gem.fh;
                isWeeklyOnlyGroup = Boolean(thirdPartyGroup && wk && !fh);
            } else if (kind === 'argon') {
                wk = arg.wk || gem.wk;
                fh = argonGroup ? arg.fh : gem.fh;
                isWeeklyOnlyGroup = Boolean(argonGroup && wk && !arg.fh);
            } else {
                isWeeklyOnlyGroup = Boolean(geminiGroup && wk && !fh);
            }

            const next = {
                ...m,
                ...(wk
                    ? {
                          weeklyRemainingFraction: wk.remainingFraction,
                          weeklyResetTime: wk.resetTime || null
                      }
                    : {})
            };

            if (isWeeklyOnlyGroup) {
                // Weekly-only groups (e.g. Pro-plan Gemini 4 Argon / Orchestrator (Argon)) report their weekly
                // quota inside GetUserStatus quotaInfo; clear 5h fields so the UI never fabricates a 5h badge.
                next.remainingFraction = null;
                next.resetTime = null;
            } else if (fh && typeof m.remainingFraction !== 'number') {
                next.remainingFraction = fh.remainingFraction;
                next.resetTime = fh.resetTime || null;
            }

            return next;
        });
    }

    async refreshModels() {
        await this.discoverHub();
        if (this.hubInfo) {
            const [statusSettled, quotaSettled] = await Promise.allSettled([
                this.callRpc('GetUserStatus', {}),
                this.callRpc('RetrieveUserQuotaSummary', {})
            ]);
            if (statusSettled.status === 'fulfilled' && statusSettled.value?.userStatus) {
                this.ingestUserStatus(statusSettled.value.userStatus);
            }
            if (quotaSettled.status === 'fulfilled' && Array.isArray(quotaSettled.value?.response?.groups)) {
                const normGroups = this._normalizeQuotaGroups(quotaSettled.value.response.groups);
                this._applyWeeklyGroupsToCachedModels(normGroups);
            }
        }
        return {
            success: true,
            models: this.cachedModels.map(m => m.label),
            modelDetails: this.cachedModels,
            selectedModel: this.selectedModelLabel
        };
    }

    _normalizeQuotaGroups(rawGroups = [], nowMs = Date.now()) {
        if (!Array.isArray(rawGroups)) return [];
        return rawGroups.map((g, idx) => {
            const displayName = String(g?.displayName || g?.groupName || `Model Group ${idx + 1}`).trim();
            const rawBuckets = Array.isArray(g?.buckets) ? g.buckets : Array.isArray(g?.quotaBuckets) ? g.quotaBuckets : [];
            const isThirdParty =
                typeof g?.isThirdParty === 'boolean'
                    ? g.isThirdParty
                    : /claude|gpt|third/i.test(`${displayName} ${g?.description || ''}`);
            const isArgon =
                typeof g?.isArgon === 'boolean'
                    ? g.isArgon
                    : !isThirdParty &&
                      (/\bargon\b/i.test(displayName) ||
                          (rawBuckets.length > 0 && rawBuckets.every(b => /argon/i.test(String(b?.bucketId || '')))));
            const buckets = rawBuckets.map(b => {
                let rawFrac = 1;
                if (typeof b?.remainingFraction === 'number') {
                    rawFrac = b.remainingFraction;
                } else if (
                    b &&
                    (b.resetTime || /exhausted|reached|used all|\b0%\b/i.test(String(b.description || '')))
                ) {
                    // Protobuf3 ConnectRPC omits scalar float 0.0 default when a bucket is 0% exhausted
                    rawFrac = 0;
                }
                const frac = Math.max(0, Math.min(1, rawFrac));
                const remainingPercent = Math.round(frac * 100);
                const rawWin = String(b?.window || b?.bucketId || b?.displayName || '').toLowerCase();
                const win = /week|7d/.test(rawWin) ? 'weekly' : '5h';
                return {
                    bucketId: String(b?.bucketId || `${idx}-${win}`),
                    displayName: String(b?.displayName || (win === 'weekly' ? 'Weekly Limit Remaining' : 'Five Hour Limit Remaining')),
                    description: String(b?.description || ''),
                    window: win,
                    remainingFraction: frac,
                    remainingPercent,
                    usedPercent: Math.max(0, 100 - remainingPercent),
                    resetTime: b?.resetTime || null,
                    resetInHuman: formatResetCountdown(b?.resetTime || '', nowMs)
                };
            });
            return {
                displayName,
                description: String(g?.description || ''),
                isThirdParty,
                isArgon,
                groupKey: isThirdParty ? '3p' : isArgon ? 'argon' : 'gemini',
                buckets
            };
        });
    }

    _buildFallbackQuotaGroupsFromModels(nowMs = Date.now()) {
        const activeModels = this.cachedModels.filter(m => !m.disabled);
        const geminiModels = activeModels.filter(m => this._classifyModelQuotaKind(m) === 'gemini');
        const argonModels = activeModels.filter(m => this._classifyModelQuotaKind(m) === 'argon');
        const thirdPartyModels = activeModels.filter(m => this._classifyModelQuotaKind(m) === '3p');

        const buildGroup = (title, desc, list, { isThirdParty = false, isArgon = false, prefix = 'gemini', weeklyOnly = false } = {}) => {
            const sample =
                list.find(m => typeof m.weeklyRemainingFraction === 'number' || typeof m.remainingFraction === 'number') ||
                list[0] ||
                {};
            const fhFrac = typeof sample.remainingFraction === 'number' ? Math.max(0, Math.min(1, sample.remainingFraction)) : 1;
            const wkFrac =
                typeof sample.weeklyRemainingFraction === 'number'
                    ? Math.max(0, Math.min(1, sample.weeklyRemainingFraction))
                    : fhFrac;
            const fhPct = Math.round(fhFrac * 100);
            const wkPct = Math.round(wkFrac * 100);
            const wkReset = sample.weeklyResetTime || (weeklyOnly ? sample.resetTime || null : null);
            const buckets = [
                {
                    bucketId: `${prefix}-weekly`,
                    displayName: isArgon ? 'Gemini 4 Argon Weekly Limit' : 'Weekly Limit Remaining',
                    description: wkReset ? `Refreshes in ${formatResetCountdown(wkReset, nowMs)}` : '',
                    window: 'weekly',
                    remainingFraction: wkFrac,
                    remainingPercent: wkPct,
                    usedPercent: Math.max(0, 100 - wkPct),
                    resetTime: wkReset,
                    resetInHuman: formatResetCountdown(wkReset || '', nowMs)
                }
            ];
            if (!weeklyOnly) {
                buckets.push({
                    bucketId: `${prefix}-5h`,
                    displayName: 'Five Hour Limit Remaining',
                    description: sample.resetTime ? `Refreshes in ${formatResetCountdown(sample.resetTime, nowMs)}` : '',
                    window: '5h',
                    remainingFraction: fhFrac,
                    remainingPercent: fhPct,
                    usedPercent: Math.max(0, 100 - fhPct),
                    resetTime: sample.resetTime || null,
                    resetInHuman: formatResetCountdown(sample.resetTime || '', nowMs)
                });
            }
            return {
                displayName: title,
                description: desc,
                isThirdParty,
                isArgon,
                groupKey: isThirdParty ? '3p' : isArgon ? 'argon' : 'gemini',
                buckets
            };
        };

        const out = [
            buildGroup(
                'Gemini Models',
                'Models within this group: Gemini 4 Neon, Gemini 4 Hydrogen, Orchestrator (Neon), Gemini 3.8 Flash',
                geminiModels,
                { isThirdParty: false, isArgon: false, prefix: 'gemini' }
            )
        ];
        if (thirdPartyModels.length > 0) {
            out.push(
                buildGroup(
                    'Claude and GPT models',
                    'Models within this group: Claude Opus 5.5, Claude Sonnet 5.5, GPT-OSS 120B',
                    thirdPartyModels,
                    { isThirdParty: true, isArgon: false, prefix: '3p' }
                )
            );
        }
        if (argonModels.length > 0) {
            out.push(
                buildGroup(
                    'Gemini 4 Argon',
                    'Models within this group: Gemini 4 Argon, Orchestrator (Argon)',
                    argonModels,
                    { isThirdParty: false, isArgon: true, prefix: 'gemini-argon', weeklyOnly: true }
                )
            );
        }
        return out;
    }

    _computeQuotaHeadline(groups = []) {
        const currentKind = this._classifyModelQuotaKind(this.selectedModelLabel || '');
        let activeGroup = null;
        if (currentKind === '3p') {
            activeGroup = groups.find(g => g.isThirdParty);
        } else if (currentKind === 'argon') {
            activeGroup =
                groups.find(g => g.isArgon || (!g.isThirdParty && /\bargon\b/i.test(g.displayName || ''))) ||
                groups.find(g => !g.isThirdParty && !g.isArgon);
        } else {
            activeGroup = groups.find(g => !g.isThirdParty && !g.isArgon);
        }
        activeGroup = activeGroup || groups[0] || null;
        const wk = activeGroup?.buckets?.find(b => b.window === 'weekly') || activeGroup?.buckets?.[0] || null;
        const fh = activeGroup?.buckets?.find(b => b.window === '5h') || null;
        return {
            groupName: activeGroup?.displayName || 'Model Quota',
            weeklyRemainingFraction: wk ? wk.remainingFraction : null,
            weeklyRemainingPercent: wk ? wk.remainingPercent : null,
            weeklyResetTime: wk?.resetTime || null,
            weeklyResetHuman: wk?.resetInHuman || '',
            fiveHourRemainingFraction: fh ? fh.remainingFraction : null,
            fiveHourRemainingPercent: fh ? fh.remainingPercent : null,
            fiveHourResetTime: fh?.resetTime || null,
            fiveHourResetHuman: fh?.resetInHuman || ''
        };
    }

    async getQuotaSummary(forceRefresh = false) {
        await this.discoverHub();
        const now = Date.now();

        if (this.hubInfo && (forceRefresh || !this.cachedQuotaSummary || now - this.lastQuotaFetchMs > 15000)) {
            const [quotaSettled, statusSettled] = await Promise.allSettled([
                this.callRpc('RetrieveUserQuotaSummary', forceRefresh ? { forceRefresh: true } : {}),
                this.callRpc('GetUserStatus', {})
            ]);

            if (statusSettled.status === 'fulfilled' && statusSettled.value?.userStatus) {
                this.ingestUserStatus(statusSettled.value.userStatus);
            }

            let groups = [];
            let description = '';
            let source = 'hub_rpc';

            if (quotaSettled.status === 'fulfilled' && Array.isArray(quotaSettled.value?.response?.groups)) {
                groups = this._normalizeQuotaGroups(quotaSettled.value.response.groups, now);
                description = String(quotaSettled.value.response?.description || '');
                this._applyWeeklyGroupsToCachedModels(groups);
            }

            if (groups.length === 0) {
                groups = this._buildFallbackQuotaGroupsFromModels(now);
                source = 'model_config_fallback';
                description =
                    description ||
                    'Within each group, models share a weekly limit and a 5-hour limit. Quota is consumed proportionally to token cost.';
            }

            this.cachedQuotaSummary = {
                groups,
                description,
                source,
                fetchedAt: new Date(now).toISOString()
            };
            this.lastQuotaFetchMs = now;
        }

        const baseGroups = this.cachedQuotaSummary?.groups?.length
            ? this._normalizeQuotaGroups(this.cachedQuotaSummary.groups, now)
            : this._buildFallbackQuotaGroupsFromModels(now);
        const headline = this._computeQuotaHeadline(baseGroups);
        const cid = this.activeCascadeId;
        const defaultMaxCtx = /claude|gpt/i.test(this.selectedModelLabel || '') ? 200000 : 1048576;
        const contextUsage = (cid && this.lastContextUsageByCascade.get(cid)) || {
            usedTokens: 0,
            maxTokens: defaultMaxCtx,
            usedPercent: 0,
            inputTokens: 0,
            cacheReadTokens: 0,
            totalOutputTokens: 0,
            totalThinkingTokens: 0,
            turnCount: 0
        };

        return {
            success: true,
            hubConnected: !!this.hubInfo,
            source: this.cachedQuotaSummary?.source || 'offline_fallback',
            targetApp: this.targetApp,
            selectedModel: this.selectedModelLabel,
            description:
                this.cachedQuotaSummary?.description ||
                'Within each group, models share a weekly limit and a 5-hour limit.',
            groups: baseGroups,
            headline,
            contextUsage,
            user: this.userProfile,
            updatedAt: this.cachedQuotaSummary?.fetchedAt || new Date(now).toISOString()
        };
    }

    detectDesktopInstallations() {
        const home = os.homedir();
        const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');

        const normalCandidates =
            process.platform === 'win32'
                ? [join(localAppData, 'Programs', 'antigravity', 'Antigravity.exe')]
                : process.platform === 'darwin'
                  ? ['/Applications/Antigravity.app']
                  : [join(home, '.local', 'share', 'antigravity', 'antigravity'), '/usr/bin/antigravity'];

        const ideCandidates =
            process.platform === 'win32'
                ? [
                      join(localAppData, 'Programs', 'Antigravity IDE', 'Antigravity IDE.exe'),
                      join(localAppData, 'Programs', 'Antigravity IDE', 'bin', 'antigravity-ide.cmd')
                  ]
                : process.platform === 'darwin'
                  ? ['/Applications/Antigravity IDE.app']
                  : [
                        join(home, '.local', 'share', 'antigravity-ide', 'antigravity-ide'),
                        join(home, 'antigravity-ide', 'antigravity-ide'),
                        '/usr/bin/antigravity-ide'
                    ];

        const normalExe = normalCandidates.find(p => fs.existsSync(p)) || null;
        const ideExe = ideCandidates.find(p => fs.existsSync(p)) || null;

        let ideCli = null;
        let ideVersion = null;
        let editorVersion = null;
        if (process.platform === 'win32') {
            const cmdCandidate = join(localAppData, 'Programs', 'Antigravity IDE', 'bin', 'antigravity-ide.cmd');
            if (fs.existsSync(cmdCandidate)) ideCli = cmdCandidate;
            const prodJson = join(localAppData, 'Programs', 'Antigravity IDE', 'resources', 'app', 'product.json');
            if (fs.existsSync(prodJson)) {
                try {
                    const parsed = JSON.parse(fs.readFileSync(prodJson, 'utf-8'));
                    ideVersion = parsed.ideVersion || parsed.antigravityVersion || null;
                    editorVersion = parsed.version || null;
                } catch {}
            }
        } else if (process.platform === 'darwin' && ideExe) {
            const macCli = '/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide';
            if (fs.existsSync(macCli)) ideCli = macCli;
        }

        return {
            normalApp: {
                installed: Boolean(normalExe || this.hubInfo),
                exePath: normalExe,
                version: this.hubInfo?.lsVersion || null
            },
            ideApp: {
                installed: Boolean(ideExe),
                exePath: ideExe,
                cliPath: ideCli || ideExe,
                ideVersion,
                editorVersion,
                urlProtocol: 'antigravity-ide'
            }
        };
    }

    async discoverIdeWorkspaces() {
        const seenNorm = new Set();
        const workspaces = [];

        const pushWorkspace = (rawDir, source) => {
            if (!rawDir || typeof rawDir !== 'string') return;
            const localPath = uriToLocalPath(rawDir).trim();
            if (!localPath) return;
            try {
                const resolved = resolve(localPath);
                if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) return;
                // Skip ephemeral internal brain directories unless explicitly chosen
                if (source !== 'explicit' && resolved.toLowerCase().includes(`${sep}.gemini${sep}antigravity${sep}brain${sep}`)) {
                    return;
                }
                const normKey = process.platform === 'win32' ? resolved.toLowerCase() : resolved;
                if (seenNorm.has(normKey)) return;
                seenNorm.add(normKey);
                workspaces.push({
                    path: resolved,
                    uri: this._toFileUri(resolved),
                    name: basename(resolved) || resolved,
                    shortPath: formatShortWorkspacePath(resolved, resolved),
                    source
                });
            } catch {}
        };

        if (this.activeWorkspacePath) {
            pushWorkspace(this.activeWorkspacePath, 'explicit');
        }

        // 1. Active conversation workspace + known Hub workspaces
        for (const u of this.knownWorkspaceUris) {
            pushWorkspace(u, 'conversation');
        }

        // 2. Current working directory (e.g. Remote-Control project)
        try {
            pushWorkspace(process.cwd(), 'current_project');
        } catch {}

        // 3. Hub ListProjects / ReadProjects
        const hubUris = await this._discoverWorkspaceUris().catch(() => []);
        for (const u of hubUris) {
            pushWorkspace(u, 'hub_project');
        }

        // 4. Antigravity IDE storage.json recent workspaces
        try {
            const storageCandidates = [
                join(os.homedir(), 'AppData', 'Roaming', 'Antigravity IDE', 'User', 'globalStorage', 'storage.json'),
                join(os.homedir(), 'Library', 'Application Support', 'Antigravity IDE', 'User', 'globalStorage', 'storage.json'),
                join(os.homedir(), '.config', 'Antigravity IDE', 'User', 'globalStorage', 'storage.json')
            ];
            for (const sp of storageCandidates) {
                if (!fs.existsSync(sp)) continue;
                const sj = JSON.parse(fs.readFileSync(sp, 'utf-8'));
                const assoc = Object.keys(sj?.profileAssociations?.workspaces || {});
                for (const u of assoc) pushWorkspace(u, 'ide_recent');
                const lastFolder = sj?.windowsState?.lastActiveWindow?.folder;
                if (lastFolder) pushWorkspace(lastFolder, 'ide_recent');
                for (const fObj of sj?.backupWorkspaces?.folders || []) {
                    if (fObj?.folderUri) pushWorkspace(fObj.folderUri, 'ide_recent');
                }
            }
        } catch {}

        if (!this.activeWorkspacePath && workspaces.length > 0) {
            this.activeWorkspacePath = workspaces[0].path;
        }

        return workspaces;
    }

    setActiveWorkspace(targetDir) {
        if (!targetDir || typeof targetDir !== 'string') {
            return { error: 'workspacePath is required' };
        }
        const local = uriToLocalPath(targetDir).trim();
        try {
            const resolved = resolve(local);
            if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
                return { error: 'Workspace directory does not exist on host PC' };
            }
            this.activeWorkspacePath = resolved;
            this.knownWorkspaceUris.add(this._toFileUri(resolved));
            return {
                success: true,
                activeWorkspace: {
                    path: resolved,
                    uri: this._toFileUri(resolved),
                    name: basename(resolved) || resolved
                }
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    async switchTargetApp({ target = 'antigravity', workspacePath = null } = {}) {
        const normalized = String(target || '').toLowerCase() === 'ide' ? 'ide' : 'antigravity';
        this.targetApp = normalized;
        if (workspacePath) {
            const wsRes = this.setActiveWorkspace(workspacePath);
            if (wsRes.error) return wsRes;
        }
        await this.discoverHub(true);
        return this.getIdeStatus();
    }

    async getIdeStatus(cdpConnected = false) {
        await this.discoverHub();
        const installs = this.detectDesktopInstallations();
        const procSnap = await this._inspectRunningDesktopProcesses(false);
        const workspaces = await this.discoverIdeWorkspaces();
        const activeWs =
            workspaces.find(w =>
                process.platform === 'win32'
                    ? w.path.toLowerCase() === String(this.activeWorkspacePath || '').toLowerCase()
                    : w.path === this.activeWorkspacePath
            ) ||
            workspaces[0] ||
            null;

        const ideDaemon = this.liveDaemons.find(d => d.kind === 'ide') || null;
        const hubDaemon = this.liveDaemons.find(d => d.kind === 'antigravity') || this.hubInfo || null;
        const sessionChangedFiles =
            (this.activeCascadeId && this.lastChangedFilesByCascade.get(this.activeCascadeId)) || [];

        return {
            success: true,
            targetApp: this.targetApp,
            sharedHubBackend: Boolean(this.hubInfo?.sharedHubBackend),
            normalHub: {
                installed: installs.normalApp.installed,
                running: Boolean(hubDaemon || procSnap.hubAppRunning || this.hubInfo),
                lsVersion: hubDaemon?.lsVersion || this.hubInfo?.lsVersion || null,
                httpPort: hubDaemon?.httpPort || this.hubInfo?.httpPort || null
            },
            ideApp: {
                installed: installs.ideApp.installed,
                exePath: installs.ideApp.exePath,
                ideVersion: installs.ideApp.ideVersion,
                editorVersion: installs.ideApp.editorVersion,
                running: Boolean(procSnap.ideRunning || ideDaemon),
                daemonConnected: Boolean(ideDaemon),
                daemonPort: ideDaemon?.httpPort || null,
                cdpConnected: Boolean(cdpConnected)
            },
            activeWorkspace: activeWs,
            workspaces,
            sessionChangedFiles
        };
    }

    async openInDesktopApp({ target = 'ide', workspacePath = null, filePath = null, line = null } = {}) {
        const installs = this.detectDesktopInstallations();
        const mode = String(target || 'ide').toLowerCase() === 'antigravity' ? 'antigravity' : 'ide';

        if (workspacePath) {
            const wsSet = this.setActiveWorkspace(workspacePath);
            if (wsSet.error) return wsSet;
        } else if (!this.activeWorkspacePath) {
            await this.discoverIdeWorkspaces();
        }

        const wsRoot = this.activeWorkspacePath || process.cwd();
        let resolvedTargetFile = null;
        if (filePath) {
            const safeFile = this.resolveSafeWorkspacePath(wsRoot, filePath);
            if (!fs.existsSync(safeFile)) {
                return { error: 'Target file does not exist inside workspace' };
            }
            resolvedTargetFile = safeFile;
        }

        if (mode === 'ide') {
            if (!installs.ideApp.installed || !installs.ideApp.exePath) {
                return { error: 'Antigravity IDE is not installed on this PC' };
            }
            const args = [];
            if (wsRoot && fs.existsSync(wsRoot)) args.push(wsRoot);
            if (resolvedTargetFile) {
                const lineNum = Number.isFinite(Number(line)) && Number(line) > 0 ? Math.floor(Number(line)) : 1;
                args.push('--goto', `${resolvedTargetFile}:${lineNum}`);
            }

            if (process.env.AGY_DISABLE_DESKTOP_LAUNCH === '1') {
                return {
                    success: true,
                    dryRun: true,
                    launched: 'ide',
                    exePath: installs.ideApp.exePath,
                    args
                };
            }

            if (process.platform === 'darwin' && installs.ideApp.exePath.endsWith('.app')) {
                const child = spawn('open', ['-a', installs.ideApp.exePath, ...args], {
                    detached: true,
                    stdio: 'ignore'
                });
                child.unref();
            } else {
                const child = spawn(installs.ideApp.exePath, args, {
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: false
                });
                child.unref();
            }

            return {
                success: true,
                launched: 'ide',
                workspacePath: wsRoot,
                filePath: resolvedTargetFile
            };
        }

        if (!installs.normalApp.exePath) {
            return { error: 'Antigravity desktop binary not found' };
        }
        if (process.env.AGY_DISABLE_DESKTOP_LAUNCH === '1') {
            return {
                success: true,
                dryRun: true,
                launched: 'antigravity',
                exePath: installs.normalApp.exePath
            };
        }

        if (process.platform === 'darwin' && installs.normalApp.exePath.endsWith('.app')) {
            const child = spawn('open', ['-a', installs.normalApp.exePath], { detached: true, stdio: 'ignore' });
            child.unref();
        } else {
            const child = spawn(installs.normalApp.exePath, [], { detached: true, stdio: 'ignore' });
            child.unref();
        }
        return { success: true, launched: 'antigravity' };
    }

    resolveSafeWorkspacePath(workspaceRoot, relOrUri = '') {
        if (!workspaceRoot || typeof workspaceRoot !== 'string') {
            const err = new Error('No active workspace configured');
            err.statusCode = 400;
            throw err;
        }
        const rawInput = String(relOrUri ?? '');
        if (rawInput.includes('\0')) {
            const err = new Error('Invalid null byte in path');
            err.statusCode = 400;
            throw err;
        }

        const canonicalRoot = fs.realpathSync(resolve(workspaceRoot));
        const normRoot = process.platform === 'win32' ? canonicalRoot.toLowerCase() : canonicalRoot;
        const normRootPrefix = normRoot.endsWith(sep) ? normRoot : normRoot + sep;

        const cleanedInput = uriToLocalPath(rawInput).trim();
        let candidate;
        if (!cleanedInput || cleanedInput === '.' || cleanedInput === '/') {
            candidate = canonicalRoot;
        } else {
            const maybeAbs = resolve(cleanedInput);
            const normMaybeAbs = process.platform === 'win32' ? maybeAbs.toLowerCase() : maybeAbs;
            if (
                (/^file:\/\//i.test(rawInput) || /^[a-zA-Z]:[\\/]/.test(cleanedInput) || cleanedInput.startsWith('/')) &&
                (normMaybeAbs === normRoot || normMaybeAbs.startsWith(normRootPrefix))
            ) {
                candidate = maybeAbs;
            } else if (/^file:\/\//i.test(rawInput) || /^[a-zA-Z]:[\\/]/.test(cleanedInput)) {
                const err = new Error('Path outside active workspace is forbidden');
                err.statusCode = 403;
                throw err;
            } else {
                candidate = resolve(canonicalRoot, cleanedInput.replace(/^[/\\]+/, ''));
            }
        }

        const normCandidate = process.platform === 'win32' ? candidate.toLowerCase() : candidate;
        if (normCandidate !== normRoot && !normCandidate.startsWith(normRootPrefix)) {
            const err = new Error('Path outside active workspace is forbidden');
            err.statusCode = 403;
            throw err;
        }

        let canonicalTarget;
        if (fs.existsSync(candidate)) {
            canonicalTarget = fs.realpathSync(candidate);
        } else {
            const parentDir = dirname(candidate);
            if (!fs.existsSync(parentDir)) {
                const err = new Error('Parent directory does not exist inside workspace');
                err.statusCode = 404;
                throw err;
            }
            const canonicalParent = fs.realpathSync(parentDir);
            canonicalTarget = join(canonicalParent, basename(candidate));
        }

        const normTarget = process.platform === 'win32' ? canonicalTarget.toLowerCase() : canonicalTarget;
        if (normTarget !== normRoot && !normTarget.startsWith(normRootPrefix)) {
            const err = new Error('Path outside active workspace is forbidden');
            err.statusCode = 403;
            throw err;
        }

        return canonicalTarget;
    }

    async listWorkspaceFiles({ dir = '', search = '' } = {}) {
        if (!this.activeWorkspacePath) {
            await this.discoverIdeWorkspaces();
        }
        const wsRoot = fs.realpathSync(resolve(this.activeWorkspacePath || process.cwd()));
        const ignoredDirs = new Set([
            '.git',
            'node_modules',
            '__pycache__',
            'venv',
            '.venv',
            '.gradle',
            '.idea',
            'build',
            'dist',
            '.next'
        ]);

        const query = String(search || '').trim().toLowerCase();
        if (query) {
            const matches = [];
            const walk = (currDir, depth) => {
                if (depth > 5 || matches.length >= 80) return;
                let dirents = [];
                try {
                    dirents = fs.readdirSync(currDir, { withFileTypes: true });
                } catch {
                    return;
                }
                for (const d of dirents) {
                    if (matches.length >= 80) break;
                    if (d.isDirectory()) {
                        if (ignoredDirs.has(d.name)) continue;
                        walk(join(currDir, d.name), depth + 1);
                    } else if (d.isFile()) {
                        const full = join(currDir, d.name);
                        const rel = relative(wsRoot, full).replace(/\\/g, '/');
                        if (rel.toLowerCase().includes(query)) {
                            let sizeBytes = 0;
                            try { sizeBytes = fs.statSync(full).size; } catch {}
                            matches.push({
                                name: d.name,
                                relPath: rel,
                                type: 'file',
                                sizeBytes,
                                ext: extname(d.name).replace(/^\./, '').toLowerCase()
                            });
                        }
                    }
                }
            };
            walk(wsRoot, 0);
            matches.sort((a, b) => {
                const aBase = a.name.toLowerCase().startsWith(query) ? 0 : 1;
                const bBase = b.name.toLowerCase().startsWith(query) ? 0 : 1;
                if (aBase !== bBase) return aBase - bBase;
                return a.relPath.localeCompare(b.relPath);
            });
            return {
                success: true,
                workspacePath: wsRoot,
                workspaceName: basename(wsRoot) || wsRoot,
                currentDir: '',
                search: query,
                entries: matches
            };
        }

        const targetDir = this.resolveSafeWorkspacePath(wsRoot, dir);
        if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
            const err = new Error('Directory not found');
            err.statusCode = 404;
            throw err;
        }

        const relDir = relative(wsRoot, targetDir).replace(/\\/g, '/');
        const dirents = fs.readdirSync(targetDir, { withFileTypes: true });
        const entries = [];

        for (const d of dirents) {
            if (d.name === '.git' || d.name === '__pycache__') continue;
            const full = join(targetDir, d.name);
            const rel = relative(wsRoot, full).replace(/\\/g, '/');
            if (d.isDirectory()) {
                entries.push({
                    name: d.name,
                    relPath: rel,
                    type: 'dir',
                    deemphasized: ignoredDirs.has(d.name)
                });
            } else if (d.isFile()) {
                let sizeBytes = 0;
                try { sizeBytes = fs.statSync(full).size; } catch {}
                entries.push({
                    name: d.name,
                    relPath: rel,
                    type: 'file',
                    sizeBytes,
                    ext: extname(d.name).replace(/^\./, '').toLowerCase()
                });
            }
        }

        entries.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            if (Boolean(a.deemphasized) !== Boolean(b.deemphasized)) return a.deemphasized ? 1 : -1;
            return a.name.localeCompare(b.name);
        });

        return {
            success: true,
            workspacePath: wsRoot,
            workspaceName: basename(wsRoot) || wsRoot,
            currentDir: relDir === '.' ? '' : relDir,
            parentDir: relDir && relDir !== '.' ? dirname(relDir).replace(/^\.$/, '').replace(/\\/g, '/') : null,
            entries
        };
    }

    async readWorkspaceFile(filePathParam, { allowKnownWorkspaceSwitch = false } = {}) {
        if (!filePathParam || typeof filePathParam !== 'string') {
            const err = new Error('File path is required');
            err.statusCode = 400;
            throw err;
        }
        if (!this.activeWorkspacePath) {
            await this.discoverIdeWorkspaces();
        }
        let wsRoot = fs.realpathSync(resolve(this.activeWorkspacePath || process.cwd()));
        let fullPath;
        let switchedWorkspace = null;
        try {
            fullPath = this.resolveSafeWorkspacePath(wsRoot, filePathParam);
        } catch (err) {
            if (allowKnownWorkspaceSwitch && err?.statusCode === 403) {
                const knownList = await this.discoverIdeWorkspaces().catch(() => []);
                for (const candWs of knownList) {
                    if (!candWs?.path) continue;
                    try {
                        const candRoot = fs.realpathSync(resolve(candWs.path));
                        const candFile = this.resolveSafeWorkspacePath(candRoot, filePathParam);
                        if (fs.existsSync(candFile) && fs.statSync(candFile).isFile()) {
                            this.activeWorkspacePath = candRoot;
                            wsRoot = candRoot;
                            fullPath = candFile;
                            switchedWorkspace = candRoot;
                            break;
                        }
                    } catch {}
                }
            }
            if (!fullPath) throw err;
        }

        if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
            const err = new Error('File not found in workspace');
            err.statusCode = 404;
            throw err;
        }

        const stat = fs.statSync(fullPath);
        const MAX_BYTES = 512 * 1024; // 512 KB mobile viewer cap
        const readLen = Math.min(stat.size, MAX_BYTES);
        const buf = Buffer.alloc(readLen);
        const fd = fs.openSync(fullPath, 'r');
        try {
            fs.readSync(fd, buf, 0, readLen, 0);
        } finally {
            fs.closeSync(fd);
        }

        // Detect binary files via null byte scan in first 8 KB
        const sampleLen = Math.min(readLen, 8192);
        let isBinary = false;
        for (let i = 0; i < sampleLen; i++) {
            if (buf[i] === 0) {
                isBinary = true;
                break;
            }
        }

        const relPath = relative(wsRoot, fullPath).replace(/\\/g, '/');
        const ext = extname(fullPath).replace(/^\./, '').toLowerCase();
        const content = isBinary ? '' : buf.toString('utf-8');
        const lineCount = isBinary ? 0 : content ? content.split(/\r?\n/).length : 0;

        return {
            success: true,
            path: relPath,
            absolutePath: fullPath,
            absoluteUri: this._toFileUri(fullPath),
            fileName: basename(fullPath),
            language: ext || 'text',
            sizeBytes: stat.size,
            isBinary,
            truncated: stat.size > MAX_BYTES,
            lineCount,
            content,
            ...(switchedWorkspace ? { switchedWorkspace } : {})
        };
    }

    async writeWorkspaceFile({ path: filePathParam, content }) {
        if (!filePathParam || typeof filePathParam !== 'string') {
            const err = new Error('File path is required');
            err.statusCode = 400;
            throw err;
        }
        if (typeof content !== 'string') {
            const err = new Error('String content is required');
            err.statusCode = 400;
            throw err;
        }
        if (!this.activeWorkspacePath) {
            await this.discoverIdeWorkspaces();
        }
        const wsRoot = fs.realpathSync(resolve(this.activeWorkspacePath || process.cwd()));
        const fullPath = this.resolveSafeWorkspacePath(wsRoot, filePathParam);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            const err = new Error('Cannot overwrite a directory');
            err.statusCode = 400;
            throw err;
        }

        fs.writeFileSync(fullPath, content, 'utf-8');
        const relPath = relative(wsRoot, fullPath).replace(/\\/g, '/');
        return {
            success: true,
            path: relPath,
            absoluteUri: this._toFileUri(fullPath),
            sizeBytes: Buffer.byteLength(content, 'utf-8'),
            lineCount: content.split(/\r?\n/).length
        };
    }

    async getWorkspaceGitStatus({ diffFile = '' } = {}) {
        if (!this.activeWorkspacePath) {
            await this.discoverIdeWorkspaces();
        }
        const wsRoot = fs.realpathSync(resolve(this.activeWorkspacePath || process.cwd()));

        try {
            const { stdout: statusOut } = await execFileAsync(
                'git',
                ['-C', wsRoot, 'status', '--porcelain=v1', '-b'],
                { timeout: 5000 }
            );

            const lines = statusOut.replace(/\r\n/g, '\n').split('\n').filter(Boolean);
            let branch = 'HEAD';
            let ahead = 0;
            let behind = 0;
            const files = [];

            for (const ln of lines) {
                if (ln.startsWith('## ')) {
                    const header = ln.slice(3).trim();
                    const brMatch = /^([^\s.]+)/.exec(header);
                    if (brMatch) branch = brMatch[1];
                    const aheadM = /ahead\s+(\d+)/.exec(header);
                    const behindM = /behind\s+(\d+)/.exec(header);
                    if (aheadM) ahead = Number(aheadM[1]);
                    if (behindM) behind = Number(behindM[1]);
                    continue;
                }
                const xy = ln.slice(0, 2);
                let relFile = ln.slice(3).trim();
                if (relFile.includes(' -> ')) {
                    relFile = relFile.split(' -> ').pop().trim();
                }
                relFile = relFile.replace(/^"|"$/g, '');
                let state = 'modified';
                if (xy === '??') state = 'untracked';
                else if (xy.includes('A')) state = 'added';
                else if (xy.includes('D')) state = 'deleted';
                else if (xy.includes('R')) state = 'renamed';

                files.push({
                    path: relFile,
                    xy: xy.trim() || 'M',
                    staged: xy[0] !== ' ' && xy[0] !== '?',
                    state
                });
            }

            let diffText = '';
            let resolvedDiffRel = '';
            if (diffFile) {
                const safeTarget = this.resolveSafeWorkspacePath(wsRoot, diffFile);
                resolvedDiffRel = relative(wsRoot, safeTarget).replace(/\\/g, '/');
                const { stdout: rawDiff } = await execFileAsync(
                    'git',
                    ['-C', wsRoot, 'diff', 'HEAD', '--', resolvedDiffRel],
                    { timeout: 5000 }
                ).catch(() =>
                    execFileAsync('git', ['-C', wsRoot, 'diff', '--', resolvedDiffRel], { timeout: 5000 })
                ).catch(() => ({ stdout: '' }));
                diffText = rawDiff.slice(0, 48000);

                // If untracked new file has empty git diff, show clean new-file preview
                if (!diffText && fs.existsSync(safeTarget) && fs.statSync(safeTarget).isFile()) {
                    const preview = await this.readWorkspaceFile(resolvedDiffRel).catch(() => null);
                    if (preview && !preview.isBinary && preview.content) {
                        diffText = preview.content
                            .split(/\r?\n/)
                            .slice(0, 200)
                            .map(l => `+${l}`)
                            .join('\n');
                    }
                }
            }

            return {
                success: true,
                isGitRepo: true,
                workspacePath: wsRoot,
                branch,
                ahead,
                behind,
                changedCount: files.length,
                files,
                diffFile: resolvedDiffRel || null,
                diff: diffText
            };
        } catch (err) {
            if (err?.statusCode === 403 || err?.statusCode === 400) throw err;
            return {
                success: true,
                isGitRepo: false,
                workspacePath: wsRoot,
                branch: null,
                ahead: 0,
                behind: 0,
                changedCount: 0,
                files: [],
                diffFile: null,
                diff: ''
            };
        }
    }

    async exportConversationMarkdown(targetCascadeId = null) {
        await this.discoverHub();
        if (!this.hubInfo) return { error: 'Antigravity Hub disconnected' };

        const cid = targetCascadeId || (await this.ensureActiveConversationSelected());
        if (!cid) return { error: 'No active conversation to export' };

        const [trajResp, allTrajsResp] = await Promise.all([
            this.callRpc('GetCascadeTrajectory', { cascadeId: cid }),
            this.callRpc('GetAllCascadeTrajectories', {}).catch(() => ({}))
        ]);

        const summary = allTrajsResp?.trajectorySummaries?.[cid] || {};
        const title =
            summary?.annotations?.title ||
            summary?.summary ||
            `Antigravity Conversation ${cid.slice(0, 8)}`;
        const steps = trajResp?.trajectory?.steps || [];

        const mdSections = [
            `# ${title}`,
            '',
            `- **Conversation ID**: \`${cid}\``,
            `- **Exported**: ${new Date().toISOString()}`,
            `- **Active Model**: ${this.selectedModelLabel}`,
            '',
            '---',
            ''
        ];

        for (const step of steps) {
            if (step.metadata?.source === 'CORTEX_STEP_SOURCE_SYSTEM_SDK') continue;
            const stType = step.type || '';
            if (stType === 'CORTEX_STEP_TYPE_USER_INPUT') {
                const items = step.userInput?.items || [];
                const parts = [];
                const legacyNotes = [];
                const stripLegacyExportNotes = rawStr =>
                    String(rawStr || '')
                        .replace(
                            /\[Attached:\s*([^\]]+)\]\((file:\/\/\/[^)\r\n]+\/uploads\/[^)\r\n]+)\)/g,
                            (_full, legacyName, legacyUri) => {
                                const trimmedName = String(legacyName || '').trim();
                                if (trimmedName) {
                                    legacyNotes.push({
                                        name: trimmedName,
                                        uri: legacyUri,
                                        mime: resolveAttachmentMimeType(trimmedName, ''),
                                        consumed: false
                                    });
                                }
                                return '';
                            }
                        )
                        .replace(/\n{3,}/g, '\n\n')
                        .trim();

                for (const it of items) {
                    if (typeof it.text === 'string' && it.text.trim()) {
                        const strippedLegacy = stripLegacyExportNotes(it.text);
                        const voiceParsed = parseVoiceContextText(strippedLegacy);
                        const cleanTxt = voiceParsed.text.trim();
                        if (cleanTxt) parts.push(voiceParsed.isVoice ? `🎙️ ${cleanTxt}` : cleanTxt);
                    } else if (it.item?.slashCommand?.info?.name) {
                        parts.push(`\`/${it.item.slashCommand.info.name}\``);
                    } else if (it.item?.recipe) {
                        parts.push(`\`/${it.item.recipe.title || it.item.recipe.recipeId}\``);
                    } else if (it.item?.textBlock) {
                        const tb = it.item.textBlock;
                        const content = String(tb.content || '').trim();
                        if (content) {
                            parts.push(content.split(/\r?\n/).map(l => `> ${l}`).join('\n'));
                        }
                    }
                }
                const mediaList = Array.isArray(step.userInput?.media) ? step.userInput.media : [];
                const exportedMediaNames = new Set();
                for (const m of mediaList) {
                    let mName = String(m.description || m.displayName || '').trim();
                    const mMime = resolveAttachmentMimeType(mName || m.uri || '', m.mimeType || '');
                    if (!mName) {
                        const matchedLegacy = legacyNotes.find(
                            ln => !ln.consumed && ln.mime.split('/')[0] === mMime.split('/')[0]
                        );
                        if (matchedLegacy) {
                            matchedLegacy.consumed = true;
                            mName = matchedLegacy.name;
                        } else {
                            mName = basename(uriToLocalPath(m.uri || '')) || 'attachment';
                        }
                    } else {
                        const exactLegacy = legacyNotes.find(
                            ln => !ln.consumed && ln.name.toLowerCase() === mName.toLowerCase()
                        );
                        if (exactLegacy) exactLegacy.consumed = true;
                    }
                    exportedMediaNames.add(mName.toLowerCase());
                    parts.push(`📎 \`${mName}\` (${m.mimeType || mMime || 'file'})`);
                }
                for (const ln of legacyNotes) {
                    if (!ln.consumed && !exportedMediaNames.has(ln.name.toLowerCase())) {
                        exportedMediaNames.add(ln.name.toLowerCase());
                        parts.push(`📎 \`${ln.name}\` (${ln.mime || 'file'})`);
                    }
                }
                const fallbackResp = stripLegacyExportNotes(step.userInput?.userResponse || '');
                const body = parts.join('\n\n').trim() || fallbackResp;
                if (body) {
                    mdSections.push('## User', '', body, '');
                }
            } else if (stType === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE') {
                const pr = step.plannerResponse || {};
                const answer = String(pr.modifiedResponse || pr.response || '').trim();
                const modelLabel =
                    this.resolveModelLabel(step.metadata?.generatorModel || step.metadata?.modelUsage?.model) ||
                    'Assistant';
                if (answer) {
                    mdSections.push(`## ${modelLabel}`, '', answer, '');
                }
            } else if (stType.includes('EDIT') || stType.includes('WRITE') || stType.includes('CODE_ACTION')) {
                const ca = extractCodeActionDetails(step);
                mdSections.push(
                    `- *${ca.actionLabel}* \`${ca.shortName}\` (+${ca.additions} / -${ca.deletions})`,
                    ''
                );
            }
        }

        const markdown = mdSections.join('\n').trim() + '\n';
        const safeSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 48) || 'conversation';

        return {
            success: true,
            cascadeId: cid,
            title,
            fileName: `${safeSlug}.md`,
            markdown
        };
    }

    _scanLocalWorkflowFiles(workspaceUris = []) {
        const discovered = [];
        const candidateDirs = [join(os.homedir(), '.gemini', 'antigravity', 'global_workflows')];

        for (const rawUri of workspaceUris) {
            if (!rawUri || typeof rawUri !== 'string') continue;
            let fsPath = rawUri.replace(/^file:\/\/\/?/i, '');
            try { fsPath = decodeURIComponent(fsPath); } catch {}
            if (process.platform === 'win32' && /^[a-zA-Z]:/.test(fsPath)) {
                fsPath = fsPath.replace(/\//g, '\\');
            }
            candidateDirs.push(join(fsPath, '.agent', 'workflows'));
            candidateDirs.push(join(fsPath, '.agents', 'workflows'));
        }

        const seenNames = new Set();
        for (const dir of candidateDirs) {
            try {
                if (!fs.existsSync(dir)) continue;
                const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
                for (const file of files) {
                    const baseName = file.replace(/\.md$/i, '').trim();
                    if (!baseName || seenNames.has(baseName.toLowerCase())) continue;
                    const fullPath = join(dir, file);
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    let description = '';
                    const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
                    if (fmMatch) {
                        const descLine = /^\s*description:\s*(.+)$/m.exec(fmMatch[1]);
                        if (descLine) description = descLine[1].trim().replace(/^['"]|['"]$/g, '');
                    }
                    seenNames.add(baseName.toLowerCase());
                    const uri = 'file:///' + fullPath.replace(/\\/g, '/').replace(/^\/+/, '');
                    discovered.push({
                        name: baseName,
                        description: description || `Custom workflow (${file})`,
                        path: baseName,
                        uri,
                        content
                    });
                }
            } catch {
                // Ignore unreadable workflow directory
            }
        }
        return discovered;
    }

    async _discoverWorkspaceUris() {
        const uris = new Set(this.knownWorkspaceUris);
        try {
            const cwd = process.cwd();
            if (cwd) {
                const cwdUri = this._toFileUri(cwd);
                if (cwdUri) {
                    uris.add(cwdUri);
                    this.knownWorkspaceUris.add(cwdUri);
                }
                const parentDir = dirname(cwd);
                if (
                    parentDir &&
                    parentDir !== cwd &&
                    (fs.existsSync(join(parentDir, '.agent', 'workflows')) ||
                        fs.existsSync(join(parentDir, '.agents', 'workflows')))
                ) {
                    const parentUri = this._toFileUri(parentDir);
                    if (parentUri) {
                        uris.add(parentUri);
                        this.knownWorkspaceUris.add(parentUri);
                    }
                }
            }
        } catch {}

        if (this.hubInfo) {
            try {
                const listRes = await this.callRpc('ListProjects', {}, 2500);
                const projectIds = (Array.isArray(listRes?.projectIds) ? listRes.projectIds : []).filter(
                    id => id && id !== 'outside-of-project'
                );
                if (projectIds.length > 0) {
                    const readRes = await this.callRpc('ReadProjects', { ids: projectIds.slice(0, 12) }, 3000);
                    for (const proj of readRes?.projects || []) {
                        for (const res of proj?.projectResources?.resources || []) {
                            const candidateUri =
                                res?.gitFolder?.uri ||
                                res?.localFolder?.uri ||
                                res?.folder?.uri ||
                                res?.uri ||
                                '';
                            if (candidateUri && /^file:\/\//i.test(candidateUri)) {
                                uris.add(candidateUri);
                                this.knownWorkspaceUris.add(candidateUri);
                            }
                        }
                    }
                }
            } catch {}
        }

        return Array.from(uris).filter(Boolean).slice(0, 10);
    }

    async getSlashCommands(force = false) {
        await this.discoverHub();
        const now = Date.now();
        const wasInitialHydration = this.lastSlashFetchMs === 0 && !force;
        const priorCustomEntries = new Map();
        if (wasInitialHydration) {
            const defaultKeys = new Set(DEFAULT_SLASH_COMMANDS.map(d => d.name.toLowerCase()));
            for (const [k, v] of this.slashRegistry.entries()) {
                if (!defaultKeys.has(k)) priorCustomEntries.set(k, v);
            }
        }

        if (this.hubInfo && (force || now - this.lastSlashFetchMs > 60000)) {
            try {
                const workspaceUris = await this._discoverWorkspaceUris();
                const baseSlashPayload = {
                    cascadeConfig: this.buildCascadeConfig(),
                    ...(this.activeCascadeId ? { cascadeId: this.activeCascadeId } : {}),
                    ...(workspaceUris.length > 0 ? { workspaceUris } : {})
                };

                const [slashSettled, wfSettled, mcpSettled] = await Promise.allSettled([
                    this.callRpc('GetSlashCommands', baseSlashPayload).catch(() =>
                        this.callRpc('GetSlashCommands', { cascadeConfig: this.buildCascadeConfig() })
                    ),
                    this.callRpc('GetAllWorkflows', workspaceUris.length > 0 ? { workspaceUris } : {}),
                    this.callRpc('ListMcpPrompts', {})
                ]);

                const slashRes = slashSettled.status === 'fulfilled' ? slashSettled.value : {};
                const wfRes = wfSettled.status === 'fulfilled' ? wfSettled.value : {};
                const mcpRes = mcpSettled.status === 'fulfilled' ? mcpSettled.value : {};

                const rawList = slashRes?.commands || slashRes?.slashCommands || [];
                const rawWorkflows = [
                    ...(Array.isArray(wfRes?.workflows) ? wfRes.workflows : []),
                    ...this._scanLocalWorkflowFiles(workspaceUris)
                ];
                const rawMcpPrompts = Array.isArray(mcpRes?.prompts) ? mcpRes.prompts : [];

                if (rawList.length > 0 || rawWorkflows.length > 0 || rawMcpPrompts.length > 0) {
                    const nextRegistry = new Map();
                    const clientItems = [];
                    const seenNames = new Set();

                    for (const entry of rawList) {
                        const info = entry?.info || entry || {};
                        const name = String(info.name || '').trim().replace(/^\/+/, '');
                        if (!name) continue;
                        const key = name.toLowerCase();
                        if (seenNames.has(key)) continue;
                        seenNames.add(key);

                        const rawType = String(info.type || '');
                        const isSystem = rawType.includes('SYSTEM') || rawType === '1';
                        const pluginName = String(info.plugin?.name || '').trim();
                        const pluginDisplayName = String(info.plugin?.displayName || pluginName || '').trim();
                        const type = isSystem ? 'SYSTEM' : 'SKILL';
                        const category = isSystem ? 'System' : pluginName ? 'Plugin' : 'Skill';
                        const description =
                            String(entry?.description || info.description || '').trim() ||
                            DEFAULT_SLASH_COMMANDS.find(d => d.name === name)?.description ||
                            (isSystem ? 'Antigravity system action' : pluginDisplayName ? `${pluginDisplayName} skill` : 'Agent skill');

                        const rawInfo = {
                            ...info,
                            name,
                            type: info.type || (isSystem ? 'SLASH_COMMAND_TYPE_SYSTEM' : 'SLASH_COMMAND_TYPE_SKILL')
                        };

                        const record = {
                            name,
                            title: String(entry?.title || info.displayName || name).trim(),
                            type,
                            category,
                            icon: info.icon || (isSystem ? 'bolt' : pluginName ? 'extension' : 'code_blocks'),
                            pluginName,
                            pluginDisplayName,
                            description
                        };
                        clientItems.push(record);
                        nextRegistry.set(key, { ...record, rawInfo });
                    }

                    // Ensure /btw side-question action is always available (matches Antigravity 2.33 composer injection)
                    if (!seenNames.has('btw')) {
                        seenNames.add('btw');
                        const btwRecord = {
                            name: 'btw',
                            title: 'btw',
                            type: 'WORKFLOW',
                            category: 'System',
                            icon: 'chat_add_on',
                            pluginName: '',
                            pluginDisplayName: '',
                            description: 'Ask a quick side question without interrupting the main conversation'
                        };
                        clientItems.push(btwRecord);
                        nextRegistry.set('btw', {
                            ...btwRecord,
                            workflowSpec: {
                                recipeId: 'btw',
                                title: 'btw',
                                description: btwRecord.description
                            }
                        });
                    }

                    // Ensure /help system slash command is always available (matches Antigravity 2.33 composer)
                    if (!seenNames.has('help')) {
                        seenNames.add('help');
                        const helpRecord = {
                            name: 'help',
                            title: 'help',
                            type: 'SYSTEM',
                            category: 'System',
                            icon: 'help',
                            pluginName: '',
                            pluginDisplayName: '',
                            description: 'Troubleshoot issues, configure Antigravity, or get guided help'
                        };
                        clientItems.push(helpRecord);
                        nextRegistry.set('help', {
                            ...helpRecord,
                            rawInfo: { name: 'help', type: 'SLASH_COMMAND_TYPE_SYSTEM', icon: 'help' }
                        });
                    }

                    // Include Workflows (RecipeScopeItem) with normalized file:/// URIs
                    for (const wf of rawWorkflows) {
                        const wfName = String(wf?.name || wf?.title || '').trim().replace(/^\/+/, '');
                        if (!wfName) continue;
                        const key = wfName.toLowerCase();
                        if (seenNames.has(key)) continue;
                        seenNames.add(key);

                        const rawWfUri =
                            wf.uri ||
                            wf.scope?.localScope?.baseDirUris?.[0] ||
                            wf.path ||
                            '';
                        const normalizedWfUri = this._toFileUri(rawWfUri);

                        const wfRecord = {
                            name: wfName,
                            title: wfName,
                            type: 'WORKFLOW',
                            category: 'Workflow',
                            icon: wf.icon || 'account_tree',
                            pluginName: '',
                            pluginDisplayName: '',
                            description: String(wf.description || 'Custom workspace workflow').trim()
                        };
                        clientItems.push(wfRecord);
                        nextRegistry.set(key, {
                            ...wfRecord,
                            workflowSpec: {
                                recipeId: String(wf.recipeId || wfName),
                                title: wfName,
                                description: wfRecord.description,
                                ...(wf.content || wf.systemPrompt ? { systemPrompt: String(wf.content || wf.systemPrompt) } : {}),
                                ...(normalizedWfUri ? { uri: normalizedWfUri } : {})
                            }
                        });
                    }

                    // Include MCP Prompts (McpPromptScopeItem)
                    for (const mp of rawMcpPrompts) {
                        const srv = String(mp?.serverName || '').trim();
                        const pName = String(mp?.name || '').trim();
                        if (!srv || !pName) continue;
                        const fullName = `mcp:${srv}:${pName}`;
                        const key = fullName.toLowerCase();
                        if (seenNames.has(key)) continue;
                        seenNames.add(key);

                        const mcpRecord = {
                            name: fullName,
                            title: `${srv}: ${pName}`,
                            type: 'MCP_PROMPT',
                            category: 'MCP',
                            icon: 'chat_bubble',
                            pluginName: srv,
                            pluginDisplayName: srv,
                            description: String(mp.description || `MCP prompt from ${srv}`).trim()
                        };
                        clientItems.push(mcpRecord);
                        const regEntry = {
                            ...mcpRecord,
                            mcpSpec: {
                                serverName: srv,
                                name: pName,
                                description: mcpRecord.description,
                                arguments: Array.isArray(mp.arguments) ? mp.arguments : []
                            }
                        };
                        nextRegistry.set(key, regEntry);
                        if (!nextRegistry.has(pName.toLowerCase())) {
                            nextRegistry.set(pName.toLowerCase(), regEntry);
                        }
                    }

                    // Preserve any pre-registered custom workflow/MCP entries during first auto-hydration
                    for (const [customKey, customVal] of priorCustomEntries.entries()) {
                        if (!nextRegistry.has(customKey)) {
                            nextRegistry.set(customKey, customVal);
                            if (customVal?.name && !seenNames.has(customKey)) {
                                seenNames.add(customKey);
                                clientItems.push({
                                    name: customVal.name,
                                    title: customVal.title || customVal.name,
                                    type: customVal.type || 'WORKFLOW',
                                    category: customVal.category || 'Workflow',
                                    icon: customVal.icon || 'account_tree',
                                    pluginName: customVal.pluginName || '',
                                    pluginDisplayName: customVal.pluginDisplayName || '',
                                    description: customVal.description || ''
                                });
                            }
                        }
                    }

                    // Include non-colliding Remote Client Controls (/new, /stop, /model, /mode, /fast, /theme, /clear, /history)
                    for (const ctrl of CLIENT_SLASH_CONTROLS) {
                        const key = ctrl.name.toLowerCase();
                        if (seenNames.has(key)) continue;
                        seenNames.add(key);
                        clientItems.push({ ...ctrl });
                    }

                    const priorityOrder = [
                        'boost',
                        'swarm',
                        'btw',
                        'plan',
                        'goal',
                        'compact',
                        'teamwork',
                        'grill-me',
                        'browser',
                        'learn',
                        'schedule',
                        'help'
                    ];
                    const categoryRank = { System: 1, Workflow: 2, Skill: 3, Plugin: 4, MCP: 5, Control: 6 };

                    clientItems.sort((a, b) => {
                        const ia = priorityOrder.indexOf(a.name);
                        const ib = priorityOrder.indexOf(b.name);
                        if (ia !== -1 || ib !== -1) {
                            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
                        }
                        const ca = categoryRank[a.category] || 99;
                        const cb = categoryRank[b.category] || 99;
                        if (ca !== cb) return ca - cb;
                        return a.name.localeCompare(b.name);
                    });

                    this.slashRegistry = nextRegistry;
                    this.cachedSlashCommands = clientItems;
                    this.lastSlashFetchMs = now;
                }
            } catch {
                // Fallback to DEFAULT_SLASH_COMMANDS
            }
        }

        const counts = {
            total: this.cachedSlashCommands.length,
            system: this.cachedSlashCommands.filter(c => c.category === 'System').length,
            skills: this.cachedSlashCommands.filter(c => c.category === 'Skill').length,
            plugins: this.cachedSlashCommands.filter(c => c.category === 'Plugin').length,
            workflows: this.cachedSlashCommands.filter(c => c.category === 'Workflow').length,
            mcp: this.cachedSlashCommands.filter(c => c.category === 'MCP').length,
            controls: this.cachedSlashCommands.filter(c => c.category === 'Control').length
        };

        return {
            success: true,
            commands: this.cachedSlashCommands,
            counts
        };
    }

    _normalizeModelQuery(raw) {
        return String(raw || '')
            .trim()
            .toLowerCase()
            .replace(/^g4(?:\s+|\b)/, 'gemini 4 ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    _tokenizeModelText(str) {
        return String(str || '')
            .toLowerCase()
            .replace(/[()]/g, ' ')
            .split(/[\s/_-]+/)
            .filter(Boolean);
    }

    _findBestActiveModelMatch(rawNorm, list) {
        const active = list.filter(m => !m.disabled);
        if (active.length === 0) return null;

        // 1. Exact label / modelId / modelEnum match
        const exact =
            active.find(m => m.label.toLowerCase() === rawNorm) ||
            active.find(m => m.modelId.toLowerCase() === rawNorm) ||
            active.find(m => m.modelEnum.toLowerCase() === rawNorm);
        if (exact) return exact;

        // Expand compact prefix "g4 ..." -> "gemini 4 ..." with collapsed single spaces
        const expanded = this._normalizeModelQuery(rawNorm);
        const exactExpanded = active.find(m => m.label.toLowerCase() === expanded);
        if (exactExpanded) return exactExpanded;

        const queryTokens = this._tokenizeModelText(expanded);
        const wantsOrchestrator = queryTokens.includes('orchestrator');
        const hasExplicitVariant = queryTokens.some(t =>
            ['low', 'medium', 'high', 'xhigh', 'thinking', 'fast'].includes(t)
        );

        const rankMatches = candidates => {
            if (candidates.length <= 1) return candidates[0] || null;
            return [...candidates].sort((a, b) => {
                const aOrch = /^orchestrator$/i.test(a.family || '') || /\borchestrator\b/i.test(a.label || '');
                const bOrch = /^orchestrator$/i.test(b.family || '') || /\borchestrator\b/i.test(b.label || '');
                if (wantsOrchestrator) {
                    if (aOrch !== bOrch) return aOrch ? -1 : 1;
                    // For bare "orchestrator", prefer Neon over Argon
                    const aNeon = /neon/i.test(a.effort || a.label);
                    const bNeon = /neon/i.test(b.effort || b.label);
                    if (aNeon !== bNeon) return aNeon ? -1 : 1;
                } else {
                    // For "neon" or "argon", prefer Gemini 4 Neon / Argon over Orchestrator (Neon / Argon)
                    if (aOrch !== bOrch) return aOrch ? 1 : -1;
                }
                if (!hasExplicitVariant) {
                    const aHigh = /^high$/i.test(a.effort || '');
                    const bHigh = /^high$/i.test(b.effort || '');
                    if (aHigh !== bHigh) return aHigh ? -1 : 1;
                }
                return 0;
            })[0];
        };

        // 2. Exact word-token match (prevents "high" from falsely matching "xhigh")
        if (queryTokens.length > 0) {
            const tokenExactMatches = active.filter(m => {
                const candTokens = this._tokenizeModelText(`${m.label} ${m.modelId} ${m.family} ${m.effort}`);
                return queryTokens.every(qt => candTokens.includes(qt));
            });
            if (tokenExactMatches.length > 0) {
                return rankMatches(tokenExactMatches);
            }
        }

        // 3. Substring / prefix match
        const subMatches = active.filter(m => {
            const haystack = `${m.label} ${m.modelId}`.toLowerCase();
            if (haystack.includes(expanded) || haystack.includes(rawNorm)) return true;
            if (queryTokens.length > 0) {
                const candTokens = this._tokenizeModelText(`${m.label} ${m.modelId} ${m.family} ${m.effort}`);
                return queryTokens.every(qt => candTokens.some(ct => ct.startsWith(qt)));
            }
            return false;
        });
        if (subMatches.length > 0) {
            return rankMatches(subMatches);
        }

        return null;
    }

    _findDisabledModelMatch(rawNorm, list, exactOnly = false) {
        const disabledList = list.filter(m => m.disabled);
        if (disabledList.length === 0) return null;

        const expanded = this._normalizeModelQuery(rawNorm);
        const exact =
            disabledList.find(m => m.label.toLowerCase() === rawNorm || m.label.toLowerCase() === expanded) ||
            disabledList.find(m => m.modelId.toLowerCase() === rawNorm || m.modelId.toLowerCase() === expanded) ||
            disabledList.find(m => m.modelEnum.toLowerCase() === rawNorm);
        if (exact || exactOnly) return exact || null;

        const activeTokenSet = new Set([
            'gemini', 'claude', 'gpt', 'model', 'models', 'orchestrator', 'pro', 'flash',
            'low', 'medium', 'high', 'xhigh', 'default', 'thinking', 'fast', 'disabled',
            'unavailable', '3', '3.8', '4', '4.6', '5', '5.5'
        ]);
        for (const am of list) {
            if (am.disabled) continue;
            for (const tok of this._tokenizeModelText(`${am.label} ${am.family}`)) {
                activeTokenSet.add(tok);
            }
        }
        const queryTokens = this._tokenizeModelText(expanded);

        return (
            disabledList.find(m => {
                const lbl = m.label.toLowerCase();
                const fam = (m.family || '').toLowerCase();
                if (
                    lbl.includes(expanded) ||
                    expanded.includes(lbl) ||
                    (fam && (fam.includes(expanded) || expanded.includes(fam)))
                ) {
                    return true;
                }
                if (queryTokens.length > 0) {
                    const distinctive = this._tokenizeModelText(`${m.label} ${m.family}`).filter(
                        tok => tok.length >= 2 && !activeTokenSet.has(tok)
                    );
                    if (
                        distinctive.some(
                            dt =>
                                queryTokens.includes(dt) ||
                                queryTokens.some(qt => qt.length >= 4 && dt.startsWith(qt))
                        )
                    ) {
                        return true;
                    }
                }
                return false;
            }) || null
        );
    }

    _buildDisabledModelError(disabledMatch) {
        const desc = String(disabledMatch.tagDescription || '').trim();
        return {
            error: desc
                ? `${disabledMatch.label} is unavailable: ${desc}`
                : `${disabledMatch.label} is currently unavailable.`,
            disabled: true,
            model: disabledMatch.label,
            tagTitle: disabledMatch.tagTitle || 'Unavailable',
            tagDescription: desc
        };
    }

    setModelByLabel(targetModel) {
        const rawTarget = String(targetModel || '').trim();
        if (!rawTarget) return { error: 'Model required' };
        const norm = rawTarget.toLowerCase();

        const catalogPool = this.hubInfo ? this.cachedModels : [...this.cachedModels, ...DEFAULT_ANTIGRAVITY_MODELS];

        // 1. Exact active match
        let found =
            this.cachedModels.find(m => !m.disabled && m.label.toLowerCase() === norm) ||
            this.cachedModels.find(m => !m.disabled && m.modelId.toLowerCase() === norm) ||
            this.cachedModels.find(m => !m.disabled && m.modelEnum.toLowerCase() === norm);

        // 2. Exact disabled match -> refuse cleanly without mutating selectedModel
        if (!found) {
            const exactDisabled = this._findDisabledModelMatch(norm, catalogPool, true);
            if (exactDisabled) {
                return this._buildDisabledModelError(exactDisabled);
            }
        }

        // 3. Token / shorthand / substring active match in live catalog
        if (!found) {
            found = this._findBestActiveModelMatch(norm, this.cachedModels);
        }

        // 4. Offline fallback active match in DEFAULT_ANTIGRAVITY_MODELS (never matching disabled models)
        if (!found && !this.hubInfo) {
            found = this._findBestActiveModelMatch(norm, DEFAULT_ANTIGRAVITY_MODELS);
        }

        // 5. Fuzzy / family disabled match (e.g. "carbon" or "Gemini 4 Carbon (High)") -> refuse cleanly
        if (!found) {
            const fuzzyDisabled = this._findDisabledModelMatch(norm, catalogPool, false);
            if (fuzzyDisabled) {
                return this._buildDisabledModelError(fuzzyDisabled);
            }
        }

        // 6. Legacy active model migration on live Hub (e.g. Claude 4.6 -> Claude 5.5)
        if (!found && this.hubInfo) {
            if (norm.includes('opus')) {
                found =
                    this.cachedModels.find(m => !m.disabled && /opus.*high/i.test(m.label)) ||
                    this.cachedModels.find(m => !m.disabled && /opus/i.test(m.label));
            } else if (norm.includes('sonnet')) {
                found =
                    this.cachedModels.find(m => !m.disabled && /sonnet.*high/i.test(m.label)) ||
                    this.cachedModels.find(m => !m.disabled && /sonnet/i.test(m.label));
            }
        }

        this._modeOverridesModelToFast = false;
        this._preFastModel = null;
        this._userExplicitlySelectedModel = true;

        if (!found) {
            this.selectedModelLabel = rawTarget;
            return { success: true, selectedModel: rawTarget };
        }

        this.selectedModelLabel = found.label;
        this.selectedModelEnum = found.modelEnum;
        return {
            success: true,
            selectedModel: found.label,
            modelEnum: found.modelEnum,
            modelId: found.modelId
        };
    }

    setMode(mode) {
        const valid = ['Agent', 'Autonomous', 'Planning', 'Fast'];
        if (!valid.includes(mode)) {
            return { error: `Invalid mode. Choose one of: ${valid.join(', ')}` };
        }
        this.selectedMode = mode;

        if (mode === 'Fast') {
            if (!this._modeOverridesModelToFast) {
                this._preFastModel = {
                    label: this.selectedModelLabel,
                    modelEnum: this.selectedModelEnum
                };
            }
            this._modeOverridesModelToFast = true;
            const flashHigh = this.cachedModels.find(m => m.modelEnum === 'MODEL_PLACEHOLDER_M318');
            if (flashHigh) {
                this.selectedModelLabel = flashHigh.label;
                this.selectedModelEnum = flashHigh.modelEnum;
            }
        } else {
            if (this._modeOverridesModelToFast && this._preFastModel) {
                this.selectedModelLabel = this._preFastModel.label;
                this.selectedModelEnum = this._preFastModel.modelEnum;
            }
            this._modeOverridesModelToFast = false;
            this._preFastModel = null;
        }

        return {
            success: true,
            mode: this.selectedMode,
            selectedModel: this.selectedModelLabel
        };
    }

    async listConversations() {
        await this.discoverHub();
        if (!this.hubInfo) return { error: 'Antigravity Hub disconnected', chats: [] };

        const data = await this.callRpc('GetAllCascadeTrajectories', {});
        const summaries = data?.trajectorySummaries || {};
        const entries = Object.entries(summaries);
        const entryMap = new Map(entries);

        const directChildrenByParent = new Map();
        this.parentCascadeMap.clear();

        for (const [cid, info] of entries) {
            const parentId = info?.trajectoryMetadata?.parentConversationId || null;
            if (parentId) {
                this.parentCascadeMap.set(cid, parentId);
                if (!directChildrenByParent.has(parentId)) directChildrenByParent.set(parentId, []);
                directChildrenByParent.get(parentId).push(cid);
            }

            // Link /btw SIDE_QUESTION trajectories referenced in parent annotations
            const sideIds = Array.isArray(info?.annotations?.sideQuestionCascadeIds)
                ? info.annotations.sideQuestionCascadeIds
                : [];
            const sideTitles = info?.annotations?.sideQuestionTitles || {};
            for (const sideCid of sideIds) {
                if (!sideCid || !entryMap.has(sideCid)) continue;
                this.sideQuestionParentMap.set(sideCid, cid);
                this.parentCascadeMap.set(sideCid, cid);
                if (sideTitles[sideCid]) {
                    this.sideQuestionTitleMap.set(sideCid, String(sideTitles[sideCid]));
                }
                if (!directChildrenByParent.has(cid)) directChildrenByParent.set(cid, []);
                if (!directChildrenByParent.get(cid).includes(sideCid)) {
                    directChildrenByParent.get(cid).push(sideCid);
                }
            }
        }

        // Also link any in-memory sideQuestionParentMap entries not yet persisted in annotations
        for (const [sideCid, parentCid] of this.sideQuestionParentMap.entries()) {
            if (!entryMap.has(sideCid) || !entryMap.has(parentCid)) continue;
            this.parentCascadeMap.set(sideCid, parentCid);
            if (!directChildrenByParent.has(parentCid)) directChildrenByParent.set(parentCid, []);
            if (!directChildrenByParent.get(parentCid).includes(sideCid)) {
                directChildrenByParent.get(parentCid).push(sideCid);
            }
        }

        // Collect full descendant subagent + /btw side-question hierarchy recursively (L0, L1, L2, ...)
        const collectDescendants = (rootCid) => {
            const result = [];
            const visited = new Set([rootCid]);

            const dfs = (parentCid, fallbackDepth) => {
                const kids = directChildrenByParent.get(parentCid) || [];
                kids.sort((a, b) =>
                    String(entryMap.get(a)?.createdTime || '').localeCompare(String(entryMap.get(b)?.createdTime || ''))
                );
                for (const childCid of kids) {
                    if (visited.has(childCid)) continue;
                    visited.add(childCid);
                    const info = entryMap.get(childCid) || {};
                    const isSideQ =
                        info?.trajectoryType === 'CORTEX_TRAJECTORY_TYPE_SIDE_QUESTION' ||
                        this.sideQuestionParentMap.has(childCid);
                    const depth = info?.trajectoryMetadata?.nestingDepth || fallbackDepth;
                    const modelEnum = info?.trajectoryMetadata?.subagentSpec?.model || '';
                    const sideTitle =
                        this.sideQuestionTitleMap.get(childCid) ||
                        info?.annotations?.title ||
                        'Side Question';
                    result.push({
                        cascadeId: childCid,
                        parentCascadeId: parentCid,
                        nestingDepth: depth,
                        isSideQuestion: isSideQ,
                        role: isSideQ
                            ? `💬 /btw · ${sideTitle}`
                            : info?.trajectoryMetadata?.subagentSpec?.role ||
                              info?.trajectoryMetadata?.subagentSpec?.typeName ||
                              'Subagent',
                        typeName: isSideQ ? 'SideQuestion' : info?.trajectoryMetadata?.subagentSpec?.typeName || 'Agent',
                        modelLabel: this.resolveModelLabel(modelEnum),
                        status: info?.status || 'CASCADE_RUN_STATUS_IDLE',
                        stepCount: info?.stepCount || 0,
                        lastModifiedTime: info?.lastModifiedTime || info?.createdTime || ''
                    });
                    dfs(childCid, depth + 1);
                }
            };

            dfs(rootCid, 1);
            return result;
        };

        const rootChats = [];
        for (const [cid, info] of entries) {
            const parentId =
                info?.trajectoryMetadata?.parentConversationId ||
                this.sideQuestionParentMap.get(cid) ||
                this.parentCascadeMap.get(cid) ||
                null;
            // Treat as root if it has no parentConversationId OR its parent was deleted/missing
            if (parentId && entryMap.has(parentId)) continue;

            const isUnlinkedSideQ = info?.trajectoryType === 'CORTEX_TRAJECTORY_TYPE_SIDE_QUESTION';
            const baseTitle =
                info?.annotations?.title ||
                info?.summary ||
                info?.trajectoryMetadata?.subagentSpec?.role ||
                `Conversation ${cid.substring(0, 8)}`;
            const title = isUnlinkedSideQ && !baseTitle.startsWith('💬') ? `💬 /btw · ${baseTitle}` : baseTitle;

            const subagents = collectDescendants(cid);
            const anySubagentRunning = subagents.some(s => {
                const st = String(s.status || '');
                return st.includes('RUNNING') || st.includes('WAITING');
            });
            const rootStatusStr = String(info?.status || '');
            const isRunning = rootStatusStr.includes('RUNNING') || rootStatusStr.includes('WAITING') || anySubagentRunning;

            let latestModified = info?.lastModifiedTime || info?.createdTime || '';
            for (const sub of subagents) {
                if (sub.lastModifiedTime && String(sub.lastModifiedTime) > String(latestModified)) {
                    latestModified = sub.lastModifiedTime;
                }
            }

            const workspacesArr = Array.isArray(info?.trajectoryMetadata?.workspaces)
                ? info.trajectoryMetadata.workspaces
                : [];
            let wsUri = '';
            for (const wsEntry of workspacesArr) {
                const u = wsEntry?.workspaceFolderAbsoluteUri || wsEntry?.uri || '';
                if (u) {
                    if (!wsUri) wsUri = u;
                    this.knownWorkspaceUris.add(u);
                }
            }

            rootChats.push({
                cascadeId: cid,
                title,
                status: isRunning ? 'RUNNING' : 'IDLE',
                rawStatus: info?.status || 'CASCADE_RUN_STATUS_IDLE',
                stepCount: info?.stepCount || 0,
                subagentCount: subagents.length,
                subagents,
                lastModifiedTime: latestModified,
                workspaceUri: wsUri
            });
        }

        rootChats.sort((a, b) => String(b.lastModifiedTime).localeCompare(String(a.lastModifiedTime)));

        rootChats.forEach((c, idx) => {
            c.index = idx;
            c.date = c.lastModifiedTime
                ? new Date(c.lastModifiedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent';
        });

        return {
            success: true,
            activeCascadeId: this.activeCascadeId,
            chats: rootChats
        };
    }

    async ensureActiveConversationSelected() {
        if (this.activeCascadeId) return this.activeCascadeId;
        try {
            const res = await this.listConversations();
            if (res.chats && res.chats.length > 0) {
                this.activeCascadeId = res.chats[0].cascadeId;
            }
        } catch {
            // Ignore
        }
        return this.activeCascadeId;
    }

    async selectConversation({ cascadeId, title, index }) {
        const listRes = await this.listConversations();
        const chats = listRes.chats || [];

        if (cascadeId) {
            this.activeCascadeId = cascadeId;
            return { success: true, cascadeId, selected: title || cascadeId };
        }

        if (typeof index === 'number' && index >= 0 && index < chats.length) {
            this.activeCascadeId = chats[index].cascadeId;
            return { success: true, cascadeId: this.activeCascadeId, selected: chats[index].title };
        }

        if (title) {
            const norm = title.trim().toLowerCase();
            const found = chats.find(
                c => c.title.toLowerCase() === norm || c.title.toLowerCase().includes(norm)
            );
            if (found) {
                this.activeCascadeId = found.cascadeId;
                return { success: true, cascadeId: found.cascadeId, selected: found.title };
            }
        }

        return { error: 'Conversation not found' };
    }

    resolveModelLabel(modelEnum) {
        if (!modelEnum) return '';
        const str = String(modelEnum).trim();
        const found =
            this.cachedModels.find(m => m.modelEnum === str) ||
            DEFAULT_ANTIGRAVITY_MODELS.find(m => m.modelEnum === str);
        if (found) return found.label;
        if (RUNTIME_MODEL_LABEL_ALIASES[str]) return RUNTIME_MODEL_LABEL_ALIASES[str];
        if (/^MODEL_PLACEHOLDER_M?\d+$/i.test(str)) return 'Antigravity Model';
        return str;
    }

    renderWaitingInteractionControls({ cid, step, stepIndex, fallbackTrajectoryId }) {
        const stStatus = String(step.status || '');
        if (!stStatus.includes('WAITING') && !step.requestedInteraction) return '';

        const stepInfo = step.metadata?.sourceTrajectoryStepInfo || {};
        const trajectoryId = stepInfo.trajectoryId || fallbackTrajectoryId || '';
        const resolvedStepIndex = typeof stepInfo.stepIndex === 'number' ? stepInfo.stepIndex : stepIndex;
        const resolvedCascadeId = stepInfo.cascadeId || cid;

        if (!trajectoryId || !resolvedCascadeId) return '';

        // Detect interaction case in ConnectRPC JSON (permission, filePermission, runCommand, browserAction)
        const reqInter = step.requestedInteraction || {};
        let interactionCase = 'permission';
        if (reqInter.filePermission) interactionCase = 'filePermission';
        else if (reqInter.runCommand) interactionCase = 'runCommand';
        else if (reqInter.browserAction) interactionCase = 'browserAction';
        else if (reqInter.permission) interactionCase = 'permission';

        const targetLabel =
            reqInter.permission?.resource?.target ||
            reqInter.filePermission?.absolutePathUri ||
            step.runCommand?.commandLine ||
            step.runCommand?.proposedCommandLine ||
            '';

        return `
            <div class="agy-approval-bar" data-testid="hub-approval-card">
                <div class="agy-approval-info">
                    <span class="agy-approval-badge">Action Required</span>
                    ${targetLabel ? `<code class="agy-approval-target">${escapeHtml(String(targetLabel).substring(0, 120))}</code>` : ''}
                </div>
                <div class="agy-approval-actions">
                    <button type="button"
                        class="agy-interact-btn agy-interact-deny"
                        data-hub-interact="decision"
                        data-cascade-id="${escapeHtml(resolvedCascadeId)}"
                        data-trajectory-id="${escapeHtml(trajectoryId)}"
                        data-step-index="${resolvedStepIndex}"
                        data-interaction-case="${escapeHtml(interactionCase)}"
                        data-allow="false">
                        Deny
                    </button>
                    <button type="button"
                        class="agy-interact-btn agy-interact-approve"
                        data-hub-interact="decision"
                        data-cascade-id="${escapeHtml(resolvedCascadeId)}"
                        data-trajectory-id="${escapeHtml(trajectoryId)}"
                        data-step-index="${resolvedStepIndex}"
                        data-interaction-case="${escapeHtml(interactionCase)}"
                        data-allow="true">
                        Approve
                    </button>
                </div>
            </div>
        `;
    }

    async buildSnapshotFromHub(targetCascadeId = null) {
        await this.discoverHub();
        if (!this.hubInfo) return null;

        const cid = targetCascadeId || (await this.ensureActiveConversationSelected());
        if (!cid) {
            const emptyHtml = `
                <div id="cascade" class="agy-hub-stream">
                    <div class="agy-welcome-hero">
                        <div class="agy-welcome-logo">✦</div>
                        <h2>Antigravity 2.33 Hub</h2>
                        <p>Ready with <strong>${escapeHtml(this.selectedModelLabel)}</strong>. Type <code>/</code> for slash commands or tap <code>/boost</code> or <code>/swarm</code> below.</p>
                    </div>
                </div>
            `;
            return {
                html: emptyHtml,
                css: '',
                source: 'hub',
                cascadeId: null,
                parentCascadeId: null,
                isGenerating: false,
                stats: { nodes: 6, htmlSize: emptyHtml.length, cssSize: 0 }
            };
        }

        const [trajResp, allTrajsResp] = await Promise.all([
            this.callRpc('GetCascadeTrajectory', { cascadeId: cid }),
            this.callRpc('GetAllCascadeTrajectories', {}).catch(() => ({}))
        ]);

        const summaries = allTrajsResp?.trajectorySummaries || {};
        for (const [pCid, pInfo] of Object.entries(summaries)) {
            const sIds = Array.isArray(pInfo?.annotations?.sideQuestionCascadeIds)
                ? pInfo.annotations.sideQuestionCascadeIds
                : [];
            const sTitles = pInfo?.annotations?.sideQuestionTitles || {};
            for (const sCid of sIds) {
                if (!sCid) continue;
                this.sideQuestionParentMap.set(sCid, pCid);
                this.parentCascadeMap.set(sCid, pCid);
                if (sTitles[sCid]) this.sideQuestionTitleMap.set(sCid, String(sTitles[sCid]));
            }
        }

        const currentSummary = summaries[cid] || {};
        const fallbackTrajectoryId = currentSummary?.trajectoryId || trajResp?.trajectory?.trajectoryId || '';
        const isSideQuestion =
            currentSummary?.trajectoryType === 'CORTEX_TRAJECTORY_TYPE_SIDE_QUESTION' ||
            trajResp?.trajectory?.trajectoryType === 'CORTEX_TRAJECTORY_TYPE_SIDE_QUESTION' ||
            this.sideQuestionParentMap.has(cid);
        const parentCascadeId =
            currentSummary?.trajectoryMetadata?.parentConversationId ||
            this.sideQuestionParentMap.get(cid) ||
            this.parentCascadeMap.get(cid) ||
            null;
        const sideQuestionTitle = this.sideQuestionTitleMap.get(cid) || currentSummary?.annotations?.title || '';
        const conversationTitle = isSideQuestion
            ? `💬 /btw · ${sideQuestionTitle || currentSummary?.summary || 'Side Question'}`
            : currentSummary?.annotations?.title ||
              currentSummary?.summary ||
              currentSummary?.trajectoryMetadata?.subagentSpec?.role ||
              '';

        const steps = trajResp?.trajectory?.steps || [];
        const sideQuestionForkStepIdx =
            isSideQuestion && typeof currentSummary?.lastUserInputStepIndex === 'number'
                ? currentSummary.lastUserInputStepIndex
                : isSideQuestion
                  ? Math.max(0, steps.length - 2)
                  : -1;

        let isGenerating =
            String(trajResp?.status || currentSummary?.status || '').includes('RUNNING') ||
            String(trajResp?.status || currentSummary?.status || '').includes('WAITING');

        // Also check if any descendant subagent of this conversation is running
        for (const [, sInfo] of Object.entries(summaries)) {
            if (
                sInfo?.trajectoryMetadata?.parentConversationId === cid ||
                sInfo?.trajectoryMetadata?.rootConversationId === cid
            ) {
                const st = String(sInfo?.status || '');
                if (st.includes('RUNNING') || st.includes('WAITING')) {
                    isGenerating = true;
                }
            }
        }

        // Capture a real userConfig template from root user turns only (never pollute with subagent or side-question configs)
        if (!isSideQuestion && !parentCascadeId && !currentSummary?.trajectoryMetadata?.subagentSpec) {
            for (const s of steps) {
                if (s.type === 'CORTEX_STEP_TYPE_USER_INPUT' && s.userInput?.userConfig?.plannerConfig) {
                    this.templateUserConfig = s.userInput.userConfig;
                    const usedModel = s.userInput.userConfig.plannerConfig.planModel;
                    if (usedModel && !this._userExplicitlySelectedModel && !this._modeOverridesModelToFast) {
                        const m = this.cachedModels.find(x => x.modelEnum === usedModel && !x.disabled);
                        if (m) {
                            this.selectedModelEnum = m.modelEnum;
                            this.selectedModelLabel = m.label;
                        }
                    }
                }
            }
        }

        const renderedParts = [];

        if (isSideQuestion && parentCascadeId) {
            const sideAnswerTexts = steps
                .slice(Math.max(0, sideQuestionForkStepIdx))
                .filter(s => s.type === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE')
                .map(s => String(s.plannerResponse?.modifiedResponse || s.plannerResponse?.response || '').trim())
                .filter(Boolean);
            const latestSideAnswer = sideAnswerTexts.join('\n\n').trim();

            renderedParts.push(`
                <div class="agy-subagent-breadcrumb agy-side-question-banner" data-testid="side-question-banner" data-parent-cascade="${escapeHtml(parentCascadeId)}">
                    <div class="agy-side-question-nav">
                        <button type="button" class="agy-back-parent-btn" data-select-cascade="${escapeHtml(parentCascadeId)}">
                            ← Back to Main Chat
                        </button>
                        <span class="agy-subagent-pill">💬 /btw Side Question</span>
                    </div>
                    ${
                        latestSideAnswer
                            ? `<button type="button"
                                       class="agy-insert-main-btn"
                                       data-testid="side-question-insert-to-main"
                                       data-insert-side-question="${escapeHtml(parentCascadeId)}"
                                       data-side-question-id="${escapeHtml(cid)}"
                                       data-side-question-title="${escapeHtml(sideQuestionTitle || 'Side Question')}"
                                       data-side-question-answer="${escapeHtml(latestSideAnswer)}">
                                   ↱ Quote into Main Chat
                               </button>`
                            : ''
                    }
                </div>
            `);
        } else if (parentCascadeId) {
            const subRole =
                currentSummary?.trajectoryMetadata?.subagentSpec?.role ||
                currentSummary?.trajectoryMetadata?.subagentSpec?.typeName ||
                'Subagent';
            const depth = currentSummary?.trajectoryMetadata?.nestingDepth || 1;
            renderedParts.push(`
                <div class="agy-subagent-breadcrumb" data-parent-cascade="${escapeHtml(parentCascadeId)}">
                    <button type="button" class="agy-back-parent-btn" data-select-cascade="${escapeHtml(parentCascadeId)}">
                        ← Back to Parent
                    </button>
                    <span class="agy-subagent-pill">L${depth} Swarm · ${escapeHtml(subRole)}</span>
                </div>
            `);
        }

        const swarmHeadline = this.getQuickSwarmHeadline(cid, summaries);
        if (swarmHeadline && swarmHeadline.hasSwarm) {
            if (swarmHeadline.workingCount > 0) {
                isGenerating = true;
            }
            const isSwarmWorker =
                swarmHeadline.coordinatorId &&
                swarmHeadline.coordinatorId !== cid &&
                !parentCascadeId;
            const statusBits = [];
            if (swarmHeadline.workingCount > 0) statusBits.push(`${swarmHeadline.workingCount} working`);
            if (swarmHeadline.waitingCount > 0) statusBits.push(`${swarmHeadline.waitingCount} waiting`);
            if (swarmHeadline.head > 0) statusBits.push(`#${swarmHeadline.head} posts`);
            const swarmSubText = statusBits.join(' · ') || `${swarmHeadline.totalMembers} members`;

            renderedParts.push(`
                <div class="agy-subagent-breadcrumb agy-chat-swarm-banner" data-testid="chat-swarm-banner" data-swarm-id="${escapeHtml(swarmHeadline.swarmId)}">
                    <div class="agy-swarm-banner-left">
                        ${
                            isSwarmWorker
                                ? `<button type="button" class="agy-back-parent-btn" data-select-cascade="${escapeHtml(swarmHeadline.coordinatorId)}">← Coordinator</button>`
                                : ''
                        }
                        <span class="agy-swarm-banner-title">🐝 ${escapeHtml(swarmHeadline.title || 'Active Swarm')}</span>
                        <span class="agy-swarm-banner-meta">${escapeHtml(swarmSubText)}</span>
                    </div>
                    <button type="button" class="agy-open-swarm-banner-btn" data-open-swarm-ui="1" data-swarm-id="${escapeHtml(swarmHeadline.swarmId)}" data-testid="banner-open-swarm-btn">
                        Open Swarm UI →
                    </button>
                </div>
            `);
        }

        if (steps.length === 0) {
            renderedParts.push(`
                <div class="agy-welcome-hero">
                    <div class="agy-welcome-logo">✦</div>
                    <h2>New Conversation</h2>
                    <p>Ready with <strong>${escapeHtml(this.selectedModelLabel)}</strong> (${escapeHtml(this.selectedMode)} mode). Send a prompt, attach media, or use <code>/boost</code>, <code>/swarm</code>, or <code>/btw</code>.</p>
                </div>
            `);
        }

        let nodeCount = 4;
        let latestInputTokens = 0;
        let latestCacheReadTokens = 0;
        let totalOutputTokens = 0;
        let totalThinkingTokens = 0;
        let userTurnCount = 0;
        const changedFilesMap = new Map();

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (isSideQuestion && i === sideQuestionForkStepIdx && i > 0) {
                renderedParts.push(`<div class="agy-side-question-divider"><span>💬 /btw Side Question</span></div>`);
            }
            // Never render or leak internal SDK system prompt reminders of any step type
            if (step.metadata?.source === 'CORTEX_STEP_SOURCE_SYSTEM_SDK') continue;

            const mu = step.metadata?.modelUsage;
            if (mu) {
                const inTok = Number(mu.inputTokens || 0);
                const cacheTok = Number(mu.cacheReadTokens || 0);
                if (inTok > 0 || cacheTok > 0) {
                    latestInputTokens = inTok;
                    latestCacheReadTokens = cacheTok;
                }
                totalOutputTokens += Number(mu.outputTokens || 0);
                totalThinkingTokens += Number(mu.thinkingOutputTokens || 0);
            }

            const stType = step.type || '';
            const stStatus = step.status || '';
            if (
                stStatus.includes('RUNNING') ||
                stStatus.includes('GENERATING') ||
                stStatus.includes('PENDING') ||
                stStatus.includes('WAITING')
            ) {
                isGenerating = true;
            }

            if (stType === 'CORTEX_STEP_TYPE_USER_INPUT') {
                userTurnCount++;
                const ui = step.userInput || {};
                const items = ui.items || [];
                const badges = [];
                const bodySegments = [];
                let pendingInlineHtml = [];
                let hasSeenBodyContent = false;
                let lastWasQuoteBlock = false;

                const flushPendingInline = () => {
                    if (pendingInlineHtml.length === 0) return;
                    const joinedHtml = pendingInlineHtml.join('').trim();
                    pendingInlineHtml = [];
                    if (!joinedHtml) return;

                    if (lastWasQuoteBlock) {
                        const paragraphs = joinedHtml
                            .split(/(?:\r?\n){2,}/)
                            .map(p => p.trim())
                            .filter(Boolean);
                        paragraphs.forEach((paraHtml, pIdx) => {
                            const answerCls = pIdx === 0 ? ' agy-quote-specific-answer' : '';
                            bodySegments.push(`<div class="whitespace-pre-wrap agy-user-text${answerCls}">${paraHtml}</div>`);
                        });
                    } else {
                        bodySegments.push(`<div class="whitespace-pre-wrap agy-user-text">${joinedHtml}</div>`);
                    }
                    lastWasQuoteBlock = false;
                };

                const renderScopeBadge = (badgeHtml) => {
                    if (!hasSeenBodyContent) {
                        badges.push(badgeHtml);
                    } else {
                        pendingInlineHtml.push(badgeHtml.replace('class="', 'class="is-inline '));
                    }
                };

                const mediaCards = [];
                const seenMediaNames = new Set();
                const pushRenderedMediaCard = (rawMime, rawName, rawUri, inlineDataB64 = '', thumbB64 = '') => {
                    const cleanName = String(
                        rawName || basename(uriToLocalPath(rawUri || '')) || 'Attachment'
                    ).trim();
                    const payloadSig = rawUri || inlineDataB64.slice(0, 32) || thumbB64.slice(0, 32) || '';
                    const dedupKey = `${cleanName.toLowerCase()}|${String(rawMime || '').toLowerCase()}|${payloadSig}`;
                    const nameOnlyKey = `${cleanName.toLowerCase()}|`;
                    if (seenMediaNames.has(dedupKey)) return;
                    seenMediaNames.add(dedupKey);
                    seenMediaNames.add(nameOnlyKey);

                    const cls = classifyMediaAttachment(rawMime || '', cleanName);
                    const safeDiskPath = rawUri ? this.resolveSafeMediaFilePath(rawUri) : null;
                    const servedUrl = safeDiskPath ? `/hub/media?uri=${encodeURIComponent(rawUri)}` : '';

                    if (cls.isImage) {
                        const imgSrc =
                            servedUrl ||
                            (thumbB64
                                ? `data:image/png;base64,${thumbB64}`
                                : inlineDataB64
                                  ? `data:${rawMime || 'image/png'};base64,${inlineDataB64}`
                                  : '');
                        if (imgSrc) {
                            mediaCards.push(`
                                <button type="button" class="agy-user-media-thumb" data-testid="user-media-thumb" data-lightbox-src="${escapeHtml(imgSrc)}" data-lightbox-alt="${escapeHtml(cleanName)}" title="${escapeHtml(cleanName)}">
                                    <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(cleanName)}" loading="lazy" decoding="async" />
                                </button>
                            `);
                            return;
                        }
                    }

                    const resolvedMime = resolveAttachmentMimeType(cleanName, rawMime || '');
                    mediaCards.push(`
                        <div class="agy-user-media-file ${cls.accentClass}" data-testid="user-media-file" ${servedUrl ? `data-media-url="${escapeHtml(servedUrl)}"` : ''} data-media-mime="${escapeHtml(resolvedMime)}" data-media-name="${escapeHtml(cleanName)}" title="${escapeHtml(cleanName)}">
                            <span class="agy-user-media-ext">${escapeHtml(cls.badgeLabel)}</span>
                            <span class="agy-user-media-name">${escapeHtml(cleanName)}</span>
                        </div>
                    `);
                };

                // Pre-extract any legacy `[Attached: name](file:///.../uploads/...)` notes so unnamed historical `ui.media`
                // entries (`uploaded_media_*.jpg`) adopt the real filename instead of rendering a duplicate thumbnail card.
                const legacyAttachedNotes = [];
                const legacyNoteRegex = /\[Attached:\s*([^\]]+)\]\((file:\/\/\/[^)\r\n]+\/uploads\/[^)\r\n]+)\)/g;
                const collectLegacyNotesFrom = rawTxt => {
                    if (!rawTxt || !rawTxt.includes('[Attached:')) return;
                    legacyNoteRegex.lastIndex = 0;
                    let lm;
                    while ((lm = legacyNoteRegex.exec(rawTxt)) !== null) {
                        const trimmedLegacy = String(lm[1] || '').trim();
                        const legacyUri = String(lm[2] || '').trim();
                        if (
                            trimmedLegacy &&
                            !legacyAttachedNotes.some(
                                n => n.name.toLowerCase() === trimmedLegacy.toLowerCase() && n.uri === legacyUri
                            )
                        ) {
                            legacyAttachedNotes.push({
                                name: trimmedLegacy,
                                uri: legacyUri,
                                cls: classifyMediaAttachment('', trimmedLegacy),
                                consumed: false
                            });
                        }
                    }
                };
                for (const it of items) {
                    if (typeof it.text === 'string') collectLegacyNotesFrom(it.text);
                }
                collectLegacyNotesFrom(ui.userResponse || '');

                const rawMediaItems = Array.isArray(ui.media) ? ui.media : [];
                for (const m of rawMediaItems) {
                    let mName = String(m.description || m.displayName || '').trim();
                    const mCls = classifyMediaAttachment(m.mimeType || '', mName || m.uri || '');
                    if (!mName) {
                        const matchedLegacy = legacyAttachedNotes.find(
                            ln => !ln.consumed && ln.cls.category === mCls.category
                        );
                        if (matchedLegacy) {
                            matchedLegacy.consumed = true;
                            mName = matchedLegacy.name;
                        } else if (m.uri) {
                            mName = basename(uriToLocalPath(m.uri));
                        }
                    } else {
                        const exactLegacy = legacyAttachedNotes.find(
                            ln => !ln.consumed && ln.name.toLowerCase() === mName.toLowerCase()
                        );
                        if (exactLegacy) exactLegacy.consumed = true;
                    }
                    pushRenderedMediaCard(m.mimeType || '', mName, m.uri || '', m.inlineData || '', m.thumbnail || '');
                }

                for (const ln of legacyAttachedNotes) {
                    if (!ln.consumed && !seenMediaNames.has(`${ln.name.toLowerCase()}|`)) {
                        ln.consumed = true;
                        pushRenderedMediaCard('', ln.name, ln.uri);
                    }
                }

                const stripLegacyUploadLocationNotes = (rawTxt) => {
                    if (!rawTxt || !rawTxt.includes('[Attached:')) return rawTxt;
                    return rawTxt
                        .replace(/\[Attached:\s*([^\]]+)\]\((file:\/\/\/[^)\r\n]+\/uploads\/[^)\r\n]+)\)/g, '')
                        .replace(/\n{3,}/g, '\n\n');
                };

                let addedVoiceBadge = false;
                for (const it of items) {
                    if (typeof it.text === 'string') {
                        const strippedItemText = stripLegacyUploadLocationNotes(it.text);
                        const parsedVoice = parseVoiceContextText(strippedItemText);
                        if (parsedVoice.isVoice && !addedVoiceBadge) {
                            addedVoiceBadge = true;
                            renderScopeBadge('<span class="agy-file-badge">🎙️ Voice</span>');
                        }
                        const cleanedItemText = parsedVoice.isVoice ? parsedVoice.text : strippedItemText;
                        if (!hasSeenBodyContent && !cleanedItemText.trim()) {
                            continue;
                        }
                        hasSeenBodyContent = true;
                        pendingInlineHtml.push(escapeHtml(cleanedItemText));
                    } else if (it.item?.slashCommand?.info?.name) {
                        renderScopeBadge(`<span class="agy-slash-badge">/${escapeHtml(it.item.slashCommand.info.name)}</span>`);
                    } else if (it.item?.recipe) {
                        const rName = it.item.recipe.title || it.item.recipe.recipeId || 'workflow';
                        renderScopeBadge(`<span class="agy-slash-badge agy-workflow-badge">/${escapeHtml(rName)}</span>`);
                    } else if (it.item?.mcpPrompt) {
                        const mp = it.item.mcpPrompt;
                        const mpName = mp.serverName ? `mcp:${mp.serverName}:${mp.name}` : mp.name || 'prompt';
                        renderScopeBadge(`<span class="agy-slash-badge agy-mcp-badge">/${escapeHtml(mpName)}</span>`);
                    } else if (it.item?.file?.absoluteUri || it.item?.file?.absolutePathUri) {
                        const fUri = it.item.file.absoluteUri || it.item.file.absolutePathUri;
                        const fName = formatShortWorkspacePath(fUri, 'file').split('/').pop();
                        renderScopeBadge(`<span class="agy-file-badge">📎 ${escapeHtml(fName)}</span>`);
                    } else if (it.item?.plugin) {
                        const pLabel = it.item.plugin.displayName || it.item.plugin.name || 'plugin';
                        renderScopeBadge(`<span class="agy-file-badge">🧩 ${escapeHtml(pLabel)}</span>`);
                    } else if (it.item?.conversation?.id) {
                        const convTitle = it.item.conversation.title || it.item.conversation.id.slice(0, 8);
                        renderScopeBadge(`<span class="agy-file-badge">💬 ${escapeHtml(convTitle)}</span>`);
                    } else if (it.item?.textBlock) {
                        flushPendingInline();
                        hasSeenBodyContent = true;
                        const tb = it.item.textBlock;
                        const tbContent = String(tb.content || '').trim();
                        const fileRange = tb.fileLineRange || null;
                        const tbLabel = String(tb.label || (fileRange ? 'file_range' : 'Quote')).trim();

                        if (tbContent || fileRange) {
                            if (tbLabel === 'code_block' || fileRange) {
                                let codeHeader = '&lt;/&gt; Quoted Code';
                                const rangeUri = fileRange?.absoluteUri || fileRange?.fileUri;
                                if (rangeUri) {
                                    const shortFile = formatShortWorkspacePath(rangeUri, 'file');
                                    const sLine = typeof fileRange.startLine === 'number' ? fileRange.startLine + 1 : null;
                                    const eLine = typeof fileRange.endLine === 'number' ? fileRange.endLine + 1 : null;
                                    const rangeSuffix = sLine ? (eLine && eLine !== sLine ? `:${sLine}-${eLine}` : `:${sLine}`) : '';
                                    codeHeader = `📄 ${escapeHtml(shortFile + rangeSuffix)}`;
                                }
                                bodySegments.push(`
                                    <div class="agy-user-quote-block is-code" data-testid="user-quote-block">
                                        <div class="agy-user-quote-label">${codeHeader}</div>
                                        ${tbContent ? `<pre class="agy-user-quote-code"><code>${escapeHtml(tbContent)}</code></pre>` : ''}
                                    </div>
                                `);
                            } else if (tbLabel.startsWith('Side question (conversation ')) {
                                const sqIdx = tbLabel.indexOf('): ');
                                const sqTitle = sqIdx > 28 ? tbLabel.slice(sqIdx + 3) : 'Side Question';
                                bodySegments.push(`
                                    <blockquote class="agy-user-quote-block is-side-question" data-testid="user-quote-block">
                                        <div class="agy-user-quote-label">💬 Side Question · ${escapeHtml(sqTitle)}</div>
                                        <div class="agy-user-quote-text">${escapeHtml(tbContent)}</div>
                                    </blockquote>
                                `);
                            } else {
                                const headerLabel = tbLabel === 'Quote' ? 'Quoted Response' : tbLabel;
                                bodySegments.push(`
                                    <blockquote class="agy-user-quote-block" data-testid="user-quote-block">
                                        <div class="agy-user-quote-label">❝ ${escapeHtml(headerLabel)}</div>
                                        <div class="agy-user-quote-text">${escapeHtml(tbContent)}</div>
                                    </blockquote>
                                `);
                            }
                            lastWasQuoteBlock = true;
                        }
                    }
                }
                flushPendingInline();

                if (bodySegments.length === 0 && badges.length === 0 && mediaCards.length === 0) {
                    const fallbackRaw = stripLegacyUploadLocationNotes(
                        String(ui.userResponse || '').replace(/@\[(?:Quote|code_block)\]\s*/g, '')
                    ).trim();
                    if (fallbackRaw) {
                        bodySegments.push(`<div class="whitespace-pre-wrap agy-user-text">${escapeHtml(fallbackRaw)}</div>`);
                    }
                }

                const badgesHtml = badges.length ? `<div class="agy-user-badges">${badges.join(' ')}</div>` : '';
                const mediaHtml = mediaCards.length
                    ? `<div class="agy-user-media-grid" data-testid="user-media-attachments">${mediaCards.join('\n')}</div>`
                    : '';
                if (!badgesHtml && !mediaHtml && bodySegments.length === 0) continue;

                renderedParts.push(`
                    <article role="article" aria-label="User message" class="agy-turn agy-user-turn" data-step-index="${i}">
                        ${mediaHtml}
                        ${
                            badgesHtml || bodySegments.length > 0
                                ? `<div class="agy-user-card">
                                    ${badgesHtml}
                                    ${bodySegments.join('\n')}
                                </div>`
                                : ''
                        }
                    </article>
                `);
                nodeCount += 5 + bodySegments.length + mediaCards.length;
            } else if (stType === 'CORTEX_STEP_TYPE_SYSTEM_MESSAGE') {
                const sysMsg = step.systemMessage || {};
                const agentMsg = sysMsg.agentMessage;
                const renderInfo = sysMsg.renderInfo;

                // Respect explicit hidden flags on internal system / canceled task notifications
                if (
                    sysMsg.hidden ||
                    renderInfo?.hidden ||
                    agentMsg?.hideFromUser ||
                    agentMsg?.renderDetails?.hidden
                ) {
                    continue;
                }

                // Only render genuine inter-agent messages or explicit renderInfo blocks
                if (!agentMsg && !renderInfo) continue;

                const termBlock = Array.isArray(renderInfo?.contentBlocks)
                    ? renderInfo.contentBlocks.find(b => b && b.terminal)?.terminal || null
                    : null;
                const isBgTaskMsg =
                    Boolean(termBlock) || /\/task-\d+$/i.test(String(agentMsg?.sender || ''));

                if (isBgTaskMsg) {
                    const taskTitle = String(
                        renderInfo?.title || agentMsg?.renderDetails?.messageTitle || 'Background Task'
                    ).trim();
                    const rawOut = termBlock
                        ? ((termBlock.command || '') + (termBlock.output ? '\n\n' + termBlock.output : '')).trim()
                        : String(agentMsg?.content || sysMsg.message || '').trim();
                    const isCanceled = /\bcancel(?:ed|led)\b/i.test(taskTitle);
                    const isFailed =
                        !isCanceled &&
                        (/\bexit(?:ed)? with code [1-9]\d*\b/i.test(String(agentMsg?.content || '')) ||
                            /\bfailed\b/i.test(taskTitle));
                    const stateLabel = isCanceled ? 'Canceled' : isFailed ? 'Failed' : 'Done';

                    renderedParts.push(`
                        <details class="agy-tool-pill" data-step-index="${i}">
                            <summary>
                                <span class="agy-tool-tag">⌘ Task</span>
                                <code class="agy-tool-cmd">${escapeHtml(taskTitle.substring(0, 90))}${taskTitle.length > 90 ? '…' : ''}</code>
                                <span class="agy-tool-state">${stateLabel}</span>
                            </summary>
                            ${rawOut ? `<pre class="agy-tool-output"><code>${escapeHtml(rawOut.substring(0, 2800))}</code></pre>` : ''}
                        </details>
                    `);
                    nodeCount += 5;
                    continue;
                }

                const rawContent =
                    agentMsg?.content ||
                    renderInfo?.contentBlocks?.map(b => b.markdown || b.text || '').join('\n') ||
                    '';
                if (!rawContent.trim()) continue;

                const taskMatch = /<original_task>([\s\S]*?)<\/original_task>/.exec(rawContent);
                const cleanBody = (taskMatch ? taskMatch[1] : rawContent).trim();
                const cardTitle =
                    renderInfo?.title ||
                    agentMsg?.renderDetails?.messageTitle ||
                    (parentCascadeId ? 'Delegated Task Specification' : 'Subagent Report');

                renderedParts.push(`
                    <details class="agy-delegated-task-card" data-quotable-turn="1" data-quote-source="${escapeHtml(cardTitle)}" data-step-index="${i}" ${i <= 2 ? 'open' : ''}>
                        <summary class="agy-delegated-header">${escapeHtml(cardTitle)}</summary>
                        <div class="agy-delegated-body agy-markdown-body">${renderMarkdownLite(cleanBody)}</div>
                    </details>
                `);
                nodeCount += 4;
            } else if (stType === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE') {
                const pr = step.plannerResponse || {};
                const thinking = (pr.thinking || '').trim();
                const answer = (pr.modifiedResponse || pr.response || '').trim();
                const modelLabel = this.resolveModelLabel(step.metadata?.generatorModel || step.metadata?.modelUsage?.model);
                const thinkTokens = step.metadata?.modelUsage?.thinkingOutputTokens;

                if (!thinking && !answer) continue;

                const thinkingHtml = thinking
                    ? `
                    <details class="agy-thought-accordion">
                        <summary class="agy-thought-summary">
                            <span class="agy-thought-icon">✦</span>
                            <span>Thought process${thinkTokens ? ` · ${escapeHtml(thinkTokens)} tokens` : ''}</span>
                        </summary>
                        <div class="agy-thought-body">${escapeHtml(thinking)}</div>
                    </details>`
                    : '';

                const answerHtml = answer
                    ? `<div class="agy-markdown-body">${renderMarkdownLite(answer)}</div>`
                    : '';

                const quotableAttrs = answer
                    ? ` data-quotable-turn="1" data-quote-source="${escapeHtml(modelLabel || 'Assistant')}"`
                    : '';

                renderedParts.push(`
                    <article role="article" aria-label="Assistant response" class="agy-turn agy-ai-turn"${quotableAttrs} data-step-index="${i}">
                        ${modelLabel ? `<div class="agy-model-meta">${escapeHtml(modelLabel)}</div>` : ''}
                        ${thinkingHtml}
                        ${answerHtml}
                    </article>
                `);
                nodeCount += 8;
            } else if (
                stType === 'CORTEX_STEP_TYPE_ASK_QUESTION' ||
                step.askQuestion ||
                step.requestedInteraction?.askQuestion
            ) {
                const aq = step.askQuestion || step.requestedInteraction?.askQuestion || {};
                const questions = aq.questions || [];
                const isWaiting = stStatus.includes('WAITING') || Boolean(step.requestedInteraction?.askQuestion);
                const stepInfo = step.metadata?.sourceTrajectoryStepInfo || {};
                const trajectoryId = stepInfo.trajectoryId || fallbackTrajectoryId || '';
                const resolvedStepIndex = typeof stepInfo.stepIndex === 'number' ? stepInfo.stepIndex : i;
                const resolvedCascadeId = stepInfo.cascadeId || cid;

                const completedAskResponses =
                    step.completedInteractions
                        ?.map(ci => ci?.response?.askQuestion?.responses)
                        .find(arr => Array.isArray(arr) && arr.length > 0) || [];
                const wasCancelled = Boolean(
                    aq.cancelled ||
                        step.completedInteractions?.some(ci => ci?.response?.askQuestion?.cancelled)
                );

                if (questions.length > 0) {
                    const qCardsHtml = questions
                        .map((q, qIdx) => {
                            const opts = Array.isArray(q.options) ? q.options : [];
                            const isMulti = !!q.isMultiSelect;
                            const compResp =
                                completedAskResponses.find(r => r?.question && r.question === q.question) ||
                                completedAskResponses[qIdx] ||
                                null;
                            const answeredIds = new Set(
                                [
                                    ...(Array.isArray(q.selectedOptionIds) ? q.selectedOptionIds : []),
                                    ...(Array.isArray(compResp?.selectedOptionIds) ? compResp.selectedOptionIds : [])
                                ].map(String)
                            );
                            const answeredWriteIn = String(
                                q.writeInResponse || compResp?.writeInResponse || ''
                            ).trim();

                            const optsHtml = opts
                                .map((opt, oIdx) => {
                                    const optId = typeof opt === 'string' ? String(oIdx + 1) : opt.id || String(oIdx + 1);
                                    const optText = typeof opt === 'string' ? opt : opt.text || optId;
                                    const isChosen = !isWaiting && answeredIds.has(String(optId));
                                    return `
                                        <button type="button"
                                            class="agy-question-opt-btn ${isChosen ? 'selected' : ''}"
                                            data-q-index="${qIdx}"
                                            data-opt-id="${escapeHtml(optId)}"
                                            data-multi="${isMulti ? '1' : '0'}"
                                            ${!isWaiting ? 'disabled' : ''}>
                                            ${escapeHtml(optText)}
                                        </button>
                                    `;
                                })
                                .join('');

                            return `
                                <div class="agy-question-block" data-q-block="${qIdx}" data-question-text="${escapeHtml(q.question || '')}">
                                    <div class="agy-question-title">${escapeHtml(q.question || 'Agent Question')}</div>
                                    <div class="agy-question-options">${optsHtml}</div>
                                    ${
                                        isWaiting
                                            ? `<input type="text" class="agy-question-writein" data-q-writein="${qIdx}" placeholder="Or type a custom answer…" />`
                                            : answeredWriteIn
                                              ? `<div class="agy-question-answered-note">✍️ ${escapeHtml(answeredWriteIn)}</div>`
                                              : ''
                                    }
                                </div>
                            `;
                        })
                        .join('');

                    renderedParts.push(`
                        <div class="agy-question-card ${isWaiting ? 'is-waiting' : 'is-done'}"
                             data-hub-question-card="1"
                             data-cascade-id="${escapeHtml(resolvedCascadeId)}"
                             data-trajectory-id="${escapeHtml(trajectoryId)}"
                             data-step-index="${resolvedStepIndex}"
                             data-trajectory-step-index="${i}">
                            <div class="agy-question-header">
                                <span>❓ ${isWaiting ? 'Agent Needs Input' : wasCancelled ? 'Question Cancelled' : 'Question Answered'}</span>
                            </div>
                            ${qCardsHtml}
                            ${
                                isWaiting
                                    ? `<div class="agy-approval-actions">
                                        <button type="button" class="agy-interact-btn agy-interact-approve" data-hub-interact="submit-question">Submit Answer</button>
                                       </div>`
                                    : ''
                            }
                        </div>
                    `);
                    nodeCount += 8;
                }
            } else if (stType === 'CORTEX_STEP_TYPE_INVOKE_SUBAGENT') {
                const inv = step.invokeSubagent || {};
                const subs = inv.subagents || [];
                const results = inv.results || [];

                subs.forEach((sub, idx) => {
                    const childCid = results[idx]?.conversationId || '';
                    const childSummary = childCid ? summaries[childCid] : null;
                    const childRunning = String(childSummary?.status || stStatus || '').includes('RUNNING');
                    if (childRunning) isGenerating = true;
                    const childSteps = childSummary?.stepCount ?? '';

                    renderedParts.push(`
                        <div class="agy-subagent-card ${childRunning ? 'is-running' : 'is-done'}" data-step-index="${i}" ${childCid ? `data-select-cascade="${escapeHtml(childCid)}"` : ''}>
                            <div class="agy-subagent-card-top">
                                <div class="agy-subagent-title-group">
                                    <span class="agy-subagent-dot ${childRunning ? 'pulsing' : ''}"></span>
                                    <strong>${escapeHtml(sub.role || sub.typeName || 'Subagent')}</strong>
                                    <span class="agy-subagent-type">${escapeHtml(sub.typeName || 'Worker')}</span>
                                </div>
                                <span class="agy-subagent-status-badge ${childRunning ? 'running' : 'done'}">
                                    ${childRunning ? 'Running' : 'Completed'}${childSteps !== '' ? ` · ${childSteps} steps` : ''}
                                </span>
                            </div>
                            ${sub.initialPrompt ? `<div class="agy-subagent-prompt">${escapeHtml(sub.initialPrompt.substring(0, 180))}${sub.initialPrompt.length > 180 ? '…' : ''}</div>` : ''}
                            ${childCid ? `<button type="button" class="agy-inspect-subagent-btn" data-select-cascade="${escapeHtml(childCid)}">Inspect Live Subagent →</button>` : ''}
                        </div>
                    `);
                    nodeCount += 7;
                });
            } else if (stType === 'CORTEX_STEP_TYPE_RUN_COMMAND') {
                const rc = step.runCommand || {};
                const cmd = rc.commandLine || rc.proposedCommandLine || '';
                const out = rc.combinedOutput?.full || rc.output || '';
                const waitingApproval = stStatus.includes('WAITING') || Boolean(step.requestedInteraction);
                const runningNow = stStatus.includes('RUNNING') || stStatus.includes('PENDING');
                const approvalHtml = waitingApproval
                    ? this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId })
                    : '';

                renderedParts.push(`
                    <details class="agy-tool-pill ${waitingApproval ? 'needs-approval' : ''}" data-step-index="${i}" ${waitingApproval ? 'open' : ''}>
                        <summary>
                            <span class="agy-tool-tag">⌘ Terminal</span>
                            <code class="agy-tool-cmd">${escapeHtml(cmd.substring(0, 90))}${cmd.length > 90 ? '…' : ''}</code>
                            <span class="agy-tool-state">${waitingApproval ? 'Approve?' : runningNow ? 'Running' : 'Done'}</span>
                        </summary>
                        <pre class="agy-tool-output"><code>${escapeHtml((cmd + (out ? '\n\n' + out : '')).substring(0, 2800))}</code></pre>
                        ${approvalHtml}
                    </details>
                `);
                nodeCount += 5;
            } else if (stType === 'CORTEX_STEP_TYPE_VIEW_FILE') {
                const vf = step.viewFile || {};
                const args = parseToolCallArgs(step);
                const uri = vf.absolutePathUri || args.Path || args.file_path || '';
                const shortName = formatShortWorkspacePath(uri, 'file');
                const approvalHtml = stStatus.includes('WAITING') || Boolean(step.requestedInteraction)
                    ? this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId })
                    : '';
                renderedParts.push(`
                    <div class="agy-tool-inline" data-step-index="${i}">
                        <span class="agy-tool-tag">📄 Read</span>
                        <span>${escapeHtml(shortName)}</span>
                    </div>
                    ${approvalHtml}
                `);
                nodeCount += 2;
            } else if (stType.includes('EDIT') || stType.includes('WRITE') || stType.includes('CODE_ACTION')) {
                const caDetails = extractCodeActionDetails(step);
                const waitingApproval = stStatus.includes('WAITING') || Boolean(step.requestedInteraction);
                const runningNow = stStatus.includes('RUNNING') || stStatus.includes('PENDING');
                const failed = stStatus.includes('ERROR') || stStatus.includes('FAILED');
                const stateLabel = waitingApproval ? 'Approve?' : runningNow ? 'Running' : failed ? 'Failed' : 'Done';
                const isDeletedAction = caDetails.actionLabel.includes('Deleted');

                if (caDetails.rawUri) {
                    const prevEntry = changedFilesMap.get(caDetails.rawUri);
                    changedFilesMap.set(caDetails.rawUri, {
                        rawUri: caDetails.rawUri,
                        localPath: uriToLocalPath(caDetails.rawUri),
                        shortName: caDetails.shortName,
                        actionLabel: caDetails.actionLabel,
                        additions: (prevEntry?.additions || 0) + (caDetails.additions || 0),
                        deletions: (prevEntry?.deletions || 0) + (caDetails.deletions || 0)
                    });
                }

                const statBadges = [];
                if (caDetails.additions > 0) {
                    statBadges.push(`<span class="agy-diff-add">+${caDetails.additions}</span>`);
                }
                if (caDetails.deletions > 0) {
                    statBadges.push(`<span class="agy-diff-del">-${caDetails.deletions}</span>`);
                }
                const diffStatsHtml = statBadges.length
                    ? `<span class="agy-diff-stats">${statBadges.join(' ')}</span>`
                    : '';

                const openIdeBtnHtml =
                    caDetails.rawUri && !isDeletedAction
                        ? `<button type="button" class="agy-open-ide-pill-btn" data-open-ide-uri="${escapeHtml(caDetails.rawUri)}" title="Inspect file in Antigravity IDE">&lt;/&gt; IDE</button>`
                        : '';

                const approvalHtml = waitingApproval
                    ? this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId })
                    : '';

                if (caDetails.diffPreviewHtml || waitingApproval) {
                    renderedParts.push(`
                        <details class="agy-tool-pill agy-tool-edit ${waitingApproval ? 'needs-approval' : ''}" data-step-index="${i}" ${waitingApproval ? 'open' : ''}>
                            <summary>
                                <span class="agy-tool-tag">${caDetails.actionLabel}</span>
                                <code class="agy-tool-cmd">${escapeHtml(caDetails.shortName)}</code>
                                ${diffStatsHtml}
                                ${openIdeBtnHtml}
                                <span class="agy-tool-state">${stateLabel}</span>
                            </summary>
                            ${caDetails.diffPreviewHtml ? `<pre class="agy-tool-output agy-diff-preview"><code>${caDetails.diffPreviewHtml}</code></pre>` : ''}
                            ${approvalHtml}
                        </details>
                    `);
                    nodeCount += 5;
                } else {
                    renderedParts.push(`
                        <div class="agy-tool-inline agy-tool-edit" data-step-index="${i}">
                            <span class="agy-tool-tag">${caDetails.actionLabel}</span>
                            <span>${escapeHtml(caDetails.shortName)}</span>
                            ${diffStatsHtml}
                            ${openIdeBtnHtml}
                            ${runningNow || failed ? `<span class="agy-tool-state">${stateLabel}</span>` : ''}
                        </div>
                        ${approvalHtml}
                    `);
                    nodeCount += 3;
                }
            } else if (stType === 'CORTEX_STEP_TYPE_GENERIC' || step.generic) {
                const toolName = step.metadata?.toolCall?.name || '';
                const genArgs = parseToolCallArgs(step);
                const genResult = step.generic?.result || {};
                const renderInfo = genResult.stepRenderInfo || null;
                const waitingApproval = stStatus.includes('WAITING') || Boolean(step.requestedInteraction);
                const runningNow =
                    stStatus.includes('RUNNING') || stStatus.includes('PENDING') || stStatus.includes('GENERATING');
                const failed =
                    stStatus.includes('ERROR') || stStatus.includes('FAILED') || stStatus.includes('CANCELED');
                const stateLabel = waitingApproval ? 'Approve?' : runningNow ? 'Running' : failed ? 'Failed' : 'Done';
                const approvalHtml = waitingApproval
                    ? this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId })
                    : '';

                const isTerminalGeneric =
                    toolName === 'run_command' ||
                    renderInfo?.aggregationKey === 'terminal' ||
                    (Array.isArray(renderInfo?.contentBlocks) && renderInfo.contentBlocks.some(b => b.terminal));

                if (isTerminalGeneric) {
                    const termBlock = renderInfo?.contentBlocks?.find(b => b.terminal)?.terminal || {};
                    const cmd = String(genArgs.CommandLine || termBlock.command || genArgs.command || '').trim();
                    const summaryText =
                        cmd ||
                        genArgs.toolSummary ||
                        renderInfo?.titleParts?.map(p => p.text || '').join(' ').trim() ||
                        'command';
                    const out = String(
                        termBlock.output || (typeof genResult.result === 'string' ? genResult.result : '') || ''
                    ).trim();

                    renderedParts.push(`
                        <details class="agy-tool-pill ${waitingApproval ? 'needs-approval' : ''}" data-step-index="${i}" ${waitingApproval ? 'open' : ''}>
                            <summary>
                                <span class="agy-tool-tag">⌘ Terminal</span>
                                <code class="agy-tool-cmd">${escapeHtml(summaryText.substring(0, 90))}${summaryText.length > 90 ? '…' : ''}</code>
                                <span class="agy-tool-state">${stateLabel}</span>
                            </summary>
                            <pre class="agy-tool-output"><code>${escapeHtml(((cmd || summaryText) + (out ? '\n\n' + out : '')).substring(0, 2800))}</code></pre>
                            ${approvalHtml}
                        </details>
                    `);
                    nodeCount += 5;
                } else if (toolName === 'send_message') {
                    const recipientName =
                        genResult.payload?.recipientName ||
                        genResult.metadata?.recipient_name ||
                        renderInfo?.titleParts?.map(p => p.text || '').join(' ').trim() ||
                        genArgs.Recipient ||
                        'Agent';
                    const msgBody =
                        genArgs.Message ||
                        genResult.payload?.message ||
                        renderInfo?.contentBlocks?.map(b => b.markdown || b.text || '').join('\n') ||
                        '';

                    renderedParts.push(`
                        <details class="agy-tool-pill agy-tool-generic ${waitingApproval ? 'needs-approval' : ''}" data-step-index="${i}" ${waitingApproval ? 'open' : ''}>
                            <summary>
                                <span class="agy-tool-tag">✉️ Messaged</span>
                                <code class="agy-tool-cmd">${escapeHtml(String(recipientName).substring(0, 90))}</code>
                                <span class="agy-tool-state">${stateLabel}</span>
                            </summary>
                            ${msgBody ? `<div class="agy-delegated-body agy-generic-body agy-markdown-body">${renderMarkdownLite(String(msgBody).substring(0, 6000))}</div>` : ''}
                            ${approvalHtml}
                        </details>
                    `);
                    nodeCount += 5;
                } else {
                    const isSwarmGeneric =
                        toolName === 'swarm' ||
                        toolName === 'swarm_manage' ||
                        toolName === 'post_message' ||
                        toolName === 'swarm_post_message' ||
                        toolName === 'read_board' ||
                        toolName === 'swarm_read_board' ||
                        toolName === 'swarm_wait' ||
                        toolName.startsWith('swarm_');

                    let tagLabel = '';
                    if (toolName === 'swarm_post_message' || toolName === 'post_message') tagLabel = '🐝 Swarm Post';
                    else if (toolName === 'swarm_read_board' || toolName === 'read_board') tagLabel = '🐝 Swarm Board';
                    else if (toolName === 'swarm_wait') tagLabel = '🐝 Swarm Wait';
                    else if (isSwarmGeneric) tagLabel = '🐝 Swarm';
                    else if (toolName === 'run_workflow') tagLabel = '⚡ Workflow';
                    else if (toolName === 'manage_task') tagLabel = '⚙️ Task';
                    else if (toolName === 'schedule') tagLabel = '⏱️ Schedule';
                    else if (toolName === 'define_subagent' || toolName === 'manage_subagents') tagLabel = '🤖 Subagent';
                    else if (toolName === 'search_marketplace' || toolName === 'list_plugin_accounts') tagLabel = '🧩 Plugin';
                    else if (toolName === 'call_mcp_tool' || toolName === 'read_resource' || toolName === 'list_resources') {
                        tagLabel = '🔌 MCP';
                    } else {
                        tagLabel = `🔧 ${renderInfo?.titlePrefix || humanizeToolName(toolName)}`;
                    }

                    const titleFromRender = renderInfo?.titleParts
                        ?.map(p => p.text || p.code || '')
                        .filter(Boolean)
                        .join(' ')
                        .trim();

                    let subject = titleFromRender || '';
                    if (!subject) {
                        if (isSwarmGeneric) {
                            const ch = genArgs.Channel || genArgs.channel;
                            const act = genArgs.Action || genArgs.action || genArgs.op;
                            const targetMember = genArgs.Name || genArgs.name ? `@${genArgs.Name || genArgs.name}` : '';
                            const sinceArg =
                                genArgs.since !== undefined ? `since #${genArgs.since}` : '';
                            const msgTxt = String(
                                genArgs.Summary || genArgs.summary || genArgs.Message || genArgs.text || genArgs.title || ''
                            )
                                .replace(/\s+/g, ' ')
                                .trim();
                            subject = [
                                act,
                                targetMember,
                                ch ? `#${ch}` : '',
                                sinceArg,
                                msgTxt
                            ]
                                .filter(Boolean)
                                .join(' · ');
                        } else if (toolName === 'run_workflow') {
                            subject = genArgs.WorkflowName || genArgs.workflow || genArgs.Name || genArgs.Path || 'workflow';
                        } else if (toolName === 'manage_task') {
                            subject = [genArgs.Action || genArgs.action, genArgs.TaskId || genArgs.taskId]
                                .filter(Boolean)
                                .join(' · ');
                        } else if (toolName === 'schedule') {
                            subject = [
                                genArgs.CronExpression
                                    ? `cron ${genArgs.CronExpression}`
                                    : genArgs.DurationSeconds
                                      ? `${genArgs.DurationSeconds}s`
                                      : '',
                                genArgs.Prompt || ''
                            ]
                                .filter(Boolean)
                                .join(' · ');
                        } else if (toolName === 'call_mcp_tool') {
                            subject = [genArgs.ServerName, genArgs.ToolName].filter(Boolean).join(' / ');
                        }
                    }
                    if (!subject) {
                        subject =
                            genArgs.ToolName ||
                            genArgs.Name ||
                            genArgs.Action ||
                            genArgs.Prompt ||
                            genArgs.Summary ||
                            genArgs.query ||
                            toolName ||
                            'step';
                    }
                    subject = String(subject).trim();

                    const swarmOpenBtnHtml = isSwarmGeneric
                        ? `<button type="button" class="agy-open-ide-pill-btn agy-open-swarm-step-btn" data-open-swarm-ui="1" title="Open Live Swarm UI">🐝 Board</button>`
                        : '';

                    const blockTexts = Array.isArray(renderInfo?.contentBlocks)
                        ? renderInfo.contentBlocks
                              .map(
                                  b =>
                                      b.markdown ||
                                      b.text ||
                                      b.code ||
                                      b.terminal?.output ||
                                      b.terminal?.command ||
                                      ''
                              )
                              .filter(Boolean)
                        : [];

                    let detailOutput = blockTexts.join('\n').trim();
                    if (!detailOutput && typeof genResult.result === 'string' && genResult.result.trim()) {
                        detailOutput = genResult.result.trim();
                    }
                    if (!detailOutput && Object.keys(genArgs).length > 0) {
                        detailOutput = JSON.stringify(genArgs, null, 2);
                    }

                    if (detailOutput || waitingApproval) {
                        renderedParts.push(`
                            <details class="agy-tool-pill agy-tool-generic ${waitingApproval ? 'needs-approval' : ''}" data-step-index="${i}" ${waitingApproval ? 'open' : ''}>
                                <summary>
                                    <span class="agy-tool-tag">${escapeHtml(tagLabel)}</span>
                                    <code class="agy-tool-cmd">${escapeHtml(subject.substring(0, 90))}${subject.length > 90 ? '…' : ''}</code>
                                    ${swarmOpenBtnHtml}
                                    <span class="agy-tool-state">${stateLabel}</span>
                                </summary>
                                ${detailOutput ? `<pre class="agy-tool-output"><code>${escapeHtml(detailOutput.substring(0, 2800))}</code></pre>` : ''}
                                ${approvalHtml}
                            </details>
                        `);
                        nodeCount += 5;
                    } else {
                        renderedParts.push(`
                            <div class="agy-tool-inline agy-tool-generic" data-step-index="${i}">
                                <span class="agy-tool-tag">${escapeHtml(tagLabel)}</span>
                                <span>${escapeHtml(subject.substring(0, 90))}</span>
                                ${swarmOpenBtnHtml}
                                <span class="agy-tool-state">${stateLabel}</span>
                            </div>
                        `);
                        nodeCount += 3;
                    }
                }
            } else if (stType === 'CORTEX_STEP_TYPE_ERROR_MESSAGE' || step.errorMessage) {
                const em = step.errorMessage || {};
                const errText =
                    em.error?.userErrorMessage ||
                    em.error?.shortError ||
                    em.userErrorMessage ||
                    em.message ||
                    (typeof em === 'string' ? em : '') ||
                    'Agent step encountered an error';
                renderedParts.push(`
                    <div class="agy-error-card" data-step-index="${i}">
                        <span>⚠️ ${escapeHtml(String(errText).substring(0, 400))}</span>
                    </div>
                `);
                nodeCount += 2;
            } else if (
                stType === 'CORTEX_STEP_TYPE_GREP_SEARCH' ||
                stType === 'CORTEX_STEP_TYPE_FIND' ||
                stType === 'CORTEX_STEP_TYPE_LIST_DIRECTORY' ||
                stType === 'CORTEX_STEP_TYPE_CODE_SEARCH'
            ) {
                const args = parseToolCallArgs(step);
                const isListDir = stType === 'CORTEX_STEP_TYPE_LIST_DIRECTORY';
                const target =
                    step.grepSearch?.query ||
                    step.find?.pattern ||
                    step.codeSearch?.query ||
                    step.listDirectory?.directoryPathUri ||
                    args.Query ||
                    args.Pattern ||
                    args.SearchPath ||
                    args.DirectoryPath ||
                    args.Path ||
                    'workspace';
                const label = isListDir ? '📁 List' : '🔍 Find';
                const displayTarget = isListDir
                    ? formatShortWorkspacePath(String(target), String(target))
                    : String(target);
                const approvalHtml = stStatus.includes('WAITING') || Boolean(step.requestedInteraction)
                    ? this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId })
                    : '';
                renderedParts.push(`
                    <div class="agy-tool-inline" data-step-index="${i}">
                        <span class="agy-tool-tag">${label}</span>
                        <span>${escapeHtml(displayTarget.substring(0, 80))}</span>
                    </div>
                    ${approvalHtml}
                `);
                nodeCount += 2;
            } else if (
                stType === 'CORTEX_STEP_TYPE_MCP_TOOL' ||
                stType === 'CORTEX_STEP_TYPE_READ_RESOURCE' ||
                stType === 'CORTEX_STEP_TYPE_LIST_RESOURCES'
            ) {
                const args = parseToolCallArgs(step);
                const mcpLabel =
                    [
                        step.mcpTool?.serverName || args.ServerName,
                        step.mcpTool?.toolName || args.ToolName || args.Uri || step.metadata?.toolCall?.name
                    ]
                        .filter(Boolean)
                        .join(' / ') || 'MCP Tool';
                const approvalHtml = stStatus.includes('WAITING') || Boolean(step.requestedInteraction)
                    ? this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId })
                    : '';
                renderedParts.push(`
                    <div class="agy-tool-inline" data-step-index="${i}">
                        <span class="agy-tool-tag">🔌 MCP</span>
                        <span>${escapeHtml(String(mcpLabel).substring(0, 80))}</span>
                    </div>
                    ${approvalHtml}
                `);
                nodeCount += 2;
            } else if (stType === 'CORTEX_STEP_TYPE_NOTIFY_USER' || step.notifyUser) {
                const nu = step.notifyUser || {};
                const args = parseToolCallArgs(step);
                const msg = (nu.message || args.Message || '').trim();
                if (msg) {
                    renderedParts.push(`
                        <article role="article" aria-label="Agent notification" class="agy-turn agy-ai-turn" data-quotable-turn="1" data-quote-source="Agent Notification" data-step-index="${i}">
                            <div class="agy-markdown-body">${renderMarkdownLite(msg)}</div>
                        </article>
                    `);
                    nodeCount += 4;
                }
            } else if (stType === 'CORTEX_STEP_TYPE_GENERATE_IMAGE' || step.generateImage) {
                const args = parseToolCallArgs(step);
                const imgName = step.generateImage?.imageName || args.ImageName || args.Prompt || 'image';
                renderedParts.push(`
                    <div class="agy-tool-inline" data-step-index="${i}">
                        <span class="agy-tool-tag">🎨 Image</span>
                        <span>${escapeHtml(String(imgName).substring(0, 80))}</span>
                    </div>
                `);
                nodeCount += 2;
            } else if (
                stType === 'CORTEX_STEP_TYPE_OPEN_BROWSER_URL' ||
                stType === 'CORTEX_STEP_TYPE_READ_URL_CONTENT' ||
                stType === 'CORTEX_STEP_TYPE_BROWSER_SUBAGENT' ||
                stType.startsWith('CORTEX_STEP_TYPE_BROWSER_')
            ) {
                const args = parseToolCallArgs(step);
                const urlOrTask =
                    step.openBrowserUrl?.url ||
                    step.readUrlContent?.url ||
                    step.browserSubagent?.task ||
                    args.Url ||
                    args.url ||
                    args.Task ||
                    humanizeToolName(stType.replace('CORTEX_STEP_TYPE_', '').toLowerCase());
                const approvalHtml = stStatus.includes('WAITING') || Boolean(step.requestedInteraction)
                    ? this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId })
                    : '';
                renderedParts.push(`
                    <div class="agy-tool-inline" data-step-index="${i}">
                        <span class="agy-tool-tag">🌐 Browser</span>
                        <span>${escapeHtml(String(urlOrTask).substring(0, 80))}</span>
                    </div>
                    ${approvalHtml}
                `);
                nodeCount += 2;
            } else if (stType.includes('SEARCH_WEB') || step.searchWeb) {
                const args = parseToolCallArgs(step);
                const q = step.searchWeb?.query || args.query || step.metadata?.toolCall?.argumentsJson || 'web';
                renderedParts.push(`
                    <div class="agy-tool-inline" data-step-index="${i}">
                        <span class="agy-tool-tag">🌐 Search</span>
                        <span>${escapeHtml(String(q).substring(0, 80))}</span>
                    </div>
                `);
                nodeCount += 2;
            } else if (stType === 'CORTEX_STEP_TYPE_CHECKPOINT' || step.checkpoint) {
                renderedParts.push(`
                    <div class="agy-tool-inline" data-step-index="${i}">
                        <span class="agy-tool-tag">📦 Compacted</span>
                        <span>Conversation context compacted</span>
                    </div>
                `);
                nodeCount += 2;
            } else if (stStatus.includes('WAITING') || step.requestedInteraction) {
                const approvalHtml = this.renderWaitingInteractionControls({ cid, step, stepIndex: i, fallbackTrajectoryId });
                if (approvalHtml) {
                    renderedParts.push(`<div data-step-index="${i}">${approvalHtml}</div>`);
                    nodeCount += 3;
                }
            }
        }

        if (isGenerating) {
            renderedParts.push(`
                <div class="agy-live-thinking-indicator" data-testid="agent-loading">
                    <span class="agy-thinking-pulse"></span>
                    <span>Antigravity Agent is working…</span>
                </div>
            `);
        }

        const reportedCtxUsed = Number(trajResp?.trajectory?.metadata?.contextWindowUsage?.usedTokens || 0);
        const reportedCtxMax = Number(trajResp?.trajectory?.metadata?.contextWindowUsage?.maxTokens || 0);
        const defaultMaxCtx = /claude|gpt/i.test(this.selectedModelLabel || '') ? 200000 : 1048576;
        const maxTokens = reportedCtxMax > 0 ? reportedCtxMax : defaultMaxCtx;
        const usedTokens = Math.max(reportedCtxUsed, latestInputTokens + latestCacheReadTokens);
        const contextUsage = {
            usedTokens,
            maxTokens,
            usedPercent: maxTokens > 0 ? Math.min(100, Math.round((usedTokens / maxTokens) * 1000) / 10) : 0,
            inputTokens: latestInputTokens,
            cacheReadTokens: latestCacheReadTokens,
            totalOutputTokens,
            totalThinkingTokens,
            turnCount: userTurnCount
        };
        const changedFiles = Array.from(changedFilesMap.values());
        this.lastContextUsageByCascade.set(cid, contextUsage);
        this.lastChangedFilesByCascade.set(cid, changedFiles);

        const finalHtml = `<div id="cascade" class="agy-hub-stream" data-cascade-id="${escapeHtml(cid)}" ${parentCascadeId ? `data-parent-cascade-id="${escapeHtml(parentCascadeId)}"` : ''}>${renderedParts.join('\n')}</div>`;

        return {
            html: finalHtml,
            css: '',
            source: 'hub',
            cascadeId: cid,
            parentCascadeId,
            title: conversationTitle,
            isGenerating,
            contextUsage,
            changedFiles,
            activeSwarm: swarmHeadline || null,
            stats: {
                nodes: nodeCount,
                htmlSize: finalHtml.length,
                cssSize: 0
            }
        };
    }

    buildCascadeConfig() {
        const basePlanner = this.templateUserConfig?.plannerConfig
            ? JSON.parse(JSON.stringify(this.templateUserConfig.plannerConfig))
            : {
                  declarativeMixinConfig: JSON.parse(JSON.stringify(DEFAULT_DECLARATIVE_MIXIN_CONFIG)),
                  customizationDiscoveryConfig: JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZATION_DISCOVERY)),
                  supportsLatexRendering: true,
                  useAiCredits: false
              };

        if (Array.isArray(basePlanner.declarativeMixinConfig?.tools)) {
            basePlanner.declarativeMixinConfig.tools = basePlanner.declarativeMixinConfig.tools.filter(
                t => !(t?.name === 'generate_image' && t?.builtin)
            );
        }

        if (this._modeOverridesModelToFast) {
            basePlanner.planModel = 'MODEL_PLACEHOLDER_M318';
        } else {
            const currentModelObj = this.cachedModels.find(m => m.modelEnum === this.selectedModelEnum);
            const activeEnum = currentModelObj?.disabled ? null : this.selectedModelEnum;
            basePlanner.planModel = activeEnum || this._getFallbackModelEnum();
        }

        const isOrchestratorModel =
            basePlanner.planModel === 'MODEL_PLACEHOLDER_M537' ||
            basePlanner.planModel === 'MODEL_PLACEHOLDER_M668';
        const hasPlanExecModel = Boolean(basePlanner.planExecuteConfig?.executionModel);
        if (!isOrchestratorModel || !hasPlanExecModel) {
            delete basePlanner.planExecuteConfig;
            const dmc = basePlanner.declarativeMixinConfig;
            if (dmc) {
                if (Array.isArray(dmc.promptSections)) {
                    dmc.promptSections = dmc.promptSections.filter(p => p?.builtinName !== 'plan_execute_protocol');
                }
                if (Array.isArray(dmc.tools)) {
                    dmc.tools = dmc.tools.filter(
                        t => t?.name !== 'enter_plan_mode' && t?.name !== 'exit_plan_mode'
                    );
                }
                if (Array.isArray(dmc.preInvocationHooks)) {
                    dmc.preInvocationHooks = dmc.preInvocationHooks.filter(h => h?.name !== 'plan_mode_review');
                }
                if (Array.isArray(dmc.preToolHooks)) {
                    dmc.preToolHooks = dmc.preToolHooks.filter(h => h?.name !== 'plan_mode_gate');
                }
            }
        }

        let autoPolicy = 'CASCADE_COMMANDS_AUTO_EXECUTION_AUTO';
        if (this.selectedMode === 'Autonomous') {
            autoPolicy = 'CASCADE_COMMANDS_AUTO_EXECUTION_EAGER';
        } else if (this.selectedMode === 'Planning') {
            autoPolicy = 'CASCADE_COMMANDS_AUTO_EXECUTION_OFF';
        } else if (this.selectedMode === 'Agent' || this.selectedMode === 'Fast') {
            autoPolicy = 'CASCADE_COMMANDS_AUTO_EXECUTION_AUTO';
        }

        basePlanner.toolConfig = {
            ...(basePlanner.toolConfig || {}),
            runCommand: {
                autoCommandConfig: {
                    autoExecutionPolicy: autoPolicy
                }
            }
        };
        delete basePlanner.toolConfig.forceDisableToolCalling;

        const baseExecutor = this.templateUserConfig?.executorConfig
            ? JSON.parse(JSON.stringify(this.templateUserConfig.executorConfig))
            : { useCoreDirect: true };

        const baseConversationHistory = this.templateUserConfig?.conversationHistoryConfig
            ? JSON.parse(JSON.stringify(this.templateUserConfig.conversationHistoryConfig))
            : {};

        return {
            plannerConfig: basePlanner,
            executorConfig: baseExecutor,
            conversationHistoryConfig: baseConversationHistory
        };
    }

    async handleInteraction({
        cascadeId,
        trajectoryId,
        stepIndex,
        interactionCase = 'permission',
        allow = true,
        responses = null,
        cancelled = false
    }) {
        await this.discoverHub();
        if (!this.hubInfo) return { error: 'Antigravity Hub disconnected' };

        const cid = cascadeId || this.activeCascadeId;
        if (!cid || !trajectoryId || typeof stepIndex !== 'number') {
            return { error: 'cascadeId, trajectoryId, and numeric stepIndex are required' };
        }

        const interaction = {
            trajectoryId,
            stepIndex
        };

        if (interactionCase === 'askQuestion') {
            interaction.askQuestion = {
                responses: Array.isArray(responses) ? responses : [],
                cancelled: Boolean(cancelled)
            };
        } else if (interactionCase === 'filePermission') {
            interaction.filePermission = {
                allow: Boolean(allow),
                scope: 'PERMISSION_SCOPE_ONCE'
            };
        } else if (interactionCase === 'runCommand') {
            interaction.runCommand = {
                confirm: Boolean(allow)
            };
        } else if (interactionCase === 'browserAction') {
            interaction.browserAction = {
                confirm: Boolean(allow)
            };
        } else {
            interaction.permission = {
                allow: Boolean(allow),
                scope: 'PERMISSION_SCOPE_ONCE'
            };
        }

        await this.callRpc('HandleCascadeUserInteraction', {
            cascadeId: cid,
            interaction
        });

        return { success: true, cascadeId: cid, stepIndex };
    }

    async startNewConversation() {
        await this.discoverHub();
        if (!this.hubInfo) return { error: 'Antigravity Hub disconnected' };

        const cascadeId = crypto.randomUUID();
        const currentModelObj = this.cachedModels.find(m => m.modelEnum === this.selectedModelEnum);
        const activeEnum = currentModelObj?.disabled ? null : this.selectedModelEnum;
        const res = await this.callRpc('StartCascade', {
            cascadeId,
            source: 'CORTEX_TRAJECTORY_SOURCE_CASCADE_CLIENT',
            requestedModel: activeEnum || this._getFallbackModelEnum()
        });

        this.activeCascadeId = res?.cascadeId || cascadeId;
        return {
            success: true,
            cascadeId: this.activeCascadeId,
            method: 'hub_rpc_start_cascade'
        };
    }

    async _buildSlashOrWorkflowScopeItem(entry, rawQuery = '') {
        const argumentValues = {};
        if (rawQuery) {
            try {
                const sp = new URLSearchParams(rawQuery);
                for (const [k, v] of sp.entries()) {
                    argumentValues[k] = v;
                }
            } catch {}
        }

        if (entry.type === 'WORKFLOW') {
            const spec = entry.workflowSpec || {};
            return {
                item: {
                    recipe: {
                        recipeId: spec.recipeId || entry.name,
                        title: spec.title || entry.name,
                        description: entry.description || '',
                        ...(spec.systemPrompt ? { systemPrompt: spec.systemPrompt } : {}),
                        ...(spec.uri ? { uri: spec.uri } : {})
                    }
                }
            };
        }

        if (entry.type === 'MCP_PROMPT') {
            const spec = entry.mcpSpec || entry;
            const srvName = spec.serverName || '';
            const promptName = spec.name && spec.name !== entry.name ? spec.name : spec.promptName || spec.name || entry.name;
            let description = spec.description || entry.description || '';
            let messages = Array.isArray(spec.messages) ? spec.messages : [];
            if (this.hubInfo && srvName && promptName) {
                try {
                    const fetched = await this.callRpc('GetMcpPrompt', {
                        serverName: srvName,
                        name: promptName,
                        arguments: argumentValues
                    });
                    if (fetched?.description) description = fetched.description;
                    if (Array.isArray(fetched?.messages)) messages = fetched.messages;
                } catch {}
            }
            return {
                item: {
                    mcpPrompt: {
                        serverName: srvName,
                        name: promptName,
                        description,
                        ...(Array.isArray(spec.arguments) && spec.arguments.length ? { arguments: spec.arguments } : {}),
                        argumentValues,
                        ...(messages.length ? { messages } : {})
                    }
                }
            };
        }

        const baseInfo = entry.rawInfo
            ? JSON.parse(JSON.stringify(entry.rawInfo))
            : {
                  name: entry.name,
                  type: entry.type === 'SKILL' ? 'SLASH_COMMAND_TYPE_SKILL' : 'SLASH_COMMAND_TYPE_SYSTEM',
                  ...(entry.icon ? { icon: entry.icon } : {})
              };

        return {
            item: {
                slashCommand: {
                    info: baseInfo,
                    argumentValues
                }
            }
        };
    }

    async tokenizePromptText(rawStr) {
        if (!rawStr) return [];
        const chunks = [];
        const pushText = str => {
            if (!str) return;
            const prev = chunks[chunks.length - 1];
            if (prev && typeof prev.text === 'string') {
                prev.text += str;
            } else {
                chunks.push({ text: str });
            }
        };

        // Split out fenced code blocks and inline backticks so `/token` inside code is preserved verbatim
        const codeProtectRegex = /(```[\s\S]*?```|`[^`\n]+`)/g;
        let lastCodeIdx = 0;
        const segments = [];
        let cm;
        while ((cm = codeProtectRegex.exec(rawStr)) !== null) {
            if (cm.index > lastCodeIdx) {
                segments.push({ isCode: false, text: rawStr.slice(lastCodeIdx, cm.index) });
            }
            segments.push({ isCode: true, text: cm[0] });
            lastCodeIdx = cm.index + cm[0].length;
        }
        if (lastCodeIdx < rawStr.length) {
            segments.push({ isCode: false, text: rawStr.slice(lastCodeIdx) });
        }

        const slashTokenRegex = /(^|[\s(])\/([a-zA-Z0-9](?:[a-zA-Z0-9_-]|[.:](?=[a-zA-Z0-9_-]))*)(?:\?([^\s).,!?:;]+))?(?=$|[\s).,!?:;])/g;

        for (const seg of segments) {
            if (seg.isCode) {
                pushText(seg.text);
                continue;
            }

            let cursor = 0;
            slashTokenRegex.lastIndex = 0;
            let m;
            while ((m = slashTokenRegex.exec(seg.text)) !== null) {
                const leadDelimiter = m[1] || '';
                const cmdNameRaw = m[2] || '';
                const queryPart = m[3] || '';
                const lookupKey = cmdNameRaw.toLowerCase();
                const entry = this.slashRegistry.get(lookupKey);

                if (!entry || entry.clientAction) {
                    continue;
                }

                const prefixBeforeCmd = seg.text.slice(cursor, m.index) + leadDelimiter;
                if (prefixBeforeCmd) {
                    pushText(prefixBeforeCmd);
                } else if (chunks.length > 0 && chunks[chunks.length - 1].item) {
                    pushText(' ');
                }

                const scopeChunk = await this._buildSlashOrWorkflowScopeItem(entry, queryPart);
                chunks.push(scopeChunk);
                cursor = m.index + m[0].length;
            }

            if (cursor < seg.text.length) {
                pushText(seg.text.slice(cursor));
            }
        }

        return chunks;
    }

    resolveSafeMediaFilePath(rawUriOrPath, extraAllowedDirs = []) {
        if (!rawUriOrPath || typeof rawUriOrPath !== 'string') return null;
        const trimmed = rawUriOrPath.trim();
        if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
            return null;
        }
        const localPath = uriToLocalPath(trimmed);
        if (!localPath) return null;

        let realCandidate;
        try {
            if (!fs.existsSync(localPath)) return null;
            const st = fs.statSync(localPath);
            if (!st.isFile()) return null;
            realCandidate = fs.realpathSync(localPath);
        } catch {
            return null;
        }

        const allowedRoots = [
            join(os.homedir(), '.gemini'),
            join(__hubBridgeDir, 'uploads'),
            ...(Array.isArray(this.customSwarmAppDataDirs) ? this.customSwarmAppDataDirs : []),
            ...(Array.isArray(extraAllowedDirs) ? extraAllowedDirs : [])
        ];

        const isWin = process.platform === 'win32';
        const normCandidate = isWin ? realCandidate.toLowerCase() : realCandidate;

        for (const rootDir of allowedRoots) {
            if (!rootDir) continue;
            try {
                if (!fs.existsSync(rootDir)) continue;
                const realRoot = fs.realpathSync(rootDir);
                const normRoot = (isWin ? realRoot.toLowerCase() : realRoot).replace(/[\\/]+$/, '');
                if (normCandidate === normRoot || normCandidate.startsWith(normRoot + sep)) {
                    return realCandidate;
                }
            } catch {}
        }
        return null;
    }

    async _prepareHubMediaAttachment(att) {
        if (!att || typeof att !== 'object') return null;
        const rawName = String(att.fileName || att.name || 'attachment').trim();
        const fileName = basename(rawName.replace(/\\/g, '/')) || 'attachment';
        const mimeType = resolveAttachmentMimeType(
            fileName,
            att.fileType || att.type || (att.isImage ? 'image/jpeg' : '')
        );
        const displayName = sanitizeMediaDisplayName(fileName, mimeType);
        const mediaId = crypto.randomUUID();
        const isImage = mimeType.startsWith('image/');

        const safeSavedPath = att.filePath ? this.resolveSafeMediaFilePath(att.filePath) : null;

        let b64 = '';
        let hasInlinePayload = false;
        if (typeof att.dataUrl === 'string' && att.dataUrl.includes(';base64,')) {
            b64 = att.dataUrl.split(';base64,')[1] || '';
            hasInlinePayload = true;
        } else if (typeof att.content === 'string' && (att.content.length > 0 || !safeSavedPath)) {
            b64 = Buffer.from(att.content, 'utf-8').toString('base64');
            hasInlinePayload = true;
        }

        if (!safeSavedPath && !hasInlinePayload) {
            return null;
        }

        let artifactUri = '';

        // 1. Fast zero-copy path when file is already staged in uploads/ on local PC disk
        if (safeSavedPath && this.hubInfo) {
            try {
                const saved = await this.callRpc(
                    'SaveMediaAsArtifact',
                    {
                        media: {
                            mediaId,
                            mimeType,
                            description: fileName,
                            displayName,
                            uri: safeSavedPath.replace(/\\/g, '/')
                        }
                    },
                    15000
                );
                if (saved?.uri) {
                    artifactUri = saved.uri;
                }
            } catch {}
        }

        // Load bytes from disk if needed (for image inlineData preview or fallback artifact upload)
        if ((!artifactUri || isImage) && !hasInlinePayload && safeSavedPath) {
            try {
                b64 = fs.readFileSync(safeSavedPath).toString('base64');
                hasInlinePayload = true;
            } catch {}
        }

        // 2. Byte-upload fallback via SaveMediaAsArtifact
        if (!artifactUri && hasInlinePayload && this.hubInfo) {
            try {
                const saved = await this.callRpc(
                    'SaveMediaAsArtifact',
                    {
                        media: {
                            mediaId,
                            mimeType,
                            description: fileName,
                            displayName,
                            inlineData: b64
                        }
                    },
                    20000
                );
                if (saved?.uri) {
                    artifactUri = saved.uri;
                }
            } catch {}
        }

        if (isImage) {
            return {
                mediaId,
                mimeType,
                description: fileName,
                displayName,
                ...(artifactUri ? { uri: artifactUri } : safeSavedPath ? { uri: this._toFileUri(safeSavedPath) } : {}),
                ...(hasInlinePayload ? { inlineData: b64 } : {})
            };
        }

        // Non-image files (PDF, MP4/video, audio, text/code/csv/json/md, Office, ZIP, arbitrary binary):
        // Match Antigravity 2.33 `G3b.getMedia()` — send saved `uri` with empty `inlineData` once registered
        if (artifactUri) {
            return {
                mediaId,
                mimeType,
                description: fileName,
                displayName,
                uri: artifactUri,
                inlineData: ''
            };
        }

        return {
            mediaId,
            mimeType,
            description: fileName,
            displayName,
            ...(safeSavedPath ? { uri: this._toFileUri(safeSavedPath) } : {}),
            ...(hasInlinePayload ? { inlineData: b64 } : {})
        };
    }

    async _dispatchSideQuestion({ baseCascadeId, items, media = [], questionPreview = '' }) {
        const ownerCid = this.sideQuestionParentMap.get(baseCascadeId) || baseCascadeId;
        const cleanTitle =
            String(questionPreview || 'Side Question')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 64) || 'Side Question';

        let parentHasSteps = false;
        if (ownerCid) {
            try {
                const parentTraj = await this.callRpc('GetCascadeTrajectory', { cascadeId: ownerCid }, 4000);
                parentHasSteps = Array.isArray(parentTraj?.trajectory?.steps) && parentTraj.trajectory.steps.length > 0;
            } catch {}
        }

        const sideConfig = this.buildCascadeConfig();
        sideConfig.plannerConfig.toolConfig = {
            ...(sideConfig.plannerConfig.toolConfig || {}),
            forceDisableToolCalling: true
        };

        // If the current conversation is brand-new (0 steps), run directly in it rather than forking an empty trajectory
        if (!ownerCid || !parentHasSteps) {
            const targetCid = ownerCid || (await this.startNewConversation()).cascadeId;
            await this.callRpc(
                'SendUserCascadeMessage',
                {
                    cascadeId: targetCid,
                    items,
                    ...(media.length > 0 ? { media } : {}),
                    cascadeConfig: sideConfig
                },
                15000
            );
            this.activeCascadeId = targetCid;
            return {
                ok: true,
                cascadeId: targetCid,
                isSideQuestion: false,
                method: 'hub_rpc_send_message'
            };
        }

        const sideCid = crypto.randomUUID();
        await this.callRpc('StartCascade', {
            cascadeId: sideCid,
            trajectoryType: 'CORTEX_TRAJECTORY_TYPE_SIDE_QUESTION',
            source: 'CORTEX_TRAJECTORY_SOURCE_CASCADE_CLIENT',
            baseTrajectoryIdentifier: { cascadeId: ownerCid }
        });

        this.sideQuestionParentMap.set(sideCid, ownerCid);
        this.parentCascadeMap.set(sideCid, ownerCid);
        this.sideQuestionTitleMap.set(sideCid, cleanTitle);

        await this.callRpc('UpdateConversationAnnotations', {
            cascadeIds: [ownerCid],
            annotations: {
                addSideQuestionCascadeId: sideCid,
                sideQuestionTitles: { [sideCid]: cleanTitle }
            },
            mergeAnnotations: true
        }).catch(() => {});

        await this.callRpc(
            'SendUserCascadeMessage',
            {
                cascadeId: sideCid,
                items,
                ...(media.length > 0 ? { media } : {}),
                cascadeConfig: sideConfig
            },
            15000
        );

        this.activeCascadeId = sideCid;
        return {
            ok: true,
            cascadeId: sideCid,
            parentCascadeId: ownerCid,
            isSideQuestion: true,
            method: 'hub_rpc_side_question'
        };
    }

    async sendMessage({ message = '', attachments = [], quotes = [], targetCascadeId = null }) {
        await this.discoverHub();
        if (!this.hubInfo) return { ok: false, error: 'Antigravity Hub disconnected' };

        const normalizedQuotes = Array.isArray(quotes)
            ? quotes
                  .map(q => {
                      if (!q) return null;
                      if (typeof q === 'string') {
                          const c = q.trim();
                          return c ? { content: c, label: 'Quote', answer: '', fileLineRange: null } : null;
                      }
                      const c = String(q.content ?? q.text ?? '').trim();
                      const rawFileUri = q.fileUri || q.fileLineRange?.absoluteUri || '';
                      if (!c && !rawFileUri) return null;
                      let fileLineRange = null;
                      if (rawFileUri) {
                          const absUri = this._toFileUri(rawFileUri);
                          if (absUri) {
                              const rawStart = Number(q.startLine ?? q.fileLineRange?.startLine ?? 1);
                              const rawEnd = Number(q.endLine ?? q.fileLineRange?.endLine ?? rawStart);
                              const isZeroBased = Boolean(q.fileLineRange && q.startLine === undefined);
                              const sIdx = isZeroBased ? Math.max(0, rawStart) : Math.max(0, rawStart - 1);
                              const eIdx = isZeroBased ? Math.max(sIdx, rawEnd) : Math.max(sIdx, rawEnd - 1);
                              fileLineRange = {
                                  absoluteUri: absUri,
                                  startLine: sIdx,
                                  endLine: eIdx
                              };
                          }
                      }
                      let label = 'Quote';
                      if (q.label === 'code_block' || q.isCode) {
                          label = 'code_block';
                      } else if (typeof q.customLabel === 'string' && q.customLabel.trim()) {
                          label = q.customLabel.trim();
                      } else if (
                          typeof q.label === 'string' &&
                          q.label.trim() &&
                          q.label !== 'Quote'
                      ) {
                          label = q.label.trim();
                      }
                      const answer = String(q.answer ?? '').trim();
                      return { content: c, label, answer, fileLineRange };
                  })
                  .filter(Boolean)
            : [];

        let textBody = String(message || '');
        if (!textBody.trim() && normalizedQuotes.length === 0 && (!attachments || attachments.length === 0)) {
            return { ok: false, error: 'Message, quote, or attachment required' };
        }

        let cid = targetCascadeId || this.activeCascadeId;
        if (!cid) {
            const started = await this.startNewConversation();
            if (started.error) return { ok: false, error: started.error };
            cid = started.cascadeId;
        }

        // Ensure live slash commands, skills, workflows & MCP prompts are hydrated
        if (this.lastSlashFetchMs === 0) {
            await this.getSlashCommands().catch(() => {});
        }
        this._seedDefaultSlashRegistry();

        const items = [];
        const media = [];

        if (attachments && attachments.length > 0) {
            for (const att of attachments) {
                const preparedMedia = await this._prepareHubMediaAttachment(att);
                if (preparedMedia) {
                    media.push(preparedMedia);
                }
            }
        }

        const combinedAllText = [textBody, ...normalizedQuotes.map(q => q.answer)].join(' ');

        // Extract leading `/` scope items from textBody FIRST so system hooks (/compact, /boost, /swarm, /goal, /plan)
        // stay at index 0 even when response quotes are attached!
        let remainingTextBody = textBody;
        const leadingScopeItems = [];
        if (!remainingTextBody.trimStart().startsWith('`')) {
            const leadSlashRegex = /^\s*\/([a-zA-Z0-9](?:[a-zA-Z0-9_-]|[.:](?=[a-zA-Z0-9_-]))*)(?:\?([^\s).,!?:;]+))?(?=$|[\s).,!?:;])/;
            while (true) {
                const lm = leadSlashRegex.exec(remainingTextBody);
                if (!lm) break;
                const entry = this.slashRegistry.get(lm[1].toLowerCase());
                if (!entry || entry.clientAction) break;
                leadingScopeItems.push(await this._buildSlashOrWorkflowScopeItem(entry, lm[2] || ''));
                remainingTextBody = remainingTextBody.slice(lm[0].length);
            }
            if (leadingScopeItems.length > 0) {
                remainingTextBody = remainingTextBody.replace(/^[ \t]+/, '').replace(/^\r?\n/, '');
            }
        }

        // Auto-prepend /plan when in Planning mode if user didn't already include /plan or /btw or /compact
        const hasExplicitPlanOrSpecial =
            /(?:^|[\s(])\/(?:plan|btw|compact|help)(?=$|[\s).,!?:;])/i.test(combinedAllText) ||
            leadingScopeItems.some(
                it =>
                    ['plan', 'btw', 'compact', 'help'].includes(it.item?.slashCommand?.info?.name || '') ||
                    it.item?.recipe?.recipeId === 'btw'
            );
        if (
            this.selectedMode === 'Planning' &&
            (combinedAllText.trim() || normalizedQuotes.length > 0 || media.length > 0) &&
            !hasExplicitPlanOrSpecial
        ) {
            const planEntry = this.slashRegistry.get('plan') || {
                name: 'plan',
                type: 'SYSTEM',
                icon: 'map'
            };
            items.push(await this._buildSlashOrWorkflowScopeItem(planEntry, ''));
        }

        for (const leadItem of leadingScopeItems) {
            if (items.length > 0 && items[items.length - 1].item) {
                items.push({ text: ' ' });
            }
            items.push(leadItem);
        }

        // Emit native Antigravity 2.33 TextBlock quote scope items (plus optional per-quote specific answers)
        for (let qIdx = 0; qIdx < normalizedQuotes.length; qIdx++) {
            const q = normalizedQuotes[qIdx];
            if (items.length > 0 && items[items.length - 1].item) {
                items.push({ text: ' ' });
            }
            items.push({
                item: {
                    textBlock: q.fileLineRange
                        ? {
                              ...(q.content ? { content: q.content } : {}),
                              fileLineRange: q.fileLineRange
                          }
                        : {
                              content: q.content,
                              label: q.label
                          }
                }
            });
            if (q.answer) {
                const suffix = qIdx < normalizedQuotes.length - 1 || remainingTextBody.trim() ? '\n\n' : '';
                const ansChunks = await this.tokenizePromptText(`\n${q.answer}${suffix}`);
                items.push(...ansChunks);
            } else {
                items.push({ text: '\n' });
            }
        }

        if (remainingTextBody) {
            const bodyChunks = await this.tokenizePromptText(remainingTextBody);
            items.push(...bodyChunks);
        }

        // Coalesce adjacent text chunks cleanly
        const mergedItems = [];
        for (const ch of items) {
            const prev = mergedItems[mergedItems.length - 1];
            if (typeof ch.text === 'string' && prev && typeof prev.text === 'string') {
                prev.text += ch.text;
            } else {
                mergedItems.push(ch);
            }
        }

        // Detect `/btw` side-question command (non-interrupting forked trajectory, matching Antigravity 2.33 `detectBtwCommand`)
        const isBtwItem = it =>
            it?.item?.recipe?.recipeId === 'btw' ||
            it?.item?.recipe?.title === 'btw' ||
            it?.item?.slashCommand?.info?.name === 'btw';

        if (mergedItems.some(isBtwItem)) {
            const sideRawItems = mergedItems.filter(it => !isBtwItem(it));
            const sideMerged = [];
            for (const ch of sideRawItems) {
                const prev = sideMerged[sideMerged.length - 1];
                if (typeof ch.text === 'string' && prev && typeof prev.text === 'string') {
                    prev.text += ch.text;
                } else {
                    sideMerged.push(ch);
                }
            }
            if (sideMerged.length > 0 && typeof sideMerged[0].text === 'string') {
                sideMerged[0] = { text: sideMerged[0].text.replace(/^[ \t]+/, '') };
                if (!sideMerged[0].text) sideMerged.shift();
            }

            const plainSideQuestion = sideMerged
                .filter(it => typeof it.text === 'string')
                .map(it => it.text)
                .join(' ')
                .trim();

            if (!plainSideQuestion && normalizedQuotes.length === 0 && media.length === 0) {
                return { ok: false, error: 'Enter a side question after /btw' };
            }
            if (sideMerged.length === 0 || sideMerged[sideMerged.length - 1].item) {
                sideMerged.push({ text: ' ' });
            }

            return this._dispatchSideQuestion({
                baseCascadeId: cid,
                items: sideMerged,
                media,
                questionPreview: plainSideQuestion || normalizedQuotes[0]?.answer || normalizedQuotes[0]?.content || 'Side Question'
            });
        }

        const hasHelpSlash = mergedItems.some(it => it.item?.slashCommand?.info?.name === 'help');
        const hasNonEmptyTextOrQuote =
            normalizedQuotes.length > 0 ||
            mergedItems.some(it => typeof it.text === 'string' && it.text.trim().length > 0);

        if (hasHelpSlash && !hasNonEmptyTextOrQuote) {
            mergedItems.push({
                text: ' Help me self-troubleshoot an issue, configure Antigravity, or answer a question about Antigravity.'
            });
        } else if (mergedItems.length === 0 || mergedItems[mergedItems.length - 1].item) {
            mergedItems.push({ text: ' ' });
        }

        const cascadeConfig = this.buildCascadeConfig();
        if (hasHelpSlash) {
            cascadeConfig.plannerConfig.experiments = {
                ...(cascadeConfig.plannerConfig.experiments || {}),
                values: {
                    ...(cascadeConfig.plannerConfig.experiments?.values || {}),
                    'enable-help-slash-command': { boolValue: true }
                }
            };
        }

        const payload = {
            cascadeId: cid,
            items: mergedItems,
            ...(media.length > 0 ? { media } : {}),
            cascadeConfig
        };

        await this.callRpc('SendUserCascadeMessage', payload, 15000);
        this.activeCascadeId = cid;

        return {
            ok: true,
            cascadeId: cid,
            method: 'hub_rpc_send_message'
        };
    }

    async stopGeneration(targetCascadeId = null) {
        await this.discoverHub();
        if (!this.hubInfo) return { error: 'Antigravity Hub disconnected' };

        const cid = targetCascadeId || this.activeCascadeId;
        if (!cid) return { error: 'No active conversation to stop' };

        const results = await Promise.allSettled([
            this.callRpc('ForceStopCascadeTree', { cascadeId: cid }),
            this.callRpc('CancelCascadeInvocation', { cascadeId: cid })
        ]);

        const anyOk = results.some(r => r.status === 'fulfilled');
        return anyOk ? { success: true, cascadeId: cid } : { error: 'Failed to stop cascade' };
    }

    async deleteConversation(cascadeId) {
        await this.discoverHub();
        if (!this.hubInfo || !cascadeId) return { error: 'Invalid cascadeId or Hub disconnected' };
        const parentOfSideQ = this.sideQuestionParentMap.get(cascadeId) || null;
        await this.callRpc('DeleteCascadeTrajectory', { cascadeId });
        if (parentOfSideQ) {
            this.sideQuestionParentMap.delete(cascadeId);
            this.sideQuestionTitleMap.delete(cascadeId);
            this.parentCascadeMap.delete(cascadeId);
            await this.callRpc('UpdateConversationAnnotations', {
                cascadeIds: [parentOfSideQ],
                annotations: { removeSideQuestionCascadeId: cascadeId },
                mergeAnnotations: true
            }).catch(() => {});
        }
        if (this.activeCascadeId === cascadeId) {
            this.activeCascadeId = parentOfSideQ || null;
        }
        return { success: true, activeCascadeId: this.activeCascadeId };
    }

    // =========================================================================
    // Native Swarm Board + Subagent Swarm Engine (Antigravity 2.33 Parity)
    // =========================================================================

    getSwarmAppDataDirs() {
        if (Array.isArray(this.customSwarmAppDataDirs) && this.customSwarmAppDataDirs.length > 0) {
            return this.customSwarmAppDataDirs.filter(d => {
                try {
                    return fs.existsSync(join(d, 'brain'));
                } catch {
                    return false;
                }
            });
        }
        const root = join(os.homedir(), '.gemini');
        try {
            if (!fs.existsSync(root)) return [];
            const names = fs.readdirSync(root).sort();
            return names
                .map(n => join(root, n))
                .filter(dir => {
                    try {
                        return fs.existsSync(join(dir, 'brain'));
                    } catch {
                        return false;
                    }
                });
        } catch {
            return [];
        }
    }

    _isValidSwarmConvId(id) {
        return typeof id === 'string' && /^[a-zA-Z0-9_-]{4,80}$/.test(id);
    }

    _swarmDirFor(appData, convId) {
        return join(appData, 'brain', convId, '.system_generated', 'swarm');
    }

    _statSwarmFile(filePath) {
        try {
            const st = fs.statSync(filePath);
            return { mtime: st.mtimeMs, size: st.size };
        } catch {
            return { mtime: 0, size: -1 };
        }
    }

    _readSwarmFileCached(filePath, maxBytes = Infinity) {
        const s = this._statSwarmFile(filePath);
        if (s.size < 0) return { text: null, ...s };
        if (s.size > maxBytes) return { text: null, tooLarge: true, ...s };
        const key = `${s.mtime}:${s.size}`;
        const hit = this._swarmFileCache.get(filePath);
        if (hit && hit.key === key) return { text: hit.text, ...s };
        try {
            const text = fs.readFileSync(filePath, 'utf-8');
            if (this._swarmFileCache.size > 400) this._swarmFileCache.clear();
            this._swarmFileCache.set(filePath, { key, text });
            return { text, ...s };
        } catch {
            return { text: null, ...s };
        }
    }

    _parseSwarmRoster(text) {
        if (!text) return null;
        try {
            const parsed = JSON.parse(text);
            if (!parsed || typeof parsed !== 'object') return null;
            const rawMembers = parsed.members && typeof parsed.members === 'object' ? parsed.members : {};
            const members = {};
            for (const [name, m] of Object.entries(rawMembers)) {
                if (!m || typeof m !== 'object') continue;
                const phase = typeof m.phase === 'string' && m.phase ? m.phase : 'RUNNING';
                members[name] = {
                    ...m,
                    phase,
                    killed: Boolean(m.killed || m.desired_state === 'KILLED' || phase === 'KILLED'),
                    model: m.model || m.applied_model || m.desired_model || ''
                };
            }
            return {
                title: typeof parsed.title === 'string' ? parsed.title : '',
                members
            };
        } catch {
            return null;
        }
    }

    _parseSwarmBoard(text) {
        const out = [];
        for (const line of String(text || '').split('\n')) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
                const msg = JSON.parse(trimmed);
                if (msg && typeof msg === 'object') out.push(msg);
            } catch {
                // Skip torn line while writer is flushing
            }
        }
        return out;
    }

    _scanSwarmDirectories(force = false) {
        const now = Date.now();
        if (!force && now - this._swarmDirScanCache.builtAt < 2500) {
            return this._swarmDirScanCache.list;
        }
        const seen = new Set();
        const list = [];
        for (const appData of this.getSwarmAppDataDirs()) {
            const brainDir = join(appData, 'brain');
            let ids = [];
            try {
                ids = fs.readdirSync(brainDir);
            } catch {
                continue;
            }
            for (const id of ids) {
                if (!this._isValidSwarmConvId(id) || seen.has(id)) continue;
                const sDir = this._swarmDirFor(appData, id);
                const mStat = this._statSwarmFile(join(sDir, 'members.json'));
                if (mStat.size >= 0) {
                    const bStat = this._statSwarmFile(join(sDir, 'board.jsonl'));
                    seen.add(id);
                    list.push({
                        appData,
                        id,
                        mtime: Math.max(mStat.mtime || 0, bStat.mtime || 0)
                    });
                }
            }
        }
        list.sort((a, b) => b.mtime - a.mtime);
        this._swarmDirScanCache = { builtAt: now, list };
        return list;
    }

    _resolveConversationSwarm(convId, force = false) {
        if (!this._isValidSwarmConvId(convId)) {
            return { appData: null, swarmId: null, member: null };
        }

        const candidateConvs = [convId];
        const sideParent = this.sideQuestionParentMap.get(convId);
        if (sideParent && sideParent !== convId && this._isValidSwarmConvId(sideParent)) {
            candidateConvs.push(sideParent);
        }

        for (const target of candidateConvs) {
            for (const appData of this.getSwarmAppDataDirs()) {
                const mPath = join(this._swarmDirFor(appData, target), 'members.json');
                const mf = this._readSwarmFileCached(mPath);
                if (mf.text != null) {
                    const roster = this._parseSwarmRoster(mf.text);
                    const named =
                        Object.entries(roster?.members || {}).find(([, m]) => m?.conversation_id === target)?.[0] ||
                        'coordinator';
                    return { appData, swarmId: target, member: named };
                }
            }

            for (const { appData, id } of this._scanSwarmDirectories(force)) {
                const mf = this._readSwarmFileCached(join(this._swarmDirFor(appData, id), 'members.json'));
                if (mf.text == null) continue;
                const roster = this._parseSwarmRoster(mf.text);
                const found = Object.entries(roster?.members || {}).find(([, m]) => m?.conversation_id === target);
                if (found) {
                    return { appData, swarmId: id, member: found[0] };
                }
            }
        }

        return { appData: null, swarmId: null, member: null };
    }

    _roleOfSwarmMember(name, m) {
        const r = typeof m?.role === 'string' ? m.role : '';
        if (r && r !== 'worker') return r;
        const match = /^(narrator|monitor)(?:-\d+)?$/i.exec(String(name ?? ''));
        return match ? match[1].toLowerCase() : r || 'worker';
    }

    _isRoleWorker(name, m) {
        const r = this._roleOfSwarmMember(name, m);
        return Boolean(
            (r && r !== 'worker' && r !== 'coordinator') ||
                /^(?:narrator|monitor)(?:-\d+)?$/i.test(String(name ?? ''))
        );
    }

    _narratorRank(name, m) {
        if (this._roleOfSwarmMember(name, m) !== 'narrator') return -1;
        const match = /^narrator(?:-(\d+))?$/i.exec(String(name ?? '')) || /-(\d+)$/.exec(String(name ?? ''));
        return match?.[1] ? Number(match[1]) : 1;
    }

    _resolveFriendlyModelLabel(rawModel) {
        if (!rawModel) return '';
        const str = String(rawModel).trim();
        const lower = str.toLowerCase();
        const found =
            this.cachedModels.find(m => m.modelEnum === str) ||
            this.cachedModels.find(m => m.modelId && m.modelId.toLowerCase() === lower) ||
            this.cachedModels.find(m => m.label.toLowerCase() === lower) ||
            DEFAULT_ANTIGRAVITY_MODELS.find(m => m.modelEnum === str || (m.modelId && m.modelId.toLowerCase() === lower));
        if (found) return found.label;
        if (RUNTIME_MODEL_LABEL_ALIASES[str]) return RUNTIME_MODEL_LABEL_ALIASES[str];
        if (/^MODEL_PLACEHOLDER_M?\d+$/i.test(str)) return 'Antigravity Model';
        if (lower === 'gemini-flash-worker-agy') return 'Gemini 3.8 Flash (Worker)';
        return str
            .replace(/-agy$/i, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, ch => ch.toUpperCase());
    }

    _summarizeSwarmTranscript(appData, convId) {
        const NO_TR = { key: '-', summary: null };
        if (!appData || !this._isValidSwarmConvId(convId)) return NO_TR;
        const trPath = join(appData, 'brain', convId, '.system_generated', 'logs', 'transcript.jsonl');
        const s = this._statSwarmFile(trPath);
        if (s.size < 0) return NO_TR;
        const key = `${s.mtime}:${s.size}`;
        const hit = this._swarmTranscriptCache.get(trPath);
        if (hit && hit.key === key) return hit;

        let text = '';
        try {
            text = fs.readFileSync(trPath, 'utf-8');
        } catch {
            return NO_TR;
        }

        const unquote = v => {
            if (typeof v !== 'string') return v == null ? '' : String(v);
            const trimmed = v.trim();
            if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
                try {
                    return String(JSON.parse(trimmed));
                } catch {
                    return trimmed.slice(1, -1);
                }
            }
            return trimmed;
        };

        const oneLine = (str, maxLen = 96) => {
            const clean = String(str || '')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/\s+/g, ' ')
                .trim();
            return clean.length > maxLen ? `${clean.slice(0, maxLen - 1).trimEnd()}…` : clean;
        };

        const boardActivities = {
            swarm_wait: 'Waiting for posts',
            read_board: 'Reading the board',
            swarm_read_board: 'Reading the board',
            post_message: 'Posting to the board',
            swarm_post_message: 'Posting to the board'
        };

        const describeTool = tc => {
            const name = tc?.name || '';
            if (!name) return '';
            if (boardActivities[name]) return boardActivities[name];
            const args = tc.args && typeof tc.args === 'object' ? tc.args : {};
            const summary = unquote(args.toolSummary) || unquote(args.toolAction);
            if (summary) return oneLine(summary);
            const targetPath = unquote(args.Path || args.AbsolutePath || args.TargetFile);
            if (targetPath) {
                const verb = { read_file: 'Read', write_file: 'Write', edit_file: 'Edit' }[name];
                if (verb) return `${verb} ${basename(targetPath)}`;
            }
            if ((name === 'code_search' || name === 'grep_search') && (args.Query || args.query)) {
                return oneLine(`Search ${unquote(args.Query || args.query)}`);
            }
            if ((name === 'swarm' || name === 'swarm_manage') && (args.action || args.Action)) {
                return oneLine(`swarm ${unquote(args.action || args.Action)} ${unquote(args.name || args.Name || '')}`);
            }
            return name;
        };

        const thinkingHeading = thinking => {
            if (typeof thinking !== 'string') return '';
            const matches = [...thinking.matchAll(/(?:^|\n)\s*\*\*([^*\n]{3,96})\*\*\s*(?=\n|$)/g)];
            return matches.length ? oneLine(matches[matches.length - 1][1]) : '';
        };

        const lines = text.split('\n').filter(l => l.trim());
        let steps = lines.length;
        let activity = '';
        let activityKind = '';
        let last = null;

        for (let i = lines.length - 1; i >= 0; i--) {
            let step;
            try {
                step = JSON.parse(lines[i]);
            } catch {
                continue;
            }
            if (!step || typeof step !== 'object') continue;
            if (i === lines.length - 1 && Number.isFinite(step.step_index)) {
                steps = Math.max(steps, step.step_index + 1);
            }
            if (!last) {
                const rawErr =
                    typeof step.error === 'string'
                        ? step.error
                        : step.errorMessage?.error?.userErrorMessage ||
                          step.errorMessage?.error?.message ||
                          '';
                last = {
                    type: String(step.type || '').replace(/^CORTEX_STEP_TYPE_/, ''),
                    status: String(step.status || '').replace(/^CORTEX_STEP_STATUS_/, ''),
                    error: rawErr ? oneLine(rawErr, 240) : ''
                };
            }
            if (step.type === 'USER_INPUT') break;
            if (step.type !== 'PLANNER_RESPONSE') continue;
            const calls = Array.isArray(step.tool_calls) ? step.tool_calls : [];
            if (calls.some(tc => tc?.name === 'swarm_wait')) break;
            const labeled = calls.filter(tc => describeTool(tc)).pop();
            const label = labeled ? describeTool(labeled) : '';
            const heading = thinkingHeading(step.thinking);
            if (label) {
                activity = label;
                activityKind = 'tool';
            } else if (heading) {
                activity = heading;
                activityKind = 'thinking';
            } else {
                continue;
            }
            break;
        }

        const turnEnded = () => {
            const results = [];
            for (let i = lines.length - 1; i >= 0; i--) {
                let step;
                try {
                    step = JSON.parse(lines[i]);
                } catch {
                    return false;
                }
                if (!step || typeof step !== 'object') return false;
                if (step.type === 'GENERIC') {
                    results.unshift(step);
                    continue;
                }
                if (step.type !== 'PLANNER_RESPONSE') return false;
                const calls = Array.isArray(step.tool_calls) ? step.tool_calls : [];
                if (calls.length === 0) return results.length === 0;
                const waitIdx = calls.findIndex(c => c?.name === 'swarm_wait');
                return waitIdx >= 0 && results.length >= calls.length && results[waitIdx]?.status === 'DONE';
            }
            return false;
        };

        const endedOnReply = () => {
            for (let i = lines.length - 1; i >= 0; i--) {
                let step;
                try {
                    step = JSON.parse(lines[i]);
                } catch {
                    return false;
                }
                if (!step || typeof step !== 'object') return false;
                const calls = Array.isArray(step.tool_calls) ? step.tool_calls : [];
                return step.type === 'PLANNER_RESPONSE' && calls.length === 0;
            }
            return false;
        };

        const entry = {
            key,
            summary: {
                steps,
                activity,
                activityKind,
                last,
                idle: turnEnded(),
                replied: endedOnReply(),
                mtime: s.mtime
            }
        };
        if (this._swarmTranscriptCache.size > 400) this._swarmTranscriptCache.clear();
        this._swarmTranscriptCache.set(trPath, entry);
        return entry;
    }

    _swarmNamedToken(lowerText, lowerName) {
        if (!lowerName) return false;
        const NAME_RUNE = /[\p{L}\p{Nd}_-]/u;
        for (let i = lowerText.indexOf('@'); i >= 0; i = lowerText.indexOf('@', i + 1)) {
            if (i > 0) {
                const before = [...lowerText.slice(Math.max(0, i - 2), i)].pop();
                if (NAME_RUNE.test(before)) continue;
            }
            if (!lowerText.startsWith(lowerName, i + 1)) continue;
            const j = i + 1 + lowerName.length;
            if (j >= lowerText.length) return true;
            if (!NAME_RUNE.test(String.fromCodePoint(lowerText.codePointAt(j)))) return true;
        }
        return false;
    }

    _swarmNamed(lowerText, lowerName) {
        if (this._swarmNamedToken(lowerText, lowerName)) return true;
        const m = lowerName.match(/^(.+)-\d+$/);
        return m ? this._swarmNamedToken(lowerText, m[1]) : false;
    }

    _swarmMentionsOf(text, names) {
        const lower = String(text || '').toLowerCase();
        return {
            mentions: names.filter(n => this._swarmNamed(lower, String(n).toLowerCase())),
            all: this._swarmNamed(lower, 'all')
        };
    }

    _swarmChannelMentions(text) {
        const NAME_RUNE = /[\p{L}\p{Nd}_-]/u;
        const CHANNEL_NAME = /^[a-z][a-z0-9-]{0,23}$/;
        const RESERVED = new Set(['main', 'all', 'here']);
        const lower = String(text || '').toLowerCase();
        const out = [];
        for (let i = lower.indexOf('@#'); i >= 0; i = lower.indexOf('@#', i + 1)) {
            if (i > 0 && NAME_RUNE.test([...lower.slice(Math.max(0, i - 2), i)].pop())) continue;
            let j = i + 2;
            while (j < lower.length) {
                const r = String.fromCodePoint(lower.codePointAt(j));
                if (!NAME_RUNE.test(r)) break;
                j += r.length;
            }
            const name = lower.slice(i + 2, j);
            if ((name === 'main' || (CHANNEL_NAME.test(name) && !RESERVED.has(name))) && !out.includes(name)) {
                out.push(name);
            }
        }
        return out;
    }

    _swarmControlOf(msg) {
        if (!msg?.control || typeof msg.control !== 'object' || Array.isArray(msg.control)) {
            return null;
        }
        const raw = msg.control;
        if (!raw.op && typeof raw.action === 'string') {
            return { ...raw, op: raw.action };
        }
        return raw;
    }

    _swarmChannelOf(msg) {
        return typeof msg?.channel === 'string' && msg.channel ? msg.channel : 'main';
    }

    _swarmEffectiveChannels(role, set, name) {
        if (Array.isArray(set)) return set;
        if (role === 'coordinator' || role === 'narrator' || role === 'monitor') return ['*'];
        if ((!role || role === 'worker') && /^(?:narrator|monitor)(?:-\d+)?$/i.test(String(name ?? ''))) {
            return ['*'];
        }
        return [];
    }

    _swarmTouchesMember(msg, name) {
        const c = this._swarmControlOf(msg);
        return Boolean(
            c &&
                (c.op === 'create' || c.op === 'subscribe' || c.op === 'unsubscribe') &&
                Array.isArray(c.members) &&
                c.members.includes(name)
        );
    }

    _swarmHasStoredEntry(mapObj, name) {
        return Boolean(mapObj && typeof mapObj === 'object' && Object.prototype.hasOwnProperty.call(mapObj, name));
    }

    _swarmStoredSet(mapObj, name) {
        const v = mapObj && typeof mapObj === 'object' ? mapObj[name] : null;
        return Array.isArray(v) ? v : null;
    }

    _swarmApplyControlDelta(prevSet, ctrl, name) {
        if (this._swarmHasStoredEntry(ctrl?.next, name)) {
            return this._swarmStoredSet(ctrl.next, name);
        }
        const ch = typeof ctrl?.channel === 'string' ? ctrl.channel : '';
        if (!ch || ch === 'main') return prevSet;
        const base = Array.isArray(prevSet) ? [...prevSet] : [];
        if (ctrl.op === 'create' || ctrl.op === 'subscribe') {
            if (!base.includes('*') && !base.includes(ch)) base.push(ch);
            return base;
        }
        if (ctrl.op === 'unsubscribe') {
            return base.filter(x => x !== ch);
        }
        return prevSet;
    }

    _swarmCurrentChannels(name, stored, msgs) {
        const computed = this._swarmChannelsAt(name, stored, msgs);
        if (computed.length > 0) return computed[computed.length - 1];
        return Array.isArray(stored) ? stored : null;
    }

    _swarmChannelsAt(name, current, msgs) {
        let set = Array.isArray(current) ? [...current] : null;
        const first = msgs.find(m => this._swarmTouchesMember(m, name));
        if (first) {
            const firstCtrl = this._swarmControlOf(first);
            if (this._swarmHasStoredEntry(firstCtrl?.prev, name)) {
                set = this._swarmStoredSet(firstCtrl.prev, name);
            } else if (!Array.isArray(current)) {
                set = null;
            }
        }
        return msgs.map(m => {
            if (this._swarmTouchesMember(m, name)) {
                set = this._swarmApplyControlDelta(set, this._swarmControlOf(m), name);
            }
            return set;
        });
    }

    _swarmActiveChannelsAt(registry, msgs) {
        const reg = new Map((Array.isArray(registry) ? registry : []).map(c => [c.name, c]));
        if (!reg.size) return msgs.map(() => null);
        const created = new Map();
        const archived = new Map();
        for (const m of msgs) {
            const c = this._swarmControlOf(m);
            if (c?.op === 'create') created.set(c.channel, Number(m.seq) || 0);
            if (c?.op === 'archive') archived.set(c.channel, Number(m.seq) || 0);
        }
        return msgs.map(m => {
            const seq = Number(m.seq) || 0;
            return chName => {
                const ch = reg.get(chName);
                if (!ch) return false;
                if (created.has(chName) && seq < created.get(chName)) return false;
                if (ch.archived) return archived.has(chName) && seq < archived.get(chName);
                return true;
            };
        });
    }

    _swarmMentionsIn(text, name, effectiveSet, activeFn) {
        const lower = String(text || '').toLowerCase();
        if (this._swarmNamed(lower, String(name || '').toLowerCase()) || this._swarmNamed(lower, 'all')) {
            return true;
        }
        if (!activeFn) return false;
        const seesAll = effectiveSet.includes('*');
        return this._swarmChannelMentions(text).some(
            c => c !== 'main' && (seesAll || effectiveSet.includes(c)) && activeFn(c)
        );
    }

    _swarmSeesIn(name, effectiveSet, msg, activeFn) {
        const ch = this._swarmChannelOf(msg);
        if (ch === 'main' || msg?.agent === name) return true;
        if (effectiveSet.includes('*') || effectiveSet.includes(ch)) return true;
        return this._swarmMentionsIn(msg?.text, name, effectiveSet, activeFn);
    }

    _swarmMemberView(name, role, current, msgs, registry) {
        const sets = this._swarmChannelsAt(name, current, msgs);
        const activeFns = this._swarmActiveChannelsAt(registry, msgs);
        const visible = msgs.map((m, idx) =>
            this._swarmSeesIn(name, this._swarmEffectiveChannels(role, sets[idx], name), m, activeFns[idx])
        );
        return {
            visible,
            unread: msgs.map((m, idx) => visible[idx] && !this._swarmControlOf(m))
        };
    }

    _swarmVisibleUnreadCount(name, role, current, msgs, lastRead, registry) {
        const { unread } = this._swarmMemberView(name, role, current, msgs, registry);
        let n = 0;
        for (let i = 0; i < msgs.length; i++) {
            if (unread[i] && (Number(msgs[i].seq) || 0) > lastRead) n++;
        }
        return n;
    }

    _buildSwarmOverviewModel({ title, head, members, messages, viewJson, planJson }) {
        const byName = new Map(members.map(m => [m.name, m]));
        const isRole = n => {
            const m = byName.get(n);
            return Boolean(m && (m.roleWorker || m.narrator));
        };
        const leadM = members.find(m => m.role === 'coordinator');
        const leadName = leadM ? leadM.name : 'coordinator';
        const keyOf = n => (n === leadName ? 'coordinator' : n);

        const taskMsgs = messages.filter(m => !isRole(m.agent) && !m.control);
        const postsCompact = taskMsgs.map(m => ({
            seq: m.seq,
            agent: keyOf(m.agent),
            to: m.all
                ? ['*']
                : [...new Set([...(m.mentions || []), ...(m.via_channel || [])])]
                      .filter(n => n !== m.agent && !isRole(n))
                      .map(keyOf),
            text: String(m.text || '').replace(/\s+/g, ' ').trim().slice(0, 420)
        }));

        const vj = viewJson && typeof viewJson === 'object' ? viewJson : null;
        const plan = !vj && planJson && typeof planJson === 'object' ? planJson : null;
        const planTasks = plan && plan.tasks && typeof plan.tasks === 'object' ? plan.tasks : {};

        const cleanClip = (str, maxWords = 10) => {
            const cleaned = String(str || '')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/\s+/g, ' ')
                .trim();
            const words = cleaned.split(' ').filter(Boolean);
            return words.length > maxWords
                ? words.slice(0, maxWords).join(' ').replace(/[,;:.]+$/, '') + '…'
                : words.join(' ').replace(/[.:]+$/, '');
        };

        const briefOf = workerName => {
            const escName = workerName.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
            const re = new RegExp(`^@${escName}\\b`, 'i');
            const p = taskMsgs.find(m => m.agent === leadName && re.test(String(m.text || '').trim()));
            if (!p) return '';
            let s = String(p.text || '')
                .trim()
                .replace(/^@\S+[\s,:]*/, '')
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .split(/(?<=[.!?])\s|\n/)[0];
            s = s.replace(
                /^(?:you\s+(?:are|own|handle|drive|run|lead|manage)|your\s+(?:role|job|task|assignment|goal|focus)\s+is(?:\s+to)?|assignment\s*:|role\s*:|task\s*:)\s*/i,
                ''
            );
            const clipped = cleanClip(s, 10);
            return clipped ? clipped.charAt(0).toUpperCase() + clipped.slice(1) : '';
        };

        const lastPostBy = kName => {
            for (let i = postsCompact.length - 1; i >= 0; i--) {
                if (postsCompact[i].agent === kName) return postsCompact[i];
            }
            return null;
        };

        const isDonePost = lp =>
            Boolean(lp && /^(@[A-Za-z0-9_-]+[\s,:–—-]*)*(?:\*\*|\*|`|_)?\[done\]/i.test(lp.text));

        // Keep overview.attention strictly for narrator/board attention items (never duplicate systemAttention!)
        const attention = [];
        const rawVjAttention = Array.isArray(vj?.attention) ? vj.attention : [];
        for (const a of rawVjAttention) {
            if (!a || (!a.title && !a.text)) continue;
            const refs = Array.isArray(a.refs) ? a.refs : [];
            const seqRef = refs.find(r => r && r.seq);
            const memRef = refs.find(r => r && r.member && byName.has(r.member));
            const titleStr = String(a.title || a.text || '').slice(0, 160);
            const whyStr = String(a.why || a.detail || '').slice(0, 280);
            const citedSeq = Number(seqRef?.seq) || null;
            attention.push({
                id: String(a.id || `att-${attention.length + 1}`),
                kind: String(a.kind || 'fyi'),
                severity: String(a.severity || 'med'),
                title: titleStr,
                text: titleStr,
                why: whyStr,
                detail: whyStr,
                from: memRef ? memRef.member : leadName,
                seq: citedSeq || head,
                post: citedSeq
            });
        }

        const taskMembers = members.filter(m => !m.roleWorker && !m.narrator);
        const anyWorking = taskMembers.some(m => !m.killed && m.status === 'working');
        const lastOverallPost = postsCompact[postsCompact.length - 1] || null;
        const finished =
            !anyWorking &&
            attention.filter(a => a.kind !== 'fyi').length === 0 &&
            Boolean(lastOverallPost && lastOverallPost.agent === 'coordinator' && isDonePost(lastOverallPost));

        const cleanWorkstreamNote = (text, maxLen = 180) => {
            const stripped = String(text || '')
                .replace(/```[\s\S]*?```/g, ' ')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/__([^_]+)__/g, '$1')
                .replace(/(^|\s)#+\s+/g, '$1')
                .replace(/\s+/g, ' ')
                .trim();
            if (stripped.length <= maxLen) return stripped;
            const cut = stripped.slice(0, maxLen);
            const lastSpace = cut.lastIndexOf(' ');
            const boundary = lastSpace > Math.floor(maxLen * 0.55) ? cut.slice(0, lastSpace) : cut;
            return `${boundary.replace(/[\s,;:(/-]+$/, '')}…`;
        };

        let workstreams = [];
        if (Array.isArray(vj?.workstreams) && vj.workstreams.length > 0) {
            workstreams = vj.workstreams
                .filter(w => w && w.title)
                .map((w, idx) => {
                    const owners = Array.isArray(w.owners)
                        ? w.owners.filter(o => typeof o === 'string')
                        : [];
                    const rawState = String(w.state || 'active').toLowerCase();
                    const mappedState =
                        rawState === 'done'
                            ? 'done'
                            : rawState === 'blocked' || rawState === 'failed'
                              ? 'blocked'
                              : rawState === 'queued'
                                ? 'queued'
                                : 'running';
                    const liveOwner = owners
                        .map(o => byName.get(o))
                        .find(m => m && !m.killed && m.status === 'working' && m.activity);
                    return {
                        id: String(w.id || `ws-${idx + 1}`),
                        title: String(w.title).slice(0, 140),
                        note: cleanWorkstreamNote(w.note || '', 180),
                        owners,
                        state: mappedState,
                        rawState,
                        liveActivity: liveOwner?.activity || '',
                        liveKind: liveOwner?.activityKind || ''
                    };
                });
        } else {
            // Synthesize rich workstreams directly from task workers, plan.json, briefs & board posts
            for (const m of taskMembers) {
                if (m.role === 'coordinator') continue;
                const kName = keyOf(m.name);
                const lp = lastPostBy(kName);
                const taskTitle =
                    (typeof planTasks[m.name] === 'string' && planTasks[m.name].trim()) ||
                    briefOf(m.name) ||
                    `Workstream @${m.name}`;

                let rawState = 'queued';
                let blockedOn = '';
                if (finished && (lp || m.killed)) {
                    rawState = 'done';
                } else if (m.failure) {
                    rawState = 'failed';
                } else if (m.killed) {
                    if (!lp) continue;
                    rawState = 'done';
                } else if (m.status === 'working') {
                    rawState = 'active';
                } else if (isDonePost(lp)) {
                    rawState = 'done';
                } else if (
                    lp &&
                    lp.to.length > 0 &&
                    !lp.to.includes('*') &&
                    /\?|blocked|waiting on|could you|can you|need/i.test(lp.text) &&
                    !postsCompact.some(q => q.seq > lp.seq && q.agent === lp.to[0])
                ) {
                    rawState = 'blocked';
                    blockedOn = lp.to[0];
                } else if (lp) {
                    rawState = 'review';
                } else if (m.steps > 0) {
                    rawState = 'active';
                }

                const mappedState =
                    rawState === 'done'
                        ? 'done'
                        : rawState === 'blocked' || rawState === 'failed'
                          ? 'blocked'
                          : rawState === 'queued'
                            ? 'queued'
                            : 'running';

                let note = '';
                if (m.failure?.text) {
                    note = m.failure.text;
                } else if (m.status === 'working' && m.activity) {
                    note = m.activity;
                } else if (lp) {
                    note = lp.text.replace(/^(@[A-Za-z0-9_-]+[\s,:]*)+/, '').replace(/^\[done\]\s*/i, '');
                } else {
                    note = 'Assigned and starting up';
                }

                // If worker is parked & waiting on another member's answer (and does NOT already have a system failure), surface in overview.attention
                if (!vj && rawState === 'blocked' && blockedOn && !m.failure) {
                    const attTitle = `@${m.name} waiting on @${blockedOn}`;
                    const attWhy = cleanWorkstreamNote(note, 180);
                    attention.push({
                        id: `blk-${m.name}-${lp.seq}`,
                        kind: 'blocked',
                        severity: 'med',
                        title: attTitle,
                        text: attTitle,
                        why: attWhy,
                        detail: attWhy,
                        from: m.name,
                        to: blockedOn,
                        seq: lp.seq,
                        post: lp.seq
                    });
                }

                workstreams.push({
                    id: `ws-${m.name}`,
                    title: taskTitle,
                    note: cleanWorkstreamNote(note, 180),
                    owners: [m.name],
                    state: mappedState,
                    rawState,
                    blockedOn,
                    seq: lp?.seq || 0,
                    liveActivity: !m.killed && m.status === 'working' ? m.activity || '' : '',
                    liveKind: m.activityKind || ''
                });
            }
        }

        const counts = {
            total: workstreams.length,
            done: workstreams.filter(w => w.state === 'done').length,
            running: workstreams.filter(w => w.state === 'running').length,
            blocked: workstreams.filter(w => w.state === 'blocked').length,
            review: workstreams.filter(w => w.rawState === 'review').length,
            queued: workstreams.filter(w => w.state === 'queued').length
        };

        const goalObj = vj?.goal || plan?.goal || {};
        const goalTitle = String(goalObj.title || vj?.headline || title || 'Parallel Agent Swarm').trim();
        const goalLine = String(
            goalObj.line ||
                (vj?.headline && vj.headline !== goalTitle ? vj.headline : '') ||
                (finished
                    ? 'All swarm workstreams completed and verified.'
                    : counts.total > 0
                      ? `${counts.done} of ${counts.total} workstreams complete · Coordinator @${leadName}`
                      : 'Coordinator splitting work across parallel swarm agents.')
        ).trim();

        const rawThreads = Array.isArray(vj?.threads)
            ? vj.threads
            : Array.isArray(plan?.threads)
              ? plan.threads.map((t, idx) => ({
                    id: t.id || `t-${idx + 1}`,
                    title: t.title || `Thread ${idx + 1}`,
                    goal: t.goal || '',
                    workstreams: (Array.isArray(t.tasks) ? t.tasks : []).map(n => `ws-${n}`)
                }))
              : [];

        const workerPostsExist = postsCompact.some(p => p.agent !== 'coordinator');

        return {
            goal: { title: goalTitle, line: goalLine },
            phase:
                vj?.phase && typeof vj.phase === 'object'
                    ? {
                          label: String(vj.phase.label || ''),
                          index: Number(vj.phase.index) || 1,
                          total: Number(vj.phase.total) || 1
                      }
                    : null,
            counts,
            finished,
            starting: !vj && !workerPostsExist && workstreams.every(w => w.state !== 'done'),
            attention,
            workstreams,
            threads: rawThreads
        };
    }

    _buildNativeSwarmSnapshot(appData, swarmId, viewerConvId = null, viewerMember = null, liveSummaries = null) {
        const dir = this._swarmDirFor(appData, swarmId);
        const swarmMetaFile = this._readSwarmFileCached(join(dir, 'swarm.json'), 8192);
        const membersFile = this._readSwarmFileCached(join(dir, 'members.json'));
        const boardFile = this._readSwarmFileCached(join(dir, 'board.jsonl'));
        const roster = this._parseSwarmRoster(membersFile.text || '') || { title: '', members: {} };
        const msgs = this._parseSwarmBoard(boardFile.text || '');

        let swarmMeta = null;
        if (swarmMetaFile.size >= 0 && swarmMetaFile.text) {
            try {
                const parsedMeta = JSON.parse(swarmMetaFile.text);
                if (parsedMeta && typeof parsedMeta === 'object') swarmMeta = parsedMeta;
            } catch {}
        }

        const VIEW_MAX_BYTES = 64 * 1024;
        const STUCK_MS = 10 * 60 * 1000;
        const STEP_ERROR_SETTLE_MS = 60 * 1000;
        const QUOTA_RE = /RESOURCE_EXHAUSTED|quota|\b429\b|exhausted your capacity|rate.?limit/i;

        const names = Object.keys(roster.members).filter(
            n => roster.members[n] && typeof roster.members[n] === 'object'
        );
        const head = msgs.length ? Number(msgs[msgs.length - 1].seq) || msgs.length : 0;

        // Transcript summaries per member
        const transcripts = new Map(
            names.map(n => [n, this._summarizeSwarmTranscript(appData, roster.members[n].conversation_id)])
        );
        const trKeys = names.map(n => `${n}:${transcripts.get(n).key}`).join(',');

        // Pick narrator if present
        let narratorLive = null;
        let narratorDead = null;
        for (const n of names) {
            const m = roster.members[n];
            const rank = this._narratorRank(n, m);
            if (rank < 0) continue;
            if (m.killed) {
                if (!narratorDead || rank > narratorDead.rank) narratorDead = { name: n, rank };
            } else if (!narratorLive || rank > narratorLive.rank) {
                narratorLive = { name: n, rank };
            }
        }
        const narratorName = (narratorLive || narratorDead)?.name || null;

        // Read view.json & view.html (swarm dir first, fallback narrator brain/swarm_view)
        let viewDir = dir;
        let jf = this._readSwarmFileCached(join(dir, 'view.json'), VIEW_MAX_BYTES);
        const narConv = narratorName ? roster.members[narratorName]?.conversation_id : '';
        if (jf.size < 0 && this._isValidSwarmConvId(narConv)) {
            const altDir = join(appData, 'brain', narConv, 'swarm_view');
            const altJf = this._readSwarmFileCached(join(altDir, 'view.json'), VIEW_MAX_BYTES);
            if (altJf.size >= 0) {
                viewDir = altDir;
                jf = altJf;
            }
        }
        const hf = this._readSwarmFileCached(join(viewDir, 'view.html'), VIEW_MAX_BYTES);

        let viewJson = null;
        let viewError = '';
        if (jf.size >= 0) {
            const vKey = `${jf.mtime}:${jf.size}`;
            let vCached = this._swarmViewJsonCache.get(swarmId);
            if (!vCached || vCached.key !== vKey) {
                let parsedVj = null;
                let err = '';
                if (jf.tooLarge) err = 'too_large';
                else {
                    try {
                        const cand = JSON.parse(jf.text ?? '');
                        if (cand && typeof cand === 'object' && !Array.isArray(cand)) parsedVj = cand;
                        else err = 'invalid';
                    } catch {
                        err = 'invalid';
                    }
                }
                vCached = {
                    key: vKey,
                    error: err,
                    good: parsedVj ? { json: parsedVj, mtime: jf.mtime } : vCached?.good || null
                };
                this._swarmViewJsonCache.set(swarmId, vCached);
            }
            viewJson = vCached.good?.json || null;
            viewError = vCached.error || '';
        } else {
            this._swarmViewJsonCache.delete(swarmId);
        }

        // Read optional plan.json
        const pf = this._readSwarmFileCached(join(dir, 'plan.json'), VIEW_MAX_BYTES);
        let planJson = null;
        if (pf.size >= 0 && !pf.tooLarge && pf.text) {
            try {
                const candPlan = JSON.parse(pf.text);
                if (candPlan && typeof candPlan === 'object' && !Array.isArray(candPlan)) {
                    planJson = candPlan;
                }
            } catch {}
        }

        // Channels registry from control lines
        const channelsMap = new Map();
        for (const m of msgs) {
            const ctrl = this._swarmControlOf(m);
            if (!ctrl || typeof ctrl.channel !== 'string' || !ctrl.channel) continue;
            if (ctrl.op === 'create' && !channelsMap.has(ctrl.channel)) {
                channelsMap.set(ctrl.channel, {
                    name: ctrl.channel,
                    topic: typeof ctrl.topic === 'string' ? ctrl.topic : '',
                    created_by: String(m.agent ?? ''),
                    archived: false
                });
            } else if (ctrl.op === 'archive') {
                const existing = channelsMap.get(ctrl.channel) || {
                    name: ctrl.channel,
                    topic: '',
                    created_by: '',
                    archived: false
                };
                existing.archived = true;
                channelsMap.set(ctrl.channel, existing);
            }
        }
        const channels = [...channelsMap.values()];

        // Compute @#channel addressees as of each message (mirroring channels.mjs + main.mjs channelAddressees)
        let byChannelAt = null;
        if (channels.length > 0 && msgs.some(m => String(m?.text ?? '').includes('@#'))) {
            const activeFns = this._swarmActiveChannelsAt(channels, msgs);
            const memberEffectiveSets = new Map(
                names.map(n => {
                    const m = roster.members[n];
                    const storedRole = typeof m.role === 'string' ? m.role : '';
                    const curSet = this._swarmCurrentChannels(
                        n,
                        Array.isArray(m.channels) ? m.channels : null,
                        msgs
                    );
                    return [
                        n,
                        this._swarmChannelsAt(n, curSet, msgs).map(set =>
                            this._swarmEffectiveChannels(storedRole, set, n)
                        )
                    ];
                })
            );
            byChannelAt = (msgIdx, text) => {
                const chans = this._swarmChannelMentions(text).filter(
                    c => c !== 'main' && activeFns[msgIdx]?.(c)
                );
                if (!chans.length) return null;
                const addressed = names.filter(n => {
                    const eff = memberEffectiveSets.get(n)?.[msgIdx] || [];
                    return eff.includes('*') || chans.some(c => eff.includes(c));
                });
                return { channels: chans, members: addressed };
            };
        }

        const postsByAgent = new Map();
        const edgesMap = new Map();

        const messages = msgs.map((m, msgIdx) => {
            const seq = Number(m.seq) || 0;
            const agent = String(m.agent ?? '');
            const text = String(m.text ?? '');
            const time = String(m.time ?? '');
            const tsParsed = time ? Date.parse(time.replace(' ', 'T')) : NaN;
            const ts = Number.isFinite(tsParsed) ? tsParsed : null;
            const channel = this._swarmChannelOf(m);
            const control = this._swarmControlOf(m);
            if (control) {
                let sysText = text;
                if (!sysText) {
                    if (control.op === 'create') {
                        sysText = `Created channel #${control.channel}${control.topic ? ` — ${control.topic}` : ''}`;
                    } else if (control.op === 'archive') {
                        sysText = `Archived channel #${control.channel}`;
                    } else if (control.op === 'subscribe' || control.op === 'unsubscribe') {
                        const whoList = Array.isArray(control.members) ? control.members.map(x => `@${x}`).join(', ') : '';
                        sysText = `${control.op === 'subscribe' ? 'Subscribed' : 'Unsubscribed'} ${whoList} ${control.op === 'subscribe' ? 'to' : 'from'} #${control.channel}`.trim();
                    }
                }
                return {
                    seq,
                    agent,
                    text: sysText,
                    time,
                    ts,
                    mentions: [],
                    all: false,
                    ...(channel !== 'main' ? { channel } : {}),
                    control
                };
            }

            const { mentions, all } = this._swarmMentionsOf(text, names);
            const chHit = byChannelAt ? byChannelAt(msgIdx, text) : null;
            const chMentions = chHit
                ? chHit.channels
                : channels.length
                  ? this._swarmChannelMentions(text).filter(c => c !== 'main')
                  : [];
            const viaChannel = chHit
                ? chHit.members.filter(n => n !== agent && !mentions.includes(n))
                : [];
            const prevPost = postsByAgent.get(agent) || {
                posts: 0,
                lastPostSeq: 0,
                lastPostTime: '',
                lastPostTs: null
            };
            postsByAgent.set(agent, {
                posts: prevPost.posts + 1,
                lastPostSeq: seq,
                lastPostTime: time,
                lastPostTs: ts
            });

            if (!this._isRoleWorker(agent, roster.members[agent])) {
                const directSet = new Set([...mentions, ...viaChannel]);
                const targets = new Set(all ? names : mentions);
                for (const n of directSet) targets.add(n);
                targets.delete(agent);
                for (const to of targets) {
                    if (this._isRoleWorker(to, roster.members[to])) continue;
                    const eKey = `${agent}\0${to}`;
                    const edge = edgesMap.get(eKey) || { from: agent, to: to, count: 0, direct: 0, viaAll: 0 };
                    edge.count++;
                    if (directSet.has(to)) edge.direct++;
                    else edge.viaAll++;
                    edgesMap.set(eKey, edge);
                }
            }

            return {
                seq,
                agent,
                text,
                time,
                ts,
                kind: typeof m.kind === 'string' ? m.kind : '',
                mentions,
                all,
                ...(channel !== 'main' ? { channel } : {}),
                ...(chMentions.length ? { channel_mentions: chMentions } : {}),
                ...(viaChannel.length ? { via_channel: viaChannel } : {})
            };
        });

        const now = Date.now();
        const stepFailureOf = tr => {
            const last = tr?.last;
            if (!last) return null;
            const modelErr = last.type === 'ERROR_MESSAGE';
            const settledToolErr = last.status === 'ERROR' && now - (tr.mtime || 0) >= STEP_ERROR_SETTLE_MS;
            if (!modelErr && !settledToolErr) return null;
            const txt = last.error || (modelErr ? 'model error' : 'step failed');
            return { kind: QUOTA_RE.test(txt) ? 'quota' : 'error', text: txt };
        };

        const members = names.map(name => {
            const m = roster.members[name];
            const convId = m.conversation_id || '';
            const tr = transcripts.get(name)?.summary || null;
            const role = this._roleOfSwarmMember(name, m);
            const storedRole = typeof m.role === 'string' ? m.role : '';
            const lastRead = Number(m.last_read_seq) || 0;

            let unread = 0;
            let effectiveMemberChannels = null;
            if (channels.length > 0) {
                const curStored = this._swarmCurrentChannels(
                    name,
                    Array.isArray(m.channels) ? m.channels : null,
                    msgs
                );
                unread = this._swarmVisibleUnreadCount(name, storedRole, curStored, msgs, lastRead, channels);
                effectiveMemberChannels = this._swarmEffectiveChannels(storedRole, curStored, name).filter(
                    c => typeof c === 'string'
                );
            } else {
                for (let k = 0; k < msgs.length; k++) {
                    if (!this._swarmControlOf(msgs[k]) && (Number(msgs[k].seq) || 0) > lastRead) {
                        unread++;
                    }
                }
            }

            const hubStatusStr = String(liveSummaries?.[convId]?.status || '');
            const hubIsRunning = hubStatusStr.includes('RUNNING') || hubStatusStr.includes('WAITING');

            let status = 'working';
            if (m.killed) {
                status = 'killed';
            } else if (hubIsRunning) {
                status = 'working';
            } else if (liveSummaries && liveSummaries[convId] && !hubIsRunning) {
                // Hub knows this trajectory is IDLE right now
                status = 'waiting';
            } else if (typeof tr?.idle === 'boolean') {
                status = tr.idle ? 'waiting' : 'working';
            } else if (m.wake_mode === 'mentions' || m.wake_mode === 'anything') {
                status = 'waiting';
            }

            const failure = !m.killed ? stepFailureOf(tr) : null;
            const postInfo = postsByAgent.get(name) || {
                posts: 0,
                lastPostSeq: 0,
                lastPostTime: '',
                lastPostTs: null
            };
            const hubSteps = Number(liveSummaries?.[convId]?.stepCount || 0);

            return {
                name,
                conversation_id: convId,
                model: m.model || '',
                modelDisplayName: this._resolveFriendlyModelLabel(m.model || ''),
                role,
                wake_mode: m.wake_mode || '',
                workspace_mode: m.workspace_mode || 'inherit',
                status,
                wait_since: Number(m.wait_since) || 0,
                last_read_seq: lastRead,
                unread,
                killed: Boolean(m.killed),
                steps: Math.max(tr?.steps || 0, hubSteps),
                activity: tr?.activity || '',
                activityKind: tr?.activityKind || '',
                replied: Boolean(tr?.replied),
                narrator: this._narratorRank(name, m) >= 0,
                roleWorker: this._isRoleWorker(name, m),
                failure,
                transcriptMtime: tr?.mtime || 0,
                ...(effectiveMemberChannels && effectiveMemberChannels.length
                    ? { channels: effectiveMemberChannels }
                    : Array.isArray(m.channels) && m.channels.length
                      ? { channels: m.channels }
                      : {}),
                ...postInfo
            };
        });

        members.sort(
            (a, b) =>
                (a.role === 'coordinator' ? 0 : 1) - (b.role === 'coordinator' ? 0 : 1) ||
                a.name.localeCompare(b.name)
        );

        const systemAttention = [];
        for (const m of members) {
            if (m.killed || m.narrator || m.roleWorker) continue;
            if (m.failure) {
                systemAttention.push({
                    id: `sys-${m.name}-${m.failure.kind}`,
                    kind: m.failure.kind,
                    member: m.name,
                    conversation_id: m.conversation_id,
                    text: `${m.name}: last step failed (${m.failure.kind === 'quota' ? 'quota' : 'error'})`,
                    detail: m.failure.text
                });
            } else if (m.status === 'working' && m.transcriptMtime && now - m.transcriptMtime > STUCK_MS) {
                systemAttention.push({
                    id: `sys-${m.name}-stuck`,
                    kind: 'stuck',
                    member: m.name,
                    conversation_id: m.conversation_id,
                    text: `${m.name}: no progress for over 10m and not parked on board`,
                    detail: '',
                    since: m.transcriptMtime
                });
            }
        }

        const coordSummary = liveSummaries?.[swarmId] || {};
        const fallbackTitle =
            coordSummary?.annotations?.title ||
            coordSummary?.summary ||
            `Swarm ${swarmId.slice(0, 8)}`;
        const title = roster.title || fallbackTitle;

        const nm = narratorName ? members.find(m => m.name === narratorName) : null;
        const narratorState = !nm
            ? 'absent'
            : nm.killed
              ? 'killed'
              : nm.failure
                ? 'paused'
                : nm.status === 'waiting'
                  ? 'waiting'
                  : 'working';

        const overview = this._buildSwarmOverviewModel({
            title,
            head,
            members,
            messages,
            viewJson,
            planJson
        });

        const resolvedViewer = viewerMember || (viewerConvId === swarmId ? 'coordinator' : null);
        let unseen = null;
        if (resolvedViewer && channels.length > 0 && roster.members[resolvedViewer]) {
            const meRaw = roster.members[resolvedViewer];
            const meStoredRole = typeof meRaw.role === 'string' ? meRaw.role : '';
            const meCurStored = this._swarmCurrentChannels(
                resolvedViewer,
                Array.isArray(meRaw.channels) ? meRaw.channels : null,
                msgs
            );
            const { visible } = this._swarmMemberView(
                resolvedViewer,
                meStoredRole,
                meCurStored,
                msgs,
                channels
            );
            unseen = messages.filter((_, idx) => !visible[idx]).map(m => m.seq);
        }

        const liveStatusKey = members.map(m => `${m.name}:${m.status}:${m.steps}`).join(',');
        const etag = `native|${swarmId}|${resolvedViewer || ''}|${swarmMetaFile.mtime}:${swarmMetaFile.size}|${membersFile.mtime}:${membersFile.size}|${boardFile.mtime}:${boardFile.size}|${trKeys}|${jf.mtime}:${jf.size}|${hf.mtime}:${hf.size}|${pf.mtime}:${pf.size}|${liveStatusKey}`;

        const MAX_RAW_CHARS = 96000;
        const clipRaw = s => {
            const str = String(s || '');
            return str.length > MAX_RAW_CHARS ? `${str.slice(0, MAX_RAW_CHARS)}\n… (truncated for mobile)` : str;
        };

        return {
            kind: 'native_swarm',
            conversationId: viewerConvId || swarmId,
            swarm: swarmId,
            coordinatorId: swarmId,
            member: resolvedViewer,
            id: swarmId,
            title,
            ...(swarmMeta?.created_at ? { createdAt: String(swarmMeta.created_at) } : {}),
            etag,
            head,
            members,
            messages,
            ...(channels.length ? { channels } : {}),
            ...(Array.isArray(unseen) && unseen.length ? { unseen } : {}),
            edges: [...edgesMap.values()],
            narrator: nm
                ? {
                      name: nm.name,
                      conversation_id: nm.conversation_id,
                      state: narratorState,
                      reason: nm.failure?.kind || '',
                      detail: nm.failure?.text || '',
                      last_read_seq: nm.last_read_seq,
                      transcriptMtime: nm.transcriptMtime
                  }
                : null,
            narratorState,
            view: {
                exists: Boolean(jf.size >= 0 || hf.size >= 0),
                dir: viewDir,
                json: viewJson,
                jsonError: viewError
            },
            ...(planJson ? { plan: planJson } : {}),
            overview,
            systemAttention,
            raw: {
                members: clipRaw(membersFile.text || ''),
                board: clipRaw(boardFile.text || ''),
                swarm: clipRaw(swarmMetaFile.text || ''),
                view: clipRaw(jf.text || ''),
                plan: clipRaw(pf.text || ''),
                ...(hf.size >= 0 && hf.text ? { viewHtml: clipRaw(hf.text) } : {})
            }
        };
    }

    _buildSubagentTreeSwarmSnapshot(convId, liveSummaries = {}) {
        if (!convId || !liveSummaries || typeof liveSummaries !== 'object') return null;
        const entries = Object.entries(liveSummaries);
        if (entries.length === 0) return null;

        // Walk up to root conversation if convId is a child subagent
        let rootCid = convId;
        const seenWalk = new Set([rootCid]);
        while (liveSummaries[rootCid]?.trajectoryMetadata?.parentConversationId) {
            const p = liveSummaries[rootCid].trajectoryMetadata.parentConversationId;
            if (!p || !liveSummaries[p] || seenWalk.has(p)) break;
            seenWalk.add(p);
            rootCid = p;
        }

        // Collect all non-side-question subagent descendants under rootCid with resolved nestingDepth
        const workerEntries = [];
        for (const [cid, info] of entries) {
            if (cid === rootCid) continue;
            if (info?.trajectoryType === 'CORTEX_TRAJECTORY_TYPE_SIDE_QUESTION') continue;
            if (this.sideQuestionParentMap.has(cid)) continue;

            let cur = info?.trajectoryMetadata?.parentConversationId || '';
            const chain = new Set();
            let underRoot = info?.trajectoryMetadata?.rootConversationId === rootCid;
            let computedDepth = 1;
            while (cur && !chain.has(cur)) {
                if (cur === rootCid) {
                    underRoot = true;
                    break;
                }
                chain.add(cur);
                computedDepth++;
                cur = liveSummaries[cur]?.trajectoryMetadata?.parentConversationId || '';
            }
            if (underRoot) {
                const nestingDepth = Number(info?.trajectoryMetadata?.nestingDepth) || computedDepth;
                workerEntries.push([cid, info, nestingDepth]);
            }
        }

        if (workerEntries.length === 0) return null;

        // Sort topologically (parent depth first, then creation timestamp) so L1 -> L2 -> L3 edges resolve cleanly
        workerEntries.sort(
            (a, b) =>
                a[2] - b[2] ||
                String(a[1]?.createdTime || '').localeCompare(String(b[1]?.createdTime || ''))
        );

        const appDirs = this.getSwarmAppDataDirs();
        const findAppDataFor = targetCid =>
            appDirs.find(d => fs.existsSync(join(d, 'brain', targetCid))) || appDirs[0] || null;

        const rootInfo = liveSummaries[rootCid] || {};
        const rootTitle =
            rootInfo?.annotations?.title ||
            rootInfo?.summary ||
            `Boost Subagent Swarm ${rootCid.slice(0, 8)}`;

        const rootStatusStr = String(rootInfo?.status || '');
        const rootTr = this._summarizeSwarmTranscript(findAppDataFor(rootCid), rootCid).summary;

        // Pre-assign unique slugs for every worker so parentConversationId -> parentSlug resolves accurately
        const usedNames = new Set(['coordinator']);
        const cidToSlug = new Map([[rootCid, 'coordinator']]);
        const enrichedWorkers = workerEntries.map(([wCid, wInfo, depth], idx) => {
            const rawRole =
                wInfo?.trajectoryMetadata?.agentScript?.name ||
                wInfo?.trajectoryMetadata?.subagentSpec?.name ||
                wInfo?.trajectoryMetadata?.subagentSpec?.role ||
                wInfo?.trajectoryMetadata?.subagentSpec?.typeName ||
                `worker-${idx + 1}`;
            let slug =
                String(rawRole)
                    .toLowerCase()
                    .replace(/^swarm worker\s*\(([^)]+)\)$/i, '$1')
                    .replace(/[^a-z0-9_-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .slice(0, 28) || `worker-${idx + 1}`;
            if (usedNames.has(slug)) slug = `${slug}-${idx + 1}`;
            usedNames.add(slug);
            cidToSlug.set(wCid, slug);
            return { wCid, wInfo, depth, rawRole, slug };
        });

        const postsBySlug = new Map();
        const bumpPost = (slug, postSeq, timeIso) => {
            const prev = postsBySlug.get(slug) || { posts: 0, lastPostSeq: 0, lastPostTime: '', lastPostTs: null };
            postsBySlug.set(slug, {
                posts: prev.posts + 1,
                lastPostSeq: postSeq,
                lastPostTime: timeIso || prev.lastPostTime,
                lastPostTs: timeIso ? Date.parse(timeIso) : prev.lastPostTs
            });
        };

        const edgesMap = new Map();
        const bumpEdge = (fromSlug, toSlug) => {
            if (!fromSlug || !toSlug || fromSlug === toSlug) return;
            const k = `${fromSlug}\0${toSlug}`;
            const e = edgesMap.get(k) || { from: fromSlug, to: toSlug, count: 0, direct: 0, viaAll: 0 };
            e.count++;
            e.direct++;
            edgesMap.set(k, e);
        };

        const messages = [];
        const workerMembers = [];
        let seq = 0;

        enrichedWorkers.forEach(({ wCid, wInfo, depth, rawRole, slug }) => {
            const parentCid = wInfo?.trajectoryMetadata?.parentConversationId || rootCid;
            const parentSlug = cidToSlug.get(parentCid) || 'coordinator';
            const stStr = String(wInfo?.status || '');
            const isWorking = stStr.includes('RUNNING') || stStr.includes('WAITING');
            const wTr = this._summarizeSwarmTranscript(findAppDataFor(wCid), wCid).summary;
            const modelEnum = wInfo?.trajectoryMetadata?.subagentSpec?.model || '';
            const modelDisplay = this._resolveFriendlyModelLabel(modelEnum);

            seq++;
            const createdIso = wInfo?.createdTime || '';
            const depthPrefix = depth > 1 ? `[L${depth}] ` : '';
            messages.push({
                seq,
                agent: parentSlug,
                text: `@${slug} ${depthPrefix}Delegated subagent (${rawRole}) · ${wInfo?.stepCount || 0} steps`,
                time: createdIso ? new Date(createdIso).toISOString().replace('T', ' ').slice(0, 19) : '',
                ts: createdIso ? Date.parse(createdIso) : null,
                kind: 'brief',
                mentions: [slug],
                all: false
            });
            bumpPost(parentSlug, seq, createdIso);
            bumpEdge(parentSlug, slug);

            if (!isWorking && (wInfo?.stepCount || 0) > 0) {
                seq++;
                const modIso = wInfo?.lastModifiedTime || createdIso;
                messages.push({
                    seq,
                    agent: slug,
                    text: `@${parentSlug} [done] Completed subagent run (${wInfo?.stepCount || 0} steps)${wTr?.activity ? ` · Last action: ${wTr.activity}` : ''}`,
                    time: modIso ? new Date(modIso).toISOString().replace('T', ' ').slice(0, 19) : '',
                    ts: modIso ? Date.parse(modIso) : null,
                    kind: '',
                    mentions: [parentSlug],
                    all: false
                });
                bumpPost(slug, seq, modIso);
                bumpEdge(slug, parentSlug);
            }

            workerMembers.push({
                name: slug,
                conversation_id: wCid,
                parent_conversation_id: parentCid,
                nestingDepth: depth,
                model: modelEnum,
                modelDisplayName: modelDisplay,
                role: 'worker',
                wake_mode: 'mentions',
                workspace_mode: 'inherit',
                status: isWorking ? 'working' : 'waiting',
                wait_since: 0,
                last_read_seq: seq,
                unread: 0,
                killed: Boolean(wInfo?.killed),
                steps: Math.max(Number(wInfo?.stepCount || 0), wTr?.steps || 0),
                activity: wTr?.activity || '',
                activityKind: wTr?.activityKind || '',
                replied: Boolean(wTr?.replied),
                narrator: false,
                roleWorker: false,
                failure: null,
                transcriptMtime: wTr?.mtime || 0,
                ...(postsBySlug.get(slug) || {
                    posts: 0,
                    lastPostSeq: seq,
                    lastPostTime: wInfo?.lastModifiedTime || '',
                    lastPostTs: wInfo?.lastModifiedTime ? Date.parse(wInfo.lastModifiedTime) : null
                })
            });
        });

        // Update post stats for any L1 parent subagents that delegated to L2/L3 children
        workerMembers.forEach(wm => {
            const pStat = postsBySlug.get(wm.name);
            if (pStat) {
                wm.posts = pStat.posts;
                wm.lastPostSeq = pStat.lastPostSeq;
            }
        });

        const coordPostStat = postsBySlug.get('coordinator') || {
            posts: 0,
            lastPostSeq: seq,
            lastPostTime: rootInfo?.lastModifiedTime || '',
            lastPostTs: rootInfo?.lastModifiedTime ? Date.parse(rootInfo.lastModifiedTime) : null
        };

        const members = [
            {
                name: 'coordinator',
                conversation_id: rootCid,
                nestingDepth: 0,
                model: this.selectedModelLabel || '',
                modelDisplayName: this.selectedModelLabel || '',
                role: 'coordinator',
                wake_mode: 'mentions',
                workspace_mode: 'inherit',
                status: rootStatusStr.includes('RUNNING') || rootStatusStr.includes('WAITING') ? 'working' : 'waiting',
                wait_since: 0,
                last_read_seq: seq,
                unread: 0,
                killed: false,
                steps: Math.max(Number(rootInfo?.stepCount || 0), rootTr?.steps || 0),
                activity: rootTr?.activity || '',
                activityKind: rootTr?.activityKind || '',
                replied: Boolean(rootTr?.replied),
                narrator: false,
                roleWorker: false,
                failure: null,
                transcriptMtime: rootTr?.mtime || 0,
                ...coordPostStat
            },
            ...workerMembers
        ];

        const viewerMember =
            members.find(m => m.conversation_id === convId)?.name || 'coordinator';
        const overview = this._buildSwarmOverviewModel({
            title: rootTitle,
            head: seq,
            members,
            messages,
            viewJson: null,
            planJson: null
        });

        const etag = `subagent|${rootCid}|${viewerMember}|${members.map(m => `${m.name}:${m.status}:${m.steps}`).join(',')}`;

        return {
            kind: 'subagent_tree',
            conversationId: convId,
            swarm: rootCid,
            coordinatorId: rootCid,
            member: viewerMember,
            id: rootCid,
            title: rootTitle,
            etag,
            head: seq,
            members,
            messages,
            edges: [...edgesMap.values()],
            narrator: null,
            narratorState: 'absent',
            view: { exists: false, dir: '', json: null, jsonError: '' },
            overview,
            systemAttention: [],
            raw: {
                members: JSON.stringify(
                    {
                        title: rootTitle,
                        kind: 'subagent_tree',
                        members: Object.fromEntries(members.map(m => [m.name, m]))
                    },
                    null,
                    2
                ),
                board: messages.map(m => JSON.stringify(m)).join('\n'),
                swarm: '',
                view: '',
                plan: ''
            }
        };
    }

    getQuickSwarmHeadline(convId = null, liveSummaries = null) {
        const cid = convId || this.activeCascadeId;
        if (!cid) return null;

        const resolved = this._resolveConversationSwarm(cid, false);
        if (resolved.swarmId && resolved.appData) {
            const snap = this._buildNativeSwarmSnapshot(
                resolved.appData,
                resolved.swarmId,
                cid,
                resolved.member,
                liveSummaries
            );
            const taskPeople = snap.members.filter(m => !m.roleWorker && !m.narrator);
            return {
                hasSwarm: true,
                kind: 'native_swarm',
                swarmId: snap.id,
                coordinatorId: snap.coordinatorId,
                member: snap.member,
                title: snap.title,
                head: snap.head,
                workingCount: taskPeople.filter(m => !m.killed && m.status === 'working').length,
                waitingCount: taskPeople.filter(m => !m.killed && m.status === 'waiting').length,
                killedCount: taskPeople.filter(m => !m.killed ? false : true).length,
                totalMembers: taskPeople.filter(m => !m.killed).length,
                alertCount: (snap.systemAttention?.length || 0) + (snap.overview?.attention?.length || 0),
                etag: snap.etag
            };
        }

        if (liveSummaries) {
            const subSnap = this._buildSubagentTreeSwarmSnapshot(cid, liveSummaries);
            if (subSnap) {
                return {
                    hasSwarm: true,
                    kind: 'subagent_tree',
                    swarmId: subSnap.id,
                    coordinatorId: subSnap.coordinatorId,
                    member: subSnap.member,
                    title: subSnap.title,
                    head: subSnap.head,
                    workingCount: subSnap.members.filter(m => !m.killed && m.status === 'working').length,
                    waitingCount: subSnap.members.filter(m => !m.killed && m.status === 'waiting').length,
                    killedCount: subSnap.members.filter(m => m.killed).length,
                    totalMembers: subSnap.members.filter(m => !m.killed).length,
                    alertCount: (subSnap.overview?.attention?.length || 0),
                    etag: subSnap.etag
                };
            }
        }

        return null;
    }

    listSwarms(activeConvId = null, liveSummaries = null) {
        const cid = activeConvId || this.activeCascadeId || null;
        const resolvedActive = cid ? this._resolveConversationSwarm(cid, false) : { swarmId: null };
        const dirs = this._scanSwarmDirectories(true);

        const swarms = dirs.slice(0, 20).map(({ appData, id, mtime }) => {
            const sDir = this._swarmDirFor(appData, id);
            const mf = this._readSwarmFileCached(join(sDir, 'members.json'));
            const bf = this._readSwarmFileCached(join(sDir, 'board.jsonl'));
            const roster = this._parseSwarmRoster(mf.text || '') || { title: '', members: {} };
            const msgs = this._parseSwarmBoard(bf.text || '');
            const head = msgs.length ? Number(msgs[msgs.length - 1].seq) || msgs.length : 0;

            let workingCount = 0;
            let waitingCount = 0;
            let killedCount = 0;
            let memberCount = 0;

            for (const [name, m] of Object.entries(roster.members)) {
                if (!m || typeof m !== 'object') continue;
                if (this._isRoleWorker(name, m)) continue;
                if (m.killed) {
                    killedCount++;
                    continue;
                }
                memberCount++;
                const conv = m.conversation_id || '';
                const hubSt = String(liveSummaries?.[conv]?.status || '');
                const tr = this._summarizeSwarmTranscript(appData, conv).summary;
                const isWork =
                    hubSt.includes('RUNNING') ||
                    hubSt.includes('WAITING') ||
                    (!liveSummaries?.[conv] && (typeof tr?.idle === 'boolean' ? !tr.idle : m.wake_mode === 'working'));
                if (isWork) workingCount++;
                else waitingCount++;
            }

            const coordSummary = liveSummaries?.[id] || {};
            const title =
                roster.title ||
                coordSummary?.annotations?.title ||
                coordSummary?.summary ||
                `Swarm ${id.slice(0, 8)}`;

            return {
                swarmId: id,
                coordinatorId: id,
                title,
                kind: 'native_swarm',
                memberCount,
                workingCount,
                waitingCount,
                killedCount,
                postCount: head,
                updatedAt: mtime ? new Date(mtime).toISOString() : '',
                isCurrentConversation: resolvedActive.swarmId === id
            };
        });

        return {
            success: true,
            activeConversationId: cid,
            activeSwarmId: resolvedActive.swarmId || null,
            swarms
        };
    }

    async getSwarmSnapshot({ conversationId = null, swarmId = null, etag = null } = {}) {
        const hub = await this.discoverHub().catch(() => null);
        let liveSummaries = null;
        if (hub || this.hubInfo) {
            try {
                const allTrajs = await this.callRpc('GetAllCascadeTrajectories', {}, 3500);
                liveSummaries = allTrajs?.trajectorySummaries || null;
            } catch {}
        }

        const cid = conversationId || (await this.ensureActiveConversationSelected()) || null;
        const catalog = this.listSwarms(cid, liveSummaries);

        // 1. Explicit swarmId override (e.g. user selected an existing swarm from the Swarm Picker or sidecar:// link)
        if (swarmId !== null && swarmId !== undefined && String(swarmId).trim() !== '') {
            const trimmedSwarmId = String(swarmId).trim();
            if (!this._isValidSwarmConvId(trimmedSwarmId)) {
                return {
                    success: true,
                    conversationId: cid,
                    swarm: null,
                    member: null,
                    notFoundSwarmId: trimmedSwarmId,
                    availableSwarms: catalog.swarms
                };
            }
            const explicitHit =
                this._scanSwarmDirectories(false).find(d => d.id === trimmedSwarmId) ||
                this._scanSwarmDirectories(true).find(d => d.id === trimmedSwarmId);
            if (explicitHit) {
                const mf = this._readSwarmFileCached(
                    join(this._swarmDirFor(explicitHit.appData, trimmedSwarmId), 'members.json')
                );
                const roster = this._parseSwarmRoster(mf.text || '');
                const viewerMember =
                    (cid &&
                        Object.entries(roster?.members || {}).find(([, m]) => m?.conversation_id === cid)?.[0]) ||
                    'coordinator';
                const snap = this._buildNativeSwarmSnapshot(
                    explicitHit.appData,
                    trimmedSwarmId,
                    cid || trimmedSwarmId,
                    viewerMember,
                    liveSummaries
                );
                if (etag && etag === snap.etag) {
                    return {
                        success: true,
                        unchanged: true,
                        conversationId: cid,
                        swarm: snap.swarm,
                        member: snap.member,
                        etag: snap.etag,
                        availableSwarms: catalog.swarms
                    };
                }
                return {
                    success: true,
                    ...snap,
                    availableSwarms: catalog.swarms
                };
            }
            if (liveSummaries) {
                const subExplicit = this._buildSubagentTreeSwarmSnapshot(trimmedSwarmId, liveSummaries);
                if (subExplicit) {
                    if (etag && etag === subExplicit.etag) {
                        return {
                            success: true,
                            unchanged: true,
                            conversationId: cid,
                            swarm: subExplicit.swarm,
                            member: subExplicit.member,
                            etag: subExplicit.etag,
                            availableSwarms: catalog.swarms
                        };
                    }
                    return {
                        success: true,
                        ...subExplicit,
                        availableSwarms: catalog.swarms
                    };
                }
            }
            return {
                success: true,
                conversationId: cid,
                swarm: null,
                member: null,
                notFoundSwarmId: trimmedSwarmId,
                availableSwarms: catalog.swarms
            };
        }

        // 2. Active conversation's own swarm (coordinator or worker)
        if (cid) {
            const resolved = this._resolveConversationSwarm(cid, false);
            if (resolved.swarmId && resolved.appData) {
                const snap = this._buildNativeSwarmSnapshot(
                    resolved.appData,
                    resolved.swarmId,
                    cid,
                    resolved.member,
                    liveSummaries
                );
                if (etag && etag === snap.etag) {
                    return {
                        success: true,
                        unchanged: true,
                        conversationId: cid,
                        swarm: snap.swarm,
                        member: snap.member,
                        etag: snap.etag,
                        availableSwarms: catalog.swarms
                    };
                }
                return {
                    success: true,
                    ...snap,
                    availableSwarms: catalog.swarms
                };
            }

            // 3. Fallback: Boost / invoke_subagent hierarchy in active conversation
            if (liveSummaries) {
                const subSnap = this._buildSubagentTreeSwarmSnapshot(cid, liveSummaries);
                if (subSnap) {
                    if (etag && etag === subSnap.etag) {
                        return {
                            success: true,
                            unchanged: true,
                            conversationId: cid,
                            swarm: subSnap.swarm,
                            member: subSnap.member,
                            etag: subSnap.etag,
                            availableSwarms: catalog.swarms
                        };
                    }
                    return {
                        success: true,
                        ...subSnap,
                        availableSwarms: catalog.swarms
                    };
                }
            }
        }

        // 4. Empty state: active conversation is not in a swarm yet
        return {
            success: true,
            conversationId: cid,
            swarm: null,
            member: null,
            availableSwarms: catalog.swarms
        };
    }

    getAppState() {
        const groups = this.cachedQuotaSummary?.groups
            ? this._normalizeQuotaGroups(this.cachedQuotaSummary.groups)
            : null;
        const quotaHeadline = groups ? this._computeQuotaHeadline(groups) : null;
        const contextUsage =
            (this.activeCascadeId && this.lastContextUsageByCascade.get(this.activeCascadeId)) || null;
        const activeSwarm = this.activeCascadeId ? this.getQuickSwarmHeadline(this.activeCascadeId) : null;
        return {
            mode: this.selectedMode,
            model: this.selectedModelLabel,
            modelEnum: this.selectedModelEnum,
            targetApp: this.targetApp,
            hubConnected: !!this.hubInfo,
            lsVersion: this.hubInfo?.lsVersion || null,
            activeCascadeId: this.activeCascadeId,
            user: this.userProfile,
            quotaHeadline,
            contextUsage,
            activeSwarm
        };
    }
}
