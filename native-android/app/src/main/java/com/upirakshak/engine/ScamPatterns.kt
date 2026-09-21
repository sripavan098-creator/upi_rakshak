package com.upirakshak.engine

/**
 * Comprehensive scam detection patterns for Indian UPI fraud detection
 * Includes 200+ patterns across 22+ fraud categories
 */
object ScamPatterns {

    // === EXISTING PATTERNS ===
    
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
        "enter upi pin to receive", "pin to receive", "enter upi pin"
    )
    
    // Lookalike domain patterns
    val LOOKALIKE_DOMAINS = listOf(
        "bses-", "sbi-", "paytm-", "phonepe-", "gpay-",
        "hdfc-", "icici-", "axis-", "kyc-", "verify-"
    )
    
    // Suspicious keywords
    val SUSPICIOUS_KEYWORDS = listOf(
        "kyc", "verify", "verification", "otp", "password",
        "penalty", "fine", "reward", "lottery", "winner"
    )
    
    // UPI ID regex
    val UPI_ID_REGEX = Regex("""[\w.-]+@[\w]+""", RegexOption.IGNORE_CASE)
    
    // URL regex
    val URL_REGEX = Regex("""(https?://|www\.)\S+""", RegexOption.IGNORE_CASE)

    // === NEW FRAUD CATEGORIES ===

    // AI/Deepfake scams
    val AI_DEEPFAKE_KEYWORDS = listOf(
        "deepfake", "voice clone", "ai voice", "video call police",
        "digital arrest", "virtual custody", "video call cbi", "video call custom",
        "cbi officer", "trai officer", "digital custody"
    )

    // Autopay mandate traps
    val AUTOPAY_TRAP_KEYWORDS = listOf(
        "autopay", "auto-pay", "mandate", "recurring payment",
        "verify with ₹1", "verify with rs 1", "trial activation",
        "subscription verify", "activate autopay", "mandate setup",
        "₹1 to activate", "activate subscription"
    )

    // AEPS biometric fraud
    val AEPS_FRAUD_KEYWORDS = listOf(
        "aeps", "aadhaar payment", "biometric payment", "fingerprint payment",
        "bank agent visit", "government agent", "aadhaar update agent"
    )

    // Call merging scams
    val CALL_MERGE_KEYWORDS = listOf(
        "stay on line", "do not hang up", "merge call", "merged call",
        "conference call", "otp verification call", "transfer to bank",
        "connecting to bank", "please hold"
    )

    // Rogue QR device takeover
    val ROGUE_QR_KEYWORDS = listOf(
        "registration alert", "upi activation", "device takeover",
        "scan qr registration", "qr activation", "multiple registration",
        "upi register", "new device registration"
    )

    // Malware APK distribution
    val MALWARE_APK_KEYWORDS = listOf(
        "install apk", "download apk", "e-challan apk", "echallan apk",
        "wedding invitation apk", "traffic fine apk", "install this file",
        "enable unknown sources", "allow install"
    )

    // Remote access apps
    val REMOTE_ACCESS_KEYWORDS = listOf(
        "anydesk", "teamviewer", "quicksupport", "screen share",
        "screen sharing", "remote access", "rustdesk", "airdroid",
        "share your screen", "install screen app"
    )

    // Digital arrest scams
    val DIGITAL_ARREST_KEYWORDS = listOf(
        "digital arrest", "virtual custody", "online arrest",
        "police verification", "cbi verification", "customs verification",
        "money laundering", "terror funding", "your parcel contains",
        "drug parcel", "illegal items in your name"
    )

    // Investment scams
    val INVESTMENT_SCAM_KEYWORDS = listOf(
        "guaranteed returns", "guaranteed profit", "double your money",
        "trading group", "crypto signals", "investment tips",
        "sebi registered broker", "high return investment",
        "part time trading", "crypto investment", "forex trading"
    )

    // Loan app traps
    val LOAN_APP_TRAP_KEYWORDS = listOf(
        "instant loan", "quick loan", "loan in minutes", "loan without documents",
        "contact access", "gallery access", "processing fee upfront",
        "loan within 10 minutes", "7 day loan", "15 day loan",
        "loan recovery", "morphed photos"
    )

    // Job scams
    val JOB_SCAM_KEYWORDS = listOf(
        "work from home", "part time job", "task based job", "registration fee job",
        "daily income", "rating task", "review task", "like and earn",
        "job offer fee", "job deposit", "airline recruitment", "registration fee"
    )

    // Lottery scams
    val LOTTERY_SCAM_KEYWORDS = listOf(
        "kbc winner", "kbc lottery", "lucky draw", "lucky winner",
        "bumper prize", "jackpot winner", "you have won", "prize tax",
        "claim your prize", "processing fee for prize", "pay ₹"
    )

    // Customer care scams
    val CUSTOMER_CARE_SCAM_KEYWORDS = listOf(
        "customer care number", "toll free number", "helpline number",
        "call this number", "support executive", "technical support",
        "act fibernet helpline", "blinkit helpline", "bank helpline"
    )

    // Courier scams
    val COURIER_SCAM_KEYWORDS = listOf(
        "parcel seized", "parcel contains drugs", "parcel customs",
        "courier customs", "india post parcel", "dtdc parcel",
        "fedex parcel", "parcel held", "redelivery fee", "customs clearance fee"
    )

    // Sextortion scams
    val SEXTORTION_KEYWORDS = listOf(
        "video call recording", "your video viral", "upload your video",
        "morphed video", "compromising video", "honey trap",
        "video call blackmail"
    )

    // Romance scams
    val ROMANCE_SCAM_KEYWORDS = listOf(
        "matrimonial profile", "dating profile", "foreign boyfriend",
        "nri fiancé", "army officer love", "doctor abroad",
        "visa fee for marriage", "customs for gift"
    )

    // Charity scams
    val CHARITY_SCAM_KEYWORDS = listOf(
        "donate via upi", "donation upi", "gaza relief", "palestine relief",
        "flood relief donation", "earthquake relief", "fake ngo", "fake trust"
    )

    // Refund scams
    val REFUND_SCAM_KEYWORDS = listOf(
        "refund via qr", "refund scan qr", "cashback scan", "qr to receive",
        "technical error retry", "payment failed retry", "olx buyer",
        "flipkart refund", "amazon refund link"
    )

    // SIM swap fraud
    val SIM_SWAP_KEYWORDS = listOf(
        "sim swap", "sim replace", "sim blocked", "sim upgrade",
        "no network otp", "receive otp but no request", "duplicate sim",
        "sim will be blocked"
    )

    // Fake screenshot scams
    val FAKE_SCREENSHOT_KEYWORDS = listOf(
        "payment screenshot", "check your phone i paid", "screenshot proof",
        "technical error payment", "payment not received check"
    )

    // Suspicious app names
    val SUSPICIOUS_APPS = listOf(
        "e-challan", "echallan", "traffic-fine", "wedding-invite",
        "wedding-invitation", "kyc-update", "kyc-verify", "crypto-trade",
        "crypto-trading", "loan-radar", "quick-funds", "instant-loan"
    )
}
