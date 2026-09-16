package com.upirakshak.app

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
import android.widget.LinearLayout
import android.widget.TextView

class RakshakOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: LinearLayout? = null
    private val handler = Handler(Looper.getMainLooper())
    private val hideRunnable = Runnable { hideOverlay() }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "HIDE" -> hideOverlay()
            else -> {
                val message = intent?.getStringExtra("message") ?: "Suspicious message detected"
                val level = intent?.getStringExtra("level") ?: "HIGH"
                val officialRoute = intent?.getStringExtra("officialRoute") ?: ""
                showOverlay(message, level, officialRoute)
            }
        }
        return START_NOT_STICKY
    }

    private fun showOverlay(message: String, level: String, officialRoute: String) {
        // Remove existing overlay if any
        hideOverlay()

        // Create overlay layout
        overlayView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#DC2626")) // Red
            setPadding(48, 32, 48, 32)
            elevation = 16f

            // Title
            addView(TextView(context).apply {
                text = "⚠️ Rakshak Alert"
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

            // Official route (if available)
            if (officialRoute.isNotEmpty()) {
                addView(TextView(context).apply {
                    text = "✓ $officialRoute"
                    setTextColor(Color.parseColor("#86EFAC")) // Light green
                    textSize = 12f
                    setPadding(0, 12, 0, 0)
                })
            }

            // Tap hint
            addView(TextView(context).apply {
                text = "Tap for details"
                setTextColor(Color.WHITE)
                textSize = 12f
                alpha = 0.7f
                setPadding(0, 16, 0, 0)
            })

            // Make clickable to open app
            setOnClickListener {
                val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                launchIntent?.let { startActivity(it) }
                hideOverlay()
            }
        }

        // Layout params for overlay
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP
            y = 0
        }

        try {
            windowManager?.addView(overlayView, params)
            
            // Auto-hide after 8 seconds
            handler.postDelayed(hideRunnable, 8000)
        } catch (e: SecurityException) {
            // Overlay permission not granted
            android.util.Log.e("RakshakOverlay", "Overlay permission not granted", e)
        }
    }

    private fun hideOverlay() {
        handler.removeCallbacks(hideRunnable)
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                // View already removed
            }
        }
        overlayView = null
        stopSelf()
    }

    override fun onDestroy() {
        hideOverlay()
        super.onDestroy()
    }
}
