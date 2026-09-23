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
import androidx.compose.ui.res.stringResource
import com.upirakshak.R
import com.upirakshak.data.ThreatHistoryStore
import com.upirakshak.engine.RulesEngine
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.notification.NotificationProcessor
import com.upirakshak.overlay.RakshakOverlayService
import com.upirakshak.ui.components.RecentThreatsSection
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
    modifier: Modifier = Modifier,
    onScanQr: () -> Unit = {},
    onLanguageSelect: () -> Unit = {}
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scrollState = rememberScrollState()
    var notifAccessGranted by remember { mutableStateOf(PermissionHelper.hasNotificationAccess(context)) }
    var overlayGranted by remember { mutableStateOf(PermissionHelper.hasOverlayPermission(context)) }
    val lastAnalysis by NotificationProcessor.lastAnalysis.collectAsState()
    val threatHistory by ThreatHistoryStore.history.collectAsState()

    // Analyze-any-message console (parity with the web Message Analysis Workbench)
    var manualMessage by remember { mutableStateOf("") }
    var manualAnalysis by remember { mutableStateOf<ThreatAnalysis?>(null) }

    // Re-check permissions every time the screen resumes — the user may have
    // just granted notification access or overlay permission in Settings.
    androidx.lifecycle.compose.LifecycleEventEffect(androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
        notifAccessGranted = PermissionHelper.hasNotificationAccess(context)
        overlayGranted = PermissionHelper.hasOverlayPermission(context)
    }

    Column(
        modifier = modifier.fillMaxSize().background(Paper).verticalScroll(scrollState).padding(horizontal = 20.dp, vertical = 18.dp)
    ) {
        Text("FINANCIAL SAFETY / ANDROID", color = InkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
        Text(stringResource(R.string.app_name), color = Ink, fontSize = 34.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 8.dp))
        Text(stringResource(R.string.your_financial_bodyguard), color = InkLight, fontSize = 16.sp, lineHeight = 22.sp, modifier = Modifier.padding(top = 4.dp, bottom = 18.dp))

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
                // Run the real engine over the sample so the demo shows the same score
                // and evidence a genuine notification would produce.
                val demoAnalysis = RulesEngine.analyze(
                    "Rakshak demo",
                    "URGENT: Electricity disconnected tonight, scan QR to pay bsescare@icici"
                )
                HapticHelper.vibrateForThreat(context, demoAnalysis.level)
                VoiceOutput.speak(demoAnalysis.suggestedAction)
                RakshakOverlayService.show(context, demoAnalysis)
            },
            modifier = Modifier.fillMaxWidth().height(54.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Ink, contentColor = Paper),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp)
        ) { Text("${stringResource(R.string.simulate_scam_attack).uppercase()}  →", fontSize = 14.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.8.sp) }

        Spacer(Modifier.height(10.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            SecondaryAction(stringResource(R.string.scan_qr_code).uppercase(), onScanQr, Modifier.weight(1f))
            SecondaryAction(stringResource(R.string.language).uppercase(), onLanguageSelect, Modifier.weight(1f))
        }

        // ── Analyze any message (feature parity with the web workbench) ──
        Spacer(Modifier.height(24.dp))
        Text(stringResource(R.string.analyze_section_label).uppercase(), color = InkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.4.sp)
        Text(stringResource(R.string.analyze_message), color = Ink, fontSize = 23.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
        Text(stringResource(R.string.analyze_hint), color = InkLight, fontSize = 13.sp, lineHeight = 19.sp, modifier = Modifier.padding(top = 4.dp, bottom = 10.dp))

        androidx.compose.material3.OutlinedTextField(
            value = manualMessage,
            onValueChange = { manualMessage = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(stringResource(R.string.analyze_placeholder), color = InkLight, fontSize = 13.sp) },
            textStyle = androidx.compose.ui.text.TextStyle(color = Ink, fontSize = 14.sp, lineHeight = 20.sp),
            minLines = 3,
            maxLines = 6,
            shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp),
            colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                focusedBorderColor = StampRed,
                unfocusedBorderColor = BorderStrong,
                focusedContainerColor = Paper,
                unfocusedContainerColor = PaperDark,
                cursorColor = StampRed
            )
        )
        Button(
            onClick = {
                if (manualMessage.isNotBlank()) {
                    val analysis = com.upirakshak.engine.RulesEngine.analyze("", manualMessage)
                    manualAnalysis = analysis
                    if (analysis.level != ThreatLevel.SAFE) {
                        HapticHelper.vibrateForThreat(context, analysis.level)
                        VoiceOutput.speak(analysis.suggestedAction)
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Ink, contentColor = Paper),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp)
        ) { Text(stringResource(R.string.analyze).uppercase(), fontSize = 14.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.8.sp) }

        manualAnalysis?.let { analysis ->
            Spacer(Modifier.height(10.dp))
            ThreatCard(analysis = analysis)
        }

        Spacer(Modifier.height(24.dp))
        Text(stringResource(R.string.recent_threats).uppercase(), color = InkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.4.sp)
        Spacer(Modifier.height(8.dp))
        RecentThreatsSection(records = threatHistory)
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