package com.upirakshak.intent

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationCompat
import com.upirakshak.R
import com.upirakshak.data.ThreatHistoryStore
import com.upirakshak.data.toRecord
import com.upirakshak.engine.RulesEngine
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.engine.UpiIntentParser
import com.upirakshak.engine.UpiPaymentRequest
import com.upirakshak.overlay.RakshakOverlayService
import com.upirakshak.ui.components.ThreatCard
import com.upirakshak.ui.theme.Ink
import com.upirakshak.ui.theme.Paper
import com.upirakshak.ui.theme.RiskHigh
import com.upirakshak.ui.theme.RiskMed
import com.upirakshak.util.HapticHelper
import com.upirakshak.voice.VoiceOutput

/**
 * Intercepts `upi://pay` links before the user's UPI app opens.
 *
 * A payment request is analysed with the same engine as incoming notifications, and a
 * warning is shown over the top of whatever the user was doing. The user can still proceed
 * — Rakshak advises, it does not block — but they must actively choose to.
 *
 * Deep links can be triggered by any app on the device, so every field is treated as
 * untrusted: the payee is validated by [UpiIntentParser] before display, and the link is
 * only handed back to a real UPI app once the user confirms.
 */
class UpiInterceptorActivity : ComponentActivity() {

    /** The intercepted request, or null when the link was not a usable payment request. */
    private var request: UpiPaymentRequest? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val uri = intent?.data
        val parsed = UpiIntentParser.parse(uri)
        if (parsed == null || uri == null) {
            finish()
            return
        }

        request = parsed
        val result = RulesEngine.analyze(getString(R.string.upi_payment_request), parsed.toAnalysisText())

        when (result.level) {
            // Nothing suspicious: forward immediately rather than adding friction.
            ThreatLevel.SAFE -> {
                forwardToUpiApp(uri)
                finish()
                return
            }
            ThreatLevel.HIGH -> onHighRisk(result, parsed)
            ThreatLevel.MEDIUM -> HapticHelper.vibrateForThreat(this, ThreatLevel.MEDIUM)
        }

        if (result.level != ThreatLevel.SAFE) {
            recordToHistory(parsed, result)
        }

        setContent { InterceptorScreen(parsed, result, ::onPayAnyway, ::onCancel) }
    }

    private fun recordToHistory(parsed: UpiPaymentRequest, result: ThreatAnalysis) {
        ThreatHistoryStore.record(
            this,
            result.toRecord(
                id = ThreatHistoryStore.newId(),
                timestampMillis = System.currentTimeMillis(),
                // Named as the app that raised it, so history is clear these came from a
                // payment link rather than from an incoming message.
                title = getString(R.string.payment_request_check),
                sourcePackage = parsed.payeeVpa
            )
        )
    }

    private fun onHighRisk(result: ThreatAnalysis, parsed: UpiPaymentRequest) {
        HapticHelper.vibrateForThreat(this, ThreatLevel.HIGH)
        RakshakOverlayService.show(this, result)
        VoiceOutput.speak(result.suggestedAction)
        postAlertNotification(result, parsed)
    }

    /** A notification outlives the activity, so a warning is still visible if it is dismissed. */
    private fun postAlertNotification(result: ThreatAnalysis, parsed: UpiPaymentRequest) {
        val manager = getSystemService(NotificationManager::class.java) ?: return
        // minSdk is 26, so the NotificationChannel API is always available here.
        manager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                getString(R.string.payment_request_check),
                NotificationManager.IMPORTANCE_HIGH
            )
        )
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentTitle(getString(R.string.threat_detected))
            .setContentText(getString(R.string.intercept_high_body))
            .setStyle(
                NotificationCompat.BigTextStyle().bigText(
                    "${getString(R.string.payee_label)}: ${parsed.payeeVpa}\n\n${result.suggestedAction}"
                )
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        runCatching { manager.notify(NOTIFICATION_ID, notification) }
    }

    /**
     * Hands the original link to a UPI app other than Rakshak.
     *
     * This cannot be a plain `startActivity(intent)`: Rakshak's own intent filter matches
     * `upi://pay`, so re-firing the intent unmodified re-enters this activity and loops.
     * Targeting an explicitly chosen handler avoids that.
     */
    private fun forwardToUpiApp(uri: Uri) {
        val forward = Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        val handlers = packageManager.queryIntentActivities(forward, 0)
            .filterNot { it.activityInfo.packageName == packageName }

        val chosen = handlers.firstOrNull()
        if (chosen == null) {
            Toast.makeText(this, R.string.no_upi_app_found, Toast.LENGTH_LONG).show()
            return
        }

        val target = Intent(forward).setPackage(chosen.activityInfo.packageName)
        runCatching { startActivity(target) }
            .onFailure { Toast.makeText(this, R.string.no_upi_app_found, Toast.LENGTH_LONG).show() }
    }

    private fun onPayAnyway() {
        // The user has seen the warning and chosen to continue.
        intent?.data?.let { forwardToUpiApp(it) }
        finish()
    }

    private fun onCancel() {
        finish()
    }

    private companion object {
        const val CHANNEL_ID = "rakshak_payment_intercept"
        const val NOTIFICATION_ID = 4301
    }
}

@Composable
private fun InterceptorScreen(
    request: UpiPaymentRequest,
    analysis: ThreatAnalysis,
    onPayAnyway: () -> Unit,
    onCancel: () -> Unit
) {
    val accent = when (analysis.level) {
        ThreatLevel.HIGH -> RiskHigh
        ThreatLevel.MEDIUM -> RiskMed
        ThreatLevel.SAFE -> Ink
    }
    val body = when (analysis.level) {
        ThreatLevel.HIGH -> stringResource(R.string.intercept_high_body)
        else -> stringResource(R.string.intercept_medium_body)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Paper)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {
        Text(
            text = stringResource(R.string.payment_request_check),
            color = accent,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(8.dp))
        Text(text = body, color = Ink, fontSize = 14.sp, lineHeight = 20.sp)

        Spacer(Modifier.height(16.dp))
        PaymentSummary(request)

        Spacer(Modifier.height(16.dp))
        ThreatCard(analysis)

        Spacer(Modifier.height(20.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(
                onClick = onCancel,
                modifier = Modifier.weight(1f).height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = accent, contentColor = Color.White),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = stringResource(R.string.cancel_payment).uppercase(),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Button(
                onClick = onPayAnyway,
                modifier = Modifier.weight(1f).height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Paper, contentColor = accent),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = stringResource(R.string.pay_anyway).uppercase(),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

/** Echoes the request back so the user can check the payee against what they were told. */
@Composable
private fun PaymentSummary(request: UpiPaymentRequest) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        SummaryRow(
            label = stringResource(R.string.payee_label),
            value = request.payeeName?.let { "$it\n${request.payeeVpa}" } ?: request.payeeVpa
        )
        request.amount?.let { SummaryRow(stringResource(R.string.amount_label), "₹$it") }
        request.transactionNote?.let { SummaryRow(stringResource(R.string.note_label), it) }
    }
}

@Composable
private fun SummaryRow(label: String, value: String) {
    Row(verticalAlignment = Alignment.Top) {
        Text(
            text = label.uppercase(),
            color = Ink.copy(alpha = 0.6f),
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.width(96.dp)
        )
        Text(text = value, color = Ink, fontSize = 14.sp)
    }
}
