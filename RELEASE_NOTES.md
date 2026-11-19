---

## v6.0.0 - Antigravity 2.33 Agentic Hub, Gemini 4 & Swarm UI, and Native Android APK 🚀📱
**Release Date:** November 18, 2026

---

### ⚡ Antigravity 2.33 Zero-Flag Hub ConnectRPC Bridge (`hub_bridge.js`)
- **Zero-Flag Daemon Auto-Discovery**: Automatically discovers live Antigravity 2.33+ `language_server` instances from `~/.gemini/antigravity/daemon/hub_*.json` over ConnectRPC — `--remote-debugging-port=9000` is no longer required! Retains automatic CDP fallback for older IDE builds.
- **Full Trajectory & Swarm Streaming**: Renders structured `GetCascadeTrajectory` streams including thinking token accordions, `📝 Wrote` / `✏️ Edited` file action pills with `+additions` / `-deletions` badges and unified diff hunks (`CORTEX_STEP_TYPE_CODE_ACTION`), active & completed `⌘ Terminal` / `🐝 Swarm` / `✉️ Messaged` / `⚡ Workflow` / `⚙️ Task` / `⏱️ Schedule` generic tool executions (`CORTEX_STEP_TYPE_GENERIC`), and strict filtering of internal `CORTEX_STEP_SOURCE_SYSTEM_SDK` reminders.
- **Exact Antigravity 2.33 `userConfig` Parity**: Synchronizes user declarative mixins, builtin skills/subagents (`DeepCoder`, `DeepInvestigator`, `image-generator`), `executorConfig`, and `conversationHistoryConfig` with live Hub trajectories.
- **Interactive Approvals & `ask_question` Support**: Handle `Approve` / `Deny` permission prompts (`runCommand`, `filePermission`, `browserAction`, `permission`) and single/multi-select + write-in `ask_question` cards directly from mobile via `HandleCascadeUserInteraction`.

### 🧠 23 Active Models (24 Live Entries), 4 Execution Modes & `/boost` + `/swarm`
- **Antigravity 2.33 Model Catalog**: Grouped family & effort bottom-sheet picker defaulting to **Gemini 4 Neon (High)** (`Low`, `Medium`, `High`, `XHigh`) and supporting **Orchestrator** (`Neon`, `Argon` with `Neon` ordered first), **Gemini 4 Argon** (`Low`, `Medium`, `High`), **Gemini 4 Hydrogen** (`Low`, `Medium`, `High`, `XHigh`), **Gemini 3.8 Flash** (`Low`, `Medium`, `High`), **Claude Opus 5.5** (`Low`, `Medium`, `High`), **Claude Sonnet 5.5** (`Low`, `Medium`, `High`), **GPT-OSS 120B** (`Medium`, deprecation `Notice`), and plan-gated **Gemini 4 Carbon** (`Unavailable` muted card & disabled pill with helpful tooltip/toast instead of failing `/set-model` calls; plus legacy `Claude 4.6` fallback). Displays subtle family `tagDescription` hints, crisp `/model` token resolution (`/model neon`, `/model neon xhigh`, `/model orchestrator neon`), and live quota percentages from `GetUserStatus`.
- **Execution Modes**: Switch seamlessly between `Agent`, `Autonomous`, `Planning` (auto-prepends `/plan`), and `Fast` (overrides to `Gemini 3.8 Flash (High)`).
- **Complete `/` Actions Catalog & `/btw` Side Questions**: Dedicated `/` composer button (`All / Actions` categorized bottom sheet with search + `All`, `System`, `Skills`, `Plugins`, `Workflows & MCP`, and `Controls` tabs), uncapped `/` autocomplete popup, non-interrupting `/btw` side-question trajectories (`CORTEX_TRAJECTORY_TYPE_SIDE_QUESTION` + `UpdateConversationAnnotations` + `↱ Quote into Main Chat`), punctuation-safe mid-sentence & query-param `/command` tokenization, leading `/` hook prioritization with quotes (`Quote + /compact`), full `SlashCommandInfo` (`modelFacingText`) hydration, `ListProjects`/`ReadProjects` + `GetAllWorkflows` (`recipe` with normalized `file:///` URIs), `ListMcpPrompts` (`mcpPrompt`), `/goal` & `/compact` checkpoint support, and client `/` controls (`/new`, `/stop`, `/model`, `/mode`, `/fast`, `/theme`, `/clear`, `/history`).
- **Response Quoting & Specific Answers**: Quote any assistant response (`❝ Quote & Reply`) with immediate specific-answer input, split multi-block responses/tables/lists into selectable items with dedicated per-part answer inputs (`☷ Quote Parts`), highlight any substring using touch-locked selection banners or Android's native OS `ActionMode` (`❝ Quote` & `💬 /btw` in `QuotableWebView`), or quote code blocks from inline headers and the full-screen code viewer (`</> Quoted Code`), sending native Antigravity 2.33 `TextBlock` (`Quote` / `code_block`) scope items via `SendUserCascadeMessage`.

