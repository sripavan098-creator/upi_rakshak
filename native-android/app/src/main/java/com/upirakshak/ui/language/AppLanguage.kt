package com.upirakshak.ui.language

data class AppLanguage(
    val code: String,
    val label: String,
    val nativeLabel: String
)

val supportedLanguages = listOf(
    AppLanguage("en", "English", "English"),
    AppLanguage("hi", "Hindi", "हिन्दी"),
    AppLanguage("bn", "Bengali", "বাংলা"),
    AppLanguage("ta", "Tamil", "தமிழ்"),
    AppLanguage("te", "Telugu", "తెలుగు"),
    AppLanguage("kn", "Kannada", "ಕನ್ನಡ"),
    AppLanguage("ml", "Malayalam", "മലയാളം"),
    AppLanguage("mr", "Marathi", "मराठी"),
    AppLanguage("gu", "Gujarati", "ગુજરાતી"),
    AppLanguage("pa", "Punjabi", "ਪੰਜਾਬੀ"),
    AppLanguage("or", "Odia", "ଓଡ଼ିଆ"),
    AppLanguage("as", "Assamese", "অসমীয়া"),
    AppLanguage("ur", "Urdu", "اردو"),
    AppLanguage("ne", "Nepali", "नेपाली"),
    AppLanguage("sa", "Sanskrit", "संस्कृतम्"),
    AppLanguage("kok", "Konkani", "कोंकणी"),
    AppLanguage("mai", "Maithili", "मैथिली"),
    AppLanguage("doi", "Dogri", "डोगरी"),
    AppLanguage("brx", "Bodo", "बड़ो"),
    AppLanguage("mni", "Manipuri", "মৈতৈলোন্"),
    AppLanguage("sat", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ"),
    AppLanguage("ks", "Kashmiri", "کٲشُر"),
    AppLanguage("sd", "Sindhi", "سنڌي")
)
