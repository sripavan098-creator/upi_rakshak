package com.upirakshak.engine

data class ThreatAnalysis(
    val level: ThreatLevel,
    /** Additive risk score. See [RiskScore]; can exceed [RiskScore.MAX_DISPLAYED]. */
    val riskScore: Int,
    val reasons: List<String>,
    val matchedPatterns: List<String>,
    val suggestedAction: String,
    val officialRoute: String? = null,
    val originalText: String
)
