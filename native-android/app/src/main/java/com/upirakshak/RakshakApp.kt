package com.upirakshak

import android.app.Application
import android.util.Log
import com.upirakshak.util.AppContextHolder
import com.upirakshak.voice.VoiceOutput

class RakshakApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AppContextHolder.init(this)
        VoiceOutput.init(this) { hindiAvailable ->
            Log.d("Rakshak", "TTS initialized. Hindi=$hindiAvailable")
        }
    }

    override fun onTerminate() {
        VoiceOutput.shutdown()
        super.onTerminate()
    }
}
