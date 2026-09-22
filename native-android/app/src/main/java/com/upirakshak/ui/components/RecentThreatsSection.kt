package com.upirakshak.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.R
import com.upirakshak.data.ThreatRecord
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.ui.theme.BorderStrong
import com.upirakshak.ui.theme.Ink
import com.upirakshak.ui.theme.InkLight
import com.upirakshak.ui.theme.PaperDark
import com.upirakshak.ui.theme.RiskHigh
import com.upirakshak.ui.theme.RiskMed
import com.upirakshak.ui.theme.RakshakTheme
import com.upirakshak.ui.theme.Safe
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Shows the flagged threats kept by [com.upirakshak.data.ThreatHistoryStore]. */
@Composable
fun RecentThreatsSection(
    records: List<ThreatRecord>,
    modifier: Modifier = Modifier
) {
    var expandedId by remember { mutableStateOf<String?>(null) }

    Column(modifier = modifier.fillMaxWidth()) {
        if (records.isEmpty()) {
            EmptyThreatHistory()
        } else {
            records.forEach { record ->
                ThreatHistoryRow(
                    record = record,
                    expanded = expandedId == record.id,
                    onClick = { expandedId = if (expandedId == record.id) null else record.id }
                )
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun ThreatHistoryRow(record: ThreatRecord, expanded: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(PaperDark)
            .border(1.dp, BorderStrong)
            .clickable(onClick = onClick)
            .padding(12.dp)
    ) {
        Row {
            Text(
                text = stringResource(record.level.badgeRes).uppercase(),
                color = record.level.tint,
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp
            )
            Spacer(Modifier.width(8.dp))
            Text(
                text = record.sourcePackage.ifBlank { "Unknown source" },
                color = InkLight,
                fontSize = 10.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        Text(
            text = record.title,
            color = Ink,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            maxLines = if (expanded) Int.MAX_VALUE else 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.padding(top = 4.dp)
        )

        Text(
            text = "${formatTimestamp(record.timestampMillis)} · ${record.reasons.size} signal(s)",
            color = InkLight,
            fontSize = 11.sp,
            modifier = Modifier.padding(top = 2.dp)
        )

        if (expanded) {
            record.reasons.forEach { reason ->
                Text(
                    text = "• $reason",
                    color = Ink,
                    fontSize = 12.sp,
                    lineHeight = 17.sp,
                    modifier = Modifier.padding(top = 6.dp)
                )
            }
            Text(
                text = record.suggestedAction,
                color = RiskHigh,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 17.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

@Composable
private fun EmptyThreatHistory() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, BorderStrong)
            .padding(16.dp)
    ) {
        Text(stringResource(R.string.no_recent_threats), color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Text(
            text = "Flagged messages will be listed here so you can review them later.",
            color = InkLight,
            fontSize = 12.sp,
            lineHeight = 17.sp,
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}

private fun formatTimestamp(millis: Long): String =
    SimpleDateFormat("d MMM, h:mm a", Locale.getDefault()).format(Date(millis))

@Preview(showBackground = true)
@Composable
private fun RecentThreatsSectionPreview() {
    RakshakTheme {
        Column(modifier = Modifier.padding(16.dp)) {
            RecentThreatsSection(
                records = listOf(
                    ThreatRecord(
                        id = "1",
                        timestampMillis = 1_700_000_000_000,
                        level = ThreatLevel.HIGH,
                        riskScore = 95,
                        title = "Collect request from unknown VPA",
                        sourcePackage = "com.whatsapp",
                        reasons = listOf("Asks to approve a collect request", "Lookalike bank handle"),
                        suggestedAction = "Do not approve. Report to 1930.",
                        officialRoute = null,
                        originalText = "Approve this request to receive money"
                    )
                )
            )
        }
    }
}
