package com.upirakshak.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.data.LoanCalculator
import com.upirakshak.data.LoanTotal
import com.upirakshak.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoanComparisonScreen() {
    val scrollState = rememberScrollState()
    val loanTotals = remember {
        LoanCalculator.presetLoans.map { LoanCalculator.calculate(it) }
    }

    val maxRepayment = loanTotals.maxOf { it.totalRepayment }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Header
        Text(
            text = "Loan Comparison",
            color = TextPrimary,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "See the true cost of borrowing",
            color = TextSecondary,
            fontSize = 14.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        // Visual comparison chart
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Slate),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Total Repayment (₹10,000 loan)",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                loanTotals.forEachIndexed { index, loan ->
                    LoanBar(
                        loan = loan,
                        maxRepayment = maxRepayment,
                        color = when (index) {
                            0 -> Danger // Instant loan - most expensive
                            1 -> Emerald // Bank loan - cheapest
                            else -> Warning // Credit card - middle
                        }
                    )
                    if (index < loanTotals.size - 1) {
                        Spacer(Modifier.height(16.dp))
                    }
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        // Detailed breakdown for each loan
        loanTotals.forEachIndexed { index, loan ->
            LoanDetailCard(
                loan = loan,
                color = when (index) {
                    0 -> Danger
                    1 -> Emerald
                    else -> Warning
                }
            )
            Spacer(Modifier.height(16.dp))
        }

        // Warning card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Danger.copy(alpha = 0.15f)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "⚠️ Why This Matters",
                    color = Danger,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "A ₹10,000 instant loan can cost you ₹11,900 in just 3 months. That's 19% of the principal in fees and interest. Always compare before borrowing.",
                    color = TextPrimary,
                    fontSize = 13.sp
                )
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}

@Composable
fun LoanBar(
    loan: LoanTotal,
    maxRepayment: Double,
    color: Color
) {
    val barWidth = (loan.totalRepayment / maxRepayment).toFloat()

    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = loan.option.name,
                    color = TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "${loan.option.annualInterestRate}% APR • ${loan.option.tenureMonths} months",
                    color = TextSecondary,
                    fontSize = 11.sp
                )
            }
            Text(
                text = "₹${loan.totalRepayment.toInt()}",
                color = color,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(Modifier.height(8.dp))

        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(24.dp)
                .clip(RoundedCornerShape(8.dp))
        ) {
            // Background
            drawRect(
                color = Navy,
                size = size
            )

            // Principal portion
            val principalWidth = size.width * (loan.option.principal / loan.totalRepayment).toFloat()
            drawRect(
                color = color.copy(alpha = 0.6f),
                topLeft = Offset.Zero,
                size = androidx.compose.ui.geometry.Size(principalWidth, size.height)
            )

            // Interest + fees portion
            drawRect(
                color = color,
                topLeft = Offset(principalWidth, 0f),
                size = androidx.compose.ui.geometry.Size(size.width * barWidth - principalWidth, size.height)
            )
        }

        Spacer(Modifier.height(4.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "Principal: ₹${loan.option.principal.toInt()}",
                color = TextSecondary,
                fontSize = 10.sp
            )
            Text(
                text = "Extra cost: ₹${(loan.totalInterest + loan.totalFees).toInt()}",
                color = color,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun LoanDetailCard(
    loan: LoanTotal,
    color: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Slate),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = loan.option.name,
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Box(
                    modifier = Modifier
                        .background(color.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "${loan.effectiveAnnualRate.toInt()}% effective",
                        color = color,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Breakdown
            DetailRow("Monthly EMI", "₹${loan.monthlyEmi.toInt()}", TextPrimary)
            DetailRow("Total Interest", "₹${loan.totalInterest.toInt()}", color)
            DetailRow("Processing Fees", "₹${loan.totalFees.toInt()}", color)

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 8.dp),
                color = TextSecondary.copy(alpha = 0.2f)
            )

            DetailRow(
                "Total Repayment",
                "₹${loan.totalRepayment.toInt()}",
                color,
                bold = true
            )
        }
    }
}

@Composable
fun DetailRow(label: String, value: String, valueColor: Color, bold: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            color = TextSecondary,
            fontSize = 13.sp
        )
        Text(
            text = value,
            color = valueColor,
            fontSize = 13.sp,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal
        )
    }
}
