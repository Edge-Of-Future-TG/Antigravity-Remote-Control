# Security Architecture & Audit Report (v6.0.0)

**Date of Scan:** 2026-11-18  
**Scope:** `Antigravity Remote Control v6.0` (`server.js`, `hub_bridge.js`, `public/`, and `android/`)  
**Standard:** OWASP Top 10 & Android WebView Hardening

## 🟡 1. Secrets Management
**Status: Warning (Configurable via `.env`)**
- **Observation:** `server.js` reads `APP_PASSWORD`, `AUTH_SALT`, and `SESSION_SECRET` from `.env`.
- **Mitigation:** `launcher.py` automatically generates a random 6-digit passcode when `APP_PASSWORD` is unset, and `server.js` prints explicit startup warnings if default development fallbacks (`antigravity` / `antigravity_secret_key_1337`) are active.
- **Recommendation:** Always set strong unique values for `APP_PASSWORD`, `SESSION_SECRET`, and `AUTH_SALT` in `.env` before exposing sessions over public tunnels.

## 🟢 2. Authentication & Tunnel Isolation
**Status: Hardened**
- **Zero-Trust External Access:** Requests carrying proxy headers (`x-forwarded-for`, `x-forwarded-host`, `x-real-ip`) or originating outside RFC-1918 local networks require authentication across **both** HTTP endpoints and WebSocket upgrades.
- **Credential Mechanisms:** Supports `httpOnly` signed cookies (`SameSite=Lax`), Magic QR `?key=` bootstrap links, and `x-ag-key` headers for the native Android client.
- **Local Hub CSRF Protection:** `hub_bridge.js` communicates strictly over loopback (`127.0.0.1`) using the per-process `x-codeium-csrf-token` from `~/.gemini/antigravity/daemon/hub_*.json`.

## 🟢 3. XSS, Prompt Leakage & Injection Prevention
**Status: Hardened**
- **Strict Content Security Policy (CSP):** `public/index.html` enforces `script-src 'self'` with zero inline event handlers (`onclick`), blocking script execution inside rendered snapshots.
- **HTML Escaping & Safe Markdown Rendering:** `hub_bridge.js` HTML-escapes all trajectory text, tool outputs, file diffs, and model metadata prior to rendering, using callback replacers so code blocks never undergo `$` substitution mangling.
- **SDK Prompt Isolation:** `buildSnapshotFromHub` filters out all `CORTEX_STEP_SOURCE_SYSTEM_SDK` steps at ingestion so internal SDK system reminders are never serialized to clients.

## 🟢 4. Android Native WebView Security
**Status: Hardened**
- **Navigation Isolation (`ServerDiscovery.classifyWebViewNavigation`):** Keeps same-origin server URLs and bundled `file:///android_asset/` pages (blocking `..` traversal) inside the WebView, routes external `http`/`https`/`mailto`/`tel` links to Android's system browser via `Intent.ACTION_VIEW`, copies desktop `file:///` paths to clipboard without `FileUriExposedException`, and blocks `javascript:` and `intent:` schemes.
- **Scoped Self-Signed TLS:** `onReceivedSslError` only permits `generate_ssl.js` self-signed certificates when the host matches a verified private LAN / Tailscale IP (`ServerDiscovery.isPrivateLanHost`), cancelling invalid TLS certificates on public tunnel domains.