### 🐝 Native Antigravity 2.33 Swarm UI, Weekly Quota, Antigravity IDE Section & QoL Suite
- **Native 5-Tab Swarm UI (`GET /swarm`, `GET /swarm/list`, WebSocket `swarm_update`)**:
  - Reads Antigravity 2.33's native `~/.gemini/antigravity/brain/<swarmId>/.system_generated/swarm/{members.json, board.jsonl, view.json, plan.json}` plus per-agent `logs/transcript.jsonl` (and synthesizes live boards for `/boost` `invoke_subagent` hierarchies) with `etag` fast-path caching.
  - **Overview**: Animated 2-frame flapping Pixel-Bee `<canvas>` sprites (Queen Coordinator crown, working wing flap, parked `z`), SVG workstream progress ring, `quota` / `error` / `stuck` / `blocked` alert banners, crew bee owner filters, and shimmering live tool activity.
  - **Shared Board**: Sticky search (focus-safe during live streaming), poster/recipient/`#channel` filters, unread `"New Posts"` divider, consecutive post grouping, clickable `#seq` post citations with smooth scroll + highlight flash, `↩ Reply` into Coordinator dock, and `❝ Quote` into Coordinator chat.
  - **Members, @Mention Graph & Raw**: Searchable agent cards with retired toggle & `Open Chat →` deep links; directed SVG `@mention` communication graph with `Expand @all` and interactive step-by-step **Replay** scrubber; raw `members.json` / `board.jsonl` / `view.json` / `plan.json` viewer; and native `[Open the Swarm UI](sidecar://swarm/...)` pill interception across web and Android WebView (`WebViewUrlAction.OPEN_SWARM_UI`).
- **Live Weekly & 5-Hour Model Quota + Context Window Breakdown (`GET /quota`)**:
  - Top-bar SVG quota ring pill (`#quotaPillBtn`), sidebar weekly quota progress card, and detailed `/quota` bottom sheet displaying accurate 3-group quotas (**`Gemini Models`**, **`Gemini 4 Argon`**, and **`Claude and GPT models`**) with Weekly remaining %, exact reset countdowns, per-family 5-hour burst windows, active conversation prompt/cache/output/thinking token usage, and one-tap `/compact`.
- **3-Way Surface Switcher (`Antigravity` · `Swarm` · `Antigravity IDE`) & Mobile IDE (`GET/POST /ide/*`)**:
  - Browse workspace directories & search files (`/ide/files`), view syntax-numbered code with tap-to-select line ranges (`Quote Lines` -> native `fileLineRange` `TextBlock`), edit & save workspace files (`/ide/file` with canonical realpath containment blocking traversal), inspect `git status` & unified diffs (`/ide/git`), switch Hub vs. IDE target (`/ide/switch-target`), and open/focus files on desktop (`↗ Open on PC`).
- **Quality-of-Life Improvements**:
  - In-conversation `/find` search & match navigation (`#chatFindBar`), clean Markdown conversation export (`/export` / `GET /export-chat`), `/prompts` recent prompt recall sheet, `localStorage` composer draft persistence, and non-blocking zero-flag server startup (`<250ms` when Hub RPC is active).

### 🎨 Antigravity 2.33 Mobile UI & Single-Port HTTP/HTTPS Server (`server.js` + `public/`)
- **Obsidian & Light Design System**: Rebuilt mobile frontend around Antigravity 2.33's exact Obsidian (`#101010` / `#191919` / `#282828` / `#007acc` / `#38bdf8`) and Light theme tokens, featuring the `.surface-composer` card, `input-box-bottom-toolbar`, and slide-out Hub drawer with recursive L1/L2+ swarm worker trees.
- **Single-Port HTTP + HTTPS Multiplexer**: Byte-sniffing TCP multiplexer serves both `http://` (`ws://`) and `https://` (`wss://`) on the same port (`3000`) simultaneously.
- **Direct Clean-Prompt Media, Binary-Safe Uploads & APK Hosting**: Preserves exact non-UTF8 bytes for PDF/archive/image uploads (`/upload-attachment`, `/upload-media`), sends direct native `media` items without injecting `[Attached: ...]` path clutter into user prompts, streams stored trajectory/uploaded media via `/hub/media` as 96×96 image thumbnails + typed file cards + full-screen `#mediaLightboxModal` previews, disambiguates duplicate clipboard-pasted filenames (`image.png`, `image_2.png`), and exposes `/apk-status` + `/download/apk` for one-tap Android installation.

