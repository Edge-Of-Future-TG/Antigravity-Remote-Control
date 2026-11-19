// =========================================================================
// Antigravity Remote Control v6.0 — Antigravity 2.33 Agentic Hub Client
// Supports Live Hub ConnectRPC, Subagent Swarm Inspection, Interactive
// Approvals/Questions, Slash Command Autocomplete, CDP & Android Bridge
// =========================================================================

const chatContainer = document.getElementById('chatContainer');
const chatContent = document.getElementById('chatContent');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const scrollToBottomBtn = document.getElementById('scrollToBottom');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const statsText = document.getElementById('statsText');
const headerTitle = document.getElementById('headerTitle');
const refreshBtn = document.getElementById('refreshBtn');
const stopBtn = document.getElementById('stopBtn');
const newChatBtn = document.getElementById('newChatBtn');
const historyBtn = document.getElementById('historyBtn');
const sidebarRunningDot = document.getElementById('sidebarRunningDot');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const modeBtn = document.getElementById('modeBtn');
const modelBtn = document.getElementById('modelBtn');
const slashBtn = document.getElementById('slashBtn');
const slashCountPill = document.getElementById('slashCountPill');
const modalOverlay = document.getElementById('modalOverlay');
const modalList = document.getElementById('modalList');
const modalTitle = document.getElementById('modalTitle');
const modeText = document.getElementById('modeText');
const modelText = document.getElementById('modelText');
const slashMenuPopup = document.getElementById('slashMenuPopup');

const quotePreviewBar = document.getElementById('quotePreviewBar');
const selectionQuotePill = document.getElementById('selectionQuotePill');
const selectionQuoteBtn = document.getElementById('selectionQuoteBtn');
const selectionBtwBtn = document.getElementById('selectionBtwBtn');
const selectionDismissBtn = document.getElementById('selectionDismissBtn');
const composerSelectionBanner = document.getElementById('composerSelectionBanner');
const composerSelectionPreview = document.getElementById('composerSelectionPreview');
const composerSelectionQuoteBtn = document.getElementById('composerSelectionQuoteBtn');
const composerSelectionBtwBtn = document.getElementById('composerSelectionBtwBtn');

const quotePartsOverlay = document.getElementById('quotePartsOverlay');
const quotePartsList = document.getElementById('quotePartsList');
const closeQuotePartsBtn = document.getElementById('closeQuotePartsBtn');
const quotePartsInsertBtn = document.getElementById('quotePartsInsertBtn');
const quotePartsSendBtn = document.getElementById('quotePartsSendBtn');

const historyLayer = document.getElementById('historyLayer');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const historyList = document.getElementById('historyList');
const sidebarHubMeta = document.getElementById('sidebarHubMeta');
const apkDownloadBtn = document.getElementById('apkDownloadBtn');
const apkDownloadLabel = document.getElementById('apkDownloadLabel');
const switchServerBtn = document.getElementById('switchServerBtn');

const brandBtn = document.getElementById('brandBtn');
const offlinePreviewBanner = document.getElementById('offlinePreviewBanner');
const connectPcFromOfflineBtn = document.getElementById('connectPcFromOfflineBtn');
const sslBanner = document.getElementById('sslBanner');
const enableHttpsBtn = document.getElementById('enableHttpsBtn');
const dismissSslBtn = document.querySelector('.dismiss-btn');
const closeModalBtn = document.getElementById('closeModalBtn');
const supportBtn = document.getElementById('supportBtn');
const supportOverlay = document.getElementById('supportOverlay');
const closeSupportBtn = document.getElementById('closeSupportBtn');

// Surface Switcher, Swarm UI, Weekly Quota & Antigravity IDE Refs
const switchNormalBtn = document.getElementById('switchNormalBtn');
const switchSwarmBtn = document.getElementById('switchSwarmBtn');
const swarmNavBadge = document.getElementById('swarmNavBadge');
const switchIdeBtn = document.getElementById('switchIdeBtn');
const ideChangedBadge = document.getElementById('ideChangedBadge');
const ideContainer = document.getElementById('ideContainer');
const ideBodyScroll = document.getElementById('ideBodyScroll');
const ideWorkspaceSelect = document.getElementById('ideWorkspaceSelect');
const ideRefreshBtn = document.getElementById('ideRefreshBtn');
const ideTargetHubBtn = document.getElementById('ideTargetHubBtn');
const ideTargetIdeBtn = document.getElementById('ideTargetIdeBtn');
const ideTargetStatusSub = document.getElementById('ideTargetStatusSub');
const openDesktopIdeBtn = document.getElementById('openDesktopIdeBtn');
const ideGitCountPill = document.getElementById('ideGitCountPill');

const swarmContainer = document.getElementById('swarmContainer');
const swarmBodyScroll = document.getElementById('swarmBodyScroll');
const swarmTitleText = document.getElementById('swarmTitleText');
const swarmLivePill = document.getElementById('swarmLivePill');
const swarmLiveDot = document.getElementById('swarmLiveDot');
const swarmLiveLabel = document.getElementById('swarmLiveLabel');
const swarmMetaLine = document.getElementById('swarmMetaLine');
const swarmSelectorSelect = document.getElementById('swarmSelectorSelect');
const swarmOpenCoordBtn = document.getElementById('swarmOpenCoordBtn');
const swarmRefreshBtn = document.getElementById('swarmRefreshBtn');
const swarmOverviewAlertPill = document.getElementById('swarmOverviewAlertPill');
const swarmBoardCountPill = document.getElementById('swarmBoardCountPill');
const swarmMembersCountPill = document.getElementById('swarmMembersCountPill');
const swarmCoordDock = document.getElementById('swarmCoordDock');
const swarmCoordInput = document.getElementById('swarmCoordInput');
const swarmCoordSendBtn = document.getElementById('swarmCoordSendBtn');
const sidebarSwitchSwarmBtn = document.getElementById('sidebarSwitchSwarmBtn');
const sidebarSwitchSwarmLabel = document.getElementById('sidebarSwitchSwarmLabel');

const quotaPillBtn = document.getElementById('quotaPillBtn');
const quotaRingCircle = document.getElementById('quotaRingCircle');
const quotaPillText = document.getElementById('quotaPillText');
const sidebarPlanBadge = document.getElementById('sidebarPlanBadge');
const sidebarWeeklyPct = document.getElementById('sidebarWeeklyPct');
const sidebarWeeklyBar = document.getElementById('sidebarWeeklyBar');
const sidebarOpenQuotaBtn = document.getElementById('sidebarOpenQuotaBtn');
const sidebarSwitchIdeBtn = document.getElementById('sidebarSwitchIdeBtn');
const sidebarSwitchIdeLabel = document.getElementById('sidebarSwitchIdeLabel');
const exportChatBtn = document.getElementById('exportChatBtn');

const chatFindToggleBtn = document.getElementById('chatFindToggleBtn');
const chatFindBar = document.getElementById('chatFindBar');
const chatFindInput = document.getElementById('chatFindInput');
const chatFindCount = document.getElementById('chatFindCount');
const chatFindPrevBtn = document.getElementById('chatFindPrevBtn');
const chatFindNextBtn = document.getElementById('chatFindNextBtn');
const chatFindCloseBtn = document.getElementById('chatFindCloseBtn');

const quickActionsStrip = document.querySelector('.quick-actions');
const composerDock = document.querySelector('.composer-dock');

// --- Runtime State ---
const IS_OFFLINE_PREVIEW = window.location.protocol === 'file:' || !window.location.host;

let autoRefreshEnabled = true;
let userIsScrolling = false;
let userScrollLockUntil = 0;
const USER_SCROLL_LOCK_DURATION = 3000;

let ws = null;
let lastHash = '';
let currentMode = 'Agent';
let currentModel = 'Gemini 4 Neon (High)';
let activeCascadeId = null;
let currentParentCascadeId = null;
let pendingSnapshotData = null;

let currentSurface = 'antigravity'; // 'antigravity' | 'swarm' | 'ide'
let currentBackendTarget = 'antigravity'; // 'antigravity' | 'ide'
let cachedQuotaData = null;
let cachedSessionChangedFiles = [];
let activeContextUsage = null;

let currentSwarmSubtab = 'overview'; // 'overview' | 'feed' | 'members' | 'graph' | 'raw'
let selectedSwarmIdOverride = '';
let cachedSwarmSnapshot = null;
let cachedSwarmEtag = '';
let cachedActiveSwarmHeadline = null;
let swarmOverviewOwnerFilter = '';
let swarmBoardSearch = '';
let swarmBoardPosterFilter = '';
let swarmBoardRecipientFilter = '';
let swarmBoardChannelFilter = 'all';
let swarmBoardFilterPanelOpen = false;
let swarmBoardFollow = true;
let swarmBoardExpandedSeqs = new Set();
let swarmMembersSearch = '';
let swarmShowRetiredMembers = false;
let swarmGraphReplaySeq = null;
let swarmGraphPlaying = false;
let swarmGraphPlayTimer = null;
let swarmGraphSpeedMs = 900;
let swarmGraphHideInactive = false;
let swarmGraphExpandAll = false;
let swarmRawSelectedFile = 'members';
let swarmFetchReqSeq = 0;
let swarmRefreshTimer = null;
let isRenderingSwarmBoard = false;

let currentIdeSubtab = 'explorer'; // 'explorer' | 'code' | 'git' | 'changed'
let currentIdeDir = '';
let currentIdeSearch = '';
let currentIdeFile = null; // { path, absoluteUri, fileName, language, lineCount, sizeBytes, content, isBinary }
let ideEditingFile = false;
let ideSelectionStartLine = null;
let ideSelectionEndLine = null;
let cachedIdeStatus = null;
let cachedIdeGit = null;

let chatFindMatches = [];
let chatFindActiveIdx = 0;

// --- Default Antigravity 2.33 Models Catalog ---
const DEFAULT_MODEL_DETAILS = [
    {
        label: 'Gemini 4 Neon (High)',
        family: 'Gemini 4 Neon',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Neon (XHigh)',
        family: 'Gemini 4 Neon',
        effort: 'XHigh',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Neon (Medium)',
        family: 'Gemini 4 Neon',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Neon (Low)',
        family: 'Gemini 4 Neon',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: 'For most deep reasoning and complex problems',
        supportsImages: true
    },
    {
        label: 'Orchestrator (Neon)',
        family: 'Orchestrator',
        effort: 'Neon',
        tagTitle: 'New',
        tagDescription: 'Neon that may offload routine steps to Hydrogen. Same Neon-level quality, fewer tokens used.',
        supportsImages: true
    },
    {
        label: 'Orchestrator (Argon)',
        family: 'Orchestrator',
        effort: 'Argon',
        tagTitle: 'New',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Argon (High)',
        family: 'Gemini 4 Argon',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: 'The original Gemini 4 model for advanced workflows',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Argon (Medium)',
        family: 'Gemini 4 Argon',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: 'The original Gemini 4 model for advanced workflows',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Argon (Low)',
        family: 'Gemini 4 Argon',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: 'The original Gemini 4 model for advanced workflows',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (XHigh)',
        family: 'Gemini 4 Hydrogen',
        effort: 'XHigh',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (High)',
        family: 'Gemini 4 Hydrogen',
        effort: 'High',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (Medium)',
        family: 'Gemini 4 Hydrogen',
        effort: 'Medium',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        supportsImages: true
    },
    {
        label: 'Gemini 4 Hydrogen (Low)',
        family: 'Gemini 4 Hydrogen',
        effort: 'Low',
        tagTitle: 'New',
        tagDescription: 'For speed and efficiency in execution tasks',
        supportsImages: true
    },
    { label: 'Gemini 3.8 Flash (High)', family: 'Gemini 3.8 Flash', effort: 'High', tagTitle: 'Fast', supportsImages: true },
    { label: 'Gemini 3.8 Flash (Medium)', family: 'Gemini 3.8 Flash', effort: 'Medium', tagTitle: 'Fast', supportsImages: true },
    { label: 'Gemini 3.8 Flash (Low)', family: 'Gemini 3.8 Flash', effort: 'Low', tagTitle: 'Fast', supportsImages: true },
    { label: 'Claude Opus 5.5 (Low)', family: 'Claude Opus 5.5', effort: 'Low', tagTitle: 'New', supportsImages: true },
    { label: 'Claude Opus 5.5 (Medium)', family: 'Claude Opus 5.5', effort: 'Medium', tagTitle: 'New', supportsImages: true },
    { label: 'Claude Opus 5.5 (High)', family: 'Claude Opus 5.5', effort: 'High', tagTitle: 'New', supportsImages: true },
    { label: 'Claude Sonnet 5.5 (Low)', family: 'Claude Sonnet 5.5', effort: 'Low', tagTitle: 'New', supportsImages: true },
    { label: 'Claude Sonnet 5.5 (Medium)', family: 'Claude Sonnet 5.5', effort: 'Medium', tagTitle: 'New', supportsImages: true },
    { label: 'Claude Sonnet 5.5 (High)', family: 'Claude Sonnet 5.5', effort: 'High', tagTitle: 'New', supportsImages: true },
    { label: 'Claude Sonnet 4.6 (Thinking)', family: 'Claude 4.6', effort: 'Sonnet 4.6', tagTitle: 'Notice', supportsImages: true },
    { label: 'Claude Opus 4.6 (Thinking)', family: 'Claude 4.6', effort: 'Opus 4.6', tagTitle: 'Notice', supportsImages: true },
    {
        label: 'GPT-OSS 120B (Medium)',
        family: 'GPT-OSS 120B',
        effort: 'Medium',
        tagTitle: 'Notice',
        tagDescription: 'GPT-OSS will be removed from Antigravity on November 30, 2026.',
        supportsImages: false
    },
    {
        label: 'Gemini 4 Carbon',
        family: 'Gemini 4 Carbon',
        effort: 'Unavailable',
        tagTitle: 'Unavailable',
        tagDescription: 'Gemini 4 Carbon is currently available to Ultra plan subscribers.',
        disabled: true,
        supportsImages: true
    }
];

let cachedModelDetails = [...DEFAULT_MODEL_DETAILS];

const DEFAULT_SLASH_COMMANDS = [
    { name: 'boost', type: 'SYSTEM', category: 'System', description: 'Invoke the Boost multi-agent orchestrator (DeepCoder / DeepInvestigator)' },
    { name: 'swarm', type: 'SKILL', category: 'Skill', description: 'Coordinate multi-agent parallel swarm workflows' },
    { name: 'btw', type: 'WORKFLOW', category: 'System', description: 'Ask a quick side question without interrupting the main conversation' },
    { name: 'plan', type: 'SYSTEM', category: 'System', description: 'Draft an architectural implementation plan before coding' },
    { name: 'goal', type: 'SYSTEM', category: 'System', description: 'Run autonomously until the specified goal is completely finished' },
    { name: 'compact', type: 'SYSTEM', category: 'System', description: 'Compact conversation history now to free up the context window' },
    { name: 'teamwork', type: 'SYSTEM', category: 'System', description: 'Invoke a team of specialized agents for large projects' },
    { name: 'grill-me', type: 'SYSTEM', category: 'System', description: 'Interview me interactively to align on requirements and plan' },
    { name: 'browser', type: 'SYSTEM', category: 'System', description: 'Invoke a browser subagent for web inspection and automation' },
    { name: 'learn', type: 'SYSTEM', category: 'System', description: 'Reflect on recent work to capture reusable knowledge and patterns' },
    { name: 'schedule', type: 'SYSTEM', category: 'System', description: 'Run an instruction on a recurring schedule or one-time timer' },
    { name: 'help', type: 'SYSTEM', category: 'System', description: 'Troubleshoot issues, configure Antigravity, or get guided help' },
    { name: 'new', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Start a new conversation (or /new <prompt> to start & send)' },
    { name: 'stop', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Stop active agent or subagent swarm execution' },
    { name: 'quota', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Open live Weekly & 5-Hour Model Quota and Context Window breakdown' },
    { name: 'swarm-ui', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Open the Antigravity 2.33 Swarm UI (Overview, Shared Board, Members & Graph)' },
    { name: 'ide', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Switch between Normal Antigravity and Antigravity IDE workspace (/ide or /ide <file>)' },
    { name: 'model', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Switch model (/model <name> or open grouped model selector)' },
    { name: 'mode', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Switch execution mode (/mode Agent | Autonomous | Planning | Fast)' },
    { name: 'fast', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Switch to Fast mode (/fast or /fast <prompt>)' },
    { name: 'find', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Search and highlight messages inside the active conversation' },
    { name: 'export', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Export or copy the active conversation as clean Markdown' },
    { name: 'prompts', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Recall and reuse your recent sent prompts' },
    { name: 'theme', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Toggle Dark Obsidian / Light UI theme' },
    { name: 'clear', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Clear current composer draft, quotes, and attachments' },
    { name: 'history', type: 'CONTROL', category: 'Control', clientAction: true, description: 'Open Hub Conversations & Swarm drawer' }
];

let cachedSlashCommands = [...DEFAULT_SLASH_COMMANDS];
let activeSlashMenuIndex = 0;
let slashMenuKeyboardNavigated = false;

let pendingQuotes = [];
let activeSelectedQuote = null;
let quotePartsContext = { blocks: [], sourceLabel: 'Response' };

const AGENT_MODES = [
    { id: 'Agent', title: 'Agent', desc: 'Balanced Antigravity 2.33 coding & auto-approved safe commands' },
    { id: 'Autonomous', title: 'Autonomous', desc: 'Eager command & multi-step autonomous execution' },
    { id: 'Planning', title: 'Planning', desc: 'Architectural plan first + manual command review' },
    { id: 'Fast', title: 'Fast', desc: 'Low-latency Gemini 3.8 Flash responses for quick edits' }
];

// --- Theme Management (Antigravity 2.33 Dark Obsidian & Light) ---
function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('theme-light', isLight);
    document.body.classList.toggle('theme-dark', !isLight);
    document.documentElement.classList.toggle('dark', !isLight);
    const metaTheme = document.getElementById('metaThemeColor');
    if (metaTheme) metaTheme.setAttribute('content', isLight ? '#f8f9fa' : '#101010');
    try {
        localStorage.setItem('agy_remote_theme', isLight ? 'light' : 'dark');
        if (window.AndroidBridge && typeof window.AndroidBridge.setTheme === 'function') {
            window.AndroidBridge.setTheme(isLight ? 'light' : 'dark');
        }
    } catch (e) {}
}

function initTheme() {
    let saved = 'dark';
    try {
        saved = localStorage.getItem('agy_remote_theme') || 'dark';
    } catch (e) {}
    applyTheme(saved);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            triggerHaptic('light');
            const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
            applyTheme(next);
            showToast(`Switched to ${next === 'light' ? 'Light' : 'Dark Obsidian'} theme`);
        });
    }
}

// --- Authenticated Fetch Utility (URL Key -> localStorage -> Android Bridge) ---
function getStoredSessionKey() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlKey = urlParams.get('key');
        if (urlKey) {
            localStorage.setItem('ag_session_key', urlKey);
            if (window.AndroidBridge && typeof window.AndroidBridge.setSessionKey === 'function') {
                window.AndroidBridge.setSessionKey(urlKey);
            }
            return urlKey;
        }
        const stored = localStorage.getItem('ag_session_key');
        if (stored) return stored;

        if (window.AndroidBridge && typeof window.AndroidBridge.getSessionKey === 'function') {
            const k = window.AndroidBridge.getSessionKey();
            if (k) return k;
        }
        return '';
    } catch (e) {
        return '';
    }
}

async function fetchWithAuth(url, options = {}) {
    if (IS_OFFLINE_PREVIEW) {
        throw new Error('Offline preview active');
    }
    if (!options.headers) options.headers = {};
    options.headers['ngrok-skip-browser-warning'] = 'true';
    options.headers['X-Pinggy-No-Screen'] = '1';
    const key = getStoredSessionKey();
    if (key) options.headers['x-ag-key'] = key;

    const res = await fetch(url, options);
    if (res.status === 401) {
        window.location.href = '/login.html';
        return new Promise(() => {});
    }
    return res;
}

// --- Format Compact Model Label for Composer Pill ---
function formatCompactModelName(label) {
    if (!label) return 'Select Model';
    return label
        .replace(' (Thinking)', '')
        .replace('Gemini 4 ', 'G4 ')
        .replace('Gemini 3.8 ', 'G3.8 ')
        .replace('Claude Sonnet ', 'Sonnet ')
        .replace('Claude Opus ', 'Opus ');
}

function isModelVariantDisabled(variant) {
    return Boolean(variant?.disabled || String(variant?.tagTitle || '').toLowerCase() === 'unavailable');
}

function resolveModelByQuery(query, models = cachedModelDetails) {
    const list = Array.isArray(models) ? models : [];
    const norm = String(query || '').trim().toLowerCase();
    if (!norm || list.length === 0) return null;

    const exact = list.find(m => String(m.label || '').toLowerCase() === norm);
    if (exact) return exact;

    const tokens = norm
        .replace(/\bg4\b/g, 'gemini 4')
        .replace(/\bg3\.8\b/g, 'gemini 3.8')
        .split(/[\s()]+/)
        .filter(Boolean);
    if (tokens.length === 0) return null;

    const effortScore = {
        high: 50,
        neon: 48,
        medium: 40,
        xhigh: 35,
        low: 30,
        argon: 25,
        'sonnet 4.6': 20,
        'opus 4.6': 18
    };

    const scored = [];
    for (const m of list) {
        const labelLow = String(m.label || '').toLowerCase();
        const famLow = String(m.family || '').toLowerCase();
        const effLow = String(m.effort || '').toLowerCase();
        const hayTokens = `${labelLow} ${famLow} ${effLow}`.split(/[\s()]+/).filter(Boolean);
        const hayJoined = `${labelLow} ${famLow} ${effLow}`;

        let exactMatches = 0;
        let allMatched = true;
        for (const tok of tokens) {
            if (hayTokens.includes(tok)) {
                exactMatches += 1;
            } else if (!hayJoined.includes(tok)) {
                allMatched = false;
                break;
            }
        }
        if (!allMatched) continue;

        let score = exactMatches * 100;
        if (!isModelVariantDisabled(m)) score += 1000;
        if (labelLow.includes(norm)) score += 60;
        if (!tokens.includes('orchestrator') && famLow === 'orchestrator') score -= 80;
        if (tokens.includes('orchestrator') && famLow === 'orchestrator') score += 80;
        score += effortScore[effLow] || 10;

        scored.push({ model: m, score });
    }

    if (scored.length > 0) {
        scored.sort((a, b) => b.score - a.score);
        return scored[0].model;
    }

    // Fallback so legacy variants of a disabled family (e.g. "/model carbon high", "Gemini 4 Carbon (High)") show the unavailable toast
    const genericTokens = new Set([
        'gemini',
        'claude',
        'gpt',
        'oss',
        '4',
        '3.8',
        '4.6',
        '5.5',
        'orchestrator',
        'low',
        'medium',
        'high',
        'xhigh',
        'default',
        'thinking',
        'unavailable'
    ]);
    for (const m of list) {
        if (!isModelVariantDisabled(m)) continue;
        const disabledTokens = `${m.label || ''} ${m.family || ''}`
            .toLowerCase()
            .split(/[\s()]+/)
            .filter(t => t && !genericTokens.has(t));
        if (disabledTokens.some(dt => tokens.includes(dt))) {
            return m;
        }
    }
    return null;
}

function updateGeneratingUI(isGenerating) {
    if (stopBtn) {
        stopBtn.style.display = isGenerating ? 'inline-flex' : 'none';
    }
    if (sidebarRunningDot) {
        sidebarRunningDot.style.display = isGenerating ? 'block' : 'none';
    }
}

// --- Offline Preview Mode (Android Asset / Local File Preview) ---
function renderOfflinePreviewDemo() {
    if (statusDot) {
        statusDot.classList.remove('disconnected');
        statusDot.classList.add('connected');
    }
    if (statusText) statusText.textContent = 'Preview';
    if (statsText) statsText.textContent = 'Hub 2.33 · Offline UI Demo';
    if (sidebarHubMeta) sidebarHubMeta.textContent = 'Hub v2.33 · Offline Preview';
    if (offlinePreviewBanner) offlinePreviewBanner.style.display = 'flex';
    if (sslBanner) sslBanner.style.display = 'none';

    if (connectPcFromOfflineBtn) {
        connectPcFromOfflineBtn.addEventListener('click', () => {
            triggerHaptic('medium');
            if (window.AndroidBridge && typeof window.AndroidBridge.openServerPicker === 'function') {
                window.AndroidBridge.openServerPicker();
            } else {
                showToast('Open http://<PC-IP>:3000 in your browser to connect live');
            }
        });
    }

    syncSwarmNavBadge({
        hasSwarm: true,
        swarmId: 'offline-demo-swarm',
        workingCount: 2,
        waitingCount: 2,
        totalMembers: 4,
        head: 7,
        alertCount: 0
    });

    if (chatContent) {
        chatContent.innerHTML = `
            <div id="cascade" class="agy-hub-stream">
                <div class="agy-subagent-breadcrumb agy-chat-swarm-banner" data-testid="chat-swarm-banner" data-swarm-id="offline-demo-swarm">
                    <div class="agy-swarm-banner-left">
                        <span class="agy-swarm-banner-title">🐝 Antigravity Mobile Swarm</span>
                        <span class="agy-swarm-banner-meta">2 working · 2 waiting · #7 posts</span>
                    </div>
                    <button type="button" class="agy-open-swarm-banner-btn" data-open-swarm-ui="1" data-swarm-id="offline-demo-swarm" data-testid="banner-open-swarm-btn">
                        Open Swarm UI →
                    </button>
                </div>

                <div class="agy-welcome-hero" style="margin: 18px auto 8px auto;">
                    <div class="agy-welcome-logo">✦</div>
                    <h2>Antigravity 2.33 Mobile Preview</h2>
                    <p>Explore the Obsidian UI, <strong>Swarm Board</strong>, <strong>Antigravity IDE</strong>, Weekly Quota ring, grouped <strong>Gemini 4 Neon</strong> &amp; <strong>Orchestrator (Neon)</strong> model picker, and <code>/boost</code> &amp; <code>/swarm</code> autocomplete offline.</p>
                </div>

                <article role="article" aria-label="User message" class="agy-turn agy-user-turn">
                    <div class="agy-user-media-grid" data-testid="user-media-attachments">
                        <button type="button" class="agy-user-media-thumb" data-testid="user-media-thumb" data-lightbox-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" data-lightbox-alt="mobile_ui_preview.png" title="mobile_ui_preview.png">
                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="mobile_ui_preview.png" />
                        </button>
                        <div class="agy-user-media-file is-pdf" data-testid="user-media-file" data-media-mime="application/pdf" data-media-name="architecture_spec.pdf" title="architecture_spec.pdf">
                            <span class="agy-user-media-ext">PDF</span>
                            <span class="agy-user-media-name">architecture_spec.pdf</span>
                        </div>
                    </div>
                    <div class="agy-user-card">
                        <div class="agy-user-badges">
                            <span class="agy-slash-badge">/boost</span>
                            <span class="agy-slash-badge">/swarm</span>
                        </div>
                        <div class="whitespace-pre-wrap agy-user-text">Inspect the repository architecture and run full verification tests.</div>
                    </div>
                </article>

                <article role="article" aria-label="Assistant response" class="agy-turn agy-ai-turn" data-quotable-turn="1" data-quote-source="Gemini 4 Neon (High)">
                    <div class="agy-model-meta">Gemini 4 Neon (High)</div>
                    <details class="agy-thought-accordion">
                        <summary class="agy-thought-summary">
                            <span class="agy-thought-icon">✦</span>
                            <span>Thought process · 412 tokens</span>
                        </summary>
                        <div class="agy-thought-body">Delegating workspace inspection and automated test execution to DeepCoder swarm worker.</div>
                    </details>
                    <div class="agy-markdown-body">
                        <p>Launching parallel swarm workers to inspect your project and run the test suite. Connect to your PC Hub to stream live sessions.</p>
                        <ul>
                            <li>Option A: Quote any response or specific part to write a targeted answer.</li>
                            <li>Option B: Tap <code>/</code> to browse all System, Skill, Plugin, Workflow, and Control actions.</li>
                        </ul>
                        <p><button type="button" class="agy-inline-swarm-pill" data-open-swarm-ui="1" data-swarm-id="offline-demo-swarm" data-testid="inline-open-swarm-btn">🐝 Open the Swarm UI</button></p>
                        <pre><code class="language-js">const mode = 'swarm';
await hubBridge.sendMessage({ message: '/boost /swarm', quotes });</code></pre>
                    </div>
                </article>

                <div class="agy-subagent-card is-done">
                    <div class="agy-subagent-card-top">
                        <div class="agy-subagent-title-group">
                            <span class="agy-subagent-dot"></span>
                            <strong>Architecture &amp; Test Verifier</strong>
                            <span class="agy-subagent-type">DeepCoder</span>
                        </div>
                        <span class="agy-subagent-status-badge done">Preview · Ready</span>
                    </div>
                    <div class="agy-subagent-prompt">Tap "Connect PC" above or "Switch PC Server" in the Hub drawer to pair with your live desktop Antigravity 2.33 daemon.</div>
                </div>
            </div>
        `;
        addMobileCopyButtons();
        setupMessageCopyButtons();
    }
}

// --- Sync Desktop Hub / App State ---
async function fetchAppState() {
    if (IS_OFFLINE_PREVIEW) return;
    try {
        const res = await fetchWithAuth('/app-state');
        const data = await res.json();

        if (data.mode && data.mode !== 'Unknown') {
            currentMode = data.mode;
            if (modeText) modeText.textContent = data.mode;
            if (modeBtn) modeBtn.classList.toggle('active', data.mode === 'Autonomous' || data.mode === 'Planning');
        }

        if (data.model && data.model !== 'Unknown') {
            currentModel = data.model;
            if (modelText) {
                modelText.textContent = formatCompactModelName(data.model);
                modelText.title = data.model;
            }
        }

        if (data.activeCascadeId) {
            activeCascadeId = data.activeCascadeId;
        }

        if (typeof data.isGenerating === 'boolean') {
            updateGeneratingUI(data.isGenerating);
        }

        if (data.targetApp) {
            currentBackendTarget = data.targetApp;
            syncBackendTargetButtons();
        }

        if (data.contextUsage) {
            activeContextUsage = data.contextUsage;
        }

        if ('activeSwarm' in data) {
            syncSwarmNavBadge(data.activeSwarm);
        }

        if (data.quotaHeadline && typeof data.quotaHeadline.weeklyRemainingPercent === 'number') {
            updateQuotaPillHeadline(data.quotaHeadline, data.user);
        }

        if (sidebarHubMeta) {
            if (data.lsVersion) {
                const plan = data.user?.tierName || data.user?.planName ? ` · ${data.user.tierName || data.user.planName}` : '';
                sidebarHubMeta.textContent = `Hub v${data.lsVersion}${plan}`;
            } else if (data.connectionType === 'cdp') {
                sidebarHubMeta.textContent = 'CDP Bridge Active';
            }
        }
    } catch (e) {}
}

let serverSupportsNativeQuotes = false;

function syncSlashCountBadge() {
    if (slashCountPill) {
        slashCountPill.textContent = String(cachedSlashCommands.length);
    }
}

async function fetchSlashCommandsCatalog(force = false) {
    syncSlashCountBadge();
    if (IS_OFFLINE_PREVIEW) return;
    try {
        const res = await fetchWithAuth(force ? '/slash-commands?refresh=1' : '/slash-commands');
        const data = await res.json();
        serverSupportsNativeQuotes = Boolean(data?.counts);
        if (Array.isArray(data?.commands) && data.commands.length > 0) {
            if (serverSupportsNativeQuotes) {
                cachedSlashCommands = data.commands;
            } else {
                // Backward-compatible merge if server.js process has not been restarted yet
                const byName = new Map();
                data.commands.forEach(c => {
                    const def = DEFAULT_SLASH_COMMANDS.find(d => d.name === c.name);
                    byName.set(c.name.toLowerCase(), {
                        ...c,
                        category: c.category || (c.type === 'SYSTEM' ? 'System' : 'Skill'),
                        description:
                            c.description && !c.description.includes('Antigravity system workflow') && c.description !== 'Agent skill'
                                ? c.description
                                : def?.description || c.description || ''
                    });
                });
                DEFAULT_SLASH_COMMANDS.forEach(d => {
                    if (!byName.has(d.name.toLowerCase())) {
                        byName.set(d.name.toLowerCase(), { ...d });
                    }
                });
                cachedSlashCommands = Array.from(byName.values());
            }
            syncSlashCountBadge();
        }
    } catch (e) {}
}

// --- Check APK Availability & Native Android Bridge ---
async function initMobileIntegration() {
    const isAndroidNative = !!(window.AndroidBridge && typeof window.AndroidBridge.isNativeApp === 'function');
    if (isAndroidNative) {
        if (switchServerBtn) {
            switchServerBtn.style.display = 'flex';
            switchServerBtn.addEventListener('click', () => {
                triggerHaptic('medium');
                window.AndroidBridge.openServerPicker();
            });
        }
        if (sslBanner) sslBanner.style.display = 'none';
    } else if (!IS_OFFLINE_PREVIEW) {
        checkSslStatus();
        try {
            const res = await fetch('/apk-status');
            const info = await res.json();
            if (info && info.available && apkDownloadBtn) {
                apkDownloadBtn.style.display = 'flex';
                if (apkDownloadLabel && info.sizeMb) {
                    apkDownloadLabel.textContent = `Install Android APK (${info.sizeMb} MB)`;
                }
            }
        } catch (e) {}
    }

    // Hardware Back Handler for Native Android APK
    window.__handleAndroidBack = function () {
        const mediaLightboxEl = document.getElementById('mediaLightboxModal');
        if (mediaLightboxEl && mediaLightboxEl.classList.contains('show')) {
            closeMediaLightbox();
            return true;
        }
        if (quotePartsOverlay && quotePartsOverlay.classList.contains('show')) {
            closeQuotePartsModal();
            return true;
        }
        if (codeViewerModal && codeViewerModal.classList.contains('show')) {
            codeViewerModal.classList.remove('show');
            return true;
        }
        if (modalOverlay && modalOverlay.classList.contains('show')) {
            closeModal();
            return true;
        }
        if (supportOverlay && supportOverlay.classList.contains('show')) {
            supportOverlay.classList.remove('show');
            return true;
        }
        if (slashMenuPopup && slashMenuPopup.style.display !== 'none') {
            hideSlashMenu();
            return true;
        }
        if (activeSelectedQuote) {
            dismissSelectionQuoteUI();
            return true;
        }
        if (historyLayer && historyLayer.classList.contains('show')) {
            hideChatHistoryUI();
            return true;
        }
        if (chatFindBar && chatFindBar.style.display !== 'none') {
            closeChatFindBar();
            return true;
        }
        if (currentSurface === 'swarm') {
            stopSwarmGraphPlayback();
            switchSurface('antigravity');
            return true;
        }
        if (currentSurface === 'ide') {
            if (currentIdeSubtab === 'code' && !ideEditingFile) {
                setIdeSubtab('explorer');
                return true;
            }
            switchSurface('antigravity');
            return true;
        }
        if (currentParentCascadeId && !IS_OFFLINE_PREVIEW) {
            selectChat({ cascadeId: currentParentCascadeId });
            return true;
        }
        return false;
    };
}

// --- SSL Banner ---
function checkSslStatus() {
    if (IS_OFFLINE_PREVIEW) return;
    if (window.location.protocol === 'https:') return;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;
    try {
        if (localStorage.getItem('sslBannerDismissed')) return;
    } catch (e) {}
    if (sslBanner) sslBanner.style.display = 'flex';
}

async function enableHttps() {
    if (!enableHttpsBtn) return;
    enableHttpsBtn.textContent = 'Generating…';
    enableHttpsBtn.disabled = true;
    try {
        const res = await fetchWithAuth('/generate-ssl', { method: 'POST' });
        const data = await res.json();
        if (data.success && sslBanner) {
            sslBanner.innerHTML = `<span>✅ ${escapeHtml(data.message)}</span>`;
        } else {
            enableHttpsBtn.textContent = 'Retry';
            enableHttpsBtn.disabled = false;
        }
    } catch (e) {
        enableHttpsBtn.textContent = 'Retry';
        enableHttpsBtn.disabled = false;
    }
}

function dismissSslBanner() {
    if (sslBanner) sslBanner.style.display = 'none';
    try { localStorage.setItem('sslBannerDismissed', 'true'); } catch (e) {}
}

// --- WebSocket Live Stream ---
function connectWebSocket() {
    if (IS_OFFLINE_PREVIEW) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const key = getStoredSessionKey();
    const qs = key ? `?key=${encodeURIComponent(key)}` : '';

    try {
        ws = new WebSocket(`${protocol}//${window.location.host}${qs}`);
    } catch (err) {
        updateStatus(false);
        setTimeout(connectWebSocket, 3000);
        return;
    }

    ws.onopen = () => {
        updateStatus(true);
        loadSnapshot();
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'error' && data.message === 'Unauthorized') {
                window.location.href = '/login.html';
                return;
            }
            if (typeof data.isGenerating === 'boolean') {
                updateGeneratingUI(data.isGenerating);
            }
            if (data.type === 'swarm_update') {
                if ('activeSwarm' in data) {
                    syncSwarmNavBadge(data.activeSwarm);
                }
                if (currentSurface === 'swarm' && autoRefreshEnabled) {
                    scheduleSwarmUiRefresh(80);
                }
                return;
            }
            if (data.type === 'snapshot_update') {
                if ('activeSwarm' in data) {
                    syncSwarmNavBadge(data.activeSwarm);
                }
                if (autoRefreshEnabled) {
                    if (!userIsScrolling) {
                        loadSnapshot();
                    } else {
                        loadSnapshot(true);
                    }
                    if (currentSurface === 'swarm') {
                        scheduleSwarmUiRefresh(110);
                    }
                }
            }
        } catch (e) {}
    };

    ws.onclose = () => {
        updateStatus(false);
        setTimeout(connectWebSocket, 2000);
    };

    ws.onerror = () => {};
}

function updateStatus(connected) {
    if (!statusDot || !statusText) return;
    statusDot.classList.toggle('connected', connected);
    statusDot.classList.toggle('disconnected', !connected);
    statusText.textContent = connected ? 'Live' : 'Reconnecting';
}

// --- Snapshot Loading & Rendering ---
async function loadSnapshot(deferIfScrolling = false, forceImmediate = false) {
    if (IS_OFFLINE_PREVIEW) return;
    // Do not clobber active typing inside an ask_question write-in input unless explicitly submitting
    if (
        !forceImmediate &&
        document.activeElement &&
        document.activeElement.classList?.contains('agy-question-writein')
    ) {
        return;
    }

    try {
        const icon = refreshBtn ? refreshBtn.querySelector('svg') : null;
        if (icon && !deferIfScrolling) {
            icon.classList.remove('spin-anim');
            void icon.offsetWidth;
            icon.classList.add('spin-anim');
        }

        const response = await fetchWithAuth('/snapshot');
        if (!response.ok) {
            if (response.status === 503) return;
            throw new Error('Snapshot HTTP ' + response.status);
        }

        const data = await response.json();

        if (typeof data.isGenerating === 'boolean') {
            updateGeneratingUI(data.isGenerating);
        }
        if (data.cascadeId !== undefined) {
            activeCascadeId = data.cascadeId;
        }
        if (data.contextUsage) {
            activeContextUsage = data.contextUsage;
        }
        if (Array.isArray(data.changedFiles)) {
            cachedSessionChangedFiles = data.changedFiles;
            syncIdeChangedBadge();
        }
        if ('activeSwarm' in data) {
            syncSwarmNavBadge(data.activeSwarm);
        }
        currentParentCascadeId = data.parentCascadeId || null;
        if (headerTitle) {
            if (data.title) {
                headerTitle.textContent = data.title;
            } else if (data.source === 'hub') {
                headerTitle.textContent = data.cascadeId ? 'New Conversation' : 'Antigravity';
            }
        }

        if (data.hash && data.hash === lastHash) {
            return;
        }

        // Preserve active text selection inside #chatContent so live polls never wipe mobile touch selection handles
        if (!forceImmediate && activeSelectedQuote) {
            pendingSnapshotData = data;
            return;
        }

        if (userIsScrolling || deferIfScrolling) {
            const scroller = getScrollContainer();
            const pos = scroller ? scroller.scrollTop : 0;
            const max = scroller ? scroller.scrollHeight - scroller.clientHeight : 0;
            if (max - pos >= 140) {
                pendingSnapshotData = data;
                return;
            }
        }

        renderSnapshotData(data);
    } catch (err) {
        console.error('[SNAPSHOT]', err);
    }
}

function renderSnapshotData(data) {
    if (!data) return;
    lastHash = data.hash || '';
    pendingSnapshotData = null;

    const scroller = chatContent || getScrollContainer();
    const scrollPos = scroller ? scroller.scrollTop : 0;
    const scrollHeight = scroller ? scroller.scrollHeight : 0;
    const clientHeight = scroller ? scroller.clientHeight : 0;
    const isNearBottom = (scrollHeight - scrollPos - clientHeight) < 160;
    const isUserScrollLocked = Date.now() < userScrollLockUntil;

    // Preserve open <details> state & selected question options across live updates
    const getDetailsPersistenceKey = (d, idx) => {
        const ownStep = d.getAttribute('data-step-index');
        if (ownStep !== null) return `step:${ownStep}`;
        const parentStep = d.closest('[data-step-index]')?.getAttribute('data-step-index');
        const summaryLabel = d.querySelector('summary')?.textContent?.trim() || String(idx);
        return parentStep !== undefined && parentStep !== null ? `step:${parentStep}:${summaryLabel}` : summaryLabel;
    };
    const openDetailsKeys = new Set();
    chatContent.querySelectorAll('details[open]').forEach((d, idx) => {
        openDetailsKeys.add(getDetailsPersistenceKey(d, idx));
    });

    const selectedQuestionKeys = new Set();
    chatContent.querySelectorAll('.agy-question-opt-btn.selected').forEach(btn => {
        selectedQuestionKeys.add(`${btn.getAttribute('data-q-index')}:${btn.getAttribute('data-opt-id')}`);
    });
    const writeInValues = new Map();
    chatContent.querySelectorAll('.agy-question-writein').forEach(inp => {
        if (inp.value) writeInValues.set(inp.getAttribute('data-q-writein'), inp.value);
    });

    if (data.stats && statsText) {
        const kbs = Math.max(1, Math.round((data.stats.htmlSize + (data.stats.cssSize || 0)) / 1024));
        const modeTag = data.source === 'hub' ? 'Hub 2.33' : 'CDP';
        statsText.textContent = `${modeTag} · ${data.stats.nodes} nodes · ${kbs}KB`;
    }

    let styleTag = document.getElementById('cdp-styles');
    if (data.source === 'hub') {
        if (styleTag) styleTag.textContent = '';
        chatContent.innerHTML = data.html;
    } else {
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'cdp-styles';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = (data.css || '') + '\n' +
            '#chatContent form, #chatContent textarea, #chatContent [contenteditable="true"], #chatContent [data-testid="agent-input-box"] { display: none !important; }\n' +
            '#chatContent { color: var(--foreground); }\n';
        chatContent.innerHTML = data.html;
    }

    // Restore open <details> accordions & question selections
    if (openDetailsKeys.size > 0) {
        chatContent.querySelectorAll('details').forEach((d, idx) => {
            if (openDetailsKeys.has(getDetailsPersistenceKey(d, idx))) d.setAttribute('open', '');
        });
    }
    if (selectedQuestionKeys.size > 0) {
        chatContent.querySelectorAll('.agy-question-opt-btn').forEach(btn => {
            const k = `${btn.getAttribute('data-q-index')}:${btn.getAttribute('data-opt-id')}`;
            if (selectedQuestionKeys.has(k)) btn.classList.add('selected');
        });
    }
    if (writeInValues.size > 0) {
        chatContent.querySelectorAll('.agy-question-writein').forEach(inp => {
            const k = inp.getAttribute('data-q-writein');
            if (writeInValues.has(k)) inp.value = writeInValues.get(k);
        });
    }

    addMobileCopyButtons();
    setupMessageCopyButtons();
    if (chatFindBar && chatFindBar.style.display !== 'none' && chatFindInput?.value.trim()) {
        applyChatFindHighlights(false);
    }

    const currentScroller = chatContent || getScrollContainer();
    if (currentScroller) {
        if (isUserScrollLocked) {
            currentScroller.scrollTop = scrollPos;
        } else if (isNearBottom) {
            currentScroller.scrollTop = currentScroller.scrollHeight;
        } else {
            currentScroller.scrollTop = scrollPos;
        }
    }
}

// --- Clean Node Text & Structured Response Block Extraction for Quoting ---
function serializeStructuredDomNode(node, listDepth = 0) {
    if (!node) return '';
    if (node.nodeType === 3) {
        return node.nodeValue || '';
    }
    if (node.nodeType !== 1) return '';

    const tag = (node.tagName || '').toUpperCase();
    if (tag === 'BR') return '\n';
    if (tag === 'HR') return '\n---\n';

    if (tag === 'PRE') {
        const codeEl = node.querySelector('code') || node;
        return `\n${(codeEl.textContent || '').replace(/\r\n/g, '\n').trim()}\n`;
    }

    if (tag === 'TABLE') {
        const rows = Array.from(node.querySelectorAll('tr'));
        const rowStrings = rows
            .map(tr => {
                const cells = Array.from(tr.querySelectorAll('th, td')).map(cell =>
                    serializeStructuredDomNode(cell, listDepth).replace(/\s+/g, ' ').trim()
                );
                return cells.filter(Boolean).join(' | ');
            })
            .filter(Boolean);
        return rowStrings.length ? `\n${rowStrings.join('\n')}\n` : '';
    }

    if (tag === 'UL' || tag === 'OL') {
        const items = Array.from(node.children).filter(c => (c.tagName || '').toUpperCase() === 'LI');
        const lines = items
            .map((li, idx) => {
                const indent = '  '.repeat(listDepth);
                const bullet = tag === 'OL' ? `${idx + 1}. ` : '• ';
                const childParts = [];
                const nestedParts = [];
                Array.from(li.childNodes).forEach(ch => {
                    const chTag = (ch.tagName || '').toUpperCase();
                    if (chTag === 'UL' || chTag === 'OL') {
                        const sub = serializeStructuredDomNode(ch, listDepth + 1).trimEnd();
                        if (sub) nestedParts.push(sub.replace(/^\n+/, ''));
                    } else {
                        childParts.push(serializeStructuredDomNode(ch, listDepth));
                    }
                });
                const headLine = childParts.join('').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
                return [headLine ? `${indent}${bullet}${headLine}` : '', ...nestedParts].filter(Boolean).join('\n');
            })
            .filter(Boolean);
        return lines.length ? `\n${lines.join('\n')}\n` : '';
    }

    const inner = Array.from(node.childNodes)
        .map(ch => serializeStructuredDomNode(ch, listDepth))
        .join('');

    if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DIV', 'SECTION', 'ARTICLE'].includes(tag)) {
        const trimmed = inner.trim();
        return trimmed ? `\n${trimmed}\n` : '';
    }

    return inner;
}

function extractCleanNodeText(node) {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone
        .querySelectorAll(
            'button, .code-block-toolbar, .agy-turn-actions, .mobile-copy-btn, .code-expand-btn, .code-quote-btn, .user-copy-btn, .ai-copy-btn, .ai-quote-btn, .ai-quote-parts-btn'
        )
        .forEach(el => el.remove());

    const cloneTag = (clone.tagName || '').toUpperCase();
    if (cloneTag === 'CODE' || cloneTag === 'PRE') {
        const codeNode = cloneTag === 'PRE' ? clone.querySelector('code') || clone : clone;
        return (codeNode.textContent || '')
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    return serializeStructuredDomNode(clone, 0)
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function extractResponseBlocks(bodyNode) {
    if (!bodyNode) return [];
    const blocks = [];
    const seen = new Set();

    const pushBlock = (rawText, isCode = false) => {
        const cleaned = String(rawText || '').trim();
        if (!cleaned || seen.has(cleaned)) return;
        seen.add(cleaned);
        blocks.push({
            content: cleaned,
            label: isCode ? 'code_block' : 'Quote'
        });
    };

    const children = Array.from(bodyNode.children);
    if (children.length === 0) {
        const whole = extractCleanNodeText(bodyNode);
        if (whole) pushBlock(whole, false);
        return blocks;
    }

    for (const child of children) {
        const tag = (child.tagName || '').toUpperCase();
        if (child.classList?.contains('agy-turn-actions')) continue;
        if (tag === 'HR') continue;

        if (tag === 'PRE') {
            const codeEl = child.querySelector('code') || child;
            pushBlock(extractCleanNodeText(codeEl), true);
        } else if (tag === 'UL' || tag === 'OL') {
            const items = Array.from(child.querySelectorAll(':scope > li'));
            const startNum = tag === 'OL' ? Math.max(1, parseInt(child.getAttribute('start') || '1', 10) || 1) : 1;
            items.forEach((li, idx) => {
                const prefix = tag === 'OL' ? `${startNum + idx}. ` : '• ';
                const txt = extractCleanNodeText(li);
                if (txt) pushBlock(txt.startsWith('• ') || /^\d+\.\s/.test(txt) ? txt : prefix + txt, false);
            });
        } else {
            const txt = extractCleanNodeText(child);
            if (txt) pushBlock(txt, false);
        }
    }

    if (blocks.length === 0) {
        const fallback = extractCleanNodeText(bodyNode);
        if (fallback) pushBlock(fallback, false);
    }
    return blocks;
}

// --- Composer Quote Reply Tray & Specific Answers ---
function updateComposerPlaceholder() {
    if (!messageInput) return;
    if (pendingQuotes.length > 0) {
        messageInput.placeholder =
            pendingQuotes.length > 1
                ? 'Optional note or /actions (e.g. /boost)…'
                : 'Optional extra context or /actions…';
    } else {
        messageInput.placeholder = 'Ask anything, quote, or type / for actions…';
    }
}

function renderQuotePreviews() {
    updateComposerPlaceholder();
    if (!quotePreviewBar) return;
    if (pendingQuotes.length === 0) {
        quotePreviewBar.style.display = 'none';
        quotePreviewBar.innerHTML = '';
        return;
    }

    quotePreviewBar.style.display = 'flex';

    quotePreviewBar.innerHTML = pendingQuotes
        .map((q, idx) => {
            const isFileRange = Boolean(q.fileUri);
            const isCode = q.label === 'code_block' || isFileRange;
            const isSideQ = String(q.customLabel || '').startsWith('Side question (conversation ');
            const badgePrefix = isFileRange
                ? '📄 IDE File Range'
                : isCode
                  ? '</> Quoted Code'
                  : isSideQ
                    ? '💬 Side Question'
                    : '❝ Quoted';
            const badgeSource = q.sourceLabel ? ` · ${q.sourceLabel}` : '';
            return `
                <div class="quote-draft-card ${isCode ? 'is-code' : ''}" data-testid="composer-quote-card" data-quote-idx="${idx}">
                    <div class="quote-draft-header">
                        <span class="quote-draft-badge">${escapeHtml(badgePrefix + badgeSource)}</span>
                        <div class="quote-draft-controls">
                            <button type="button" class="quote-draft-remove" data-quote-remove="${idx}" aria-label="Remove quote">✕</button>
                        </div>
                    </div>
                    <div class="quote-draft-text">${escapeHtml(q.content)}</div>
                    <textarea rows="1"
                              class="quote-draft-answer-input"
                              data-quote-answer-idx="${idx}"
                              placeholder="Write your specific answer to this quote…">${escapeHtml(q.answer || '')}</textarea>
                </div>
            `;
        })
        .join('');

    quotePreviewBar.querySelectorAll('[data-quote-remove]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.getAttribute('data-quote-remove') || '0', 10);
            pendingQuotes.splice(idx, 1);
            renderQuotePreviews();
        });
    });

    quotePreviewBar.querySelectorAll('[data-quote-answer-idx]').forEach(inp => {
        const autoSize = () => {
            inp.style.height = 'auto';
            inp.style.height = Math.min(inp.scrollHeight, 82) + 'px';
        };
        if (inp.value) autoSize();
        inp.addEventListener('input', () => {
            const idx = parseInt(inp.getAttribute('data-quote-answer-idx') || '0', 10);
            if (pendingQuotes[idx]) {
                pendingQuotes[idx].answer = inp.value;
            }
            autoSize();
        });
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const idx = parseInt(inp.getAttribute('data-quote-answer-idx') || '0', 10);
                const nextUnanswered = quotePreviewBar.querySelector(
                    `[data-quote-answer-idx="${idx + 1}"]`
                );
                if (nextUnanswered && !nextUnanswered.value.trim()) {
                    nextUnanswered.focus();
                } else if ((messageInput?.value || '').trim()) {
                    messageInput.focus();
                } else if (inp.value.trim() || pendingQuotes.some(q => (q.answer || '').trim())) {
                    sendMessage();
                } else {
                    messageInput?.focus();
                }
            }
        });
    });
}

