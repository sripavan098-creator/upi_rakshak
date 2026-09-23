package com.upirakshak.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class CashFlowAnalyzerTest {

    private fun credit(amount: Double, day: Int = 1) = SmsEntry(
        date = LocalDate.of(2025, 1, day),
        sender = "HDFC Bank",
        message = "Rs $amount credited",
        amount = amount,
        type = SmsType.CREDIT
    )

    private fun debit(amount: Double, message: String, day: Int = 5) = SmsEntry(
        date = LocalDate.of(2025, 1, day),
        sender = "HDFC Bank",
        message = message,
        amount = amount,
        type = SmsType.DEBIT
    )

    @Test
    fun `income and expenses are summed by type`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(credit(30000.0), credit(5000.0), debit(2000.0, "Rs 2000 debited towards rent")),
            currentBalance = 1000.0
        )

        assertEquals(35000.0, report.income, 0.001)
        assertEquals(2000.0, report.expenses, 0.001)
    }

    @Test
    fun `balance includes the current balance on top of net flow`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(credit(10000.0), debit(4000.0, "Rs 4000 debited")),
            currentBalance = 2500.0
        )

        assertEquals(8500.0, report.balance, 0.001)
    }

    @Test
    fun `daily burn rate spreads expenses over thirty days`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(debit(9000.0, "Rs 9000 debited")),
            currentBalance = 1000.0
        )

        assertEquals(300.0, report.dailyBurnRate, 0.001)
    }

    @Test
    fun `runway is balance divided by burn rate`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(debit(3000.0, "Rs 3000 debited")),
            currentBalance = 5000.0
        )

        // burn 100/day, 5000 balance -> 50 days
        assertEquals(50, report.runwayDays)
    }

    @Test
    fun `runway never goes negative`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(debit(3000.0, "Rs 3000 debited")),
            currentBalance = -500.0
        )

        assertEquals(0, report.runwayDays)
    }

    @Test
    fun `no expenses means unlimited runway`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(credit(5000.0)),
            currentBalance = 100.0
        )

        assertEquals(0.0, report.dailyBurnRate, 0.001)
        assertEquals(Int.MAX_VALUE, report.runwayDays)
    }

    @Test
    fun `empty history yields zero income and unlimited runway`() {
        val report = CashFlowAnalyzer.analyze(entries = emptyList(), currentBalance = 0.0)

        assertEquals(0.0, report.income, 0.001)
        assertEquals(0.0, report.expenses, 0.001)
        assertEquals(Int.MAX_VALUE, report.runwayDays)
        assertTrue(report.recurringExpenses.isEmpty())
    }

    @Test
    fun `recurring expenses are grouped and sorted by day`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(
                debit(12000.0, "Rs 12000 debited towards RENT PAYMENT", day = 5),
                debit(4500.0, "Rs 4500 debited towards EMI for personal loan", day = 15),
                debit(2400.0, "Rs 2400 debited towards BSES ELECTRICITY", day = 10)
            ),
            currentBalance = 20000.0
        )

        val names = report.recurringExpenses.map { it.name }
        assertEquals(listOf("Rent/Kiraya", "Electricity/Bijli", "EMI"), names)
        assertEquals(listOf(5, 10, 15), report.recurringExpenses.map { it.dayOfMonth })
    }

    @Test
    fun `recurring expense amount is the average across occurrences`() {
        val report = CashFlowAnalyzer.analyze(
            entries = listOf(
                debit(1000.0, "Rs 1000 debited towards rent", day = 5),
                debit(1400.0, "Rs 1400 debited towards rent", day = 6)
            ),
            currentBalance = 10000.0
        )

        val rent = report.recurringExpenses.single { it.name == "Rent/Kiraya" }
        assertEquals(1200.0, rent.amount, 0.001)
    }

    @Test
    fun `mock repository produces a positive runway`() {
        val report = CashFlowAnalyzer.analyze(
            entries = SampleTransactions.entries,
            currentBalance = 12700.0
        )

        assertTrue("expected expenses to be recorded", report.expenses > 0)
        assertTrue("expected a finite runway", report.runwayDays > 0)
        assertTrue("expected recurring expenses", report.recurringExpenses.isNotEmpty())
    }
}
