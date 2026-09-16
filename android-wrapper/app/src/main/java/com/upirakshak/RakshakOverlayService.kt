package com.upirakshak

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView

class RakshakOverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null

    private val handler = Handler(Looper.getMainLooper())
    private val hideRunnable = Runnable { removeOverlayAndStop() }

    companion object {
        private const val CHANNEL_ID = "rakshak_overlay"
        private const val NOTIFICATION_ID = 101

        private const val EXTRA_MESSAGE = "extra_message"
        private const val EXTRA_SCORE = "extra_score"
        private const val EXTRA_REASONS = "extra_reasons"

        fun startWithThreat(context: Context, message: String, result: ThreatResult) {
            val intent = Intent(context, RakshakOverlayService::class.java)
                .putExtra(EXTRA_MESSAGE, message)
                .putExtra(EXTRA_SCORE, result.score)
                .putExtra(EXTRA_REASONS, result.reasons.toTypedArray())

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, buildForegroundNotification())

        val message = intent?.getStringExtra(EXTRA_MESSAGE)
            ?: "Possible UPI fraud detected"

        val score = intent?.getIntExtra(EXTRA_SCORE, 0) ?: 0

        val reasons = intent?.getStringArrayExtra(EXTRA_REASONS)
            ?.joinToString(" • ")
            ?: ""

        showOverlay(message, score, reasons)

        return START_NOT_STICKY
    }

    private fun showOverlay(message: String, score: Int, reasons: String) {
        removeOverlayOnly()
        handler.removeCallbacks(hideRunnable)

        val view = LayoutInflater.from(this).inflate(R.layout.overlay_rakshak, null)

        view.findViewById<TextView>(R.id.tvMessage).text = message

        val reasonText = if (reasons.isBlank()) {
            "Threat score: $score"
        } else {
            "Threat score: $score\n$reasons"
        }

        view.findViewById<TextView>(R.id.tvReason).text = reasonText

        view.findViewById<Button>(R.id.btnDismiss).setOnClickListener {
            removeOverlayAndStop()
        }

        view.findViewById<Button>(R.id.btnReview).setOnClickListener {
            openMainActivity()
            removeOverlayAndStop()
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        params.gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
        params.y = 32

        overlayView = view

        try {
            windowManager.addView(view, params)
            handler.postDelayed(hideRunnable, 7000)
        } catch (e: Exception) {
            stopSelf()
        }
    }

    private fun removeOverlayOnly() {
        overlayView?.let { view ->
            handler.removeCallbacks(hideRunnable)
            try {
                windowManager.removeView(view)
            } catch (ignored: Exception) {
            }
            overlayView = null
        }
    }

    private fun removeOverlayAndStop() {
        removeOverlayOnly()
        stopSelf()
    }

    private fun openMainActivity() {
        packageManager.getLaunchIntentForPackage(packageName)?.let { intent ->
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "UPI Rakshak Protection",
                NotificationManager.IMPORTANCE_LOW
            )

            channel.description = "Keeps UPI Rakshak active in background"

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("UPI Rakshak")
            .setContentText("Monitoring for UPI fraud on-device")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        removeOverlayOnly()
        super.onDestroy()
    }
}
