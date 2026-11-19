# Antigravity Remote Control v6.0 — Complete A-to-Z Setup & GitHub Guide (English)

> 🇮🇷 **نسخه فارسی این آموزش:** [راهنمای کامل نصب و راه‌اندازی از صفر تا صد (فارسی)](./SETUP_GUIDE_FA.md)

This guide walks you step by step from a fresh PC and Android phone all the way to running locally over Wi-Fi, accessing your session anywhere on mobile data via encrypted tunnels, building or installing the native Android APK, running automated tests, and publishing your own clean repository on GitHub.

---

## Table of Contents
- [A. Overview & Architecture](#a-overview--architecture)
- [B. Prerequisites & Installing Required Tools](#b-prerequisites--installing-required-tools)
- [C. Download, Install Dependencies & Configure `.env`](#c-download-install-dependencies--configure-env)
- [D. Running in Local Wi-Fi Mode (Home / Office)](#d-running-in-local-wi-fi-mode-home--office)
- [E. Running in Global Internet / Web Tunnel Mode (Anywhere on Mobile Data)](#e-running-in-global-internet--web-tunnel-mode-anywhere-on-mobile-data)
- [F. Android App Installation, Features & Building APK from Source](#f-android-app-installation-features--building-apk-from-source)
- [G. Testing & Verification](#g-testing--verification)
- [H. Publishing to Your Own GitHub Repository (Step-by-Step)](#h-publishing-to-your-own-github-repository-step-by-step)
- [I. Troubleshooting & FAQ](#i-troubleshooting--faq)

---

## A. Overview & Architecture

**Antigravity Remote Control v6.0** lets you monitor and drive your **Antigravity 2.33+ Agentic Hub** from any phone browser or the native Android app.

1. **Zero-Flag Hub ConnectRPC Discovery (`hub_bridge.js`)**:
   - Automatically discovers the running Antigravity 2.33+ `language_server` daemon via `~/.gemini/antigravity/daemon/hub_*.json` over loopback (`127.0.0.1`) with its per-process `x-codeium-csrf-token` header.
   - **No `--remote-debugging-port=9000` flag is required** for Antigravity 2.33+.
   - Legacy Chrome DevTools Protocol (CDP on ports `9000–9003`, `9222–9223`, `9229`) remains built in as an automatic fallback.
2. **Dual HTTP + HTTPS Single-Port Multiplexer (`server.js`)**:
   - Listens on a single port (`PORT=3000` by default) and automatically detects TLS vs. plain TCP per incoming socket, serving `http://` + `ws://` and `https://` + `wss://` (when `certs/server.key` + `certs/server.cert` exist).
3. **Zero-Trust Access Model**:
   - **Same Wi-Fi / LAN (`isLocalRequest`)**: Private RFC-1918 requests without reverse-proxy headers are admitted seamlessly for frictionless home access.
   - **Public Tunnel / Internet**: Any request carrying tunnel proxy headers (`x-forwarded-for`, `x-forwarded-host`, `x-real-ip`, `cf-connecting-ip`) or coming from outside private IP ranges **must authenticate** on every HTTP endpoint and WebSocket upgrade using `APP_PASSWORD`, a Magic QR link (`/?key=...`), an `httpOnly` signed cookie (`ag_auth_token`), or `x-ag-key`.
4. **Native Android Client (`android/`) + Mobile Web UI (`public/`)**:
   - Both share the exact same web assets (`public/` is mirrored byte-for-byte into `android/app/src/main/assets/www/`), enhanced on Android with Compose connection discovery, Wi-Fi subnet scanning, native haptics/clipboard/file-upload/voice bridging, external browser link routing, scoped LAN TLS handling, and an offline UI demo.

---

## B. Prerequisites & Installing Required Tools

Install these tools on the PC running Antigravity before starting the server:

### 1. Antigravity 2.33+
- Install and launch **Antigravity** on your PC so the Agentic Hub daemon is running.

### 2. Node.js 18+ LTS (includes `npm`)
Required to run `server.js` and `tests/verify_remote_control.mjs`.
- **Windows (PowerShell / winget):**
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```
  *(Or download the LTS installer from [nodejs.org](https://nodejs.org/).)*
- **macOS (Homebrew):**
  ```bash
  brew install node@20
  ```
- **Ubuntu / Debian:**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **Verify:**
  ```bash
  node --version
  npm --version
  ```

### 3. Python 3.9+ (with `venv` & `pip`)
Required by `launcher.py` for automated tunnel startup, QR code generation, health/payload verification, and dependency setup.
- **Windows:**
  ```powershell
  winget install Python.Python.3.12
  ```
  *(If downloading from [python.org](https://www.python.org/downloads/), make sure **"Add python.exe to PATH"** is checked during installation.)*
- **macOS:**
  ```bash
  brew install python
  ```
- **Ubuntu / Debian:**
  ```bash
  sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip
  ```
- **Verify:**
  ```bash
  python --version   # Windows (use python3 --version on macOS/Linux)
  ```

### 4. Git
- **Windows:** `winget install Git.Git`
- **macOS:** `xcode-select --install` (or `brew install git`)
- **Ubuntu / Debian:** `sudo apt-get install -y git`

### 5. Optional Tunnel Tools (For Global Internet Access)
`launcher.py` automatically creates a `venv/` and installs `requirements.txt` (`pyngrok`, `python-dotenv`, `qrcode`, `pinggy`), which already gives you **Pinggy** out of the box. Install these extras if you want Cloudflare or Serveo:
- **Cloudflare (`cloudflared`):**
  - **Windows:** `winget install Cloudflare.cloudflared` (or place `cloudflared.exe` in the project root folder — it is gitignored)
  - **macOS:** `brew install cloudflared`
  - **Linux (Debian/Ubuntu):** Install the `.deb` package from Cloudflare Downloads or package repo so `cloudflared` is in `PATH`.
- **Serveo (`ssh`):** Uses built-in **OpenSSH Client** (already preinstalled on Windows 10/11, macOS, and Linux).
- **ngrok:** Uses `pyngrok` automatically; simply get a free authtoken from [dashboard.ngrok.com](https://dashboard.ngrok.com).

### 6. Optional: Android Build Toolchain *(Only needed if building the APK yourself)*
If you just want to use the app, download the prebuilt `Antigravity-Remote-Control-v6.0.apk` from **GitHub Releases** and skip this part. To compile from source (`android/`):
- **JDK 17** (`winget install EclipseAdoptium.Temurin.17.JDK` on Windows, `brew install openjdk@17` on macOS)
- **Android Studio** or **Android SDK Command-Line Tools** with Android SDK Platform 36 (`compileSdk = 36`), Build-Tools, and Platform-Tools (`adb`).

---

## C. Download, Install Dependencies & Configure `.env`

### 1. Clone or Download the Repository
```bash
git clone https://github.com/<your-username>/antigravity-remote-control.git
cd antigravity-remote-control
```

### 2. Install Node.js & Python Dependencies
```bash
npm install
```
*(Or use `npm ci` for an exact lockfile install.)*

For Python (`launcher.py` also creates `venv` automatically when launched via the scripts, or you can set it up manually):
```bash
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Create & Configure `.env`
Copy `.env.example` to `.env`:
```bash
# Windows (cmd)
copy .env.example .env

# Windows PowerShell / macOS / Linux
cp .env.example .env
```

Edit `.env` in any text editor and customize your settings:

| Variable | Default / Example | Purpose |
| :--- | :--- | :--- |
| `APP_PASSWORD` | `change-me-strong-password` | **Password for Web / Tunnel login** and `?key=` / `x-ag-key`. Set a strong unique password before starting `--mode web`. If omitted, `launcher.py` generates a temporary random 6-digit passcode on each run. |
| `TUNNEL_PROVIDER` | `cloudflare` | Primary public tunnel provider: `cloudflare`, `pinggy`, `serveo`, or `ngrok`. If the primary provider fails or stalls, `launcher.py` automatically falls back through `provider -> pinggy -> serveo -> localtunnel`. |
| `PORT` | `3000` | Port shared by HTTP/WS and HTTPS/WSS. |
| `HOST_IP` | *(auto-detected)* | Optional override (e.g., `192.168.1.50`) for the LAN IP printed in Local Mode QR codes. Useful if a VPN virtual network adapter takes priority over your real Wi-Fi adapter. |
| `PINGGY_TOKEN` | *(empty)* | Optional persistent Pinggy token from [dashboard.pinggy.io](https://dashboard.pinggy.io). |
| `PINGGY_SERVER` | `a.pinggy.io:443` | Pinggy SSH server endpoint over port `443`. |
| `NGROK_AUTHTOKEN` | *(empty)* | Required only when `TUNNEL_PROVIDER=ngrok`. |
| `CLOUDFLARE_TUNNEL_NAME` | *(empty)* | Optional named Cloudflare Tunnel (`cloudflared tunnel run <name>`). |
| `CLOUDFLARE_TUNNEL_URL` | *(empty)* | Optional custom domain URL for a named Cloudflare Tunnel. |
| `SESSION_SECRET` | *(default dev key)* | Recommended random secret string for signing auth sessions cleanly. |
| `AUTH_SALT` | *(default dev salt)* | Optional salt override (changing `SESSION_SECRET` or `AUTH_SALT` logs out all active sessions). |

> **Security Tip:** Never commit `.env` to Git. `.gitignore` already excludes `.env`, `certs/`, `uploads/*`, logs, and build artifacts.

### 4. Optional: Enable Local Self-Signed HTTPS (`certs/`)
Local Wi-Fi mode works immediately over plain HTTP (`http://192.168.x.x:3000`), which works smoothly for mobile browsers and Android WebView features (including mic/clipboard on `localhost` or HTTPS). If you want HTTPS on your local Wi-Fi too:
```bash
node generate_ssl.js
```
This creates `certs/server.key` and `certs/server.cert`. The next time `server.js` starts, it automatically enables HTTPS/WSS alongside HTTP/WS on port `3000`.

---

## D. Running in Local Wi-Fi Mode (Home / Office)

### Step 1: Open Antigravity
Start **Antigravity 2.33+** normally on your PC (no special CLI flags required).

### Step 2: Allow Port `3000` in Your Firewall (First Time Only)
On **Windows**, allow Node.js / TCP port `3000` on Private networks so your phone on the same Wi-Fi can reach your PC:
- **GUI Method:**
  1. If a Windows Defender Firewall popup appears when `node.exe` starts, check **Private networks** and click **Allow access**.
  2. Or open **Windows Security -> Firewall & network protection -> Allow an app through firewall -> Change settings**, find **Node.js JavaScript Runtime**, and check **Private**.
- **PowerShell Method (Run as Administrator):**
  ```powershell
  New-NetFirewallRule -DisplayName "Antigravity Remote Control (Port 3000)" -Direction Inbound -Protocol TCP -LocalPort 3000 -Profile Private -Action Allow
  ```
- **Linux (`ufw`):** `sudo ufw allow 3000/tcp`

### Step 3: Start the Server in Local Mode
- **Windows:** Double-click `start_ag_phone_connect.bat` (or `shortcuts\Phone Connect (Home).bat`).
- **macOS / Linux:**
  ```bash
  chmod +x start_ag_phone_connect.sh   # first time only
  ./start_ag_phone_connect.sh
  ```
- **Direct Node.js (no QR wrapper):**
  ```bash
  npm start
  ```

### Step 4: Connect from Your Phone
- **Android APK (Recommended):**
  1. Connect your phone to the **same Wi-Fi** as your PC.
  2. Open **Antigravity Remote**. Under **Wi-Fi Auto-Discovery**, tap your PC card (`● Live · Hub v2.33.0`).
  3. *(Or enter `http://<PC_LAN_IP>:3000` manually and tap **Connect to Antigravity Hub**.)*
- **Mobile Browser (Android / iOS):**
  - Scan the QR code printed in the PC terminal or open `http://<PC_LAN_IP>:3000`.

---

## E. Running in Global Internet / Web Tunnel Mode (Anywhere on Mobile Data)

Web Mode exposes your session securely over HTTPS (`wss://`) so you can control Antigravity from mobile data or another network.

### 1. Choose the Best Tunnel Provider for Your Network
- **`TUNNEL_PROVIDER=cloudflare` (Default):**
  - Creates a temporary `https://*.trycloudflare.com` tunnel (no account required).
  - Includes DoH (`dns.google` / `cloudflare-dns.com`) edge lookup, automatic non-VPN LAN interface binding (`--edge-bind-address`), and real payload health verification (`/css/style.css`) so ISP port-`7844` throttling/blocking is caught immediately instead of returning Cloudflare Error `1033`.
  - If Cloudflare cannot deliver full payloads, `launcher.py` **automatically switches** to `pinggy` -> `serveo` -> `localtunnel`.
- **`TUNNEL_PROVIDER=pinggy` (Fastest Behind VPNs / Restrictive ISPs):**
  - Runs strictly over **TCP port `443`** via Python's `pinggy` SDK (`tun.xff = True` for strict Zero-Trust IP isolation and `X-Pinggy-No-Screen` headers handled automatically by the frontend).
  - If your ISP or VPN blocks port `7844`, setting `TUNNEL_PROVIDER=pinggy` in `.env` skips the ~20-second Cloudflare check and connects in ~1–3 seconds!
- **`TUNNEL_PROVIDER=serveo` / `TUNNEL_PROVIDER=ngrok`:**
  - `serveo` tunnels over SSH port `443`; `ngrok` uses your `NGROK_AUTHTOKEN`.

### 2. Launch Web Mode
- **Windows:** Double-click `start_ag_phone_connect_web.bat` (or `shortcuts\Phone Connect (Outside).bat`).
- **macOS / Linux:**
  ```bash
  chmod +x start_ag_phone_connect_web.sh   # first time only
  ./start_ag_phone_connect_web.sh
  ```

### 3. Authenticate Safely on Your Phone
The terminal prints:
- Your public HTTPS URL (e.g., `https://xxxx.trycloudflare.com` or `https://xxxx.run.pinggy-free.link`)
- Your **Access Passcode** (`APP_PASSWORD`)
- A **Magic QR Code** (`https://.../?key=<APP_PASSWORD>`)

Connect by:
- Scanning the **Magic QR Code** with your phone browser (sets the `httpOnly` `ag_auth_token` cookie automatically), OR
- Pasting the public URL or full Magic Link into **Antigravity Remote (Android APK)** — the app exchanges the key automatically, stores it securely for `x-ag-key` API/WebSocket calls, and strips sensitive query strings cleanly.

---

## F. Android App Installation, Features & Building APK from Source

### Option 1: Install the Prebuilt APK
1. Download `Antigravity-Remote-Control-v6.0.apk` from the repository's **GitHub Releases** page on your phone (or transfer it via USB).
2. On Android, open the `.apk` file and grant **"Install unknown apps"** permission for your browser / file manager if prompted.
3. *(Optional)* Copy `Antigravity-Remote-Control-v6.0.apk` into the root of the project folder on your PC — `server.js` automatically detects it and enables the **Install Android APK** button in the mobile web sidebar (`/download/apk`).

### Option 2: Build the Signed Release APK from Source
1. Ensure **JDK 17** (`JAVA_HOME`) and the **Android SDK** (`ANDROID_HOME` or `android/local.properties`) are installed.
2. Create `android/local.properties` *(gitignored)* pointing to your Android SDK:
   ```properties
   # Windows example (escape backslashes and colon):
   sdk.dir=C\:\\Users\\<YourName>\\AppData\\Local\\Android\\Sdk

   # macOS example:
   # sdk.dir=/Users/<YourName>/Library/Android/sdk

   # Linux example:
   # sdk.dir=/home/<YourName>/Android/Sdk
   ```
3. *(Important)* If you edit any files in `public/` (`index.html`, `login.html`, `manifest.json`, `css/style.css`, `js/app.js`), copy them into `android/app/src/main/assets/www/` so both Web and APK stay identical (`npm test` checks byte-for-byte parity).
4. Run Gradle unit tests + build the APK:
   ```bash
   cd android

   # Windows
   .\gradlew.bat testDebugUnitTest assembleRelease

   # macOS / Linux
   ./gradlew testDebugUnitTest assembleRelease
   ```
5. Output APK location:
   `android/app/build/outputs/apk/release/app-release.apk`
6. Optional USB install with ADB:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

### Mobile UI & Android App Feature Tour
- **Connection Hub & Offline Demo:** Auto-discovers servers across your LAN subnet, supports manual LAN/tunnel URLs with Magic `?key=`, and includes **Preview Antigravity 2.33 Mobile UI Offline** for exploring the UI anywhere.
- **3-Way Surface Switcher (`[✦ Antigravity | 🐝 Swarm | </> IDE]`):**
  - **✦ Antigravity:** Live streamed chat, code diff hunks, terminal & file approvals, `ask_question` multi-choice cards, and nested subagent drill-down (`Inspect Live Subagent ->` / `<- Back to Parent`).
  - **🐝 Swarm (`/swarm-ui`):** 5-tab Hive Swarm Board (**Overview** with Pixel-Bee sprites & progress ring, **Shared Board** `#channels`/`@mentions`/`#seq` jump links, **Members** live tool activity, **@Mention SVG Graph + Replay**, **Raw** JSON/JSONL inspector) + Coordinator quick dock.
  - **`</>` Antigravity IDE (`/ide`):** Browse workspace files, inspect/edit code with line numbers, select line ranges into your prompt (`fileLineRange`), review `git status` & diffs, switch desktop Hub workspaces, or open files on PC (`↗ Open on PC`).
- **Model & Quota Controls:** Select any of the 24 Antigravity 2.33 model/effort variants, switch execution modes (`Agent`, `Autonomous`, `Planning`, `Fast`), and view Weekly & 5-Hour quota + context window usage (`/quota`).
- **`/` Actions Catalog:** Tap `/` or type `/` for System actions (`/boost`, `/swarm`, `/btw`, `/plan`, `/goal`, `/compact`, `/teamwork`, etc.), Skills, Workflows, MCP Prompts, and Client Controls (`/find`, `/export`, `/prompts`, `/new`, `/stop`, `/theme`).
- **Quoting & Attachments:** Use `❝ Quote & Reply`, `☷ Quote Parts`, Android's native OS text-selection toolbar (`❝ Quote` / `💬 /btw`), clipboard paste, or `+` file/photo/video/PDF uploads.

---

## G. Testing & Verification

Before pushing changes or releasing a build, run the full verification suites:

### 1. Syntax & Integration Test Suite (Node.js + Headless Chrome UI checks)
```bash
node --check server.js
node --check hub_bridge.js
node --check public/js/app.js
python -m py_compile launcher.py   # or python3 on macOS/Linux
npm test
```
`npm test` (`tests/verify_remote_control.mjs`) executes:
1. Unit & regression checks (Markdown parser, nested lists, models, `CODE_ACTION` diffs, `GENERIC` tools, SDK prompt isolation, and **byte-for-byte `public/` <-> `android/app/src/main/assets/www/` asset parity**).
2. Live HubBridge RPC checks (when Antigravity is running locally).
3. Express HTTP/HTTPS multiplexer, binary uploads, and Zero-Trust `401` tunnel guard tests.
4. Headless Chrome / Chromium mobile viewport (`360x800`) + Android offline preview UI verification (if Chrome/Edge is installed).

### 2. Android Unit Tests
```bash
cd android
# Windows
.\gradlew.bat testDebugUnitTest
# macOS / Linux
./gradlew testDebugUnitTest
```

### 3. Live Health Endpoint Check
While `server.js` is running locally:
```bash
curl http://127.0.0.1:3000/health
```
Look for `"status":"ok"` and `"service":"antigravity-remote-control"`.

---

## H. Publishing to Your Own GitHub Repository (Step-by-Step)

This folder is pre-cleaned for public GitHub hosting (`.gitignore` excludes `.env`, `certs/`, `node_modules/`, `venv/`, `uploads/*`, `logs`, `cloudflared.exe`, `android/local.properties`, Android build outputs, and `*.apk`).

### 1. Create a New Empty Repository on GitHub
1. Log in to [github.com](https://github.com) and click **+ -> New repository**.
2. Name it (e.g., `antigravity-remote-control`), choose **Public** or **Private**, and leave **"Add a README / .gitignore / license"** **unchecked** (they are already in this folder).
3. Copy your repository's HTTPS or SSH URL (`https://github.com/<your-username>/<your-repo>.git`).

### 2. Initialize Git, Inspect Staged Files & Push
Open a terminal inside the clean publish folder:

```bash
git init -b main
git add .
git status
```

> **Safety Check:** Before committing, scan the `git status` list carefully. Make sure **NONE** of these appear: `.env`, `certs/`, `uploads/anything-other-than-.gitkeep`, `node_modules/`, `venv/`, `*.log`, `android/local.properties`, or `*.apk`.

Then commit and push:

```bash
git commit -m "feat: Antigravity Remote Control v6.0 (Hub 2.33, Swarm UI, IDE & Android APK)"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

*(Recommended: verify your local Git identity first with `git config user.name` and `git config user.email` so your commit metadata shows your public GitHub identity.)*

### 3. Attach `Antigravity-Remote-Control-v6.0.apk` as a GitHub Release
Keep `.apk` binaries out of Git history and attach them to **Releases** instead:
1. Open your repository on GitHub -> **Releases** -> **Draft a new release**.
2. Set Tag version: `v6.0.0` (target: `main`), Title: `Antigravity Remote Control v6.0.0`.
3. Drag and drop `Antigravity-Remote-Control-v6.0.apk` into the binaries box.
4. Click **Publish release**.

*(Tip: Do NOT change or remove the upstream `LICENSE` (GNU GPL v3) or upstream attributions in `README.md` and `RELEASE_NOTES.md` to stay compliant with GPLv3.)*

---

## I. Troubleshooting & FAQ

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| **`Error 1033` / Cloudflare stalls after connecting** | ISP or VPN (such as fake-IP VPN DNS / DPI filters) blocks or throttles Cloudflare port `7844`. | Set `TUNNEL_PROVIDER=pinggy` in `.env` so traffic uses SSH over TCP port `443`, or let `launcher.py` auto-switch from Cloudflare to Pinggy/Serveo. |
| **Pinggy shows an interstitial landing page on API calls** | Pinggy free tier banner on unheadered browser/API calls. | Already handled automatically: `public/js/app.js` sends `X-Pinggy-No-Screen: 1`, and users should open the Magic QR `/?key=...` URL or enter `APP_PASSWORD`. |
| **Antigravity Hub not detected (`hubConnected: false`)** | Antigravity 2.33+ isn't open yet, or running an older CDP-only build. | Open Antigravity on your PC (wait 3–5s for daemon registration), or launch legacy builds with `shortcuts\Launch Antigravity.bat` (`--remote-debugging-port=9000`). |
| **Phone on same Wi-Fi cannot connect (`ERR_CONNECTION_TIMED_OUT`)** | Windows Firewall blocking TCP `3000`, wrong Wi-Fi network (e.g., Guest Wi-Fi / AP isolation), or a VPN virtual adapter IP was picked. | Allow Node.js / TCP `3000` on Private networks in Windows Firewall, disable AP isolation if enabled, and optionally set `HOST_IP=<your_real_WiFi_IPv4>` in `.env`. |
| **Port `3000` already in use (`EADDRINUSE`)** | An earlier `node server.js` instance is still running. | Close old terminal windows, run `start_ag_phone_connect_web.bat` (auto-cleans port `3000`), or set `PORT=3001` in `.env`. |
| **Garbled QR code blocks (`???`) in Windows CMD** | Windows console defaults to legacy code page instead of UTF-8. | Use the updated `start_ag_phone_connect.bat` / `start_ag_phone_connect_web.bat` (both set `chcp 65001 >nul`), or run inside Windows Terminal / PowerShell. |
| **`npm test` fails with Android asset parity error** | `public/` was edited without syncing to Android WebView assets. | Copy updated files from `public/` to `android/app/src/main/assets/www/` so both copies match byte-for-byte. |
| **Android APK won't install ("App not installed as package conflicts")** | An APK signed with a different debug keystore is already installed on the phone. | Uninstall the old app first (`adb uninstall com.antigravity.remotecontrol` or uninstall from phone Settings), then install the new `.apk`. |
| **Android build fails looking for JDK or SDK** | `JAVA_HOME` is not JDK 17, or `android/local.properties` is missing `sdk.dir`. | Install JDK 17, set `JAVA_HOME`, and create `android/local.properties` with your local `sdk.dir=...` path. |
