package com.upirakshak.util

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings

/**
 * Helper for battery optimization and autostart management
 * Critical for iQOO/Funtouch OS and other aggressive ROMs
 */
object BatteryHelper {
    
    /**
     * Check if battery optimization is disabled for this app
     */
    fun isIgnoringBatteryOptimizations(context: Context): Boolean {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return powerManager.isIgnoringBatteryOptimizations(context.packageName)
    }
    
    /**
     * Request to ignore battery optimizations
     * Opens system settings dialog
     */
    @SuppressLint("BatteryLife")
    fun requestIgnoreBatteryOptimizations(context: Context) {
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = Uri.parse("package:${context.packageName}")
        }
        context.startActivity(intent)
    }
    
    /**
     * Open battery optimization settings for this app
     */
    fun openBatterySettings(context: Context) {
        val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
        context.startActivity(intent)
    }
    
    /**
     * Check if autostart is enabled (manufacturer-specific)
     * Note: There's no standard API for this, so we provide manual guidance
     */
    fun isAutostartEnabled(context: Context): Boolean {
        // This is manufacturer-specific and cannot be reliably checked
        // Return true as default - user will need to manually enable
        return true
    }
    
    /**
     * Get manufacturer-specific autostart instructions
     */
    fun getAutostartInstructions(): String {
        val manufacturer = android.os.Build.MANUFACTURER.lowercase()
        return when {
            manufacturer.contains("vivo") || manufacturer.contains("iqoo") -> {
                "iQOO/Vivo: Settings → Battery → Background power consumption → UPI Rakshak → Allow background activity\n" +
                "Also: Settings → Apps → UPI Rakshak → Autostart → Enable"
            }
            manufacturer.contains("xiaomi") || manufacturer.contains("redmi") -> {
                "Xiaomi/Redmi: Settings → Apps → Manage apps → UPI Rakshak → Battery saver → No restrictions\n" +
                "Also: Security app → Manage apps → UPI Rakshak → Autostart → Enable"
            }
            manufacturer.contains("oppo") || manufacturer.contains("realme") -> {
                "Oppo/Realme: Settings → Battery → More settings → Optimize battery use → UPI Rakshak → Don't optimize\n" +
                "Also: Settings → Apps → UPI Rakshak → Allow auto-startup"
            }
            manufacturer.contains("huawei") || manufacturer.contains("honor") -> {
                "Huawei/Honor: Settings → Battery → App launch → UPI Rakshak → Manage manually → Enable all"
            }
            manufacturer.contains("samsung") -> {
                "Samsung: Settings → Device care → Battery → Background usage limits → Never sleeping apps → Add UPI Rakshak"
            }
            else -> {
                "Settings → Battery → Battery optimization → UPI Rakshak → Don't optimize"
            }
        }
    }
    
    /**
     * Open manufacturer-specific autostart settings if possible
     */
    fun openAutostartSettings(context: Context) {
        val manufacturer = android.os.Build.MANUFACTURER.lowercase()
        val intent = when {
            manufacturer.contains("vivo") || manufacturer.contains("iqoo") -> {
                Intent().apply {
                    component = android.content.ComponentName(
                        "com.vivo.permissionmanager",
                        "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"
                    )
                }
            }
            manufacturer.contains("xiaomi") || manufacturer.contains("redmi") -> {
                Intent("miui.intent.action.OP_AUTO_START").apply {
                    addCategory(Intent.CATEGORY_DEFAULT)
                }
            }
            manufacturer.contains("oppo") || manufacturer.contains("realme") -> {
                Intent().apply {
                    component = android.content.ComponentName(
                        "com.coloros.safecenter",
                        "com.coloros.safecenter.startupapp.StartupAppListActivity"
                    )
                }
            }
            manufacturer.contains("huawei") || manufacturer.contains("honor") -> {
                Intent().apply {
                    component = android.content.ComponentName(
                        "com.huawei.systemmanager",
                        "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"
                    )
                }
            }
            else -> {
                // Fallback to general battery settings
                Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
            }
        }
        
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            // If specific intent fails, open general battery settings
            context.startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
        }
    }
}
