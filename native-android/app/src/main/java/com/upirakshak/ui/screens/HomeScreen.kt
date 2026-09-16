package com.upirakshak.ui.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.engine.RulesEngine
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.notification.NotificationProcessor
import com.upirakshak.notification.RakshakNotificationListener
import com.upirakshak.overlay.RakshakOverlayService
import com.upirakshak.ui.theme.*
import com.upirakshak.util.PermissionHelper
import com.upirakshak.voice.VoiceOutput

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    
    var notifAccessGranted by remember { mutableStateOf(PermissionHelper.hasNotificationAccess(context)) }
    var overlayGranted by remember { mutableStateOf(PermissionHelper.hasOverlayPermission(context)) }
    
    val isConnected by RakshakNotificationListener.isConnected.collectAsState()
    val lastAnalysis by NotificationProcessor.lastAnalysis.collectAsState()
    
    // Refresh permissions on resume
    LaunchedEffect(Unit) {
        notifAccessGranted = PermissionHelper.hasNotificationAccess(context)
        overlayGranted = PermissionHelper.hasOverlayPermission(context)
    }
    
    // Speak warning when analysis updates
    LaunchedEffect(lastAnalysis) {
        lastAnalysis?.let { analysis ->
            if (analysis.level != ThreatLevel.SAFE) {
                VoiceOutput.speak(analysis.suggestedAction)
            }
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Ink)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 24.dp)
        ) {
            Icon(
                Icons.Default.Shield,
                contentDescription = null,
                tint = Gold,
                modifier = Modifier.size(32.dp)
            )
            Spacer(Modifier.width(12.dp))
            Column {
                Text(
                    "UPI Rakshak",
                    style = MaterialTheme.typography.displaySmall,
                    color = Parchment,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "Protecting India's digital payments",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Muted
                )
            }
        }
        
        // Status card
        StatusCard(
            notifAccessGranted = notifAccessGranted,
            overlayGranted = overlayGranted,
            isConnected = isConnected,
            onRequestNotifAccess = {
                PermissionHelper.requestNotificationAccess(context)
            },
            onRequestOverlay = {
                PermissionHelper.requestOverlayPermission(context)
            }
        )
        
        Spacer(Modifier.height(16.dp))
        
        // Demo button
        Button(
            onClick = {
                val fakeTitle = "WhatsApp"
                val fakeText = "⚡ URGENT: Your electricity will be disconnected tonight! Pay now via QR to avoid ₹5000 fine. UPI: bsescare@icici"
                val analysis = RulesEngine.analyze(fakeTitle, fakeText)
                RakshakOverlayService.show(context, analysis)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = RiskHigh,
                contentColor = Color.White
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                "🎯 Simulate Scam Attack",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Text(
            if (isConnected) "✓ Uses real Android overlay" else "ℹ Uses web simulation",
            style = MaterialTheme.typography.bodySmall,
            color = if (isConnected) Safe else Muted2,
            modifier = Modifier.padding(top = 8.dp)
        )
        
        Spacer(Modifier.height(24.dp))
        
        // Last analysis card
        lastAnalysis?.let { analysis ->
            AnalysisCard(analysis = analysis)
        }
        
        Spacer(Modifier.height(24.dp))
        
        // Footer
        Text(
            "v1.0.0 • Built for iQOO Hackathon",
            style = MaterialTheme.typography.bodySmall,
            color = Muted2,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )
    }
}

@Composable
fun StatusCard(
    notifAccessGranted: Boolean,
    overlayGranted: Boolean,
    isConnected: Boolean,
    onRequestNotifAccess: () -> Unit,
    onRequestOverlay: () -> Unit
) {
    val isProtected = notifAccessGranted && overlayGranted && isConnected
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isProtected) Safe.copy(alpha = 0.1f) else RiskMed.copy(alpha = 0.1f)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    if (isProtected) Icons.Default.Shield else Icons.Default.Warning,
                    contentDescription = null,
                    tint = if (isProtected) Safe else RiskMed,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    if (isProtected) "🛡️ Protection Active" else "⚠️ Setup Required",
                    style = MaterialTheme.typography.titleLarge,
                    color = if (isProtected) Safe else RiskMed,
                    fontWeight = FontWeight.Bold
                )
            }
            
            if (!isProtected) {
                Spacer(Modifier.height(12.dp))
                
                if (!notifAccessGranted) {
                    Button(
                        onClick = onRequestNotifAccess,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Gold),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Grant Notification Access", color = Ink)
                    }
                    Spacer(Modifier.height(8.dp))
                }
                
                if (!overlayGranted) {
                    Button(
                        onClick = onRequestOverlay,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Gold),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Grant Overlay Permission", color = Ink)
                    }
                }
            }
        }
    }
}

@Composable
fun AnalysisCard(analysis: ThreatAnalysis) {
    val (bgColor, borderColor, textColor) = when (analysis.level) {
        ThreatLevel.HIGH -> Triple(RiskHigh.copy(alpha = 0.1f), RiskHigh.copy(alpha = 0.3f), RiskHigh)
        ThreatLevel.MEDIUM -> Triple(RiskMed.copy(alpha = 0.1f), RiskMed.copy(alpha = 0.3f), RiskMed)
        ThreatLevel.SAFE -> Triple(Safe.copy(alpha = 0.1f), Safe.copy(alpha = 0.3f), Safe)
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    analysis.level.name,
                    style = MaterialTheme.typography.labelMedium,
                    color = textColor,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(textColor.copy(alpha = 0.2f))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    analysis.suggestedAction,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Parchment,
                    fontWeight = FontWeight.Medium
                )
            }
            
            Spacer(Modifier.height(12.dp))
            
            // Reasons
            analysis.reasons.forEach { reason ->
                Row(
                    modifier = Modifier.padding(vertical = 2.dp)
                ) {
                    Text(
                        "•",
                        color = Muted,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text(
                        reason,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Muted
                    )
                }
            }
            
            // Official route
            analysis.officialRoute?.let { route ->
                Spacer(Modifier.height(12.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Safe.copy(alpha = 0.1f)
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        "✓ $route",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Safe,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }
            
            Spacer(Modifier.height(12.dp))
            
            // Speak button
            Button(
                onClick = { VoiceOutput.speak(analysis.suggestedAction) },
                colors = ButtonDefaults.buttonColors(containerColor = Gold),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("🔊 Speak Warning", color = Ink)
            }
        }
    }
}
