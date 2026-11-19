package com.antigravity.remotecontrol

import android.Manifest
import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color as AndroidColor
import android.graphics.Rect
import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.ActionMode
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.SslErrorHandler
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import kotlinx.coroutines.launch
import java.net.URI

private val AgyBackground = Color(0xFF101010)
private val AgyCard = Color(0xFF191919)
private val AgyCardBorder = Color(0xFF282828)
private val AgySecondary = Color(0xFF242424)
private val AgyForeground = Color(0xFFECECEC)
private val AgyMuted = Color(0xFF808080)
private val AgyPrimary = Color(0xFF007ACC)
private val AgyAccent = Color(0xFF38BDF8)
private val AgySuccess = Color(0xFF7AAE66)
private val AgyError = Color(0xFFDE5555)

private val AntigravityColorScheme = darkColorScheme(
    background = AgyBackground,
    surface = AgyCard,
    primary = AgyPrimary,
    onPrimary = Color.White,
    onBackground = AgyForeground,
    onSurface = AgyForeground
)

class MainActivity : ComponentActivity() {

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var pendingWebPermissionRequest: PermissionRequest? = null
    private var activeWebView: WebView? = null
    private var returnToServerPickerCallback: (() -> Unit)? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.OpenMultipleDocuments()
    ) { uris: List<Uri> ->
        val callback = fileUploadCallback
        fileUploadCallback = null
        if (uris.isNotEmpty()) {
            callback?.onReceiveValue(uris.toTypedArray())
        } else {
            callback?.onReceiveValue(null)
        }
    }

    private val audioPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted: Boolean ->
        val req = pendingWebPermissionRequest
        pendingWebPermissionRequest = null
        if (granted && req != null) {
            req.grant(req.resources)
        } else {
            req?.deny()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = AndroidColor.parseColor("#101010")
        window.navigationBarColor = AndroidColor.parseColor("#101010")

        val prefs = getSharedPreferences("antigravity_remote_prefs", Context.MODE_PRIVATE)

        setContent {
            MaterialTheme(colorScheme = AntigravityColorScheme) {
                var currentTargetUrl by remember {
                    mutableStateOf(prefs.getString("active_server_url", null))
                }
                var currentSessionKey by remember {
                    mutableStateOf(prefs.getString("active_session_key", "") ?: "")
                }
                var recentServers by remember {
                    mutableStateOf(
                        (prefs.getStringSet("recent_servers", emptySet()) ?: emptySet()).toList()
                    )
                }

                returnToServerPickerCallback = {
                    runOnUiThread {
                        prefs.edit().remove("active_server_url").apply()
                        currentTargetUrl = null
                    }
                }

                if (currentTargetUrl == null) {
                    ConnectionHubScreen(
                        initialKey = currentSessionKey,
                        recentServers = recentServers,
                        onConnect = { baseUrl, key ->
                            val updatedRecents = (listOf(baseUrl) + recentServers).distinct().take(6)
                            recentServers = updatedRecents
                            currentSessionKey = key
                            prefs.edit()
                                .putString("active_server_url", baseUrl)
                                .putString("active_session_key", key)
                                .putStringSet("recent_servers", updatedRecents.toSet())
                                .apply()
                            currentTargetUrl = baseUrl
                        },
                        onPreviewOffline = {
                            currentTargetUrl = "file:///android_asset/www/index.html"
                        }
                    )
                } else {
                    RemoteSessionScreen(
                        targetUrl = currentTargetUrl!!,
                        sessionKey = currentSessionKey,
                        onUpdateSessionKey = { updatedKey ->
                            currentSessionKey = updatedKey
                            prefs.edit().putString("active_session_key", updatedKey).apply()
                        },
                        onSwitchServer = {
                            prefs.edit().remove("active_server_url").apply()
                            currentTargetUrl = null
                        }
                    )
                }
            }
        }
    }

    private fun applySystemBarAppearance(isLight: Boolean) {
        val barColor = AndroidColor.parseColor(if (isLight) "#F8F9FA" else "#101010")
        window.statusBarColor = barColor
        window.navigationBarColor = barColor
        WindowCompat.getInsetsController(window, window.decorView)?.apply {
            isAppearanceLightStatusBars = isLight
            isAppearanceLightNavigationBars = isLight
        }
    }

    @Composable
    private fun ConnectionHubScreen(
        initialKey: String,
        recentServers: List<String>,
        onConnect: (String, String) -> Unit,
        onPreviewOffline: () -> Unit
    ) {
        val scope = rememberCoroutineScope()
        var urlInput by remember { mutableStateOf(recentServers.firstOrNull() ?: "") }
        var keyInput by remember { mutableStateOf(initialKey) }
        var errorMessage by remember { mutableStateOf<String?>(null) }
        var isScanning by remember { mutableStateOf(false) }
        var discovered by remember { mutableStateOf<List<DiscoveredServer>>(emptyList()) }

        fun runScan() {
            if (isScanning) return
            isScanning = true
            scope.launch {
                try {
                    discovered = ServerDiscovery.scanSubnetForServers(3000)
                } finally {
                    isScanning = false
                }
            }
        }

        LaunchedEffect(Unit) {
            applySystemBarAppearance(false)
            runScan()
        }

        fun submitConnection() {
            val parsed = ServerDiscovery.parseServerInput(urlInput)
            if (parsed == null) {
                errorMessage = "Enter a valid PC IP (e.g. 192.168.1.15) or Tunnel URL."
                return
            }
            errorMessage = null
            val finalKey = parsed.extractedKey ?: keyInput.trim()
            onConnect(parsed.baseUrl, finalKey)
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(AgyBackground)
                .statusBarsPadding()
                .navigationBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Branding
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(AgyCard),
                    contentAlignment = Alignment.Center
                ) {
                    Text("✦", color = AgyAccent, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Antigravity Remote",
                            color = AgyForeground,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Box(
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(AgySecondary)
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "v6.0",
                                color = AgyAccent,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                    Text(
                        text = "Agentic Hub 2.33 · Swarm, Quota & IDE Mobile Client",
                        color = AgyMuted,
                        fontSize = 12.5.sp
                    )
                }
            }

            // Auto-Discovery Card
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = AgyCard,
                border = BorderStroke(1.dp, AgyCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Wi-Fi Auto-Discovery",
                            color = AgyForeground,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        OutlinedButton(
                            onClick = { runScan() },
                            enabled = !isScanning,
                            shape = CircleShape,
                            border = BorderStroke(1.dp, AgyCardBorder)
                        ) {
                            if (isScanning) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(14.dp),
                                    strokeWidth = 2.dp,
                                    color = AgyAccent
                                )
                                Spacer(Modifier.width(6.dp))
                                Text("Scanning…", fontSize = 12.sp, color = AgyForeground)
                            } else {
                                Text("Rescan LAN", fontSize = 12.sp, color = AgyForeground)
                            }
                        }
                    }

                    if (discovered.isEmpty() && !isScanning) {
                        Text(
                            text = "No PC detected on port 3000 yet. Start Remote Control on your PC or enter your URL below.",
                            color = AgyMuted,
                            fontSize = 12.5.sp,
                            lineHeight = 18.sp
                        )
                    }

                    discovered.forEach { srv ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = AgySecondary,
                            border = BorderStroke(1.dp, AgyCardBorder),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onConnect(srv.baseUrl, keyInput.trim()) }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(
                                    modifier = Modifier.weight(1f),
                                    verticalArrangement = Arrangement.spacedBy(2.dp)
                                ) {
                                    Text(
                                        text = srv.hostname,
                                        color = AgyForeground,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = srv.baseUrl,
                                        color = AgyMuted,
                                        fontSize = 11.5.sp,
                                        fontFamily = FontFamily.Monospace,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    if (srv.lsVersion != null || srv.targetApp == "ide") {
                                        Text(
                                            text = buildString {
                                                append("Hub v${srv.lsVersion ?: "?"}")
                                                if (srv.targetApp == "ide") append(" · IDE")
                                            },
                                            color = AgyMuted,
                                            fontSize = 11.sp,
                                            fontFamily = FontFamily.Monospace,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                }
                                Text(
                                    text = if (srv.hubConnected) "● Live" else "Connect →",
                                    color = if (srv.hubConnected) AgySuccess else AgyAccent,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }

            // Manual Connection Card
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = AgyCard,
                border = BorderStroke(1.dp, AgyCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Connect by IP or Tunnel URL",
                        color = AgyForeground,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    OutlinedTextField(
                        value = urlInput,
                        onValueChange = { urlInput = it },
                        label = { Text("PC IP or Cloudflare / Ngrok URL") },
                        placeholder = { Text("192.168.1.20:3000 or https://...trycloudflare.com") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AgyPrimary,
                            unfocusedBorderColor = AgyCardBorder,
                            focusedTextColor = AgyForeground,
                            unfocusedTextColor = AgyForeground
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = keyInput,
                        onValueChange = { keyInput = it },
                        label = { Text("Session Passcode (Remote Tunnel only)") },
                        placeholder = { Text("Optional on same Wi-Fi") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { submitConnection() }),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AgyPrimary,
                            unfocusedBorderColor = AgyCardBorder,
                            focusedTextColor = AgyForeground,
                            unfocusedTextColor = AgyForeground
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (errorMessage != null) {
                        Text(text = errorMessage!!, color = AgyError, fontSize = 12.5.sp)
                    }

                    Button(
                        onClick = { submitConnection() },
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AgyForeground,
                            contentColor = AgyBackground
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                    ) {
                        Text("Connect to Antigravity Hub", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    }
                }
            }

            // Recent Servers
            if (recentServers.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = AgyCard,
                    border = BorderStroke(1.dp, AgyCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Recent Endpoints",
                            color = AgyMuted,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        recentServers.forEach { srvUrl ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(AgySecondary)
                                    .clickable { onConnect(srvUrl, keyInput.trim()) }
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = srvUrl,
                                    color = AgyForeground,
                                    fontSize = 12.5.sp,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.weight(1f)
                                )
                                Text("Open →", color = AgyAccent, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // Offline UI Preview
            OutlinedButton(
                onClick = onPreviewOffline,
                shape = CircleShape,
                border = BorderStroke(1.dp, AgyCardBorder),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(42.dp)
            ) {
                Text("Preview Antigravity 2.33 Mobile UI Offline", color = AgyMuted, fontSize = 12.5.sp)
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Composable
    private fun RemoteSessionScreen(
        targetUrl: String,
        sessionKey: String,
        onUpdateSessionKey: (String) -> Unit,
        onSwitchServer: () -> Unit
    ) {
        var loadError by remember(targetUrl) { mutableStateOf<String?>(null) }
        var isLightTheme by remember(targetUrl) { mutableStateOf(false) }
        val sessionBgColor = if (isLightTheme) Color(0xFFF8F9FA) else AgyBackground
        val latestTargetUrl by rememberUpdatedState(targetUrl)

        DisposableEffect(targetUrl) {
            onDispose {
                applySystemBarAppearance(false)
                val wv = activeWebView
                activeWebView = null
                wv?.apply {
                    stopLoading()
                    loadUrl("about:blank")
                    removeAllViews()
                    destroy()
                }
            }
        }

        val fullEntryUrl = remember(targetUrl, sessionKey) {
            if (targetUrl.startsWith("file://") || sessionKey.isBlank()) {
                targetUrl
            } else {
                val sep = if (targetUrl.contains("?")) "&" else "?"
                "$targetUrl${sep}key=${Uri.encode(sessionKey)}"
            }
        }

        BackHandler {
            val wv = activeWebView
            if (wv != null) {
                wv.evaluateJavascript("(window.__handleAndroidBack && window.__handleAndroidBack()) ? 'handled' : 'unhandled'") { res ->
                    if (res?.contains("handled") == true) {
                        return@evaluateJavascript
                    }
                    if (wv.canGoBack()) {
                        wv.goBack()
                    } else {
                        onSwitchServer()
                    }
                }
            } else {
                onSwitchServer()
            }
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(sessionBgColor)
                .statusBarsPadding()
                .navigationBarsPadding()
                .imePadding()
        ) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    QuotableWebView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        setBackgroundColor(AndroidColor.parseColor("#101010"))

                        CookieManager.getInstance().setAcceptCookie(true)
                        CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)

                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            databaseEnabled = true
                            mediaPlaybackRequiresUserGesture = false
                            setSupportMultipleWindows(false)
                            allowFileAccess = targetUrl.startsWith("file:///android_asset/")
                            allowContentAccess = true
                            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                            cacheMode = WebSettings.LOAD_DEFAULT
                            userAgentString = "$userAgentString AntigravityRemoteAndroid/6.0"
                        }

                        addJavascriptInterface(
                            AndroidJsBridge(
                                context = ctx,
                                sessionKey = sessionKey,
                                onUpdateSessionKey = onUpdateSessionKey,
                                onThemeChanged = { isLight -> isLightTheme = isLight }
                            ),
                            "AndroidBridge"
                        )

                        webViewClient = object : WebViewClient() {
                            override fun shouldOverrideUrlLoading(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): Boolean {
                                return handleWebViewUrlOverride(
                                    url = request?.url?.toString(),
                                    activeBaseUrl = latestTargetUrl,
                                    isForMainFrame = request?.isForMainFrame ?: true,
                                    hasUserGesture = request?.hasGesture() ?: true
                                )
                            }

                            @Deprecated("Deprecated in Java")
                            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                                return handleWebViewUrlOverride(url, latestTargetUrl)
                            }

                            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                                super.onPageStarted(view, url, favicon)
                                loadError = null
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                CookieManager.getInstance().flush()
                            }

                            @SuppressLint("WebViewClientOnReceivedSslError")
                            override fun onReceivedSslError(
                                view: WebView?,
                                handler: SslErrorHandler?,
                                error: SslError?
                            ) {
                                val host = try { URI(error?.url ?: "").host } catch (_: Exception) { null }
                                // Allow self-signed generate_ssl.js certs ONLY on private LAN IPs
                                if (ServerDiscovery.isPrivateLanHost(host)) {
                                    handler?.proceed()
                                } else {
                                    handler?.cancel()
                                }
                            }

                            override fun onReceivedError(
                                view: WebView?,
                                request: WebResourceRequest?,
                                error: WebResourceError?
                            ) {
                                if (request?.isForMainFrame == true) {
                                    loadError = error?.description?.toString() ?: "Unable to reach Antigravity server"
                                }
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onShowFileChooser(
                                webView: WebView?,
                                filePathCallback: ValueCallback<Array<Uri>>?,
                                fileChooserParams: FileChooserParams?
                            ): Boolean {
                                fileUploadCallback?.onReceiveValue(null)
                                fileUploadCallback = filePathCallback
                                return try {
                                    fileChooserLauncher.launch(arrayOf("*/*"))
                                    true
                                } catch (_: Exception) {
                                    fileUploadCallback = null
                                    false
                                }
                            }

                            override fun onPermissionRequest(request: PermissionRequest?) {
                                if (request == null) return
                                val wantsAudio = request.resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
                                if (wantsAudio) {
                                    val hasPerm = ContextCompat.checkSelfPermission(
                                        this@MainActivity,
                                        Manifest.permission.RECORD_AUDIO
                                    ) == PackageManager.PERMISSION_GRANTED
                                    if (hasPerm) {
                                        request.grant(request.resources)
                                    } else {
                                        pendingWebPermissionRequest = request
                                        audioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                    }
                                } else {
                                    request.deny()
                                }
                            }
                        }

                        activeWebView = this
                        loadUrl(fullEntryUrl)
                    }
                },
                update = { view ->
                    activeWebView = view
                }
            )

            if (loadError != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(AgyBackground)
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = AgyCard,
                        border = BorderStroke(1.dp, AgyCardBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(22.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = "Server Unreachable",
                                color = AgyForeground,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "$targetUrl\n${loadError ?: ""}",
                                color = AgyMuted,
                                fontSize = 12.5.sp
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                OutlinedButton(
                                    onClick = onSwitchServer,
                                    shape = CircleShape,
                                    border = BorderStroke(1.dp, AgyCardBorder)
                                ) {
                                    Text("Switch Server", color = AgyForeground)
                                }
                                Button(
                                    onClick = {
                                        loadError = null
                                        val currentUrl = activeWebView?.url
                                        if (currentUrl.isNullOrBlank() || currentUrl == "about:blank") {
                                            activeWebView?.loadUrl(fullEntryUrl)
                                        } else {
                                            activeWebView?.reload()
                                        }
                                    },
                                    shape = CircleShape,
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = AgyForeground,
                                        contentColor = AgyBackground
                                    )
                                ) {
                                    Text("Retry")
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private fun handleWebViewUrlOverride(
        url: String?,
        activeBaseUrl: String,
        isForMainFrame: Boolean = true,
        hasUserGesture: Boolean = true
    ): Boolean {
        return when (
            ServerDiscovery.classifyWebViewNavigation(
                requestUrl = url,
                activeTargetUrl = activeBaseUrl,
                isForMainFrame = isForMainFrame,
                hasUserGesture = hasUserGesture
            )
        ) {
            WebViewUrlAction.LOAD_IN_WEBVIEW -> false
            WebViewUrlAction.OPEN_EXTERNAL_BROWSER -> {
                if (!url.isNullOrBlank()) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url.trim())).apply {
                            addCategory(Intent.CATEGORY_BROWSABLE)
                        }
                        startActivity(intent)
                    } catch (_: Exception) {
                        Toast.makeText(this, "Unable to open external link", Toast.LENGTH_SHORT).show()
                    }
                }
                true
            }
            WebViewUrlAction.OPEN_SWARM_UI -> {
                val safeUrl = (url ?: "")
                    .replace("\\", "\\\\")
                    .replace("'", "\\'")
                    .replace("\n", "")
                    .replace("\r", "")
                    .replace("\u2028", "")
                    .replace("\u2029", "")
                activeWebView?.evaluateJavascript(
                    "window.__openSwarmUiFromNative && window.__openSwarmUiFromNative('$safeUrl')",
                    null
                )
                true
            }
            WebViewUrlAction.COPY_WORKSPACE_FILE_PATH -> {
                val raw = (url ?: "").trim()
                    .replace(Regex("^file:///+", RegexOption.IGNORE_CASE), "")
                    .replace(Regex("^file://", RegexOption.IGNORE_CASE), "")
                val decoded = try { Uri.decode(raw) } catch (_: Exception) { raw }
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
                clipboard?.setPrimaryClip(ClipData.newPlainText("Workspace Path", decoded))
                Toast.makeText(this, "Copied workspace file path", Toast.LENGTH_SHORT).show()
                true
            }
            WebViewUrlAction.BLOCK -> true
        }
    }

    private inner class AndroidJsBridge(
        private val context: Context,
        @Volatile private var sessionKey: String,
        private val onUpdateSessionKey: (String) -> Unit,
        private val onThemeChanged: (Boolean) -> Unit
    ) {
        @JavascriptInterface
        fun isNativeApp(): Boolean = true

        @JavascriptInterface
        fun getSessionKey(): String = sessionKey

        @JavascriptInterface
        fun setSessionKey(newKey: String) {
            sessionKey = newKey
            runOnUiThread {
                onUpdateSessionKey(newKey)
            }
        }

        @JavascriptInterface
        fun openServerPicker() {
            returnToServerPickerCallback?.invoke()
        }

        @JavascriptInterface
        fun copyText(text: String) {
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
            clipboard?.setPrimaryClip(ClipData.newPlainText("Antigravity", text))
        }

        @JavascriptInterface
        fun setTheme(theme: String) {
            runOnUiThread {
                val isLight = theme == "light"
                onThemeChanged(isLight)
                applySystemBarAppearance(isLight)
                activeWebView?.setBackgroundColor(
                    AndroidColor.parseColor(if (isLight) "#F8F9FA" else "#101010")
                )
            }
        }

        @Suppress("DEPRECATION")
        @JavascriptInterface
        fun haptic(type: String) {
            try {
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
                val duration = when (type) {
                    "medium" -> 18L
                    "success" -> 26L
                    else -> 8L
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    vibrator.vibrate(duration)
                }
            } catch (_: Exception) {
            }
        }
    }

    /**
     * Custom WebView that injects native "❝ Quote" and "💬 /btw" actions directly into
     * Android's floating OS text-selection ActionMode bar across all OEM skins.
     */
    private class QuotableWebView(context: Context) : WebView(context) {
        companion object {
            private const val MENU_ID_QUOTE = 0x414701
            private const val MENU_ID_BTW = 0x414702
        }

        override fun startActionMode(callback: ActionMode.Callback?): ActionMode? {
            return super.startActionMode(callback?.let { wrapCallback(it) })
        }

        override fun startActionMode(callback: ActionMode.Callback?, type: Int): ActionMode? {
            return super.startActionMode(callback?.let { wrapCallback(it) }, type)
        }

        private fun wrapCallback(delegate: ActionMode.Callback): ActionMode.Callback {
            return object : ActionMode.Callback2() {
                private fun injectQuoteMenuItems(menu: Menu?) {
                    if (menu == null) return
                    if (menu.findItem(MENU_ID_QUOTE) == null) {
                        menu.add(Menu.NONE, MENU_ID_QUOTE, 0, "❝ Quote")
                            .setShowAsActionFlags(MenuItem.SHOW_AS_ACTION_ALWAYS or MenuItem.SHOW_AS_ACTION_WITH_TEXT)
                    }
                    if (menu.findItem(MENU_ID_BTW) == null) {
                        menu.add(Menu.NONE, MENU_ID_BTW, 1, "💬 /btw")
                            .setShowAsActionFlags(MenuItem.SHOW_AS_ACTION_IF_ROOM or MenuItem.SHOW_AS_ACTION_WITH_TEXT)
                    }
                }

                override fun onCreateActionMode(mode: ActionMode?, menu: Menu?): Boolean {
                    val created = delegate.onCreateActionMode(mode, menu)
                    if (created) injectQuoteMenuItems(menu)
                    return created
                }

                override fun onPrepareActionMode(mode: ActionMode?, menu: Menu?): Boolean {
                    val prepared = delegate.onPrepareActionMode(mode, menu)
                    injectQuoteMenuItems(menu)
                    return prepared
                }

                override fun onActionItemClicked(mode: ActionMode?, item: MenuItem?): Boolean {
                    return when (item?.itemId) {
                        MENU_ID_QUOTE -> {
                            evaluateJavascript(
                                "(window.__quoteNativeSelection && window.__quoteNativeSelection('quote'))",
                                null
                            )
                            mode?.finish()
                            true
                        }
                        MENU_ID_BTW -> {
                            evaluateJavascript(
                                "(window.__quoteNativeSelection && window.__quoteNativeSelection('btw'))",
                                null
                            )
                            mode?.finish()
                            true
                        }
                        else -> delegate.onActionItemClicked(mode, item)
                    }
                }

                override fun onDestroyActionMode(mode: ActionMode?) {
                    delegate.onDestroyActionMode(mode)
                }

                override fun onGetContentRect(mode: ActionMode?, view: View?, outRect: Rect?) {
                    if (delegate is ActionMode.Callback2) {
                        delegate.onGetContentRect(mode, view, outRect)
                    } else {
                        super.onGetContentRect(mode, view, outRect)
                    }
                }
            }
        }
    }
}
