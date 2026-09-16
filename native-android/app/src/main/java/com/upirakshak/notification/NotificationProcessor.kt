package com.upirakshak.notification

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
    
    private val _lastAnalysis = MutableStateFlow<ThreatAnalysis?>(null)
    val lastAnalysis: StateFlow<ThreatAnalysis?> = _lastAnalysis.asStateFlow()
    
    fun process(title: String, text: String, packageName: String) {
        Log.d(TAG, "Processing notification from $packageName: $title")
        
        // Analyze the notification
        val analysis = RulesEngine.analyze(title, text)
        
        // Update state
        _lastAnalysis.value = analysis
        
        Log.d(TAG, "Analysis result: ${analysis.level} - ${analysis.reasons}")
        
        // Trigger haptics, voice, and overlay if threat is detected
        if (analysis.level != ThreatLevel.SAFE) {
            try {
                // Vibrate for threat
                HapticHelper.vibrateForThreat(AppContextHolder.get(), analysis.level)
                
                // Speak warning in user's selected language
                val currentLanguage = LanguageManager.getCurrentLanguage(AppContextHolder.get())
                VoiceOutput.speakInLanguage(analysis.suggestedAction, currentLanguage)
                
                // Show overlay
                RakshakOverlayService.show(
                    context = AppContextHolder.get(),
                    analysis = analysis
                )
            } catch (e: Exception) {
                Log.e(TAG, "Failed to trigger threat response", e)
            }
        }
    }
    
    fun clearAnalysis() {
        _lastAnalysis.value = null
    }
}
