package com.upirakshak

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

/**
 * MainActivity — WebView host for the UPI Rakshak React app.
 *
 * Loads the built React app from ../dist/ (copied into assets/ at build time)
 * and exposes a JavaScript interface so the NotificationListenerService can
 * call into the web UI to analyze notifications in real-time.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var jsInterface: RakshakJsInterface

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Check permissions on first launch
        if (!hasRequiredPermissions()) {
            showPermissionDialog()
            return
        }

        setupWebView()
        setContentView(webView)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    /**
     * Check if all required permissions are granted.
     */
    private fun hasRequiredPermissions(): Boolean {
        // Check notification listener permission
        val enabledListeners = Settings.Secure.getString(
            contentResolver,
            "enabled_notification_listeners"
        )
        val hasNotificationAccess = enabledListeners?.contains(packageName) == true

        // Check overlay permission
        val hasOverlayPermission = Settings.canDrawOverlays(this)

        return hasNotificationAccess && hasOverlayPermission
    }

    /**
     * Show a dialog explaining required permissions.
     */
    private fun showPermissionDialog() {
        AlertDialog.Builder(this)
            .setTitle("UPI Rakshak — Permissions Required")
            .setMessage(
                """
                To protect you from UPI scams, Rakshak needs two permissions:

                1. Notification Access — to read incoming WhatsApp/SMS messages
                2. Display Over Other Apps — to show warning overlays

                You'll be guided through both setup screens next.
                """.trimIndent()
            )
            .setCancelable(false)
            .setPositiveButton("Continue") { _, _ ->
                requestNotificationAccess()
            }
            .show()
    }

    /**
     * Guide user to enable notification listener access.
     */
    private fun requestNotificationAccess() {
        Toast.makeText(
            this,
            "Enable UPI Rakshak in Notification Access, then come back",
            Toast.LENGTH_LONG
        ).show()

        startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))

        // After returning, check overlay permission
        webView = createWebView()
        setContentView(webView)

        // Poll for permission grant
        webView.postDelayed({
            if (!hasRequiredPermissions()) {
                requestOverlayPermission()
            } else {
                Toast.makeText(this, "✓ Rakshak is now active!", Toast.LENGTH_SHORT).show()
                loadRakshakApp()
            }
        }, 500)
    }

    /**
     * Guide user to enable overlay permission.
     */
    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Toast.makeText(
                this,
                "Enable 'Display over other apps' for UPI Rakshak",
                Toast.LENGTH_LONG
            ).show()

            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivity(intent)
        }
    }

    /**
     * Create and configure the WebView.
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(): WebView {
        return WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            webViewClient = WebViewClient()

            // Expose JS interface for notification analysis
            jsInterface = RakshakJsInterface(this@MainActivity)
            addJavascriptInterface(jsInterface, "RakshakAndroid")
        }
    }

    /**
     * Set up the WebView with the JS interface.
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView = createWebView()
    }

    /**
     * Load the Rakshak React app.
     *
     * In production, the built React app (from ../dist/) is copied into
     * src/main/assets/ at build time. For development, you can load from
     * a local dev server instead.
     */
    private fun loadRakshakApp() {
        // Production: load from assets
        webView.loadUrl("file:///android_asset/index.html")

        // Development: load from local dev server
        // webView.loadUrl("http://10.0.2.2:5173")
    }

    /**
     * Called from RakshakNotificationListener when a suspicious notification
     * is detected. Triggers the overlay via the JS interface.
     */
    fun showRakshakOverlay(threatLevel: String, message: String) {
        runOnUiThread {
            // Call into the web UI to trigger the overlay
            webView.evaluateJavascript(
                "window.RakshakAnalyze && window.RakshakAnalyze('$threatLevel', '$message')",
                null
            )

            // Also show the native overlay
            val intent = Intent(this, OverlayService::class.java).apply {
                putExtra("threat_level", threatLevel)
                putExtra("message", message)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }
        }
    }
}
