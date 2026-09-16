package com.upirakshak.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.upirakshak.data.CashFlowAnalyzer
import com.upirakshak.data.MockSmsRepository
import com.upirakshak.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CashFlowScreen() {
    val scrollState = rememberScrollState()
    val report = remember { CashFlowAnalyzer.analyze(MockSmsRepository.getAll()) }
    
    var purchaseQuery by remember { mutableStateOf("") }
    var affordabilityResult by remember { mutableStateOf<String?>(null) }
    
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
                Icons.Default.AttachMoney,
                contentDescription = null,
                tint = Gold,
                modifier = Modifier.size(32.dp)
            )
            Spacer(Modifier.width(12.dp))
            Text(
                "Cash Flow Forecast",
                style = MaterialTheme.typography.displaySmall,
                color = Parchment,
                fontWeight = FontWeight.Bold
            )
        }
        
        // Runway card
        val runway = report.runwayDays ?: 0
        val isWarning = runway < 7
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (isWarning) RiskHigh.copy(alpha = 0.1f) else Safe.copy(alpha = 0.1f)
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    "Days of runway remaining",
                    style = MaterialTheme.typography.labelMedium,
                    color = if (isWarning) RiskHigh else Safe,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    "$runway",
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isWarning) RiskHigh else Safe
                )
                Text(
                    if (isWarning) "Aapke paise jaldi khatam ho sakte hain" else "Your money should last until next salary",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Muted
                )
            }
        }
        
        Spacer(Modifier.height(16.dp))
        
        // Income vs Expenses
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Ink1),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    "This month",
                    style = MaterialTheme.typography.labelMedium,
                    color = Muted2,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(Modifier.height(12.dp))
                
                // Income
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Income", color = Safe, style = MaterialTheme.typography.bodyMedium)
                    Text("₹${report.income.toInt()}", color = Parchment, fontWeight = FontWeight.Medium)
                }
                LinearProgressIndicator(
                    progress = { 1f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = Safe,
                    trackColor = Ink2,
                )
                
                Spacer(Modifier.height(12.dp))
                
                // Expenses
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Expenses", color = RiskMed, style = MaterialTheme.typography.bodyMedium)
                    Text("₹${report.expenses.toInt()}", color = Parchment, fontWeight = FontWeight.Medium)
                }
                LinearProgressIndicator(
                    progress = { (report.expenses / report.income).toFloat() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = RiskMed,
                    trackColor = Ink2,
                )
            }
        }
        
        Spacer(Modifier.height(16.dp))
        
        // Recurring expenses
        if (report.recurringExpenses.isNotEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Ink1),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        "Upcoming recurring",
                        style = MaterialTheme.typography.labelMedium,
                        color = Muted2,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Spacer(Modifier.height(12.dp))
                    
                    report.recurringExpenses.forEach { expense ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(expense.name, color = Parchment)
                            Row {
                                Text(
                                    "₹${expense.amount.toInt()}",
                                    color = Parchment,
                                    fontWeight = FontWeight.Medium
                                )
                                Spacer(Modifier.width(12.dp))
                                Text("Day ${expense.dayOfMonth}", color = Muted2, fontSize = 10.sp)
                            }
                        }
                    }
                }
            }
        }
        
        // Warning card
        if (isWarning) {
            Spacer(Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = RiskHigh.copy(alpha = 0.1f)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    "⚠️ Aapke paise $runway din mein khatam ho sakte hain. Avoid unnecessary spending.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = RiskHigh,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }
        
        Spacer(Modifier.height(16.dp))
        
        // Affordability check
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Ink1),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    "Ask about a purchase",
                    style = MaterialTheme.typography.labelMedium,
                    color = Muted2,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = purchaseQuery,
                        onValueChange = { purchaseQuery = it },
                        placeholder = { Text("e.g., iPhone EMI ₹5000/month") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Gold,
                            unfocusedBorderColor = Border,
                            focusedTextColor = Parchment,
                            unfocusedTextColor = Parchment,
                            cursorColor = Gold
                        ),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Text,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                checkAffordability(purchaseQuery, report.balance, report.expenses) {
                                    affordabilityResult = it
                                }
                            }
                        )
                    )
                    
                    Spacer(Modifier.width(8.dp))
                    
                    Button(
                        onClick = {
                            checkAffordability(purchaseQuery, report.balance, report.expenses) {
                                affordabilityResult = it
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Gold),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Check", color = Ink)
                    }
                }
                
                affordabilityResult?.let { result ->
                    Spacer(Modifier.height(8.dp))
                    Text(
                        result,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Muted,
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Ink2, RoundedCornerShape(8.dp))
                            .padding(8.dp)
                    )
                }
            }
        }
    }
}

private fun checkAffordability(
    query: String,
    balance: Double,
    monthlyExpenses: Double,
    onResult: (String) -> Unit
) {
    val emiMatch = Regex("(\\d+)").find(query)
    val emi = emiMatch?.groupValues?.get(1)?.toDoubleOrNull() ?: 0.0
    
    if (emi == 0.0) {
        onResult("Please include the EMI amount (e.g., \"iPhone EMI ₹5000/month\")")
        return
    }
    
    val newDailySpend = (monthlyExpenses + emi) / 30
    val newRunway = (balance / newDailySpend).toInt()
    
    when {
        newRunway >= 15 -> onResult("✅ Yes, you can afford this. It leaves you with $newRunway days of buffer.")
        newRunway >= 7 -> onResult("⚠️ Tight. This leaves you with only $newRunway days of buffer. Consider waiting or finding a cheaper option.")
        else -> {
            val shortfall = (emi * 2 - balance).toInt().coerceAtLeast(0)
            onResult("❌ No, this will leave you short by ₹$shortfall before month-end. Consider waiting or finding a cheaper option.")
        }
    }
}
