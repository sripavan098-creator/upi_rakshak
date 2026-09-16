package com.upirakshak

import android.app.Notification
import android.content.Intent
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * RakshakNotificationListener — intercepts incoming notifications at the OS level.
 *
 * This service runs in the background and receives every notification posted
 * by any app. It filters for messaging apps (WhatsApp, SMS, etc.) and passes
 * the notification content to the rules engine for analysis.
 *
 * If a HIGH threat is detected, it triggers the overlay service to show a
 * warning banner over the notification.
 */
class RakshakNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "RakshakListener"

        // Apps to monitor (package names)
        private val MONITORED_PACKAGES = setOf(
            "com.whatsapp",
            "com.whatsapp.w4b",
            "com.google.android.apps.messaging",
            "com.samsung.android.messaging",
            "com.truecaller",
            "com.facebook.orca", // Messenger
            "org.telegram.messenger",
            "com.google.android.gm", // Gmail
        )

        // Keywords that trigger deeper analysis
        private val URGENCY_KEYWORDS = listOf(
            "urgent", "immediately", "disconnected", "blocked", "suspend",
            "bandh", "block", "kat jayega", "turant", "abhi", "aaj hi",
            "within 24", "tonight", "right now"
        )

        private val PAYMENT_TRAPS = listOf(
            "scan.*qr.*receiv", "enter.*pin.*receiv", "upi pin.*refund",
            "qr code scan karo", "upi pin enter karo", "pin daalo",
            "receive.*enter.*pin", "collect.*scan.*qr"
        )

        private val SUSPICIOUS_UPI_PATTERNS = listOf(
            "@.*care", "@.*refund", "@.*support", "@.*verify",
            "@.*helpline", "@.*urgent"
        )
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "✓ Rakshak notification listener connected")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.i(TAG, "✗ Rakshak notification listener disconnected")
    }

    /**
     * Called when any app posts a notification.
     */
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn ?: return

        // Only process notifications from monitored apps
        if (sbn.packageName !in MONITORED_PACKAGES) {
            return
        }

        // Skip our own notifications to avoid loops
        if (sbn.packageName == packageName) {
            return
        }

        val notification = sbn.notification ?: return
        val extras = notification.extras

        // Extract title and text
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""

        Log.d(TAG, "Notification from ${sbn.packageName}: $title | $text")

        // Quick pre-filter: does it contain urgency keywords?
        val combined = "$title $text".lowercase()
        val hasUrgency = URGENCY_KEYWORDS.any { combined.contains(it) }

        if (!hasUrgency) {
            return // Not urgent, skip deep analysis
        }

        // Run full analysis
        val analysis = analyzeMessage(title, text)

        if (analysis.level == "HIGH") {
            Log.w(TAG, "🚨 HIGH threat detected: ${analysis.reasons.joinToString(", ")}")
            triggerOverlay(analysis, text)
        } else if (analysis.level == "MEDIUM") {
            Log.i(TAG, "⚠️ MEDIUM threat: ${analysis.reasons.joinToString(", ")}")
            // Could show a less intrusive warning here
        }
    }

    /**
     * Analyze a message using the rules engine logic.
     *
     * This is a Kotlin port of the TypeScript rules engine in src/lib/rulesEngine.ts.
     * In production, this could be replaced with a shared library or on-device ML model.
     */
    private fun analyzeMessage(title: String, text: String): ThreatAnalysis {
        val combined = "$title $text".lowercase()
        val reasons = mutableListOf<String>()
        val matchedPatterns = mutableListOf<String>()

        // Check urgency
        val urgencyMatches = URGENCY_KEYWORDS.filter { combined.contains(it) }
        if (urgencyMatches.isNotEmpty()) {
            matchedPatterns.addAll(urgencyMatches)
            reasons.add("Urgency detected: ${urgencyMatches.take(2).joinToString(", ")}")
        }

        // Check payment traps (regex)
        val paymentTrapMatches = PAYMENT_TRAPS.filter { pattern ->
            Regex(pattern, RegexOption.IGNORE_CASE).containsMatchIn(combined)
        }
        if (paymentTrapMatches.isNotEmpty()) {
            matchedPatterns.addAll(paymentTrapMatches)
            reasons.add("Payment trap: ${paymentTrapMatches.first()}")
        }

        // Check suspicious UPI patterns
        val upiMatches = SUSPICIOUS_UPI_PATTERNS.filter { pattern ->
            Regex(pattern, RegexOption.IGNORE_CASE).containsMatchIn(combined)
        }
        if (upiMatches.isNotEmpty()) {
            matchedPatterns.addAll(upiMatches)
            reasons.add("Suspicious UPI ID: ${upiMatches.first()}")
        }

        // Determine threat level
        val hasUrgency = urgencyMatches.isNotEmpty()
        val hasTechnicalTrap = paymentTrapMatches.isNotEmpty() || upiMatches.isNotEmpty()

        val level = when {
            hasUrgency && hasTechnicalTrap -> "HIGH"
            hasUrgency || hasTechnicalTrap -> "MEDIUM"
            else -> "SAFE"
        }

        // Determine official route
        val officialRoute = when {
            combined.contains("electricity") || combined.contains("bses") || combined.contains("bijli") ->
                "Use official BSES/Tata Power app or bbps.npci.org.in"
            combined.contains("sbi") || combined.contains("bank") || combined.contains("kyc") ->
                "Call your bank's number on the back of your card"
            else ->
                "Remember: receiving money NEVER needs a UPI PIN"
        }

        val suggestedAction = if (level == "HIGH") {
            "DO NOT respond, scan any QR, or enter your UPI PIN. This is a scam."
        } else {
            "Be cautious. Verify through official channels before acting."
        }

        return ThreatAnalysis(
            level = level,
            reasons = reasons,
            matchedPatterns = matchedPatterns,
            suggestedAction = suggestedAction,
            officialRoute = if (level == "HIGH") officialRoute else null
        )
    }

    /**
     * Trigger the overlay service to show a warning.
     */
    private fun triggerOverlay(analysis: ThreatAnalysis, message: String) {
        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra("threat_level", analysis.level)
            putExtra("message", message)
            putExtra("reasons", analysis.reasons.joinToString("|"))
            putExtra("official_route", analysis.officialRoute ?: "")
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }

        // Also notify the WebView if it's open
        val mainActivityIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("show_overlay", true)
            putExtra("threat_level", analysis.level)
            putExtra("message", message)
        }
        startActivity(mainActivityIntent)
    }

    /**
     * Data class for threat analysis results.
     */
    data class ThreatAnalysis(
        val level: String,
        val reasons: List<String>,
        val matchedPatterns: List<String>,
        val suggestedAction: String,
        val officialRoute: String?
    )
}
