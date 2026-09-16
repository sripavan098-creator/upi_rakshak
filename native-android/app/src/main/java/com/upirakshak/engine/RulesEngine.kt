package com.upirakshak.engine

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
            officialRoute = officialRoute,
            originalText = "$title $text"
        )
    }
}
