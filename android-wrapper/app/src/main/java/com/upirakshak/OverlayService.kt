package com.upirakshak

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat

/**
 * OverlayService — shows a system-level warning banner over the scam notification.
 *
 * Uses TYPE_APPLICATION_OVERLAY to display a red warning banner at the top of
 * the screen, visible even when the user is in another app (WhatsApp, SMS, etc.).
 *
 * The overlay auto-dismisses after 8 seconds or on tap.
 */
class OverlayService : Service() {

    companion object {
        private const val CHANNEL_ID = "rakshak_overlay"
        private const val NOTIFICATION_ID = 1001
        private const val AUTO_DISMISS_MS = 8000L
    }

    private var windowManager: WindowManager? = null
    private var overlayView: FrameLayout? = null
    private val handler = Handler(Looper.getMainLooper())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Show foreground notification (required for foreground service)
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("UPI Rakshak Active")
            .setContentText("Protecting you from scams")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        // Show the overlay
        val threatLevel = intent?.getStringExtra("threat_level") ?: "HIGH"
        val message = intent?.getStringExtra("message") ?: ""
        val reasons = intent?.getStringExtra("reasons")?.split("|") ?: emptyList()
        val officialRoute = intent?.getStringExtra("official_route") ?: ""

        showOverlay(threatLevel, message, reasons, officialRoute)

        return START_NOT_STICKY
    }

    /**
     * Create the overlay view and add it to the window.
     */
    private fun showOverlay(
        threatLevel: String,
        message: String,
        reasons: List<String>,
        officialRoute: String
    ) {
        if (overlayView != null) return // Already showing

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP
            y = 0
        }

        // Build the overlay view
        overlayView = FrameLayout(this).apply {
            setBackgroundColor(Color.TRANSPARENT)
            setPadding(16, 16, 16, 16)

            // Red warning card
            val card = LinearLayout(this@OverlayService).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#B91C1C"))
                setPadding(32, 24, 32, 24)
                elevation = 16f

                // Set corner radius via background drawable
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    background = android.graphics.drawable.GradientDrawable().apply {
                        setColor(Color.parseColor("#B91C1C"))
                        cornerRadius = 24f
                    }
                }
            }

            // Warning icon + title
            val titleView = TextView(this@OverlayService).apply {
                text = "⚠️ RAKSHAK ALERT: FRAUD HO SAKTA HAI!"
                setTextColor(Color.WHITE)
                textSize = 16f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
            }
            card.addView(titleView)

            // Message preview
            val messageView = TextView(this@OverlayService).apply {
                text = if (message.length > 100) message.take(100) + "…" else message
                setTextColor(Color.parseColor("#FEE2E2"))
                textSize = 13f
                setPadding(0, 12, 0, 0)
            }
            card.addView(messageView)

            // Reasons
            if (reasons.isNotEmpty()) {
                val reasonsView = TextView(this@OverlayService).apply {
                    text = "🚩 " + reasons.joinToString("\n🚩 ")
                    setTextColor(Color.parseColor("#FECACA"))
                    textSize = 12f
                    setPadding(0, 12, 0, 0)
                }
                card.addView(reasonsView)
            }

            // Official route
            if (officialRoute.isNotEmpty()) {
                val routeView = TextView(this@OverlayService).apply {
                    text = "✓ Safe Action: $officialRoute"
                    setTextColor(Color.parseColor("#86EFAC"))
                    textSize = 12f
                    setTypeface(typeface, android.graphics.Typeface.BOLD)
                    setPadding(0, 16, 0, 0)
                }
                card.addView(routeView)
            }

            // Tap hint
            val tapView = TextView(this@OverlayService).apply {
                text = "Tap to dismiss"
                setTextColor(Color.parseColor("#FCA5A5"))
                textSize = 10f
                setPadding(0, 12, 0, 0)
            }
            card.addView(tapView)

            addView(card, LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ))

            // Tap to dismiss
            setOnClickListener {
                dismissOverlay()
            }
        }

        windowManager?.addView(overlayView, params)

        // Auto-dismiss after 8 seconds
        handler.postDelayed({
            dismissOverlay()
        }, AUTO_DISMISS_MS)
    }

    /**
     * Remove the overlay from the screen.
     */
    private fun dismissOverlay() {
        handler.removeCallbacksAndMessages(null)
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                // View may already be removed
            }
        }
        overlayView = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        dismissOverlay()
    }

    /**
     * Create the notification channel for the foreground service.
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Rakshak Protection",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows when Rakshak is actively protecting you"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
