package com.upirakshak.data

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

/**
 * Remembers whether the user agreed to let Rakshak read their transaction messages.
 *
 * Reading SMS is a restricted, sensitive capability, so this is an explicit opt-in that
 * defaults to off and can be revoked without affecting the rest of the app. The preference
 * and the runtime permission are tracked separately: the user may allow the app to read
 * messages but later revoke the OS permission, and both must hold before reading occurs.
 */
object SmsReadPreference {

    private const val PREFS = "sms_read_consent"
    private const val KEY_ENABLED = "enabled"

    fun isEnabled(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_ENABLED, false)

    fun setEnabled(context: Context, enabled: Boolean) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean(KEY_ENABLED, enabled)
            .apply()
    }

    fun hasPermission(context: Context): Boolean =
        ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) ==
            PackageManager.PERMISSION_GRANTED

    /** True only when the user both consented and the OS permission is currently held. */
    fun canRead(context: Context): Boolean = isEnabled(context) && hasPermission(context)
}
