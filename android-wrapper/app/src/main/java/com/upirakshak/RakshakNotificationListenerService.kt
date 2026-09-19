package com.upirakshak

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray
import org.json.JSONObject

class RakshakNotificationListenerService : NotificationListenerService() {

    private val monitoredPackages = setOf(
        "com.whatsapp",
        "com.whatsapp.w4b",
        "org.telegram.messenger",
        "com.google.android.apps.messaging",
        "com.samsung.android.messaging",
        "com.android.mms"
    )

    private val lastShownAt = mutableMapOf<String, Long>()

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (!monitoredPackages.contains(sbn.packageName)) return

        val extras = sbn.notification.extras

        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()

        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            ?: extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
            ?: extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES)
                ?.joinToString(" ") { it.toString() }
            ?: ""

        val fullMessage = listOf(title, text)
            .filter { it.isNotBlank() }
            .joinToString(" - ")

        if (fullMessage.isBlank()) return

        val result = RakshakRulesEngine.analyze(fullMessage)

        // Emit notification to Capacitor plugin
        RakshakPlugin.emitNotification(title, text)

        // Show overlay if critical threat detected
        if (result.isCritical && canShowOverlay(sbn.key)) {
            RakshakOverlayService.startWithThreat(this, fullMessage, result)
        }
    }

    private fun canShowOverlay(notificationKey: String): Boolean {
        val now = System.currentTimeMillis()
        val last = lastShownAt[notificationKey] ?: 0L

        if (now - last < 5000) return false

        lastShownAt[notificationKey] = now
        return true
    }
}
