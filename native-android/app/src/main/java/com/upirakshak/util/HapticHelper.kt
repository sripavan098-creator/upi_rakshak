package com.upirakshak.util

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import com.upirakshak.engine.ThreatLevel

object HapticHelper {
    
    private const val TAG = "HapticHelper"
    
    fun vibrateForThreat(context: Context, level: ThreatLevel) {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            manager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        
        if (!vibrator.hasVibrator()) {
            Log.w(TAG, "Device has no vibrator")
            return
        }
        
        val effect = when (level) {
            ThreatLevel.HIGH -> VibrationEffect.createWaveform(
                longArrayOf(0, 250, 100, 250, 100, 400), -1
            )
            ThreatLevel.MEDIUM -> VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE)
            ThreatLevel.SAFE -> return
        }
        
        try {
            vibrator.vibrate(effect)
            Log.d(TAG, "Vibrated for $level threat")
        } catch (e: Exception) {
            Log.e(TAG, "Vibrate failed", e)
        }
    }
}
