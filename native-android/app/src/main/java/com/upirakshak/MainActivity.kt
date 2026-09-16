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
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.upirakshak.notification.RakshakGuardService
import com.upirakshak.ui.screens.*
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
        
        // Start guard service to keep notification listener alive on aggressive ROMs
        RakshakGuardService.start(this)

        setContent {
            RakshakTheme {
                var currentTab by remember { mutableIntStateOf(0) }
                var showQrScanner by remember { mutableStateOf(false) }
                var showLanguageSelector by remember { mutableStateOf(false) }
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = NavyDark
                ) {
                    if (showQrScanner) {
                        QrScannerScreen(onBack = { showQrScanner = false })
                    } else if (showLanguageSelector) {
                        LanguageSelectionScreen(onBack = { showLanguageSelector = false })
                    } else {
                        Scaffold(
                            bottomBar = {
                                NavigationBar(
                                    containerColor = NavyDark,
                                    contentColor = TextPrimary
                                ) {
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.Home, contentDescription = null) },
                                        label = { Text("Home") },
                                        selected = currentTab == 0,
                                        onClick = { currentTab = 0 }
                                    )
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.AttachMoney, contentDescription = null) },
                                        label = { Text("Cash Flow") },
                                        selected = currentTab == 1,
                                        onClick = { currentTab = 1 }
                                    )
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.AttachMoney, contentDescription = null) },
                                        label = { Text("Loans") },
                                        selected = currentTab == 2,
                                        onClick = { currentTab = 2 }
                                    )
                                }
                            }
                        ) { padding ->
                            when (currentTab) {
                                0 -> HomeScreen(
                                    onRequestNotificationAccess = { PermissionHelper.requestNotificationAccess(this@MainActivity) },
                                    onRequestOverlay = { PermissionHelper.requestOverlayPermission(this@MainActivity) },
                                    onScanQr = { showQrScanner = true },
                                    onLanguageSelect = { showLanguageSelector = true },
                                    modifier = Modifier.padding(padding)
                                )
                                1 -> CashFlowScreen(modifier = Modifier.padding(padding))
                                2 -> LoanComparisonScreen()
                            }
                        }
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
