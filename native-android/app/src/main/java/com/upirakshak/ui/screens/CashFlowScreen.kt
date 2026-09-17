package com.upirakshak.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.data.CashFlowAnalyzer
import com.upirakshak.data.MockSmsRepository
import com.upirakshak.ui.components.RunwayGauge
import com.upirakshak.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CashFlowScreen(modifier: Modifier = Modifier) {
    val scrollState = rememberScrollState()
    val report = remember { CashFlowAnalyzer.analyze(MockSmsRepository.entries, currentBalance = 5000.0) }
    
    var purchaseInput by remember { mutableStateOf("") }
    var purchaseResponse by remember { mutableStateOf<String?>(null) }
    var responseColor by remember { mutableStateOf(Emerald) }
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Paper)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Header
        Column(
            modifier = Modifier.padding(bottom = 24.dp)
        ) {
            Text(
                text = "Cash Flow Forecast",
                color = TextPrimary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Based on your last 30 days of SMS",
                color = TextSecondary,
                fontSize = 14.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
        
        // Runway gauge
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            RunwayGauge(days = report.runwayDays)
        }
        
        Text(
            text = "days of runway remaining",
            color = TextSecondary,
            fontSize = 14.sp,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(bottom = 24.dp)
        )
        
        // Income vs Expenses bars
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Slate),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                // Income bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Income",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "₹${report.income.toInt()}",
                        color = Emerald,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Navy)
                ) {
                    val maxWidth = report.income.coerceAtLeast(report.expenses)
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .fillMaxWidth((report.income / maxWidth).toFloat())
                            .background(Emerald)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Expenses bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Expenses",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "₹${report.expenses.toInt()}",
                        color = Danger,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Navy)
                ) {
                    val maxWidth = report.income.coerceAtLeast(report.expenses)
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .fillMaxWidth((report.expenses / maxWidth).toFloat())
                            .background(Danger)
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Upcoming expenses
        if (report.recurringExpenses.isNotEmpty()) {
            Text(
                text = "Upcoming Expenses",
                color = TextSecondary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    report.recurringExpenses.forEach { expense ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = expense.name,
                                    color = TextPrimary,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "Day ${expense.dayOfMonth}",
                                    color = TextSecondary,
                                    fontSize = 12.sp
                                )
                            }
                            Text(
                                text = "₹${expense.amount.toInt()}",
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
        
        // Warning card if runway is low
        if (report.runwayDays < 7) {
            Spacer(modifier = Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Warning.copy(alpha = 0.15f))
                    .padding(16.dp)
            ) {
                Text(
                    text = "⚠️ Aapke paise ${report.runwayDays} din mein khatam ho sakte hain. Kharche kam karein.",
                    color = Warning,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Ask about a purchase
        Text(
            text = "Ask about a purchase",
            color = TextSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = purchaseInput,
                onValueChange = { purchaseInput = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("iPhone EMI ₹5000", color = TextSecondary) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Emerald,
                    unfocusedBorderColor = TextSecondary.copy(alpha = 0.3f),
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = Emerald
                ),
                shape = RoundedCornerShape(12.dp)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Button(
                onClick = {
                    val amount = Regex("\\d+").find(purchaseInput)?.value?.toDoubleOrNull() ?: 0.0
                    if (amount > 0) {
                        val newBalance = report.balance - amount
                        val newRunway = (newBalance / report.dailyBurnRate).toInt().coerceAtLeast(0)
                        
                        val (response, color) = when {
                            newRunway >= 10 -> "✅ Yes, you can afford this. $newRunway days of buffer." to Emerald
                            newRunway >= 5 -> "⚠️ Tight. Only $newRunway days left after this." to Warning
                            else -> "❌ No. This leaves you ${5 - newRunway} days short. Wait until next month." to Danger
                        }
                        
                        purchaseResponse = response
                        responseColor = color
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Emerald,
                    contentColor = Paper
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Check", fontWeight = FontWeight.Bold)
            }
        }
        
        // Purchase response
        purchaseResponse?.let { response ->
            Spacer(modifier = Modifier.height(12.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(responseColor.copy(alpha = 0.15f))
                    .padding(16.dp)
            ) {
                Text(
                    text = response,
                    color = responseColor,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
    }
}
