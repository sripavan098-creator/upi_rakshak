package com.upirakshak.notification

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.upirakshak.R

/**
 * Guard service to keep the notification listener alive on aggressive ROMs like Funtouch/OriginOS
 * Runs as a foreground service with minimal battery impact
 */
class RakshakGuardService : Service() {
    
    companion object {
        private const val TAG = "RakshakGuard"
        private const val CHANNEL_ID = "rakshak_guard"
        private const val NOTIFICATION_ID = 1002
        
        fun start(context: Context) {
            val intent = Intent(context, RakshakGuardService::class.java)
            context.startForegroundService(intent)
        }
        
        fun stop(context: Context) {
            context.stopService(Intent(context, RakshakGuardService::class.java))
        }
    }
    
    private var wakeLock: PowerManager.WakeLock? = null
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Guard service created")
        
        // minSdkVersion is 26, so the notification channel API is always available.
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Rakshak Protection",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Keeps UPI Rakshak active in background"
            setShowBadge(false)
        }

        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)

        // Acquire partial wake lock to keep CPU running
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "Rakshak::GuardWakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(24 * 60 * 60 * 1000L) // 24 hours
        }
        
        // Start as foreground service
        startForeground(NOTIFICATION_ID, createNotification())
        
        Log.d(TAG, "Guard service started")
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Check if notification listener is still connected
        val isConnected = RakshakNotificationListener.isConnected.value
        
        if (!isConnected) {
            Log.w(TAG, "Notification listener disconnected - user may need to re-enable in settings")
        } else {
            Log.d(TAG, "Guard check: listener connected ✓")
        }
        
        // Return START_STICKY to restart if killed
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onDestroy() {
        Log.d(TAG, "Guard service destroyed")
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
        super.onDestroy()
    }
    
    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("UPI Rakshak")
            .setContentText("Protection active")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setShowWhen(false)
            .build()
    }
}
