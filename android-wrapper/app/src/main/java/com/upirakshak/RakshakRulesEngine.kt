package com.upirakshak

data class ThreatResult(
    val score: Int,
    val reasons: List<String>,
    val rawText: String
) {
    val isCritical: Boolean
        get() = score >= 70
}

object RakshakRulesEngine {

    private val urgencyKeywords = listOf(
        "urgent",
        "immediately",
        "block",
        "blocked",
        "suspend",
        "suspended",
        "verify",
        "verification",
        "expired",
        "otp",
        "password",
        "pin",
        "reward",
        "refund",
        "penalty",
        "fine",
        "kyc",
        "turant",
        "bandh",
        "paisa",
        "link"
    )

    private val trapPhrases = listOf(
        "pay to unlock",
        "processing fee",
        "refund charge",
        "verification fee",
        "kyc update",
        "bank blocked",
        "upi blocked",
        "account blocked",
        "claim reward",
        "lottery",
        "winner",
        "refund pending",
        "pay now",
        "last warning"
    )

    private val upiRegex = Regex(
        "[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}",
        RegexOption.IGNORE_CASE
    )

    private val amountRegex = Regex(
        "(₹|rs\\.?|inr)\\s?\\d+",
        RegexOption.IGNORE_CASE
    )

    private val linkRegex = Regex(
        "(https?://|www\\.)\\S+",
        RegexOption.IGNORE_CASE
    )

    fun analyze(rawText: String): ThreatResult {
        val text = rawText.lowercase()
        val reasons = mutableListOf<String>()
        var score = 0

        val matchedUrgency = urgencyKeywords
            .filter { text.contains(it) }
            .distinct()
            .take(4)

        if (matchedUrgency.isNotEmpty()) {
            score += matchedUrgency.size * 12
            reasons.add("Urgency language detected")
        }

        if (upiRegex.containsMatchIn(rawText)) {
            score += 35
            reasons.add("UPI ID present")
        }

        if (amountRegex.containsMatchIn(text)) {
            score += 20
            reasons.add("Money amount requested")
        }

        if (linkRegex.containsMatchIn(text)) {
            score += 20
            reasons.add("Suspicious link present")
        }

        val matchedTraps = trapPhrases.filter { text.contains(it) }

        if (matchedTraps.isNotEmpty()) {
            score += 25
            reasons.add("Payment trap phrase detected")
        }

        if (text.contains("otp") || text.contains("password") || text.contains("pin")) {
            score += 20
            reasons.add("Credential or OTP request detected")
        }

        if (score > 100) score = 100

        return ThreatResult(
            score = score,
            reasons = reasons,
            rawText = rawText
        )
    }
}
