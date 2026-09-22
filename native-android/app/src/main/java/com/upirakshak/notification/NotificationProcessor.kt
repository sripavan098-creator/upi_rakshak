package com.upirakshak.notification

import android.content.Context
import android.util.Log
import com.upirakshak.engine.RulesEngine
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.overlay.RakshakOverlayService
import com.upirakshak.ui.language.LanguageManager
import com.upirakshak.util.AppContextHolder
import com.upirakshak.util.HapticHelper
import com.upirakshak.voice.VoiceOutput
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object NotificationProcessor {
    private const val TAG = "NotificationProcessor"
    private const val PREFS = "offline_analysis"
    private const val SEP = "\u001F"

    private val _lastAnalysis = MutableStateFlow<ThreatAnalysis?>(null)
    val lastAnalysis: StateFlow<ThreatAnalysis?> = _lastAnalysis.asStateFlow()

    init {
        // Application.onCreate initializes AppContextHolder before this object is first used.
        runCatching { restoreLastAnalysis(AppContextHolder.get()) }
    }

    fun process(title: String, text: String, packageName: String) {
        Log.d(TAG, "Processing notification from $packageName: $title")
        val analysis = RulesEngine.analyze(title, text)
        _lastAnalysis.value = analysis
        persistAnalysis(AppContextHolder.get(), analysis)
        Log.d(TAG, "Analysis result: ${analysis.level} - ${analysis.reasons}")

        if (analysis.level != ThreatLevel.SAFE) {
            try {
                val context = AppContextHolder.get()
                HapticHelper.vibrateForThreat(context, analysis.level)
                val currentLanguage = LanguageManager.getCurrentLanguage(context)
                VoiceOutput.speakInLanguage(analysis.suggestedAction, currentLanguage)
                RakshakOverlayService.show(context = context, analysis = analysis)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to trigger threat response", e)
            }
        }
    }

    fun clearAnalysis() {
        _lastAnalysis.value = null
        runCatching { AppContextHolder.get().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply() }
    }

    private fun persistAnalysis(context: Context, analysis: ThreatAnalysis) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("level", analysis.level.name)
            .putString("reasons", analysis.reasons.joinToString(SEP))
            .putString("patterns", analysis.matchedPatterns.joinToString(SEP))
            .putString("action", analysis.suggestedAction)
            .putString("route", analysis.officialRoute ?: "")
            .putString("original", analysis.originalText)
            .apply()
    }

    private fun restoreLastAnalysis(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val level = prefs.getString("level", null)?.let { runCatching { ThreatLevel.valueOf(it) }.getOrNull() } ?: return
        _lastAnalysis.value = ThreatAnalysis(
            level = level,
            reasons = prefs.getString("reasons", "").orEmpty().split(SEP).filter(String::isNotBlank),
            matchedPatterns = prefs.getString("patterns", "").orEmpty().split(SEP).filter(String::isNotBlank),
            suggestedAction = prefs.getString("action", "").orEmpty(),
            officialRoute = prefs.getString("route", "").orEmpty().ifBlank { null },
            originalText = prefs.getString("original", "").orEmpty()
        )
    }
}
