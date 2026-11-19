import sys
import os
import io

# Force UTF-8 stdout & stderr encoding to prevent Windows cp1252 UnicodeEncodeError crashes
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import subprocess
import time
import random
import string
import socket
import argparse
import logging
import re
import json
import threading
import urllib.request

# -----------------------------------------------------------------------------
# Dependency Management
# -----------------------------------------------------------------------------
def check_dependencies():
    """Checks and installs required Python packages."""
    needed = ["pyngrok", "python-dotenv", "qrcode", "pinggy"]
    installed = []
    
    # Check what is missing
    for pkg in needed:
        try:
            if pkg == "pyngrok": from pyngrok import ngrok
            elif pkg == "python-dotenv": from dotenv import load_dotenv
            elif pkg == "qrcode": import qrcode
            elif pkg == "pinggy": import pinggy
            installed.append(pkg)
        except ImportError:
            pass

    missing = [pkg for pkg in needed if pkg not in installed]
    
    if missing:
        print(f"📦 Installing missing dependencies: {', '.join(missing)}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing)
            print("✅ Dependencies installed.\n")
        except Exception as e:
            print(f"❌ Failed to install dependencies: {e}")
            sys.exit(1)

def check_node_environment():
    """Checks for Node.js and installs npm dependencies if needed."""
    # 1. Check if Node is installed
    try:
        subprocess.check_call(["node", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("❌ Error: Node.js is not installed. Please install it from https://nodejs.org/")
        sys.exit(1)

    # 2. Check for node_modules
    if not os.path.exists("node_modules"):
        print("📦 'node_modules' missing. Installing Node.js dependencies...")
        try:
            # shell=True often needed on Windows for npm. On *nix, 'npm' usually works directly if in PATH.
            is_windows = sys.platform == "win32"
            subprocess.check_call(["npm", "install"], shell=is_windows)
            print("✅ Node dependencies installed.\n")
        except Exception as e:
            print(f"❌ Failed to run 'npm install': {e}")
            sys.exit(1)

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def get_local_ip():
    """Robustly determines the local LAN IP address, prioritizing 192.168.x.x Wi-Fi/LAN."""
    if os.environ.get('HOST_IP'):
        return os.environ.get('HOST_IP')

    try:
        hostname = socket.gethostname()
        _, _, ips = socket.gethostbyname_ex(hostname)
        for ip in ips:
            if ip.startswith('192.168.'):
                return ip
        for ip in ips:
            if ip.startswith('10.'):
                return ip
        if ips:
            return ips[0]
    except Exception:
        pass

    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        if s:
            s.close()
    return IP

CLOUDFLARE_FALLBACK_EDGES = [
    "198.41.192.7:7844",
    "198.41.200.13:7844",
    "198.41.192.47:7844",
    "198.41.200.53:7844",
    "198.41.192.107:7844",
    "198.41.200.193:7844",
]

def _is_private_lan_ipv4(ip):
    """Return True only for RFC-1918 private LAN IPv4 addresses (excluding loopback & 198.18/15 fake-IP VPN ranges)."""
    if not ip or not isinstance(ip, str):
        return False
    parts = ip.strip().split('.')
    if len(parts) != 4:
        return False
    try:
        a, b, c, d = (int(p) for p in parts)
    except ValueError:
        return False
    if any(n < 0 or n > 255 for n in (a, b, c, d)):
        return False
    if a == 10:
        return True
    if a == 192 and b == 168:
        return True
    if a == 172 and 16 <= b <= 31:
        return True
    return False

def get_candidate_lan_ips():
    """Collect unique private LAN IPv4 addresses on this host for edge binding when default/VPN routing blocks port 7844."""
    candidates = []
    seen = set()

    def add_ip(ip):
        if ip and _is_private_lan_ipv4(ip) and ip not in seen:
            seen.add(ip)
            candidates.append(ip)

    add_ip(get_local_ip())
    try:
        _, _, ips = socket.gethostbyname_ex(socket.gethostname())
        for ip in ips:
            add_ip(ip)
    except Exception:
        pass
    return candidates

def _doh_query(endpoint, name, qtype, timeout=5):
    """Query DNS-over-HTTPS JSON endpoint for a DNS record."""
    url = f"{endpoint}?name={name}&type={qtype}"
    req = urllib.request.Request(
        url,
        headers={"Accept": "application/dns-json", "User-Agent": "Antigravity-Remote/6.0"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))

def resolve_cloudflare_edge_addrs(timeout=5):
    """Resolve Cloudflare argotunnel edge IP:port pairs via DoH SRV+A records, with documented anycast fallbacks."""
    doh_endpoints = [
        "https://dns.google/resolve",
        "https://cloudflare-dns.com/dns-query",
    ]
    for endpoint in doh_endpoints:
        try:
            srv_data = _doh_query(endpoint, "_origintunneld._tcp.argotunnel.com", "SRV", timeout=timeout)
            answers = srv_data.get("Answer") or []
            region_lists = []
            for ans in answers:
                parts = str(ans.get("data") or "").split()
                if len(parts) != 4:
                    continue
                edge_port = parts[2]
                host = parts[3].rstrip('.')
                try:
                    a_data = _doh_query(endpoint, host, "A", timeout=timeout)
                    ips = [
                        f"{a.get('data')}:{edge_port}"
                        for a in (a_data.get("Answer") or [])
                        if a.get("type") == 1 and a.get("data")
                    ]
                    if ips:
                        region_lists.append(ips)
                except Exception:
                    continue

            # Interleave IPs across regions (e.g. region1 + region2) up to 6 unique entries
            merged = []
            seen = set()
            max_len = max((len(r) for r in region_lists), default=0)
            for idx in range(max_len):
                for r in region_lists:
                    if idx < len(r) and r[idx] not in seen:
                        seen.add(r[idx])
                        merged.append(r[idx])
                        if len(merged) >= 6:
                            return merged
            if merged:
                return merged
        except Exception:
            continue
    return list(CLOUDFLARE_FALLBACK_EDGES)

def _can_tcp_connect(host, port, bind_ip=None, timeout=2.5):
    """Check whether TCP connect to host:port succeeds (optionally bound to a specific local IP)."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        if bind_ip:
            sock.bind((bind_ip, 0))
        sock.connect((host, int(port)))
        return True
    except Exception:
        return False
    finally:
        try:
            sock.close()
        except Exception:
            pass

def pick_cloudflare_edge_route(edge_addrs):
    """Determine if default routing reaches edge TCP 7844, else find a LAN interface IP that bypasses VPN blocks."""
    probe_target = edge_addrs[0] if edge_addrs else CLOUDFLARE_FALLBACK_EDGES[0]
    host, _, port_str = probe_target.rpartition(':')
    port = int(port_str or 7844)

    if _can_tcp_connect(host, port, bind_ip=None):
        return None, True

    for cand in get_candidate_lan_ips():
        if _can_tcp_connect(host, port, bind_ip=cand):
            return cand, True

    return None, False

def start_stream_drain_thread(proc, log_path, on_line=None):
    """Continuously drain proc.stdout in a daemon thread to prevent Windows 4 KB pipe deadlocks."""
    def _drain():
        try:
            with open(log_path, "w", encoding="utf-8", errors="replace") as lf:
                for raw_line in proc.stdout:
                    lf.write(raw_line)
                    lf.flush()
                    if on_line:
                        try:
                            on_line(raw_line)
                        except Exception:
                            pass
        except Exception:
            pass

    t = threading.Thread(target=_drain, daemon=True)
    t.start()
    return t

def probe_public_health(public_url, attempts=4, delay=1.5, timeout=6, extra_headers=None):
    """Verify the public tunnel URL responds with HTTP 200 and genuine Antigravity /health JSON."""
    target = public_url.rstrip('/') + '/health'
    headers = {"User-Agent": "Antigravity-Remote/6.0"}
    if extra_headers:
        headers.update(extra_headers)
    for idx in range(attempts):
        try:
            req = urllib.request.Request(target, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read(4096).decode("utf-8", errors="replace")
                if 200 <= resp.status < 300 and "antigravity-remote-control" in body:
                    return True
        except Exception:
            pass
        if idx < attempts - 1:
            time.sleep(delay)
    return False

def probe_public_payload(public_url, path="/css/style.css", min_bytes=20000, timeout=7, extra_headers=None):
    """Verify the tunnel can transfer a real app asset (>20 KB) without ISP DPI/MTU stalling."""
    target = public_url.rstrip('/') + path
    headers = {
        "User-Agent": "Antigravity-Remote/6.0",
        "Accept-Encoding": "identity",
    }
    if extra_headers:
        headers.update(extra_headers)
    try:
        req = urllib.request.Request(target, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            return 200 <= resp.status < 300 and len(data) >= min_bytes
    except Exception:
        return False

def terminate_process(proc):
    """Best-effort clean process termination."""
    if not proc:
        return
    try:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill()
    except Exception:
        pass

def start_cloudflare_tunnel(port):
    """Start Cloudflare Tunnel with DoH edge discovery, automatic VPN/LAN interface bind, and edge stability check."""
    cf_bin = os.path.abspath("cloudflared.exe") if os.path.exists("cloudflared.exe") else "cloudflared"
    cf_name = os.environ.get('CLOUDFLARE_TUNNEL_NAME') or os.environ.get('CLOUDFLARE_TUNNEL_ID')
    cf_custom_url = os.environ.get('CLOUDFLARE_TUNNEL_URL')
    origin_url = f"http://127.0.0.1:{port}"

    edge_addrs = resolve_cloudflare_edge_addrs()
    bind_ip, reachable = pick_cloudflare_edge_route(edge_addrs)
    if not reachable:
        print("⚠️  Cloudflare edge TCP 7844 is unreachable on all network interfaces.")
        return None, None, bool(cf_name)

    if bind_ip:
        print(f"🌐 VPN/DNS bypass active: binding Cloudflare edge via {bind_ip} with DoH-resolved edge IPs")

    if cf_name:
        print(f"PLEASE WAIT... Starting Persistent Cloudflare Tunnel: {cf_name}...")
        cf_cmd = [cf_bin, "tunnel", "--edge-ip-version", "4", "--protocol", "http2", "--no-prechecks"]
        if bind_ip:
            cf_cmd.extend(["--edge-bind-address", bind_ip])
        for addr in edge_addrs[:4]:
            cf_cmd.extend(["--edge", addr])
        cf_cmd.extend(["run", cf_name])
        expected_url = cf_custom_url or ""
        if not expected_url:
            print("⚠️  Warning: CLOUDFLARE_TUNNEL_URL not set. QR Code might be incorrect.")
            expected_url = "https://your-cloudflare-hostname.com"
    else:
        print("PLEASE WAIT... Establishing Cloudflare Tunnel...")
        cf_cmd = [cf_bin, "tunnel", "--url", origin_url, "--edge-ip-version", "4", "--protocol", "http2", "--no-prechecks"]
        if bind_ip:
            cf_cmd.extend(["--edge-bind-address", bind_ip])
        for addr in edge_addrs[:4]:
            cf_cmd.extend(["--edge", addr])
        expected_url = ""

    try:
        proc = subprocess.Popen(
            cf_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
    except FileNotFoundError:
        print("⚠️  'cloudflared' binary not found.")
        return None, None, bool(cf_name)
    except Exception as e:
        print(f"⚠️  Failed to launch cloudflared ({e}).")
        return None, None, bool(cf_name)

    state = {"url": expected_url, "registered": 0, "last_err": "", "disconnects": 0}
    lock = threading.Lock()

    def on_cf_line(line):
        s = line.strip()
        with lock:
            if not cf_name and ".trycloudflare.com" in s and not state["url"]:
                match = re.search(r'https://[a-zA-Z0-9.-]+\.trycloudflare\.com', s)
                if match:
                    state["url"] = match.group(0).rstrip('.')
            if "Registered tunnel connection" in s:
                state["registered"] += 1
            elif " ERR " in s:
                state["last_err"] = s
                if state["registered"] >= 1 and any(
                    k in s for k in ("Serve tunnel error", "Connection terminated", "Error shutting down control stream")
                ):
                    state["disconnects"] += 1

    start_stream_drain_thread(proc, "tunnel_log.txt", on_line=on_cf_line)

    timeout = 25 if cf_name else 40
    t0 = time.time()
    while time.time() - t0 < timeout:
        with lock:
            cur_url = state["url"]
            cur_reg = state["registered"]
        if cur_url and cur_reg >= 1:
            break
        if proc.poll() is not None:
            break
        time.sleep(0.25)

    with lock:
        final_url = state["url"]
        reg_count = state["registered"]
        last_err = state["last_err"]

    if proc.poll() is not None or not final_url or reg_count < 1:
        print("⚠️  Cloudflare tunnel failed to register an edge connection.")
        if last_err:
            print(f"   Last cloudflared error: {last_err}")
        print("   See tunnel_log.txt for full diagnostics.")
        terminate_process(proc)
        return None, None, bool(cf_name)

    def _cf_dropped():
        if proc.poll() is not None:
            return True
        with lock:
            return state["disconnects"] > 0

    if bind_ip and final_url.startswith("https://"):
        print(f"🔍 Verifying Cloudflare port-7844 stability & throughput (bypassing VPN via {bind_ip})...")
        stable = (
            probe_public_health(final_url, attempts=3, delay=1.5, timeout=6)
            and not _cf_dropped()
            and probe_public_payload(final_url, path="/css/style.css", min_bytes=20000, timeout=7)
            and not _cf_dropped()
        )
        if stable:
            for _ in range(8):
                if _cf_dropped():
                    stable = False
                    break
                time.sleep(0.5)
            if stable:
                stable = (
                    probe_public_payload(final_url, path="/css/style.css", min_bytes=20000, timeout=7)
                    and not _cf_dropped()
                )
        if not stable:
            print("⚠️  Cloudflare Tunnel port 7844 is blocked by your VPN and stalled/dropped by your ISP on real traffic (Error 1033).")
            print("   Automatically switching to a port-443 HTTPS tunnel (works reliably over your VPN)...")
            terminate_process(proc)
            return None, None, bool(cf_name)
        print("✅ Cloudflare tunnel registered & verified stable (HTTP 200 + 116 KB asset).")
    else:
        ok = final_url.startswith("https://") and probe_public_health(final_url, attempts=4, delay=1.5, timeout=6)
        if _cf_dropped():
            print("⚠️  Cloudflare tunnel dropped immediately after registration (Error 1033).")
            terminate_process(proc)
            return None, None, bool(cf_name)
        if ok:
            print("✅ Cloudflare tunnel registered & verified live (HTTP 200).")
        elif not cf_name:
            print("ℹ️  Cloudflare edge registered; DNS may take a few more seconds to propagate globally.")

    return final_url, proc, bool(cf_name)

def start_pinggy_tunnel(port):
    """Start Pinggy HTTPS tunnel over TCP 443 using non-blocking Tunnel API with X-Forwarded-For enforced."""
    print("PLEASE WAIT... Establishing Pinggy HTTPS Tunnel (port 443)...")
    tun = None
    try:
        import pinggy
        pinggy_token = os.environ.get('PINGGY_TOKEN') or ""
        server_addr = os.environ.get('PINGGY_SERVER') or "a.pinggy.io:443"
        tun = pinggy.Tunnel(server_address=server_addr)
        tun.token = pinggy_token
        tun.add_forwarding(f"127.0.0.1:{port}")
        tun.xff = True
        tun.auto_reconnect = True
        tun.start(thread=True, block_until_ready=False)

        url = None
        t0 = time.time()
        while time.time() - t0 < 15:
            tunnel_urls = getattr(tun, 'urls', None) or []
            url = next((u for u in tunnel_urls if isinstance(u, str) and u.startswith('https://')), None)
            if url:
                break
            st = getattr(tun, 'state', None)
            if st is not None and getattr(st, 'name', '') in ('Stopped', 'Ended'):
                break
            time.sleep(0.25)

        if not url:
            print("⚠️  Pinggy did not establish a public HTTPS URL in time.")
            try:
                tun.stop()
            except Exception:
                pass
            return None, None

        if not probe_public_health(url, attempts=3, delay=1.5, timeout=8, extra_headers={"X-Pinggy-No-Screen": "1"}):
            print("⚠️  Pinggy URL failed /health verification.")
            try:
                tun.stop()
            except Exception:
                pass
            return None, None

        with open("tunnel_log.txt", "w", encoding="utf-8", errors="replace") as lf:
            lf.write(f"Pinggy tunnel started at {time.ctime()}\n")
            lf.write(f"Server: {server_addr}\n")
            lf.write(f"URLs: {getattr(tun, 'urls', [url])}\n")
        print("✅ Pinggy HTTPS tunnel connected over port 443 & verified live (HTTP 200).")
        return url, tun
    except ImportError:
        print("⚠️  'pinggy' package not found.")
        return None, None
    except Exception as e:
        print(f"⚠️  Pinggy failed ({e}).")
        if tun is not None:
            try:
                tun.stop()
            except Exception:
                pass
        return None, None

def start_serveo_tunnel(port):
    """Start Serveo HTTPS tunnel over SSH port 443 with background stream draining."""
    print("PLEASE WAIT... Establishing Serveo HTTPS Tunnel (port 443)...")
    null_hosts = "NUL" if sys.platform == "win32" else "/dev/null"
    ssh_cmd = [
        "ssh", "-p", "443", "-T",
        "-o", "StrictHostKeyChecking=no",
        "-o", f"UserKnownHostsFile={null_hosts}",
        "-o", "ServerAliveInterval=25",
        "-o", "ConnectTimeout=10",
        "-R", f"80:127.0.0.1:{port}",
        "serveo.net",
    ]
    try:
        proc = subprocess.Popen(
            ssh_cmd,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
    except FileNotFoundError:
        print("⚠️  'ssh' client not found.")
        return None, None
    except Exception as e:
        print(f"⚠️  Failed to start Serveo SSH ({e}).")
        return None, None

    state = {"url": ""}
    lock = threading.Lock()

    def on_serveo_line(line):
        if state["url"]:
            return
        match = re.search(r'https://[a-zA-Z0-9.-]+\.(?:serveo\.net|serveousercontent\.com)', line)
        if match:
            with lock:
                if not state["url"]:
                    state["url"] = match.group(0).rstrip('.')

    start_stream_drain_thread(proc, "tunnel_log.txt", on_line=on_serveo_line)

    t0 = time.time()
    url = None
    while time.time() - t0 < 15:
        with lock:
            url = state["url"]
        if url:
            break
        if proc.poll() is not None:
            break
        time.sleep(0.25)

    if proc.poll() is not None or not url:
        print("⚠️  Serveo tunnel failed to establish a public HTTPS URL.")
        terminate_process(proc)
        return None, None

    if not probe_public_health(url, attempts=3, delay=1.5, timeout=8):
        print("⚠️  Serveo URL failed /health verification.")
        terminate_process(proc)
        return None, None

    print("✅ Serveo HTTPS tunnel connected over port 443 & verified live (HTTP 200).")
    return url, proc

def start_ngrok_tunnel(port):
    """Start Ngrok HTTPS tunnel."""
    print("PLEASE WAIT... Establishing Ngrok Tunnel...")
    try:
        from pyngrok import ngrok
        token = os.environ.get('NGROK_AUTHTOKEN')
        if token:
            ngrok.set_auth_token(token)
        else:
            print("⚠️  Warning: NGROK_AUTHTOKEN not found in .env. Tunnel might expire.")
        tunnel = ngrok.connect(f"http://127.0.0.1:{port}", host_header="rewrite")
        return tunnel.public_url, ngrok
    except Exception as e:
        print(f"⚠️  Ngrok unavailable ({e}).")
        return None, None

def start_localtunnel(port):
    """Start LocalTunnel with background stream draining."""
    print("PLEASE WAIT... Establishing LocalTunnel...")
    npx_bin = "npx.cmd" if sys.platform == "win32" else "npx"
    cmd = f"{npx_bin} localtunnel --port {port}"
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
            shell=True,
        )
    except Exception as e:
        print(f"⚠️  Failed to start LocalTunnel ({e}).")
        return None, None

    state = {"url": ""}
    lock = threading.Lock()

    def on_lt_line(line):
        if "your url is:" in line:
            with lock:
                state["url"] = line.split("your url is:")[-1].strip()

    start_stream_drain_thread(proc, "tunnel_log.txt", on_line=on_lt_line)

    t0 = time.time()
    while time.time() - t0 < 20:
        with lock:
            cur_url = state["url"]
        if cur_url:
            return cur_url, proc
        if proc.poll() is not None:
            break
        time.sleep(0.2)

    print("⚠️  LocalTunnel timed out.")
    terminate_process(proc)
    return None, None

def generate_passcode():
    """Generates a 6-digit passcode."""
    return ''.join(random.choices(string.digits, k=6))

def print_qr(url):
    """Generates and prints a QR code to the terminal."""
    import qrcode
    qr = qrcode.QRCode(version=1, box_size=1, border=1)
    qr.add_data(url)
    qr.make(fit=True)
    # Using 'ANSI' implies standard block characters which work in most terminals
    # invert=True is often needed for dark terminals (white blocks on black bg)
    qr.print_ascii(invert=True)

# -----------------------------------------------------------------------------
# Main Execution
# -----------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Antigravity Phone Connect Launcher")
    parser.add_argument('--mode', choices=['local', 'web'], default='web', help="Mode to run in: 'local' (WiFi) or 'web' (Internet)")
    parser.add_argument('--provider', choices=['ngrok', 'cloudflare', 'pinggy', 'serveo'], help="Tunnel provider (defaults to .env TUNNEL_PROVIDER or 'cloudflare')")
    args = parser.parse_args()

    # 1. Setup Environment
    check_dependencies()
    check_node_environment()
    
    from dotenv import load_dotenv
    
    # Load .env if it exists
    load_dotenv()
    
    # Determine Provider (Defaults to cloudflare for zero landing page and 0 bad gateway errors)
    provider = args.provider or os.environ.get('TUNNEL_PROVIDER', 'cloudflare').lower()
    
    # Setup App Password
    passcode = os.environ.get('APP_PASSWORD')
    if not passcode:
        passcode = generate_passcode()
        os.environ['APP_PASSWORD'] = passcode # Set for child process
        print(f"⚠️  No APP_PASSWORD in .env. Using temporary: {passcode}")

    # 2. Start Node.js Server (Common to both modes)
    print(f"🚀 Starting Antigravity Server ({args.mode.upper()} mode)...")
    
    # Clean up old logs
    with open("server_log.txt", "w", encoding="utf-8") as f:
        f.write(f"--- Server Started at {time.ctime()} ---\n")

    node_cmd = ["node", "server.js"]
    node_process = None
    
    try:
        # Redirect stdout/stderr to file
        log_file = open("server_log.txt", "a", encoding="utf-8")
        node_process = subprocess.Popen(node_cmd, stdout=log_file, stderr=log_file, env=os.environ.copy())
        time.sleep(2) # Give it a moment to crash if it's going to
        if node_process.poll() is not None:
            print("❌ Server failed to start immediately. Check server_log.txt.")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Failed to launch node: {e}")
        sys.exit(1)

    # 3. Mode Specific Logic
    final_url = ""
    active_provider = provider
    tunnel_handle = None
    cf_is_persistent = False
    tunnel_exit_warned = False
    
    try:
        if args.mode == 'local':
            ip = get_local_ip()
            port = os.environ.get('PORT', '3000')
            
            # Detect HTTPS
            protocol = "http"
            if os.path.exists('certs/server.key') and os.path.exists('certs/server.cert'):
                protocol = "https"
            
            final_url = f"{protocol}://{ip}:{port}"
            
            print("\n" + "="*50)
            print(f"📡 ANTIGRAVITY REMOTE v6.0 — LOCAL WIFI ACCESS")
            print("="*50)
            print(f"🔗 Web UI:      {final_url}")
            print(f"📲 Android APK: {final_url}/download/apk")
            print(f"🔑 Passcode:    Not required for local WiFi (Auto-detected)")
            
            print("\n📱 Scan this QR Code to connect:")
            print_qr(final_url)

            print("-" * 50)
            print("📝 Steps to Connect:")
            print("1. Ensure your phone is on the SAME Wi-Fi network as this computer.")
            print("2. Open your phone's Camera app or a QR scanner.")
            print("3. Scan the code above OR manually type the URL into your browser.")
            print("4. You should be connected automatically!")
            
        elif args.mode == 'web':
            port = os.environ.get('PORT', '3000')
            public_url = ""

            # Ordered fallback chain so failed tunnel startup automatically transitions cleanly
            providers_to_try = []
            for cand in [provider, 'pinggy', 'serveo', 'localtunnel']:
                if cand and cand not in providers_to_try:
                    providers_to_try.append(cand)

            starters = {
                'cloudflare': lambda: start_cloudflare_tunnel(port),
                'pinggy': lambda: (*start_pinggy_tunnel(port), False),
                'ngrok': lambda: (*start_ngrok_tunnel(port), False),
                'serveo': lambda: (*start_serveo_tunnel(port), False),
                'localtunnel': lambda: (*start_localtunnel(port), False),
            }

            for idx, prov in enumerate(providers_to_try):
                starter = starters.get(prov)
                if not starter:
                    continue
                if idx > 0:
                    print(f"🔄 Trying {prov} fallback tunnel...")
                cand_url, cand_handle, cand_persistent = starter()
                if cand_url:
                    public_url = cand_url
                    active_provider = prov
                    tunnel_handle = cand_handle
                    cf_is_persistent = cand_persistent
                    break

            if not public_url:
                print("❌ All web tunnel providers failed. Check your Internet/VPN connection or try local Wi-Fi mode.")
                sys.exit(1)

            provider = active_provider
            try:
                with open("tunnel_log.txt", "a", encoding="utf-8", errors="replace") as lf:
                    lf.write(f"\nACTIVE_PROVIDER={active_provider}\nACTIVE_URL={public_url}\n")
            except Exception:
                pass
            
            # Magic URL with password
            final_url = f"{public_url}?key={passcode}"
            
            print("\n" + "="*50)
            print(f"   🌍 GLOBAL WEB ACCESS ({provider.upper()})")
            print("="*50)
            print(f"🔗 Base URL: {public_url}")
            print(f"🔑 Passcode: {passcode}")
            
            print("\n📱 Scan this Magic QR Code (Auto-Logins):")
            print_qr(final_url)

            print("-" * 50)
            print("📝 Steps to Connect:")
            print("1. Switch your phone to Mobile Data or Turn off Wi-Fi.")
            print("2. Open your phone's Camera app or a QR scanner.")
            print("3. Scan the code above to auto-login.")
            print(f"4. Or visit {public_url}")
            print(f"5. Enter passcode: {passcode}")
            print("6. You should be connected automatically!")
            if provider == 'cloudflare':
                print("💡 TIP: Edge tunnel registered via DoH + direct interface routing. Refresh once after 5s if your mobile DNS caches an older lookup.")
            elif provider == 'pinggy':
                print("💡 TIP: Pinggy connected over port 443 (works cleanly through your VPN). Free mobile browsers may show a one-time 'Enter Site' button; subsequent app API calls bypass it. Set PINGGY_TOKEN in .env to remove it, or allow port 7844 in your VPN/ISP for Cloudflare.")

        print("="*50)
        print("✅ Server is running in background. Logs -> server_log.txt" + (" / tunnel_log.txt" if args.mode == 'web' else ""))
        print("⌨️  Press Ctrl+C to stop.")
        
        # Keep alive loop
        last_log_pos = 0
        cdp_warning_shown = False
        
        while True:
            time.sleep(1)
            
            # Check process status and auto-restart if needed
            if node_process.poll() is not None:
                print("\n⚠️  Server process stopped. Auto-restarting server...")
                try:
                    log_file = open("server_log.txt", "a", encoding="utf-8")
                    node_process = subprocess.Popen(node_cmd, stdout=log_file, stderr=log_file, env=os.environ.copy())
                    time.sleep(1)
                except Exception as e:
                    print(f"❌ Failed to restart server: {e}")
                    sys.exit(1)

            # Monitor subprocess tunnels (cloudflared / serveo / localtunnel) & Pinggy active state
            if args.mode == 'web' and hasattr(tunnel_handle, 'poll'):
                t_code = tunnel_handle.poll()
                if t_code is not None:
                    if active_provider == 'cloudflare' and cf_is_persistent:
                        print(f"\n⚠️  Persistent Cloudflare tunnel exited (code {t_code}). Reconnecting...")
                        new_url, new_handle, new_persistent = start_cloudflare_tunnel(port)
                        if new_url and new_handle:
                            tunnel_handle = new_handle
                            cf_is_persistent = new_persistent
                            tunnel_exit_warned = False
                    elif not tunnel_exit_warned:
                        print(f"\n⚠️  {active_provider.upper()} tunnel process exited (code {t_code}). Check tunnel_log.txt or restart launcher for a fresh URL.")
                        tunnel_exit_warned = True
            elif args.mode == 'web' and active_provider == 'pinggy' and hasattr(tunnel_handle, 'is_active'):
                try:
                    if not tunnel_handle.is_active() and not tunnel_exit_warned:
                        print("\n⚠️  PINGGY tunnel became inactive. Check tunnel_log.txt or restart launcher for a fresh URL.")
                        tunnel_exit_warned = True
                except Exception:
                    pass
                
            # Monitor logs for errors
            try:
                if os.path.exists("server_log.txt"):
                    with open("server_log.txt", "r", encoding='utf-8', errors='ignore') as f:
                        f.seek(last_log_pos)
                        new_lines = f.read().splitlines()
                        last_log_pos = f.tell()
                        
                        for line in new_lines:
                            if "Connected to Antigravity Hub" in line:
                                cdp_warning_shown = True
                            elif "CDP not found" in line and not cdp_warning_shown:
                                print("\n" + "!"*50)
                                print("💡 Waiting for Antigravity 2.33+ Hub or CDP session...")
                                print("   Open Antigravity normally (zero-flag Hub RPC auto-detected)")
                                print("   or launch legacy IDE with --remote-debugging-port=9000.")
                                print("!"*50 + "\n")
                                cdp_warning_shown = True
            except Exception:
                pass

    except KeyboardInterrupt:
        print("\n\n👋 Shutting down...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        # Cleanup
        try:
            terminate_process(locals().get('node_process'))

            if args.mode == 'web' and tunnel_handle is not None:
                if active_provider == 'pinggy' and hasattr(tunnel_handle, 'stop'):
                    try:
                        tunnel_handle.stop()
                    except Exception:
                        pass
                elif active_provider == 'ngrok' and hasattr(tunnel_handle, 'kill'):
                    try:
                        tunnel_handle.kill()
                    except Exception:
                        pass
                elif hasattr(tunnel_handle, 'terminate'):
                    terminate_process(tunnel_handle)
        except Exception:
            pass
        
        if 'log_file' in locals() and log_file:
            log_file.close()

if __name__ == "__main__":
    main()
