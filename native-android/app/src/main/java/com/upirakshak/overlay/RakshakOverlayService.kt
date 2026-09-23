package com.upirakshak.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import com.upirakshak.MainActivity
import com.upirakshak.R
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel

class RakshakOverlayService : Service() {
    
    companion object {
        private const val TAG = "RakshakOverlay"
        private const val CHANNEL_ID = "rakshak_alerts"
        private const val NOTIFICATION_ID = 1
        
        private var instance: RakshakOverlayService? = null
        
        fun show(context: Context, analysis: ThreatAnalysis) {
            val intent = Intent(context, RakshakOverlayService::class.java).apply {
                putExtra("message", analysis.reasons.firstOrNull() ?: "Suspicious message detected")
                putExtra("level", analysis.level.name)
                putExtra("officialRoute", analysis.officialRoute ?: "")
            }
            
            context.startForegroundService(intent)
        }
        
        fun hide() {
            instance?.hideOverlay()
        }
    }
    
    private var windowManager: WindowManager? = null
    private var overlayView: LinearLayout? = null
    private val handler = Handler(Looper.getMainLooper())
    private val hideRunnable = Runnable { hideOverlay() }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onCreate() {
        super.onCreate()
        instance = this
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Start as foreground service
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        
        // Show overlay
        val message = intent?.getStringExtra("message") ?: "Suspicious message detected"
        val level = intent?.getStringExtra("level") ?: "MEDIUM"
        val officialRoute = intent?.getStringExtra("officialRoute") ?: ""
        
        showOverlay(message, level, officialRoute)
        
        return START_NOT_STICKY
    }
    
    private fun showOverlay(message: String, level: String, officialRoute: String) {
        // Remove existing overlay if any
        hideOverlay()
        
        // Severity drives the banner colour: critical threats read red, softer
        // advisories read amber so the user can tell them apart at a glance.
        val severity = runCatching { ThreatLevel.valueOf(level) }.getOrDefault(ThreatLevel.MEDIUM)
        val bannerColor = when (severity) {
            ThreatLevel.HIGH -> "#DC2626"
            ThreatLevel.MEDIUM -> "#B45309"
            ThreatLevel.SAFE -> "#15803D"
        }
        val header = when (severity) {
            ThreatLevel.HIGH -> "⚠️ Rakshak Alert"
            ThreatLevel.MEDIUM -> "⚠️ Rakshak: Check before paying"
            ThreatLevel.SAFE -> "✓ Rakshak: Looks safe"
        }

        // Create overlay layout
        overlayView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor(bannerColor))
            setPadding(48, 32, 48, 32)
            elevation = 16f
            
            // Title
            addView(TextView(context).apply {
                text = context.getString(R.string.overlay_alert_title)
                text = header
                setTextColor(Color.WHITE)
                textSize = 20f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
            })
            
            // Message
            addView(TextView(context).apply {
                text = message
                setTextColor(Color.WHITE)
                textSize = 14f
                setPadding(0, 16, 0, 0)
            })
            
            // Official route
            if (officialRoute.isNotEmpty()) {
                addView(TextView(context).apply {
                    text = "✓ $officialRoute"
                    setTextColor(Color.parseColor("#86EFAC"))
                    textSize = 12f
                    setPadding(0, 12, 0, 0)
                })
            }
            
            // Tap hint
            addView(TextView(context).apply {
                text = context.getString(R.string.overlay_tap_details)
                setTextColor(Color.WHITE)
                textSize = 12f
                alpha = 0.7f
                setPadding(0, 16, 0, 0)
            })
            
            // Make clickable to open app
            setOnClickListener {
                val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                launchIntent?.let { 
                    it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    startActivity(it)
                }
                hideOverlay()
            }
        }
        
        // Layout params
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP
            y = 80
        }
        
        try {
            windowManager?.addView(overlayView, params)
            
            // Auto-hide after 8 seconds
            handler.postDelayed(hideRunnable, 8000)
            
            Log.i(TAG, "Overlay shown: $message")
        } catch (e: SecurityException) {
            Log.e(TAG, "Overlay permission not granted", e)
            stopSelf()
        }
    }
    
    private fun hideOverlay() {
        handler.removeCallbacks(hideRunnable)
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                Log.e(TAG, "Error removing overlay", e)
            }
        }
        overlayView = null
    }
    
    override fun onDestroy() {
        hideOverlay()
        instance = null
        super.onDestroy()
    }
    
    private fun createNotificationChannel() {
        // minSdkVersion is 26, so the notification channel API is always available.
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Rakshak Alerts",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Alerts from UPI Rakshak"
        }

        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
    
    private fun createNotification(): Notification {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.overlay_notification_text))
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.overlay_notification_text))
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .build()
        }
        return Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("UPI Rakshak")
            .setContentText("Monitoring for scams")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .build()
    }
}