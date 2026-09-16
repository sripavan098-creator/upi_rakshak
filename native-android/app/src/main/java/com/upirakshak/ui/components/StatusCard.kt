package com.upirakshak.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.ui.theme.*

@Composable
fun StatusCard(
    notificationGranted: Boolean,
    overlayGranted: Boolean,
    onGrantNotification: () -> Unit,
    onGrantOverlay: () -> Unit
) {
    val isProtected = notificationGranted && overlayGranted

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(
                if (isProtected) Emerald.copy(alpha = 0.15f)
                else Warning.copy(alpha = 0.15f)
            )
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (isProtected) "🛡️" else "⚠️",
                fontSize = 24.sp,
                modifier = Modifier.padding(end = 12.dp)
            )
            Column {
                Text(
                    text = if (isProtected) "Protection Active" else "Setup Required",
                    color = if (isProtected) Emerald else Warning,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = if (isProtected) "Rakshak is monitoring your messages"
                           else "Grant permissions to start protection",
                    color = TextSecondary,
                    fontSize = 13.sp
                )
            }
        }

        if (!isProtected) {
            Spacer(modifier = Modifier.height(16.dp))

            // Notification access row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Notification Access",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = if (notificationGranted) "✓ Granted" else "✗ Required",
                        color = if (notificationGranted) Emerald else Warning,
                        fontSize = 12.sp
                    )
                }
                if (!notificationGranted) {
                    Button(
                        onClick = onGrantNotification,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Warning,
                            contentColor = NavyDark
                        )
                    ) {
                        Text("Grant", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Overlay permission row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Overlay Permission",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = if (overlayGranted) "✓ Granted" else "✗ Required",
                        color = if (overlayGranted) Emerald else Warning,
                        fontSize = 12.sp
                    )
                }
                if (!overlayGranted) {
                    Button(
                        onClick = onGrantOverlay,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Warning,
                            contentColor = NavyDark
                        )
                    ) {
                        Text("Grant", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
