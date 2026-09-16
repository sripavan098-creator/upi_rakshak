package com.upirakshak.voice

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import androidx.core.content.ContextCompat

/**
 * Voice input controller for speech-to-text in Hindi/English
 * Uses Android's SpeechRecognizer API
 */
class VoiceInputController(private val context: Context) {
    
    companion object {
        private const val TAG = "VoiceInput"
    }
    
    private var recognizer: SpeechRecognizer? = null
    private var onResult: ((String) -> Unit)? = null
    private var onError: ((String) -> Unit)? = null
    
    /**
     * Check if speech recognition is available on this device
     */
    fun isAvailable(): Boolean {
        return SpeechRecognizer.isRecognitionAvailable(context)
    }
    
    /**
     * Check if RECORD_AUDIO permission is granted
     */
    fun hasPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * Start listening for speech
     * @param onResult Callback with recognized text
     * @param onError Callback with error message
     */
    fun startListening(onResult: (String) -> Unit, onError: (String) -> Unit) {
        if (!isAvailable()) {
            onError("Speech recognition not available on this device")
            return
        }
        
        if (!hasPermission()) {
            onError("RECORD_AUDIO permission not granted")
            return
        }
        
        this.onResult = onResult
        this.onError = onError
        
        recognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(createRecognitionListener())
        }
        
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Boliye Rakshak se...")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        
        try {
            recognizer?.startListening(intent)
            Log.d(TAG, "Started listening")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start listening", e)
            onError("Failed to start voice input: ${e.message}")
        }
    }
    
    /**
     * Stop listening
     */
    fun stopListening() {
        recognizer?.stopListening()
        Log.d(TAG, "Stopped listening")
    }
    
    /**
     * Destroy the recognizer and release resources
     */
    fun destroy() {
        recognizer?.destroy()
        recognizer = null
        onResult = null
        onError = null
        Log.d(TAG, "Destroyed")
    }
    
    /**
     * Create recognition listener with Hinglish error messages
     */
    private fun createRecognitionListener() = object : RecognitionListener {
        
        override fun onReadyForSpeech(params: Bundle?) {
            Log.d(TAG, "Ready for speech")
        }
        
        override fun onBeginningOfSpeech() {
            Log.d(TAG, "Speech started")
        }
        
        override fun onRmsChanged(rmsdB: Float) {
            // Audio level callback - can be used for UI visualization
        }
        
        override fun onBufferReceived(buffer: ByteArray?) {
            // Buffer received - not used
        }
        
        override fun onEndOfSpeech() {
            Log.d(TAG, "Speech ended")
        }
        
        override fun onError(error: Int) {
            val errorMessage = when (error) {
                SpeechRecognizer.ERROR_NO_MATCH -> "Kuch samajh nahi aaya, phir se boliye"
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Awaaz nahi aayi, phir se try karein"
                SpeechRecognizer.ERROR_NETWORK -> "Network issue hai, internet check karein"
                SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout, phir se try karein"
                SpeechRecognizer.ERROR_AUDIO -> "Audio error, phir se try karein"
                SpeechRecognizer.ERROR_CLIENT -> "Client error"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Permission nahi hai"
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy hai, thodi der baad try karein"
                SpeechRecognizer.ERROR_SERVER -> "Server error, phir se try karein"
                else -> "Voice input failed (code $error)"
            }
            
            Log.e(TAG, "Recognition error: $error - $errorMessage")
            onError?.invoke(errorMessage)
        }
        
        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull() ?: ""
            
            if (text.isNotBlank()) {
                Log.d(TAG, "Recognized: $text")
                onResult?.invoke(text)
            } else {
                Log.w(TAG, "No text recognized")
                onError?.invoke("Kuch samajh nahi aaya, phir se boliye")
            }
        }
        
        override fun onPartialResults(partialResults: Bundle?) {
            // Partial results - can be used for real-time UI updates
        }
        
        override fun onEvent(eventType: Int, params: Bundle?) {
            // Reserved for future events
        }
    }
}
