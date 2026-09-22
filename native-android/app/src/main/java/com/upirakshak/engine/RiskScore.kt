package com.upirakshak.engine

/**
 * Weights and thresholds for the weighted threat score.
 *
 * The score is additive: each independent fraud signal contributes its weight, so a
 * message that trips several weak signals can still reach HIGH, and one strong payment
 * trap does not need help from anywhere else. Signals are deliberately additive rather
 * than max-scored so that corroboration raises confidence.
 *
 * Weights are calibrated so the verdicts in `RulesEngineTest` are preserved exactly;
 * the thresholds are the contract the UI and tests rely on.
 */
object RiskScore {

    // --- Signal weights ---

    /**
     * Bare pressure language, weighted per distinct matched phrase. Weak on its own (plenty
     * of legitimate mail is urgent) but a message stacking several pressure phrases is not.
     */
    const val URGENCY_KEYWORD_WEIGHT = 15

    /** A VPA whose local part looks like the pattern scammers use (`care@`, `refund@`). */
    const val SUSPICIOUS_UPI = 35

    /**
     * An explicit instruction to scan or enter a PIN to *receive* money. Never legitimate,
     * so this is sufficient to reach HIGH on its own.
     */
    const val PAYMENT_TRAP = 70

    /** A host that impersonates a brand (`bses-`, `kyc-`, `sbi-`). */
    const val LOOKALIKE_DOMAIN = 40

    /**
     * A sensitive financial term (`kyc`, `verify`, `password`, ...). Weighted per distinct
     * term.
     */
    const val SUSPICIOUS_KEYWORD_WEIGHT = 15

    /**
     * `otp` is excluded: nearly every genuine bank message contains it, and on its own it
     * is evidence of a *normal* transaction rather than of fraud.
     */
    val NEUTRAL_KEYWORDS = setOf("otp")

    /** A named fraud category the message matches outright (`digital_arrest`, `job_scam`). */
    const val HIGH_CATEGORY = 80

    /**
     * A category that is only suspicious in context (`romance_scam`, `charity_scam`,
     * `fake_screenshot`). Below [MEDIUM_THRESHOLD] on its own, so it escalates only with
     * corroborating signals.
     */
    const val MEDIUM_CATEGORY = 45

    // --- Thresholds ---

    /** At or above: a threat, and the user is shown a blocking warning. */
    const val HIGH_THRESHOLD = 70

    /** At or above (and below [HIGH_THRESHOLD]): weak or mixed signals, worth caution. */
    const val MEDIUM_THRESHOLD = 30

    /** Highest score the UI gauge displays; raw scores can exceed this. */
    const val MAX_DISPLAYED = 100

    fun levelFor(score: Int): ThreatLevel = when {
        score >= HIGH_THRESHOLD -> ThreatLevel.HIGH
        score >= MEDIUM_THRESHOLD -> ThreatLevel.MEDIUM
        else -> ThreatLevel.SAFE
    }

    /** Clamped to [0, MAX_DISPLAYED] so a gauge can render it directly. */
    fun displayedScore(score: Int): Int = score.coerceIn(0, MAX_DISPLAYED)
}
