package com.upirakshak.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import com.upirakshak.ui.onboarding.OnboardingPlan
import com.upirakshak.ui.onboarding.OnboardingStep
import com.upirakshak.ui.theme.*

/**
 * First-run setup. Each step explains why an access is needed, then sends the
 * user to the relevant system screen. Nothing is requested silently.
 */
@Composable
fun OnboardingScreen(
    notificationGranted: Boolean,
    overlayGranted: Boolean,
    onGrantNotification: () -> Unit,
    onGrantOverlay: () -> Unit,
    onChooseLanguage: () -> Unit,
    onSkip: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Set up UPI Rakshak",
            color = TextPrimary,
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Three quick steps. Rakshak cannot protect you until these are done.",
            color = TextSecondary,
            fontSize = 14.sp
        )

        Spacer(modifier = Modifier.height(28.dp))

        OnboardingPlan.steps.forEachIndexed { index, step ->
            val done = when (step) {
                OnboardingStep.LANGUAGE -> false
                OnboardingStep.NOTIFICATION_ACCESS -> notificationGranted
                OnboardingStep.OVERLAY_PERMISSION -> overlayGranted
            }

            StepCard(
                number = index + 1,
                step = step,
                done = done,
                onAct = when (step) {
                    OnboardingStep.LANGUAGE -> onChooseLanguage
                    OnboardingStep.NOTIFICATION_ACCESS -> onGrantNotification
                    OnboardingStep.OVERLAY_PERMISSION -> onGrantOverlay
                }
            )

            Spacer(modifier = Modifier.height(14.dp))
        }

        Spacer(modifier = Modifier.height(14.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .clickable(onClick = onSkip)
                .padding(14.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Skip for now",
                color = TextSecondary,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
private fun StepCard(
    number: Int,
    step: OnboardingStep,
    done: Boolean,
    onAct: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(if (done) Emerald.copy(alpha = 0.15f) else Slate)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = if (done) "✓" else "$number",
                color = if (done) Emerald else TextSecondary,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = titleFor(step),
                color = TextPrimary,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = OnboardingPlan.rationale(step),
            color = TextSecondary,
            fontSize = 13.sp
        )

        if (!done) {
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onAct,
                colors = ButtonDefaults.buttonColors(containerColor = Emerald),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = actionLabelFor(step),
                    color = NavyDark,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

private fun titleFor(step: OnboardingStep): String = when (step) {
    OnboardingStep.LANGUAGE -> "Choose your language"
    OnboardingStep.NOTIFICATION_ACCESS -> "Allow notification access"
    OnboardingStep.OVERLAY_PERMISSION -> "Allow warnings over other apps"
}

private fun actionLabelFor(step: OnboardingStep): String = when (step) {
    OnboardingStep.LANGUAGE -> "Choose language"
    OnboardingStep.NOTIFICATION_ACCESS -> "Open notification settings"
    OnboardingStep.OVERLAY_PERMISSION -> "Open overlay settings"
}
