package com.upirakshak

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)

        configureWebView()
        requestRuntimePermissions()
        ensureOverlayPermission()
        ensureNotificationAccess()
        subscribeToNativeEvents()

        webView.loadUrl("file:///android_asset/web/index.html")
    }

    private fun configureWebView() {
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true
        webView.settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(RakshakJsBridge(this), "RakshakNative")
    }

    private fun requestRuntimePermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    1001
                )
            }
        }
    }

    private fun ensureOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            startActivity(
                Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName")
                )
            )
        }
    }

    private fun ensureNotificationAccess() {
        val enabledListeners =
            Settings.Secure.getString(contentResolver, "enabled_notification_listeners") ?: ""

        if (!enabledListeners.contains(packageName)) {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }
    }

    private fun subscribeToNativeEvents() {
        RakshakBridge.onNativeEvent = { json ->
            runOnUiThread {
                val script =
                    "window.dispatchEvent(new CustomEvent('rakshak:native', { detail: $json }));"
                webView.evaluateJavascript(script, null)
            }
        }
    }

    override fun onDestroy() {
        RakshakBridge.onNativeEvent = null
        super.onDestroy()
    }
}