### 🤖 Native Android Mobile Application (`Antigravity-Remote-Control-v6.0.apk`)
- **Jetpack Compose Connection Hub**: Automatic parallel LAN subnet scanner (`ServerDiscovery.scanSubnetForServers`), manual IP / Cloudflare / ngrok / Pinggy tunnel entry, Magic Link `?key=` extraction, recent endpoints list, and bundled **Offline UI Preview** (`file:///android_asset/www/index.html`).
- **Native Bridge & Safe External URL Routing**: `AndroidBridge` JavaScript interface for native haptics, clipboard, status bar theming, session key persistence, document picker uploads, and microphone permissions, plus `WebViewClient.shouldOverrideUrlLoading` routing external HTTP/HTTPS links to Android's browser while keeping same-server and `android_asset` pages inside the session WebView.


---

## v0.3.0 - Security & Architecture Hardening 🛡️
**Release Date:** April 07, 2026

---

### 🛡️ Zero-Trust Frontend & CSP
- **Zero-Inline Architecture**: Refactored 100% of the mobile frontend to remove `'unsafe-inline'` script dependencies. All UI interactions (SSL, history, modals) are now handled via secure event listeners and high-performance delegation in `app.js`.
- **Strict Content Security Policy (CSP)**: Implemented a robust CSP in `index.html` that explicitly blocks inline JS. This provides a critical defense-in-depth layer against XSS risks from mirrored IDE snapshots.
- **Security-First Event Logic**: Moved from brittle `onclick` attributes to a modern, decoupled event system. This improves codebase maintainability and significantly hardens the client's security posture.

### ⚡ Performance & Core Hardening
- **Automated Security Audit**: The `server.js` engine now conducts a real-time security check upon launch. High-visibility ⚠️ warnings are printed to the terminal if default passwords or insecure session secrets are detected.
- **Cloudflare Tunnel Support (v0.2.34)**: Added first-class support for `cloudflared` as a native alternative to ngrok, offering even lower latency and seamless global access.
- **History Reliability (v0.2.35)**: Improved the conversation switching engine with smarter collection polling and workspace filtering, making history navigation significantly more resilient.

### 🎮 Remote Management & UI
- **Enhanced Permission Control (v0.2.31)**: Expanded the deterministic targeting layer to handle complex IDE permission bars. You can now "Allow", "Deny", or "Review Changes" directly from your phone with 100% click-parity.
- **Architecture Infographic (v0.2.29)**: Added a new, theme-aware technical infographic to the `README.md` for better project transparency.

### 📚 Documentation Overhaul
- **Comprehensive Docs Update**: Synced `SECURITY.md`, `CODE_DOCUMENTATION.md`, and `DESIGN_PHILOSOPHY.md` with the new security-first architecture. 
- **Setup Guidance**: Added detailed instructions for first-time HTTPS configuration and tunnel provider selection.

---

## v0.2.28 - UI/UX Pro Max & The Obsidian Overhaul 💎
**Release Date:** February 27, 2026

---

### ✨ The "Obsidian" Visual Overhaul
- **Aesthetic Excellence**: Completely reimagined the mobile interface with a deep, "Space Black" palette and gorgeous violet-to-indigo gradients. It's our most premium-feeling update yet.
- **Glassmorphic Prompt Area**: Refined the quick-action pills (Continue, Explain, Fix Bugs) with elegant glassmorphism effects and micro-animations. Pills now "float" and glow with subtle violet shadows when interacted with.
- **Symmetric Controls**: Re-styled the History button to match the minimalist, icon-only design of the Refresh button for a cleaner, unified header aesthetic.

