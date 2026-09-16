package com.upirakshak.engine

/**
 * All scam detection patterns - ported from TypeScript rulesEngine.ts
 * Includes Hinglish + English keywords for Indian UPI scam detection.
 */
object ScamPatterns {

    // Urgency keywords (Hinglish + English)
    val URGENCY_KEYWORDS = listOf(
        // English
        "urgent", "immediately", "disconnected", "blocked", "suspend",
        "suspended", "freeze", "frozen", "right now", "tonight", "today",
        "within 24", "within hours", "last warning", "act now",
        // Hinglish
        "bandh", "kat jayega", "turant", "abhi", "aaj hi",
        "jaldi", "fauran", "turunt", "abhi abhi", "ruk jayega"
    )

    // Suspicious UPI ID markers - if a UPI ID contains any of these, it's suspicious
    val SUSPICIOUS_UPI_MARKERS = listOf(
        "care", "urgent", "verify", "help", "support",
        "refund", "kyc", "update", "secure", "helpline",
        "customer", "service", "official", "team"
    )

    // Payment traps (Hinglish + English)
    val PAYMENT_TRAPS = listOf(
        // Hinglish
        "qr code scan karo", "upi pin enter karo",
        "money receive karne ke liye", "refund ke liye pay karo",
        "pin daalo", "pin daale", "pin enter karo",
        "qr scan karein", "pin enter karein",
        // English
        "scan qr to receive", "scan qr code to receive",
        "enter pin to receive", "enter upi pin to receive",
        "pin to receive", "pin to accept",
        "enter pin to accept", "enter pin to claim",
        "scan to claim refund", "scan to receive money"
    )

    // Lookalike domain prefixes/suffixes
    val LOOKALIKE_DOMAINS = listOf(
        "bses-", "sbi-", "paytm-", "phonepe-", "gpay-",
        "hdfc-", "icici-", "axis-", "kyc-", "verify-",
        "-care", "-support", "-help", "-refund", "-verify",
        "-kyc", "-secure", "-official"
    )

    // Suspicious TLDs commonly used in scams
    val SUSPICIOUS_TLDS = listOf(
        ".online", ".xyz", ".top", ".site", ".club",
        ".info", ".live", ".work", ".click", ".loan"
    )

    // Suspicious keywords that raise the score
    val SUSPICIOUS_KEYWORDS = listOf(
        "kyc", "verify", "verification", "otp", "password",
        "penalty", "fine", "reward", "lottery", "winner",
        "prize", "congratulations", "selected", "lucky"
    )

    // Safe patterns (legitimate messages)
    val SAFE_PATTERNS = listOf(
        "credited", "received", "debited", "paid",
        "thank you", "payment successful", "transaction complete",
        "your payment of", "spent at", "purchase of"
    )

    // UPI ID regex pattern
    val UPI_ID_REGEX = Regex("""[\w.-]+@[\w]+""", RegexOption.IGNORE_CASE)

    // URL regex pattern
    val URL_REGEX = Regex("""(https?://|www\.)\S+""", RegexOption.IGNORE_CASE)
}
