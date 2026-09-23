package com.upirakshak.ui.onboarding

import android.content.Context

/**
 * Remembers whether the user has finished or skipped setup, so the wizard does
 * not reappear on every launch.
 */
object OnboardingPreferences {

    private const val PREFS = "rakshak_prefs"
    private const val KEY_DISMISSED = "onboarding_dismissed"

    fun isDismissed(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getBoolean(KEY_DISMISSED, false)

    fun setDismissed(context: Context, dismissed: Boolean) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putBoolean(KEY_DISMISSED, dismissed).apply()
    }
}
