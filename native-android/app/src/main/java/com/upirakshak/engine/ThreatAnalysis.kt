package com.upirakshak.engine

data class ThreatAnalysis(
    val level: ThreatLevel,
    val reasons: List<String>,
    val matchedPatterns: List<String>,
    val suggestedAction: String,
    val officialRoute: String? = null,
    val originalText: String
)
