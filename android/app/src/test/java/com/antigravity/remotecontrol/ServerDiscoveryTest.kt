package com.antigravity.remotecontrol

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ServerDiscoveryTest {

    @Test
    fun parseServerInput_handlesBareIpv4AndDefaultPort() {
        val parsed = ServerDiscovery.parseServerInput("192.168.1.42")
        assertNotNull(parsed)
        assertEquals("http://192.168.1.42:3000", parsed!!.baseUrl)
        assertNull(parsed.extractedKey)
    }

    @Test
    fun parseServerInput_handlesExplicitPortAndTrailingSlash() {
        val parsed = ServerDiscovery.parseServerInput("  10.0.0.18:8443/  ")
        assertNotNull(parsed)
        assertEquals("http://10.0.0.18:8443", parsed!!.baseUrl)
        assertNull(parsed.extractedKey)
    }

    @Test
    fun parseServerInput_extractsMagicLinkKeyFromTunnelUrl() {
        val parsed = ServerDiscovery.parseServerInput("https://vivid-orbit-42.trycloudflare.com/?key=739184")
        assertNotNull(parsed)
        assertEquals("https://vivid-orbit-42.trycloudflare.com", parsed!!.baseUrl)
        assertEquals("739184", parsed.extractedKey)
    }

    @Test
    fun parseServerInput_stripsLoginPathSuffix() {
        val parsed = ServerDiscovery.parseServerInput("http://192.168.0.9:3000/login.html")
        assertNotNull(parsed)
        assertEquals("http://192.168.0.9:3000", parsed!!.baseUrl)
    }

    @Test
    fun parseServerInput_rejectsEmptyAndMalformedStrings() {
        assertNull(ServerDiscovery.parseServerInput(""))
        assertNull(ServerDiscovery.parseServerInput("   "))
        assertNull(ServerDiscovery.parseServerInput("not a valid host"))
        assertNull(ServerDiscovery.parseServerInput("ftp://192.168.1.2:21"))
        assertNull(ServerDiscovery.parseServerInput("999.999.999.999"))
    }

    @Test
    fun isPrivateLanHost_validatesRfc1918Boundaries() {
        assertTrue(ServerDiscovery.isPrivateLanHost("192.168.1.1"))
        assertTrue(ServerDiscovery.isPrivateLanHost("10.255.0.1"))
        assertTrue(ServerDiscovery.isPrivateLanHost("172.16.0.1"))
        assertTrue(ServerDiscovery.isPrivateLanHost("172.31.255.254"))
        assertTrue(ServerDiscovery.isPrivateLanHost("127.0.0.1"))
        assertTrue(ServerDiscovery.isPrivateLanHost("10.0.2.2"))
        assertTrue(ServerDiscovery.isPrivateLanHost("100.88.14.5"))
        assertTrue(ServerDiscovery.isPrivateLanHost("workstation.local"))

        assertFalse(ServerDiscovery.isPrivateLanHost("100.63.255.255"))
        assertFalse(ServerDiscovery.isPrivateLanHost("100.128.0.1"))
        assertFalse(ServerDiscovery.isPrivateLanHost("172.15.255.255"))
        assertFalse(ServerDiscovery.isPrivateLanHost("172.32.0.1"))
        assertFalse(ServerDiscovery.isPrivateLanHost("8.8.8.8"))
        assertFalse(ServerDiscovery.isPrivateLanHost("trycloudflare.com"))
        assertFalse(ServerDiscovery.isPrivateLanHost(""))
        assertFalse(ServerDiscovery.isPrivateLanHost(null))
    }

    @Test
    fun parseServerInput_handlesMdnsLocalHostnameWithDefaultPort() {
        val parsed = ServerDiscovery.parseServerInput("dev-desktop.local")
        assertNotNull(parsed)
        assertEquals("http://dev-desktop.local:3000", parsed!!.baseUrl)
    }

    @Test
    fun classifyWebViewNavigation_keepsSameServerAndBundledAssetsInWebView() {
        val lanBase = "http://192.168.1.42:3000"
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation("http://192.168.1.42:3000/?key=123456", lanBase)
        )
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation("http://192.168.1.42:3000/login.html", lanBase)
        )
        // Same host & port HTTPS upgrade stays in WebView
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation("https://192.168.1.42:3000/", lanBase)
        )

        val tunnelBase = "https://vivid-orbit-42.trycloudflare.com"
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation("https://vivid-orbit-42.trycloudflare.com:443/login.html", tunnelBase)
        )

        val assetBase = "file:///android_asset/www/index.html"
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation("file:///android_asset/www/index.html", assetBase)
        )
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation("about:blank", lanBase)
        )
    }

    @Test
    fun classifyWebViewNavigation_opensExternalLinksInSystemBrowser() {
        val lanBase = "http://192.168.1.42:3000"
        val assetBase = "file:///android_asset/www/index.html"

        // External markdown & support modal links open in Android's browser
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation("https://krishnakanthb13.github.io/S/PLPm.html", lanBase)
        )
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation("https://krishnakanthb13.github.io/S/PLPm.html", assetBase)
        )
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation("https://github.com/google-deepmind", lanBase)
        )
        // Different port on same LAN IP opens externally
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation("http://192.168.1.42:8080/docs", lanBase)
        )
        // APK download & main-frame /hub/media file download delegate to external browser / DownloadManager
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation("http://192.168.1.42:3000/download/apk", lanBase)
        )
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = "http://192.168.1.42:3000/hub/media?uri=file%3A%2F%2F%2FC%3A%2Ftest.pdf",
                activeTargetUrl = lanBase,
                isForMainFrame = true,
                hasUserGesture = true
            )
        )
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = "http://192.168.1.42:3000/hub/media?uri=file%3A%2F%2F%2FC%3A%2Ftest.pdf",
                activeTargetUrl = lanBase,
                isForMainFrame = false,
                hasUserGesture = false
            )
        )
        // HTTPS -> HTTP downgrade does not load inside authenticated tunnel WebView
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation(
                "http://vivid-orbit-42.trycloudflare.com/",
                "https://vivid-orbit-42.trycloudflare.com"
            )
        )
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation("mailto:support@example.com", lanBase)
        )
    }

    @Test
    fun classifyWebViewNavigation_handlesWorkspaceFileLinksAndBlocksUnsafeSchemes() {
        val lanBase = "http://192.168.1.42:3000"
        assertEquals(
            WebViewUrlAction.COPY_WORKSPACE_FILE_PATH,
            ServerDiscovery.classifyWebViewNavigation(
                "file:///C:/Users/demo/Antigravity/Remote-Control/hub_bridge.js",
                lanBase
            )
        )
        assertEquals(
            WebViewUrlAction.COPY_WORKSPACE_FILE_PATH,
            ServerDiscovery.classifyWebViewNavigation(
                "file:///android_asset/../sdcard/secret.txt",
                "file:///android_asset/www/index.html"
            )
        )
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation("javascript:alert(1)", lanBase)
        )
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation("intent://scan/#Intent;scheme=zxing;end", lanBase)
        )
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation("", lanBase)
        )
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation(null, lanBase)
        )
    }

    @Test
    fun classifyWebViewNavigation_preventsNonGestureSubframeHijackingWhileBlockingUnsafeSchemes() {
        val lanBase = "http://192.168.1.42:3000"

        // Background iframe subrequests without user gesture must NOT launch external browser intents
        assertEquals(
            WebViewUrlAction.LOAD_IN_WEBVIEW,
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = "https://example.com/embed/widget",
                activeTargetUrl = lanBase,
                isForMainFrame = false,
                hasUserGesture = false
            )
        )
        // Explicit user tap inside an iframe opens external browser cleanly
        assertEquals(
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER,
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = "https://example.com/docs",
                activeTargetUrl = lanBase,
                isForMainFrame = false,
                hasUserGesture = true
            )
        )
        // Unsafe schemes in subframes remain blocked
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = "javascript:alert(1)",
                activeTargetUrl = lanBase,
                isForMainFrame = false,
                hasUserGesture = false
            )
        )
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = "file:///sdcard/Download/secret.txt",
                activeTargetUrl = lanBase,
                isForMainFrame = false,
                hasUserGesture = false
            )
        )
    }

    @Test
    fun classifyWebViewNavigation_routesSidecarSwarmLinksToInAppSwarmUi() {
        val lanBase = "http://192.168.1.42:3000"
        val assetBase = "file:///android_asset/www/index.html"

        assertEquals(
            WebViewUrlAction.OPEN_SWARM_UI,
            ServerDiscovery.classifyWebViewNavigation(
                "sidecar://swarm/swarm_board/?auto_open=false",
                lanBase
            )
        )
        assertEquals(
            WebViewUrlAction.OPEN_SWARM_UI,
            ServerDiscovery.classifyWebViewNavigation(
                "sidecar://swarm/swarm_board/?swarm=8c04825f-2cfa-46c7-a414-2f60a5785448",
                assetBase
            )
        )
        // Non-gesture background subframe sidecar links and unrelated sidecars are blocked
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = "sidecar://swarm/swarm_board/?auto_open=false",
                activeTargetUrl = lanBase,
                isForMainFrame = false,
                hasUserGesture = false
            )
        )
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation("sidecar://other_viewer/panel", lanBase)
        )
        assertEquals(
            WebViewUrlAction.BLOCK,
            ServerDiscovery.classifyWebViewNavigation("sidecar://swarm_evil/panel", lanBase)
        )
        assertEquals(
            WebViewUrlAction.OPEN_SWARM_UI,
            ServerDiscovery.classifyWebViewNavigation("sidecar://swarm?swarm=8c04825f-2cfa-46c7-a414-2f60a5785448", lanBase)
        )
    }

    @Test
    fun parseHealthPayload_acceptsAntigravityHubAndRejectsUnrelatedPort3000Servers() {
        val validJson = """
            {"status":"ok","service":"antigravity-remote-control","version":"6.0.0","hubConnected":true,"lsVersion":"2.33.0","targetApp":"ide","hostname":"DEV-WORKSTATION"}
        """.trimIndent()
        val parsed = ServerDiscovery.parseHealthPayload(validJson, "http://192.168.1.20:3000", "192.168.1.20")
        assertNotNull(parsed)
        assertEquals("http://192.168.1.20:3000", parsed!!.baseUrl)
        assertEquals("DEV-WORKSTATION", parsed.hostname)
        assertTrue(parsed.hubConnected)
        assertEquals("2.33.0", parsed.lsVersion)
        assertEquals("ide", parsed.targetApp)

        // Generic Express/FastAPI server on port 3000 returning {"status":"ok"} must be ignored
        assertNull(
            ServerDiscovery.parseHealthPayload(
                """{"status":"ok","uptime":42}""",
                "http://192.168.1.99:3000",
                "192.168.1.99"
            )
        )
        assertNull(
            ServerDiscovery.parseHealthPayload(
                """{"status":"error","service":"antigravity-remote-control"}""",
                "http://192.168.1.20:3000",
                "192.168.1.20"
            )
        )
        assertNull(ServerDiscovery.parseHealthPayload("not json", "http://192.168.1.20:3000", "192.168.1.20"))
    }
}
