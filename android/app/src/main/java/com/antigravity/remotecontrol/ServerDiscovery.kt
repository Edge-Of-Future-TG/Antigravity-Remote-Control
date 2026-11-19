package com.antigravity.remotecontrol

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.NetworkInterface
import java.net.Socket
import java.net.URI
import java.net.URLDecoder
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

data class ParsedConnection(
    val baseUrl: String,
    val extractedKey: String? = null
)

data class DiscoveredServer(
    val baseUrl: String,
    val hostname: String,
    val hubConnected: Boolean,
    val lsVersion: String?,
    val targetApp: String = "antigravity"
)

enum class WebViewUrlAction {
    LOAD_IN_WEBVIEW,
    OPEN_EXTERNAL_BROWSER,
    OPEN_SWARM_UI,
    COPY_WORKSPACE_FILE_PATH,
    BLOCK
}

object ServerDiscovery {

    /**
     * Parses user-entered IP, host:port, tunnel URL, or QR magic link (?key=...)
     * into a normalized baseUrl and optional session passcode.
     */
    fun parseServerInput(rawInput: String, defaultPort: Int = 3000): ParsedConnection? {
        val trimmed = rawInput.trim()
        if (trimmed.isEmpty()) return null

        val withScheme = when {
            trimmed.startsWith("http://", ignoreCase = true) ||
                trimmed.startsWith("https://", ignoreCase = true) -> trimmed
            // Reject any other explicit URI scheme (ftp://, ws://, file://, etc.)
            trimmed.matches(Regex("^[a-zA-Z][a-zA-Z0-9+.-]*://.*")) -> return null
            // Bare IPv4 or localhost -> default to http://<host>:<port>
            trimmed.matches(Regex("^\\d{1,3}(\\.\\d{1,3}){3}(:\\d+)?(/.*)?$")) ||
                trimmed.startsWith("localhost", ignoreCase = true) -> {
                val hostPart = trimmed.substringBefore("/")
                val pathPart = if (trimmed.contains("/")) "/" + trimmed.substringAfter("/") else ""
                if (hostPart.contains(":")) {
                    "http://$hostPart$pathPart"
                } else {
                    "http://$hostPart:$defaultPort$pathPart"
                }
            }
            // Local mDNS hostname (.local / .lan / .home) -> default to http://<host>:<port>
            trimmed.substringBefore("/").substringBefore(":").let { h ->
                h.endsWith(".local", ignoreCase = true) ||
                    h.endsWith(".lan", ignoreCase = true) ||
                    h.endsWith(".home", ignoreCase = true)
            } -> {
                val hostPart = trimmed.substringBefore("/")
                val pathPart = if (trimmed.contains("/")) "/" + trimmed.substringAfter("/") else ""
                if (hostPart.contains(":")) {
                    "http://$hostPart$pathPart"
                } else {
                    "http://$hostPart:$defaultPort$pathPart"
                }
            }
            // Domain name (e.g. tunnel domain like xxxx.trycloudflare.com or ngrok)
            trimmed.contains(".") && !trimmed.contains(" ") -> {
                if (trimmed.substringBefore("/").contains(":")) {
                    "http://$trimmed"
                } else {
                    "https://$trimmed"
                }
            }
            else -> return null
        }

        return try {
            val uri = URI(withScheme)
            val scheme = uri.scheme?.lowercase() ?: return null
            if (scheme != "http" && scheme != "https") return null
            val host = uri.host ?: return null
            if (host.isBlank()) return null

            // If host looks like numeric IPv4, verify all 4 octets are 0..255
            if (host.matches(Regex("^\\d+(\\.\\d+){3}$"))) {
                val octets = host.split(".").map { it.toIntOrNull() ?: return null }
                if (octets.any { it < 0 || it > 255 }) return null
            }

            val portPart = if (uri.port != -1) ":${uri.port}" else ""
            val cleanPath = (uri.path ?: "").trimEnd('/')
            val normalizedPath = if (cleanPath == "/login.html" || cleanPath == "/login") "" else cleanPath

            var extractedKey: String? = null
            val rawQuery = uri.rawQuery
            if (!rawQuery.isNullOrBlank()) {
                for (pair in rawQuery.split("&")) {
                    val idx = pair.indexOf('=')
                    if (idx > 0) {
                        val k = URLDecoder.decode(pair.substring(0, idx), "UTF-8")
                        val v = URLDecoder.decode(pair.substring(idx + 1), "UTF-8")
                        if (k == "key" && v.isNotEmpty()) {
                            extractedKey = v
                        }
                    }
                }
            }

            ParsedConnection(
                baseUrl = "$scheme://$host$portPart$normalizedPath",
                extractedKey = extractedKey
            )
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Checks whether a host belongs to RFC-1918 private LAN, RFC-6598 Tailscale/ZeroTier,
     * mDNS (.local/.lan/.home), loopback, or Android emulator host.
     */
    fun isPrivateLanHost(host: String?): Boolean {
        if (host.isNullOrBlank()) return false
        val h = host.trim().lowercase()
        if (h == "localhost" || h == "127.0.0.1" || h == "::1" || h == "10.0.2.2") return true
        if (h.endsWith(".local") || h.endsWith(".lan") || h.endsWith(".home")) return true

        val parts = h.split(".")
        if (parts.size != 4) return false
        val octets = parts.map { it.toIntOrNull() ?: return false }
        if (octets.any { it < 0 || it > 255 }) return false

        return when {
            octets[0] == 10 -> true
            octets[0] == 192 && octets[1] == 168 -> true
            octets[0] == 172 && octets[1] in 16..31 -> true
            octets[0] == 100 && octets[1] in 64..127 -> true
            else -> false
        }
    }

    /**
     * Classifies WebView URL navigations so same-server and bundled android_asset URLs stay inside
     * the Remote Control WebView, external HTTP/HTTPS/mailto/tel links open in Android's browser,
     * desktop file:/// markdown references copy cleanly without navigating away, and unsafe schemes are blocked.
     */
    fun classifyWebViewNavigation(
        requestUrl: String?,
        activeTargetUrl: String?,
        isForMainFrame: Boolean = true,
        hasUserGesture: Boolean = true
    ): WebViewUrlAction {
        if (requestUrl.isNullOrBlank()) return WebViewUrlAction.BLOCK
        val trimmed = requestUrl.trim()
        if (trimmed.equals("about:blank", ignoreCase = true)) {
            return WebViewUrlAction.LOAD_IN_WEBVIEW
        }

        if (trimmed.startsWith("file:", ignoreCase = true)) {
            val normalized = trimmed.replace('\\', '/')
            return if (
                normalized.startsWith("file:///android_asset/", ignoreCase = true) &&
                !normalized.contains("..")
            ) {
                WebViewUrlAction.LOAD_IN_WEBVIEW
            } else if (isForMainFrame || hasUserGesture) {
                WebViewUrlAction.COPY_WORKSPACE_FILE_PATH
            } else {
                WebViewUrlAction.BLOCK
            }
        }

        if (
            trimmed.equals("sidecar://swarm", ignoreCase = true) ||
            trimmed.startsWith("sidecar://swarm/", ignoreCase = true) ||
            trimmed.startsWith("sidecar://swarm?", ignoreCase = true)
        ) {
            return if (isForMainFrame || hasUserGesture) {
                WebViewUrlAction.OPEN_SWARM_UI
            } else {
                WebViewUrlAction.BLOCK
            }
        }

        if (trimmed.startsWith("mailto:", ignoreCase = true) || trimmed.startsWith("tel:", ignoreCase = true)) {
            return if (isForMainFrame || hasUserGesture) {
                WebViewUrlAction.OPEN_EXTERNAL_BROWSER
            } else {
                WebViewUrlAction.BLOCK
            }
        }

        if (!trimmed.startsWith("http://", ignoreCase = true) && !trimmed.startsWith("https://", ignoreCase = true)) {
            return WebViewUrlAction.BLOCK
        }

        val reqUri = try {
            URI(trimmed)
        } catch (_: Exception) {
            try {
                URI(trimmed.replace(" ", "%20"))
            } catch (_: Exception) {
                return WebViewUrlAction.BLOCK
            }
        }

        val reqScheme = reqUri.scheme?.lowercase() ?: return WebViewUrlAction.BLOCK
        if (reqScheme != "http" && reqScheme != "https") return WebViewUrlAction.BLOCK
        val reqHost = reqUri.host?.lowercase() ?: return WebViewUrlAction.BLOCK
        val reqEffectivePort = if (reqUri.port != -1) reqUri.port else if (reqScheme == "https") 443 else 80

        // Do not hijack screen with external browser Intent for background iframe subrequests
        if (!isForMainFrame && !hasUserGesture) {
            return WebViewUrlAction.LOAD_IN_WEBVIEW
        }

        val reqPath = reqUri.path ?: ""
        if (
            reqPath.equals("/download/apk", ignoreCase = true) ||
            (isForMainFrame && hasUserGesture && reqPath.equals("/hub/media", ignoreCase = true))
        ) {
            return WebViewUrlAction.OPEN_EXTERNAL_BROWSER
        }

        val baseTrimmed = activeTargetUrl?.trim().orEmpty()
        if (baseTrimmed.isEmpty() || baseTrimmed.startsWith("file:", ignoreCase = true)) {
            return WebViewUrlAction.OPEN_EXTERNAL_BROWSER
        }

        val baseUri = try {
            URI(baseTrimmed)
        } catch (_: Exception) {
            return WebViewUrlAction.OPEN_EXTERNAL_BROWSER
        }
        val baseScheme = baseUri.scheme?.lowercase() ?: return WebViewUrlAction.OPEN_EXTERNAL_BROWSER
        val baseHost = baseUri.host?.lowercase() ?: return WebViewUrlAction.OPEN_EXTERNAL_BROWSER
        val baseEffectivePort = if (baseUri.port != -1) baseUri.port else if (baseScheme == "https") 443 else 80

        if (reqHost != baseHost) {
            return WebViewUrlAction.OPEN_EXTERNAL_BROWSER
        }

        val exactSameOrigin = reqScheme == baseScheme && reqEffectivePort == baseEffectivePort
        val sameHostHttpsUpgrade =
            baseScheme == "http" &&
                reqScheme == "https" &&
                ((baseUri.port != -1 && reqUri.port == baseUri.port) || (baseUri.port == -1 && reqUri.port == -1))

        return if (exactSameOrigin || sameHostHttpsUpgrade) {
            WebViewUrlAction.LOAD_IN_WEBVIEW
        } else {
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER
        }
    }

    /**
     * Parses and validates `/health` JSON so unrelated port-3000 servers returning `{"status":"ok"}`
     * are not misidentified as Antigravity Remote Control instances.
     */
    fun parseHealthPayload(rawJson: String?, baseUrl: String, fallbackHost: String): DiscoveredServer? {
        if (rawJson.isNullOrBlank()) return null
        val trimmed = rawJson.trim()
        if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null

        fun readJsonString(key: String): String? {
            val m = Regex("\"${Regex.escape(key)}\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"").find(trimmed)
                ?: return null
            return m.groupValues[1].replace("\\\"", "\"").replace("\\\\", "\\")
        }

        fun readJsonBool(key: String): Boolean? {
            val m = Regex("\"${Regex.escape(key)}\"\\s*:\\s*(true|false)").find(trimmed)
                ?: return null
            return m.groupValues[1] == "true"
        }

        if (readJsonString("status") != "ok") return null

        val service = readJsonString("service")
        val hubFlag = readJsonBool("hubConnected")
        val cdpFlag = readJsonBool("cdpConnected")
        val isAntigravityService =
            service == "antigravity-remote-control" || hubFlag != null || cdpFlag != null
        if (!isAntigravityService) return null

        val hostname = readJsonString("hostname")?.takeIf { it.isNotBlank() } ?: fallbackHost
        val lsVersion = readJsonString("lsVersion")?.takeIf { it.isNotBlank() && it != "null" }
        val targetApp = readJsonString("targetApp")?.takeIf { it == "ide" || it == "antigravity" } ?: "antigravity"
        return DiscoveredServer(
            baseUrl = baseUrl,
            hostname = hostname,
            hubConnected = (hubFlag == true) || (cdpFlag == true),
            lsVersion = lsVersion,
            targetApp = targetApp
        )
    }

    private fun getLocalSubnets(): List<String> {
        val prefixes = LinkedHashSet<String>()
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces() ?: return emptyList()
            for (iface in interfaces) {
                if (!iface.isUp || iface.isLoopback) continue
                for (addr in iface.inetAddresses) {
                    if (addr is Inet4Address && !addr.isLoopbackAddress) {
                        val ip = addr.hostAddress ?: continue
                        if (isPrivateLanHost(ip)) {
                            val prefix = ip.substringBeforeLast(".")
                            prefixes.add(prefix)
                        }
                    }
                }
            }
        } catch (_: Exception) {
        }
        return prefixes.toList()
    }

    private val lanTrustSslFactory by lazy {
        val trustAll = arrayOf<TrustManager>(object : X509TrustManager {
            override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) = Unit
            override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) = Unit
            override fun getAcceptedIssuers(): Array<X509Certificate> = emptyArray()
        })
        SSLContext.getInstance("TLS").apply { init(null, trustAll, SecureRandom()) }.socketFactory
    }

