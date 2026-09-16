package com.upirakshak.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = Gold,
    onPrimary = Ink,
    primaryContainer = Ink2,
    onPrimaryContainer = Parchment,
    secondary = Safe,
    onSecondary = Ink,
    secondaryContainer = Ink2,
    onSecondaryContainer = Parchment,
    tertiary = RiskHigh,
    onTertiary = Parchment,
    background = Ink,
    onBackground = Parchment,
    surface = Ink1,
    onSurface = Parchment,
    surfaceVariant = Ink2,
    onSurfaceVariant = Muted,
    outline = Border,
    outlineVariant = BorderStrong,
    error = RiskHigh,
    onError = Parchment
)

@Composable
fun UPIRakshakTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
