package com.upirakshak.voice

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

object VoiceOutput {
    
    private const val TAG = "VoiceOutput"
    private var tts: TextToSpeech? = null
    private var isReady = false
    private var isHindiAvailable = false
    private var initListener: ((Boolean) -> Unit)? = null
    
    fun init(context: Context, onReady: ((Boolean) -> Unit)? = null) {
        initListener = onReady
        tts = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val hindi = Locale("hi", "IN")
                val result = tts?.setLanguage(hindi)
                isHindiAvailable = result != TextToSpeech.LANG_MISSING_DATA &&
                                   result != TextToSpeech.LANG_NOT_SUPPORTED
                if (!isHindiAvailable) {
                    // Fallback to English (India)
                    tts?.setLanguage(Locale("en", "IN"))
                    Log.w(TAG, "Hindi TTS not available, falling back to en-IN")
                }
                tts?.setSpeechRate(0.92f)
                tts?.setPitch(1.0f)
                isReady = true
                initListener?.invoke(isHindiAvailable)
                Log.d(TAG, "TTS ready. Hindi=$isHindiAvailable")
            } else {
                Log.e(TAG, "TTS init failed: $status")
                isReady = false
                initListener?.invoke(false)
            }
        }
    }
    
    fun speak(text: String, utteranceId: String = "rakshak_${System.currentTimeMillis()}") {
        if (!isReady) {
            Log.w(TAG, "TTS not ready, skipping speak")
            return
        }
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
        Log.d(TAG, "Speaking: $text")
    }
    
    fun speakInLanguage(text: String, languageCode: String, utteranceId: String = "rakshak_${System.currentTimeMillis()}") {
        if (!isReady || tts == null) {
            Log.w(TAG, "TTS not ready, skipping speak")
            return
        }
        
        val locale = Locale.forLanguageTag(languageCode)
        val result = tts!!.setLanguage(locale)
        
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            Log.w(TAG, "TTS: $languageCode not supported. Trying Hindi, then English.")
            val fallback = when {
                tts!!.setLanguage(Locale("hi", "IN")) != TextToSpeech.LANG_MISSING_DATA &&
                    tts!!.setLanguage(Locale("hi", "IN")) != TextToSpeech.LANG_NOT_SUPPORTED -> Locale("hi", "IN")
                else -> Locale("en", "IN")
            }
            tts!!.setLanguage(fallback)
        }
        
        tts!!.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
        Log.d(TAG, "Speaking in $languageCode: $text")
    }
    
    fun isNativeVoiceAvailable(context: Context, languageCode: String): Boolean {
        val tempTts = TextToSpeech(context) {}
        val result = tempTts.setLanguage(Locale.forLanguageTag(languageCode))
        tempTts.shutdown()
        return result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED
    }
    
    fun stop() {
        tts?.stop()
    }
    
    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isReady = false
    }
    
    fun isAvailable(): Boolean = isReady
    fun hasHindi(): Boolean = isHindiAvailable
    
    fun openTtsInstallSettings(context: Context) {
        val intent = Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Log.e(TAG, "No TTS install activity", e)
        }
    }
}
