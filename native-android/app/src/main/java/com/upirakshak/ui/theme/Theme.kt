package com.upirakshak.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

// "The Notice" Design System - Light color scheme
// Paper background with ink text, stamp-red for threats only
private val RakshakColorScheme = lightColorScheme(
    primary = Ink,
    onPrimary = Paper,
    primaryContainer = PaperDark,
    onPrimaryContainer = Ink,
    secondary = BbpsGreen,
    onSecondary = Paper,
    secondaryContainer = PaperDark,
    onSecondaryContainer = Ink,
    tertiary = StampRed,
    onTertiary = Paper,
    background = Paper,
    onBackground = Ink,
    surface = Paper,
    onSurface = Ink,
    surfaceVariant = PaperDark,
    onSurfaceVariant = InkLight,
    error = StampRed,
    onError = Paper,
    outline = Ink
)

@Composable
fun RakshakTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = RakshakColorScheme,
        typography = RakshakTypography,
        content = content
    )
}

// Legacy theme for compatibility
@Composable
fun UPIRakshakTheme(content: @Composable () -> Unit) {
    RakshakTheme(content)
}
