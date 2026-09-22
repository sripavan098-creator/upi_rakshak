package com.upirakshak.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel

/**
 * Builds the message a user can forward to someone they trust before paying.
 *
 * Sharing is the escalation path: there is no server and no account, so the
 * safest way to get a second opinion on a suspicious payment is to hand the
 * details to a person the user already trusts.
 */
object EscalationMessage {

    fun build(analysis: ThreatAnalysis): String = buildString {
        append("UPI Rakshak alert: ")
        append(headline(analysis.level))
        append("\n\n")

        if (analysis.originalText.isNotBlank()) {
            append("Message received:\n")
            append(analysis.originalText.trim())
            append("\n\n")
        }

        if (analysis.reasons.isNotEmpty()) {
            append("Why it is suspicious:\n")
            analysis.reasons.forEach { append("• ").append(it).append('\n') }
            append('\n')
        }

        append("Recommended action: ")
        append(analysis.suggestedAction)

        analysis.officialRoute?.takeIf { it.isNotBlank() }?.let {
            append("\n\nSafe route: ").append(it)
        }

        append("\n\nPlease confirm before I pay.")
    }

    private fun headline(level: ThreatLevel): String = when (level) {
        ThreatLevel.HIGH -> "this payment request looks like fraud"
        ThreatLevel.MEDIUM -> "please check this payment request before I proceed"
        ThreatLevel.SAFE -> "I am checking a payment request"
    }

    /**
     * Opens a chooser so the user decides who receives the alert. No contact is
     * ever read or selected programmatically.
     */
    fun shareIntent(analysis: ThreatAnalysis, chooserTitle: String): Intent {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, build(analysis))
            putExtra(Intent.EXTRA_SUBJECT, "UPI Rakshak: suspicious payment request")
        }
        return Intent.createChooser(send, chooserTitle)
    }

    /**
     * Opens the dialler pre-filled with the national cybercrime helpline. The
     * user still has to press call, so this never places a call on its own.
     */
    fun reportIntent(helpline: String): Intent =
        Intent(Intent.ACTION_DIAL, Uri.parse("tel:$helpline"))
}