### 🚀 New Features & Deep Sync
- **Explain Pill**: Added a dedicated "Explain" quick-action pill for one-tap, detailed code breakdowns.
- **Dynamic Glows**: Interactive elements now emit a soft indigo/violet glow, matching the theme's core accent for better visual feedback.
- **Perfect Sync (v0.2.26)**: Dismissing the mobile history layer now automatically triggers a remote "Escape" sequence to close the desktop history panel instantly.
- **Premium History Cards (v0.2.25)**: Completely redesigned the history view with elevated, interactive cards and smooth transitions.

### 🛡️ Security & Auditing
- **OWASP Security Audit**: Performed a "Paranoid Mode" security sweep across the entire codebase.
- **Audit Logging**: Updated `SECURITY.md` with detailed findings on secrets management, injection prevention, and authentication protocols.
- **Verified Protection**: Confirmed that the CDP injection layer remains strictly scoped and secure against XSS.

### 📚 Documentation
- **Technical Sync**: Updated `CODE_DOCUMENTATION.md` and `DESIGN_PHILOSOPHY.md` to reflect the new visual architecture and human-centric design choices.

---

## v0.2.24 - Deterministic Targeting & Security Hardening 🎯
**Release Date:** February 26, 2026

---

### 🚀 New Features & Precision Controls
- **Deterministic Targeting Engine**: Completely solved the "Duplicate Element Mismatch" issue. Interactive elements like "Run", "Reject", and "Thought" toggles now use dynamic occurrence index tracking to ensure your tap hits the exact message you intended, even in long chat histories with many identical buttons.
- **Leaf-Most Filtering**: Introduced a "Zero-Proxy Filter" on the server. The system now automatically identifies and targets the inner-most interactive node, preventing "Nested DOM Traps" where clicks would land on parent containers instead of the actual button.
- **Strict Scoped Clicking**: CDP clicks are now prioritized within the active chat cascade (`#conversation`, `#cascade`), ensuring that historical buttons are matched with 100% precision while ignoring unrelated sidebar controls.
- **Enhanced Thought Matching**: Thought toggles now use strict first-line text matching (e.g., "Thought for 2s") to reliably distinguish between multiple reasoning blocks in a single session.

### 🛡️ Security & Infrastructure
- **Security Secret Externalization**: Removed hardcoded secrets for signed cookies and authentication salts. All sensitive security tokens can now be customized via `.env` to invalidate sessions or harden the server.
- **Full Security Audit**: Conducted a formal security sweep (OWASP scope) and documented the results in `SECURITY.md`. Confirmed robust protection against XSS and CDP injection.
- **Enhanced .env Template**: Updated `.env.example` with new optional security parameters for advanced users.

### 📚 Documentation
- **Technical Deep-Dive**: Updated `CODE_DOCUMENTATION.md` with details on the new Dual-Pass targeting architecture and Leaf-Node isolation logic.
- **Ideological Alignment**: Refined `DESIGN_PHILOSOPHY.md` to reflect the move toward "Robustness with Zero-Proxy Precision."

---

## v0.2.21 - Deep Integration & Visual Fidelity 🚀
**Release Date:** February 26, 2026

---

### 🚀 New Features & Infrastructure
- **Remote Command Actions**: Fully documented and stabilized support for remote "Run" and "Reject" command buttons, allowing for seamless remote code execution control.
- **Occurrence Index Tracking**: Introduced a new tracking system for remote clicks that ensures perfectly accurate targeting in complex, repetitive UI trees (no more misclicks on identical buttons!).
- **Mobile Chat History Integration**: Browsing and switching between past AI conversations is now fully integrated into the mobile UI.
- **Base64 Image Fidelity**: All local SVGs and images are now automatically converted to Base64 before being served. This fixes the "broken image" issue commonly seen when accessing the server from a remote device.

### ⚡ Improvements & Fixes
- **v0.2.19 - Inline File References**: Fixed a CSS rendering bug where file icons and filenames would break into multiple lines; they now render perfectly inline.
- **v0.2.18 - XSS Hardening**: Added robust XSS protection for chat history titles in the mobile interface.

### 📚 Documentation
- **v0.2.20 - Scoped Boundaries**: Documented strict scoped boundaries for DOM scraping to improve performance and prevent unintended context leakage.

---


## v0.2.17 - UI Polish & Model Compatibility 🌟
**Release Date:** February 20, 2026

---

