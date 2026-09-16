package com.upirakshak.notification

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class RakshakNotificationListener : NotificationListenerService() {
    
    companion object {
        private const val TAG = "RakshakListener"
        
        private val _isConnected = MutableStateFlow(false)
        val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()
        
        private val MONITORED_PACKAGES = setOf(
            "com.whatsapp",
            "com.whatsapp.w4b",
            "com.google.android.apps.messaging",
            "org.telegram.messenger",
            "com.samsung.android.messaging",
            "com.android.mms"
        )
    }
    
    override fun onListenerConnected() {
        super.onListenerConnected()
        _isConnected.value = true
        Log.i(TAG, "✓ Notification listener connected")
    }
    
    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        _isConnected.value = false
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
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            ?: extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
            ?: ""
        
        if (title.isBlank() && text.isBlank()) {
            return
        }
        
        Log.d(TAG, "Notification from ${sbn.packageName}: $title | $text")
        
        // Process the notification
        NotificationProcessor.process(title, text, sbn.packageName)
    }
    
    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // Not used, but required override
    }
}
