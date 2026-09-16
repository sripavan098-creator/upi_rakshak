package com.upirakshak.data

data class CashFlowReport(
    val income: Double,
    val expenses: Double,
    val recurringExpenses: List<RecurringExpense>,
    val balance: Double,
    val runwayDays: Int?
)

data class RecurringExpense(
    val name: String,
    val amount: Double,
    val dayOfMonth: Int
)

object CashFlowAnalyzer {
    
    fun analyze(entries: List<SmsEntry>): CashFlowReport {
        val income = entries.filter { it.type == SmsType.CREDIT }
            .sumOf { it.amount ?: 0.0 }
        
        val expenses = entries.filter { it.type == SmsType.DEBIT }
            .sumOf { it.amount ?: 0.0 }
        
        // Extract recurring expenses
        val recurringExpenses = extractRecurringExpenses(entries)
        
        // Get current balance from last SMS
        val lastSms = entries.lastOrNull()
        val balance = lastSms?.message?.let { msg ->
            val match = Regex("Available balance: Rs ([\\d,]+)").find(msg)
            match?.groupValues?.get(1)?.replace(",", "")?.toDoubleOrNull()
        } ?: 0.0
        
        // Calculate runway
        val totalDays = 30
        val dailyBurn = if (totalDays > 0) expenses / totalDays else 0.0
        val runwayDays = if (dailyBurn > 0) (balance / dailyBurn).toInt() else null
        
        return CashFlowReport(
            income = income,
            expenses = expenses,
            recurringExpenses = recurringExpenses,
            balance = balance,
            runwayDays = runwayDays
        )
    }
    
    private fun extractRecurringExpenses(entries: List<SmsEntry>): List<RecurringExpense> {
        val recurring = mutableListOf<RecurringExpense>()
        
        entries.filter { it.type == SmsType.DEBIT }.forEach { entry ->
            val day = entry.date.split("-").getOrNull(2)?.toIntOrNull() ?: return@forEach
            
            when {
                entry.message.contains("RENT", ignoreCase = true) -> {
                    recurring.add(RecurringExpense("Rent", entry.amount ?: 0.0, day))
                }
                entry.message.contains("EMI", ignoreCase = true) -> {
                    recurring.add(RecurringExpense("Loan EMI", entry.amount ?: 0.0, day))
                }
                entry.message.contains("ELECTRICITY", ignoreCase = true) || 
                entry.message.contains("BSES", ignoreCase = true) -> {
                    recurring.add(RecurringExpense("Electricity", entry.amount ?: 0.0, day))
                }
            }
        }
        
        return recurring.distinctBy { it.name }
    }
}
