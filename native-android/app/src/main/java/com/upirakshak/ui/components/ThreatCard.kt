package com.upirakshak.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.ui.theme.*
import com.upirakshak.voice.VoiceOutput

@Composable
fun ThreatCard(analysis: ThreatAnalysis, modifier: Modifier = Modifier) {
    val (borderColor, surfaceColor, badgeColor) = when (analysis.level) {
        ThreatLevel.HIGH -> Triple(Danger, Danger.copy(alpha = 0.1f), Danger)
        ThreatLevel.MEDIUM -> Triple(Warning, Warning.copy(alpha = 0.1f), Warning)
        ThreatLevel.SAFE -> Triple(Emerald, Emerald.copy(alpha = 0.1f), Emerald)
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(surfaceColor)
            .border(2.dp, borderColor, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        // Threat badge
        Box(
            modifier = Modifier
                .background(badgeColor.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                .padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
            Text(
                text = analysis.level.name,
                color = badgeColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Reasons
        if (analysis.reasons.isNotEmpty()) {
            Text(
                text = "Reasons",
                color = TextSecondary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(8.dp))
            analysis.reasons.forEach { reason ->
                Row(
                    modifier = Modifier.padding(vertical = 2.dp)
                ) {
                    Text(
                        text = "•",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text(
                        text = reason,
                        color = TextPrimary,
                        fontSize = 13.sp,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Suggested action
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    when (analysis.level) {
                        ThreatLevel.HIGH -> Danger.copy(alpha = 0.15f)
                        ThreatLevel.MEDIUM -> Warning.copy(alpha = 0.15f)
                        ThreatLevel.SAFE -> Emerald.copy(alpha = 0.15f)
                    },
                    RoundedCornerShape(8.dp)
                )
                .padding(12.dp)
        ) {
            Text(
                text = analysis.suggestedAction,
                color = TextPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )
        }

        // Official route
        analysis.officialRoute?.let { route ->
            Spacer(modifier = Modifier.height(12.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Emerald.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                    .padding(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "✓",
                        color = Emerald,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text(
                        text = route,
                        color = TextPrimary,
                        fontSize = 13.sp,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Speak warning button
        val context = LocalContext.current
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Slate)
                    .clickable {
                        VoiceOutput.speak(analysis.suggestedAction)
                    }
                    .padding(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                        contentDescription = "Speak warning",
                        tint = TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Speak Again",
                        color = TextSecondary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
            // Hindi TTS warning
            if (!VoiceOutput.hasHindi()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "⚠️ Hindi voice not installed — tap to install",
                    color = Warning,
                    fontSize = 11.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            VoiceOutput.openTtsInstallSettings(context)
                        }
                )
            }
        }
    }
}