### 🚀 New Features & Improvements
- **Glassmorphism UI**: Upgraded the quick actions and settings bars with a gorgeous new glassmorphism effect for a sleek, modern, and premium mobile experience.
- **Latest AI Models**: Automatically updated and verified support for the latest model versions from Gemini, Claude, and OpenAI to ensure zero disruption.
- **Improved Dark Mode Tracking**: Enhanced UI styling and state capture logic designed to provide maximum clarity and correct model detection down to the CSS layer while in dark mode.

### 📚 Documentation Updates
- Updated `README.md` to showcase the new glassmorphism and model coverage features.
- Synced `CODE_DOCUMENTATION.md` and `DESIGN_PHILOSOPHY.md` to capture recent visual overrides and DOM scraping improvements.

---

## v0.2.13 - Smart Cleanup & Reliability 🛡️ (supports latest release)
**Release Date:** February 7, 2026

---

### 🚀 Performance & UI Reliability
- **Aggressive DOM Cleanup**: Rewrote the snapshot capture logic to filter out more desktop-specific noise, including "Review Changes" bars, "Linked Objects," and leftover desktop input elements.
- **Improved Model Selection**: Implemented a multi-strategy polling approach for the remote Model Selector, significantly increasing reliability when switching between Gemini, Claude, and GPT.
- **Smart Container Detection**: The server now supports multiple chat container IDs (including legacy `#conversation` and newer `#cascade`), ensuring compatibility across various Antigravity versions.

### 📚 Documentation & Developer Experience
- **Documentation Overhaul**: Major updates to `README.md`, `CODE_DOCUMENTATION.md`, and `DESIGN_PHILOSOPHY.md` to reflect the current security model and new features.
- **Context Menu Visibility**: Added documentation for the native Windows/Linux right-click context menu installation scripts.
- **Setup Refinement**: Clearer instructions for self-signed certificate handling and Web Mode (ngrok) configuration.

### 🐛 Bug Fixes & Refinements
- **UI Overflow**: Fixed an issue where the history panel would occasionally overflow on small mobile screens.
- **Empty State Formatting**: Corrected HTML formatting in the empty chat state component.
- **Process Cleanup**: Enhanced the port-killing logic to handle stubborn "ghost" processes on Windows more reliably.

---

## v0.2.6 - Full-Screen History & Visual Upgrades 📜
**Release Date:** February 1, 2026

---

### ✨ NEW: Mobile History Experience
- **Full-Screen History Layer**: Replaced the cramped history view with a dedicated, high-density full-screen layer for mobile.
- **Remote Conversation Switching**: Tap any past conversation on your phone to instantly switch the desktop session to that chat.
- **History Icon**: A new dedicated icon in the header allows for instant access to your past chats.

### 🚀 Visual & UX Improvements
- **Visual Context Menus**: Added native icons to the Windows right-click menu ("Open with Antigravity (Debug)") for a premium feel.
- **Zero-Config Setup**: Launchers now automatically create a `.env` file from templates if it's missing.
- **Frictionless Experience**: Improved setup guidance for first-time web access and remote configurations.

---

## v0.2.1 - Magic Links & Unified Launcher ✨
**Release Date:** January 21, 2026

---

### ✨ NEW: Magic Link Auto-Login
- **QR Code Magic**: In Web Mode, the QR code now embeds your password! Just scan it to log in instantly—no typing required.
- **Smart Redirects**: Automatically sets your secure session cookie and seamlessly redirects you to the app interface.

### 🚀 Unified Launcher Experience
- **One Script to Rule Them All**: Introduced `launcher.py`, a robust Python core that powers both Local and Web modes.
- **Improved Local Mode**:
  - Automatically detects if you have SSL certificates and generates the correct `https://` local URL.
  - Generates a QR code for your local Wi-Fi IP for easy connecting.
- **Cleaner Interface**:
  - Server logs are now redirected to `server_log.txt`, keeping your terminal screen calm and focused.
  - Displays clear, numbered steps for connecting on both Local and Web modes.

### 🛡️ Enhanced Troubleshooting
- **Real-Time Diagnostics**: The launcher now monitors the server log in real-time.
- **Immediate Alerts**: If the server can't find the Antigravity editor (CDP), it instantly flashes a **RED WARNING** in the terminal with specific fix instructions (e.g., "Open with Antigravity (Debug)").

### 🐛 Bug Fixes
- **Socket Error**: Fixed a crash in `launcher.py` related to `socket.AF_INET` initialization.
- **HTTPS Mismatch**: Fixed an issue where Local Mode would generate `http://` links even when the server was running securely on `https://`.

---

## v0.2.0 - Global Remote Access (Web Mode) 🌍
**Release Date:** January 21, 2026

