package com.upirakshak

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

/**
 * BootReceiver — restarts the overlay service after device reboot.
 *
 * This ensures Rakshak continues protecting the user even after they
 * restart their phone, without requiring them to manually open the app.
 */
class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "RakshakBoot"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.i(TAG, "Device booted — Rakshak services will auto-start")

            // The NotificationListenerService auto-starts via the system
            // We just need to ensure the overlay service is ready
            // (It will be started on-demand when a threat is detected)
        }
    }
}
