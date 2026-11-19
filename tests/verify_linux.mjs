import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = dirname(__dirname);
const TEST_PORT = 3461;
const TEST_PASS = 'linux_ci_pass';
const MOCK_CASCADE_ID = 'linux-ci-cascade-1111-2222-3333-444444444444';

function httpRequest(port, path, { method = 'GET', headers = {}, body = null } = {}) {
    return new Promise((resolve, reject) => {
        const rawBody = body === null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body), 'utf-8');
        const reqHeaders = { ...headers };
        if (rawBody !== null && !reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = String(rawBody.length);
        }
        const req = http.request(
            { hostname: '127.0.0.1', port, path, method, headers: reqHeaders },
            res => {
                const chunks = [];
                res.on('data', c => chunks.push(c));
                res.on('end', () => {
                    const text = Buffer.concat(chunks).toString('utf-8');
                    let json = null;
                    try { json = JSON.parse(text); } catch {}
                    resolve({ status: res.statusCode, headers: res.headers, text, json });
                });
            }
        );
        req.on('error', reject);
        if (rawBody !== null) req.write(rawBody);
        req.end();
    });
}

function createMockHubDaemon(workspaceDir) {
    const csrfToken = 'mock-linux-csrf-' + crypto.randomBytes(6).toString('hex');
    const wsUri = 'file:///' + workspaceDir.replace(/\\/g, '/').replace(/^\/+/, '');
    const userStatus = {
        name: 'CI Test User',
        email: 'ci@example.com',
        userTier: { id: 'pro', name: 'Pro', description: 'Pro' },
        planStatus: { planInfo: { planName: 'Pro', teamsTier: 'STANDARD' }, availablePromptCredits: 100 },
        cascadeModelConfigData: {
            defaultOverrideModelConfig: { modelOrAlias: { model: 'MODEL_PLACEHOLDER_M532' } },
            clientModelConfigs: [
                {
                    label: 'Gemini 4 Neon (High)',
                    modelId: 'gemini-4-neon-high',
                    modelOrAlias: { model: 'MODEL_PLACEHOLDER_M532' },
                    tagTitle: 'New',
                    supportsImages: true,
                    quotaInfo: { remainingFraction: 0.9 }
                },
                {
                    label: 'Gemini 3.8 Flash (Low)',
                    modelId: 'gemini-3-8-flash-low',
                    modelOrAlias: { model: 'MODEL_PLACEHOLDER_M417' },
                    tagTitle: 'Fast',
                    supportsImages: true,
                    quotaInfo: { remainingFraction: 1.0 }
                }
            ]
        }
    };

    const sampleSteps = [
        {
            type: 'CORTEX_STEP_TYPE_USER_INPUT',
            status: 'CORTEX_STEP_STATUS_DONE',
            metadata: { source: 'CORTEX_STEP_SOURCE_USER' },
            userInput: { items: [{ text: 'Verify cross-platform Linux Hub RPC' }] }
        },
        {
            type: 'CORTEX_STEP_TYPE_PLANNER_RESPONSE',
            status: 'CORTEX_STEP_STATUS_DONE',
            metadata: { source: 'CORTEX_STEP_SOURCE_MODEL', generatorModel: 'MODEL_PLACEHOLDER_M532' },
            plannerResponse: { response: 'LINUX_HUB_MOCK_OK: ConnectRPC verified cleanly.' }
        }
    ];

    const srv = http.createServer((req, res) => {
        if ((req.headers['x-codeium-csrf-token'] || '') !== csrfToken) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid CSRF token' }));
            return;
        }
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
            const method = (req.url || '').split('/').pop();
            let payload = {};
            try { payload = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}'); } catch {}

            let out = {};
            if (method === 'GetUserStatus') {
                out = { userStatus };
            } else if (method === 'RetrieveUserQuotaSummary') {
                out = {
                    response: {
                        groups: [
                            { displayName: 'Gemini Models', buckets: [{ bucketId: 'gemini-weekly', remainingFraction: 0.9 }] }
                        ]
                    }
                };
            } else if (method === 'GetAllCascadeTrajectories') {
                out = {
                    trajectorySummaries: {
                        [MOCK_CASCADE_ID]: {
                            summary: 'Linux CI Mock Session',
                            lastModifiedTime: new Date().toISOString(),
                            workspaces: [{ workspaceFolderAbsoluteUri: wsUri }]
                        }
                    }
                };
            } else if (method === 'GetCascadeTrajectory') {
                out = { trajectory: { cascadeId: payload.cascadeId || MOCK_CASCADE_ID, trajectoryId: 'traj-1', steps: sampleSteps } };
            } else if (method === 'GetSlashCommands') {
                out = {
                    commands: [
                        { name: 'boost', description: 'Run multi-stage review', type: 'COMMAND_TYPE_SYSTEM', modelFacingText: 'Boost workflow' },
                        { name: 'btw', description: 'Side question', type: 'COMMAND_TYPE_SYSTEM', modelFacingText: 'Side question' }
                    ]
                };
            } else if (method === 'GetAllWorkflows') {
                out = { workflows: [] };
            } else if (method === 'ListMcpPrompts') {
                out = { prompts: [] };
            } else if (method === 'ListProjects') {
                out = { projectIds: ['proj-1'] };
            } else if (method === 'ReadProjects') {
                out = { projects: [{ id: 'proj-1', projectResources: { resources: [{ localFolder: { uri: wsUri } }] } }] };
            } else if (method === 'StartCascade') {
                out = { cascadeId: MOCK_CASCADE_ID };
            } else if (method === 'SendUserCascadeMessage' || method === 'DeleteCascadeTrajectory') {
                out = { ok: true };
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(out));
        });
    });

    return new Promise(resolve => {
        srv.listen(0, '127.0.0.1', () => {
            resolve({ server: srv, port: srv.address().port, csrfToken, wsUri });
        });
    });
}