function addQuoteToComposer(
    { content, label = 'Quote', customLabel = '', sourceLabel = '', answer = '', fileUri = '', startLine = null, endLine = null },
    focusTarget = 'answer'
) {
    const clean = String(content || '').trim();
    if (!clean && !fileUri) return false;

    const normalizedLabel = label === 'code_block' || fileUri ? 'code_block' : 'Quote';
    let targetIdx = pendingQuotes.findIndex(
        q =>
            q.content === clean &&
            q.label === normalizedLabel &&
            (q.customLabel || '') === (customLabel || '') &&
            (q.fileUri || '') === (fileUri || '') &&
            (q.startLine || null) === (startLine || null) &&
            (q.endLine || null) === (endLine || null) &&
            !q.answer &&
            !answer
    );

    if (targetIdx === -1) {
        pendingQuotes.push({
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            content: clean,
            label: normalizedLabel,
            customLabel: customLabel || '',
            sourceLabel: sourceLabel || '',
            fileUri: fileUri || '',
            startLine: startLine || null,
            endLine: endLine || null,
            answer: String(answer || '').trim()
        });
        targetIdx = pendingQuotes.length - 1;
    } else if (answer) {
        pendingQuotes[targetIdx].answer = String(answer).trim();
    }

    saveComposerDraft();
    renderQuotePreviews();
    triggerHaptic('medium');
    if (focusTarget === 'composer' || focusTarget === true) {
        if (focusTarget === 'composer') {
            messageInput?.focus();
        } else {
            const ansInp = quotePreviewBar?.querySelector(`[data-quote-answer-idx="${targetIdx}"]`);
            (ansInp || messageInput)?.focus();
        }
    } else if (focusTarget === 'answer') {
        const ansInp = quotePreviewBar?.querySelector(`[data-quote-answer-idx="${targetIdx}"]`);
        (ansInp || messageInput)?.focus();
    }
    return true;
}

// --- Quote & Answer Specific Parts Bottom Sheet ---
function closeQuotePartsModal() {
    if (quotePartsOverlay) quotePartsOverlay.classList.remove('show');
}

function openQuotePartsModal(blocks, sourceLabel = 'Response') {
    if (!quotePartsOverlay || !quotePartsList || !Array.isArray(blocks) || blocks.length === 0) return;
    triggerHaptic('light');
    quotePartsContext = { blocks, sourceLabel };

    quotePartsList.innerHTML = blocks
        .map(
            (blk, idx) => `
            <div class="quote-part-card ${blk.label === 'code_block' ? 'is-code' : ''}" data-part-idx="${idx}">
                <div class="quote-part-select-row" data-toggle-part="${idx}">
                    <span class="quote-part-check">✓</span>
                    <div class="quote-part-excerpt">${escapeHtml(blk.content)}</div>
                </div>
                <div class="quote-part-answer-wrap">
                    <textarea rows="1"
                              class="quote-part-answer-input"
                              data-part-answer="${idx}"
                              placeholder="Write your specific answer to this part…"></textarea>
                </div>
            </div>
        `
        )
        .join('');

    quotePartsList.querySelectorAll('[data-toggle-part]').forEach(row => {
        row.addEventListener('click', () => {
            triggerHaptic('light');
            const card = row.closest('.quote-part-card');
            if (!card) return;
            const nowSelected = card.classList.toggle('selected');
            if (nowSelected) {
                const ta = card.querySelector('.quote-part-answer-input');
                setTimeout(() => ta?.focus(), 40);
            }
        });
    });

    quotePartsOverlay.classList.add('show');
}

function collectSelectedQuoteParts() {
    if (!quotePartsList) return [];
    const cards = Array.from(quotePartsList.querySelectorAll('.quote-part-card.selected'));
    return cards
        .map(card => {
            const idx = parseInt(card.getAttribute('data-part-idx') || '0', 10);
            const blk = quotePartsContext.blocks[idx];
            if (!blk) return null;
            const answer = (card.querySelector('.quote-part-answer-input')?.value || '').trim();
            return {
                content: blk.content,
                label: blk.label,
                sourceLabel: quotePartsContext.sourceLabel,
                answer
            };
        })
        .filter(Boolean);
}

// --- Live Text Selection Quoting (Desktop + Mobile Touch Safe + Native Android ActionMode Bridge) ---
let selectionActionLockUntil = 0;
let lockedTouchQuote = null;

function dismissSelectionQuoteUI(clearBrowserSelection = true) {
    selectionActionLockUntil = 0;
    lockedTouchQuote = null;
    activeSelectedQuote = null;
    if (selectionQuotePill) selectionQuotePill.style.display = 'none';
    if (composerSelectionBanner) composerSelectionBanner.style.display = 'none';
    if (clearBrowserSelection && window.getSelection) {
        try { window.getSelection().removeAllRanges(); } catch {}
    }
    if (pendingSnapshotData && !userIsScrolling) {
        const next = pendingSnapshotData;
        pendingSnapshotData = null;
        renderSnapshotData(next);
    }
}

function initTextSelectionQuoting() {
    let selTimer = null;

    const evaluateSelection = () => {
        // Protect active mobile touch gesture on Quote / /btw buttons from WebView selection-collapse races!
        if (Date.now() < selectionActionLockUntil) {
            return;
        }

        if (!chatContent || !window.getSelection) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
            if (activeSelectedQuote) dismissSelectionQuoteUI(false);
            return;
        }

        const anchor = sel.anchorNode;
        const focus = sel.focusNode;
        const codeViewerBodyEl = document.getElementById('codeViewerContent');
        const insideChat = chatContent.contains(anchor) || chatContent.contains(focus);
        const insideCodeModal = Boolean(codeViewerBodyEl && (codeViewerBodyEl.contains(anchor) || codeViewerBodyEl.contains(focus)));
        if (!anchor || !focus || (!insideChat && !insideCodeModal)) {
            return;
        }

        const anchorEl = anchor.nodeType === 1 ? anchor : anchor.parentElement;
        if (anchorEl && anchorEl.closest('input, textarea, button, .code-block-toolbar, .agy-approval-bar, .agy-question-options')) {
            return;
        }

        const selectedText = String(sel.toString() || '').trim();
        if (selectedText.length < 2) {
            if (activeSelectedQuote) dismissSelectionQuoteUI(false);
            return;
        }

        const inCode = insideCodeModal || Boolean(anchorEl?.closest('pre, code'));
        const sourceTurn = anchorEl?.closest('[data-quote-source]');
        const codeLangLabel = insideCodeModal ? document.getElementById('codeViewerLang')?.textContent?.trim() : '';
        const sourceLabel = codeLangLabel || sourceTurn?.getAttribute('data-quote-source') || 'Selection';

        activeSelectedQuote = {
            content: selectedText,
            label: inCode ? 'code_block' : 'Quote',
            sourceLabel
        };
        lockedTouchQuote = { ...activeSelectedQuote };

        // 1. Update thumb-friendly banner right above composer
        if (composerSelectionBanner && composerSelectionPreview && !insideCodeModal) {
            const compact = selectedText.replace(/\s+/g, ' ');
            composerSelectionPreview.textContent = compact.length > 52 ? `${compact.slice(0, 52)}…` : compact;
            composerSelectionBanner.style.display = 'flex';
        }

        // 2. Position floating selection quote pill safely inside viewport
        if (selectionQuotePill) {
            try {
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                if (rect && (rect.width > 0 || rect.height > 0)) {
                    const topCandidate = rect.bottom + 8;
                    const clampedTop = Math.max(62, Math.min(topCandidate, window.innerHeight - 165));
                    const clampedLeft = Math.max(10, Math.min(rect.left, window.innerWidth - 250));
                    selectionQuotePill.style.top = `${Math.round(clampedTop)}px`;
                    selectionQuotePill.style.left = `${Math.round(clampedLeft)}px`;
                    selectionQuotePill.style.display = 'inline-flex';
                }
            } catch {}
        }
    };

    const scheduleEval = () => {
        clearTimeout(selTimer);
        selTimer = setTimeout(evaluateSelection, 70);
    };

    document.addEventListener('selectionchange', scheduleEval);
    if (chatContent) {
        chatContent.addEventListener('mouseup', scheduleEval);
        chatContent.addEventListener('touchend', scheduleEval, { passive: true });
    }

    const armTouchSelectionLock = () => {
        selectionActionLockUntil = Date.now() + 750;
        if (activeSelectedQuote) {
            lockedTouchQuote = { ...activeSelectedQuote };
        }
    };

    [selectionQuotePill, composerSelectionBanner].forEach(container => {
        if (!container) return;
        container.addEventListener('touchstart', armTouchSelectionLock, { passive: true });
        container.addEventListener('pointerdown', armTouchSelectionLock);
        container.addEventListener('mousedown', armTouchSelectionLock);
    });

    const consumeActiveSelectionForAction = (mode = 'quote') => {
        let captured = activeSelectedQuote || lockedTouchQuote;
        if (!captured && window.getSelection) {
            const rawSel = String(window.getSelection()?.toString() || '').trim();
            if (rawSel) {
                captured = { content: rawSel, label: 'Quote', sourceLabel: 'Selection' };
            }
        }
        if (!captured) return false;
        if (codeViewerModal?.classList.contains('show')) {
            codeViewerModal.classList.remove('show');
        }
        dismissSelectionQuoteUI(true);
        if (mode === 'btw') {
            addQuoteToComposer(captured, 'composer');
            toggleOrInsertSlashAction('/btw', { allowToggleOff: false });
            showToast('Quoted selection for /btw side question');
        } else {
            addQuoteToComposer(captured, 'answer');
            showToast('Quoted selection — write your specific answer');
        }
        return true;
    };

    // Expose bridge hook for Android Native WebView ActionMode ("❝ Quote" & "💬 /btw")
    window.__quoteNativeSelection = consumeActiveSelectionForAction;

    const applyActiveSelectionQuote = (e) => {
        e.preventDefault();
        e.stopPropagation();
        consumeActiveSelectionForAction('quote');
    };

    const applyActiveSelectionBtw = (e) => {
        e.preventDefault();
        e.stopPropagation();
        consumeActiveSelectionForAction('btw');
    };

    [selectionQuoteBtn, composerSelectionQuoteBtn].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('touchstart', armTouchSelectionLock, { passive: true });
        btn.addEventListener('mousedown', e => { armTouchSelectionLock(); e.preventDefault(); });
        btn.addEventListener('pointerdown', e => { armTouchSelectionLock(); e.preventDefault(); });
        btn.addEventListener('click', applyActiveSelectionQuote);
    });

    [selectionBtwBtn, composerSelectionBtwBtn].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('touchstart', armTouchSelectionLock, { passive: true });
        btn.addEventListener('mousedown', e => { armTouchSelectionLock(); e.preventDefault(); });
        btn.addEventListener('pointerdown', e => { armTouchSelectionLock(); e.preventDefault(); });
        btn.addEventListener('click', applyActiveSelectionBtw);
    });

    if (selectionDismissBtn) {
        selectionDismissBtn.addEventListener('mousedown', e => e.preventDefault());
        selectionDismissBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dismissSelectionQuoteUI(true);
        });
    }
}

// --- Code Block Copy, Quote & Fullscreen Expand (Non-Overlapping Header Toolbar) ---
function addMobileCopyButtons() {
    const codeBlocks = chatContent.querySelectorAll('pre');
    codeBlocks.forEach((pre, index) => {
        if (pre.classList.contains('agy-tool-output') || pre.classList.contains('agy-user-quote-code')) return;
        const codeElement = pre.querySelector('code') || pre;
        if (pre.querySelector('.code-block-toolbar') || pre.querySelector('.mobile-copy-btn')) return;

        const textToCopy = (codeElement.textContent || codeElement.innerText || '').trim();
        if (!/\n/.test(textToCopy) && textToCopy.length < 24) return;

        const langClass = Array.from(codeElement.classList).find(c => c.startsWith('language-'));
        const langName = langClass ? langClass.replace('language-', '') : 'CODE';

        const toolbar = document.createElement('div');
        toolbar.className = 'code-block-toolbar';

        const langBadge = document.createElement('span');
        langBadge.className = 'code-block-lang';
        langBadge.textContent = langName;

        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'code-block-actions';

        const quoteCodeBtn = document.createElement('button');
        quoteCodeBtn.className = 'code-quote-btn';
        quoteCodeBtn.type = 'button';
        quoteCodeBtn.setAttribute('data-testid', 'quote-code-btn');
        quoteCodeBtn.textContent = '❝ Quote';
        quoteCodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addQuoteToComposer({
                content: textToCopy,
                label: 'code_block',
                sourceLabel: langName.toUpperCase()
            });
            showToast('Code block quoted');
        });

        const expandBtn = document.createElement('button');
        expandBtn.className = 'code-expand-btn';
        expandBtn.type = 'button';
        expandBtn.textContent = 'Expand';
        expandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.openCodeViewer) {
                window.openCodeViewer(textToCopy, langName);
            }
        });

        const copyBtn = document.createElement('button');
        copyBtn.className = 'mobile-copy-btn';
        copyBtn.type = 'button';
        copyBtn.setAttribute('data-code-index', index);
        copyBtn.setAttribute('aria-label', 'Copy code');
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

        copyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (await copyToClipboard(textToCopy)) {
                triggerHaptic('success');
                showToast('Code copied');
            }
        });

        actionsWrap.appendChild(quoteCodeBtn);
        actionsWrap.appendChild(expandBtn);
        actionsWrap.appendChild(copyBtn);
        toolbar.appendChild(langBadge);
        toolbar.appendChild(actionsWrap);
        pre.insertBefore(toolbar, pre.firstChild);
    });
}

// --- Upgrade Fallback Markdown `> ...` Quotes & Legacy Upload Location Notes ---
function getClientAttachmentBadgeInfo(fileName = '', mimeType = '') {
    const cleanName = String(fileName || '').replace(/\\/g, '/').split('/').pop() || 'FILE';
    const isTarDoubleExt = /\.(tar\.(?:gz|bz2|xz|zst))$/i.test(cleanName);
    const dotIdx = cleanName.lastIndexOf('.');
    const ext = isTarDoubleExt ? 'tar.gz' : dotIdx > 0 ? cleanName.slice(dotIdx + 1).toLowerCase() : '';
    const upperExt = isTarDoubleExt ? 'TAR.GZ' : ext ? ext.toUpperCase().slice(0, 6) : '';
    const mime = String(mimeType || '').toLowerCase();

    if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif', 'heic', 'heif'].includes(ext)) {
        return { badge: upperExt || 'IMG', cls: 'is-image', isImage: true };
    }
    if (mime === 'application/pdf' || ext === 'pdf') {
        return { badge: 'PDF', cls: 'is-pdf', isImage: false };
    }
    if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'].includes(ext)) {
        return { badge: upperExt || 'VIDEO', cls: 'is-video', isImage: false };
    }
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'opus', 'weba'].includes(ext)) {
        return { badge: upperExt || 'AUDIO', cls: 'is-audio', isImage: false };
    }
    if (['csv', 'tsv'].includes(ext) || mime === 'text/csv') {
        return { badge: upperExt || 'CSV', cls: 'is-csv', isImage: false };
    }
    if (['json', 'jsonc', 'jsonl'].includes(ext) || mime === 'application/json') {
        return { badge: 'JSON', cls: 'is-json', isImage: false };
    }
    if (isTarDoubleExt || ['zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'apk'].includes(ext) || mime.includes('zip')) {
        return { badge: upperExt || 'ZIP', cls: 'is-archive', isImage: false };
    }
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        return { badge: upperExt || 'DOC', cls: 'is-doc', isImage: false };
    }
    if (isPlainTextFile({ name: cleanName, type: mime })) {
        return { badge: upperExt || 'TXT', cls: 'is-code', isImage: false };
    }
    return { badge: upperExt || 'FILE', cls: 'is-binary', isImage: false };
}

function enhanceFallbackUserQuotes(userCard) {
    if (!userCard) return;
    const textDiv = userCard.querySelector('.agy-user-text');
    if (textDiv) {
        const rawText = textDiv.textContent || '';
        if (rawText.includes('[Attached:') && rawText.includes('file:///')) {
            const turnEl = userCard.closest('.agy-user-turn') || userCard.parentElement;
            let mediaGrid = turnEl?.querySelector('.agy-user-media-grid');
            const stripped = rawText
                .replace(/\[Attached:\s*([^\]]+)\]\((file:\/\/\/[^)\r\n]+\/uploads\/[^)\r\n]+)\)/g, (_m, fName, fUri) => {
                    const cleanName = String(fName || 'Attachment').trim();
                    const info = getClientAttachmentBadgeInfo(cleanName, '');
                    const servedUrl = `/hub/media?uri=${encodeURIComponent(fUri)}`;
                    if (!mediaGrid && turnEl) {
                        mediaGrid = document.createElement('div');
                        mediaGrid.className = 'agy-user-media-grid';
                        mediaGrid.setAttribute('data-testid', 'user-media-attachments');
                        turnEl.insertBefore(mediaGrid, userCard);
                    }
                    if (mediaGrid) {
                        if (info.isImage) {
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'agy-user-media-thumb';
                            btn.setAttribute('data-testid', 'user-media-thumb');
                            btn.setAttribute('data-lightbox-src', servedUrl);
                            btn.setAttribute('data-lightbox-alt', cleanName);
                            btn.title = cleanName;
                            btn.innerHTML = `<img src="${escapeHtml(servedUrl)}" alt="${escapeHtml(cleanName)}" loading="lazy" decoding="async" />`;
                            mediaGrid.appendChild(btn);
                        } else {
                            const pill = document.createElement('div');
                            pill.className = `agy-user-media-file ${info.cls}`;
                            pill.setAttribute('data-testid', 'user-media-file');
                            pill.setAttribute('data-media-url', servedUrl);
                            pill.setAttribute('data-media-name', cleanName);
                            pill.title = cleanName;
                            pill.innerHTML = `<span class="agy-user-media-ext">${escapeHtml(info.badge)}</span><span class="agy-user-media-name">${escapeHtml(cleanName)}</span>`;
                            mediaGrid.appendChild(pill);
                        }
                    }
                    return '';
                })
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            textDiv.textContent = stripped;
            if (!stripped && !userCard.querySelector('.agy-user-badges, [data-testid="user-quote-block"]')) {
                userCard.style.display = 'none';
            }
        }
    }

    if (userCard.querySelector('[data-testid="user-quote-block"]')) return;
    if (!textDiv) return;
    const raw = textDiv.textContent || '';
    if (!raw.startsWith('>') && !raw.startsWith('```')) return;

    const paragraphs = raw.split(/\n{2,}/);
    const frag = document.createDocumentFragment();
    let convertedAny = false;

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('>')) {
            const cleanLines = trimmed
                .split('\n')
                .map(ln => ln.replace(/^>\s?/, ''))
                .join('\n')
                .trim();
            if (cleanLines) {
                const bq = document.createElement('blockquote');
                bq.className = 'agy-user-quote-block';
                bq.setAttribute('data-testid', 'user-quote-block');
                bq.innerHTML = `
                    <div class="agy-user-quote-label">❝ Quoted Response</div>
                    <div class="agy-user-quote-text">${escapeHtml(cleanLines)}</div>
                `;
                frag.appendChild(bq);
                convertedAny = true;
                continue;
            }
        } else if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
            const innerCode = trimmed.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '');
            if (innerCode.trim()) {
                const cq = document.createElement('div');
                cq.className = 'agy-user-quote-block is-code';
                cq.setAttribute('data-testid', 'user-quote-block');
                cq.innerHTML = `
                    <div class="agy-user-quote-label">&lt;/&gt; Quoted Code</div>
                    <pre class="agy-user-quote-code"><code>${escapeHtml(innerCode)}</code></pre>
                `;
                frag.appendChild(cq);
                convertedAny = true;
                continue;
            }
        }
        const replyDiv = document.createElement('div');
        replyDiv.className = 'whitespace-pre-wrap agy-user-text' + (convertedAny ? ' agy-quote-specific-answer' : '');
        replyDiv.textContent = trimmed;
        frag.appendChild(replyDiv);
    }

    if (convertedAny) {
        textDiv.replaceWith(frag);
    }
}

// --- User & Assistant Turn Quote, Quote Parts & Copy Buttons ---
function setupMessageCopyButtons() {
    chatContent.querySelectorAll('.agy-user-turn, [role="article"][aria-label*="User" i]').forEach(node => {
        enhanceFallbackUserQuotes(node.querySelector('.agy-user-card') || node);
        if (node.querySelector('.user-copy-btn')) return;
        const textNodes = Array.from(node.querySelectorAll('.agy-user-text'));
        const raw = textNodes.length
            ? textNodes.map(t => (t.textContent || '').trim()).filter(Boolean).join('\n\n')
            : (node.querySelector('.whitespace-pre-wrap')?.textContent || '').trim();
        if (!raw) return;

        const btn = document.createElement('button');
        btn.className = 'user-copy-btn';
        btn.type = 'button';
        btn.textContent = 'Copy';
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (await copyToClipboard(raw)) {
                triggerHaptic('success');
                showToast('Prompt copied');
            }
        });
        node.appendChild(btn);
    });

    let aiTurnNodes = Array.from(chatContent.querySelectorAll('.agy-ai-turn, .agy-delegated-task-card'));
    if (aiTurnNodes.length === 0) {
        // Fallback for legacy CDP DOM snapshots
        aiTurnNodes = Array.from(
            chatContent.querySelectorAll('[role="article"][aria-label*="Assistant" i], [class*="assistant-message"]')
        );
    }

    aiTurnNodes.forEach(node => {
        if (node.querySelector('.agy-turn-actions')) return;
        const isNativeHubCard =
            node.classList.contains('agy-ai-turn') || node.classList.contains('agy-delegated-task-card');
        const mdBody = isNativeHubCard
            ? node.querySelector('.agy-markdown-body, .agy-delegated-body')
            : node.querySelector('.agy-markdown-body, .agy-delegated-body') || node;
        if (!mdBody) return;
        const fullText = extractCleanNodeText(mdBody);
        if (!fullText) return;

        const sourceLabel =
            node.getAttribute('data-quote-source') ||
            node.querySelector('.agy-model-meta')?.textContent?.trim() ||
            'Response';
        const blocks = extractResponseBlocks(mdBody);

        const actionsBar = document.createElement('div');
        actionsBar.className = 'agy-turn-actions';

        const quoteBtn = document.createElement('button');
        quoteBtn.className = 'ai-quote-btn';
        quoteBtn.type = 'button';
        quoteBtn.setAttribute('data-testid', 'quote-response-btn');
        quoteBtn.textContent = '❝ Quote & Reply';
        quoteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addQuoteToComposer({
                content: extractCleanNodeText(mdBody) || fullText,
                label: 'Quote',
                sourceLabel
            });
            showToast('Quoted response — write your specific answer');
        });
        actionsBar.appendChild(quoteBtn);

        if (blocks.length >= 2) {
            const partsBtn = document.createElement('button');
            partsBtn.className = 'ai-quote-parts-btn';
            partsBtn.type = 'button';
            partsBtn.setAttribute('data-testid', 'quote-parts-btn');
            partsBtn.textContent = `☷ Quote Parts (${blocks.length})`;
            partsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const liveBlocks = extractResponseBlocks(mdBody);
                openQuotePartsModal(liveBlocks.length ? liveBlocks : blocks, sourceLabel);
            });
            actionsBar.appendChild(partsBtn);
        }

        const copyBtn = document.createElement('button');
        copyBtn.className = 'ai-copy-btn';
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (await copyToClipboard(extractCleanNodeText(mdBody) || fullText)) {
                triggerHaptic('success');
                showToast('Response copied');
            }
        });
        actionsBar.appendChild(copyBtn);

        node.appendChild(actionsBar);
    });
}

