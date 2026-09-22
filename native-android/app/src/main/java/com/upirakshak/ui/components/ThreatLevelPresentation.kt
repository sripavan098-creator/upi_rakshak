package com.upirakshak.ui.components

import androidx.annotation.StringRes
import androidx.compose.ui.graphics.Color
import com.upirakshak.R
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.ui.theme.RiskHigh
import com.upirakshak.ui.theme.RiskMed
import com.upirakshak.ui.theme.Safe

/**
 * Maps a [ThreatLevel] onto the strings and colours the UI renders it with.
 * Kept in the UI layer so the engine stays free of Android resources, and here
 * rather than per-screen so a verdict reads the same everywhere.
 */
val ThreatLevel.badgeRes: Int
    @StringRes get() = when (this) {
        ThreatLevel.HIGH -> R.string.threat_detected
        ThreatLevel.MEDIUM -> R.string.suspicious
        ThreatLevel.SAFE -> R.string.safe
    }

val ThreatLevel.tint: Color
    get() = when (this) {
        ThreatLevel.HIGH -> RiskHigh
        ThreatLevel.MEDIUM -> RiskMed
        ThreatLevel.SAFE -> Safe
    }
