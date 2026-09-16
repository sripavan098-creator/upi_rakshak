package com.upirakshak.engine

/**
 * Comprehensive fraud detection engine with 200+ patterns across 22+ categories
 * Analyzes notification text and returns threat level with reasons and suggested actions
 */
object RulesEngine {

    /**
     * Analyze a notification for fraud indicators
     * @param title Notification title
     * @param text Notification body text
     * @return ThreatAnalysis with level, reasons, and suggested action
     */
    fun analyze(title: String, text: String): ThreatAnalysis {
        val combined = "$title $text".lowercase()
        val reasons = mutableListOf<String>()
        val matchedPatterns = mutableListOf<String>()
        var level = ThreatLevel.SAFE
        
        // === EXISTING RULES ===
        
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

        // === NEW FRAUD CATEGORY RULES ===

        // Rule: Digital Arrest Scam
        if (ScamPatterns.DIGITAL_ARREST_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Digital arrest is not real. Police never conduct arrests over video calls.")
            matchedPatterns.add("digital_arrest")
            level = ThreatLevel.HIGH
        }

        // Rule: APK Malware Distribution
        if (ScamPatterns.MALWARE_APK_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("APK files from WhatsApp/Telegram contain malware. Never install.")
            matchedPatterns.add("malware_apk")
            level = ThreatLevel.HIGH
        }

        // Rule: Remote Access App
        if (ScamPatterns.REMOTE_ACCESS_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Screen-sharing apps give scammers full control of your phone.")
            matchedPatterns.add("remote_access")
            level = ThreatLevel.HIGH
        }

        // Rule: Autopay Mandate Trap
        if (ScamPatterns.AUTOPAY_TRAP_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Small verification amount may hide an AutoPay mandate.")
            matchedPatterns.add("autopay_trap")
            level = ThreatLevel.HIGH
        }

        // Rule: AI / Deepfake
        if (ScamPatterns.AI_DEEPFAKE_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("AI-generated voices and videos are being used in scams.")
            matchedPatterns.add("ai_deepfake")
            level = ThreatLevel.HIGH
        }

        // Rule: Call Merging
        if (ScamPatterns.CALL_MERGE_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Scammers merge calls to capture your OTP. Hang up and call back.")
            matchedPatterns.add("call_merge")
            level = ThreatLevel.HIGH
        }

        // Rule: Rogue QR Device Takeover
        if (ScamPatterns.ROGUE_QR_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("This QR may register your UPI on another device.")
            matchedPatterns.add("rogue_qr")
            level = ThreatLevel.HIGH
        }

        // Rule: AEPS Biometric
        if (ScamPatterns.AEPS_FRAUD_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Never share fingerprint or Aadhaar with strangers.")
            matchedPatterns.add("aeps_fraud")
            level = ThreatLevel.HIGH
        }

        // Rule: Investment Scam
        if (ScamPatterns.INVESTMENT_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Guaranteed returns are always a scam. SEBI registration is mandatory.")
            matchedPatterns.add("investment_scam")
            level = ThreatLevel.HIGH
        }

        // Rule: Loan App Predatory
        if (ScamPatterns.LOAN_APP_TRAP_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Loan apps requesting contacts access are illegal.")
            matchedPatterns.add("loan_app_trap")
            level = ThreatLevel.HIGH
        }

        // Rule: Job Scam
        if (ScamPatterns.JOB_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Legitimate jobs never charge a registration fee.")
            matchedPatterns.add("job_scam")
            level = ThreatLevel.HIGH
        }

        // Rule: Lottery Scam
        if (ScamPatterns.LOTTERY_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("You never need to pay tax to receive a prize.")
            matchedPatterns.add("lottery_scam")
            level = ThreatLevel.HIGH
        }

        // Rule: Customer Care / Remote Support
        if (ScamPatterns.CUSTOMER_CARE_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Only trust customer care numbers from the official app or website.")
            matchedPatterns.add("customer_care_scam")
            level = ThreatLevel.HIGH
        }

        // Rule: Courier Scam
        if (ScamPatterns.COURIER_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Government agencies never demand payment for parcels.")
            matchedPatterns.add("courier_scam")
            level = ThreatLevel.HIGH
        }

        // Rule: Sextortion
        if (ScamPatterns.SEXTORTION_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Do not pay. Report to 1930 immediately.")
            matchedPatterns.add("sextortion")
            level = ThreatLevel.HIGH
        }

        // Rule: Romance Scam
        if (ScamPatterns.ROMANCE_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Financial requests from online romantic interests are scams.")
            matchedPatterns.add("romance_scam")
            level = ThreatLevel.MEDIUM
        }

        // Rule: Charity Scam
        if (ScamPatterns.CHARITY_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Verify the charity registration before donating.")
            matchedPatterns.add("charity_scam")
            level = ThreatLevel.MEDIUM
        }

        // Rule: Refund Scam
        if (ScamPatterns.REFUND_SCAM_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Refunds never require scanning a QR code or entering a UPI PIN.")
            matchedPatterns.add("refund_scam")
            level = ThreatLevel.HIGH
        }

        // Rule: SIM Swap
        if (ScamPatterns.SIM_SWAP_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Sudden SIM issues with OTP requests indicate SIM swap fraud.")
            matchedPatterns.add("sim_swap")
            level = ThreatLevel.HIGH
        }

        // Rule: Fake Screenshot
        if (ScamPatterns.FAKE_SCREENSHOT_KEYWORDS.any { combined.contains(it) }) {
            reasons.add("Payment screenshots can be forged. Always check your account.")
            matchedPatterns.add("fake_screenshot")
            level = ThreatLevel.MEDIUM
        }

        // Rule: Suspicious App Names
        if (ScamPatterns.SUSPICIOUS_APPS.any { combined.contains(it) }) {
            reasons.add("This app name is associated with known scams.")
            matchedPatterns.add("suspicious_app")
            level = ThreatLevel.HIGH
        }

        // Rule: The Golden Rule - Receiving Money Never Needs UPI PIN
        if ((combined.contains("receive") || combined.contains("receive money") ||
             combined.contains("money receive") || combined.contains("refund") ||
             combined.contains("cashback") || combined.contains("prize money"))
            && (combined.contains("upi pin") || combined.contains("enter pin") ||
                combined.contains("pin enter") || combined.contains("pin daale"))) {
            reasons.add("Receiving money NEVER requires UPI PIN. This is a scam.")
            matchedPatterns.add("pin_for_receiving")
            level = ThreatLevel.HIGH
        }

        // === DETERMINE FINAL THREAT LEVEL ===
        
        // If we already have HIGH from specific rules, keep it
        // Otherwise, use the original logic
        if (level == ThreatLevel.SAFE) {
            val hasUrgency = urgencyMatches.isNotEmpty()
            val hasTechnicalTrap = upiMatches.isNotEmpty() || trapMatches.isNotEmpty() || domainMatches.isNotEmpty()
            
            level = when {
                hasUrgency && hasTechnicalTrap -> ThreatLevel.HIGH
                hasUrgency || hasTechnicalTrap -> ThreatLevel.MEDIUM
                else -> ThreatLevel.SAFE
            }
        }
        
        // Generate suggested action based on matched patterns
        val suggestedAction = when {
            matchedPatterns.contains("digital_arrest") -> "Digital arrest jaisa kuch nahi hota. Police video call pe arrest nahi karti. Turant 1930 pe call karein."
            matchedPatterns.contains("malware_apk") -> "APK file mein virus hota hai. Kabhi bhi WhatsApp/Telegram se APK install mat karein."
            matchedPatterns.contains("remote_access") -> "Screen share app se aapka phone hack ho jata hai. Turant call kaat dein."
            matchedPatterns.contains("autopay_trap") -> "₹1 verify karne ke naam pe AutoPay activate ho jata hai. UPI PIN mat daalein."
            matchedPatterns.contains("investment_scam") -> "Guaranteed returns kabhi real nahi hote. Yeh 100% scam hai."
            matchedPatterns.contains("loan_app_trap") -> "Illegal loan apps contacts chura lete hain aur blackmail karte hain."
            matchedPatterns.contains("job_scam") -> "Legitimate jobs kabhi registration fee nahi maangti."
            matchedPatterns.contains("lottery_scam") -> "Prize jeetne ke liye kabhi tax nahi dena padta."
            matchedPatterns.contains("customer_care_scam") -> "Customer care number sirf official app ya website se lein."
            matchedPatterns.contains("courier_scam") -> "Government agencies parcel ke liye payment nahi maangti."
            matchedPatterns.contains("sextortion") -> "Payment mat karein. Turant 1930 pe report karein."
            matchedPatterns.contains("romance_scam") -> "Online romantic interest se paise maangna scam hai."
            matchedPatterns.contains("charity_scam") -> "Donate karne se pehle charity registration verify karein."
            matchedPatterns.contains("refund_scam") -> "Refund ke liye QR scan ya UPI PIN dena kabhi nahi hota."
            matchedPatterns.contains("sim_swap") -> "SIM block hone pe turant operator ko call karein."
            matchedPatterns.contains("fake_screenshot") -> "Payment screenshot fake ho sakta hai. Apna account check karein."
            matchedPatterns.contains("suspicious_app") -> "Yeh app known scams se juda hai."
            matchedPatterns.contains("pin_for_receiving") -> "Paisa RECEIVE karne ke liye UPI PIN kabhi nahi dena hota."
            level == ThreatLevel.HIGH -> "Yeh message fraud hai. Kisi ko bhi OTP ya UPI PIN mat do."
            level == ThreatLevel.MEDIUM -> "Savdhan rahein. Official channel se verify karein."
            else -> "Yeh message safe lagta hai."
        }
        
        // Determine official route for HIGH risk
        val officialRoute = when {
            matchedPatterns.contains("digital_arrest") -> "Hang up. Report to 1930 (national cybercrime helpline)."
            matchedPatterns.contains("malware_apk") -> "Only install apps from Google Play Store."
            matchedPatterns.contains("remote_access") -> "Official companies never ask you to install AnyDesk/TeamViewer."
            matchedPatterns.contains("autopay_trap") -> "Check active mandates in your UPI app: Settings > AutoPay."
            matchedPatterns.contains("investment_scam") -> "Verify SEBI registration at sebi.gov.in before investing."
            matchedPatterns.contains("loan_app_trap") -> "Check RBI-approved lenders list. Only use apps from RBI registry."
            matchedPatterns.contains("job_scam") -> "Legitimate companies never charge for jobs."
            matchedPatterns.contains("lottery_scam") -> "Report to 1930. Never pay to receive prizes."
            matchedPatterns.contains("customer_care_scam") -> "Use only official app/website customer care."
            matchedPatterns.contains("courier_scam") -> "Contact courier company directly via official website."
            matchedPatterns.contains("sextortion") -> "Report to 1930 immediately. Do not pay."
            matchedPatterns.contains("romance_scam") -> "Never send money to online romantic interests."
            matchedPatterns.contains("charity_scam") -> "Verify charity at guidestarindia.org before donating."
            matchedPatterns.contains("refund_scam") -> "Contact seller/platform directly through official app."
            matchedPatterns.contains("sim_swap") -> "Contact your mobile operator immediately."
            matchedPatterns.contains("fake_screenshot") -> "Check your bank account directly. Don't trust screenshots."
            matchedPatterns.contains("suspicious_app") -> "Only download apps from Google Play Store."
            matchedPatterns.contains("pin_for_receiving") -> "Remember: receiving money NEVER needs a UPI PIN."
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
            originalText = "$title $text"
        )
    }
}
