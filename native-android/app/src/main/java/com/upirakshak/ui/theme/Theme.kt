package com.upirakshak.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val RakshakColorScheme = darkColorScheme(
    primary = Emerald,
    secondary = Emerald,
    background = NavyDark,
    surface = Slate,
    error = Danger,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onPrimary = NavyDark,
    onSecondary = NavyDark,
    onError = TextPrimary
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
