package com.upirakshak.engine

/**
 * Core fraud detection engine - ported from TypeScript rulesEngine.ts
 * Analyzes notification text and returns threat level with reasons.
 */
object RulesEngine {

    /**
     * Analyze a notification for fraud indicators
     * @param title Notification title
     * @param text Notification body text
     * @return ThreatAnalysis with level, reasons, and suggested action
     */
    fun analyze(title: String?, text: String?): ThreatAnalysis {
        val combined = "${title.orEmpty()} ${text.orEmpty()}".lowercase()
        val reasons = mutableListOf<String>()
        val matchedPatterns = mutableListOf<String>()

        // 1. Check for urgency keywords
        val urgencyMatches = ScamPatterns.URGENCY_KEYWORDS.filter { combined.contains(it) }
        val hasUrgency = urgencyMatches.isNotEmpty()
        if (hasUrgency) {
            reasons.add("Urgency detected: ${urgencyMatches.take(2).joinToString(", ")}")
            matchedPatterns.addAll(urgencyMatches)
        }

        // 2. Find UPI IDs and check if they're suspicious
        val upiMatches = ScamPatterns.UPI_ID_REGEX.findAll(combined).map { it.value }.toList()
        val suspiciousUpiMatches = upiMatches.filter { upi ->
            ScamPatterns.SUSPICIOUS_UPI_MARKERS.any { marker -> upi.contains(marker) }
        }
        val hasSuspiciousUpi = suspiciousUpiMatches.isNotEmpty()
        if (hasSuspiciousUpi) {
            reasons.add("Suspicious UPI ID: ${suspiciousUpiMatches.first()}")
            matchedPatterns.addAll(suspiciousUpiMatches)
        }

        // 3. Check for payment traps
        val trapMatches = ScamPatterns.PAYMENT_TRAPS.filter { combined.contains(it) }
        val hasPaymentTrap = trapMatches.isNotEmpty()
        if (hasPaymentTrap) {
            reasons.add("Payment trap: ${trapMatches.first()}")
            matchedPatterns.addAll(trapMatches)
        }

        // 4. Check for lookalike domains
        val domainMatches = ScamPatterns.LOOKALIKE_DOMAINS.filter { combined.contains(it) }
        val hasLookalikeDomain = domainMatches.isNotEmpty()
        if (hasLookalikeDomain) {
            reasons.add("Lookalike domain: ${domainMatches.first()}")
            matchedPatterns.addAll(domainMatches)
        }

        // 5. Check for suspicious TLDs
        val urlMatches = ScamPatterns.URL_REGEX.findAll(combined).map { it.value }.toList()
        val suspiciousTldMatches = urlMatches.filter { url ->
            ScamPatterns.SUSPICIOUS_TLDS.any { tld -> url.contains(tld) }
        }
        val hasSuspiciousTld = suspiciousTldMatches.isNotEmpty()
        if (hasSuspiciousTld) {
            reasons.add("Suspicious URL: ${suspiciousTldMatches.first()}")
            matchedPatterns.addAll(suspiciousTldMatches)
        }

        // 6. Determine threat level
        val level = when {
            hasUrgency && (hasSuspiciousUpi || hasPaymentTrap || hasLookalikeDomain || hasSuspiciousTld) -> {
                ThreatLevel.HIGH
            }
            hasUrgency || hasSuspiciousUpi || hasPaymentTrap || hasLookalikeDomain || hasSuspiciousTld -> {
                ThreatLevel.MEDIUM
            }
            else -> ThreatLevel.SAFE
        }

        // 7. Build suggested action (Hinglish)
        val suggestedAction = when (level) {
            ThreatLevel.HIGH -> "Yeh message fraud hai. Kisi ko bhi OTP ya UPI PIN mat do."
            ThreatLevel.MEDIUM -> "Savdhan rahein. Official channel se verify karein."
            ThreatLevel.SAFE -> "Yeh message safe lagta hai."
        }

        // 8. Build official route based on context
        val officialRoute = when {
            combined.contains("electricity") || combined.contains("bijli") || combined.contains("bses") -> {
                "Official BSES/Tata Power app ya bbps.npci.org.in use karein"
            }
            combined.contains("sbi") || combined.contains("bank") || combined.contains("kyc") -> {
                "Apne bank ke card ke peeche wala number par call karein"
            }
            combined.contains("upi") || combined.contains("payment") -> {
                "Yaad rakhein: paisa RECEIVE karne ke liye NEVER UPI PIN daalte hain"
            }
            else -> "Official app se verify karein"
        }

object RulesEngine {
    
    fun analyze(title: String, text: String): ThreatAnalysis {
        val combined = "$title $text".lowercase()
        val reasons = mutableListOf<String>()
        val matchedPatterns = mutableListOf<String>()
        
        // Check for urgency keywords
        val urgencyMatches = ScamPatterns.URGENCY_KEYWORDS.filter { combined.contains(it) }
        if (urgencyMatches.isNotEmpty()) {
            reasons.add("Urgency detected: ${urgencyMatches.take(2).joinToString(", ")}")
            matchedPatterns.addAll(urgencyMatches)
        }
        
        // Check for suspicious UPI patterns
        val upiMatches = ScamPatterns.SUSPICIOUS_UPI_PATTERNS.filter { combined.contains(it) }
        if (upiMatches.isNotEmpty()) {
            reasons.add("Suspicious UPI ID: ${upiMatches.first()}")
            matchedPatterns.addAll(upiMatches)
        }
        
        // Check for payment traps
        val trapMatches = ScamPatterns.PAYMENT_TRAPS.filter { combined.contains(it) }
        if (trapMatches.isNotEmpty()) {
            reasons.add("Payment trap: ${trapMatches.first()}")
            matchedPatterns.addAll(trapMatches)
        }
        
        // Check for lookalike domains
        val domainMatches = ScamPatterns.LOOKALIKE_DOMAINS.filter { combined.contains(it) }
        if (domainMatches.isNotEmpty()) {
            reasons.add("Fake domain: ${domainMatches.first()}")
            matchedPatterns.addAll(domainMatches)
        }
        
        // Check for suspicious keywords
        val suspiciousMatches = ScamPatterns.SUSPICIOUS_KEYWORDS.filter { combined.contains(it) }
        if (suspiciousMatches.isNotEmpty()) {
            reasons.add("Suspicious keywords: ${suspiciousMatches.take(2).joinToString(", ")}")
            matchedPatterns.addAll(suspiciousMatches)
        }
        
        // Determine threat level
        val hasUrgency = urgencyMatches.isNotEmpty()
        val hasTechnicalTrap = upiMatches.isNotEmpty() || trapMatches.isNotEmpty() || domainMatches.isNotEmpty()
        
        val level = when {
            hasUrgency && hasTechnicalTrap -> ThreatLevel.HIGH
            hasUrgency || hasTechnicalTrap -> ThreatLevel.MEDIUM
            else -> ThreatLevel.SAFE
        }
        
        // Generate suggested action
        val suggestedAction = when (level) {
            ThreatLevel.HIGH -> "DO NOT respond, scan any QR, or enter your UPI PIN. This is a scam."
            ThreatLevel.MEDIUM -> "Be cautious. Verify through official channels before acting."
            ThreatLevel.SAFE -> "This message appears safe. No suspicious patterns detected."
        }
        
        // Determine official route for HIGH risk
        val officialRoute = when {
            level == ThreatLevel.HIGH && (combined.contains("electricity") || combined.contains("bijli") || combined.contains("bses")) ->
                "Use official BSES/Tata Power app or bbps.npci.org.in"
            level == ThreatLevel.HIGH && (combined.contains("sbi") || combined.contains("bank") || combined.contains("kyc")) ->
                "Call your bank's number on the back of your card"
            level == ThreatLevel.HIGH ->
                "Remember: receiving money NEVER needs a UPI PIN"
            else -> null
        }
        
        return ThreatAnalysis(
            level = level,
            reasons = reasons,
            matchedPatterns = matchedPatterns,
            suggestedAction = suggestedAction,
            officialRoute = if (level != ThreatLevel.SAFE) officialRoute else null,
            originalText = "${title.orEmpty()} ${text.orEmpty()}"
        )
    }

    /**
     * Run 8 test cases to verify the engine works correctly
     * @return List of (test description, passed) pairs
     */
    fun runTests(): List<Pair<String, Boolean>> {
        val tests = listOf(
            // Test 1: Electricity scam → HIGH
            {
                val result = analyze(
                    "WhatsApp",
                    "URGENT: Electricity disconnected tonight, scan QR to pay bsescare@icici"
                )
                "Electricity scam → HIGH" to (result.level == ThreatLevel.HIGH)
            },

            // Test 2: Bank KYC scam → HIGH
            {
                val result = analyze(
                    "SMS",
                    "Your SBI account blocked, enter UPI PIN immediately"
                )
                "Bank KYC scam → HIGH" to (result.level == ThreatLevel.HIGH)
            },

            // Test 3: Prize scam → HIGH
            {
                val result = analyze(
                    "SMS",
                    "Congratulations! Pay ₹500 to receive ₹10,000"
                )
                "Prize scam → HIGH" to (result.level == ThreatLevel.HIGH)
            },

            // Test 4: OTP message → SAFE
            {
                val result = analyze(
                    "HDFC Bank",
                    "Your OTP is 123456. Do not share."
                )
                "OTP message → SAFE" to (result.level == ThreatLevel.SAFE)
            },

            // Test 5: Friend chat → SAFE
            {
                val result = analyze(
                    "WhatsApp",
                    "Hi, this is your friend, sending money"
                )
                "Friend chat → SAFE" to (result.level == ThreatLevel.SAFE)
            },

            // Test 6: Paytm care lookalike → MEDIUM
            {
                val result = analyze(
                    "SMS",
                    "Paytm care: verify your KYC now"
                )
                "Paytm care lookalike → MEDIUM" to (result.level == ThreatLevel.MEDIUM)
            },

            // Test 7: Job offer scam → HIGH
            {
                val result = analyze(
                    "WhatsApp",
                    "Job offer! Registration fee ₹500 required"
                )
                "Job offer scam → HIGH" to (result.level == ThreatLevel.HIGH)
            },

            // Test 8: Government scheme with suspicious URL → HIGH
            {
                val result = analyze(
                    "SMS",
                    "Government scheme approved. Click verify-kyc.online"
                )
                "Government scheme with suspicious URL → HIGH" to (result.level == ThreatLevel.HIGH)
            }
        )

        return tests.map { it() }
            officialRoute = officialRoute,
            originalText = "$title $text"
        )
    }
}
