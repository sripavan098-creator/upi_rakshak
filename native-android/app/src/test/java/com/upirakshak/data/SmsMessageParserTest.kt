package com.upirakshak.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class SmsMessageParserTest {

    private val date = LocalDate.of(2025, 1, 1)

    @Test
    fun `extracts amount and marks salary as credit`() {
        val entry = SmsMessageParser.parse(
            message = "Your a/c XX1234 credited with Rs 35000 on 01-01-2025 towards SALARY.",
            sender = "HDFC Bank",
            date = date
        )

        assertEquals(35000.0, entry!!.amount, 0.001)
        assertEquals(SmsType.CREDIT, entry.type)
    }

    @Test
    fun `marks rent payment as debit`() {
        val entry = SmsMessageParser.parse(
            message = "Rs 12000 debited from a/c XX1234 towards RENT PAYMENT",
            sender = "HDFC Bank",
            date = date
        )

        assertEquals(12000.0, entry!!.amount, 0.001)
        assertEquals(SmsType.DEBIT, entry.type)
    }

    @Test
    fun `ignores the balance amount and keeps the transaction amount`() {
        val entry = SmsMessageParser.parse(
            message = "Rs 2400 debited from a/c XX1234 towards BSES ELECTRICITY. Available balance: Rs 26,900",
            sender = "HDFC Bank",
            date = date
        )

        assertEquals(2400.0, entry!!.amount, 0.001)
    }

    @Test
    fun `handles comma separated and decimal amounts`() {
        assertEquals(125000.0, SmsMessageParser.extractTransactionAmount("Rs 1,25,000 debited")!!, 0.001)
        assertEquals(499.99, SmsMessageParser.extractTransactionAmount("INR 499.99 debited")!!, 0.001)
    }

    @Test
    fun `understands the rupee symbol and inr prefix`() {
        assertEquals(750.0, SmsMessageParser.extractTransactionAmount("₹750 debited")!!, 0.001)
        assertEquals(750.0, SmsMessageParser.extractTransactionAmount("INR 750 debited")!!, 0.001)
    }

    @Test
    fun `returns null when the message carries no amount`() {
        assertNull(SmsMessageParser.extractTransactionAmount("Your OTP is 123456. Do not share."))
    }

    @Test
    fun `message without an amount becomes informational`() {
        val entry = SmsMessageParser.parse(
            message = "URGENT: Your KYC is blocked. Click here to verify immediately",
            sender = "UNKNOWN",
            date = date
        )

        assertEquals(SmsType.INFO, entry!!.type)
        assertEquals(0.0, entry.amount, 0.001)
    }

    @Test
    fun `refund with a credit verb is treated as credit not debit`() {
        val entry = SmsMessageParser.parse(
            message = "Rs 2000 credited to your a/c as refund",
            sender = "HDFC Bank",
            date = date
        )

        assertEquals(SmsType.CREDIT, entry!!.type)
    }

    @Test
    fun `debit wording wins when both verbs appear`() {
        val entry = SmsMessageParser.parse(
            message = "Rs 500 debited. Your credit limit has been revised",
            sender = "HDFC Bank",
            date = date
        )

        assertEquals(SmsType.DEBIT, entry!!.type)
    }

    @Test
    fun `every mock entry re-parses to the same classified amount`() {
        SampleTransactions.entries.forEach { entry ->
            val parsed = SmsMessageParser.parse(entry.message, entry.sender, entry.date)

            assertEquals("amount for: ${entry.message}", entry.amount, parsed!!.amount, 0.001)
            assertEquals("type for: ${entry.message}", entry.type, parsed.type)
        }
    }

    @Test
    fun `parsed mock history feeds the analyzer without loss`() {
        val parsed = SampleTransactions.entries
            .mapNotNull { SmsMessageParser.parse(it.message, it.sender, it.date) }
            .filter { it.type != SmsType.INFO }

        val report = CashFlowAnalyzer.analyze(parsed, currentBalance = 12700.0)

        assertTrue("parsed history should show income", report.income > 0)
        assertTrue("parsed history should show expenses", report.expenses > 0)
    }
}
