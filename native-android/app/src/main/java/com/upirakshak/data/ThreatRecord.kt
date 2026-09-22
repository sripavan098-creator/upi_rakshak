package com.upirakshak.data

import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel

/**
 * A threat the app has assessed, kept so the user can look back at what was
 * flagged and when.
 */
data class ThreatRecord(
    val id: String,
    val timestampMillis: Long,
    val level: ThreatLevel,
    val title: String,
    val sourcePackage: String,
    val reasons: List<String>,
    val suggestedAction: String,
    val officialRoute: String?,
    val originalText: String
)

fun ThreatAnalysis.toRecord(
    id: String,
    timestampMillis: Long,
    title: String,
    sourcePackage: String
): ThreatRecord = ThreatRecord(
    id = id,
    timestampMillis = timestampMillis,
    level = level,
    title = title,
    sourcePackage = sourcePackage,
    reasons = reasons,
    suggestedAction = suggestedAction,
    officialRoute = officialRoute,
    originalText = originalText
)
