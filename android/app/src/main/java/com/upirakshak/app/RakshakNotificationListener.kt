package com.upirakshak.app

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class RakshakNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "RakshakListener"

        // Apps to monitor
        private val MONITORED_PACKAGES = setOf(
            "com.whatsapp",
            "com.whatsapp.w4b",
            "com.google.android.apps.messaging",
            "com.android.mms",
            "org.telegram.messenger",
            "com.samsung.android.messaging"
        )
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "✓ Notification listener connected")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.i(TAG, "✗ Notification listener disconnected")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn ?: return

        // Only process notifications from monitored apps
        if (sbn.packageName !in MONITORED_PACKAGES) {
            return
        }

        // Skip our own notifications
        if (sbn.packageName == packageName) {
            return
        }

        val notification = sbn.notification ?: return
        val extras = notification.extras

        // Extract title and text
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""

        if (title.isBlank() && text.isBlank()) {
            return
        }

        Log.d(TAG, "Notification from ${sbn.packageName}: $title | $text")

        // Send to JavaScript via the plugin
        RakshakPlugin.emitNotification(title, text)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // Not used, but required override
    }
}