async function main() {
    console.log(`=== Linux / Cross-Platform Verification (${process.platform} · Node ${process.version}) ===`);

    // 1. Android web asset parity check + uriToLocalPath
    const { AntigravityHubBridge, uriToLocalPath } = await import(`file://${join(ROOT_DIR, 'hub_bridge.js').replace(/\\/g, '/')}`);
    for (const rel of ['index.html', 'login.html', 'manifest.json', join('css', 'style.css'), join('js', 'app.js')]) {
        const webBuf = fs.readFileSync(join(ROOT_DIR, 'public', rel));
        const apkBuf = fs.readFileSync(join(ROOT_DIR, 'android', 'app', 'src', 'main', 'assets', 'www', rel));
        assert.equal(Buffer.compare(webBuf, apkBuf), 0, `Asset parity mismatch for ${rel}`);
    }
    if (process.platform !== 'win32') {
        assert.equal(uriToLocalPath('file:///home/demo/project'), '/home/demo/project');
    } else {
        assert.equal(uriToLocalPath('file:///C:/Users/demo/project'), 'C:\\Users\\demo\\project');
    }
    console.log('✔ Verified public/ <-> android assets byte-for-byte parity & uriToLocalPath');

    // 2. Setup temp HOME + mock daemon + workspace
    const tempHome = fs.mkdtempSync(join(os.tmpdir(), 'agy-rc-linux-'));
    const daemonDir = join(tempHome, '.gemini', 'antigravity', 'daemon');
    const wsDir = join(tempHome, 'workspace');
    const wfDir = join(wsDir, '.agent', 'workflows');
    fs.mkdirSync(daemonDir, { recursive: true });
    fs.mkdirSync(wfDir, { recursive: true });
    fs.writeFileSync(join(wsDir, 'hello.txt'), 'hello linux', 'utf-8');
    fs.writeFileSync(join(wfDir, 'linux-ci-wf.md'), '---\ndescription: Linux CI mock workflow\n---\nEcho OK\n', 'utf-8');

    const mockDaemon = await createMockHubDaemon(wsDir);
    const certsDir = join(ROOT_DIR, 'certs');
    const hadCertsBefore = fs.existsSync(join(certsDir, 'server.cert')) && fs.existsSync(join(certsDir, 'server.key'));
    const uploadedCleanupPaths = [];
    let srvProc = null;

    const prevHome = process.env.HOME;
    const prevUserProfile = process.env.USERPROFILE;

    try {
        fs.writeFileSync(
            join(daemonDir, `hub_${mockDaemon.port}.json`),
            JSON.stringify({
                pid: process.pid,
                httpPort: mockDaemon.port,
                csrfToken: mockDaemon.csrfToken,
                lsVersion: '2.33.0'
            }),
            'utf-8'
        );

        // 3. Verify AntigravityHubBridge against mock daemon with isolated HOME
        process.env.HOME = tempHome;
        process.env.USERPROFILE = tempHome;
        const bridge = new AntigravityHubBridge();
        const found = await bridge.discoverHub(true);
        assert.ok(found && found.httpPort === mockDaemon.port, 'Expected discoverHub to find mock Hub daemon');

        const models = await bridge.refreshModels();
        assert.ok(models.models.includes('Gemini 4 Neon (High)'), 'Expected mock model catalog loaded');

        const slash = await bridge.getSlashCommands(true);
        assert.ok(slash.commands.some(c => c.name === 'linux-ci-wf'), 'Expected _scanLocalWorkflowFiles to discover .agent/workflows/linux-ci-wf.md');

        const outsideProbe = process.platform === 'win32' ? 'C:/Windows/win.ini' : '/etc/passwd';
        assert.throws(
            () => bridge.resolveSafeWorkspacePath(wsDir, outsideProbe),
            err => err && err.statusCode === 403,
            `Expected 403 for outside path ${outsideProbe}`
        );
        assert.equal(bridge.resolveSafeWorkspacePath(wsDir, 'hello.txt'), fs.realpathSync(join(wsDir, 'hello.txt')));

        const snap = await bridge.buildSnapshotFromHub(MOCK_CASCADE_ID);
        assert.ok(snap.html.includes('LINUX_HUB_MOCK_OK'), 'Expected rendered snapshot HTML from mock Hub');
        console.log('✔ Verified HubBridge mock ConnectRPC, workflow discovery, workspace 403 guard & snapshot rendering');

        // 4. SSL cert generation + live server.js HTTP/HTTPS/WS verification
        if (!hadCertsBefore) {
            execFileSync(process.execPath, [join(ROOT_DIR, 'generate_ssl.js')], { cwd: ROOT_DIR, stdio: 'pipe' });
        }
        assert.ok(fs.existsSync(join(certsDir, 'server.cert')), 'Expected certs/server.cert');

        srvProc = spawn(process.execPath, ['server.js'], {
            cwd: ROOT_DIR,
            env: {
                ...process.env,
                HOME: tempHome,
                USERPROFILE: tempHome,
                PORT: String(TEST_PORT),
                APP_PASSWORD: TEST_PASS,
                AGY_DISABLE_DESKTOP_LAUNCH: '1'
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let ready = false;
        for (let i = 0; i < 25; i++) {
            try {
                const h = await httpRequest(TEST_PORT, '/health');
                if (h.status === 200 && h.json?.status === 'ok' && h.json?.hubConnected === true) {
                    ready = true;
                    break;
                }
            } catch {}
            await new Promise(r => setTimeout(r, 250));
        }
        assert.ok(ready, 'Expected server.js /health to report hubConnected=true');

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
        assert.equal(httpsHealth.json.service, 'antigravity-remote-control');

        const localSnap = await httpRequest(TEST_PORT, '/snapshot');
        assert.equal(localSnap.status, 200);
        assert.ok(localSnap.json?.html?.includes('LINUX_HUB_MOCK_OK'));

        const unauthXff = await httpRequest(TEST_PORT, '/snapshot', { headers: { 'X-Forwarded-For': '203.0.113.5' } });
        assert.equal(unauthXff.status, 401);
        const unauthCf = await httpRequest(TEST_PORT, '/snapshot', { headers: { 'CF-Connecting-IP': '203.0.113.5' } });
        assert.equal(unauthCf.status, 401);
        const authTunnel = await httpRequest(TEST_PORT, '/snapshot', {
            headers: { 'CF-Connecting-IP': '203.0.113.5', 'x-ag-key': TEST_PASS }
        });
        assert.equal(authTunnel.status, 200);

        // Binary upload + /hub/media streaming + 403 traversal check
        const rawBytes = crypto.randomBytes(512);
        rawBytes[0] = 0x25;
        rawBytes[1] = 0xff;
        rawBytes[2] = 0x00;
        const upRes = await httpRequest(TEST_PORT, '/upload-attachment', {
            method: 'POST',
            body: {
                fileName: 'linux_test.bin',
                fileType: 'application/octet-stream',
                dataUrl: `data:application/octet-stream;base64,${rawBytes.toString('base64')}`
            }
        });
        assert.equal(upRes.status, 200);
        assert.equal(upRes.json?.success, true);
        uploadedCleanupPaths.push(upRes.json.filePath);
        assert.equal(Buffer.compare(rawBytes, fs.readFileSync(upRes.json.filePath)), 0);

        const media200 = await httpRequest(TEST_PORT, `/hub/media?uri=${encodeURIComponent(upRes.json.filePath)}`);
        assert.equal(media200.status, 200);
        const media206 = await httpRequest(TEST_PORT, `/hub/media?uri=${encodeURIComponent(upRes.json.filePath)}`, {
            headers: { Range: 'bytes=0-15' }
        });
        assert.equal(media206.status, 206);
        const media403 = await httpRequest(TEST_PORT, `/hub/media?uri=${encodeURIComponent(join(ROOT_DIR, 'package.json'))}`);
        assert.equal(media403.status, 403);

        // WebSocket local + tunnel auth guard
        const wsUnauth = await new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${TEST_PORT}/`, {
                headers: { 'x-forwarded-for': '203.0.113.5' }
            });
            let gotUnauth = false;
            ws.on('message', m => {
                const msg = JSON.parse(m.toString());
                if (msg.type === 'error' && msg.message === 'Unauthorized') gotUnauth = true;
            });
            ws.on('error', reject);
            ws.on('close', () => resolve(gotUnauth));
            setTimeout(() => { try { ws.close(); } catch {} resolve(gotUnauth); }, 500);
        });
        assert.equal(wsUnauth, true, 'Unauthenticated WebSocket over tunnel must receive Unauthorized');

        const wsAuthed = await new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${TEST_PORT}/`, {
                headers: { 'x-forwarded-for': '203.0.113.5', 'x-ag-key': TEST_PASS }
            });
            let unauth = false;
            ws.on('message', m => {
                const msg = JSON.parse(m.toString());
                if (msg.type === 'error' && msg.message === 'Unauthorized') unauth = true;
            });
            ws.on('error', reject);
            setTimeout(() => {
                const ok = ws.readyState === WebSocket.OPEN && !unauth;
                ws.close();
                resolve(ok);
            }, 300);
        });
        assert.equal(wsAuthed, true, 'Authenticated x-ag-key WebSocket over tunnel must stay open');
        console.log('✔ Verified live server.js dual HTTP/HTTPS, Zero-Trust 401 tunnel guards, binary uploads & WebSocket auth');

        // 5. Python launcher.py Linux IP & private-range tests
        const pyCandidates = process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
        const pyBin = pyCandidates.find(cmd => {
            try { execFileSync(cmd, ['--version'], { stdio: 'pipe' }); return true; } catch { return false; }
        });
        assert.ok(pyBin, 'Python binary required for launcher.py verification');

        const pyScript = `
import os, socket
import launcher

assert launcher._is_private_lan_ipv4('127.0.1.1') is False
assert launcher._is_private_lan_ipv4('169.254.1.1') is False
assert launcher._is_private_lan_ipv4('8.8.8.8') is False
assert launcher._is_private_lan_ipv4('192.168.1.25') is True
assert launcher._is_private_lan_ipv4('10.0.0.5') is True
assert launcher._is_private_lan_ipv4('172.20.0.2') is True

orig = socket.gethostbyname_ex
try:
    socket.gethostbyname_ex = lambda _h: ('ubuntu-box', [], ['127.0.1.1'])
    ip = launcher.get_local_ip()
    assert ip != '127.0.1.1', f'Returned 127.0.1.1: {ip}'
finally:
    socket.gethostbyname_ex = orig

os.environ['HOST_IP'] = '192.168.50.10'
try:
    assert launcher.get_local_ip() == '192.168.50.10'
finally:
    os.environ.pop('HOST_IP', None)
print('PY_LAUNCHER_OK')
`;
        const pyOut = execFileSync(pyBin, ['-B', '-c', pyScript], { cwd: ROOT_DIR, encoding: 'utf-8' });
        assert.ok(pyOut.includes('PY_LAUNCHER_OK'), `Unexpected launcher.py test output: ${pyOut}`);
        console.log('✔ Verified launcher.py private LAN filtering (never returns 127.0.1.1) & HOST_IP override');

        // 6. Shell script syntax check via bash -n (on Linux/macOS or Git Bash on Windows)
        const bashCandidates = process.platform === 'win32'
            ? ['C:\\Program Files\\Git\\bin\\bash.exe']
            : ['bash'];
        const bashBin = bashCandidates.find(b => b === 'bash' || fs.existsSync(b));
        if (bashBin) {
            execFileSync(
                bashBin,
                ['-n', 'start_ag_phone_connect.sh', 'start_ag_phone_connect_web.sh', 'install_context_menu.sh'],
                { cwd: ROOT_DIR, stdio: 'pipe' }
            );
            console.log('✔ Verified bash -n syntax on all .sh scripts');
        }
    } finally {
        if (prevHome === undefined) delete process.env.HOME; else process.env.HOME = prevHome;
        if (prevUserProfile === undefined) delete process.env.USERPROFILE; else process.env.USERPROFILE = prevUserProfile;
        if (srvProc && srvProc.exitCode === null) {
            try { srvProc.kill('SIGKILL'); } catch {}
        }
        await new Promise(resolve => mockDaemon.server.close(() => resolve()));
        for (const p of uploadedCleanupPaths) {
            try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
        }
        if (!hadCertsBefore && fs.existsSync(certsDir)) {
            fs.rmSync(certsDir, { recursive: true, force: true });
        }
        fs.rmSync(tempHome, { recursive: true, force: true });
    }

    console.log('\nALL LINUX / CROSS-PLATFORM TESTS PASSED!');
}

main().catch(err => {
    console.error('\nLINUX VERIFICATION FAILED:', err);
    process.exit(1);
});