    private fun probeHost(ip: String, port: Int): DiscoveredServer? {
        try {
            Socket().use { socket ->
                socket.connect(InetSocketAddress(ip, port), 550)
            }
        } catch (_: Exception) {
            return null
        }

        for (scheme in listOf("http", "https")) {
            try {
                val urlStr = "$scheme://$ip:$port/health"
                val conn = (URI(urlStr).toURL().openConnection() as HttpURLConnection).apply {
                    connectTimeout = 900
                    readTimeout = 900
                    requestMethod = "GET"
                    if (this is HttpsURLConnection && isPrivateLanHost(ip)) {
                        sslSocketFactory = lanTrustSslFactory
                        hostnameVerifier = HostnameVerifier { _, _ -> true }
                    }
                }
                if (conn.responseCode == 200) {
                    val body = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
                    val parsed = parseHealthPayload(body, "$scheme://$ip:$port", ip)
                    if (parsed != null) {
                        return parsed
                    }
                }
            } catch (_: Exception) {
            }
        }
        return null
    }

    suspend fun scanSubnetForServers(port: Int = 3000): List<DiscoveredServer> = withContext(Dispatchers.IO) {
        val candidateIps = LinkedHashSet<String>()
        candidateIps.add("10.0.2.2") // Android Emulator -> Host PC loopback
        for (prefix in getLocalSubnets()) {
            for (hostId in 1..254) {
                candidateIps.add("$prefix.$hostId")
            }
        }

        val semaphore = Semaphore(40)
        coroutineScope {
            candidateIps.map { ip ->
                async {
                    semaphore.withPermit {
                        probeHost(ip, port)
                    }
                }
            }.awaitAll().filterNotNull()
        }
    }
}