async function copyToClipboard(text) {
    try {
        if (window.AndroidBridge && typeof window.AndroidBridge.copyText === 'function') {
            window.AndroidBridge.copyText(text);
            return true;
        }
    } catch (e) {}

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {}
    }

    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch (e) {
        return false;
    }
}

// --- Scroll, Subagent Navigation & Interactive Hub Approvals/Questions ---
function getScrollContainer() {
    return chatContent || chatContainer;
}

function scrollToBottom(smooth = false) {
    const scroller = getScrollContainer();
    if (!scroller) return;
    if (smooth) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
    } else {
        scroller.scrollTop = scroller.scrollHeight;
    }
}

function setupScrollAndStreamInteractions() {
    let scrollEndTimer = null;

    const handleScroll = () => {
        const scroller = getScrollContainer();
        if (!scroller) return;

        userIsScrolling = true;
        userScrollLockUntil = Date.now() + USER_SCROLL_LOCK_DURATION;

        const currentPos = scroller.scrollTop;
        const maxScroll = scroller.scrollHeight - scroller.clientHeight;
        const isNearBottom = maxScroll - currentPos < 140;

        if (scrollToBottomBtn) {
            scrollToBottomBtn.classList.toggle('show', maxScroll > 180 && !isNearBottom);
        }

        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
            userIsScrolling = false;
            if (pendingSnapshotData) {
                const nextData = pendingSnapshotData;
                pendingSnapshotData = null;
                renderSnapshotData(nextData);
            }
        }, 420);
    };

    if (chatContent) chatContent.addEventListener('scroll', handleScroll, { passive: true });

    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerHaptic('light');
            userScrollLockUntil = 0;
            userIsScrolling = false;
            scrollToBottom(true);
        });
    }

    chatContent.addEventListener('click', async (e) => {
        if (e.target.closest('#newChatFromEmptyBtn')) {
            startNewChat();
            return;
        }

        // 1. Option selection inside an ask_question card
        const qOptBtn = e.target.closest('.agy-question-opt-btn');
        if (qOptBtn && !qOptBtn.disabled) {
            e.preventDefault();
            e.stopPropagation();
            triggerHaptic('light');
            userScrollLockUntil = Date.now() + 8000;
            const isMulti = qOptBtn.getAttribute('data-multi') === '1';
            const block = qOptBtn.closest('.agy-question-block');
            if (!isMulti && block) {
                block.querySelectorAll('.agy-question-opt-btn').forEach(b => b.classList.remove('selected'));
            }
            qOptBtn.classList.toggle('selected');
            return;
        }

        // 2. Hub RPC Approve / Deny or Submit Question
        const hubInteractBtn = e.target.closest('[data-hub-interact]');
        if (hubInteractBtn) {
            e.preventDefault();
            e.stopPropagation();
            const actionType = hubInteractBtn.getAttribute('data-hub-interact');
            triggerHaptic('medium');
            hubInteractBtn.disabled = true;

            try {
                if (actionType === 'decision') {
                    const cascadeId = hubInteractBtn.getAttribute('data-cascade-id');
                    const trajectoryId = hubInteractBtn.getAttribute('data-trajectory-id');
                    const stepIndex = parseInt(hubInteractBtn.getAttribute('data-step-index') || '0', 10);
                    const interactionCase = hubInteractBtn.getAttribute('data-interaction-case') || 'permission';
                    const allow = hubInteractBtn.getAttribute('data-allow') === 'true';

                    const res = await fetchWithAuth('/hub-interact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cascadeId, trajectoryId, stepIndex, interactionCase, allow })
                    });
                    const out = await res.json();
                    if (out.success) {
                        showToast(allow ? 'Approved action' : 'Denied action');
                        lastHash = '';
                        await loadSnapshot();
                    } else {
                        showToast(out.error || 'Failed to submit decision');
                    }
                } else if (actionType === 'submit-question') {
                    const qCard = hubInteractBtn.closest('[data-hub-question-card]');
                    if (qCard) {
                        const cascadeId = qCard.getAttribute('data-cascade-id');
                        const trajectoryId = qCard.getAttribute('data-trajectory-id');
                        const stepIndex = parseInt(qCard.getAttribute('data-step-index') || '0', 10);
                        const blocks = Array.from(qCard.querySelectorAll('.agy-question-block'));

                        const responses = blocks.map(blk => {
                            const question = blk.getAttribute('data-question-text') || '';
                            const selectedOptionIds = Array.from(blk.querySelectorAll('.agy-question-opt-btn.selected')).map(
                                b => b.getAttribute('data-opt-id')
                            );
                            const writeInResponse = (blk.querySelector('.agy-question-writein')?.value || '').trim();
                            return {
                                question,
                                selectedOptionIds,
                                writeInResponse,
                                skipped: selectedOptionIds.length === 0 && !writeInResponse
                            };
                        });

                        const res = await fetchWithAuth('/hub-interact', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                cascadeId,
                                trajectoryId,
                                stepIndex,
                                interactionCase: 'askQuestion',
                                responses,
                                cancelled: false
                            })
                        });
                        const out = await res.json();
                        if (out.success) {
                            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                                document.activeElement.blur();
                            }
                            showToast('Answer submitted');
                            userScrollLockUntil = 0;
                            lastHash = '';
                            await loadSnapshot(false, true);
                        } else {
                            showToast(out.error || 'Failed to submit answer');
                        }
                    }
                }
            } catch (err) {
                showToast('Error sending interaction');
            } finally {
                hubInteractBtn.disabled = false;
            }
            return;
        }

        // 3. Subagent / conversation deep-link navigation & Side Question insert-to-main
        const insertSideQBtn = e.target.closest('[data-insert-side-question]');
        if (insertSideQBtn) {
            e.preventDefault();
            e.stopPropagation();
            const parentCid = insertSideQBtn.getAttribute('data-insert-side-question') || '';
            const sideCid = insertSideQBtn.getAttribute('data-side-question-id') || '';
            const sideTitle = insertSideQBtn.getAttribute('data-side-question-title') || 'Side Question';
            const sideAns = insertSideQBtn.getAttribute('data-side-question-answer') || '';
            if (parentCid && sideAns) {
                triggerHaptic('medium');
                await selectChat({ cascadeId: parentCid });
                const safeId = sideCid.replace(/[\[\])\r\n]/g, ' ').trim();
                const safeTitle = sideTitle.replace(/[\[\]\r\n]/g, ' ').trim();
                addQuoteToComposer(
                    {
                        content: sideAns,
                        label: 'Quote',
                        customLabel: safeId ? `Side question (conversation ${safeId}): ${safeTitle}` : 'Quote',
                        sourceLabel: `/btw · ${safeTitle}`
                    },
                    'answer'
                );
                showToast('Side question answer quoted into main chat');
            }
            return;
        }

        const cascadeTarget = e.target.closest('[data-select-cascade]');
        if (cascadeTarget) {
            e.preventDefault();
            e.stopPropagation();
            const targetCid = cascadeTarget.getAttribute('data-select-cascade');
            if (targetCid) {
                triggerHaptic('medium');
                selectChat({ cascadeId: targetCid });
            }
            return;
        }

        const openSwarmBtn = e.target.closest('[data-open-swarm-ui], a[href^="sidecar://"]');
        if (openSwarmBtn) {
            e.preventDefault();
            e.stopPropagation();
            triggerHaptic('medium');
            let targetSwarmId = openSwarmBtn.getAttribute('data-swarm-id') || '';
            const rawHref = openSwarmBtn.getAttribute('href') || openSwarmBtn.getAttribute('data-sidecar-uri') || '';
            if (!targetSwarmId && rawHref.toLowerCase().startsWith('sidecar://')) {
                try {
                    const qIdx = rawHref.indexOf('?');
                    if (qIdx !== -1) {
                        const sp = new URLSearchParams(rawHref.slice(qIdx + 1));
                        targetSwarmId = sp.get('swarm') || sp.get('swarmId') || '';
                    }
                } catch {}
            }
            openSwarmUiSection(targetSwarmId);
            return;
        }

        const openIdeUriBtn = e.target.closest('[data-open-ide-uri]');
        if (openIdeUriBtn) {
            e.preventDefault();
            e.stopPropagation();
            const rawUri = openIdeUriBtn.getAttribute('data-open-ide-uri') || '';
            if (rawUri) {
                triggerHaptic('medium');
                openFileInIdeSection(rawUri);
            }
            return;
        }

        // 3.4. User Media Thumbnails & Attached File Cards -> Lightbox or Direct Stream
        const mediaThumbBtn = e.target.closest('.agy-user-media-thumb[data-lightbox-src]');
        if (mediaThumbBtn) {
            e.preventDefault();
            e.stopPropagation();
            triggerHaptic('light');
            const src = mediaThumbBtn.getAttribute('data-lightbox-src') || '';
            const alt = mediaThumbBtn.getAttribute('data-lightbox-alt') || 'Image Attachment';
            if (src) {
                openMediaLightbox({ src, title: alt, mimeType: 'image/png' });
            }
            return;
        }

        const mediaFileCard = e.target.closest('.agy-user-media-file');
        if (mediaFileCard) {
            e.preventDefault();
            e.stopPropagation();
            triggerHaptic('light');
            const mediaUrl = mediaFileCard.getAttribute('data-media-url') || '';
            const mediaMime = (mediaFileCard.getAttribute('data-media-mime') || '').toLowerCase();
            const mediaName = mediaFileCard.getAttribute('data-media-name') || 'Attachment';
            openMediaLightbox({ src: mediaUrl, title: mediaName, mimeType: mediaMime });
            return;
        }

        // 3.5. Desktop workspace file:/// links in markdown -> copy path cleanly on mobile
        const fileAnchor = e.target.closest('a[href^="file://"]');
        if (fileAnchor) {
            const rawHref = fileAnchor.getAttribute('href') || '';
            if (!rawHref.toLowerCase().startsWith('file:///android_asset/')) {
                e.preventDefault();
                e.stopPropagation();
                let cleanPath = rawHref.replace(/^file:\/\/\/?/i, '');
                try { cleanPath = decodeURIComponent(cleanPath); } catch {}
                if (await copyToClipboard(cleanPath)) {
                    triggerHaptic('light');
                    showToast('Copied workspace file path');
                }
                return;
            }
        }

        if (
            e.target.closest(
                'summary, details, .code-block-toolbar, .user-copy-btn, .ai-copy-btn, .ai-quote-btn, .ai-quote-parts-btn, .agy-turn-actions, .mobile-copy-btn, .code-expand-btn, .code-quote-btn, .agy-question-writein, .agy-user-media-thumb, .agy-user-media-file'
            )
        ) {
            userScrollLockUntil = Date.now() + 4000;
            return;
        }

        // 4. Fallback: Forward approval/action button clicks in CDP mode
        const btn = e.target.closest('button, [role="button"]');
        if (btn && !IS_OFFLINE_PREVIEW) {
            const label = (btn.innerText || btn.getAttribute('aria-label') || '').toLowerCase();
            if (['allow', 'accept', 'reject', 'deny', 'confirm', 'run', 'apply', 'proceed'].some(k => label.includes(k))) {
                triggerHaptic('medium');
                await fetchWithAuth('/click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        selector: btn.tagName.toLowerCase(),
                        index: 0,
                        textContent: (btn.innerText || '').trim().split('\n')[0]
                    })
                }).catch(() => {});
                setTimeout(loadSnapshot, 350);
            }
        }
    });

    chatContent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList?.contains('agy-question-writein')) {
            e.preventDefault();
            const qCard = e.target.closest('[data-hub-question-card]');
            const submitBtn = qCard?.querySelector('[data-hub-interact="submit-question"]');
            if (submitBtn && !submitBtn.disabled) {
                e.target.blur();
                submitBtn.click();
            }
        }
    });
}

// --- Slash Command Badge, Client Controls, Autocomplete & Full Catalog Sheet ---
function getSlashBadgeInfo(cmd) {
    if (cmd.clientAction || cmd.type === 'CONTROL') {
        return { label: 'Control', cls: 'badge-control' };
    }
    if (cmd.type === 'WORKFLOW') {
        return { label: 'Workflow', cls: 'badge-workflow' };
    }
    if (cmd.type === 'MCP_PROMPT') {
        return { label: cmd.pluginDisplayName ? `MCP · ${cmd.pluginDisplayName}` : 'MCP', cls: 'badge-workflow' };
    }
    if (cmd.pluginDisplayName) {
        return { label: cmd.pluginDisplayName, cls: 'badge-plugin' };
    }
    if (cmd.type === 'SYSTEM') {
        return { label: 'System', cls: 'badge-system' };
    }
    return { label: 'Skill', cls: '' };
}

function searchSlashCommands(query = '', categoryFilter = 'All') {
    const q = String(query || '').trim().toLowerCase();
    const filtered = cachedSlashCommands.filter(cmd => {
        if (categoryFilter !== 'All') {
            const cat = cmd.category || (cmd.clientAction ? 'Control' : cmd.type === 'SYSTEM' ? 'System' : 'Skill');
            if (categoryFilter === 'Workflow' && cat !== 'Workflow' && cat !== 'MCP') return false;
            else if (categoryFilter !== 'Workflow' && cat !== categoryFilter) return false;
        }
        if (!q) return true;
        const nameMatch = (cmd.name || '').toLowerCase().includes(q);
        const descMatch = (cmd.description || '').toLowerCase().includes(q);
        const pluginMatch = (cmd.pluginDisplayName || cmd.pluginName || '').toLowerCase().includes(q);
        const catMatch = (cmd.category || cmd.type || '').toLowerCase().includes(q);
        return nameMatch || descMatch || pluginMatch || catMatch;
    });

    if (!q) return filtered;

    return filtered.sort((a, b) => {
        const an = (a.name || '').toLowerCase();
        const bn = (b.name || '').toLowerCase();
        const aExact = an === q ? 0 : an.startsWith(q) ? 1 : an.includes(q) ? 2 : 3;
        const bExact = bn === q ? 0 : bn.startsWith(q) ? 1 : bn.includes(q) ? 2 : 3;
        if (aExact !== bExact) return aExact - bExact;
        return 0;
    });
}

async function executeClientSlashControl(cmdName, argStr = '') {
    const cmd = String(cmdName || '').toLowerCase();
    const arg = String(argStr || '').trim();

    if (cmd === 'clear') {
        pendingQuotes = [];
        pendingAttachments = [];
        clearSavedComposerDraft();
        renderQuotePreviews();
        renderAttachmentPreviews();
        messageInput.value = '';
        messageInput.style.height = 'auto';
        syncActiveSlashChips();
        hideSlashMenu();
        showToast('Cleared composer');
        return true;
    }

    if (cmd === 'quota') {
        await openQuotaModal(arg.toLowerCase() === 'refresh');
        return true;
    }

    if (cmd === 'swarm-ui' || cmd === 'board') {
        const low = arg.toLowerCase();
        if (low === 'off' || low === 'close' || low === 'normal' || low === 'chat') {
            switchSurface('antigravity');
            return true;
        }
        if (['overview', 'feed', 'board', 'members', 'graph', 'raw'].includes(low)) {
            await openSwarmUiSection('', low === 'board' ? 'feed' : low);
            return true;
        }
        if (currentSurface === 'swarm' && !arg) {
            switchSurface('antigravity');
        } else {
            await openSwarmUiSection('');
        }
        return true;
    }

    if (cmd === 'ide') {
        if (arg) {
            const low = arg.toLowerCase();
            if (low === 'off' || low === 'normal' || low === 'hub' || low === 'antigravity') {
                switchSurface('antigravity');
                await switchBackendTarget('antigravity');
                return true;
            }
            if (low === 'desktop' || low === 'open') {
                await openInDesktopIde();
                return true;
            }
            await openFileInIdeSection(arg);
            return true;
        }
        switchSurface(currentSurface === 'ide' ? 'antigravity' : 'ide');
        return true;
    }

    if (cmd === 'find') {
        openChatFindBar(arg);
        return true;
    }

    if (cmd === 'export') {
        await exportActiveConversation();
        return true;
    }

    if (cmd === 'prompts') {
        openRecentPromptsSheet();
        return true;
    }

    if (cmd === 'theme') {
        const desired =
            arg.toLowerCase() === 'light'
                ? 'light'
                : arg.toLowerCase() === 'dark'
                  ? 'dark'
                  : document.body.classList.contains('theme-light')
                    ? 'dark'
                    : 'light';
        applyTheme(desired);
        showToast(`Switched to ${desired === 'light' ? 'Light' : 'Dark Obsidian'} theme`);
        return true;
    }

    if (cmd === 'history') {
        openSidebarDrawer();
        return true;
    }

    if (cmd === 'stop') {
        if (IS_OFFLINE_PREVIEW) {
            showToast('Offline preview mode · No active agent running');
            return true;
        }
        try {
            await fetchWithAuth('/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cascadeId: activeCascadeId })
            });
            showToast('Stop signal sent');
            updateGeneratingUI(false);
            setTimeout(() => loadSnapshot(), 400);
        } catch {}
        return true;
    }

    if (cmd === 'new') {
        await startNewChat();
        if (arg) {
            messageInput.value = arg;
            syncActiveSlashChips();
            await sendMessage();
        }
        return true;
    }

    if (cmd === 'fast') {
        await executeClientSlashControl('mode', 'Fast');
        if (arg) {
            messageInput.value = arg;
            syncActiveSlashChips();
            await sendMessage();
        }
        return true;
    }

    if (cmd === 'model') {
        if (arg) {
            const found = resolveModelByQuery(arg, cachedModelDetails);
            if (found) {
                await applyModelSelection(found.label);
                return true;
            }
        }
        await openModelSelector();
        return true;
    }

    if (cmd === 'mode') {
        if (arg) {
            const matchedMode = AGENT_MODES.find(m => m.id.toLowerCase() === arg.toLowerCase());
            if (matchedMode) {
                currentMode = matchedMode.id;
                if (modeText) modeText.textContent = matchedMode.title;
                if (modeBtn) modeBtn.classList.toggle('active', matchedMode.id === 'Autonomous' || matchedMode.id === 'Planning');
                if (!IS_OFFLINE_PREVIEW) {
                    const res = await fetchWithAuth('/set-mode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: matchedMode.id })
                    });
                    const data = await res.json().catch(() => ({}));
                    if (data.selectedModel) {
                        const modelChanged = data.selectedModel !== currentModel;
                        currentModel = data.selectedModel;
                        if (modelText) {
                            modelText.textContent = formatCompactModelName(currentModel);
                            modelText.title = currentModel;
                        }
                        if (modelChanged) {
                            fetchQuotaSummary(false);
                        }
                    }
                }
                showToast(`Mode: ${matchedMode.title}`);
                return true;
            }
        }
        openModeSelector();
        return true;
    }

    return false;
}

function hideSlashMenu() {
    activeSlashMenuIndex = 0;
    slashMenuKeyboardNavigated = false;
    if (slashMenuPopup) {
        slashMenuPopup.style.display = 'none';
        slashMenuPopup.innerHTML = '';
    }
}

function setActiveSlashMenuItem(nextIdx) {
    if (!slashMenuPopup) return;
    const items = Array.from(slashMenuPopup.querySelectorAll('.slash-menu-item'));
    if (items.length === 0) return;
    const wrapped = ((nextIdx % items.length) + items.length) % items.length;
    activeSlashMenuIndex = wrapped;
    items.forEach((el, idx) => {
        el.classList.toggle('active', idx === wrapped);
    });
    items[wrapped]?.scrollIntoView({ block: 'nearest' });
}

function updateSlashMenuFromInput() {
    if (!slashMenuPopup || !messageInput) return;
    const val = messageInput.value || '';
    const caret = messageInput.selectionStart ?? val.length;
    const upToCaret = val.slice(0, caret);

    // Match active `/token` at start of prompt or preceded by whitespace / '('
    const match = /(?:^|[\s(])\/([a-zA-Z0-9_.:-]*)$/.exec(upToCaret);
    if (!match) {
        hideSlashMenu();
        return;
    }

    const query = match[1].toLowerCase();
    const matches = searchSlashCommands(query, 'All');

    if (matches.length === 0) {
        hideSlashMenu();
        return;
    }

    activeSlashMenuIndex = 0;
    slashMenuKeyboardNavigated = false;

    const headerHtml = `
        <div class="slash-menu-header">
            <span class="slash-menu-header-title">Slash Actions · ${matches.length} ${matches.length === 1 ? 'match' : 'available'}</span>
            <button type="button" class="slash-menu-browse-btn" data-open-full-slash="1">Browse All →</button>
        </div>
    `;

    const itemsHtml = matches
        .map((cmd, idx) => {
            const badge = getSlashBadgeInfo(cmd);
            return `
                <button type="button"
                        class="slash-menu-item ${idx === 0 ? 'active' : ''}"
                        data-slash-name="${escapeHtml(cmd.name)}"
                        data-slash-client="${cmd.clientAction ? '1' : '0'}">
                    <div class="slash-menu-left">
                        <span class="slash-menu-cmd">/${escapeHtml(cmd.name)}</span>
                        <span class="slash-menu-desc">${escapeHtml(cmd.description || '')}</span>
                    </div>
                    <span class="slash-menu-badge ${badge.cls}">${escapeHtml(badge.label)}</span>
                </button>
            `;
        })
        .join('');

    slashMenuPopup.innerHTML = headerHtml + itemsHtml;
    slashMenuPopup.style.display = 'flex';

    const browseAllBtn = slashMenuPopup.querySelector('[data-open-full-slash]');
    if (browseAllBtn) {
        browseAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const prefixLen = match[0].length - match[1].length - 1;
            const before = val.slice(0, match.index + prefixLen);
            const after = val.slice(caret);
            messageInput.value = `${before}${after}`;
            hideSlashMenu();
            openSlashActionsSheet(query);
        });
    }

    slashMenuPopup.querySelectorAll('[data-slash-name]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const chosen = btn.getAttribute('data-slash-name') || '';
            const isClientControl = btn.getAttribute('data-slash-client') === '1';
            const leadOffset = match[0].length - match[1].length - 1;
            const prefixEnd = match.index + leadOffset;
            const before = val.slice(0, prefixEnd);
            const after = val.slice(caret);

            if (
                isClientControl &&
                !before.trim() &&
                !after.trim() &&
                pendingQuotes.length === 0 &&
                pendingAttachments.length === 0
            ) {
                messageInput.value = '';
                messageInput.style.height = 'auto';
                hideSlashMenu();
                await executeClientSlashControl(chosen, '');
                return;
            }

            messageInput.value = `${before}/${chosen} ${after.replace(/^\s+/, '')}`;
            hideSlashMenu();
            messageInput.focus();
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });
}

async function openSlashActionsSheet(initialQuery = '') {
    triggerHaptic('light');
    hideSlashMenu();
    if (!IS_OFFLINE_PREVIEW) {
        await fetchSlashCommandsCatalog();
    }

    modalTitle.textContent = `All / Actions (${cachedSlashCommands.length})`;
    modalList.innerHTML = '';

    const catCounts = {
        All: cachedSlashCommands.length,
        System: cachedSlashCommands.filter(c => (c.category || '') === 'System' || (!c.category && c.type === 'SYSTEM')).length,
        Skill: cachedSlashCommands.filter(c => (c.category || (c.type === 'SKILL' ? 'Skill' : '')) === 'Skill').length,
        Plugin: cachedSlashCommands.filter(c => c.category === 'Plugin').length,
        Workflow: cachedSlashCommands.filter(c => c.category === 'Workflow' || c.category === 'MCP').length,
        Control: cachedSlashCommands.filter(c => c.clientAction || c.category === 'Control').length
    };

    const categories = [
        { id: 'All', label: `All (${catCounts.All})` },
        { id: 'System', label: `System (${catCounts.System})` },
        { id: 'Skill', label: `Skills (${catCounts.Skill})` },
        ...(catCounts.Plugin > 0 ? [{ id: 'Plugin', label: `Plugins (${catCounts.Plugin})` }] : []),
        ...(catCounts.Workflow > 0 ? [{ id: 'Workflow', label: `Workflows & MCP (${catCounts.Workflow})` }] : []),
        { id: 'Control', label: `Controls (${catCounts.Control})` }
    ];

    let activeCat = 'All';
    let currentQuery = initialQuery || '';

    const controlsWrap = document.createElement('div');
    controlsWrap.className = 'slash-sheet-controls';
    controlsWrap.innerHTML = `
        <input type="text"
               class="slash-sheet-search"
               id="slashSheetSearchInput"
               data-testid="slash-sheet-search"
               placeholder="Search /boost, /swarm, /compact, skills, plugins…"
               value="${escapeHtml(currentQuery)}" />
        <div class="slash-category-tabs">
            ${categories
                .map(
                    cat => `
                <button type="button"
                        class="slash-cat-tab ${cat.id === activeCat ? 'active' : ''}"
                        data-slash-cat="${escapeHtml(cat.id)}">
                    ${escapeHtml(cat.label)}
                </button>
            `
                )
                .join('')}
        </div>
    `;

    const listContainer = document.createElement('div');
    listContainer.className = 'slash-sheet-list';

    const renderFilteredSheetItems = () => {
        const items = searchSlashCommands(currentQuery, activeCat);
        if (items.length === 0) {
            listContainer.innerHTML = `<div class="history-state-container" style="padding: 20px 10px;"><p>No matching / actions found</p></div>`;
            return;
        }
        listContainer.innerHTML = items
            .map(cmd => {
                const badge = getSlashBadgeInfo(cmd);
                return `
                    <button type="button"
                            class="slash-sheet-item"
                            data-testid="slash-sheet-item"
                            data-sheet-slash="${escapeHtml(cmd.name)}"
                            data-sheet-client="${cmd.clientAction ? '1' : '0'}">
                        <div class="slash-sheet-item-top">
                            <span class="slash-sheet-item-name">/${escapeHtml(cmd.name)}</span>
                            <span class="slash-menu-badge ${badge.cls}">${escapeHtml(badge.label)}</span>
                        </div>
                        <div class="slash-sheet-item-desc">${escapeHtml(cmd.description || '')}</div>
                    </button>
                `;
            })
            .join('');

        listContainer.querySelectorAll('[data-sheet-slash]').forEach(btn => {
            btn.addEventListener('click', async () => {
                triggerHaptic('medium');
                const chosen = btn.getAttribute('data-sheet-slash') || '';
                const isClient = btn.getAttribute('data-sheet-client') === '1';
                closeModal();

                const cur = (messageInput.value || '').trim();
                if (isClient && !cur && pendingQuotes.length === 0 && pendingAttachments.length === 0) {
                    await executeClientSlashControl(chosen, '');
                    return;
                }

                toggleOrInsertSlashAction(`/${chosen}`, { allowToggleOff: false });
                messageInput.focus();
                messageInput.style.height = 'auto';
                messageInput.style.height = Math.min(messageInput.scrollHeight, 130) + 'px';
                hideSlashMenu();
            });
        });
    };

    modalList.appendChild(controlsWrap);
    modalList.appendChild(listContainer);
    renderFilteredSheetItems();

    const searchInput = controlsWrap.querySelector('#slashSheetSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentQuery = searchInput.value || '';
            renderFilteredSheetItems();
        });
    }

    controlsWrap.querySelectorAll('[data-slash-cat]').forEach(tab => {
        tab.addEventListener('click', () => {
            triggerHaptic('light');
            activeCat = tab.getAttribute('data-slash-cat') || 'All';
            controlsWrap.querySelectorAll('[data-slash-cat]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFilteredSheetItems();
        });
    });

    modalOverlay.classList.add('show');
}

function syncActiveSlashChips() {
    const val = messageInput?.value || '';
    document.querySelectorAll('.action-chip.slash-chip').forEach(chip => {
        const act = chip.getAttribute('data-action') || '';
        if (!act.startsWith('/')) return;
        const escaped = act.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const present = new RegExp(`(?:^|\\s|\\()${escaped}(?=\\?|$|[\\s).,!?:;])`, 'i').test(val);
        chip.classList.toggle('is-active', present);
    });
}

function toggleOrInsertSlashAction(rawToken, { allowToggleOff = false } = {}) {
    if (!messageInput || !rawToken) return;
    const token = rawToken.startsWith('/') ? rawToken : `/${rawToken}`;
    const cur = messageInput.value || '';

    // Parse existing leading `/command` tokens in exact insertion order
    const leadingTokens = [];
    let rest = cur;
    const leadRx = /^\s*(\/[a-zA-Z0-9][a-zA-Z0-9_.:-]*(?:\?[^\s)]+)?)(?=\s|$)/;
    while (true) {
        const m = leadRx.exec(rest);
        if (!m) break;
        leadingTokens.push(m[1]);
        rest = rest.slice(m[0].length);
    }
    const cleanRest = rest.replace(/^[ \t]+/, '');

    const existingLeadIdx = leadingTokens.findIndex(
        t => t.split('?')[0].toLowerCase() === token.split('?')[0].toLowerCase()
    );

    if (existingLeadIdx !== -1) {
        if (allowToggleOff) {
            leadingTokens.splice(existingLeadIdx, 1);
        }
    } else {
        const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const presentMidText = new RegExp(`(?:^|\\s)${escaped}(?=\\s|$)`, 'i').test(cleanRest);
        if (!presentMidText) {
            leadingTokens.push(token);
        }
    }

    const prefix = leadingTokens.join(' ');
    if (prefix && cleanRest) {
        messageInput.value = `${prefix} ${cleanRest}`;
    } else if (prefix) {
        messageInput.value = `${prefix} `;
    } else {
        messageInput.value = cleanRest;
    }

    const endPos = messageInput.value.length;
    try {
        messageInput.setSelectionRange(endPos, endPos);
    } catch {}
    syncActiveSlashChips();
}
// --- Attachments & Prompt Submission ---
let pendingAttachments = [];
let pendingFileReads = [];
let isSendingPrompt = false;

function formatAttachmentBytes(bytes) {
    const n = Number(bytes || 0);
    if (!Number.isFinite(n) || n <= 0) return '';
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    if (n >= 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
    return `${n} B`;
}

function isPlainTextFile(file) {
    const mime = (file.type || '').toLowerCase();
    if (mime.startsWith('text/')) return true;
    if (['application/json', 'application/javascript', 'application/xml', 'application/x-sh'].includes(mime)) {
        return true;
    }
    const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
    return [
        'txt', 'md', 'markdown', 'json', 'jsonc', 'jsonl', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx',
        'py', 'kt', 'kts', 'java', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'cs', 'go', 'rs',
        'rb', 'php', 'css', 'scss', 'less', 'html', 'htm', 'xml', 'yaml', 'yml',
        'toml', 'ini', 'env', 'conf', 'cfg', 'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1',
        'sql', 'csv', 'tsv', 'log', 'proto', 'graphql', 'gql', 'vue', 'svelte', 'dart', 'lua', 'r', 'gradle'
    ].includes(ext);
}

function renderAttachmentPreviews() {
    const bar = document.getElementById('attachmentPreviewBar');
    if (!bar) return;
    if (pendingAttachments.length === 0) {
        bar.style.display = 'none';
        bar.innerHTML = '';
        return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = pendingAttachments.map((att, idx) => {
        const isImg = att.isImage;
        const badgeInfo = getClientAttachmentBadgeInfo(att.name, att.type);
        const thumb =
            isImg && att.dataUrl
                ? `<img src="${att.dataUrl}" alt="${escapeHtml(att.name)}" data-preview-att-idx="${idx}">`
                : `<span class="attachment-chip-ext">${escapeHtml(badgeInfo.badge)}</span>`;
        const sizeLabel = formatAttachmentBytes(att.sizeBytes);
        return `
            <div class="attachment-chip ${att.uploading ? 'is-uploading' : ''}" data-testid="attached-context-pill" data-chip-att-idx="${idx}">
                ${thumb}
                <div class="attachment-chip-meta">
                    <span class="attachment-chip-name" title="${escapeHtml(att.name)}">${escapeHtml(att.name)}</span>
                    ${sizeLabel ? `<span class="attachment-chip-size">${escapeHtml(sizeLabel)}</span>` : ''}
                </div>
                ${att.uploading ? `<span class="attachment-chip-spinner" title="Staging file…"></span>` : ''}
                <span class="attachment-chip-remove" data-remove-idx="${idx}" role="button" aria-label="Remove attachment">✕</span>
            </div>
        `;
    }).join('');

    bar.querySelectorAll('[data-chip-att-idx]').forEach(chipEl => {
        chipEl.addEventListener('click', (e) => {
            if (e.target.closest('[data-remove-idx]')) return;
            e.stopPropagation();
            const idx = parseInt(chipEl.getAttribute('data-chip-att-idx') || '0', 10);
            const att = pendingAttachments[idx];
            if (att) {
                openMediaLightbox({
                    src: att.dataUrl || (att.serverData?.filePath ? `/hub/media?uri=${encodeURIComponent(att.serverData.filePath)}` : ''),
                    title: att.name,
                    mimeType: att.type || (att.isImage ? 'image/png' : 'application/octet-stream'),
                    textContent: att.textContent || ''
                });
            }
        });
    });

    bar.querySelectorAll('[data-remove-idx]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(el.getAttribute('data-remove-idx'), 10);
            pendingAttachments.splice(idx, 1);
            renderAttachmentPreviews();
        });
    });
}

async function sendMessage() {
    if (isSendingPrompt) return;
    isSendingPrompt = true;
    sendBtn.disabled = true;

    try {
        if (pendingFileReads.length > 0) {
            await Promise.allSettled(pendingFileReads);
        }
        let message = (messageInput.value || '').trim();
        if (!message && pendingAttachments.length === 0 && pendingQuotes.length === 0) return;

        hideSlashMenu();
        triggerHaptic('medium');

        // Intercept client-side `/` control commands (/new, /stop, /theme, /clear, /history, /model, /mode, /fast, /quota, /swarm-ui, /board, /ide, /find, /export, /prompts)
        const clientMatch = /^\/(new|stop|theme|clear|history|model|mode|fast|quota|swarm-ui|board|ide|find|export|prompts)(?:\s+([\s\S]*))?$/i.exec(message);
        if (clientMatch) {
            const ctrlName = clientMatch[1].toLowerCase();
            const ctrlArg = (clientMatch[2] || '').trim();
            if (
                (ctrlName !== 'new' && ctrlName !== 'fast') ||
                (!pendingQuotes.length && !pendingAttachments.length)
            ) {
                messageInput.value = '';
                messageInput.style.height = 'auto';
                syncActiveSlashChips();
                await executeClientSlashControl(ctrlName, ctrlArg);
                return;
            }
            // `/new <prompt>` or `/fast <prompt>` when quotes or attachments are present
            if (ctrlName === 'new') {
                await startNewChat();
            } else if (ctrlName === 'fast') {
                await executeClientSlashControl('mode', 'Fast');
            }
            message = ctrlArg;
        }

        // Guard bare `/btw` with no side question, quote, or attachment
        if (/^\/btw$/i.test(message) && pendingQuotes.length === 0 && pendingAttachments.length === 0) {
            messageInput.value = '/btw ';
            syncActiveSlashChips();
            messageInput.focus();
            showToast('Enter a side question after /btw');
            return;
        }

        if (IS_OFFLINE_PREVIEW) {
            showToast('Connect to your PC Hub to send live prompts & quoted answers');
            return;
        }

        // Wait for any in-flight background /upload-attachment staging requests so server filePaths are ready
        const uploadPromises = pendingAttachments.map(a => a.uploadPromise).filter(Boolean);
        if (uploadPromises.length > 0) {
            await Promise.allSettled(uploadPromises);
        }

        const attachmentsPayload = pendingAttachments.map(att => ({
            fileName: att.name,
            name: att.name,
            fileType: att.serverData?.fileType || att.type,
            type: att.serverData?.fileType || att.type,
            filePath: att.serverData?.filePath || '',
            isImage: Boolean(att.serverData?.isImage ?? att.isImage),
            content: att.textContent || '',
            dataUrl: att.serverData?.filePath ? '' : att.dataUrl || ''
        }));

        const quotesPayload = pendingQuotes.map(q => ({
            content: q.content,
            label: q.label,
            ...(q.customLabel ? { customLabel: q.customLabel } : {}),
            ...(q.fileUri ? { fileUri: q.fileUri } : {}),
            ...(q.startLine ? { startLine: q.startLine } : {}),
            ...(q.endLine ? { endLine: q.endLine } : {}),
            sourceLabel: q.sourceLabel || '',
            answer: (q.answer || '').trim()
        }));

        if (message) {
            recordRecentPrompt(message);
        }
        clearSavedComposerDraft();

        pendingAttachments = [];
        pendingQuotes = [];
        renderAttachmentPreviews();
        renderQuotePreviews();
        messageInput.value = '';
        messageInput.style.height = 'auto';
        syncActiveSlashChips();

        let effectiveMessage = message;
        if (!serverSupportsNativeQuotes && quotesPayload.length > 0) {
            // Fallback formatting if the running server.js process has not been restarted yet
            let leadingSlashes = '';
            const leadMatch = /^(\s*\/[a-zA-Z0-9][a-zA-Z0-9_.:-]*(?:\?[^\s)]+)?(?=\s|$))+/.exec(effectiveMessage);
            if (leadMatch) {
                leadingSlashes = leadMatch[0].trim() + ' ';
                effectiveMessage = effectiveMessage.slice(leadMatch[0].length).trim();
            }
            const fallbackBlocks = quotesPayload
                .map(q => {
                    const formattedQ =
                        q.label === 'code_block'
                            ? `\`\`\`\n${q.content}\n\`\`\``
                            : q.content
                                  .split(/\r?\n/)
                                  .map(ln => `> ${ln}`)
                                  .join('\n');
                    return q.answer ? `${formattedQ}\n\n${q.answer}` : formattedQ;
                })
                .join('\n\n');
            effectiveMessage = `${leadingSlashes}${fallbackBlocks}${effectiveMessage ? `\n\n${effectiveMessage}` : ''}`.trim();
        }

        const res = await fetchWithAuth('/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: effectiveMessage,
                attachments: attachmentsPayload,
                quotes: quotesPayload,
                cascadeId: activeCascadeId
            })
        });

        const data = await res.json().catch(() => ({}));
        if (data && data.success !== false) {
            if (data.cascadeId) activeCascadeId = data.cascadeId;
            triggerHaptic('success');
            userScrollLockUntil = 0;
            lastHash = '';
            await loadSnapshot(false, true);
            setTimeout(() => loadSnapshot(), 800);
        } else {
            showToast(data?.error || 'Failed to send prompt');
        }
    } catch (e) {
        showToast('Network error sending prompt');
    } finally {
        isSendingPrompt = false;
        sendBtn.disabled = false;
    }
}

