package com.upirakshak.engine

object ScamPatterns {
    
    // Urgency keywords (Hinglish + English)
    val URGENCY_KEYWORDS = listOf(
        "urgent", "immediately", "disconnected", "blocked", "suspend",
        "bandh", "kat jayega", "turant", "abhi", "aaj hi",
        "within 24", "within hours", "right now", "tonight", "today",
        "jaldi", "fauran", "turunt"
    )
    
    // Suspicious UPI ID patterns
    val SUSPICIOUS_UPI_PATTERNS = listOf(
        "care@", "urgent@", "verify@", "help@", "support@", "refund@",
        "helpline@", "customer@"
    )
    
    // Payment traps (Hinglish + English)
    val PAYMENT_TRAPS = listOf(
        "qr code scan karo", "upi pin enter karo",
        "money receive karne ke liye", "refund ke liye pay karo",
        "pin daalo", "pin enter karo", "qr scan karein",
        "scan qr to receive", "enter pin to receive",
        "enter upi pin to receive", "pin to receive"
    )
    
    // Lookalike domain patterns
    val LOOKALIKE_DOMAINS = listOf(
        "bses-", "sbi-", "paytm-", "phonepe-", "gpay-",
        "-care.online", "-support.xyz", "-help.top",
        "-verify.site", "-refund.club"
    )
    
    // Suspicious keywords
    val SUSPICIOUS_KEYWORDS = listOf(
        "kyc", "verify", "verification", "otp", "password",
        "blocked", "suspended", "disconnected", "penalty",
        "fine", "reward", "lottery", "winner", "prize"
    )
    
    // Safe patterns (legitimate messages)
    val SAFE_PATTERNS = listOf(
        "credited", "received", "debited", "paid",
        "thank you", "payment successful", "transaction complete"
    )
}
