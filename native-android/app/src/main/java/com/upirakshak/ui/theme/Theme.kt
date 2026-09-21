package com.upirakshak.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val RakshakColorScheme = lightColorScheme(
    primary = Ink,
    secondary = SealGold,
    background = Paper,
    surface = Paper,
    error = Danger,
    onBackground = Ink,
    onSurface = Ink,
    onPrimary = Paper,
    onSecondary = Ink,
    onError = Paper
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
