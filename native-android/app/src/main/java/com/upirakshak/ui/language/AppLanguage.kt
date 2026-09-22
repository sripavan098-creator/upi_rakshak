package com.upirakshak.ui.language

data class AppLanguage(
    val code: String,
    val label: String,
    val nativeLabel: String
)

val supportedLanguages = listOf(
    // Only locales with packaged Android resources are offered here.
    // This keeps language switching deterministic without downloading packs.
    AppLanguage("en", "English", "English"),
    AppLanguage("hi", "Hindi", "हिन्दी"),
    AppLanguage("bn", "Bengali", "বাংলা"),
    AppLanguage("ta", "Tamil", "தமிழ்"),
    AppLanguage("te", "Telugu", "తెలుగు"),
    AppLanguage("mr", "Marathi", "मराठी")
)
