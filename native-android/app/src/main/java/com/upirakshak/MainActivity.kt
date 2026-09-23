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
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.upirakshak.R
import com.upirakshak.notification.RakshakGuardService
import com.upirakshak.ui.onboarding.OnboardingPlan
import com.upirakshak.ui.onboarding.OnboardingPreferences
import com.upirakshak.ui.onboarding.OnboardingState
import com.upirakshak.ui.screens.*
import com.upirakshak.ui.theme.RakshakTheme
import com.upirakshak.ui.theme.NavyDark
import com.upirakshak.ui.theme.TextPrimary
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

                val lifecycleOwner = LocalLifecycleOwner.current
                var notificationGranted by remember { mutableStateOf(false) }
                var overlayGranted by remember { mutableStateOf(false) }
                var showOnboarding by remember { mutableStateOf(false) }

                // Permissions are granted in system settings, so the app cannot
                // observe the result directly. Re-check whenever we come back.
                DisposableEffect(lifecycleOwner) {
                    val observer = LifecycleEventObserver { _, event ->
                        if (event == Lifecycle.Event.ON_RESUME) {
                            notificationGranted =
                                PermissionHelper.hasNotificationAccess(this@MainActivity)
                            overlayGranted =
                                PermissionHelper.hasOverlayPermission(this@MainActivity)
                            val state = OnboardingState(
                                notificationAccessGranted = notificationGranted,
                                overlayGranted = overlayGranted,
                                dismissed = OnboardingPreferences.isDismissed(this@MainActivity)
                            )
                            showOnboarding = OnboardingPlan.shouldShow(state)
                        }
                    }
                    lifecycleOwner.lifecycle.addObserver(observer)
                    onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
                }
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = NavyDark
                ) {
                    if (showOnboarding) {
                        OnboardingScreen(
                            notificationGranted = notificationGranted,
                            overlayGranted = overlayGranted,
                            onGrantNotification = {
                                PermissionHelper.requestNotificationAccess(this@MainActivity)
                            },
                            onGrantOverlay = {
                                PermissionHelper.requestOverlayPermission(this@MainActivity)
                            },
                            onChooseLanguage = { showLanguageSelector = true },
                            onSkip = {
                                OnboardingPreferences.setDismissed(this@MainActivity, true)
                                showOnboarding = false
                            }
                        )
                    } else if (showQrScanner) {
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
                                        icon = { Icon(Icons.Default.Home, contentDescription = stringResource(R.string.home)) },
                                        icon = { Icon(Icons.Default.Home, contentDescription = null) },
                                        label = { Text(stringResource(R.string.home)) },
                                        selected = currentTab == 0,
                                        onClick = { currentTab = 0 }
                                    )
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.TrendingUp, contentDescription = stringResource(R.string.cash_flow)) },
                                        label = { Text(stringResource(R.string.cash_flow)) },
                                        icon = { Icon(Icons.Default.AttachMoney, contentDescription = null) },
                                        label = { Text(stringResource(R.string.cash_flow_forecast)) },
                                        selected = currentTab == 1,
                                        onClick = { currentTab = 1 }
                                    )
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.AccountBalance, contentDescription = stringResource(R.string.loans)) },
                                        icon = { Icon(Icons.Default.AttachMoney, contentDescription = null) },
                                        label = { Text(stringResource(R.string.loans)) },
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