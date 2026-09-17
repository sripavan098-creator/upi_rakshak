package com.upirakshak.ui.theme

import androidx.compose.ui.graphics.Color

// "The Notice" Design System - Paper/Ink Theme
// Inspired by Indian public notices and official documents

// Core Palette
val Paper = Color(0xFFE9E7DB)           // Manila ledger stock - primary background
val PaperDark = Color(0xFFD4D2C4)       // Slightly darker paper for depth
val Ink = Color(0xFF1B2A21)             // Registrar's green-black ink - primary text
val InkLight = Color(0xFF2D3E34)        // Lighter ink for secondary text
val StampRed = Color(0xFFC2241B)        // Rubber-stamp vermilion - LIVE THREATS ONLY
val BbpsGreen = Color(0xFF138808)       // BBPS official green - safe actions
val SealGold = Color(0xFFB8860B)        // Official seal gold - for verdicts

// Semantic Colors
val Safe = BbpsGreen
val Warning = Color(0xFFD97706)         // Amber for medium risk
val Danger = StampRed                   // Red ONLY for active threats
val Info = Color(0xFF1E40AF)            // Blue for informational

// Text Colors
val TextPrimary = Ink
val TextSecondary = InkLight

// Legacy aliases for compatibility
val Navy = Paper
val NavyDark = Paper
val Slate = PaperDark
val Emerald = BbpsGreen
val Parchment = Paper
val Muted = InkLight
val Muted2 = InkLight
val Gold = SealGold
val GoldBright = SealGold
val RiskMed = Warning
val RiskHigh = StampRed
val Border = Color(0xFF1B2A21)
val BorderStrong = Color(0xFF1B2A21)
