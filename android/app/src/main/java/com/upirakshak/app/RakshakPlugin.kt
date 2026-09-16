package com.upirakshak.app

import android.content.Intent
import android.provider.Settings
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "Rakshak")
class RakshakPlugin : Plugin() {

    companion object {
        private var instance: RakshakPlugin? = null

        fun getInstance(): RakshakPlugin? = instance

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
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        instance = null
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
        val enabledListeners = Settings.Secure.getString(
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
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        activity.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun requestOverlayPermission(call: PluginCall) {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            android.net.Uri.parse("package:${context.packageName}")
        )
        activity.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun isOverlayGranted(call: PluginCall) {
        val granted = Settings.canDrawOverlays(context)
        
        val result = JSObject()
        result.put("granted", granted)
        call.resolve(result)
    }

    @PluginMethod
    fun showOverlay(call: PluginCall) {
        val message = call.getString("message") ?: ""
        val level = call.getString("level") ?: "HIGH"
        val officialRoute = call.getString("officialRoute") ?: ""

        val intent = Intent(context, RakshakOverlayService::class.java).apply {
            putExtra("message", message)
            putExtra("level", level)
            putExtra("officialRoute", officialRoute)
        }
        context.startService(intent)

        call.resolve()
    }

    @PluginMethod
    fun hideOverlay(call: PluginCall) {
        val intent = Intent(context, RakshakOverlayService::class.java).apply {
            action = "HIDE"
        }
        context.startService(intent)
        call.resolve()
    }
}
