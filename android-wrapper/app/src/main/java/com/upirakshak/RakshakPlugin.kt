package com.upirakshak

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "Rakshak")
class RakshakPlugin : Plugin() {

    private var overlayView: LinearLayout? = null
    private var windowManager: WindowManager? = null
    private val handler = Handler(Looper.getMainLooper())

    companion object {
        private const val OVERLAY_AUTO_HIDE_MS = 8000L
        private var instance: RakshakPlugin? = null

        fun emitNotification(title: String, text: String) {
            instance?.notifyListeners("onNotification", JSObject().apply {
                put("title", title)
                put("text", text)
            })
        }
    }

    override fun load() {
        super.load()
        instance = this
        windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        instance = null
        hideOverlay()
    }

    @PluginMethod
    fun startListening(call: PluginCall) {
        val result = JSObject()
        result.put("status", "started")
        call.resolve(result)
    }

    @PluginMethod
    fun stopListening(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun isNotificationAccessGranted(call: PluginCall) {
        val enabledListeners = android.provider.Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        )
        val granted = enabledListeners?.contains(context.packageName) ?: false
        
        val result = JSObject()
        result.put("granted", granted)
        call.resolve(result)
    }

    @PluginMethod
    fun requestNotificationAccess(call: PluginCall) {
        val intent = android.content.Intent(android.provider.Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        activity.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun requestOverlayPermission(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!android.provider.Settings.canDrawOverlays(context)) {
                val intent = android.content.Intent(
                    android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:${context.packageName}")
                )
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                activity.startActivity(intent)
            }
        }
        call.resolve()
    }

    @PluginMethod
    fun isOverlayGranted(call: PluginCall) {
        val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            android.provider.Settings.canDrawOverlays(context)
        } else {
            true
        }
        
        val result = JSObject()
        result.put("granted", granted)
        call.resolve(result)
    }

    @PluginMethod
    fun showOverlay(call: PluginCall) {
        val message = call.getString("message") ?: "Suspicious message detected"
        val level = call.getString("level") ?: "HIGH"
        val officialRoute = call.getString("officialRoute") ?: ""

        activity.runOnUiThread {
            showNativeOverlay(message, level, officialRoute)
        }
        
        call.resolve()
    }

    @PluginMethod
    fun hideOverlay(call: PluginCall) {
        activity.runOnUiThread {
            hideOverlay()
        }
        call.resolve()
    }

    private fun showNativeOverlay(message: String, level: String, officialRoute: String) {
        // Remove existing overlay if any
        hideOverlay()

        // Check permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!android.provider.Settings.canDrawOverlays(context)) {
                android.util.Log.e("RakshakPlugin", "Overlay permission not granted")
                return
            }
        }

        // Create overlay layout
        overlayView = LinearLayout(context).apply {
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
                val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                launchIntent?.let { 
                    it.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(it)
                }
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
            y = 80
        }

        try {
            windowManager?.addView(overlayView, params)
            
            // Auto-hide after 8 seconds
            handler.postDelayed({ hideOverlay() }, OVERLAY_AUTO_HIDE_MS)
            
            android.util.Log.d("RakshakPlugin", "Overlay shown successfully")
        } catch (e: SecurityException) {
            android.util.Log.e("RakshakPlugin", "Failed to show overlay", e)
        }
    }

    private fun hideOverlay() {
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                android.util.Log.e("RakshakPlugin", "Error removing overlay", e)
            }
        }
        overlayView = null
        handler.removeCallbacksAndMessages(null)
    }
}