// --- New Conversation, Stop & History Sidebar ---
async function startNewChat() {
    triggerHaptic('medium');
    selectedSwarmIdOverride = '';
    cachedSwarmEtag = '';
    if (currentSurface !== 'antigravity') {
        switchSurface('antigravity');
    }
    if (IS_OFFLINE_PREVIEW) {
        showToast('Offline preview mode · Connect PC to start a new session');
        return;
    }
    try {
        const res = await fetchWithAuth('/new-chat', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            if (data.cascadeId) activeCascadeId = data.cascadeId;
            currentParentCascadeId = null;
            if (headerTitle) headerTitle.textContent = 'New Conversation';
            lastHash = '';
            showToast('New conversation ready');
            await loadSnapshot();
        }
    } catch (e) {}
}

function openSidebarDrawer() {
    triggerHaptic('light');
    historyLayer.classList.add('show');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('show');
    loadSidebarConversations();
}

function hideChatHistoryUI() {
    historyLayer.classList.remove('show');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
}

async function loadSidebarConversations() {
    const searchInput = document.getElementById('historySearchInput');
    if (searchInput) searchInput.value = '';

    if (IS_OFFLINE_PREVIEW) {
        historyList.innerHTML = `
            <div class="history-state-container">
                <p>Offline Preview Active</p>
                <p style="font-size: 12px;">Tap "Switch PC Server" below to connect to your desktop Antigravity 2.33 Hub.</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div></div>`;

    try {
        const res = await fetchWithAuth('/chat-history');
        const data = await res.json();
        const chats = data.chats || [];
        if (data.activeCascadeId) activeCascadeId = data.activeCascadeId;

        let html = `
            <div class="history-action-container">
                <button class="history-new-btn" type="button">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>New Conversation</span>
                </button>
            </div>
        `;

        if (chats.length === 0) {
            html += `<div class="history-state-container"><p>No conversations yet</p></div>`;
            historyList.innerHTML = html;
            return;
        }

        const runningChats = chats.filter(c => c.status === 'RUNNING');
        const idleChats = chats.filter(c => c.status !== 'RUNNING');

        const renderCard = (chat, i) => {
            const subs = chat.subagents || [];
            const isActive =
                (chat.cascadeId && chat.cascadeId === activeCascadeId) ||
                subs.some(s => s.cascadeId === activeCascadeId);
            const isRunning = chat.status === 'RUNNING';

            const subHtml = subs.length > 0 ? `
                <div class="history-subagent-list">
                    ${subs.map(s => {
                        const depth = Math.max(1, Number(s.nestingDepth) || 1);
                        const indentPx = (depth - 1) * 12;
                        const subRunning = String(s.status || '').includes('RUNNING') || String(s.status || '').includes('WAITING');
                        const subActive = s.cascadeId === activeCascadeId;
                        return `
                            <div class="history-subagent-item ${subActive ? 'active' : ''}"
                                 style="padding-left: ${8 + indentPx}px;"
                                 data-sub-cascade="${escapeHtml(s.cascadeId)}"
                                 data-sub-title="${escapeHtml(s.role || s.typeName)}">
                                <span>${depth > 1 ? '↳ L' + depth : '↳'} ${escapeHtml(s.role || s.typeName)}</span>
                                <span>${subRunning ? '● Live' : 'Done'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '';

            return `
                <div class="history-card ${isActive ? 'active' : ''}"
                     data-cascade-id="${escapeHtml(chat.cascadeId || '')}"
                     data-title="${escapeHtml(chat.title || '')}"
                     data-index="${typeof chat.index === 'number' ? chat.index : i}">
                    <div class="history-card-main">
                        <span class="history-card-title">${escapeHtml(chat.title)}</span>
                        <div class="history-card-actions">
                            ${isRunning ? '<span class="agy-subagent-dot pulsing"></span>' : ''}
                            ${chat.cascadeId ? `<button type="button" class="history-delete-btn" data-delete-cascade="${escapeHtml(chat.cascadeId)}" aria-label="Delete conversation" title="Delete">✕</button>` : ''}
                        </div>
                    </div>
                    <div class="history-card-meta">
                        <span>${escapeHtml(chat.date || 'Recent')}</span>
                        ${chat.stepCount ? `<span>· ${chat.stepCount} steps</span>` : ''}
                        ${subs.length ? `<span>· ${subs.length} swarm worker${subs.length > 1 ? 's' : ''}</span>` : ''}
                    </div>
                    ${subHtml}
                </div>
            `;
        };

        if (runningChats.length > 0) {
            html += `<div class="history-section-label">Active &amp; Swarm</div><div class="history-list-group">${runningChats.map(renderCard).join('')}</div>`;
        }
        if (idleChats.length > 0) {
            html += `<div class="history-section-label">Recent</div><div class="history-list-group">${idleChats.map(renderCard).join('')}</div>`;
        }

        historyList.innerHTML = html;

        if (searchInput) {
            searchInput.oninput = (e) => {
                const q = e.target.value.toLowerCase().trim();
                historyList.querySelectorAll('.history-card').forEach(card => {
                    const t = (card.getAttribute('data-title') || '').toLowerCase();
                    card.style.display = t.includes(q) ? 'flex' : 'none';
                });
            };
        }
    } catch (e) {
        historyList.innerHTML = `<div class="history-state-container"><p>Unable to load conversations</p></div>`;
    }
}

async function selectChat({ cascadeId, title, index }) {
    hideChatHistoryUI();
    selectedSwarmIdOverride = '';
    cachedSwarmEtag = '';
    if (currentSurface !== 'antigravity') {
        switchSurface('antigravity');
    }
    if (IS_OFFLINE_PREVIEW) return;
    if (title && headerTitle) headerTitle.textContent = title;
    chatContent.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading conversation…</p></div>';

    try {
        const res = await fetchWithAuth('/select-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cascadeId, title, index })
        });
        const data = await res.json();
        if (data.cascadeId) activeCascadeId = data.cascadeId;
        lastHash = '';
        await loadSnapshot();
    } catch (e) {
        setTimeout(() => loadSnapshot(), 400);
    }
}

// --- Grouped Antigravity 2.33 Model Picker & Mode Picker ---
function closeModal() {
    modalOverlay.classList.remove('show');
}

async function openModelSelector() {
    triggerHaptic('light');
    if (!IS_OFFLINE_PREVIEW) {
        try {
            const res = await fetchWithAuth('/get-models');
            const data = await res.json();
            if (Array.isArray(data.modelDetails) && data.modelDetails.length > 0) {
                cachedModelDetails = data.modelDetails;
            } else if (Array.isArray(data.models) && data.models.length > 0) {
                cachedModelDetails = data.models.map(label => {
                    const m = /^(.+?)\s*\(([^)]+)\)$/.exec(label);
                    const base = m ? m[1].trim() : label;
                    const eff = m ? m[2].trim() : /carbon/i.test(label) ? 'Unavailable' : 'Default';
                    const isClaudeThinking = base.startsWith('Claude ') && /^thinking$/i.test(eff);
                    const isUnavailable = eff === 'Unavailable';
                    return {
                        label,
                        family: isClaudeThinking ? 'Claude 4.6' : base,
                        effort: isClaudeThinking ? base.replace(/^Claude\s+/i, '').trim() : eff,
                        tagTitle: isUnavailable ? 'Unavailable' : '',
                        disabled: isUnavailable
                    };
                });
            }
        } catch (e) {}
    }

    modalTitle.textContent = 'Select Agent Model';
    modalList.innerHTML = '';

    // Weekly & 5-Hour Quota Quick Summary Strip inside Model Selector
    const qHeadline = cachedQuotaData?.headline || null;
    const activeModelMeta =
        cachedModelDetails.find(m => m.label === currentModel && !isModelVariantDisabled(m)) ||
        cachedModelDetails.find(m => !isModelVariantDisabled(m) && typeof m.weeklyRemainingFraction === 'number') ||
        cachedModelDetails[0];
    const wkSummaryPct =
        typeof qHeadline?.weeklyRemainingPercent === 'number'
            ? `${qHeadline.weeklyRemainingPercent}%`
            : typeof activeModelMeta?.weeklyRemainingFraction === 'number'
              ? `${Math.round(activeModelMeta.weeklyRemainingFraction * 100)}%`
              : IS_OFFLINE_PREVIEW
                ? '96%'
                : '';
    if (wkSummaryPct) {
        const fhSummaryPct =
            typeof qHeadline?.fiveHourRemainingPercent === 'number'
                ? ` · 5h ${qHeadline.fiveHourRemainingPercent}%`
                : IS_OFFLINE_PREVIEW
                  ? ' · 5h 98%'
                  : '';
        const strip = document.createElement('div');
        strip.className = 'model-picker-quota-strip';
        strip.setAttribute('data-testid', 'model-picker-quota-strip');
        strip.innerHTML = `
            <span>Weekly Quota: <strong>${escapeHtml(wkSummaryPct)}</strong>${escapeHtml(fhSummaryPct)}</span>
            <span>Breakdown →</span>
        `;
        strip.addEventListener('click', () => {
            openQuotaModal(false);
        });
        modalList.appendChild(strip);
    }

    const groups = new Map();
    cachedModelDetails.forEach(item => {
        const fam = item.family || item.label;
        if (!groups.has(fam)) groups.set(fam, []);
        groups.get(fam).push(item);
    });

    const effortRank = {
        low: 1,
        medium: 2,
        high: 3,
        xhigh: 4,
        neon: 10,
        argon: 11,
        carbon: 12,
        'sonnet 4.6': 20,
        'opus 4.6': 21,
        default: 90,
        unavailable: 99
    };

    groups.forEach((variants, familyName) => {
        variants.sort((a, b) => {
            const ra = effortRank[String(a.effort || '').toLowerCase()] ?? 99;
            const rb = effortRank[String(b.effort || '').toLowerCase()] ?? 99;
            return ra - rb;
        });
        const isFamilyDisabled = variants.length > 0 && variants.every(isModelVariantDisabled);
        const isFamilySelected = !isFamilyDisabled && variants.some(v => v.label === currentModel);
        const badgeTag = variants.find(v => v.tagTitle)?.tagTitle || (isFamilyDisabled ? 'Unavailable' : '');
        const familyDesc = variants.find(v => v.tagDescription)?.tagDescription || '';
        const wkFrac = !isFamilyDisabled ? variants[0]?.weeklyRemainingFraction : undefined;
        const quotaFrac = !isFamilyDisabled ? variants[0]?.remainingFraction : undefined;
        const wkPct = typeof wkFrac === 'number' ? `Wk ${Math.round(wkFrac * 100)}%` : '';
        const fhPct = typeof quotaFrac === 'number' ? `5h ${Math.round(quotaFrac * 100)}%` : '';
        const offlineQuotaFallback =
            !IS_OFFLINE_PREVIEW || isFamilyDisabled
                ? ''
                : /argon/i.test(familyName)
                  ? 'Wk 94% · 5h 97%'
                  : /claude|gpt/i.test(familyName)
                    ? 'Wk 100% · 5h 100%'
                    : 'Wk 96% · 5h 98%';
        const quotaLabelText = [wkPct, fhPct].filter(Boolean).join(' · ') || offlineQuotaFallback;

        const card = document.createElement('div');
        card.className = `model-family-card ${isFamilySelected ? 'selected' : ''} ${isFamilyDisabled ? 'is-disabled' : ''}`.trim();

        const tagLower = badgeTag.toLowerCase();
        const tagCls = tagLower === 'fast' ? 'fast' : tagLower === 'unavailable' ? 'unavailable' : '';
        const tagHtml = badgeTag && badgeTag !== 'Notice'
            ? `<span class="model-tag-pill ${tagCls}">${escapeHtml(badgeTag)}</span>`
            : '';

        card.innerHTML = `
            <div class="model-family-top">
                <div class="model-family-name">
                    <span>${escapeHtml(familyName)}</span>
                    ${tagHtml}
                </div>
                ${quotaLabelText ? `<span class="model-quota-label">${escapeHtml(quotaLabelText)}</span>` : ''}
            </div>
            ${familyDesc ? `<div class="model-family-desc">${escapeHtml(familyDesc)}</div>` : ''}
            <div class="effort-pills-row" data-testid="model-selector-effort-group"></div>
        `;

        const row = card.querySelector('.effort-pills-row');
        variants.forEach(v => {
            const isUnavailable = isModelVariantDisabled(v);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `effort-option-btn ${!isUnavailable && v.label === currentModel ? 'active' : ''} ${isUnavailable ? 'disabled is-disabled' : ''}`.trim();
            btn.setAttribute('data-testid', 'model-selector-item');
            btn.textContent = v.effort || v.label;
            if (isUnavailable) {
                const reason = v.tagDescription || familyDesc || `${v.label} is currently unavailable on your plan`;
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
                btn.title = reason;
            } else {
                btn.addEventListener('click', async () => {
                    triggerHaptic('medium');
                    closeModal();
                    await applyModelSelection(v.label);
                });
            }
            row.appendChild(btn);
        });

        if (isFamilyDisabled) {
            const disabledReason = familyDesc || variants[0]?.tagDescription || `${familyName} is currently unavailable on your plan`;
            card.title = disabledReason;
            card.addEventListener('click', () => {
                triggerHaptic('light');
                showToast(disabledReason);
            });
        } else if (variants.some(isModelVariantDisabled)) {
            row.addEventListener('click', e => {
                if (e.target !== row) return;
                const disabledBtns = Array.from(row.querySelectorAll('.effort-option-btn:disabled'));
                const hit = disabledBtns.find(b => {
                    const r = b.getBoundingClientRect();
                    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
                });
                if (hit) {
                    e.stopPropagation();
                    triggerHaptic('light');
                    showToast(hit.title || 'This model variant is currently unavailable');
                }
            });
        }

        modalList.appendChild(card);
    });

    modalOverlay.classList.add('show');
}

async function applyModelSelection(modelLabel) {
    const targetMeta = cachedModelDetails.find(
        m => String(m.label || '').toLowerCase() === String(modelLabel || '').toLowerCase()
    );
    if (targetMeta && isModelVariantDisabled(targetMeta)) {
        triggerHaptic('light');
        showToast(targetMeta.tagDescription || `${targetMeta.label} is currently unavailable on your plan`);
        return;
    }

    const prev = currentModel;
    currentModel = modelLabel;
    if (IS_OFFLINE_PREVIEW) {
        if (modelText) {
            modelText.textContent = formatCompactModelName(currentModel);
            modelText.title = currentModel;
        }
        fetchQuotaSummary(false);
        showToast(`Preview Model: ${currentModel}`);
        return;
    }

    if (modelText) modelText.textContent = 'Setting…';

    try {
        const res = await fetchWithAuth('/set-model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: modelLabel })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
            currentModel = data.selectedModel || modelLabel;
            if (modelText) {
                modelText.textContent = formatCompactModelName(currentModel);
                modelText.title = currentModel;
            }
            showToast(`Model: ${currentModel}`);
            fetchQuotaSummary(false);
        } else {
            currentModel = prev;
            if (modelText) modelText.textContent = formatCompactModelName(prev);
            showToast(data?.error || 'Could not switch model');
        }
    } catch (e) {
        currentModel = prev;
        if (modelText) modelText.textContent = formatCompactModelName(prev);
    }
}

function openModeSelector() {
    triggerHaptic('light');
    modalTitle.textContent = 'Agent Execution Mode';
    modalList.innerHTML = '';

    AGENT_MODES.forEach(m => {
        const item = document.createElement('div');
        item.className = `modal-option ${m.id === currentMode ? 'active' : ''}`;
        item.innerHTML = `
            <div>
                <div>${escapeHtml(m.title)}</div>
                <div class="modal-option-desc">${escapeHtml(m.desc)}</div>
            </div>
            <span>${m.id === currentMode ? '✓' : ''}</span>
        `;
        item.addEventListener('click', async () => {
            triggerHaptic('medium');
            closeModal();
            const prev = currentMode;
            currentMode = m.id;
            if (modeText) modeText.textContent = m.title;
            if (modeBtn) modeBtn.classList.toggle('active', m.id === 'Autonomous' || m.id === 'Planning');

            if (IS_OFFLINE_PREVIEW) {
                showToast(`Preview Mode: ${m.title}`);
                return;
            }

            try {
                const res = await fetchWithAuth('/set-mode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: m.id })
                });
                const data = await res.json();
                if (data.success) {
                    if (data.selectedModel) {
                        const modelChanged = data.selectedModel !== currentModel;
                        currentModel = data.selectedModel;
                        if (modelText) {
                            modelText.textContent = formatCompactModelName(currentModel);
                            modelText.title = currentModel;
                        }
                        if (modelChanged) {
                            fetchQuotaSummary(false);
                        }
                    }
                    showToast(`Mode: ${m.title}`);
                } else {
                    currentMode = prev;
                    if (modeText) modeText.textContent = prev;
                }
            } catch (e) {
                currentMode = prev;
                if (modeText) modeText.textContent = prev;
            }
        });
        modalList.appendChild(item);
    });

    modalOverlay.classList.add('show');
}

// --- Slash Commands & Quick Prompt Strip ---
function initQuickActions() {
    const PROMPTS = {
        'Continue': 'Continue',
        'Explain code': 'Explain this code clearly:',
        'Fix bugs': 'Inspect and fix any bugs in:',
        'Refactor': 'Refactor for clean architecture and maintainability:',
        'Add tests': 'Add thorough automated tests for:'
    };

    document.querySelectorAll('.action-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault();
            if (chip.getAttribute('data-open-slash-sheet') === '1') {
                openSlashActionsSheet('');
                return;
            }
            if (chip.getAttribute('data-open-quota') === '1') {
                openQuotaModal(false);
                return;
            }
            if (chip.getAttribute('data-open-swarm') === '1') {
                openSwarmUiSection('');
                return;
            }
            if (chip.getAttribute('data-open-ide') === '1') {
                switchSurface('ide');
                return;
            }

            triggerHaptic('light');
            const action = chip.getAttribute('data-action') || chip.textContent.trim();

            if (action === 'Continue' && !(messageInput.value || '').trim() && pendingQuotes.length === 0) {
                messageInput.value = 'Continue';
                sendMessage();
                return;
            }

            if (action.startsWith('/')) {
                toggleOrInsertSlashAction(action, { allowToggleOff: true });
            } else {
                const snippet = PROMPTS[action] || action;
                const cur = (messageInput.value || '').trim();
                messageInput.value = cur ? `${cur}\n${snippet} ` : `${snippet} `;
            }

            messageInput.focus();
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 130) + 'px';
            syncActiveSlashChips();
            hideSlashMenu();
        });
    });

    if (slashBtn) {
        slashBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openSlashActionsSheet('');
        });
    }

    if (brandBtn) {
        brandBtn.addEventListener('click', () => {
            triggerHaptic('light');
            const scroller =
                currentSurface === 'swarm'
                    ? swarmBodyScroll
                    : currentSurface === 'ide'
                      ? ideBodyScroll
                      : getScrollContainer();
            if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// --- File Upload, Clipboard Paste & Drag-and-Drop (Direct Any-File-Type Handling) ---
function initFileAttachments() {
    const fileInputEl = document.getElementById('fileInput');
    const attachBtnEl = document.getElementById('attachBtn');
    const dragOverlay = document.getElementById('dragOverlay');

    if (attachBtnEl && fileInputEl) {
        attachBtnEl.addEventListener('click', (e) => {
            e.preventDefault();
            triggerHaptic('light');
            fileInputEl.click();
        });

        fileInputEl.addEventListener('change', (e) => {
            handleFilesSelected(Array.from(e.target.files || []));
            fileInputEl.value = '';
        });
    }

    // Support pasting screenshots or files directly into the composer
    if (messageInput) {
        messageInput.addEventListener('paste', (e) => {
            const items = Array.from(e.clipboardData?.items || []);
            const fileItems = items.filter(it => it.kind === 'file');
            if (fileItems.length === 0) return;
            const pastedFiles = fileItems.map(it => it.getAsFile()).filter(Boolean);
            if (pastedFiles.length > 0) {
                e.preventDefault();
                handleFilesSelected(pastedFiles);
            }
        });
    }

    if (chatContainer && dragOverlay) {
        let dragCounter = 0;
        const dropTargets = [chatContainer, composerDock].filter(Boolean);
        dropTargets.forEach(target => {
            ['dragenter', 'dragover'].forEach(ev => {
                target.addEventListener(ev, (e) => {
                    e.preventDefault();
                    if (ev === 'dragenter') dragCounter++;
                    dragOverlay.classList.add('active');
                });
            });
            ['dragleave', 'drop'].forEach(ev => {
                target.addEventListener(ev, (e) => {
                    e.preventDefault();
                    if (ev === 'dragleave') dragCounter--;
                    if (dragCounter <= 0 || ev === 'drop') {
                        dragCounter = 0;
                        dragOverlay.classList.remove('active');
                    }
                });
            });
            target.addEventListener('drop', (e) => {
                const files = Array.from(e.dataTransfer?.files || []);
                if (files.length > 0) handleFilesSelected(files);
            });
        });
    }
}

function handleFilesSelected(files) {
    if (!files || files.length === 0) return;
    triggerHaptic('medium');

    const usedNames = new Set(pendingAttachments.map(a => String(a.name || '').toLowerCase()));
    files.forEach((file, fileIdx) => {
        const badgeInfo = getClientAttachmentBadgeInfo(file.name, file.type);
        const isImage = (file.type || '').startsWith('image/') || badgeInfo.isImage;
        const readAsPlainText = !isImage && isPlainTextFile(file);
        let safeName =
            file.name && String(file.name).trim()
                ? String(file.name).trim()
                : `attachment_${Date.now()}_${fileIdx + 1}.${isImage ? 'png' : 'bin'}`;
        if (usedNames.has(safeName.toLowerCase())) {
            const dotIdx = safeName.lastIndexOf('.');
            const base = dotIdx > 0 ? safeName.slice(0, dotIdx) : safeName;
            const ext = dotIdx > 0 ? safeName.slice(dotIdx) : '';
            let seq = 2;
            while (usedNames.has(`${base}_${seq}${ext}`.toLowerCase())) seq++;
            safeName = `${base}_${seq}${ext}`;
        }
        usedNames.add(safeName.toLowerCase());

        const readPromise = new Promise(resolveRead => {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const result = ev.target?.result || '';
                const att = {
                    name: safeName,
                    type: file.type || (isImage ? 'image/png' : readAsPlainText ? 'text/plain' : 'application/octet-stream'),
                    sizeBytes: Number(file.size || 0),
                    isImage,
                    // Binary files (PDF, DOCX, ZIP, MP4, audio, APK, images) preserve exact bytes via base64 DataURL!
                    dataUrl: readAsPlainText ? '' : String(result),
                    textContent: readAsPlainText ? String(result) : '',
                    uploading: !IS_OFFLINE_PREVIEW,
                    uploadPromise: null,
                    serverData: null
                };
                pendingAttachments.push(att);
                renderAttachmentPreviews();
                resolveRead(att);

                if (!IS_OFFLINE_PREVIEW) {
                    att.uploadPromise = (async () => {
                        try {
                            const upRes = await fetchWithAuth('/upload-attachment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    fileName: att.name,
                                    fileType: att.type,
                                    dataUrl: att.dataUrl || undefined,
                                    textContent: att.textContent || undefined
                                })
                            });
                            const parsed = await upRes.json().catch(() => null);
                            if (parsed && parsed.success) {
                                att.serverData = parsed;
                                if (parsed.fileType) att.type = parsed.fileType;
                                if (typeof parsed.isImage === 'boolean') att.isImage = parsed.isImage;
                            }
                        } catch (e) {
                            // Fallback will send inline dataUrl/content in /send
                        } finally {
                            att.uploading = false;
                            renderAttachmentPreviews();
                        }
                    })();
                }
            };
            reader.onerror = () => resolveRead(null);
            if (readAsPlainText) reader.readAsText(file);
            else reader.readAsDataURL(file);
        });

        pendingFileReads.push(readPromise);
        readPromise.finally(() => {
            const idx = pendingFileReads.indexOf(readPromise);
            if (idx !== -1) pendingFileReads.splice(idx, 1);
        });
    });
}

// --- Media Lightbox Modal (Images, Video, Audio, Code/Text & Document/Binary Attachments) ---
async function openMediaLightbox({ src = '', title = 'Attachment', mimeType = 'image/png', textContent = '' } = {}) {
    const modal = document.getElementById('mediaLightboxModal');
    const stage = document.getElementById('mediaLightboxStage');
    const titleEl = document.getElementById('mediaLightboxTitle');
    const dlBtn = document.getElementById('mediaLightboxDownloadBtn');
    if (!modal || !stage) return;

    const badgeInfo = getClientAttachmentBadgeInfo(title, mimeType);
    const mime = String(mimeType || '').toLowerCase();
    const isTextLike =
        Boolean(textContent) ||
        mime.startsWith('text/') ||
        ['application/json', 'application/javascript', 'application/xml', 'application/x-sh'].includes(mime) ||
        badgeInfo.cls === 'is-code' ||
        badgeInfo.cls === 'is-json' ||
        badgeInfo.cls === 'is-csv';

    if (titleEl) titleEl.textContent = title;
    if (dlBtn) {
        if (src) {
            let finalHref = src;
            const sessionKey = getStoredSessionKey();
            if (sessionKey && src.startsWith('/') && !src.includes('key=')) {
                finalHref = `${src}${src.includes('?') ? '&' : '?'}key=${encodeURIComponent(sessionKey)}`;
            }
            dlBtn.href = finalHref;
            dlBtn.setAttribute('download', title);
            dlBtn.style.display = 'inline-flex';
        } else {
            dlBtn.style.display = 'none';
        }
    }

    if (mime.startsWith('video/') && src) {
        stage.innerHTML = `<video src="${escapeHtml(src)}" controls autoplay playsinline></video>`;
    } else if (mime.startsWith('audio/') && src) {
        stage.innerHTML = `<audio src="${escapeHtml(src)}" controls autoplay></audio>`;
    } else if ((mime.startsWith('image/') || badgeInfo.isImage) && src) {
        stage.innerHTML = `<img src="${escapeHtml(src)}" alt="${escapeHtml(title)}" />`;
    } else if (isTextLike && (textContent || src)) {
        if (textContent) {
            stage.innerHTML = `<pre class="media-lightbox-code"><code>${escapeHtml(textContent)}</code></pre>`;
        } else {
            stage.innerHTML = `<div class="media-lightbox-doc-card"><span class="agy-user-media-ext">${escapeHtml(badgeInfo.badge)}</span><div class="media-lightbox-doc-name">Loading ${escapeHtml(title)}…</div></div>`;
            modal.classList.add('show');
            try {
                const res = await fetchWithAuth(src);
                if (res.ok) {
                    const txt = await res.text();
                    stage.innerHTML = `<pre class="media-lightbox-code"><code>${escapeHtml(txt.slice(0, 64000))}</code></pre>`;
                    return;
                }
            } catch {}
        }
    } else {
        const dlHref = dlBtn && dlBtn.style.display !== 'none' ? dlBtn.href : '';
        stage.innerHTML = `
            <div class="media-lightbox-doc-card" data-testid="media-lightbox-doc-card">
                <span class="agy-user-media-ext">${escapeHtml(badgeInfo.badge)}</span>
                <div class="media-lightbox-doc-name">${escapeHtml(title)}</div>
                <div class="media-lightbox-doc-meta">${escapeHtml(mime || 'Attached file')}</div>
                ${
                    dlHref
                        ? `<a href="${escapeHtml(dlHref)}" class="agy-primary-cta-link" target="_blank" rel="noopener noreferrer" download="${escapeHtml(title)}" style="margin-top:6px;">Open / Download File</a>`
                        : ''
                }
            </div>
        `;
    }
    modal.classList.add('show');
}

function closeMediaLightbox() {
    const modal = document.getElementById('mediaLightboxModal');
    const stage = document.getElementById('mediaLightboxStage');
    if (modal) modal.classList.remove('show');
    if (stage) stage.innerHTML = '';
}
window.openMediaLightbox = openMediaLightbox;
window.closeMediaLightbox = closeMediaLightbox;

// --- Voice Dictation ---
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceBtn = document.getElementById('voiceBtn');
    if (!voiceBtn) return;

    if (!SpeechRecognition) {
        voiceBtn.style.opacity = '0.45';
        voiceBtn.addEventListener('click', () => showToast('Voice input requires HTTPS or Chrome/Android WebView'));
        return;
    }

    let recognition = null;
    let listening = false;

    try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            listening = true;
            voiceBtn.classList.add('listening');
            triggerHaptic('medium');
            showToast('Listening…');
        };
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            messageInput.value = transcript;
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        };
        recognition.onend = () => {
            listening = false;
            voiceBtn.classList.remove('listening');
        };
        recognition.onerror = () => {
            listening = false;
            voiceBtn.classList.remove('listening');
        };

        voiceBtn.addEventListener('click', () => {
            if (listening) recognition.stop();
            else {
                try { recognition.start(); } catch (e) {}
            }
        });
    } catch (e) {}
}

// --- Code Viewer Modal & Bottom Sheet Touch Gestures ---
const codeViewerModal = document.getElementById('codeViewerModal');

function initModalsAndGestures() {
    const codeViewerContent = document.getElementById('codeViewerContent');
    const codeViewerLang = document.getElementById('codeViewerLang');
    const closeCodeViewerBtn = document.getElementById('closeCodeViewerBtn');
    const codeViewerCopyBtn = document.getElementById('codeViewerCopyBtn');
    const codeViewerQuoteBtn = document.getElementById('codeViewerQuoteBtn');

    window.openCodeViewer = (codeText, lang = 'CODE') => {
        if (!codeViewerModal || !codeViewerContent) return;
        codeViewerContent.textContent = codeText;
        if (codeViewerLang) codeViewerLang.textContent = String(lang).toUpperCase();
        codeViewerModal.classList.add('show');
    };

    if (closeCodeViewerBtn) closeCodeViewerBtn.addEventListener('click', () => codeViewerModal.classList.remove('show'));
    if (codeViewerQuoteBtn) {
        codeViewerQuoteBtn.addEventListener('click', () => {
            let selectedSnippet = '';
            try {
                const sel = window.getSelection?.();
                if (sel && !sel.isCollapsed && codeViewerContent && (codeViewerContent.contains(sel.anchorNode) || codeViewerContent.contains(sel.focusNode))) {
                    selectedSnippet = String(sel.toString() || '').trim();
                }
            } catch {}
            const snippet = selectedSnippet || (codeViewerContent?.textContent || '').trim();
            if (!snippet) return;
            const langLabel = codeViewerLang?.textContent?.trim() || 'CODE';
            dismissSelectionQuoteUI(true);
            codeViewerModal.classList.remove('show');
            addQuoteToComposer(
                {
                    content: snippet,
                    label: 'code_block',
                    sourceLabel: langLabel
                },
                'answer'
            );
            showToast(selectedSnippet ? 'Selected code lines quoted' : 'Code block quoted');
        });
    }
    if (codeViewerCopyBtn) {
        codeViewerCopyBtn.addEventListener('click', async () => {
            if (await copyToClipboard(codeViewerContent.textContent || '')) {
                triggerHaptic('success');
                showToast('Code copied');
            }
        });
    }
    if (codeViewerModal) {
        codeViewerModal.addEventListener('click', (e) => {
            if (e.target === codeViewerModal) codeViewerModal.classList.remove('show');
        });
    }

    const mediaLightboxModal = document.getElementById('mediaLightboxModal');
    const closeMediaLightboxBtn = document.getElementById('closeMediaLightboxBtn');
    if (closeMediaLightboxBtn) {
        closeMediaLightboxBtn.addEventListener('click', closeMediaLightbox);
    }
    if (mediaLightboxModal) {
        mediaLightboxModal.addEventListener('click', (e) => {
            if (e.target === mediaLightboxModal) closeMediaLightbox();
        });
    }

    if (closeQuotePartsBtn) {
        closeQuotePartsBtn.addEventListener('click', closeQuotePartsModal);
    }
    if (quotePartsOverlay) {
        quotePartsOverlay.addEventListener('click', (e) => {
            if (e.target === quotePartsOverlay) closeQuotePartsModal();
        });
    }
    if (quotePartsInsertBtn) {
        quotePartsInsertBtn.addEventListener('click', () => {
            const chosen = collectSelectedQuoteParts();
            if (chosen.length === 0) {
                showToast('Tap at least one part to quote');
                return;
            }
            chosen.forEach((item, idx) => addQuoteToComposer(item, idx === 0 ? 'answer' : false));
            closeQuotePartsModal();
            showToast(`Added ${chosen.length} quoted ${chosen.length === 1 ? 'part' : 'parts'} to composer`);
        });
    }
    if (quotePartsSendBtn) {
        quotePartsSendBtn.addEventListener('click', async () => {
            const chosen = collectSelectedQuoteParts();
            if (chosen.length === 0) {
                showToast('Tap at least one part to quote');
                return;
            }
            const hasAnySpecificAnswer = chosen.some(item => Boolean((item.answer || '').trim()));
            const hasComposerMessage = Boolean((messageInput?.value || '').trim());
            if (!hasAnySpecificAnswer && !hasComposerMessage) {
                const firstSelectedInput = quotePartsList?.querySelector('.quote-part-card.selected .quote-part-answer-input');
                firstSelectedInput?.focus();
                showToast('Write a specific answer first, or tap "Add to Composer"');
                return;
            }
            chosen.forEach(item => addQuoteToComposer(item, false));
            closeQuotePartsModal();
            await sendMessage();
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (supportBtn) supportBtn.addEventListener('click', () => { hideChatHistoryUI(); supportOverlay?.classList.add('show'); });
    if (closeSupportBtn) closeSupportBtn.addEventListener('click', () => supportOverlay?.classList.remove('show'));
    if (supportOverlay) {
        supportOverlay.addEventListener('click', (e) => {
            if (e.target === supportOverlay) supportOverlay.classList.remove('show');
        });
    }

    document.addEventListener('click', (e) => {
        if (slashMenuPopup && slashMenuPopup.style.display !== 'none') {
            if (!e.target.closest('#slashMenuPopup, #messageInput')) {
                hideSlashMenu();
            }
        }
    });

    // Swipe-down to dismiss bottom sheets
    document.querySelectorAll('.modal-panel').forEach(panel => {
        let startY = 0;
        let currentY = 0;
        let dragging = false;

        panel.addEventListener('touchstart', (e) => {
            if (e.target.closest('.modal-drag-handle, .modal-header-row')) {
                startY = e.touches[0].clientY;
                dragging = true;
                panel.style.transition = 'none';
            }
        }, { passive: true });

        panel.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            currentY = e.touches[0].clientY - startY;
            if (currentY > 0) panel.style.transform = `translateY(${currentY}px)`;
        }, { passive: true });

        panel.addEventListener('touchend', () => {
            if (!dragging) return;
            dragging = false;
            panel.style.transition = '';
            if (currentY > 85) {
                panel.closest('.modal-overlay')?.classList.remove('show');
            }
            panel.style.transform = '';
            currentY = 0;
        });
    });
}

// --- Utilities ---
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

function triggerHaptic(type = 'light') {
    try {
        if (window.AndroidBridge && typeof window.AndroidBridge.haptic === 'function') {
            window.AndroidBridge.haptic(type);
            return;
        }
        if ('vibrate' in navigator) {
            if (type === 'light') navigator.vibrate(8);
            else if (type === 'medium') navigator.vibrate(18);
            else if (type === 'success') navigator.vibrate([12, 24, 16]);
        }
    } catch (e) {}
}

function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2300);
}

// --- Wire Primary Controls ---
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    const slashOpen = slashMenuPopup && slashMenuPopup.style.display !== 'none';
    if (slashOpen) {
        if (e.key === 'Escape') {
            e.preventDefault();
            hideSlashMenu();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            slashMenuKeyboardNavigated = true;
            setActiveSlashMenuItem(activeSlashMenuIndex + 1);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            slashMenuKeyboardNavigated = true;
            setActiveSlashMenuItem(activeSlashMenuIndex - 1);
            return;
        }
        if (e.key === 'Tab') {
            const activeItem =
                slashMenuPopup.querySelector('.slash-menu-item.active') ||
                slashMenuPopup.querySelector('.slash-menu-item');
            if (activeItem) {
                e.preventDefault();
                activeItem.click();
                return;
            }
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            const val = messageInput.value || '';
            const caret = messageInput.selectionStart ?? val.length;
            const activeTokenMatch = /(?:^|[\s(])\/([a-zA-Z0-9_.:-]*)$/.exec(val.slice(0, caret));
            const typedToken = (activeTokenMatch?.[1] || '').toLowerCase();
            const isExactKnownCommand =
                typedToken.length > 0 && cachedSlashCommands.some(c => c.name.toLowerCase() === typedToken);

            if (slashMenuKeyboardNavigated || !isExactKnownCommand) {
                const activeItem =
                    slashMenuPopup.querySelector('.slash-menu-item.active') ||
                    slashMenuPopup.querySelector('.slash-menu-item');
                if (activeItem) {
                    e.preventDefault();
                    activeItem.click();
                    return;
                }
            }
        }
    }
    if (e.key === 'ArrowUp' && !e.shiftKey && !(messageInput.value || '').trim()) {
        const recent = getRecentPrompts();
        if (recent.length > 0) {
            e.preventDefault();
            messageInput.value = recent[0];
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
            showToast('Recalled last sent prompt');
            return;
        }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 130) + 'px';
    syncActiveSlashChips();
    updateSlashMenuFromInput();
    saveComposerDraft();
});

