package com.upirakshak

import android.content.Context
import android.webkit.JavascriptInterface

/**
 * RakshakJsInterface — bridges native Android code with the React web app.
 *
 * This interface is exposed to JavaScript via `window.RakshakAndroid` in the WebView.
 * It allows the web app to:
 * 1. Trigger the native overlay from JavaScript
 * 2. Receive analysis results from the native rules engine
 * 3. Access device-specific information (battery, network, etc.)
 */
class RakshakJsInterface(private val context: Context) {

    /**
     * Called from JavaScript to trigger the native overlay.
     *
     * @param threatLevel "HIGH", "MEDIUM", or "SAFE"
     * @param message The notification message text
     */
    @JavascriptInterface
    fun showOverlay(threatLevel: String, message: String) {
        val activity = context as? MainActivity
        activity?.showRakshakOverlay(threatLevel, message)
    }

    /**
     * Called from JavaScript to dismiss the overlay.
     */
    @JavascriptInterface
    fun dismissOverlay() {
        // Send intent to OverlayService to dismiss
        val intent = android.content.Intent(context, OverlayService::class.java).apply {
            action = "DISMISS"
        }
        context.startService(intent)
    }

    /**
     * Returns the device's battery level (0-100).
     */
    @JavascriptInterface
    fun getBatteryLevel(): Int {
        val ifilter = android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED)
        val batteryStatus = context.registerReceiver(null, ifilter)
        val level = batteryStatus?.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryStatus?.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1) ?: -1
        return if (level >= 0 && scale > 0) (level * 100 / scale) else -1
    }

    /**
     * Returns the app version name.
     */
    @JavascriptInterface
    fun getAppVersion(): String {
        return try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            pInfo.versionName ?: "1.0"
        } catch (e: Exception) {
            "1.0"
        }
    }

    /**
     * Returns true if the device is running Funtouch OS (iQOO/Vivo).
     */
    @JavascriptInterface
    fun isFuntouchOS(): Boolean {
        val fingerprint = android.os.Build.FINGERPRINT.lowercase()
        return fingerprint.contains("funtouch") ||
               fingerprint.contains("iqoo") ||
               fingerprint.contains("vivo")
    }

    /**
     * Returns the device manufacturer.
     */
    @JavascriptInterface
    fun getManufacturer(): String {
        return android.os.Build.MANUFACTURER
    }

    /**
     * Returns the device model.
     */
    @JavascriptInterface
    fun getModel(): String {
        return android.os.Build.MODEL
    }

    /**
     * Logs a message to Android Logcat for debugging.
     */
    @JavascriptInterface
    fun log(tag: String, message: String) {
        android.util.Log.i(tag, message)
    }
}
