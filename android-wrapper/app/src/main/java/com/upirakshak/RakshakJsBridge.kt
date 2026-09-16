package com.upirakshak

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.util.Log
import android.webkit.JavascriptInterface

class RakshakJsBridge(private val activity: MainActivity) {

    @JavascriptInterface
    fun log(message: String) {
        Log.d("RakshakJS", message)
    }

    @JavascriptInterface
    fun openOverlaySettings() {
        activity.runOnUiThread {
            activity.startActivity(
                Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${activity.packageName}")
                )
            )
        }
    }

    @JavascriptInterface
    fun openNotificationAccessSettings() {
        activity.runOnUiThread {
            activity.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }
    }
}