refreshBtn.addEventListener('click', () => {
    triggerHaptic('light');
    if (IS_OFFLINE_PREVIEW) {
        renderOfflinePreviewDemo();
        if (currentSurface === 'swarm') refreshSwarmUi(true);
        else if (currentSurface === 'ide') refreshIdeWorkspace();
        showToast('Offline preview refreshed');
        return;
    }
    lastHash = '';
    loadSnapshot();
    fetchAppState();
    fetchQuotaSummary(false);
    if (currentSurface === 'swarm') {
        cachedSwarmEtag = '';
        refreshSwarmUi(true);
    } else if (currentSurface === 'ide') {
        refreshIdeWorkspace();
    }
});

newChatBtn.addEventListener('click', startNewChat);
historyBtn.addEventListener('click', openSidebarDrawer);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', hideChatHistoryUI);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', hideChatHistoryUI);

if (historyList) {
    historyList.addEventListener('click', async (e) => {
        if (e.target.closest('.history-new-btn')) {
            hideChatHistoryUI();
            startNewChat();
            return;
        }
        const delBtn = e.target.closest('[data-delete-cascade]');
        if (delBtn) {
            e.preventDefault();
            e.stopPropagation();
            const delCid = delBtn.getAttribute('data-delete-cascade');
            if (delCid) {
                triggerHaptic('medium');
                try {
                    const res = await fetchWithAuth('/delete-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cascadeId: delCid })
                    });
                    const out = await res.json();
                    if (out.success) {
                        showToast('Conversation deleted');
                        lastHash = '';
                        await loadSidebarConversations();
                        await loadSnapshot();
                    }
                } catch (err) {
                    showToast('Failed to delete conversation');
                }
            }
            return;
        }
        const subItem = e.target.closest('[data-sub-cascade]');
        if (subItem) {
            e.stopPropagation();
            const subCid = subItem.getAttribute('data-sub-cascade');
            const subTitle = subItem.getAttribute('data-sub-title') || 'Subagent';
            if (subCid) selectChat({ cascadeId: subCid, title: subTitle });
            return;
        }
        const card = e.target.closest('.history-card');
        if (card) {
            const cascadeId = card.getAttribute('data-cascade-id') || '';
            const title = card.getAttribute('data-title') || '';
            const index = parseInt(card.getAttribute('data-index') || '0', 10);
            selectChat({ cascadeId: cascadeId || undefined, title, index });
        }
    });
}

stopBtn.addEventListener('click', async () => {
    triggerHaptic('medium');
    if (IS_OFFLINE_PREVIEW) return;
    try {
        await fetchWithAuth('/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cascadeId: activeCascadeId })
        });
        showToast('Stop signal sent');
        updateGeneratingUI(false);
        setTimeout(() => loadSnapshot(), 400);
    } catch (e) {}
});

modelBtn.addEventListener('click', openModelSelector);
modeBtn.addEventListener('click', openModeSelector);

if (enableHttpsBtn) enableHttpsBtn.addEventListener('click', enableHttps);
if (dismissSslBtn) dismissSslBtn.addEventListener('click', dismissSslBanner);

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        if (document.activeElement === messageInput) {
            setTimeout(() => scrollToBottom(false), 80);
        }
    });
}

// =========================================================================
// Weekly Quota & Context Window Indicator + Breakdown Sheet
// =========================================================================
function formatTokensCompact(num) {
    const n = Number(num || 0);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(Math.round(n));
}

function buildOfflineDemoQuota() {
    const isArgon = /argon/i.test(currentModel || '');
    const is3p = /claude|gpt/i.test(currentModel || '');
    const headline = isArgon
        ? {
              groupName: 'Gemini 4 Argon',
              weeklyRemainingFraction: 0.94,
              weeklyRemainingPercent: 94,
              weeklyResetHuman: '6d 20h',
              fiveHourRemainingFraction: 0.97,
              fiveHourRemainingPercent: 97,
              fiveHourResetHuman: '4h 42m'
          }
        : is3p
          ? {
                groupName: 'Claude and GPT models',
                weeklyRemainingFraction: 1,
                weeklyRemainingPercent: 100,
                weeklyResetHuman: '6d 23h',
                fiveHourRemainingFraction: 1,
                fiveHourRemainingPercent: 100,
                fiveHourResetHuman: '4h 55m'
            }
          : {
                groupName: 'Gemini Models',
                weeklyRemainingFraction: 0.96,
                weeklyRemainingPercent: 96,
                weeklyResetHuman: '6d 18h',
                fiveHourRemainingFraction: 0.98,
                fiveHourRemainingPercent: 98,
                fiveHourResetHuman: '4h 38m'
            };

    return {
        success: true,
        hubConnected: false,
        source: 'offline_preview',
        targetApp: currentBackendTarget,
        selectedModel: currentModel,
        description:
            'Within each group, models share a weekly limit and a 5-hour limit. Quota is consumed proportionally to token cost.',
        user: {
            name: 'Offline Preview',
            planName: 'Pro',
            tierName: 'Google AI Pro'
        },
        headline,
        groups: [
            {
                displayName: 'Gemini Models',
                description: 'Gemini 4 Neon, Gemini 4 Hydrogen, Orchestrator (Neon) & Gemini 3.8 Flash',
                buckets: [
                    {
                        bucketId: 'gemini-weekly',
                        displayName: 'Weekly Limit Remaining',
                        window: 'weekly',
                        remainingFraction: 0.96,
                        remainingPercent: 96,
                        usedPercent: 4,
                        resetInHuman: '6d 18h'
                    },
                    {
                        bucketId: 'gemini-5h',
                        displayName: 'Five Hour Limit Remaining',
                        window: '5h',
                        remainingFraction: 0.98,
                        remainingPercent: 98,
                        usedPercent: 2,
                        resetInHuman: '4h 38m'
                    }
                ]
            },
            {
                displayName: 'Gemini 4 Argon',
                description: 'Gemini 4 Argon & Orchestrator (Argon)',
                buckets: [
                    {
                        bucketId: 'argon-weekly',
                        displayName: 'Weekly Limit Remaining',
                        window: 'weekly',
                        remainingFraction: 0.94,
                        remainingPercent: 94,
                        usedPercent: 6,
                        resetInHuman: '6d 20h'
                    },
                    {
                        bucketId: 'argon-5h',
                        displayName: 'Five Hour Limit Remaining',
                        window: '5h',
                        remainingFraction: 0.97,
                        remainingPercent: 97,
                        usedPercent: 3,
                        resetInHuman: '4h 42m'
                    }
                ]
            },
            {
                displayName: 'Claude and GPT models',
                description: 'Claude Opus 5.5, Claude Sonnet 5.5, Claude 4.6 & GPT-OSS 120B',
                buckets: [
                    {
                        bucketId: '3p-weekly',
                        displayName: 'Weekly Limit Remaining',
                        window: 'weekly',
                        remainingFraction: 1,
                        remainingPercent: 100,
                        usedPercent: 0,
                        resetInHuman: '6d 23h'
                    },
                    {
                        bucketId: '3p-5h',
                        displayName: 'Five Hour Limit Remaining',
                        window: '5h',
                        remainingFraction: 1,
                        remainingPercent: 100,
                        usedPercent: 0,
                        resetInHuman: '4h 55m'
                    }
                ]
            }
        ],
        contextUsage: {
            usedTokens: 48200,
            maxTokens: 1048576,
            usedPercent: 4.6,
            inputTokens: 4200,
            cacheReadTokens: 44000,
            totalOutputTokens: 1840,
            totalThinkingTokens: 412,
            turnCount: 2
        }
    };
}

function updateQuotaPillHeadline(headline, user = null) {
    if (!headline) return;
    const pct =
        typeof headline.weeklyRemainingPercent === 'number'
            ? headline.weeklyRemainingPercent
            : typeof headline.fiveHourRemainingPercent === 'number'
              ? headline.fiveHourRemainingPercent
              : null;
    if (pct === null) return;

    const frac = Math.max(0, Math.min(1, pct / 100));
    const circumference = 47.12;
    if (quotaRingCircle) {
        quotaRingCircle.setAttribute('stroke-dashoffset', (circumference * (1 - frac)).toFixed(2));
    }
    if (quotaPillText) {
        quotaPillText.textContent = `${pct}% Wk`;
    }
    if (quotaPillBtn) {
        quotaPillBtn.classList.toggle('quota-warn', pct >= 20 && pct < 50);
        quotaPillBtn.classList.toggle('quota-low', pct < 20);
        const resetNote = headline.weeklyResetHuman ? ` · resets in ${headline.weeklyResetHuman}` : '';
        quotaPillBtn.title = `${headline.groupName || 'Model'} Weekly Quota: ${pct}% remaining${resetNote}`;
    }

    if (sidebarPlanBadge && user) {
        sidebarPlanBadge.textContent = user.tierName || user.planName || 'Antigravity Pro';
    }
    if (sidebarWeeklyPct) {
        const resetSuffix = headline.weeklyResetHuman ? ` · ${headline.weeklyResetHuman}` : '';
        sidebarWeeklyPct.textContent = `${pct}%${resetSuffix}`;
    }
    if (sidebarWeeklyBar) {
        sidebarWeeklyBar.style.width = `${pct}%`;
        sidebarWeeklyBar.classList.toggle('warn', pct >= 20 && pct < 50);
        sidebarWeeklyBar.classList.toggle('low', pct < 20);
    }
}

async function fetchQuotaSummary(force = false) {
    if (IS_OFFLINE_PREVIEW) {
        cachedQuotaData = buildOfflineDemoQuota();
        updateQuotaPillHeadline(cachedQuotaData.headline, cachedQuotaData.user);
        return cachedQuotaData;
    }
    try {
        const res = await fetchWithAuth(force ? '/quota?refresh=1' : '/quota');
        const data = await res.json();
        if (data && data.success) {
            cachedQuotaData = data;
            if (data.contextUsage) activeContextUsage = data.contextUsage;
            if (data.headline) updateQuotaPillHeadline(data.headline, data.user);
            return data;
        }
    } catch (e) {}
    return cachedQuotaData;
}

async function openQuotaModal(forceRefresh = false) {
    triggerHaptic('light');
    hideChatHistoryUI();

    modalTitle.textContent = 'Weekly Quota & Context';
    modalList.innerHTML = `<div class="loading-state" style="padding:24px 0;"><div class="loading-spinner"></div><p>Fetching live quota…</p></div>`;
    modalOverlay.classList.add('show');

    const data = (await fetchQuotaSummary(forceRefresh)) || buildOfflineDemoQuota();
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const ctx = data.contextUsage || activeContextUsage || {
        usedTokens: 0,
        maxTokens: 1048576,
        usedPercent: 0,
        inputTokens: 0,
        cacheReadTokens: 0,
        totalOutputTokens: 0,
        totalThinkingTokens: 0
    };
    const tierTitle = data.user?.tierName || data.user?.planName || 'Antigravity Pro';
    const userSub = [
        data.user?.email || '',
        data.user?.availablePromptCredits != null ? `${data.user.availablePromptCredits} prompt credits` : ''
    ]
        .filter(Boolean)
        .join(' · ') || `Active model: ${data.selectedModel || currentModel}`;

    const groupsHtml = groups
        .map(g => {
            const bucketsHtml = (g.buckets || [])
                .map(b => {
                    const pct = typeof b.remainingPercent === 'number' ? b.remainingPercent : 100;
                    const fillCls = pct < 20 ? 'low' : pct < 50 ? 'warn' : '';
                    const resetInfo = b.resetInHuman ? `Refreshes in ${b.resetInHuman}` : '';
                    return `
                        <div class="quota-bucket-block" data-testid="quota-bucket-row">
                            <div class="quota-bucket-header">
                                <span class="quota-bucket-label">${escapeHtml(b.displayName || b.window)}</span>
                                <span class="quota-bucket-meta">${pct}% left</span>
                            </div>
                            <div class="quota-progress-track">
                                <div class="quota-progress-fill ${fillCls}" style="width: ${pct}%;"></div>
                            </div>
                            ${resetInfo ? `<div class="quota-bucket-sub">${escapeHtml(resetInfo)}</div>` : ''}
                        </div>
                    `;
                })
                .join('');
            return `
                <div class="quota-group-card" data-testid="quota-group-card">
                    <div>
                        <div class="quota-group-title">${escapeHtml(g.displayName)}</div>
                        ${g.description ? `<div class="quota-group-desc">${escapeHtml(g.description)}</div>` : ''}
                    </div>
                    ${bucketsHtml}
                </div>
            `;
        })
        .join('');

    const ctxPct = Math.min(100, Math.max(0, Number(ctx.usedPercent || 0)));
    const ctxFillCls = ctxPct > 85 ? 'low' : ctxPct > 65 ? 'warn' : '';

    modalList.innerHTML = `
        <div class="quota-sheet-wrap" data-testid="quota-breakdown-sheet">
            <div class="quota-tier-banner">
                <div>
                    <div class="quota-tier-name">✦ ${escapeHtml(tierTitle)}</div>
                    <div class="quota-tier-sub">${escapeHtml(userSub)}</div>
                </div>
                <button type="button" class="quota-refresh-btn" id="quotaForceRefreshBtn" data-testid="quota-refresh-btn">↻ Refresh</button>
            </div>

            ${groupsHtml}

            <div class="quota-group-card" data-testid="context-window-card">
                <div class="quota-bucket-header">
                    <span class="quota-group-title">Active Context Window</span>
                    <span class="quota-bucket-meta">${formatTokensCompact(ctx.usedTokens)} / ${formatTokensCompact(ctx.maxTokens)} (${ctxPct}%)</span>
                </div>
                <div class="quota-progress-track">
                    <div class="quota-progress-fill ${ctxFillCls}" style="width: ${ctxPct}%;"></div>
                </div>
                <div class="quota-context-stats">
                    <div class="quota-stat-box">
                        <div class="quota-stat-label">Prompt + Cache</div>
                        <div class="quota-stat-val">${formatTokensCompact((ctx.inputTokens || 0) + (ctx.cacheReadTokens || 0))}</div>
                    </div>
                    <div class="quota-stat-box">
                        <div class="quota-stat-label">Output / Thinking</div>
                        <div class="quota-stat-val">${formatTokensCompact(ctx.totalOutputTokens || 0)} / ${formatTokensCompact(ctx.totalThinkingTokens || 0)}</div>
                    </div>
                </div>
                <button type="button" class="ide-action-btn" id="quotaCompactNowBtn" style="width:100%; margin-top:4px;">
                    ⚡ Compact Conversation Context (/compact)
                </button>
            </div>

            ${data.description ? `<div class="quota-group-desc" style="padding:0 4px;">${escapeHtml(data.description)}</div>` : ''}
        </div>
    `;

    const refBtn = document.getElementById('quotaForceRefreshBtn');
    if (refBtn) {
        refBtn.addEventListener('click', () => openQuotaModal(true));
    }
    const compactBtn = document.getElementById('quotaCompactNowBtn');
    if (compactBtn) {
        compactBtn.addEventListener('click', () => {
            closeModal();
            switchSurface('antigravity');
            toggleOrInsertSlashAction('/compact', { allowToggleOff: false });
            messageInput?.focus();
            showToast('Added /compact to composer');
        });
    }
}

// =========================================================================
// Antigravity Surface Switcher (Normal Hub · Swarm UI · Antigravity IDE)
// =========================================================================
function syncIdeChangedBadge() {
    if (!ideChangedBadge) return;
    const count = cachedSessionChangedFiles.length;
    ideChangedBadge.style.display = count > 0 ? 'inline-block' : 'none';
    ideChangedBadge.textContent = String(count);
}

function syncSwarmNavBadge(headline) {
    cachedActiveSwarmHeadline = headline && headline.hasSwarm ? headline : null;
    if (!swarmNavBadge) return;
    if (!headline || !headline.hasSwarm) {
        swarmNavBadge.style.display = 'none';
        swarmNavBadge.classList.remove('active-work', 'has-alert');
        return;
    }
    const alertCount = Number(headline.alertCount || 0);
    const workingCount = Number(headline.workingCount || 0);
    const totalMembers = Number(headline.totalMembers || 0);

    swarmNavBadge.style.display = 'inline-block';
    swarmNavBadge.classList.toggle('has-alert', alertCount > 0);
    swarmNavBadge.classList.toggle('active-work', alertCount === 0 && workingCount > 0);
    if (alertCount > 0) {
        swarmNavBadge.textContent = `!${alertCount}`;
    } else if (workingCount > 0) {
        swarmNavBadge.textContent = `${workingCount}⚡`;
    } else {
        swarmNavBadge.textContent = String(totalMembers || headline.head || 1);
    }
}

function syncBackendTargetButtons() {
    if (ideTargetHubBtn) ideTargetHubBtn.classList.toggle('active', currentBackendTarget !== 'ide');
    if (ideTargetIdeBtn) ideTargetIdeBtn.classList.toggle('active', currentBackendTarget === 'ide');
}

function switchSurface(targetSurface, { skipInitialRefresh = false } = {}) {
    const next = targetSurface === 'ide' ? 'ide' : targetSurface === 'swarm' ? 'swarm' : 'antigravity';
    const isChat = next === 'antigravity';
    const isSwarm = next === 'swarm';
    const isIde = next === 'ide';

    if (currentSurface === 'swarm' && !isSwarm) {
        stopSwarmGraphPlayback();
    }
    currentSurface = next;

    if (switchNormalBtn) {
        switchNormalBtn.classList.toggle('active', isChat);
        switchNormalBtn.setAttribute('aria-selected', isChat ? 'true' : 'false');
    }
    if (switchSwarmBtn) {
        switchSwarmBtn.classList.toggle('active', isSwarm);
        switchSwarmBtn.setAttribute('aria-selected', isSwarm ? 'true' : 'false');
    }
    if (switchIdeBtn) {
        switchIdeBtn.classList.toggle('active', isIde);
        switchIdeBtn.setAttribute('aria-selected', isIde ? 'true' : 'false');
    }

    if (chatContainer) chatContainer.style.display = isChat ? 'flex' : 'none';
    if (swarmContainer) swarmContainer.style.display = isSwarm ? 'flex' : 'none';
    if (ideContainer) ideContainer.style.display = isIde ? 'flex' : 'none';

    if (quickActionsStrip) quickActionsStrip.style.display = isChat ? 'flex' : 'none';
    if (composerDock) composerDock.style.display = isChat ? 'block' : 'none';
    if (!isChat && scrollToBottomBtn) scrollToBottomBtn.classList.remove('show');
    if (!isChat && chatFindBar) chatFindBar.style.display = 'none';
    if (chatFindToggleBtn) chatFindToggleBtn.style.display = isChat ? 'inline-flex' : 'none';

    if (sidebarSwitchSwarmLabel) {
        sidebarSwitchSwarmLabel.textContent = isSwarm ? 'Back to Antigravity Chat' : 'Open Swarm UI Board';
    }
    if (sidebarSwitchIdeLabel) {
        sidebarSwitchIdeLabel.textContent = isIde ? 'Switch to Normal Antigravity' : 'Open Antigravity IDE View';
    }

    if (!skipInitialRefresh) {
        if (isSwarm) {
            refreshSwarmUi(true);
        } else if (isIde) {
            refreshIdeWorkspace();
        }
    }
}

async function openSwarmUiSection(swarmId = '', initialSubtab = '') {
    if (swarmId) {
        selectedSwarmIdOverride = swarmId;
        cachedSwarmEtag = '';
    }
    if (initialSubtab && ['overview', 'feed', 'members', 'graph', 'raw'].includes(initialSubtab)) {
        currentSwarmSubtab = initialSubtab;
        syncSwarmSubtabButtons();
    }
    if (currentSurface !== 'swarm') {
        switchSurface('swarm');
    } else {
        await refreshSwarmUi(true);
    }
}

window.__openSwarmUiFromNative = function (rawUrl = '') {
    let targetSwarmId = '';
    try {
        const str = String(rawUrl || '');
        const qIdx = str.indexOf('?');
        if (qIdx !== -1) {
            const sp = new URLSearchParams(str.slice(qIdx + 1));
            targetSwarmId = sp.get('swarm') || sp.get('swarmId') || '';
        }
    } catch {}
    openSwarmUiSection(targetSwarmId);
    return true;
};

async function switchBackendTarget(target) {
    const desired = target === 'ide' ? 'ide' : 'antigravity';
    currentBackendTarget = desired;
    syncBackendTargetButtons();

    if (IS_OFFLINE_PREVIEW) {
        if (ideTargetStatusSub) {
            ideTargetStatusSub.textContent =
                desired === 'ide' ? 'Offline Preview · Target: Antigravity IDE' : 'Offline Preview · Target: Normal Antigravity';
        }
        showToast(`Preview target: ${desired === 'ide' ? 'Antigravity IDE' : 'Normal Antigravity'}`);
        return;
    }

    try {
        const wsPath = ideWorkspaceSelect?.value || undefined;
        const res = await fetchWithAuth('/ide/switch-target', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: desired, workspacePath: wsPath })
        });
        const data = await res.json();
        if (data && data.success) {
            cachedIdeStatus = data;
            renderIdeTopStatus(data);
            lastHash = '';
            showToast(
                desired === 'ide'
                    ? 'Switched target to Antigravity IDE'
                    : 'Switched target to Normal Antigravity Hub'
            );
        } else {
            showToast(data?.error || 'Unable to switch target');
        }
    } catch (e) {
        showToast('Failed to switch target');
    }
}

async function openInDesktopIde(customFilePath = null, customLine = null) {
    triggerHaptic('medium');
    if (IS_OFFLINE_PREVIEW) {
        showToast('Connect to your PC Hub to launch Desktop Antigravity IDE');
        return;
    }
    try {
        const payload = {
            target: 'ide',
            workspacePath: ideWorkspaceSelect?.value || undefined,
            filePath: customFilePath || (currentIdeSubtab === 'code' ? currentIdeFile?.path : undefined),
            line: customLine || ideSelectionStartLine || 1
        };
        const res = await fetchWithAuth('/ide/open-desktop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const out = await res.json();
        if (out && out.success) {
            showToast('Opened in Desktop Antigravity IDE');
        } else {
            showToast(out?.error || 'Could not launch Antigravity IDE');
        }
    } catch (e) {
        showToast('Error launching Desktop Antigravity IDE');
    }
}

function renderIdeTopStatus(status) {
    if (!status) return;
    currentBackendTarget = status.targetApp || currentBackendTarget;
    syncBackendTargetButtons();

    if (ideTargetStatusSub) {
        const hubBit = status.normalHub?.lsVersion ? `Hub v${status.normalHub.lsVersion}` : 'Hub';
        const ideBit = status.ideApp?.installed
            ? `IDE ${status.ideApp.ideVersion ? 'v' + status.ideApp.ideVersion : 'Installed'}${status.ideApp.running ? ' ● Live' : ''}`
            : 'IDE Not Installed';
        ideTargetStatusSub.textContent = `${hubBit} · ${ideBit}`;
    }

    if (Array.isArray(status.sessionChangedFiles) && status.sessionChangedFiles.length > 0) {
        cachedSessionChangedFiles = status.sessionChangedFiles;
        syncIdeChangedBadge();
    }

    if (ideWorkspaceSelect && Array.isArray(status.workspaces)) {
        const activePath = status.activeWorkspace?.path || '';
        ideWorkspaceSelect.innerHTML = status.workspaces
            .map(
                wsItem =>
                    `<option value="${escapeHtml(wsItem.path)}" ${wsItem.path === activePath ? 'selected' : ''}>${escapeHtml(wsItem.name)} — ${escapeHtml(wsItem.shortPath || wsItem.path)}</option>`
            )
            .join('');
    }
}

const OFFLINE_DEMO_FILES = {
    'hub_bridge.js': [
        "import http from 'http';",
        '',
        'export class AntigravityHubBridge {',
        '    async getQuotaSummary(forceRefresh = false) {',
        "        return this.callRpc('RetrieveUserQuotaSummary', { forceRefresh });",
        '    }',
        '}'
    ].join('\n'),
    'server.js': [
        "import express from 'express';",
        "import { AntigravityHubBridge } from './hub_bridge.js';",
        '',
        '// Dual Normal Antigravity Hub + Antigravity IDE Multiplexer',
        "app.get('/ide/status', async (req, res) => {",
        '    res.json(await hubBridge.getIdeStatus());',
        '});'
    ].join('\n'),
    'public/js/app.js': [
        '// Mobile Surface Switcher: Normal Antigravity <-> Antigravity IDE',
        "switchSurface('ide');",
        'await openQuotaModal(false);'
    ].join('\n')
};

async function refreshIdeWorkspace({ skipSubtabRender = false } = {}) {
    if (IS_OFFLINE_PREVIEW) {
        if (ideTargetStatusSub) {
            ideTargetStatusSub.textContent = 'Hub v2.33 · Antigravity IDE Offline Demo';
        }
        if (ideWorkspaceSelect && !ideWorkspaceSelect.options.length) {
            ideWorkspaceSelect.innerHTML = `<option value="/demo/Remote-Control">Remote-Control — Antigravity/Remote-Control</option>`;
        }
        if (!skipSubtabRender) renderCurrentIdeSubtab();
        return;
    }

    try {
        const [statusRes, gitRes] = await Promise.all([
            fetchWithAuth('/ide/status'),
            fetchWithAuth('/ide/git').catch(() => null)
        ]);
        const statusData = await statusRes.json();
        if (statusData && statusData.success) {
            cachedIdeStatus = statusData;
            renderIdeTopStatus(statusData);
        }
        if (gitRes && gitRes.ok) {
            cachedIdeGit = await gitRes.json();
            if (ideGitCountPill) {
                const gc = cachedIdeGit?.changedCount || 0;
                ideGitCountPill.style.display = gc > 0 ? 'inline-block' : 'none';
                ideGitCountPill.textContent = String(gc);
            }
        }
    } catch (e) {}

    if (!skipSubtabRender) {
        await renderCurrentIdeSubtab();
    }
}

function setIdeSubtab(subtab) {
    currentIdeSubtab = subtab;
    document.querySelectorAll('.ide-subtab[data-ide-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-ide-tab') === subtab);
    });
    renderCurrentIdeSubtab();
}

async function renderCurrentIdeSubtab() {
    if (!ideBodyScroll) return;
    if (currentIdeSubtab === 'explorer') {
        await loadIdeExplorer(currentIdeDir, currentIdeSearch);
    } else if (currentIdeSubtab === 'code') {
        renderIdeCodeTab();
    } else if (currentIdeSubtab === 'git') {
        await loadIdeGit('');
    } else if (currentIdeSubtab === 'changed') {
        renderIdeSessionChanged();
    }
}

