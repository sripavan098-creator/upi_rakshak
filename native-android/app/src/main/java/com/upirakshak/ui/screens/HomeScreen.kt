package com.upirakshak.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
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
    val context = androidx.compose.ui.platform.LocalContext.current
    val scrollState = rememberScrollState()
    var notifAccessGranted by remember { mutableStateOf(PermissionHelper.hasNotificationAccess(context)) }
    var overlayGranted by remember { mutableStateOf(PermissionHelper.hasOverlayPermission(context)) }
    val lastAnalysis by NotificationProcessor.lastAnalysis.collectAsState()

    LaunchedEffect(Unit) {
        notifAccessGranted = PermissionHelper.hasNotificationAccess(context)
        overlayGranted = PermissionHelper.hasOverlayPermission(context)
    }

    Column(
        modifier = modifier.fillMaxSize().background(Paper).verticalScroll(scrollState).padding(horizontal = 20.dp, vertical = 18.dp)
    ) {
        Text("FINANCIAL SAFETY / ANDROID", color = InkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
        Text("UPI Rakshak", color = Ink, fontSize = 34.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 8.dp))
        Text("The guard that explains the trap before you pay.", color = InkLight, fontSize = 16.sp, lineHeight = 22.sp, modifier = Modifier.padding(top = 4.dp, bottom = 18.dp))

        Row(modifier = Modifier.fillMaxWidth().border(1.dp, BorderStrong).padding(vertical = 10.dp)) {
            RegisterItem("SIGNALS", "257", "native keywords", Modifier.weight(1f))
            RegisterItem("CUES", "2", "English + Hinglish", Modifier.weight(1f))
            RegisterItem("TESTS", "17", "passing", Modifier.weight(1f))
        }

        Spacer(Modifier.height(18.dp))
        StatusCard(
            notificationGranted = notifAccessGranted,
            overlayGranted = overlayGranted,
            onGrantNotification = onRequestNotificationAccess,
            onGrantOverlay = onRequestOverlay
        )

        Spacer(Modifier.height(16.dp))
        Text("THE DECISION MOMENT", color = StampRed, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.4.sp)
        Text("Run the evidence demo", color = Ink, fontSize = 23.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
        Text("A real Android overlay is triggered with a sample electricity scam so you can see the notification, rule evidence, and safe action.", color = InkLight, fontSize = 13.sp, lineHeight = 19.sp, modifier = Modifier.padding(top = 4.dp, bottom = 10.dp))

        Button(
            onClick = {
                val fakeAnalysis = ThreatAnalysis(
                    level = ThreatLevel.HIGH,
                    reasons = listOf(
                        "Urgency: disconnected tonight",
                        "Payment trap: enter UPI PIN to receive",
                        "Suspicious UPI ID: bsescare@icici"
                    ),
                    matchedPatterns = listOf("disconnected", "enter upi pin", "bsescare@icici"),
                    suggestedAction = "Yeh message fraud hai. Kisi ko bhi OTP ya UPI PIN mat do.",
                    officialRoute = "Official BSES app ya bbps.npci.org.in use karein",
                    originalText = "URGENT: Electricity disconnected tonight, pay bsescare@icici"
                )
                HapticHelper.vibrateForThreat(context, ThreatLevel.HIGH)
                VoiceOutput.speak(fakeAnalysis.suggestedAction)
                RakshakOverlayService.show(context, fakeAnalysis)
            },
            modifier = Modifier.fillMaxWidth().height(54.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Ink, contentColor = Paper),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp)
        ) { Text("SIMULATE SCAM ATTACK  →", fontSize = 14.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.8.sp) }

        Spacer(Modifier.height(10.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            SecondaryAction("SCAN QR", onScanQr, Modifier.weight(1f))
            SecondaryAction("LANGUAGE", onLanguageSelect, Modifier.weight(1f))
        }

        Spacer(Modifier.height(24.dp))
        Text("LIVE EVIDENCE", color = InkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.4.sp)
        Spacer(Modifier.height(8.dp))
        lastAnalysis?.let { ThreatCard(analysis = it) } ?: EmptyEvidence()
        Spacer(Modifier.height(24.dp))
        Text("v1.0.0 / BUILT FOR iQOO + FUNTOUCH OS", color = InkLight, fontSize = 10.sp, letterSpacing = 0.8.sp, modifier = Modifier.align(androidx.compose.ui.Alignment.CenterHorizontally))
    }
}

@Composable
private fun RegisterItem(label: String, value: String, detail: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier.padding(horizontal = 8.dp)) {
        Text(label, color = InkLight, fontSize = 9.sp, letterSpacing = 1.sp)
        Text(value, color = Ink, fontSize = 22.sp, fontWeight = FontWeight.Black)
        Text(detail, color = InkLight, fontSize = 10.sp)
    }
}

@Composable
private fun SecondaryAction(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(onClick = onClick, modifier = modifier.height(46.dp), colors = ButtonDefaults.buttonColors(containerColor = PaperDark, contentColor = Ink), shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp)) {
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
    }
}

@Composable
private fun EmptyEvidence() {
    Column(modifier = Modifier.fillMaxWidth().border(1.dp, BorderStrong).padding(20.dp)) {
        Text("NO RECENT EVIDENCE", color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        Text("Run the simulation or enable notification access to see the first analysis here.", color = InkLight, fontSize = 13.sp, lineHeight = 18.sp, modifier = Modifier.padding(top = 5.dp))
    }
}