---

### ✨ NEW: World-Wide Remote Access
- **Global Tunneling**: Integrated `ngrok` support via `tunnel.py` to expose the server securely to the internet.
- **Mobile Data Support**: Access your Antigravity chat from anywhere without needing to be on the same Wi-Fi.
- **One-Click Web Launchers**: New `start_ag_phone_connect_web.bat` and `.sh` scripts that automate server startup, tunnel creation, and passcode management.

### 🔒 Security & Authentication
- **Password Protection**: Introduced a passcode system for all remote sessions.
- **Passcode Auto-Generation**: Automatically generates a temporary 6-digit passcode if no password is set in `.env`.
- **Conditional Auth**: Intelligently bypasses authentication for devices on the same local Wi-Fi for a seamless home experience.
- **Secure Sessions**: Implemented signed `httpOnly` cookies for robust session management.

### 🛡️ Improved Process Management
- **Aggressive Cleanup**: Launchers now forcefully kill any hidden "ghost" processes from previous messy exits, ensuring a clean start every time.
- **Smarter Exit Handlers**: `Ctrl+C` now triggers a graceful shutdown and automatically closes the terminal window after a 3-second countdown.

### 🚀 Optimization
- **Data Compression**: Gzip compression added to all snapshots, reducing mobile data usage and speeding up loading on thin signals.
- **Express Speed**: Snapshots are now served with explicit UTF-8 encoding and optimized headers to prevent character corruption on mobile proxies.

---

## v0.1.7 - Robustness & Stability Update 🛡️
**Release Date:** January 21, 2026

---

### ✨ Key Improvements

#### 🔄 Smart Reconnection
- **Auto-Recovery**: Server now automatically detects lost CDP connections (e.g., if you close/reopen Antigravity) and reconnects without needing a restart.
- **Resilient Startup**: You can now start the server *before* Antigravity. It will patiently poll ("🔍 Looking for Antigravity...") until it finds the debug port.
- **Context Awareness**: Improved logic to track active execution contexts, preventing "stuck" snapshots when tabs are closed or refreshed.

#### 🛠️ Frontend & Performance
- **Client-Side Rendering**: Fixed a critical bug where the mobile client would hang on loading due to a syntax error in dynamic CSS injection.
- **Optimized Capture**: Rewrote the CSS gathering logic to use array joining instead of string concatenation, improving performance on large chat histories.
- **Syntax Fixes**: Corrected template literal escaping in the snapshot capture script (`\n` vs `\\n`) to prevent runtime evaluation errors.

#### 🔍 Enhanced Diagnostics
- **Throttled Logging**: Added intelligent logging that warns about common issues (like "cascade not found") only once every 10 seconds, preventing console spam.
- **Actionable Tips**: Error messages now include helpful hints (e.g., "Tip: Ensure an active chat is open in Antigravity").

#### 🐛 Bug Fixes
- **Registry Path Handling**: Fixed `install_context_menu.bat` to correctly handle installation paths containing spaces (wrapping `%V` in quotes).
- **Process Cleanup**: Improved the "Auto-Port Kill" feature to be more reliable on Windows.

---

## v0.1.6 - Mobile Copy & Stability Improvements 📋
**Release Date:** January 20, 2026

---

### ✨ New Features

#### 📋 Mobile Code Block Copy Button
- **One-Tap Copy**: Small copy icon appears next to all code blocks on mobile
- **Cross-Platform Support**: Works on Android, iOS, Windows, and macOS browsers
- **Visual Feedback**: Icon turns into a green checkmark (✓) on successful copy
- **Clipboard API**: Uses modern `navigator.clipboard` with fallback to `execCommand` for older browsers
- **Minimal Design**: Icon-only button, no text, no frame - clean and unobtrusive

#### 🔄 Automatic Port Cleanup
- **No More EADDRINUSE**: Server automatically kills any existing process on port 3000 before starting
- **Cross-Platform**: Works on Windows (`taskkill`), Linux (`kill`), and macOS (`kill`)
- **Console Notification**: Shows `⚠️ Killed existing process on port 3000 (PID: XXXX)` when cleanup occurs

### 🐛 Bug Fixes

#### 📜 Scroll Jumping Fix
- **Problem**: When scrolling on phone, the view would jump to bottom after each snapshot update
- **Solution**: Added 3-second scroll lock that respects user scroll position
- **Smart Detection**: Auto-scroll resumes when user scrolls back to bottom or taps scroll-to-bottom button
- **Percentage-Based**: Uses scroll percentage for more accurate position restoration