function formatFileSizeShort(bytes) {
    const b = Number(bytes || 0);
    if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
    if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${b} B`;
}

let ideSearchTimer = null;

async function loadIdeExplorer(dir = '', search = '') {
    if (!ideBodyScroll) return;
    currentIdeDir = dir;
    currentIdeSearch = search;

    let data;
    if (IS_OFFLINE_PREVIEW) {
        const q = search.trim().toLowerCase();
        const allDemo = Object.keys(OFFLINE_DEMO_FILES).map(p => ({
            name: p.split('/').pop(),
            relPath: p,
            type: 'file',
            sizeBytes: OFFLINE_DEMO_FILES[p].length
        }));
        data = {
            success: true,
            workspaceName: 'Remote-Control',
            currentDir: '',
            parentDir: null,
            entries: q ? allDemo.filter(e => e.relPath.toLowerCase().includes(q)) : allDemo
        };
    } else {
        try {
            const qs = new URLSearchParams();
            if (dir) qs.set('dir', dir);
            if (search) qs.set('search', search);
            const res = await fetchWithAuth(`/ide/files?${qs.toString()}`);
            data = await res.json();
        } catch (e) {
            ideBodyScroll.innerHTML = `<div class="history-state-container"><p>Unable to read workspace directory</p></div>`;
            return;
        }
    }

    const entries = Array.isArray(data?.entries) ? data.entries : [];
    const crumbs = (data?.currentDir || '').split('/').filter(Boolean);

    let crumbHtml = `<button type="button" class="ide-crumb-btn" data-ide-nav-dir="">🏠 ${escapeHtml(data?.workspaceName || 'Workspace')}</button>`;
    let acc = '';
    crumbs.forEach(part => {
        acc = acc ? `${acc}/${part}` : part;
        crumbHtml += `<span>/</span><button type="button" class="ide-crumb-btn" data-ide-nav-dir="${escapeHtml(acc)}">${escapeHtml(part)}</button>`;
    });

    const listHtml =
        entries.length === 0
            ? `<div class="history-state-container"><p>No matching files in workspace</p></div>`
            : entries
                  .map(item => {
                      const icon = item.type === 'dir' ? '📁' : '📄';
                      const meta = item.type === 'dir' ? 'Folder →' : formatFileSizeShort(item.sizeBytes);
                      const label = search ? item.relPath : item.name;
                      return `
                          <button type="button"
                                  class="ide-entry-row ${item.deemphasized ? 'deemphasized' : ''}"
                                  data-testid="ide-explorer-entry"
                                  data-ide-entry-type="${escapeHtml(item.type)}"
                                  data-ide-entry-path="${escapeHtml(item.relPath)}">
                              <div class="ide-entry-left">
                                  <span>${icon}</span>
                                  <span class="ide-entry-name">${escapeHtml(label)}</span>
                              </div>
                              <span class="ide-entry-meta">${escapeHtml(meta)}</span>
                          </button>
                      `;
                  })
                  .join('');

    const existingSearch = document.getElementById('ideFileSearchInput');
    const hadFocus = existingSearch && document.activeElement === existingSearch;

    ideBodyScroll.innerHTML = `
        <input type="text"
               class="ide-search-input"
               id="ideFileSearchInput"
               data-testid="ide-file-search-input"
               placeholder="Quick open file by name (e.g. server.js, MainActivity.kt)…"
               value="${escapeHtml(search)}" />
        ${!search ? `<div class="ide-breadcrumb-bar">${crumbHtml}</div>` : ''}
        <div class="ide-entry-list">${listHtml}</div>
    `;

    const nextSearchEl = document.getElementById('ideFileSearchInput');
    if (nextSearchEl) {
        if (hadFocus) {
            nextSearchEl.focus();
            const len = nextSearchEl.value.length;
            try { nextSearchEl.setSelectionRange(len, len); } catch {}
        }
        nextSearchEl.addEventListener('input', () => {
            clearTimeout(ideSearchTimer);
            ideSearchTimer = setTimeout(() => {
                loadIdeExplorer(currentIdeDir, nextSearchEl.value || '');
            }, 180);
        });
    }

    ideBodyScroll.querySelectorAll('[data-ide-nav-dir]').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic('light');
            loadIdeExplorer(btn.getAttribute('data-ide-nav-dir') || '', '');
        });
    });

    ideBodyScroll.querySelectorAll('[data-ide-entry-path]').forEach(row => {
        row.addEventListener('click', () => {
            triggerHaptic('light');
            const entryType = row.getAttribute('data-ide-entry-type');
            const relPath = row.getAttribute('data-ide-entry-path') || '';
            if (entryType === 'dir') {
                loadIdeExplorer(relPath, '');
            } else {
                openIdeFile(relPath);
            }
        });
    });
}

async function openFileInIdeSection(rawPathOrUri) {
    switchSurface('ide', { skipInitialRefresh: true });
    const [, opened] = await Promise.all([
        refreshIdeWorkspace({ skipSubtabRender: true }),
        openIdeFile(rawPathOrUri, { autoSwitchWorkspace: true })
    ]);
    if (opened && opened.switchedWorkspace) {
        await refreshIdeWorkspace({ skipSubtabRender: true });
    } else if (!opened) {
        await renderCurrentIdeSubtab();
    }
}

async function openIdeFile(rawPathOrUri, { autoSwitchWorkspace = false } = {}) {
    ideEditingFile = false;
    ideSelectionStartLine = null;
    ideSelectionEndLine = null;

    if (IS_OFFLINE_PREVIEW) {
        const clean = String(rawPathOrUri || '').replace(/^file:\/\/\/?/i, '');
        const demoKey = Object.keys(OFFLINE_DEMO_FILES).find(k => clean.endsWith(k)) || 'hub_bridge.js';
        const content = OFFLINE_DEMO_FILES[demoKey];
        currentIdeFile = {
            path: demoKey,
            absoluteUri: `file:///demo/Remote-Control/${demoKey}`,
            fileName: demoKey.split('/').pop(),
            language: 'js',
            sizeBytes: content.length,
            isBinary: false,
            lineCount: content.split('\n').length,
            content
        };
        setIdeSubtab('code');
        return currentIdeFile;
    }

    try {
        const qs = new URLSearchParams({ path: String(rawPathOrUri || '') });
        if (autoSwitchWorkspace) qs.set('autoSwitchWorkspace', '1');
        const res = await fetchWithAuth(`/ide/file?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok || data.error) {
            showToast(data?.error || 'Could not open file in workspace');
            return null;
        }
        currentIdeFile = data;
        setIdeSubtab('code');
        return data;
    } catch (e) {
        showToast('Failed to load workspace file');
        return null;
    }
}

function renderIdeCodeTab() {
    if (!ideBodyScroll) return;
    if (!currentIdeFile) {
        ideBodyScroll.innerHTML = `
            <div class="history-state-container">
                <p>No file open yet</p>
                <p style="font-size:12px;">Pick any file from <strong>📁 Explorer</strong>, <strong>🔀 Git</strong>, or <strong>⚡ Session</strong> to inspect, edit, or quote lines to the Agent.</p>
            </div>
        `;
        return;
    }

    const f = currentIdeFile;
    const hasRange = ideSelectionStartLine !== null;
    const sLine = hasRange ? Math.min(ideSelectionStartLine, ideSelectionEndLine ?? ideSelectionStartLine) : null;
    const eLine = hasRange ? Math.max(ideSelectionStartLine, ideSelectionEndLine ?? ideSelectionStartLine) : null;
    const quoteBtnLabel = hasRange
        ? `❝ Quote L${sLine}${eLine !== sLine ? '-' + eLine : ''} to Agent`
        : '❝ Quote File to Agent';

    if (f.isBinary) {
        ideBodyScroll.innerHTML = `
            <div class="ide-code-header">
                <span class="ide-code-filepath">${escapeHtml(f.path)} (${formatFileSizeShort(f.sizeBytes)})</span>
                <button type="button" class="ide-action-btn" id="ideOpenBinDesktopBtn">↗ Open in Desktop IDE</button>
            </div>
            <div class="history-state-container"><p>Binary file (${formatFileSizeShort(f.sizeBytes)}) — open on Desktop IDE to inspect.</p></div>
        `;
        document.getElementById('ideOpenBinDesktopBtn')?.addEventListener('click', () => openInDesktopIde(f.path, 1));
        return;
    }

    if (ideEditingFile) {
        ideBodyScroll.innerHTML = `
            <div class="ide-code-header">
                <span class="ide-code-filepath">✏️ Editing ${escapeHtml(f.path)}</span>
                <div class="ide-code-toolbar">
                    <button type="button" class="ide-action-btn" id="ideCancelEditBtn">Cancel</button>
                    <button type="button" class="ide-action-btn primary" id="ideSaveFileBtn" data-testid="ide-save-file-btn">💾 Save File</button>
                </div>
            </div>
            <textarea class="ide-editor-textarea" id="ideEditorTextarea" data-testid="ide-editor-textarea" spellcheck="false">${escapeHtml(f.content || '')}</textarea>
        `;
        document.getElementById('ideCancelEditBtn')?.addEventListener('click', () => {
            ideEditingFile = false;
            renderIdeCodeTab();
        });
        document.getElementById('ideSaveFileBtn')?.addEventListener('click', async () => {
            const updatedContent = document.getElementById('ideEditorTextarea')?.value ?? '';
            await saveIdeFile(f.path, updatedContent);
        });
        return;
    }

    const lines = String(f.content || '').replace(/\r\n/g, '\n').split('\n');
    const linesHtml = lines
        .map((ln, idx) => {
            const lineNo = idx + 1;
            const isSelected = hasRange && lineNo >= sLine && lineNo <= eLine;
            return `
                <div class="ide-code-line ${isSelected ? 'selected' : ''}" data-ide-line="${lineNo}">
                    <span class="ide-line-num">${lineNo}</span>
                    <span class="ide-line-text">${escapeHtml(ln)}</span>
                </div>
            `;
        })
        .join('');

    ideBodyScroll.innerHTML = `
        <div class="ide-code-header">
            <div>
                <div class="ide-code-filepath">${escapeHtml(f.path)}</div>
                <div class="ide-entry-meta">${f.lineCount} lines · ${formatFileSizeShort(f.sizeBytes)}${f.truncated ? ' · Preview truncated' : ''}</div>
            </div>
            <div class="ide-code-toolbar">
                <button type="button" class="ide-action-btn primary" id="ideQuoteToAgentBtn" data-testid="ide-quote-file-btn">${escapeHtml(quoteBtnLabel)}</button>
                <button type="button" class="ide-action-btn" id="ideEditToggleBtn" data-testid="ide-edit-file-btn">✏️ Edit</button>
                <button type="button" class="ide-action-btn" id="ideOpenFileDesktopBtn">↗ Desktop</button>
            </div>
        </div>
        <div class="ide-line-hint">
            ${
                hasRange
                    ? `Selected lines ${sLine}–${eLine}. Tap "Quote to Agent" to attach as native file-range context, or tap any line to adjust.`
                    : 'Tip: Tap a start line and end line below to quote a specific code range directly into Antigravity chat.'
            }
        </div>
        <div class="ide-code-lines-box" data-testid="ide-code-lines-box">${linesHtml}</div>
    `;

    ideBodyScroll.querySelectorAll('[data-ide-line]').forEach(row => {
        row.addEventListener('click', () => {
            triggerHaptic('light');
            const num = parseInt(row.getAttribute('data-ide-line') || '1', 10);
            if (ideSelectionStartLine === null || (ideSelectionStartLine !== null && ideSelectionEndLine !== null)) {
                ideSelectionStartLine = num;
                ideSelectionEndLine = null;
            } else {
                ideSelectionEndLine = num;
            }
            renderIdeCodeTab();
        });
    });

    document.getElementById('ideEditToggleBtn')?.addEventListener('click', () => {
        if (f.truncated) {
            showToast('File exceeds 512KB mobile edit limit — open on Desktop IDE');
            return;
        }
        ideEditingFile = true;
        renderIdeCodeTab();
    });

    document.getElementById('ideOpenFileDesktopBtn')?.addEventListener('click', () => {
        openInDesktopIde(f.path, sLine || 1);
    });

    document.getElementById('ideQuoteToAgentBtn')?.addEventListener('click', () => {
        const start = sLine || 1;
        const end = eLine || Math.min(lines.length, 120);
        const excerpt = lines.slice(start - 1, end).join('\n');
        const rangeTag = start === end ? `${f.fileName}:${start}` : `${f.fileName}:${start}-${end}`;
        switchSurface('antigravity');
        addQuoteToComposer(
            {
                content: excerpt,
                label: 'code_block',
                sourceLabel: rangeTag,
                fileUri: f.absoluteUri || f.path,
                startLine: start,
                endLine: end
            },
            'answer'
        );
        showToast(`Quoted ${rangeTag} into Antigravity composer`);
    });
}

async function saveIdeFile(relPath, content) {
    if (IS_OFFLINE_PREVIEW) {
        OFFLINE_DEMO_FILES[relPath] = content;
        currentIdeFile.content = content;
        currentIdeFile.lineCount = content.split('\n').length;
        currentIdeFile.sizeBytes = content.length;
        ideEditingFile = false;
        renderIdeCodeTab();
        showToast(`Saved ${relPath} (Offline Demo)`);
        return;
    }

    try {
        const res = await fetchWithAuth('/ide/file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: relPath, content })
        });
        const out = await res.json();
        if (!res.ok || out.error) {
            showToast(out?.error || 'Failed to save file');
            return;
        }
        currentIdeFile.content = content;
        currentIdeFile.lineCount = out.lineCount || content.split(/\r?\n/).length;
        currentIdeFile.sizeBytes = out.sizeBytes || content.length;
        ideEditingFile = false;
        triggerHaptic('success');
        renderIdeCodeTab();
        showToast(`Saved ${relPath}`);
    } catch (e) {
        showToast('Network error saving file');
    }
}

async function loadIdeGit(diffFile = '') {
    if (!ideBodyScroll) return;
    let gitData;
    if (IS_OFFLINE_PREVIEW) {
        gitData = {
            success: true,
            isGitRepo: true,
            branch: 'main',
            ahead: 1,
            behind: 0,
            changedCount: 2,
            files: [
                { path: 'hub_bridge.js', xy: 'M', state: 'modified' },
                { path: 'public/js/app.js', xy: 'M', state: 'modified' }
            ],
            diffFile: diffFile || 'hub_bridge.js',
            diff: '+ async getQuotaSummary(forceRefresh = false) {\n+     return this.callRpc("RetrieveUserQuotaSummary", { forceRefresh });\n+ }'
        };
    } else {
        try {
            const qs = diffFile ? `?diffFile=${encodeURIComponent(diffFile)}` : '';
            const res = await fetchWithAuth(`/ide/git${qs}`);
            gitData = await res.json();
            cachedIdeGit = gitData;
        } catch (e) {
            ideBodyScroll.innerHTML = `<div class="history-state-container"><p>Unable to read Git status</p></div>`;
            return;
        }
    }

    if (!gitData?.isGitRepo) {
        ideBodyScroll.innerHTML = `<div class="history-state-container"><p>Active workspace is not a Git repository</p></div>`;
        return;
    }

    const files = Array.isArray(gitData.files) ? gitData.files : [];
    if (ideGitCountPill) {
        ideGitCountPill.style.display = files.length > 0 ? 'inline-block' : 'none';
        ideGitCountPill.textContent = String(files.length);
    }

    const syncNote = [
        gitData.ahead ? `↑${gitData.ahead}` : '',
        gitData.behind ? `↓${gitData.behind}` : ''
    ]
        .filter(Boolean)
        .join(' ');

    const filesHtml =
        files.length === 0
            ? `<div class="history-state-container" style="padding:16px;"><p>Working tree clean ✨</p></div>`
            : files
                  .map(
                      f => `
                <div class="ide-entry-row" data-ide-git-file="${escapeHtml(f.path)}">
                    <div class="ide-entry-left">
                        <span class="agy-diff-add">${escapeHtml(f.xy)}</span>
                        <span class="ide-entry-name">${escapeHtml(f.path)}</span>
                    </div>
                    <button type="button" class="ide-crumb-btn" data-ide-open-git-code="${escapeHtml(f.path)}">Open</button>
                </div>
            `
                  )
                  .join('');

    const diffBlockHtml = gitData.diff
        ? `
            <div class="ide-code-header" style="margin-top:6px;">
                <span class="ide-code-filepath">Diff · ${escapeHtml(gitData.diffFile || '')}</span>
                <button type="button" class="ide-action-btn primary" id="ideQuoteGitDiffBtn">❝ Quote Diff to Agent</button>
            </div>
            <pre class="ide-git-diff-box">${escapeHtml(gitData.diff)}</pre>
        `
        : '';

    ideBodyScroll.innerHTML = `
        <div class="ide-git-banner">
            <span>🌿 Branch: <strong>${escapeHtml(gitData.branch || 'HEAD')}</strong> ${escapeHtml(syncNote)}</span>
            <span>${files.length} changed</span>
        </div>
        <div class="ide-entry-list">${filesHtml}</div>
        ${diffBlockHtml}
    `;

    ideBodyScroll.querySelectorAll('[data-ide-git-file]').forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('[data-ide-open-git-code]')) return;
            const fp = row.getAttribute('data-ide-git-file') || '';
            if (fp) loadIdeGit(fp);
        });
    });

    ideBodyScroll.querySelectorAll('[data-ide-open-git-code]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fp = btn.getAttribute('data-ide-open-git-code') || '';
            if (fp) openIdeFile(fp);
        });
    });

    document.getElementById('ideQuoteGitDiffBtn')?.addEventListener('click', () => {
        if (!gitData.diff) return;
        switchSurface('antigravity');
        addQuoteToComposer(
            {
                content: gitData.diff.slice(0, 6000),
                label: 'code_block',
                sourceLabel: `git diff · ${gitData.diffFile || 'workspace'}`
            },
            'answer'
        );
        showToast('Quoted Git diff into Antigravity composer');
    });
}

function renderIdeSessionChanged() {
    if (!ideBodyScroll) return;
    const list = cachedSessionChangedFiles || [];
    if (list.length === 0) {
        ideBodyScroll.innerHTML = `
            <div class="history-state-container">
                <p>No files edited in this conversation yet</p>
                <p style="font-size:12px;">Files created or modified by Antigravity agents appear here for instant inspection.</p>
            </div>
        `;
        return;
    }

    ideBodyScroll.innerHTML = `
        <div class="ide-entry-list">
            ${list
                .map(
                    item => `
                <button type="button" class="ide-entry-row" data-ide-session-uri="${escapeHtml(item.rawUri || item.localPath || '')}">
                    <div class="ide-entry-left">
                        <span>${escapeHtml(item.actionLabel || '✏️ Edited')}</span>
                        <span class="ide-entry-name">${escapeHtml(item.shortName || item.rawUri)}</span>
                    </div>
                    <span class="ide-entry-meta">+${item.additions || 0} / -${item.deletions || 0}</span>
                </button>
            `
                )
                .join('')}
        </div>
    `;

    ideBodyScroll.querySelectorAll('[data-ide-session-uri]').forEach(row => {
        row.addEventListener('click', () => {
            const u = row.getAttribute('data-ide-session-uri') || '';
            if (u) openIdeFile(u);
        });
    });
}

// =========================================================================
// QoL Utilities: In-Chat Search, Draft Persistence, Recent Prompts & Export
// =========================================================================
function openChatFindBar(initialQuery = '') {
    if (currentSurface !== 'antigravity') switchSurface('antigravity');
    if (!chatFindBar || !chatFindInput) return;
    chatFindBar.style.display = 'flex';
    chatFindToggleBtn?.classList.add('active');
    if (initialQuery) chatFindInput.value = initialQuery;
    applyChatFindHighlights(true);
    chatFindInput.focus();
}

function closeChatFindBar() {
    if (chatFindBar) chatFindBar.style.display = 'none';
    chatFindToggleBtn?.classList.remove('active');
    chatFindMatches = [];
    chatFindActiveIdx = 0;
    chatContent?.querySelectorAll('.agy-turn.find-matched, .agy-turn.find-active').forEach(el => {
        el.classList.remove('find-matched', 'find-active');
    });
}

function applyChatFindHighlights(scrollToFirst = true) {
    if (!chatContent || !chatFindInput) return;
    const q = (chatFindInput.value || '').trim().toLowerCase();
    chatContent.querySelectorAll('.agy-turn.find-matched, .agy-turn.find-active').forEach(el => {
        el.classList.remove('find-matched', 'find-active');
    });
    chatFindMatches = [];
    if (!q) {
        if (chatFindCount) chatFindCount.textContent = '0/0';
        return;
    }

    const turns = Array.from(chatContent.querySelectorAll('.agy-turn, .agy-delegated-task-card, .agy-tool-pill'));
    turns.forEach(turn => {
        if ((turn.textContent || '').toLowerCase().includes(q)) {
            turn.classList.add('find-matched');
            chatFindMatches.push(turn);
        }
    });

    if (chatFindMatches.length === 0) {
        chatFindActiveIdx = 0;
        if (chatFindCount) chatFindCount.textContent = '0/0';
        return;
    }

    if (chatFindActiveIdx >= chatFindMatches.length) chatFindActiveIdx = 0;
    const activeTurn = chatFindMatches[chatFindActiveIdx];
    activeTurn.classList.add('find-active');
    if (chatFindCount) chatFindCount.textContent = `${chatFindActiveIdx + 1}/${chatFindMatches.length}`;
    if (scrollToFirst) {
        userScrollLockUntil = Date.now() + 5000;
        activeTurn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function stepChatFind(delta) {
    if (chatFindMatches.length === 0) return;
    chatFindMatches.forEach(el => el.classList.remove('find-active'));
    chatFindActiveIdx = (chatFindActiveIdx + delta + chatFindMatches.length) % chatFindMatches.length;
    const target = chatFindMatches[chatFindActiveIdx];
    target.classList.add('find-active');
    if (chatFindCount) chatFindCount.textContent = `${chatFindActiveIdx + 1}/${chatFindMatches.length}`;
    userScrollLockUntil = Date.now() + 5000;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const DRAFT_STORAGE_KEY = 'agy_composer_draft_v6';
const RECENT_PROMPTS_KEY = 'agy_recent_prompts_v6';

function saveComposerDraft() {
    try {
        const payload = {
            text: messageInput?.value || '',
            quotes: pendingQuotes.slice(0, 8)
        };
        if (!payload.text && payload.quotes.length === 0) {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        } else {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
        }
    } catch {}
}

function restoreComposerDraft() {
    try {
        if ((messageInput?.value || '').trim() || pendingQuotes.length > 0) return;
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.text === 'string' && parsed.text) {
            messageInput.value = parsed.text;
            syncActiveSlashChips();
        }
        if (Array.isArray(parsed?.quotes) && parsed.quotes.length > 0) {
            pendingQuotes = parsed.quotes;
            renderQuotePreviews();
        }
    } catch {}
}

function clearSavedComposerDraft() {
    try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
}

function getRecentPrompts() {
    try {
        const raw = localStorage.getItem(RECENT_PROMPTS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function recordRecentPrompt(text) {
    const clean = String(text || '').trim();
    if (!clean) return;
    try {
        const existing = getRecentPrompts().filter(p => p !== clean);
        existing.unshift(clean);
        localStorage.setItem(RECENT_PROMPTS_KEY, JSON.stringify(existing.slice(0, 15)));
    } catch {}
}

function openRecentPromptsSheet() {
    triggerHaptic('light');
    const recents = getRecentPrompts();
    modalTitle.textContent = 'Recent Sent Prompts';
    if (recents.length === 0) {
        modalList.innerHTML = `<div class="history-state-container" style="padding:20px;"><p>No recent prompts yet</p><p style="font-size:12px;">Sent prompts are saved locally so you can reuse or tweak them in one tap (or press ↑ in an empty composer).</p></div>`;
    } else {
        modalList.innerHTML = recents
            .map(
                (p, idx) => `
                <button type="button" class="slash-sheet-item" data-recent-prompt-idx="${idx}">
                    <div class="slash-sheet-item-desc" style="color:var(--foreground); white-space:pre-wrap;">${escapeHtml(p.slice(0, 220))}${p.length > 220 ? '…' : ''}</div>
                </button>
            `
            )
            .join('');
        modalList.querySelectorAll('[data-recent-prompt-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.getAttribute('data-recent-prompt-idx') || '0', 10);
                const chosen = recents[i] || '';
                closeModal();
                if (chosen && messageInput) {
                    switchSurface('antigravity');
                    messageInput.value = chosen;
                    messageInput.focus();
                    messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });
    }
    modalOverlay.classList.add('show');
}

async function exportActiveConversation() {
    triggerHaptic('medium');
    hideChatHistoryUI();

    if (IS_OFFLINE_PREVIEW) {
        const demoMd = '# Antigravity Offline Preview\n\n## User\n`/boost` `/swarm` Inspect repository architecture.\n';
        await copyToClipboard(demoMd);
        showToast('Copied preview Markdown to clipboard');
        return;
    }

    try {
        const qs = activeCascadeId ? `?cascadeId=${encodeURIComponent(activeCascadeId)}` : '';
        const res = await fetchWithAuth(`/export-chat${qs}`);
        const data = await res.json();
        if (!res.ok || data.error || !data.markdown) {
            showToast(data?.error || 'Unable to export conversation');
            return;
        }
        await copyToClipboard(data.markdown);
        const isAndroidNative = !!(window.AndroidBridge && typeof window.AndroidBridge.isNativeApp === 'function');
        if (!isAndroidNative) {
            try {
                const blob = new Blob([data.markdown], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.fileName || 'antigravity-conversation.md';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1500);
            } catch {}
        }
        showToast('Conversation Markdown copied & exported');
    } catch (e) {
        showToast('Failed to export conversation');
    }
}

// =========================================================================
// Antigravity 2.33 Swarm UI (Overview w/ Pixel Bees, Board, Members, Graph, Raw)
// =========================================================================

function drawPixelBee(canvas, { role = 'worker', state = 'working', frame = 0 } = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = 12;
    const scale = 2;
    canvas.width = grid * scale;
    canvas.height = grid * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const retired = state === 'retired' || state === 'killed';
    const waiting = state === 'waiting';
    const px = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
    };

    const C_OUTLINE = retired ? '#3b3e45' : '#181410';
    const C_GOLD = retired ? '#7c7666' : role === 'coordinator' ? '#ffd859' : '#f5be3b';
    const C_DARK = retired ? '#43464d' : '#2a221b';
    const C_EYE = retired ? '#aab0ba' : '#ffffff';
    const C_WING = retired ? 'rgba(180,190,205,0.42)' : 'rgba(216,241,255,0.88)';
    const C_WING_EDGE = retired ? 'rgba(140,150,165,0.55)' : 'rgba(125,211,252,0.92)';
    const C_CROWN = retired ? '#958963' : '#ffdf5e';
    const C_GEM = retired ? '#6c7a89' : '#38bdf8';

    // Queen Crown for Coordinator
    if (role === 'coordinator') {
        px(4, 1, C_CROWN);
        px(6, 0, C_CROWN);
        px(8, 1, C_CROWN);
        px(4, 2, C_CROWN);
        px(5, 2, C_CROWN);
        px(6, 2, C_GEM);
        px(7, 2, C_CROWN);
        px(8, 2, C_CROWN);
    }

    // Wings (2-frame flapping when working, folded back when waiting/retired)
    if (waiting || retired) {
        px(4, 3, C_WING_EDGE);
        px(5, 3, C_WING);
        px(6, 3, C_WING);
        px(5, 4, C_WING);
    } else if (frame === 0) {
        px(4, 2, C_WING_EDGE);
        px(5, 2, C_WING);
        px(3, 3, C_WING_EDGE);
        px(4, 3, C_WING);
        px(5, 3, C_WING);
        px(6, 3, C_WING_EDGE);
    } else {
        px(3, 4, C_WING_EDGE);
        px(4, 4, C_WING);
        px(5, 4, C_WING);
        px(6, 3, C_WING_EDGE);
        px(5, 3, C_WING);
    }

    // Bee Body Outline & Stripes
    const bodyRows = [
        [4, 4, C_OUTLINE], [5, 4, C_OUTLINE], [6, 4, C_OUTLINE], [7, 4, C_OUTLINE], [8, 4, C_OUTLINE],
        [3, 5, C_OUTLINE], [4, 5, C_GOLD], [5, 5, C_DARK], [6, 5, C_GOLD], [7, 5, C_DARK], [8, 5, C_GOLD], [9, 5, C_OUTLINE],
        [2, 6, C_DARK], [3, 6, C_GOLD], [4, 6, C_GOLD], [5, 6, C_DARK], [6, 6, C_GOLD], [7, 6, C_DARK], [8, 6, C_GOLD], [9, 6, C_EYE], [10, 6, C_OUTLINE],
        [3, 7, C_OUTLINE], [4, 7, C_GOLD], [5, 7, C_DARK], [6, 7, C_GOLD], [7, 7, C_DARK], [8, 7, C_GOLD], [9, 7, C_OUTLINE],
        [4, 8, C_OUTLINE], [5, 8, C_OUTLINE], [6, 8, C_OUTLINE], [7, 8, C_OUTLINE], [8, 8, C_OUTLINE]
    ];
    for (const [bx, by, bc] of bodyRows) {
        // Keep wing highlight visible on row 4 if frame 1
        if (by === 4 && !waiting && !retired && frame === 1 && (bx === 4 || bx === 5)) continue;
        px(bx, by, bc);
    }

    // Antennae
    px(9, 4, C_OUTLINE);
    px(10, 3, C_OUTLINE);

    // Cute Z indicator when parked/waiting on board
    if (waiting && !retired) {
        px(9, 1, '#7dd3fc');
        px(10, 1, '#7dd3fc');
        px(10, 2, '#7dd3fc');
        px(9, 2, '#38bdf8');
    }
}

function renderBeeAvatarHtml({ role = 'worker', status = 'working', killed = false, failure = null, small = false } = {}) {
    const beeState = killed ? 'retired' : status === 'working' ? 'working' : 'waiting';
    const dotCls = killed ? '' : failure ? 'issue' : status === 'working' ? 'working' : 'waiting';
    const tileStyle = small
        ? 'width:24px;height:24px;border-radius:7px;'
        : '';
    const wrapStyle = small ? 'width:18px;height:18px;' : '';
    return `
        <span class="sw-bee-tile" style="${tileStyle}">
            <span class="sw-bee-wrap" style="${wrapStyle}" data-bee-state="${beeState}" data-bee-role="${escapeHtml(role)}">
                <canvas class="sw-bee-f0" width="24" height="24"></canvas>
                <canvas class="sw-bee-f1" width="24" height="24"></canvas>
            </span>
            ${!small ? `<span class="sw-bee-dot ${dotCls}"></span>` : ''}
        </span>
    `;
}

function paintSwarmBees(rootEl) {
    const scope = rootEl || swarmContainer || document;
    scope.querySelectorAll('.sw-bee-wrap').forEach(wrap => {
        const role = wrap.getAttribute('data-bee-role') || 'worker';
        const state = wrap.getAttribute('data-bee-state') || 'working';
        const c0 = wrap.querySelector('canvas.sw-bee-f0');
        const c1 = wrap.querySelector('canvas.sw-bee-f1');
        if (c0) drawPixelBee(c0, { role, state, frame: 0 });
        if (c1) drawPixelBee(c1, { role, state, frame: 1 });
    });
}

function buildOfflineDemoSwarmSnapshot() {
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const members = [
        {
            name: 'coordinator',
            conversation_id: 'offline-coord',
            model: 'Gemini 4 Neon (High)',
            modelDisplayName: 'Gemini 4 Neon (High)',
            role: 'coordinator',
            wake_mode: 'mentions',
            workspace_mode: 'inherit',
            status: 'waiting',
            last_read_seq: 7,
            unread: 0,
            killed: false,
            steps: 18,
            activity: 'Monitoring swarm_wait on #main and #mobile',
            activityKind: 'tool',
            posts: 3
        },
        {
            name: 'architect',
            conversation_id: 'offline-architect',
            model: 'Orchestrator (Neon)',
            modelDisplayName: 'Orchestrator (Neon)',
            role: 'worker',
            wake_mode: 'mentions',
            workspace_mode: 'worktree',
            status: 'waiting',
            last_read_seq: 7,
            unread: 0,
            killed: false,
            steps: 24,
            activity: 'Completed Swarm engine & ConnectRPC snapshot schema',
            activityKind: 'thinking',
            posts: 2
        },
        {
            name: 'ui-builder',
            conversation_id: 'offline-ui',
            model: 'Gemini 4 Argon (High)',
            modelDisplayName: 'Gemini 4 Argon (High)',
            role: 'worker',
            wake_mode: 'mentions',
            workspace_mode: 'worktree',
            status: 'working',
            last_read_seq: 5,
            unread: 2,
            killed: false,
            steps: 31,
            activity: 'Editing public/js/app.js · Pixel-Bee canvas & SVG graph',
            activityKind: 'edit',
            posts: 1
        },
        {
            name: 'verifier',
            conversation_id: 'offline-verifier',
            model: 'Gemini 3.8 Flash (High)',
            modelDisplayName: 'Gemini 3.8 Flash (High)',
            role: 'worker',
            wake_mode: 'anything',
            workspace_mode: 'inherit',
            status: 'working',
            last_read_seq: 6,
            unread: 1,
            killed: false,
            steps: 15,
            activity: 'Running node tests/verify_remote_control.mjs',
            activityKind: 'command',
            posts: 1
        },
        {
            name: 'scout',
            conversation_id: 'offline-scout',
            model: 'Gemini 3.8 Flash (Medium)',
            modelDisplayName: 'Gemini 3.8 Flash (Medium)',
            role: 'worker',
            wake_mode: 'never',
            workspace_mode: 'inherit',
            status: 'killed',
            last_read_seq: 3,
            unread: 0,
            killed: true,
            steps: 9,
            activity: 'Retired after initial codebase scan',
            activityKind: '',
            posts: 0
        }
    ];

    const channels = [
        { name: 'mobile', topic: '360x800 Android WebView & touch UX', created_by: 'coordinator', archived: false }
    ];

    const messages = [
        {
            seq: 1,
            agent: 'coordinator',
            text: '@all Splitting Antigravity 2.33 Swarm UI into 3 parallel tracks: @architect owns Hub bridge, @ui-builder owns 5-tab mobile board, @verifier owns headless Chrome & Gradle verification.',
            time: nowIso,
            ts: Date.now() - 240000,
            kind: 'brief',
            mentions: [],
            all: true
        },
        {
            seq: 2,
            agent: 'architect',
            text: '@coordinator @ui-builder Exposed GET /swarm and GET /swarm/list with etag fast-path and WebSocket swarm_update push.',
            time: nowIso,
            ts: Date.now() - 190000,
            kind: '',
            mentions: ['coordinator', 'ui-builder'],
            all: false
        },
        {
            seq: 3,
            agent: 'architect',
            text: '@coordinator [done] Completed read-only board.jsonl + members.json + transcript.jsonl parser (re #1).',
            time: nowIso,
            ts: Date.now() - 175000,
            kind: '',
            mentions: ['coordinator'],
            all: false
        },
        {
            seq: 4,
            agent: 'coordinator',
            text: '@ui-builder Great progress in #3 — wire the 5 subtabs (Overview, Board, Members, Graph, Raw) in @#mobile.',
            time: nowIso,
            ts: Date.now() - 130000,
            kind: '',
            channel: 'mobile',
            mentions: ['ui-builder'],
            channel_mentions: ['mobile'],
            all: false
        },
        {
            seq: 5,
            agent: 'ui-builder',
            text: '@coordinator @verifier Implemented flapping pixel-bee sprites, clickable #3 citations, and @mention graph replay on #mobile.',
            time: nowIso,
            ts: Date.now() - 80000,
            kind: '',
            channel: 'mobile',
            mentions: ['coordinator', 'verifier'],
            all: false
        },
        {
            seq: 6,
            agent: 'verifier',
            text: '@ui-builder @coordinator Verified zero horizontal overflow at 360x800px (re #5); running full suite next.',
            time: nowIso,
            ts: Date.now() - 35000,
            kind: '',
            mentions: ['ui-builder', 'coordinator'],
            all: false
        },
        {
            seq: 7,
            agent: 'coordinator',
            text: '@verifier Keep streaming test assertions; post [done] once all offline + live checks pass.',
            time: nowIso,
            ts: Date.now() - 12000,
            kind: '',
            mentions: ['verifier'],
            all: false
        }
    ];

    const workstreams = [
        {
            id: 'ws-architect',
            title: 'Swarm Engine & Live WebSocket Bridge',
            note: 'Completed read-only board.jsonl + members.json + transcript.jsonl parser.',
            owners: ['architect'],
            state: 'done',
            rawState: 'done',
            seq: 3,
            liveActivity: ''
        },
        {
            id: 'ws-ui-builder',
            title: '5-Tab Mobile Swarm Board & Pixel-Bee Sprites',
            note: 'Editing public/js/app.js · Pixel-Bee canvas & SVG graph',
            owners: ['ui-builder'],
            state: 'running',
            rawState: 'active',
            seq: 5,
            liveActivity: 'Editing public/js/app.js · Pixel-Bee canvas & SVG graph'
        },
        {
            id: 'ws-verifier',
            title: 'End-to-End 360x800 Chrome & Android Verification',
            note: 'Running node tests/verify_remote_control.mjs',
            owners: ['verifier'],
            state: 'running',
            rawState: 'active',
            seq: 6,
            liveActivity: 'Running node tests/verify_remote_control.mjs'
        }
    ];

    return {
        success: true,
        kind: 'native_swarm',
        conversationId: 'offline-coord',
        swarm: 'offline-demo-swarm',
        coordinatorId: 'offline-coord',
        member: 'ui-builder',
        id: 'offline-demo-swarm',
        title: 'Antigravity Mobile Swarm',
        etag: 'offline-demo-etag-v1',
        head: 7,
        members,
        messages,
        channels,
        edges: [
            { from: 'architect', to: 'coordinator', count: 2, direct: 2, viaAll: 0 },
            { from: 'architect', to: 'ui-builder', count: 1, direct: 1, viaAll: 0 },
            { from: 'coordinator', to: 'ui-builder', count: 2, direct: 1, viaAll: 1 },
            { from: 'coordinator', to: 'architect', count: 1, direct: 0, viaAll: 1 },
            { from: 'coordinator', to: 'verifier', count: 2, direct: 1, viaAll: 1 },
            { from: 'ui-builder', to: 'coordinator', count: 1, direct: 1, viaAll: 0 },
            { from: 'ui-builder', to: 'verifier', count: 1, direct: 1, viaAll: 0 },
            { from: 'verifier', to: 'ui-builder', count: 1, direct: 1, viaAll: 0 },
            { from: 'verifier', to: 'coordinator', count: 1, direct: 1, viaAll: 0 }
        ],
        overview: {
            goal: {
                title: 'Implement Native Antigravity 2.33 Swarm UI on Mobile & Web',
                line: '1 of 3 workstreams complete · Coordinator @coordinator'
            },
            phase: { label: 'Implementation & Verification', index: 2, total: 3 },
            counts: { total: 3, done: 1, running: 2, blocked: 0, review: 0, queued: 0 },
            finished: false,
            starting: false,
            attention: [],
            workstreams,
            threads: []
        },
        systemAttention: [],
        unseen: [],
        availableSwarms: [
            {
                swarmId: 'offline-demo-swarm',
                coordinatorId: 'offline-coord',
                title: 'Antigravity Mobile Swarm (Offline Demo)',
                memberCount: 4,
                workingCount: 2,
                waitingCount: 2,
                killedCount: 1,
                postCount: 7,
                isCurrentConversation: true
            }
        ],
        raw: {
            swarm: JSON.stringify({ id: 'offline-demo-swarm', created_at: nowIso }, null, 2),
            members: JSON.stringify(
                {
                    title: 'Antigravity Mobile Swarm',
                    members: Object.fromEntries(
                        members.map(m => [
                            m.name,
                            {
                                conversation_id: m.conversation_id,
                                model: m.model,
                                role: m.role,
                                wake_mode: m.wake_mode,
                                last_read_seq: m.last_read_seq,
                                killed: m.killed
                            }
                        ])
                    )
                },
                null,
                2
            ),
            board: messages.map(m => JSON.stringify(m)).join('\n'),
            view: JSON.stringify({ headline: 'Antigravity Mobile Swarm', phase: { label: 'Build', index: 2, total: 3 } }, null, 2),
            plan: JSON.stringify({ goal: { title: 'Antigravity 2.33 Swarm UI' }, tasks: { architect: 'Hub Bridge', 'ui-builder': 'Mobile UI', verifier: 'Tests' } }, null, 2)
        }
    };
}

function scheduleSwarmUiRefresh(delayMs = 90) {
    clearTimeout(swarmRefreshTimer);
    swarmRefreshTimer = setTimeout(() => {
        if (currentSurface === 'swarm') {
            refreshSwarmUi(false);
        }
    }, delayMs);
}

function syncSwarmSubtabButtons() {
    document.querySelectorAll('.swarm-subtab[data-swarm-tab]').forEach(btn => {
        const isAct = btn.getAttribute('data-swarm-tab') === currentSwarmSubtab;
        btn.classList.toggle('active', isAct);
    });
}

function setSwarmSubtab(nextTab) {
    const valid = ['overview', 'feed', 'members', 'graph', 'raw'];
    const target = valid.includes(nextTab) ? nextTab : 'overview';
    if (currentSwarmSubtab === 'graph' && target !== 'graph') {
        stopSwarmGraphPlayback();
    }
    currentSwarmSubtab = target;
    syncSwarmSubtabButtons();
    renderCurrentSwarmSubtab(true);
}

async function refreshSwarmUi(forceFull = false) {
    if (IS_OFFLINE_PREVIEW) {
        cachedSwarmSnapshot = buildOfflineDemoSwarmSnapshot();
        renderSwarmTopChrome(cachedSwarmSnapshot);
        renderCurrentSwarmSubtab(forceFull);
        return;
    }

    const reqSeq = ++swarmFetchReqSeq;
    try {
        if (forceFull && !cachedSwarmSnapshot && swarmBodyScroll) {
            swarmBodyScroll.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Syncing Swarm Board…</p></div>`;
        }

        const params = new URLSearchParams();
        if (activeCascadeId) params.set('conversationId', activeCascadeId);
        if (selectedSwarmIdOverride) params.set('swarmId', selectedSwarmIdOverride);
        if (!forceFull && cachedSwarmEtag) params.set('etag', cachedSwarmEtag);

        const qs = params.toString();
        const res = await fetchWithAuth(`/swarm${qs ? `?${qs}` : ''}`);
        const data = await res.json();
        if (reqSeq !== swarmFetchReqSeq) {
            return;
        }
        if (!res.ok || !data || data.error) {
            if (!cachedSwarmSnapshot && swarmBodyScroll) {
                swarmBodyScroll.innerHTML = `<div class="ide-empty-note">${escapeHtml(data?.error || 'Unable to load Swarm Board')}</div>`;
            }
            return;
        }

        if (!data.swarm && data.notFoundSwarmId && selectedSwarmIdOverride === data.notFoundSwarmId) {
            const missingShort = String(data.notFoundSwarmId).slice(0, 8);
            selectedSwarmIdOverride = '';
            cachedSwarmEtag = '';
            showToast(`Swarm ${missingShort} not found — following active chat`);
            return refreshSwarmUi(true);
        }

        if (data.unchanged && cachedSwarmSnapshot) {
            if (Array.isArray(data.availableSwarms)) {
                cachedSwarmSnapshot.availableSwarms = data.availableSwarms;
                renderSwarmTopChrome(cachedSwarmSnapshot);
            }
            return;
        }

        cachedSwarmSnapshot = data;
        cachedSwarmEtag = data.etag || '';

        // If active conversation isn't in a swarm and user hasn't picked one, keep badge synced cleanly
        if (data.swarm && !selectedSwarmIdOverride) {
            const activePeople = (data.members || []).filter(m => !m.roleWorker && !m.narrator);
            syncSwarmNavBadge({
                hasSwarm: true,
                swarmId: data.id,
                workingCount: activePeople.filter(m => !m.killed && m.status === 'working').length,
                waitingCount: activePeople.filter(m => !m.killed && m.status === 'waiting').length,
                totalMembers: activePeople.filter(m => !m.killed).length,
                head: data.head || 0,
                alertCount: (data.systemAttention?.length || 0) + (data.overview?.attention?.length || 0)
            });
        }

        renderSwarmTopChrome(data);

        // Preserve active typing inside Board/Members search inputs during live background updates
        const activeEl = document.activeElement;
        if (!forceFull && activeEl && swarmBodyScroll && swarmBodyScroll.contains(activeEl)) {
            if (activeEl.id === 'swarmBoardSearchInput' && currentSwarmSubtab === 'feed') {
                renderSwarmBoardFeedListOnly(data, false);
                return;
            }
            if (activeEl.id === 'swarmMembersSearchInput' && currentSwarmSubtab === 'members') {
                renderSwarmMembersListOnly(data);
                return;
            }
            if (activeEl.tagName === 'SELECT') {
                return;
            }
        }

        renderCurrentSwarmSubtab(forceFull);
    } catch (e) {
        if (reqSeq !== swarmFetchReqSeq) return;
        if (!cachedSwarmSnapshot && swarmBodyScroll) {
            swarmBodyScroll.innerHTML = `<div class="ide-empty-note">Network error loading Swarm UI</div>`;
        }
    }
}

function renderSwarmTopChrome(data) {
    const hasSwarm = Boolean(data && data.swarm);
    const members = Array.isArray(data?.members) ? data.members : [];
    const activeTaskMembers = members.filter(m => !m.killed && !m.roleWorker && !m.narrator);
    const workingCount = activeTaskMembers.filter(m => m.status === 'working').length;
    const waitingCount = activeTaskMembers.filter(m => m.status === 'waiting').length;
    const sysAlerts = Array.isArray(data?.systemAttention) ? data.systemAttention : [];
    const ovAlerts = Array.isArray(data?.overview?.attention) ? data.overview.attention : [];
    const totalAlerts = sysAlerts.length + ovAlerts.length;

    if (swarmTitleText) {
        swarmTitleText.textContent = hasSwarm ? data.title || 'Swarm Board' : 'Swarm Board';
    }

    if (swarmLivePill && swarmLiveDot && swarmLiveLabel) {
        swarmLivePill.classList.remove('idle', 'issue');
        swarmLiveDot.classList.remove('idle', 'issue', 'pulsing');
        if (!hasSwarm) {
            swarmLivePill.classList.add('idle');
            swarmLiveDot.classList.add('idle');
            swarmLiveLabel.textContent = 'Standby';
        } else if (sysAlerts.length > 0) {
            swarmLivePill.classList.add('issue');
            swarmLiveDot.classList.add('issue');
            swarmLiveLabel.textContent = `${sysAlerts.length} Issue${sysAlerts.length > 1 ? 's' : ''}`;
        } else if (workingCount > 0) {
            swarmLiveDot.classList.add('pulsing');
            swarmLiveLabel.textContent = IS_OFFLINE_PREVIEW ? `Demo · ${workingCount} active` : `Live · ${workingCount} active`;
        } else {
            swarmLivePill.classList.add('idle');
            swarmLiveDot.classList.add('idle');
            swarmLiveLabel.textContent = data.overview?.finished ? 'Completed' : 'Parked';
        }
    }

    if (swarmMetaLine) {
        if (!hasSwarm) {
            const countOnPc = Array.isArray(data?.availableSwarms) ? data.availableSwarms.length : 0;
            swarmMetaLine.textContent =
                countOnPc > 0
                    ? `Active conversation has no swarm yet · ${countOnPc} swarm${countOnPc > 1 ? 's' : ''} available on PC`
                    : 'No active swarm in this conversation · Launch /swarm or /boost /swarm';
        } else {
            const kindBadge = data.kind === 'subagent_tree' ? 'Boost Subagent Tree' : 'Native Hive Board';
            const agentCount = activeTaskMembers.length;
            const agentWord = agentCount === 1 ? 'agent' : 'agents';
            const viewerTag = data.member ? ` · Viewing as @${data.member}` : '';
            swarmMetaLine.textContent = `${kindBadge} · ${agentCount} ${agentWord} (${workingCount} working, ${waitingCount} waiting) · #${data.head || 0} posts${viewerTag}`;
        }
    }

    if (swarmOverviewAlertPill) {
        swarmOverviewAlertPill.style.display = hasSwarm && totalAlerts > 0 ? 'inline-block' : 'none';
        swarmOverviewAlertPill.textContent = String(totalAlerts);
    }
    if (swarmBoardCountPill) {
        const postCount = Number(data?.head || (data?.messages || []).length || 0);
        swarmBoardCountPill.style.display = hasSwarm && postCount > 0 ? 'inline-block' : 'none';
        swarmBoardCountPill.textContent = String(postCount);
    }
    if (swarmMembersCountPill) {
        const liveMemCount = activeTaskMembers.length || members.filter(m => !m.killed).length;
        swarmMembersCountPill.style.display = hasSwarm && liveMemCount > 0 ? 'inline-block' : 'none';
        swarmMembersCountPill.textContent = String(liveMemCount);
    }

    if (swarmOpenCoordBtn) {
        swarmOpenCoordBtn.style.display = hasSwarm && data.coordinatorId ? 'inline-flex' : 'none';
    }

    if (swarmCoordDock) {
        swarmCoordDock.style.display = hasSwarm && data.coordinatorId ? 'flex' : 'none';
    }

    if (swarmSelectorSelect) {
        const available = Array.isArray(data?.availableSwarms) ? data.availableSwarms : [];
        const options = [];
        const activeOwnOptionLabel =
            hasSwarm && !selectedSwarmIdOverride
                ? `● Active Chat: ${data.title || data.id?.slice(0, 8)}`
                : '○ Follow Active Conversation';
        options.push(`<option value="" ${!selectedSwarmIdOverride ? 'selected' : ''}>${escapeHtml(activeOwnOptionLabel)}</option>`);

        available.forEach(sw => {
            if (!sw || !sw.swarmId) return;
            if (!selectedSwarmIdOverride && hasSwarm && sw.swarmId === data.id) return;
            const statusHint =
                sw.workingCount > 0
                    ? `${sw.workingCount}⚡ working`
                    : `${sw.memberCount || 0} agents · #${sw.postCount || 0}`;
            const isSel = selectedSwarmIdOverride === sw.swarmId;
            options.push(
                `<option value="${escapeHtml(sw.swarmId)}" ${isSel ? 'selected' : ''}>🐝 ${escapeHtml(sw.title || sw.swarmId.slice(0, 8))} (${escapeHtml(statusHint)})</option>`
            );
        });
        swarmSelectorSelect.innerHTML = options.join('');
    }
}

