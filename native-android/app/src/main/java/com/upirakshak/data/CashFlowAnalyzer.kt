package com.upirakshak.data

/**
 * Represents a recurring monthly expense
 */
data class RecurringExpense(
    val name: String,
    val amount: Double,
    val dayOfMonth: Int
)

/**
 * Cash flow analysis report
 */
data class CashFlowReport(
    val income: Double,
    val expenses: Double,
    val balance: Double,
    val runwayDays: Int,
    val recurringExpenses: List<RecurringExpense>,
    val dailyBurnRate: Double
)

/**
 * Analyzes SMS transaction history to predict cash flow
 */
object CashFlowAnalyzer {

    /**
     * Analyze SMS entries and current balance to predict cash flow
     * @param entries List of SMS transactions
     * @param currentBalance Current bank balance
     * @return CashFlowReport with income, expenses, runway, and recurring expenses
     */
    fun analyze(entries: List<SmsEntry>, currentBalance: Double): CashFlowReport {
        // Calculate income and expenses
        val income = entries
            .filter { it.type == SmsType.CREDIT }
            .sumOf { it.amount }

        val expenses = entries
            .filter { it.type == SmsType.DEBIT }
            .sumOf { it.amount }

        // Calculate balance: income - expenses + currentBalance
        val balance = income - expenses + currentBalance

        // Calculate daily burn rate (expenses per day)
        val dailyBurnRate = if (entries.isNotEmpty()) {
            expenses / 30.0 // Assume 30-day month
        } else {
            0.0
        }

        // Calculate runway days (how long until money runs out)
        val runwayDays = if (dailyBurnRate > 0) {
            (currentBalance / dailyBurnRate).toInt().coerceAtLeast(0)
        } else {
            Int.MAX_VALUE // No expenses, infinite runway
        }

        // Extract recurring expenses
        val recurringExpenses = extractRecurringExpenses(entries)

        return CashFlowReport(
            income = income,
            expenses = expenses,
            balance = balance,
            runwayDays = runwayDays,
            recurringExpenses = recurringExpenses,
            dailyBurnRate = dailyBurnRate
        )
    }

    /**
     * Extract recurring monthly expenses from SMS history
     * Looks for patterns like rent/kiraya, EMI, electricity/bijli, Jio/recharge
     */
    private fun extractRecurringExpenses(entries: List<SmsEntry>): List<RecurringExpense> {
        val recurringMap = mutableMapOf<String, MutableList<Pair<Double, Int>>>()

        entries.filter { it.type == SmsType.DEBIT }.forEach { entry ->
            val message = entry.message.lowercase()
            val dayOfMonth = entry.date.dayOfMonth

            // Check for rent/kiraya
            if (message.contains("rent") || message.contains("kiraya")) {
                recurringMap.getOrPut("Rent/Kiraya") { mutableListOf() }
                    .add(entry.amount to dayOfMonth)
            }

            // Check for EMI
            if (message.contains("emi")) {
                recurringMap.getOrPut("EMI") { mutableListOf() }
                    .add(entry.amount to dayOfMonth)
            }

            // Check for electricity/bijli
            if (message.contains("electricity") || message.contains("bijli") || message.contains("bses")) {
                recurringMap.getOrPut("Electricity/Bijli") { mutableListOf() }
                    .add(entry.amount to dayOfMonth)
            }

            // Check for mobile recharge (Jio, Airtel, Vi)
            if (message.contains("jio") || message.contains("airtel") || message.contains("vi ") || message.contains("recharge")) {
                recurringMap.getOrPut("Mobile Recharge") { mutableListOf() }
                    .add(entry.amount to dayOfMonth)
            }
        }

        // Convert to RecurringExpense list (use average amount and most common day)
        return recurringMap.map { (name, entries) ->
            val avgAmount = entries.map { it.first }.average()
            val dayCounts = entries.groupBy { it.second }.mapValues { it.value.size }
            val mostCommonDay = dayCounts.maxByOrNull { it.value }?.key ?: 1

            RecurringExpense(
                name = name,
                amount = avgAmount,
                dayOfMonth = mostCommonDay
            )
        }.sortedBy { it.dayOfMonth }
    }
}