### 📄 Documentation Updates

- **README.md**: Completely reorganized Quick Start into 4 clear steps with correct order
- **CODE_DOCUMENTATION.md**: Updated Execution Flow section with startup sequence requirements
- **Added Warning**: Clear callout that order matters - Antigravity + chat must be running before server

### 🚀 Startup Sequence (Important!)

> ⚠️ The order of steps matters! Follow this sequence:

1. **Start Antigravity** with `--remote-debugging-port=9000`
2. **Open or start a chat** in Antigravity
3. **Run the server** (`start_ag_phone_connect.bat` or `.sh`)
4. **Connect your phone** using the displayed URL

---

## v0.1.5 - HTTPS & Scroll Sync 🔒
**Release Date:** January 17, 2026

---

### 🎉 Highlights

This release introduces **HTTPS support**, **scroll synchronization**, and several bug fixes to improve the overall experience.

### ✨ New Features

#### 🔒 HTTPS Support
- **Secure connections** with self-signed SSL certificates
- **Hybrid certificate generation**: Tries OpenSSL first (for proper IP SAN support), falls back to Node.js crypto (zero dependencies)
- **Auto-detection**: Server automatically uses HTTPS when certificates are present
- **Web UI button**: "Enable HTTPS" banner for one-click certificate generation
- **Git for Windows support**: Automatically finds OpenSSL bundled with Git

#### 📜 Scroll Sync
- **Bi-directional scrolling**: When you scroll on your phone, the desktop Antigravity scrolls too
- **Virtualized content support**: Triggers snapshot reload after scrolling to capture newly rendered messages
- **Debounced**: 150ms debounce to prevent excessive requests

#### 📄 New Documentation
- **SECURITY.md**: Comprehensive security guide with:
  - Browser warning bypass instructions (Chrome, Safari, Firefox, Edge)
  - Certificate verification commands
  - Security model explanation
  - OpenSSL installation guide

### 🐛 Bug Fixes

#### Message Sending
- **Fixed**: "Error sending: Unknown" popup no longer appears when message is successfully sent
- **Fixed**: Message input now clears immediately after sending (optimistic UI)
- **Changed**: `/send` endpoint now always returns 200 OK

#### CSS Formatting
- **Fixed**: Double-escaped newline in CSS capture that was breaking phone formatting

#### IP Detection
- **Fixed**: Now prioritizes real network IPs (192.168.x.x, 10.x.x.x) over virtual adapters (172.x.x.x from WSL/Docker)
- **Fixed**: Server now displays only one URL instead of multiple confusing options

### 🔌 New API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ssl-status` | GET | Returns HTTPS status and certificate info |
| `/generate-ssl` | POST | Generates SSL certificates via web UI |
| `/remote-scroll` | POST | Syncs phone scroll position to desktop |

### 🔧 Technical Details

#### HTTPS Implementation
- Uses Node.js built-in `https` module
- Certificates stored in `./certs/` (gitignored)
- Server checks for `certs/server.key` and `certs/server.cert` on startup
- WebSocket automatically upgrades to `wss://` when HTTPS is enabled

#### Scroll Sync Implementation
- Uses percentage-based scrolling for cross-device consistency
- Handles Antigravity's virtualized scrolling by:
  1. Scrolling desktop to position
  2. Waiting 300ms for content to render
  3. Capturing fresh snapshot
  4. Sending to phone

---

## v0.1.0 - Initial Release 🎉
**Release Date:** January 17, 2026

---

We are thrilled to announce the **first official release** of **Antigravity Phone Connect**! This tool transforms your mobile device into a real-time wireless viewport for your Antigravity AI coding sessions.

### ✨ Features

#### 🔄 Real-Time Mirroring
- **1-Second Polling**: Near-instant sync keeps your phone's display updated with your desktop session.
- **WebSocket Notifications**: Efficient push updates notify your phone only when content changes.
- **Smart Content Hashing**: Minimizes bandwidth by detecting actual UI changes.

#### 🎮 Remote Control
- **Send Messages**: Compose and send prompts to your AI directly from your phone.
- **Stop Generations**: Halt long-running AI generations with a single tap.
- **Mode Switching**: Toggle between **Fast** and **Planning** modes remotely.
- **Model Selection**: Switch between AI models (Gemini, Claude, GPT) on the fly.