function renderCurrentSwarmSubtab(forceScrollReset = false) {
    if (!swarmBodyScroll) return;
    const data = cachedSwarmSnapshot;
    if (!data) {
        swarmBodyScroll.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Loading Swarm UI…</p></div>`;
        return;
    }

    if (!data.swarm) {
        renderSwarmEmptyState(data);
        return;
    }

    if (currentSwarmSubtab === 'overview') {
        renderSwarmOverviewTab(data);
    } else if (currentSwarmSubtab === 'feed') {
        renderSwarmBoardTab(data, forceScrollReset);
    } else if (currentSwarmSubtab === 'members') {
        renderSwarmMembersTab(data);
    } else if (currentSwarmSubtab === 'graph') {
        renderSwarmGraphTab(data);
    } else if (currentSwarmSubtab === 'raw') {
        renderSwarmRawTab(data);
    }
}

function renderSwarmEmptyState(data) {
    const available = Array.isArray(data?.availableSwarms) ? data.availableSwarms : [];
    const recentHtml =
        available.length > 0
            ? `
        <div class="sw-ov-card" style="margin-top: 4px;">
            <div class="sw-ov-eyebrow">Recent Swarms on PC (${available.length})</div>
            <div class="sw-ov-ws-list">
                ${available
                    .map(
                        sw => `
                    <div class="sw-ov-ws-row" style="align-items:center;">
                        <div class="sw-ov-ws-left" style="align-items:center;">
                            ${renderBeeAvatarHtml({
                                role: 'coordinator',
                                status: sw.workingCount > 0 ? 'working' : 'waiting',
                                small: true
                            })}
                            <div style="min-width:0;">
                                <div class="sw-ov-ws-title">${escapeHtml(sw.title || sw.swarmId)}</div>
                                <div class="sw-ov-ws-note">${sw.memberCount || 0} members · ${sw.workingCount || 0} working · #${sw.postCount || 0} board posts</div>
                            </div>
                        </div>
                        <button type="button" class="sw-member-open-btn" data-pick-swarm="${escapeHtml(sw.swarmId)}" data-testid="pick-recent-swarm-btn">
                            Inspect →
                        </button>
                    </div>
                `
                    )
                    .join('')}
            </div>
        </div>
    `
            : '';

    swarmBodyScroll.innerHTML = `
        <div class="sw-empty-card" data-testid="swarm-empty-state">
            ${renderBeeAvatarHtml({ role: 'coordinator', status: 'working' })}
            <div class="sw-ov-goal-title">No Active Swarm in This Conversation</div>
            <div class="sw-ov-goal-sub" style="max-width: 440px;">
                Start a parallel multi-agent <code>/swarm</code> or <code>/boost /swarm</code> task to coordinate specialized workers with a live Shared Board, Pixel-Bee roster, and @mention communication graph.
            </div>
            <div class="sw-empty-actions">
                <button type="button" class="agy-pill-btn agy-pill-primary" data-launch-swarm-cmd="/swarm" data-testid="empty-start-swarm-btn">
                    🐝 Start /swarm
                </button>
                <button type="button" class="ide-action-btn" data-launch-swarm-cmd="/boost /swarm" data-testid="empty-start-boost-swarm-btn">
                    ⚡ Start /boost /swarm
                </button>
            </div>
        </div>
        ${recentHtml}
    `;
    paintSwarmBees(swarmBodyScroll);
}

function renderSwarmOverviewTab(data) {
    const ov = data.overview || {};
    const counts = ov.counts || { total: 0, done: 0, running: 0, blocked: 0, queued: 0 };
    const sysAlerts = Array.isArray(data.systemAttention) ? data.systemAttention : [];
    const ovAlerts = Array.isArray(ov.attention) ? ov.attention : [];
    const allMembers = Array.isArray(data.members) ? data.members : [];
    const coordinator = allMembers.find(m => m.role === 'coordinator') || allMembers[0] || null;
    const crewWorkers = allMembers.filter(m => m !== coordinator && !m.killed && !m.roleWorker && !m.narrator);

    // Ensure owner filter is still valid
    if (swarmOverviewOwnerFilter && !allMembers.some(m => m.name === swarmOverviewOwnerFilter)) {
        swarmOverviewOwnerFilter = '';
    }

    const alertsHtml =
        sysAlerts.length + ovAlerts.length > 0
            ? `
        <div class="sw-ov-alert-strip" data-testid="swarm-alerts-strip">
            ${sysAlerts
                .map(
                    a => `
                <div class="sw-ov-alert-card">
                    <div style="min-width:0;">
                        <div class="sw-ov-alert-title">⚠️ ${escapeHtml(a.text || `${a.member} needs attention`)}</div>
                        ${a.detail ? `<div class="sw-ov-alert-sub">${escapeHtml(String(a.detail).slice(0, 180))}</div>` : ''}
                    </div>
                    ${
                        a.conversation_id
                            ? `<button type="button" class="sw-member-open-btn" data-open-member-chat="${escapeHtml(a.conversation_id)}">Inspect →</button>`
                            : ''
                    }
                </div>
            `
                )
                .join('')}
            ${ovAlerts
                .map(a => {
                    const alertTitle = a.title || a.text || 'Blocked / awaiting reply';
                    const alertSub =
                        a.why ||
                        a.detail ||
                        (a.from ? `From @${a.from}${a.to ? ` → @${a.to}` : ''}` : '');
                    const alertSeq = Number(a.post || a.seq || 0);
                    return `
                <div class="sw-ov-alert-card warn">
                    <div style="min-width:0;">
                        <div class="sw-ov-alert-title">🔔 ${escapeHtml(alertTitle)}</div>
                        ${alertSub ? `<div class="sw-ov-alert-sub">${escapeHtml(String(alertSub).slice(0, 200))}</div>` : ''}
                    </div>
                    ${
                        alertSeq > 0
                            ? `<button type="button" class="sw-seq-cite-pill" data-jump-seq="${alertSeq}">#${alertSeq}</button>`
                            : ''
                    }
                </div>
            `;
                })
                .join('')}
        </div>
    `
            : '';

    const totalWs = Math.max(0, Number(counts.total || 0));
    const doneWs = Math.max(0, Number(counts.done || 0));
    const pct = ov.finished ? 100 : totalWs > 0 ? Math.round((doneWs / totalWs) * 100) : 0;
    const ringCircumference = 94.25; // 2 * pi * 15
    const ringOffset = ringCircumference * (1 - Math.max(0, Math.min(100, pct)) / 100);
    const phaseText = ov.phase?.label
        ? `Phase ${ov.phase.index || 1}/${ov.phase.total || 1} · ${ov.phase.label}`
        : ov.finished
          ? 'Swarm Completed'
          : ov.starting
            ? 'Starting Up'
            : 'Parallel Execution';

    const workstreams = Array.isArray(ov.workstreams) ? ov.workstreams : [];
    const visibleWs = swarmOverviewOwnerFilter
        ? workstreams.filter(w => Array.isArray(w.owners) && w.owners.includes(swarmOverviewOwnerFilter))
        : workstreams;

    const wsHtml =
        visibleWs.length > 0
            ? visibleWs
                  .map(w => {
                      const st = w.state || 'running';
                      const icon = st === 'done' ? '✓' : st === 'blocked' ? '!' : st === 'queued' ? '○' : '●';
                      const ownerName = Array.isArray(w.owners) && w.owners.length ? w.owners[0] : '';
                      const isLiveShimmer = st === 'running' && Boolean(w.liveActivity);
                      const subText = w.liveActivity || w.note || '';
                      return `
                <div class="sw-ov-ws-row" data-testid="swarm-workstream-row">
                    <div class="sw-ov-ws-left">
                        <span class="sw-ov-ws-state-dot ${escapeHtml(st)}">${icon}</span>
                        <div style="min-width:0; flex:1;">
                            <div class="sw-ov-ws-title">${escapeHtml(w.title || 'Workstream')}</div>
                            ${
                                subText
                                    ? `<div class="sw-ov-ws-note ${isLiveShimmer ? 'animate-shimmer-text' : ''}">${escapeHtml(subText)}</div>`
                                    : ''
                            }
                        </div>
                    </div>
                    <div style="display:inline-flex; align-items:center; gap:5px; flex-shrink:0;">
                        ${
                            w.seq
                                ? `<button type="button" class="sw-seq-cite-pill" data-jump-seq="${Number(w.seq)}" title="View post #${Number(w.seq)}">#${Number(w.seq)}</button>`
                                : ''
                        }
                        ${
                            ownerName
                                ? `<button type="button" class="sw-ov-ws-owner" data-filter-board-poster="${escapeHtml(ownerName)}" title="View @${escapeHtml(ownerName)} on Board">@${escapeHtml(ownerName)}</button>`
                                : ''
                        }
                    </div>
                </div>
            `;
                  })
                  .join('')
            : `<div class="ide-empty-note">${swarmOverviewOwnerFilter ? `No workstreams owned by @${escapeHtml(swarmOverviewOwnerFilter)}` : 'Coordinator is preparing parallel workstreams…'}</div>`;

    swarmBodyScroll.innerHTML = `
        ${alertsHtml}

        <div class="sw-ov-card" data-testid="swarm-overview-goal">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <span class="sw-ov-eyebrow">${escapeHtml(phaseText)}</span>
                <span class="sw-ov-stat-chip ${ov.finished ? 'good' : 'info'}">${pct}% Complete</span>
            </div>
            <div class="sw-ov-goal-title">${escapeHtml(ov.goal?.title || data.title || 'Swarm Mission')}</div>
            ${ov.goal?.line ? `<div class="sw-ov-goal-sub">${escapeHtml(ov.goal.line)}</div>` : ''}

            <div class="sw-ov-progress-row">
                <div class="sw-ov-progress-left">
                    <div style="position:relative; width:38px; height:38px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center;">
                        <svg width="38" height="38" viewBox="0 0 36 36" style="transform:rotate(-90deg); display:block;">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--secondary)" stroke-width="3.4"></circle>
                            <circle cx="18" cy="18" r="15" fill="none" stroke="${ov.finished ? 'var(--success)' : 'var(--primary-bright)'}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="${ringCircumference}" stroke-dashoffset="${ringOffset.toFixed(2)}"></circle>
                        </svg>
                        <span style="position:absolute; font-size:9.5px; font-weight:700; font-family:var(--font-mono); color:var(--foreground); line-height:1;">${pct}%</span>
                    </div>
                    <div>
                        <div style="font-weight:700; font-size:12.5px;">${doneWs} / ${totalWs} Workstreams</div>
                        <div style="font-size:11px; color:var(--muted-foreground);">#${data.head || 0} board posts</div>
                    </div>
                </div>
                <div class="sw-ov-stat-chips">
                    ${counts.running > 0 ? `<span class="sw-ov-stat-chip info">${counts.running} running</span>` : ''}
                    ${counts.done > 0 ? `<span class="sw-ov-stat-chip good">${counts.done} done</span>` : ''}
                    ${counts.blocked > 0 ? `<span class="sw-ov-stat-chip warn">${counts.blocked} blocked</span>` : ''}
                    ${counts.queued > 0 ? `<span class="sw-ov-stat-chip">${counts.queued} queued</span>` : ''}
                </div>
            </div>
        </div>

        <div class="sw-ov-card" data-testid="swarm-overview-crew">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <span class="sw-ov-eyebrow">Hive Crew (${crewWorkers.length + (coordinator ? 1 : 0)})</span>
                ${
                    swarmOverviewOwnerFilter
                        ? `<button type="button" class="sw-post-more-btn" data-filter-ws-owner="">Show all (${workstreams.length})</button>`
                        : `<span style="font-size:11px; color:var(--muted-foreground);">Tap a bee to filter</span>`
                }
            </div>

            ${
                coordinator
                    ? `
                <div class="sw-ov-lead-row" data-open-member-chat="${escapeHtml(coordinator.conversation_id || '')}" title="Open @${escapeHtml(coordinator.name)} Conversation">
                    ${renderBeeAvatarHtml({
                        role: 'coordinator',
                        status: coordinator.status,
                        killed: coordinator.killed,
                        failure: coordinator.failure
                    })}
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <span class="sw-member-name">@${escapeHtml(coordinator.name)}</span>
                            <span class="sw-role-pill coord">Queen Coordinator</span>
                            ${coordinator.modelDisplayName ? `<span class="sw-ov-stat-chip">${escapeHtml(formatCompactModelName(coordinator.modelDisplayName))}</span>` : ''}
                        </div>
                        <div class="sw-member-activity ${coordinator.status === 'working' && coordinator.activity ? 'animate-shimmer-text' : ''}">
                            ${escapeHtml(coordinator.activity || (coordinator.status === 'working' ? 'Orchestrating swarm…' : 'Waiting on swarm_wait for worker updates'))}
                        </div>
                    </div>
                    <span style="font-size:11.5px; color:var(--primary-bright); font-weight:600; flex-shrink:0;">Chat →</span>
                </div>
            `
                    : ''
            }

            ${
                crewWorkers.length > 0
                    ? `
                <div class="sw-ov-crew-row">
                    ${crewWorkers
                        .map(w => {
                            const isFiltered = swarmOverviewOwnerFilter === w.name;
                            return `
                        <button type="button"
                                class="sw-ov-crew-chip ${isFiltered ? 'active' : ''}"
                                data-filter-ws-owner="${escapeHtml(w.name)}"
                                data-testid="swarm-crew-bee-chip">
                            ${renderBeeAvatarHtml({
                                role: w.role,
                                status: w.status,
                                killed: w.killed,
                                failure: w.failure,
                                small: true
                            })}
                            <span>@${escapeHtml(w.name)}</span>
                        </button>
                    `;
                        })
                        .join('')}
                </div>
            `
                    : ''
            }
        </div>

        <div class="sw-ov-card" data-testid="swarm-workstreams">
            <div class="sw-ov-eyebrow">Workstreams (${visibleWs.length})</div>
            <div class="sw-ov-ws-list">${wsHtml}</div>
        </div>
    `;

    paintSwarmBees(swarmBodyScroll);
}

function formatSwarmPostBodyHtml(rawText) {
    const codeTokens = [];
    const putCodeToken = htmlSnippet => {
        const idx = codeTokens.push(htmlSnippet) - 1;
        return `\uE000SWCODE${idx}\uE001`;
    };

    let src = String(rawText || '');
    src = src.replace(/```(?:[a-zA-Z0-9_+-]+)?\n?([\s\S]*?)```/g, (_, body) =>
        putCodeToken(`<pre class="sw-inline-codeblock"><code>${escapeHtml(String(body || '').replace(/\n$/, ''))}</code></pre>`)
    );
    src = src.replace(/`([^`\n]+)`/g, (_, inlineCode) =>
        putCodeToken(`<code class="sw-inline-code">${escapeHtml(inlineCode)}</code>`)
    );

    let html = escapeHtml(src);
    html = html.replace(/\*\*([^*\n]{1,120})\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[\s(])\*([^*\n]{1,100})\*(?=$|[\s).,;:!?])/g, '$1<em>$2</em>');
    html = html.replace(/\[done\]/gi, '<span class="sw-done-tag">[done]</span>');
    html = html.replace(/\[(stall|blocked|failed)\]/gi, '<span class="sw-stall-tag">[$1]</span>');
    html = html.replace(/@#([a-z0-9][a-z0-9_-]{0,30})/gi, '<span class="sw-mention-pill">@#$1</span>');
    html = html.replace(/(^|[^A-Za-z0-9_#])@([A-Za-z0-9][A-Za-z0-9_-]{0,31})\b/g, '$1<span class="sw-mention-pill">@$2</span>');
    html = html.replace(
        /(^|[\s([,:;])#([1-9]\d{0,4})\b/g,
        '$1<button type="button" class="sw-seq-cite-pill" data-jump-seq="$2">#$2</button>'
    );
    html = html.replace(/\uE000SWCODE(\d+)\uE001/g, (_, i) => codeTokens[Number(i)] || '');
    return html;
}

function formatSwarmControlMessageLabel(m) {
    const ctrl = m?.control || {};
    const ch = ctrl.channel || m?.channel || 'channel';
    const act = ctrl.action || 'update';
    const who = m?.agent ? `@${m.agent}` : 'system';
    const membersPart =
        Array.isArray(ctrl.members) && ctrl.members.length > 0
            ? ` (${ctrl.members.map(n => `@${n}`).join(', ')})`
            : '';
    if (act === 'create') {
        return `${who} created #${ch}${ctrl.topic ? ` — ${ctrl.topic}` : ''}${membersPart}`;
    }
    if (act === 'subscribe') return `${who} subscribed${membersPart || ` to #${ch}`} on #${ch}`;
    if (act === 'unsubscribe') return `${who} unsubscribed${membersPart} from #${ch}`;
    if (act === 'archive') return `${who} archived #${ch}`;
    return `${who} updated #${ch}`;
}

function filterSwarmMessages(data) {
    const rawMsgs = Array.isArray(data?.messages) ? data.messages : [];
    const q = swarmBoardSearch.trim().toLowerCase();
    return rawMsgs.filter(m => {
        if (!m) return false;
        const ch = m.control?.channel || m.channel || 'main';
        if (swarmBoardChannelFilter !== 'all' && ch !== swarmBoardChannelFilter) return false;
        if (m.control) {
            if (swarmBoardPosterFilter && m.agent !== swarmBoardPosterFilter) return false;
            if (swarmBoardRecipientFilter) return false;
            if (q) {
                const hay = `${m.agent || ''} ${formatSwarmControlMessageLabel(m)} #${m.seq} ${ch}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        }
        if (swarmBoardPosterFilter && m.agent !== swarmBoardPosterFilter) return false;
        if (swarmBoardRecipientFilter) {
            const recips = Array.isArray(m.mentions) ? m.mentions : [];
            const viaCh = Array.isArray(m.via_channel) ? m.via_channel : [];
            if (swarmBoardRecipientFilter === '__all__') {
                if (!m.all) return false;
            } else if (swarmBoardRecipientFilter === '__none__') {
                if (m.all || recips.length > 0 || viaCh.length > 0) return false;
            } else if (!m.all && !recips.includes(swarmBoardRecipientFilter) && !viaCh.includes(swarmBoardRecipientFilter)) {
                return false;
            }
        }
        if (q) {
            const hay = `${m.agent} ${m.text} #${m.seq} ${(m.mentions || []).join(' ')} ${(m.channel_mentions || []).join(' ')} ${ch}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });
}

function buildSwarmBoardFeedItemsHtml(data) {
    const filtered = filterSwarmMessages(data);
    if (filtered.length === 0) {
        return `<div class="ide-empty-note" style="padding:20px 10px; text-align:center;">No board posts match the current filter.</div>`;
    }

    const membersMap = new Map((data.members || []).map(m => [m.name, m]));
    const viewerName = data.member || 'coordinator';
    const viewerMemberObj = membersMap.get(viewerName) || null;
    const viewerLastRead = viewerMemberObj ? Number(viewerMemberObj.last_read_seq ?? 0) : Number(data.head || 0);
    const unseenSet = Array.isArray(data.unseen) ? new Set(data.unseen.map(n => Number(n))) : null;
    let unreadInserted = false;

    const cardsHtml = [];
    for (let i = 0; i < filtered.length; i++) {
        const m = filtered[i];
        const prev = i > 0 ? filtered[i - 1] : null;

        if (m.control) {
            const shortTime = m.time ? String(m.time).slice(11, 19) || m.time : '';
            cardsHtml.push(`
                <div class="sw-control-line" data-post-seq="${Number(m.seq)}" data-testid="swarm-control-message">
                    <span class="sw-post-seq-badge">#${Number(m.seq)}</span>
                    <span class="sw-control-text">${escapeHtml(formatSwarmControlMessageLabel(m))}</span>
                    ${shortTime ? `<span class="sw-control-time">${escapeHtml(shortTime)}</span>` : ''}
                </div>
            `);
            continue;
        }

        const seqNum = Number(m.seq);
        const isUnseenForViewer =
            m.agent !== viewerName &&
            (unseenSet
                ? unseenSet.has(seqNum)
                : Boolean(viewerMemberObj && seqNum > viewerLastRead));

        let justInsertedUnread = false;
        if (!unreadInserted && isUnseenForViewer) {
            cardsHtml.push(`<div class="sw-unread-divider" data-testid="swarm-unread-divider">New Posts</div>`);
            unreadInserted = true;
            justInsertedUnread = true;
        }

        const ch = m.channel || 'main';
        const prevCh = prev && !prev.control ? prev.channel || 'main' : '';
        const closeInTime =
            prev && !prev.control && m.ts && prev.ts
                ? Math.abs(m.ts - prev.ts) <= 180000
                : Boolean(prev && !prev.control && seqNum === Number(prev.seq) + 1);
        const isGrouped = Boolean(
            prev &&
                !prev.control &&
                prev.agent === m.agent &&
                prevCh === ch &&
                closeInTime &&
                !justInsertedUnread
        );

        const mentionsMe =
            m.agent !== viewerName &&
            (Boolean(m.all) ||
                (Array.isArray(m.mentions) && m.mentions.includes(viewerName)) ||
                (Array.isArray(m.via_channel) && m.via_channel.includes(viewerName)));

        const textStr = String(m.text || '');
        const lineCount = textStr.split('\n').length;
        const isLong = textStr.length > 380 || lineCount > 7;
        const isExpanded = swarmBoardExpandedSeqs.has(seqNum);
        const shouldCollapse = isLong && !isExpanded;

        const senderMember = membersMap.get(m.agent);
        const recipBadges = [];
        if (m.all) recipBadges.push('@all');
        if (Array.isArray(m.channel_mentions)) {
            m.channel_mentions.slice(0, 2).forEach(cn => recipBadges.push(`@#${cn}`));
        }
        if (Array.isArray(m.mentions)) {
            m.mentions.slice(0, 4).forEach(t => recipBadges.push(`@${t}`));
        }
        const recipText = recipBadges.length ? `→ ${recipBadges.join(', ')}` : '';
        const shortTime = m.time ? String(m.time).slice(11, 19) || m.time : '';

        cardsHtml.push(`
            <article class="sw-post-card ${isGrouped ? 'grouped-followup' : ''} ${mentionsMe ? 'mentions-me' : ''}"
                     data-post-seq="${seqNum}"
                     data-testid="swarm-post-card">
                <div class="sw-post-header">
                    <div class="sw-post-author-row">
                        ${
                            !isGrouped
                                ? renderBeeAvatarHtml({
                                      role: senderMember?.role || (m.agent === 'coordinator' ? 'coordinator' : 'worker'),
                                      status: senderMember?.status || 'waiting',
                                      killed: Boolean(senderMember?.killed),
                                      failure: senderMember?.failure,
                                      small: true
                                  })
                                : ''
                        }
                        <button type="button" class="sw-post-sender" data-filter-board-poster="${escapeHtml(m.agent)}">@${escapeHtml(m.agent)}</button>
                        ${recipText ? `<span class="sw-post-recipients">${escapeHtml(recipText)}</span>` : ''}
                        ${ch !== 'main' ? `<span class="sw-ov-stat-chip info">#${escapeHtml(ch)}</span>` : ''}
                    </div>
                    <div class="sw-post-meta-right">
                        ${shortTime ? `<span>${escapeHtml(shortTime)}</span>` : ''}
                        <span class="sw-post-seq-badge">#${seqNum}</span>
                    </div>
                </div>
                <div class="sw-post-body ${shouldCollapse ? 'is-collapsed' : ''}">${formatSwarmPostBodyHtml(textStr)}</div>
                <div class="sw-post-footer">
                    <div>
                        ${
                            isLong
                                ? `<button type="button" class="sw-post-more-btn" data-toggle-post-seq="${seqNum}">${isExpanded ? 'Show less' : 'Show more'}</button>`
                                : ''
                        }
                    </div>
                    <div style="display:inline-flex; align-items:center; gap:8px;">
                        <button type="button" class="sw-post-quote-btn" data-reply-post-seq="${seqNum}" data-reply-post-agent="${escapeHtml(m.agent)}">↩ Reply</button>
                        <button type="button" class="sw-post-quote-btn" data-quote-post-seq="${seqNum}" data-testid="swarm-quote-post-btn">❝ Quote</button>
                    </div>
                </div>
            </article>
        `);
    }

    return cardsHtml.join('');
}

function renderSwarmBoardFeedListOnly(data, scrollIfFollow = false) {
    const mount = document.getElementById('swarmBoardFeedMount');
    if (!mount) return;
    const prevScrollTop = swarmBodyScroll ? swarmBodyScroll.scrollTop : 0;
    isRenderingSwarmBoard = true;
    try {
        mount.innerHTML = buildSwarmBoardFeedItemsHtml(data);
        paintSwarmBees(mount);
        if (swarmBodyScroll) {
            if ((scrollIfFollow || swarmBoardFollow) && swarmBoardFollow) {
                swarmBodyScroll.scrollTop = swarmBodyScroll.scrollHeight;
            } else {
                swarmBodyScroll.scrollTop = prevScrollTop;
            }
        }
    } finally {
        setTimeout(() => {
            isRenderingSwarmBoard = false;
        }, 0);
    }
}

function renderSwarmBoardTab(data, scrollIfFollow = false) {
    const prevScrollTop = swarmBodyScroll ? swarmBodyScroll.scrollTop : 0;
    const members = Array.isArray(data.members) ? data.members : [];
    const channels = Array.isArray(data.channels) ? data.channels : [];
    const hasActiveFilters = Boolean(
        swarmBoardPosterFilter || swarmBoardRecipientFilter || swarmBoardChannelFilter !== 'all'
    );

    const channelPills = [
        `<button type="button" class="sw-channel-pill ${swarmBoardChannelFilter === 'all' ? 'active' : ''}" data-board-channel="all">All</button>`,
        `<button type="button" class="sw-channel-pill ${swarmBoardChannelFilter === 'main' ? 'active' : ''}" data-board-channel="main">#main</button>`,
        ...channels.map(
            ch =>
                `<button type="button" class="sw-channel-pill ${swarmBoardChannelFilter === ch.name ? 'active' : ''}" data-board-channel="${escapeHtml(ch.name)}" title="${escapeHtml(ch.topic || '')}">#${escapeHtml(ch.name)}${ch.archived ? ' (archived)' : ''}</button>`
        )
    ];

    isRenderingSwarmBoard = true;
    try {
        swarmBodyScroll.innerHTML = `
            <div class="sw-board-toolbar">
                <div class="sw-board-search-row">
                    <input type="text"
                           id="swarmBoardSearchInput"
                           class="ide-search-input"
                           data-testid="swarm-board-search"
                           placeholder="Search board posts, @mentions, #seq…"
                           value="${escapeHtml(swarmBoardSearch)}" />
                    <button type="button"
                            class="sw-board-filter-btn ${hasActiveFilters ? 'has-filter' : ''}"
                            id="swarmBoardFilterToggleBtn"
                            data-testid="swarm-board-filter-btn">
                        ⚙ Filter${hasActiveFilters ? ' ●' : ''}
                    </button>
                </div>

                ${
                    swarmBoardFilterPanelOpen || hasActiveFilters
                        ? `
                    <div class="sw-board-filter-panel" data-testid="swarm-board-filter-panel">
                        <div class="sw-filter-selects">
                            <select id="swarmPosterSelect" class="sw-filter-select" aria-label="Filter by poster">
                                <option value="">Poster: Any</option>
                                ${members
                                    .map(
                                        m =>
                                            `<option value="${escapeHtml(m.name)}" ${swarmBoardPosterFilter === m.name ? 'selected' : ''}>From @${escapeHtml(m.name)}</option>`
                                    )
                                    .join('')}
                            </select>
                            <select id="swarmRecipientSelect" class="sw-filter-select" aria-label="Filter by recipient">
                                <option value="">To: Any</option>
                                <option value="__all__" ${swarmBoardRecipientFilter === '__all__' ? 'selected' : ''}>To @all (broadcast)</option>
                                <option value="__none__" ${swarmBoardRecipientFilter === '__none__' ? 'selected' : ''}>No @mentions</option>
                                ${members
                                    .map(
                                        m =>
                                            `<option value="${escapeHtml(m.name)}" ${swarmBoardRecipientFilter === m.name ? 'selected' : ''}>To @${escapeHtml(m.name)}</option>`
                                    )
                                    .join('')}
                            </select>
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                            <button type="button" class="sw-graph-btn ${swarmBoardFollow ? 'active' : ''}" id="swarmBoardFollowBtn">
                                ${swarmBoardFollow ? '✓ Auto-Follow Latest' : 'Auto-Follow Paused'}
                            </button>
                            ${
                                hasActiveFilters || swarmBoardSearch
                                    ? `<button type="button" class="sw-post-more-btn" id="swarmBoardClearFiltersBtn">Reset Filters</button>`
                                    : ''
                            }
                        </div>
                    </div>
                `
                        : ''
                }

                ${channels.length > 0 ? `<div class="sw-channel-strip">${channelPills.join('')}</div>` : ''}
            </div>

            <div class="sw-feed-list" id="swarmBoardFeedMount">${buildSwarmBoardFeedItemsHtml(data)}</div>
            <button type="button" class="sw-jump-latest-btn" id="swarmJumpLatestBtn" style="display:none;">↓ Latest Posts</button>
        `;

        paintSwarmBees(swarmBodyScroll);

        const searchInp = document.getElementById('swarmBoardSearchInput');
        if (searchInp) {
            searchInp.addEventListener('input', () => {
                swarmBoardSearch = searchInp.value || '';
                renderSwarmBoardFeedListOnly(cachedSwarmSnapshot, false);
            });
        }
        const filterBtn = document.getElementById('swarmBoardFilterToggleBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                swarmBoardFilterPanelOpen = !swarmBoardFilterPanelOpen;
                renderSwarmBoardTab(cachedSwarmSnapshot, false);
            });
        }
        const posterSel = document.getElementById('swarmPosterSelect');
        if (posterSel) {
            posterSel.addEventListener('change', () => {
                swarmBoardPosterFilter = posterSel.value || '';
                renderSwarmBoardTab(cachedSwarmSnapshot, false);
            });
        }
        const recipSel = document.getElementById('swarmRecipientSelect');
        if (recipSel) {
            recipSel.addEventListener('change', () => {
                swarmBoardRecipientFilter = recipSel.value || '';
                renderSwarmBoardTab(cachedSwarmSnapshot, false);
            });
        }
        const followBtn = document.getElementById('swarmBoardFollowBtn');
        if (followBtn) {
            followBtn.addEventListener('click', () => {
                swarmBoardFollow = !swarmBoardFollow;
                renderSwarmBoardTab(cachedSwarmSnapshot, swarmBoardFollow);
            });
        }
        const clearBtn = document.getElementById('swarmBoardClearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                swarmBoardSearch = '';
                swarmBoardPosterFilter = '';
                swarmBoardRecipientFilter = '';
                swarmBoardChannelFilter = 'all';
                renderSwarmBoardTab(cachedSwarmSnapshot, false);
            });
        }
        const jumpLatestBtn = document.getElementById('swarmJumpLatestBtn');
        if (jumpLatestBtn) {
            jumpLatestBtn.addEventListener('click', () => {
                swarmBoardFollow = true;
                swarmBodyScroll.scrollTo({ top: swarmBodyScroll.scrollHeight, behavior: 'smooth' });
                jumpLatestBtn.style.display = 'none';
            });
        }

        if ((scrollIfFollow || swarmBoardFollow) && swarmBoardFollow) {
            swarmBodyScroll.scrollTop = swarmBodyScroll.scrollHeight;
        } else {
            swarmBodyScroll.scrollTop = prevScrollTop;
            const maxScroll = swarmBodyScroll.scrollHeight - swarmBodyScroll.clientHeight;
            if (jumpLatestBtn && maxScroll - prevScrollTop >= 90 && maxScroll > 160) {
                jumpLatestBtn.style.display = 'inline-flex';
            }
        }
    } finally {
        setTimeout(() => {
            isRenderingSwarmBoard = false;
        }, 0);
    }
}

function jumpToSwarmBoardSeq(seqNum) {
    const seq = Number(seqNum);
    if (!seq || !cachedSwarmSnapshot) return;

    if (currentSwarmSubtab !== 'feed') {
        currentSwarmSubtab = 'feed';
        syncSwarmSubtabButtons();
        renderSwarmBoardTab(cachedSwarmSnapshot, false);
    }

    let card = swarmBodyScroll?.querySelector(`[data-post-seq="${seq}"]`);
    if (!card) {
        // Reset filters so cited post is guaranteed visible
        swarmBoardSearch = '';
        swarmBoardPosterFilter = '';
        swarmBoardRecipientFilter = '';
        swarmBoardChannelFilter = 'all';
        renderSwarmBoardTab(cachedSwarmSnapshot, false);
        card = swarmBodyScroll?.querySelector(`[data-post-seq="${seq}"]`);
    }

    if (card) {
        swarmBoardFollow = false;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.remove('flash-seq');
        void card.offsetWidth;
        card.classList.add('flash-seq');
        setTimeout(() => card.classList.remove('flash-seq'), 1800);
    } else {
        showToast(`Post #${seq} not found on board`);
    }
}

function buildSwarmMembersItemsHtml(data) {
    const allMembers = Array.isArray(data?.members) ? data.members : [];
    const q = swarmMembersSearch.trim().toLowerCase();

    const matchesQuery = m => {
        if (!q) return true;
        const hay = `${m.name} ${m.role} ${m.modelDisplayName || m.model || ''} ${m.activity || ''} ${m.status}`.toLowerCase();
        return hay.includes(q);
    };

    const activeList = allMembers
        .filter(m => !m.killed && matchesQuery(m))
        .sort((a, b) => {
            const rank = x =>
                x.role === 'coordinator'
                    ? 0
                    : x.status === 'working' && !x.roleWorker
                      ? 1
                      : !x.roleWorker
                        ? 2
                        : 3;
            return rank(a) - rank(b) || a.name.localeCompare(b.name);
        });

    const retiredList = swarmShowRetiredMembers
        ? allMembers.filter(m => m.killed && matchesQuery(m))
        : [];

    if (activeList.length === 0 && retiredList.length === 0) {
        return `<div class="ide-empty-note" style="padding:18px; text-align:center;">No swarm members match "${escapeHtml(swarmMembersSearch)}".</div>`;
    }

    const renderMemberCard = m => {
        const isCoord = m.role === 'coordinator';
        const isRoleWorker = Boolean(m.roleWorker || m.role === 'monitor');
        const roleLabel = m.killed
            ? 'Retired'
            : m.failure
              ? m.failure.kind === 'quota'
                  ? 'Quota Hit'
                  : 'Step Error'
              : isCoord
                ? 'Coordinator'
                : m.narrator
                  ? 'Narrator'
                  : isRoleWorker
                    ? m.role === 'monitor'
                        ? 'Monitor'
                        : 'Observer'
                    : m.status === 'working'
                      ? 'Working'
                      : 'Waiting';
        const pillCls = m.failure
            ? 'bad'
            : isCoord
              ? 'coord'
              : isRoleWorker || m.narrator
                ? 'role'
                : m.status === 'working' && !m.killed
                  ? 'working'
                  : '';
        const extraChans = Array.isArray(m.channels) ? m.channels.filter(c => c && c !== 'main') : [];

        return `
            <div class="sw-member-card ${m.killed ? 'retired' : ''}" data-testid="swarm-member-card" data-member-name="${escapeHtml(m.name)}">
                ${renderBeeAvatarHtml({
                    role: m.role,
                    status: m.status,
                    killed: m.killed,
                    failure: m.failure
                })}
                <div class="sw-member-main">
                    <div class="sw-member-head">
                        <div class="sw-member-id-group">
                            <span class="sw-member-name">@${escapeHtml(m.name)}</span>
                            <span class="sw-role-pill ${pillCls}">${escapeHtml(roleLabel)}</span>
                            ${Number(m.nestingDepth) > 1 ? `<span class="sw-role-pill role">L${Number(m.nestingDepth)}</span>` : ''}
                        </div>
                        ${
                            m.conversation_id
                                ? `<button type="button" class="sw-member-open-btn" data-open-member-chat="${escapeHtml(m.conversation_id)}" data-testid="swarm-open-member-chat-btn">Open Chat →</button>`
                                : ''
                        }
                    </div>
                    <div class="sw-member-stats">
                        ${m.modelDisplayName ? `<span>✦ ${escapeHtml(formatCompactModelName(m.modelDisplayName))}</span>` : ''}
                        <span>${Number(m.steps || 0)} steps</span>
                        <span>${Number(m.posts || 0)} posts</span>
                        ${m.unread > 0 && !m.killed ? `<span style="color:var(--primary-bright);">${m.unread} unread</span>` : ''}
                        ${m.workspace_mode === 'worktree' ? `<span>🌿 worktree</span>` : ''}
                        ${extraChans.map(c => `<span style="color:var(--primary-bright);">#${escapeHtml(c)}</span>`).join('')}
                    </div>
                    ${
                        m.failure?.text
                            ? `<div class="sw-member-activity" style="color:var(--error);">⚠️ ${escapeHtml(String(m.failure.text).slice(0, 160))}</div>`
                            : m.activity
                              ? `<div class="sw-member-activity ${!m.killed && m.status === 'working' ? 'animate-shimmer-text' : ''}">${escapeHtml(m.activity)}</div>`
                              : ''
                    }
                </div>
            </div>
        `;
    };

    let html = `<div class="sw-members-list">${activeList.map(renderMemberCard).join('')}</div>`;
    if (retiredList.length > 0) {
        html += `
            <div class="sw-member-section-label">Retired Agents (${retiredList.length})</div>
            <div class="sw-members-list">${retiredList.map(renderMemberCard).join('')}</div>
        `;
    }
    return html;
}

function renderSwarmMembersListOnly(data) {
    const mount = document.getElementById('swarmMembersListMount');
    if (!mount) return;
    mount.innerHTML = buildSwarmMembersItemsHtml(data);
    paintSwarmBees(mount);
}

function renderSwarmMembersTab(data) {
    const allMembers = Array.isArray(data?.members) ? data.members : [];
    const retiredCount = allMembers.filter(m => m.killed).length;

    swarmBodyScroll.innerHTML = `
        <div class="sw-members-toolbar">
            <input type="text"
                   id="swarmMembersSearchInput"
                   class="ide-search-input"
                   style="flex:1; min-width:170px;"
                   data-testid="swarm-members-search"
                   placeholder="Filter agents by @name, model, or tool activity…"
                   value="${escapeHtml(swarmMembersSearch)}" />
            ${
                retiredCount > 0
                    ? `<button type="button"
                               class="sw-graph-btn ${swarmShowRetiredMembers ? 'active' : ''}"
                               id="swarmToggleRetiredBtn"
                               data-testid="swarm-show-retired-btn">
                           ${swarmShowRetiredMembers ? `Hide retired (${retiredCount})` : `Show retired (${retiredCount})`}
                       </button>`
                    : ''
            }
        </div>
        <div id="swarmMembersListMount" style="display:flex; flex-direction:column; gap:8px;">
            ${buildSwarmMembersItemsHtml(data)}
        </div>
    `;

    paintSwarmBees(swarmBodyScroll);

    const searchInp = document.getElementById('swarmMembersSearchInput');
    if (searchInp) {
        searchInp.addEventListener('input', () => {
            swarmMembersSearch = searchInp.value || '';
            renderSwarmMembersListOnly(cachedSwarmSnapshot);
        });
    }
    const retBtn = document.getElementById('swarmToggleRetiredBtn');
    if (retBtn) {
        retBtn.addEventListener('click', () => {
            swarmShowRetiredMembers = !swarmShowRetiredMembers;
            renderSwarmMembersTab(cachedSwarmSnapshot);
        });
    }
}

function stopSwarmGraphPlayback() {
    swarmGraphPlaying = false;
    if (swarmGraphPlayTimer) {
        clearInterval(swarmGraphPlayTimer);
        swarmGraphPlayTimer = null;
    }
}

function startSwarmGraphPlayback() {
    stopSwarmGraphPlayback();
    const msgs = (cachedSwarmSnapshot?.messages || []).filter(m => !m.control);
    if (msgs.length === 0) return;

    const seqs = msgs.map(m => Number(m.seq)).filter(Boolean);
    if (seqs.length === 0) return;

    if (swarmGraphReplaySeq === null || swarmGraphReplaySeq >= seqs[seqs.length - 1]) {
        swarmGraphReplaySeq = seqs[0];
    }
    swarmGraphPlaying = true;
    renderSwarmGraphTab(cachedSwarmSnapshot);

    swarmGraphPlayTimer = setInterval(() => {
        if (currentSurface !== 'swarm' || currentSwarmSubtab !== 'graph' || !cachedSwarmSnapshot) {
            stopSwarmGraphPlayback();
            return;
        }
        const liveSeqs = (cachedSwarmSnapshot.messages || []).filter(m => !m.control).map(m => Number(m.seq));
        let curIdx = -1;
        for (let i = 0; i < liveSeqs.length; i++) {
            if (liveSeqs[i] <= Number(swarmGraphReplaySeq || 0)) curIdx = i;
        }
        if (curIdx === -1 || curIdx + 1 >= liveSeqs.length) {
            stopSwarmGraphPlayback();
            swarmGraphReplaySeq = null;
            renderSwarmGraphTab(cachedSwarmSnapshot);
            return;
        }
        swarmGraphReplaySeq = liveSeqs[curIdx + 1];
        renderSwarmGraphTab(cachedSwarmSnapshot);
    }, swarmGraphSpeedMs);
}

function renderSwarmGraphTab(data) {
    const allMembers = (data.members || []).filter(m => !m.roleWorker);
    const msgs = (data.messages || []).filter(m => !m.control);
    const seqs = msgs.map(m => Number(m.seq)).filter(Boolean);
    const maxSeq = seqs.length ? seqs[seqs.length - 1] : 0;
    const isLive = swarmGraphReplaySeq === null || seqs.length === 0;

    let curSeqIdx = seqs.length - 1;
    if (!isLive && seqs.length > 0) {
        const targetSeq = Number(swarmGraphReplaySeq);
        curSeqIdx = 0;
        for (let i = 0; i < seqs.length; i++) {
            if (seqs[i] <= targetSeq) curSeqIdx = i;
        }
    }
    const cutoffSeq = isLive ? maxSeq : seqs[curSeqIdx] || 0;

    const visibleNames = new Set(
        allMembers.filter(m => !swarmGraphHideInactive || !m.killed).map(m => m.name)
    );
    // Compute directed edges dynamically up to cutoffSeq
    const dynEdges = new Map();
    const activeCutoffEdges = new Set();
    const broadcastCounts = new Map();
    let activeReplayMsg = null;

    for (const m of msgs) {
        const mSeq = Number(m.seq);
        if (mSeq > cutoffSeq) break;
        if (mSeq === cutoffSeq && !isLive) activeReplayMsg = m;
        if (!visibleNames.has(m.agent)) continue;

        if (m.all) {
            broadcastCounts.set(m.agent, (broadcastCounts.get(m.agent) || 0) + 1);
        }

        const directMentions = Array.isArray(m.mentions)
            ? m.mentions.filter(t => visibleNames.has(t) && t !== m.agent)
            : [];
        const channelTargets = Array.isArray(m.via_channel)
            ? m.via_channel.filter(t => visibleNames.has(t) && t !== m.agent)
            : [];
        const directSet = new Set([...directMentions, ...channelTargets]);
        const allTargets =
            m.all && swarmGraphExpandAll
                ? [...visibleNames].filter(t => t !== m.agent)
                : [];
        const combined = new Set([...directSet, ...allTargets]);

        for (const to of combined) {
            const k = `${m.agent}\0${to}`;
            const cur = dynEdges.get(k) || { from: m.agent, to, count: 0, direct: 0, viaChannel: 0, viaAll: 0 };
            cur.count++;
            if (directMentions.includes(to)) cur.direct++;
            else if (channelTargets.includes(to)) cur.viaChannel++;
            else cur.viaAll++;
            dynEdges.set(k, cur);
            if (!isLive && mSeq === cutoffSeq) {
                activeCutoffEdges.add(k);
            }
        }
    }

    // Use server-computed hierarchy edges only when there are zero board messages (e.g. initial subagent spawn before posts)
    if (msgs.length === 0 && Array.isArray(data.edges) && data.edges.length > 0) {
        for (const e of data.edges) {
            if (visibleNames.has(e.from) && visibleNames.has(e.to)) {
                dynEdges.set(`${e.from}\0${e.to}`, { ...e });
            }
        }
    }

    let nodes = allMembers.filter(m => visibleNames.has(m.name));
    if (swarmGraphHideInactive && dynEdges.size > 0) {
        const connected = new Set();
        dynEdges.forEach(e => {
            connected.add(e.from);
            connected.add(e.to);
        });
        nodes = nodes.filter(
            n =>
                n.role === 'coordinator' ||
                n.status === 'working' ||
                connected.has(n.name) ||
                (broadcastCounts.get(n.name) || 0) > 0
        );
    }

    const W = 360;
    const coordIdx = nodes.findIndex(n => n.role === 'coordinator');
    const coordNode = coordIdx >= 0 ? nodes[coordIdx] : null;
    const ringNodes = nodes.filter(n => n !== coordNode);

    let H = 290;
    const posMap = new Map();

    if (ringNodes.length >= 15) {
        // Multi-row grid below Coordinator so 15+ agents never overlap on 360px mobile screens
        const cols = 4;
        const rows = Math.ceil(ringNodes.length / cols);
        H = Math.max(320, 108 + rows * 68);
        if (coordNode) {
            posMap.set(coordNode.name, { x: W / 2, y: 42 });
        }
        ringNodes.forEach((n, idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const countInRow = Math.min(cols, ringNodes.length - row * cols);
            const colSpacing = 82;
            const rowStartX = W / 2 - ((countInRow - 1) * colSpacing) / 2;
            posMap.set(n.name, {
                x: Math.round(rowStartX + col * colSpacing),
                y: Math.round((coordNode ? 112 : 54) + row * 68)
            });
        });
    } else if (coordNode && ringNodes.length >= 9) {
        // Concentric staggered dual-ring for 9..14 workers
        H = 340;
        const cx = W / 2;
        const cy = H / 2 + 4;
        posMap.set(coordNode.name, { x: cx, y: cy });
        const innerCount = Math.min(5, Math.ceil(ringNodes.length * 0.38));
        const innerNodes = ringNodes.slice(0, innerCount);
        const outerNodes = ringNodes.slice(innerCount);
        innerNodes.forEach((n, idx) => {
            const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / innerNodes.length;
            posMap.set(n.name, {
                x: Math.round(cx + 76 * Math.cos(angle)),
                y: Math.round(cy + 68 * Math.sin(angle))
            });
        });
        outerNodes.forEach((n, idx) => {
            const angle = -Math.PI / 2 + Math.PI / outerNodes.length + (idx * 2 * Math.PI) / outerNodes.length;
            posMap.set(n.name, {
                x: Math.round(cx + 142 * Math.cos(angle)),
                y: Math.round(cy + 126 * Math.sin(angle))
            });
        });
    } else if (coordNode && ringNodes.length >= 3) {
        const cx = W / 2;
        const cy = H / 2 + 6;
        posMap.set(coordNode.name, { x: cx, y: cy });
        ringNodes.forEach((n, idx) => {
            const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / ringNodes.length;
            posMap.set(n.name, {
                x: Math.round(cx + 124 * Math.cos(angle)),
                y: Math.round(cy + 102 * Math.sin(angle))
            });
        });
    } else {
        const cx = W / 2;
        const cy = H / 2 + 6;
        nodes.forEach((n, idx) => {
            if (nodes.length === 1) {
                posMap.set(n.name, { x: cx, y: cy });
                return;
            }
            const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / nodes.length;
            posMap.set(n.name, {
                x: Math.round(cx + 118 * Math.cos(angle)),
                y: Math.round(cy + 96 * Math.sin(angle))
            });
        });
    }

    const svgEdges = [...dynEdges.values()]
        .map(e => {
            const p1 = posMap.get(e.from);
            const p2 = posMap.get(e.to);
            if (!p1 || !p2) return '';
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.hypot(dx, dy) || 1;
            const rPad = 21;
            const sx = p1.x + (dx / dist) * rPad;
            const sy = p1.y + (dy / dist) * rPad;
            const ex = p2.x - (dx / dist) * (rPad + 4);
            const ey = p2.y - (dy / dist) * (rPad + 4);
            // Slight curve offset so bidirectional A<->B edges never overlap
            const nx = -dy / dist;
            const ny = dx / dist;
            const curve = 16;
            const qx = (sx + ex) / 2 + nx * curve;
            const qy = (sy + ey) / 2 + ny * curve;
            const labelX = (sx + 2 * qx + ex) / 4;
            const labelY = (sy + 2 * qy + ey) / 4;

            const isStepActive = activeCutoffEdges.has(`${e.from}\0${e.to}`);
            const hasDirectOrChannel = (e.direct || 0) + (e.viaChannel || 0) > 0;
            const strokeColor = isStepActive
                ? '#38bdf8'
                : hasDirectOrChannel
                  ? 'rgba(125, 211, 252, 0.62)'
                  : 'rgba(160, 174, 192, 0.42)';
            const strokeW = Math.min(3.6, 1.3 + Math.log2(e.count + 1) * 0.65);
            const dash = !hasDirectOrChannel && e.viaAll > 0 ? 'stroke-dasharray="4 3"' : '';

            return `
                <g class="sw-graph-edge">
                    <path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"
                          fill="none"
                          stroke="${strokeColor}"
                          stroke-width="${strokeW.toFixed(2)}"
                          ${dash}
                          marker-end="url(#${isStepActive ? 'swArrowActive' : 'swArrow'})"></path>
                    <circle cx="${labelX.toFixed(1)}" cy="${labelY.toFixed(1)}" r="8" fill="var(--card-elevated)" stroke="var(--card-border)" stroke-width="1"></circle>
                    <text x="${labelX.toFixed(1)}" y="${(labelY + 3.2).toFixed(1)}" text-anchor="middle" font-size="9" font-family="JetBrains Mono, monospace" fill="var(--foreground)">${e.count}</text>
                </g>
            `;
        })
        .join('');

    const svgNodes = nodes
        .map(n => {
            const p = posMap.get(n.name);
            if (!p) return '';
            const isCoord = n.role === 'coordinator';
            const stroke = n.killed
                ? '#525866'
                : n.failure
                  ? '#de5555'
                  : isCoord
                    ? '#f7ce5b'
                    : n.status === 'working'
                      ? '#7aae66'
                      : '#64748b';
            const maxChars = ringNodes.length >= 15 ? 9 : 13;
            const shortLabel = n.name.length > maxChars ? `${n.name.slice(0, maxChars - 1)}…` : n.name;
            const isSenderNow = activeReplayMsg && activeReplayMsg.agent === n.name;
            const bcastCount = !swarmGraphExpandAll ? broadcastCounts.get(n.name) || 0 : 0;

            return `
                <g class="sw-graph-node" data-graph-member="${escapeHtml(n.name)}" style="cursor:pointer;">
                    ${isSenderNow ? `<circle cx="${p.x}" cy="${p.y}" r="23" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="1.5"></circle>` : ''}
                    <circle cx="${p.x}" cy="${p.y}" r="17" fill="var(--card-elevated)" stroke="${stroke}" stroke-width="${isCoord ? '2.6' : '2'}"></circle>
                    <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="12">${isCoord ? '👑' : n.killed ? '💤' : '🐝'}</text>
                    ${
                        bcastCount > 0
                            ? `<g class="sw-graph-bcast-pill" data-testid="swarm-graph-bcast-badge">
                                   <rect x="${p.x + 8}" y="${p.y - 23}" width="32" height="13" rx="6.5" fill="var(--card-elevated)" stroke="rgba(125, 211, 252, 0.55)" stroke-width="1"></rect>
                                   <text x="${p.x + 24}" y="${p.y - 14}" text-anchor="middle" font-size="8" font-family="JetBrains Mono, monospace" fill="var(--primary-bright)">@all×${bcastCount}</text>
                               </g>`
                            : ''
                    }
                    <text x="${p.x}" y="${p.y + 29}" text-anchor="middle" font-size="10" font-weight="600" font-family="JetBrains Mono, monospace" fill="var(--foreground)">@${escapeHtml(shortLabel)}</text>
                </g>
            `;
        })
        .join('');

    const totalBroadcasts = [...broadcastCounts.values()].reduce((s, c) => s + c, 0);
    const replayCaption =
        !isLive && activeReplayMsg
            ? `#${activeReplayMsg.seq} (${curSeqIdx + 1}/${seqs.length}) · @${activeReplayMsg.agent}: ${String(activeReplayMsg.text || '').slice(0, 105)}`
            : `Live · ${dynEdges.size} link${dynEdges.size === 1 ? '' : 's'}${!swarmGraphExpandAll && totalBroadcasts > 0 ? ` + ${totalBroadcasts} @all` : ''} across ${msgs.length} post${msgs.length === 1 ? '' : 's'}`;

    const sliderMax = seqs.length;
    const sliderVal = isLive ? sliderMax : curSeqIdx;
    const svgInlineHeightStyle = H > 300 ? `style="aspect-ratio: ${W} / ${H}; max-height: none;"` : '';

    swarmBodyScroll.innerHTML = `
        <div class="sw-graph-player" data-testid="swarm-graph-player">
            <div class="sw-graph-row">
                <button type="button" class="sw-graph-btn" id="swGraphStartBtn" title="First post">⏮</button>
                <button type="button" class="sw-graph-btn" id="swGraphPrevBtn" title="Previous post">◀</button>
                <button type="button" class="sw-graph-btn ${swarmGraphPlaying ? 'active' : ''}" id="swGraphPlayBtn" data-testid="swarm-graph-play-btn">
                    ${swarmGraphPlaying ? '⏸ Pause' : '▶ Replay'}
                </button>
                <button type="button" class="sw-graph-btn" id="swGraphNextBtn" title="Next post">▶|</button>
                <input type="range"
                       class="sw-graph-slider"
                       id="swGraphSlider"
                       min="0"
                       max="${sliderMax}"
                       step="1"
                       value="${sliderVal}"
                       ${seqs.length === 0 ? 'disabled' : ''} />
                <button type="button" class="sw-graph-btn ${isLive ? 'active' : ''}" id="swGraphLiveBtn">● Live</button>
            </div>
            <div class="sw-graph-row" style="justify-content:space-between;">
                <div style="display:inline-flex; gap:6px; flex-wrap:wrap;">
                    <button type="button" class="sw-graph-btn ${swarmGraphExpandAll ? 'active' : ''}" id="swGraphExpandAllBtn" data-testid="swarm-graph-expand-all-btn">
                        Expand @all
                    </button>
                    <button type="button" class="sw-graph-btn ${swarmGraphHideInactive ? 'active' : ''}" id="swGraphHideInactiveBtn">
                        Active Only
                    </button>
                </div>
                <select id="swGraphSpeedSelect" class="sw-filter-select" style="max-width:92px; flex:none;" aria-label="Replay speed">
                    <option value="500" ${swarmGraphSpeedMs === 500 ? 'selected' : ''}>1.8x Fast</option>
                    <option value="900" ${swarmGraphSpeedMs === 900 ? 'selected' : ''}>1.0x Normal</option>
                    <option value="1500" ${swarmGraphSpeedMs === 1500 ? 'selected' : ''}>0.6x Slow</option>
                </select>
            </div>
            <div data-testid="swarm-graph-caption" style="font-size:11.5px; color:var(--secondary-foreground); font-family:var(--font-mono); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(replayCaption)}</div>
        </div>

        <div class="sw-graph-svg-card">
            <svg class="sw-graph-svg" ${svgInlineHeightStyle} data-testid="swarm-graph-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Swarm @mention communication graph">
                <defs>
                    <marker id="swArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(125, 211, 252, 0.78)"></path>
                    </marker>
                    <marker id="swArrowActive" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"></path>
                    </marker>
                </defs>
                ${svgEdges}
                ${svgNodes}
            </svg>
            <div class="sw-graph-legend">
                <span>👑 Coordinator</span>
                <span style="color:var(--success);">● Working</span>
                <span>● Parked</span>
                <span>── Direct @mention</span>
                <span>-- @all broadcast</span>
            </div>
        </div>
    `;

    document.getElementById('swGraphStartBtn')?.addEventListener('click', () => {
        stopSwarmGraphPlayback();
        if (seqs.length) swarmGraphReplaySeq = seqs[0];
        renderSwarmGraphTab(cachedSwarmSnapshot);
    });
    document.getElementById('swGraphPrevBtn')?.addEventListener('click', () => {
        stopSwarmGraphPlayback();
        if (!seqs.length) return;
        const nextIdx = isLive ? seqs.length - 1 : Math.max(0, curSeqIdx - 1);
        swarmGraphReplaySeq = seqs[nextIdx];
        renderSwarmGraphTab(cachedSwarmSnapshot);
    });
    document.getElementById('swGraphPlayBtn')?.addEventListener('click', () => {
        if (swarmGraphPlaying) {
            stopSwarmGraphPlayback();
            renderSwarmGraphTab(cachedSwarmSnapshot);
        } else {
            startSwarmGraphPlayback();
        }
    });
    document.getElementById('swGraphNextBtn')?.addEventListener('click', () => {
        stopSwarmGraphPlayback();
        if (!seqs.length || isLive) return;
        if (curSeqIdx + 1 >= seqs.length) swarmGraphReplaySeq = null;
        else swarmGraphReplaySeq = seqs[curSeqIdx + 1];
        renderSwarmGraphTab(cachedSwarmSnapshot);
    });
    document.getElementById('swGraphLiveBtn')?.addEventListener('click', () => {
        stopSwarmGraphPlayback();
        swarmGraphReplaySeq = null;
        renderSwarmGraphTab(cachedSwarmSnapshot);
    });
    const slider = document.getElementById('swGraphSlider');
    if (slider) {
        slider.addEventListener('input', () => {
            stopSwarmGraphPlayback();
            const idx = Number(slider.value);
            swarmGraphReplaySeq = idx >= seqs.length ? null : seqs[Math.max(0, idx)];
            renderSwarmGraphTab(cachedSwarmSnapshot);
        });
    }
    document.getElementById('swGraphExpandAllBtn')?.addEventListener('click', () => {
        swarmGraphExpandAll = !swarmGraphExpandAll;
        renderSwarmGraphTab(cachedSwarmSnapshot);
    });
    document.getElementById('swGraphHideInactiveBtn')?.addEventListener('click', () => {
        swarmGraphHideInactive = !swarmGraphHideInactive;
        renderSwarmGraphTab(cachedSwarmSnapshot);
    });
    const speedSel = document.getElementById('swGraphSpeedSelect');
    if (speedSel) {
        speedSel.addEventListener('change', () => {
            swarmGraphSpeedMs = Number(speedSel.value) || 900;
            if (swarmGraphPlaying) startSwarmGraphPlayback();
        });
    }
}

function renderSwarmRawTab(data) {
    const raw = data.raw || {};
    const files = [
        { id: 'members', label: 'members.json', content: raw.members || '' },
        { id: 'board', label: 'board.jsonl', content: raw.board || '' },
        { id: 'swarm', label: 'swarm.json', content: raw.swarm || '' },
        { id: 'view', label: 'view.json', content: raw.view || '' },
        { id: 'plan', label: 'plan.json', content: raw.plan || '' }
    ];
    if (raw.viewHtml && String(raw.viewHtml).trim()) {
        files.push({ id: 'viewHtml', label: 'view.html', content: raw.viewHtml });
    }
    if (!files.some(f => f.id === swarmRawSelectedFile)) {
        swarmRawSelectedFile = 'members';
    }
    const currentFile = files.find(f => f.id === swarmRawSelectedFile) || files[0];
    const displayText = currentFile.content.trim()
        ? currentFile.content
        : `// ${currentFile.label} is not present in this swarm directory`;

    swarmBodyScroll.innerHTML = `
        <div class="sw-raw-toolbar">
            <div class="sw-raw-seg" role="tablist">
                ${files
                    .map(
                        f => `
                    <button type="button"
                            class="sw-raw-seg-btn ${f.id === swarmRawSelectedFile ? 'active' : ''}"
                            data-raw-file="${escapeHtml(f.id)}">
                        ${escapeHtml(f.label)}
                    </button>
                `
                    )
                    .join('')}
            </div>
            <button type="button" class="ide-action-btn" id="swarmRawCopyBtn" data-testid="swarm-raw-copy-btn">
                Copy
            </button>
        </div>
        <div class="sw-ov-card" style="padding:10px;">
            <pre class="ide-code-pre" data-testid="swarm-raw" style="max-height:58vh; overflow:auto; margin:0;"><code>${escapeHtml(displayText)}</code></pre>
        </div>
    `;

    const copyBtn = document.getElementById('swarmRawCopyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            if (await copyToClipboard(displayText)) {
                triggerHaptic('success');
                showToast(`Copied ${currentFile.label}`);
            }
        });
    }
}

async function sendSwarmCoordinatorMessage() {
    const msg = (swarmCoordInput?.value || '').trim();
    if (!msg) return;
    const coordId = cachedSwarmSnapshot?.coordinatorId || activeCascadeId;

    if (IS_OFFLINE_PREVIEW) {
        swarmCoordInput.value = '';
        showToast('Offline Preview · Connect PC Hub to message @coordinator live');
        return;
    }
    if (!coordId) {
        showToast('No Coordinator conversation found');
        return;
    }

    if (swarmCoordSendBtn) swarmCoordSendBtn.disabled = true;
    try {
        const res = await fetchWithAuth('/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msg,
                attachments: [],
                quotes: [],
                cascadeId: coordId
            })
        });
        const out = await res.json().catch(() => ({}));
        if (out && out.success !== false) {
            triggerHaptic('success');
            swarmCoordInput.value = '';
            recordRecentPrompt(msg);
            showToast('Sent instruction to @coordinator');
            setTimeout(() => refreshSwarmUi(false), 600);
        } else {
            showToast(out?.error || 'Failed to message @coordinator');
        }
    } catch (e) {
        showToast('Network error sending to @coordinator');
    } finally {
        if (swarmCoordSendBtn) swarmCoordSendBtn.disabled = false;
    }
}

function initSurfaceAndIdeControls() {
    if (switchNormalBtn) switchNormalBtn.addEventListener('click', () => { triggerHaptic('light'); switchSurface('antigravity'); });
    if (switchSwarmBtn) switchSwarmBtn.addEventListener('click', () => { triggerHaptic('light'); switchSurface('swarm'); });
    if (switchIdeBtn) switchIdeBtn.addEventListener('click', () => { triggerHaptic('light'); switchSurface('ide'); });
    if (sidebarSwitchSwarmBtn) {
        sidebarSwitchSwarmBtn.addEventListener('click', () => {
            hideChatHistoryUI();
            switchSurface(currentSurface === 'swarm' ? 'antigravity' : 'swarm');
        });
    }
    if (sidebarSwitchIdeBtn) {
        sidebarSwitchIdeBtn.addEventListener('click', () => {
            hideChatHistoryUI();
            switchSurface(currentSurface === 'ide' ? 'antigravity' : 'ide');
        });
    }

    if (quotaPillBtn) quotaPillBtn.addEventListener('click', () => openQuotaModal(false));
    if (sidebarOpenQuotaBtn) sidebarOpenQuotaBtn.addEventListener('click', () => openQuotaModal(false));
    if (exportChatBtn) exportChatBtn.addEventListener('click', exportActiveConversation);

    // Swarm UI Controls & Event Delegation
    document.querySelectorAll('.swarm-subtab[data-swarm-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic('light');
            setSwarmSubtab(btn.getAttribute('data-swarm-tab') || 'overview');
        });
    });

    if (swarmRefreshBtn) {
        swarmRefreshBtn.addEventListener('click', () => {
            triggerHaptic('light');
            cachedSwarmEtag = '';
            refreshSwarmUi(true);
        });
    }

    if (swarmOpenCoordBtn) {
        swarmOpenCoordBtn.addEventListener('click', () => {
            const coordId = cachedSwarmSnapshot?.coordinatorId;
            if (!coordId) return;
            triggerHaptic('medium');
            if (IS_OFFLINE_PREVIEW) {
                switchSurface('antigravity');
                showToast('Switched to Coordinator preview stream');
                return;
            }
            selectChat({ cascadeId: coordId, title: cachedSwarmSnapshot?.title || 'Swarm Coordinator' });
        });
    }

    if (swarmSelectorSelect) {
        swarmSelectorSelect.addEventListener('change', () => {
            selectedSwarmIdOverride = swarmSelectorSelect.value || '';
            cachedSwarmEtag = '';
            swarmOverviewOwnerFilter = '';
            swarmBoardSearch = '';
            swarmBoardPosterFilter = '';
            swarmBoardRecipientFilter = '';
            swarmBoardChannelFilter = 'all';
            swarmGraphReplaySeq = null;
            stopSwarmGraphPlayback();
            refreshSwarmUi(true);
        });
    }

    if (swarmCoordSendBtn) {
        swarmCoordSendBtn.addEventListener('click', sendSwarmCoordinatorMessage);
    }
    if (swarmCoordInput) {
        swarmCoordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendSwarmCoordinatorMessage();
            }
        });
    }

    if (swarmBodyScroll) {
        swarmBodyScroll.addEventListener('scroll', () => {
            if (isRenderingSwarmBoard || currentSwarmSubtab !== 'feed') return;
            const maxScroll = swarmBodyScroll.scrollHeight - swarmBodyScroll.clientHeight;
            const nearBottom = maxScroll - swarmBodyScroll.scrollTop < 90;
            if (!nearBottom && maxScroll > 140) {
                swarmBoardFollow = false;
            } else if (nearBottom) {
                swarmBoardFollow = true;
            }
            const jumpBtn = document.getElementById('swarmJumpLatestBtn');
            if (jumpBtn) {
                jumpBtn.style.display = !nearBottom && maxScroll > 160 ? 'inline-flex' : 'none';
            }
        }, { passive: true });

        swarmBodyScroll.addEventListener('click', async (e) => {
            const launchCmdBtn = e.target.closest('[data-launch-swarm-cmd]');
            if (launchCmdBtn) {
                e.preventDefault();
                const rawCmd = launchCmdBtn.getAttribute('data-launch-swarm-cmd') || '/swarm';
                switchSurface('antigravity');
                rawCmd.split(/\s+/).filter(Boolean).forEach(tok => {
                    toggleOrInsertSlashAction(tok, { allowToggleOff: false });
                });
                messageInput?.focus();
                showToast(`Ready to launch ${rawCmd}`);
                return;
            }

            const pickSwarmBtn = e.target.closest('[data-pick-swarm]');
            if (pickSwarmBtn) {
                e.preventDefault();
                const swId = pickSwarmBtn.getAttribute('data-pick-swarm') || '';
                if (swId) {
                    triggerHaptic('medium');
                    selectedSwarmIdOverride = swId;
                    cachedSwarmEtag = '';
                    await refreshSwarmUi(true);
                }
                return;
            }

            const filterWsOwnerBtn = e.target.closest('[data-filter-ws-owner]');
            if (filterWsOwnerBtn) {
                e.preventDefault();
                const owner = filterWsOwnerBtn.getAttribute('data-filter-ws-owner') || '';
                swarmOverviewOwnerFilter = swarmOverviewOwnerFilter === owner ? '' : owner;
                renderSwarmOverviewTab(cachedSwarmSnapshot);
                return;
            }

            const jumpSeqBtn = e.target.closest('[data-jump-seq]');
            if (jumpSeqBtn) {
                e.preventDefault();
                e.stopPropagation();
                triggerHaptic('light');
                jumpToSwarmBoardSeq(jumpSeqBtn.getAttribute('data-jump-seq'));
                return;
            }

            const filterPosterBtn = e.target.closest('[data-filter-board-poster]');
            if (filterPosterBtn) {
                e.preventDefault();
                const poster = filterPosterBtn.getAttribute('data-filter-board-poster') || '';
                swarmBoardPosterFilter = swarmBoardPosterFilter === poster && currentSwarmSubtab === 'feed' ? '' : poster;
                setSwarmSubtab('feed');
                return;
            }

            const channelBtn = e.target.closest('[data-board-channel]');
            if (channelBtn) {
                e.preventDefault();
                swarmBoardChannelFilter = channelBtn.getAttribute('data-board-channel') || 'all';
                renderSwarmBoardTab(cachedSwarmSnapshot, false);
                return;
            }

            const togglePostBtn = e.target.closest('[data-toggle-post-seq]');
            if (togglePostBtn) {
                e.preventDefault();
                const seq = Number(togglePostBtn.getAttribute('data-toggle-post-seq'));
                if (swarmBoardExpandedSeqs.has(seq)) swarmBoardExpandedSeqs.delete(seq);
                else swarmBoardExpandedSeqs.add(seq);
                renderSwarmBoardFeedListOnly(cachedSwarmSnapshot, false);
                return;
            }

            const replyPostBtn = e.target.closest('[data-reply-post-seq]');
            if (replyPostBtn) {
                e.preventDefault();
                const seq = replyPostBtn.getAttribute('data-reply-post-seq') || '';
                const agent = replyPostBtn.getAttribute('data-reply-post-agent') || '';
                if (swarmCoordInput) {
                    const prefix = `re #${seq}${agent ? ` (@${agent})` : ''}: `;
                    if (!swarmCoordInput.value.startsWith(prefix)) {
                        swarmCoordInput.value = prefix + swarmCoordInput.value;
                    }
                    swarmCoordInput.focus();
                }
                return;
            }

            const quotePostBtn = e.target.closest('[data-quote-post-seq]');
            if (quotePostBtn) {
                e.preventDefault();
                const seq = Number(quotePostBtn.getAttribute('data-quote-post-seq'));
                const post = (cachedSwarmSnapshot?.messages || []).find(m => Number(m.seq) === seq);
                if (post) {
                    const coordId = cachedSwarmSnapshot?.coordinatorId;
                    if (!IS_OFFLINE_PREVIEW && coordId && coordId !== activeCascadeId) {
                        await selectChat({ cascadeId: coordId, title: cachedSwarmSnapshot?.title || 'Coordinator' });
                    } else {
                        switchSurface('antigravity');
                    }
                    addQuoteToComposer(
                        {
                            content: `@${post.agent} (#${post.seq}): ${post.text}`,
                            label: 'Quote',
                            sourceLabel: `Swarm Board #${post.seq} · @${post.agent}`
                        },
                        'answer'
                    );
                    showToast(`Quoted Board Post #${post.seq} into Coordinator chat`);
                }
                return;
            }

            const openMemBtn = e.target.closest('[data-open-member-chat]');
            if (openMemBtn) {
                e.preventDefault();
                const convId = openMemBtn.getAttribute('data-open-member-chat') || '';
                if (!convId) return;
                triggerHaptic('medium');
                if (IS_OFFLINE_PREVIEW) {
                    switchSurface('antigravity');
                    showToast('Offline Preview · Connect PC Hub to open live worker chat');
                    return;
                }
                await selectChat({ cascadeId: convId });
                return;
            }

            const graphNode = e.target.closest('[data-graph-member]');
            if (graphNode) {
                e.preventDefault();
                const memName = graphNode.getAttribute('data-graph-member') || '';
                if (memName) {
                    triggerHaptic('light');
                    swarmBoardPosterFilter = memName;
                    setSwarmSubtab('feed');
                    showToast(`Filtered Board to @${memName}`);
                }
                return;
            }

            const rawBtn = e.target.closest('[data-raw-file]');
            if (rawBtn) {
                e.preventDefault();
                swarmRawSelectedFile = rawBtn.getAttribute('data-raw-file') || 'members';
                renderSwarmRawTab(cachedSwarmSnapshot);
                return;
            }
        });
    }

    if (ideTargetHubBtn) ideTargetHubBtn.addEventListener('click', () => switchBackendTarget('antigravity'));
    if (ideTargetIdeBtn) ideTargetIdeBtn.addEventListener('click', () => switchBackendTarget('ide'));
    if (openDesktopIdeBtn) openDesktopIdeBtn.addEventListener('click', () => openInDesktopIde());
    if (ideRefreshBtn) ideRefreshBtn.addEventListener('click', () => { triggerHaptic('light'); refreshIdeWorkspace(); });

    if (ideWorkspaceSelect) {
        ideWorkspaceSelect.addEventListener('change', async () => {
            const chosenWs = ideWorkspaceSelect.value;
            if (!chosenWs || IS_OFFLINE_PREVIEW) return;
            currentIdeDir = '';
            currentIdeSearch = '';
            currentIdeFile = null;
            await fetchWithAuth('/ide/switch-target', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: currentBackendTarget, workspacePath: chosenWs })
            }).catch(() => {});
            await refreshIdeWorkspace();
            showToast('Switched IDE workspace');
        });
    }

    document.querySelectorAll('.ide-subtab[data-ide-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic('light');
            const tab = btn.getAttribute('data-ide-tab') || 'explorer';
            setIdeSubtab(tab);
        });
    });

    if (chatFindToggleBtn) {
        chatFindToggleBtn.addEventListener('click', () => {
            triggerHaptic('light');
            if (chatFindBar && chatFindBar.style.display !== 'none') closeChatFindBar();
            else openChatFindBar('');
        });
    }
    if (chatFindInput) {
        chatFindInput.addEventListener('input', () => applyChatFindHighlights(true));
        chatFindInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                stepChatFind(e.shiftKey ? -1 : 1);
            } else if (e.key === 'Escape') {
                closeChatFindBar();
            }
        });
    }
    if (chatFindPrevBtn) chatFindPrevBtn.addEventListener('click', () => stepChatFind(-1));
    if (chatFindNextBtn) chatFindNextBtn.addEventListener('click', () => stepChatFind(1));
    if (chatFindCloseBtn) chatFindCloseBtn.addEventListener('click', closeChatFindBar);
}

// --- Boot ---
initTheme();
initMobileIntegration();
setupScrollAndStreamInteractions();
initTextSelectionQuoting();
initQuickActions();
initFileAttachments();
initSpeechRecognition();
initModalsAndGestures();
initSurfaceAndIdeControls();
syncSlashCountBadge();
restoreComposerDraft();

if (IS_OFFLINE_PREVIEW) {
    renderOfflinePreviewDemo();
    fetchQuotaSummary(false);
} else {
    connectWebSocket();
    fetchAppState();
    fetchQuotaSummary(false);
    fetchSlashCommandsCatalog();
    setInterval(fetchAppState, 5000);
    setInterval(() => fetchQuotaSummary(false), 30000);
    setInterval(() => {
        if (currentSurface === 'swarm' && autoRefreshEnabled) {
            refreshSwarmUi(false);
        }
    }, 2500);
}
