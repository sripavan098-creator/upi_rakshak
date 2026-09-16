package com.upirakshak.voice

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

object VoiceOutput {
    
    private const val TAG = "VoiceOutput"
    private var tts: TextToSpeech? = null
    private var isInitialized = false
    
    fun init(context: Context) {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Try Hindi first, fallback to English
                val hindiResult = tts?.setLanguage(Locale("hi", "IN"))
                if (hindiResult == TextToSpeech.LANG_MISSING_DATA || 
                    hindiResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                    // Fallback to Indian English
                    tts?.setLanguage(Locale("en", "IN"))
                }
                
                tts?.setSpeechRate(0.9f)
                isInitialized = true
                Log.i(TAG, "✓ TTS initialized")
            } else {
                Log.e(TAG, "TTS initialization failed")
            }
        }
    }
    
    fun speak(text: String) {
        if (!isInitialized) {
            Log.w(TAG, "TTS not initialized")
            return
        }
        
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "rakshak_alert")
        Log.d(TAG, "Speaking: $text")
    }
    
    fun stop() {
        tts?.stop()
    }
    
    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isInitialized = false
    }
    
    fun isHindiAvailable(): Boolean {
        if (!isInitialized) return false
        val result = tts?.isLanguageAvailable(Locale("hi", "IN"))
        return result == TextToSpeech.LANG_AVAILABLE || 
               result == TextToSpeech.LANG_COUNTRY_AVAILABLE
    }
}