#### 🧠 Thought Expansion
- **Remote Click Relay**: Tap on "Thinking..." or "Thought" blocks on your phone to expand them on your desktop IDE.
- **Full Reasoning Access**: Peek into the AI's internal reasoning process from anywhere in your home.

#### 🔁 Bi-Directional Sync
- **State Synchronization**: Changes made on your desktop (model, mode) are automatically reflected on your phone.
- **Force Refresh**: Manually trigger a full sync with the Refresh button when needed.

#### 🎨 Premium Mobile UI
- **Dark-Themed Design**: Sleek, modern slate-dark interface optimized for mobile viewing.
- **Touch-Optimized**: Large tap targets and responsive layouts for comfortable mobile interaction.
- **Aggressive CSS Inheritance**: VS Code theme-agnostic rendering ensures consistent mobile appearance.

#### 📁 Context Menu Integration
- **Windows**: Right-click any folder and select "Open with Antigravity (Debug)" for instant debugging sessions.
- **Linux (Nautilus/GNOME)**: Native Nautilus script integration for seamless right-click access.
- **macOS**: Step-by-step Quick Action guide for Automator-based integration.

#### 🛠️ Context Menu Management Scripts
- **Install/Remove**: Easy toggle for context menu entries.
- **Backup**: Automatic backup before making registry/script changes.
- **Restart**: One-click Explorer (Windows) or Nautilus (Linux) restart to apply changes.

### 🖥️ Platform Support

| Platform | Launcher Script | Context Menu Script |
|:---------|:----------------|:--------------------|
| **Windows** | `start_ag_phone_connect.bat` | `install_context_menu.bat` |
| **macOS** | `start_ag_phone_connect.sh` | Manual Automator setup |
| **Linux** | `start_ag_phone_connect.sh` | `install_context_menu.sh` |

### 📡 API Endpoints

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/health` | GET | Server status and CDP connection health |
| `/snapshot` | GET | Latest captured HTML/CSS snapshot |
| `/app-state` | GET | Current Mode and Model selection |
| `/send` | POST | Send a message to the AI chat |
| `/stop` | POST | Stop current AI generation |
| `/set-mode` | POST | Switch between Fast/Planning modes |
| `/set-model` | POST | Change the AI model |
| `/remote-click` | POST | Trigger click for Thought expansion |
| `/debug-ui` | GET | Serialized UI tree for debugging |

### 📋 Requirements

- **Node.js**: v16.0.0 or higher
- **Network**: Phone and PC must be on the same Wi-Fi network
- **Antigravity**: Running with `--remote-debugging-port=9000`

### 📦 Dependencies

| Package | Version | Purpose |
|:--------|:--------|:--------|
| `express` | ^4.18.2 | HTTP server for UI and API |
| `ws` | ^8.18.0 | WebSocket for real-time updates |

### 🔒 Security

- **Local Network Only**: By design, the app is constrained to your LAN.
- **No Authentication Required**: Simplified setup for trusted home/office networks.
- **CDP Sandboxing**: DOM snapshots are cloned before capture to prevent interference.

### 🐛 Known Limitations

- **CDP Port Range**: Auto-discovery scans ports 9000-9003.
- **macOS Context Menu**: Requires manual Automator Quick Action setup.
- **Theme Variance**: Some extreme custom Antigravity themes may render differently on mobile.

---

## 📝 Full Changelog

- v0.1.7 - fix: Robust reconnection, app.js syntax, path escaping, enhanced logging
- v0.1.6 - feat: Mobile copy button, auto port cleanup, scroll fix, docs update
- v0.1.5 - feat: HTTPS support, scroll sync, bug fixes, SECURITY.md
- v0.1.4 - feat: add scroll sync and SSL endpoints
- v0.1.3 - docs: update documentation for HTTPS/SSL support
- v0.1.2 - feat: add local SSL certificate generation
- v0.1.1 - docs: expand API endpoint documentation
- v0.1.0 - Initial release with real-time mirroring, remote control, and mobile UI

---

## 🙏 Acknowledgments

Based on the original [Antigravity Shit-Chat](https://github.com/gherghett/Antigravity-Shit-Chat) by **@gherghett**.

---

## 📄 License

Licensed under the [GNU GPL v3](LICENSE).  
Copyright (C) 2026 **Krishna Kanth B** ([@krishnakanthb13](https://github.com/krishnakanthb13))

---

*For detailed documentation, see [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md) and [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md).*
