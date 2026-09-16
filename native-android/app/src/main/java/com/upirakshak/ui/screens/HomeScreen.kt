package com.upirakshak.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.notification.NotificationProcessor
import com.upirakshak.overlay.RakshakOverlayService
import com.upirakshak.ui.components.StatusCard
import com.upirakshak.ui.components.ThreatCard
import com.upirakshak.ui.theme.*
import com.upirakshak.util.HapticHelper
import com.upirakshak.util.PermissionHelper
import com.upirakshak.voice.VoiceOutput

@Composable
fun HomeScreen(
    onRequestNotificationAccess: () -> Unit,
    onRequestOverlay: () -> Unit,
    onScanQr: () -> Unit = {},
    onLanguageSelect: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    
    var notifAccessGranted by remember { mutableStateOf(PermissionHelper.hasNotificationAccess(context)) }
    var overlayGranted by remember { mutableStateOf(PermissionHelper.hasOverlayPermission(context)) }
    
    val lastAnalysis by NotificationProcessor.lastAnalysis.collectAsState()
    
    // Refresh permissions on resume
    LaunchedEffect(Unit) {
        notifAccessGranted = PermissionHelper.hasNotificationAccess(context)
        overlayGranted = PermissionHelper.hasOverlayPermission(context)
    }
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(NavyDark)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Header
        Column(
            modifier = Modifier.padding(bottom = 24.dp)
        ) {
            Text(
                text = "UPI Rakshak",
                color = TextPrimary,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Your financial bodyguard",
                color = TextSecondary,
                fontSize = 14.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
        
        // Status card
        StatusCard(
            notificationGranted = notifAccessGranted,
            overlayGranted = overlayGranted,
            onGrantNotification = onRequestNotificationAccess,
            onGrantOverlay = onRequestOverlay
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Demo button
        Button(
            onClick = {
                val fakeAnalysis = ThreatAnalysis(
                    level = ThreatLevel.HIGH,
                    reasons = listOf(
                        "Urgency tactics detected",
                        "Suspicious UPI ID: bsescare@icici",
                        "Lookalike domain pattern"
                    ),
                    matchedPatterns = listOf("urgent", "bsescare@icici"),
                    suggestedAction = "Yeh message fraud hai. Kisi ko bhi OTP ya UPI PIN mat do.",
                    officialRoute = "Official BSES app ya bbps.npci.org.in use karein",
                    originalText = "URGENT: Electricity disconnected tonight, pay bsescare@icici"
                )
                
                // Trigger full experience: vibration + voice + overlay
                HapticHelper.vibrateForThreat(context, ThreatLevel.HIGH)
                VoiceOutput.speak(fakeAnalysis.suggestedAction)
                RakshakOverlayService.show(context, fakeAnalysis)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Danger,
                contentColor = TextPrimary
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = "🎯 Simulate Scam Attack",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // QR Scanner and Language buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onScanQr,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Emerald,
                    contentColor = NavyDark
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "📷 Scan QR",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Button(
                onClick = onLanguageSelect,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Slate,
                    contentColor = TextPrimary
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "🌐 Language",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Live analysis section
        Text(
            text = "Recent Threats",
            color = TextSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        lastAnalysis?.let { analysis ->
            ThreatCard(analysis = analysis)
        } ?: run {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Slate)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No recent threats detected",
                    color = TextSecondary,
                    fontSize = 14.sp
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Footer
        Text(
            text = "v1.0.0 — Built for iQOO 15",
            color = TextSecondary,
            fontSize = 12.sp,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )
    }
}
