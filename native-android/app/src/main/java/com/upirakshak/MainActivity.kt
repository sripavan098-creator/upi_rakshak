package com.upirakshak

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.upirakshak.ui.screens.CashFlowScreen
import com.upirakshak.ui.screens.HomeScreen
import com.upirakshak.ui.theme.RakshakTheme
import com.upirakshak.ui.theme.NavyDark
import com.upirakshak.util.PermissionHelper

class MainActivity : ComponentActivity() {

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Log.d("Rakshak", "POST_NOTIFICATIONS permission granted")
        } else {
            Log.w("Rakshak", "POST_NOTIFICATIONS permission denied")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request POST_NOTIFICATIONS permission on Android 13+ (API 33+)
        requestNotificationPermission()

        setContent {
            RakshakTheme {
                var currentTab by remember { mutableIntStateOf(0) }
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = NavyDark
                ) {
                    when (currentTab) {
                        0 -> HomeScreen(
                            onRequestNotificationAccess = { PermissionHelper.requestNotificationAccess(this@MainActivity) },
                            onRequestOverlay = { PermissionHelper.requestOverlayPermission(this@MainActivity) }
                        )
                        1 -> CashFlowScreen()
                    }
                }
            }
        }
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            when {
                ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED -> {
                    Log.d("Rakshak", "POST_NOTIFICATIONS already granted")
                }
                else -> {
                    requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }
        }
    }
}
