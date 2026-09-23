package com.upirakshak.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.ZoneId

/**
 * Covers the filtering that stands between a raw inbox and the cash-flow forecast. The
 * Android query itself needs a device, but the decision about which rows count is pure.
 */
class LiveSmsRepositoryTest {

    private fun millisAt(date: LocalDate): Long =
        date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()

    private fun row(body: String, date: LocalDate = LocalDate.of(2025, 3, 4), sender: String = "HDFC Bank") =
        LiveSmsRepository.Row(sender = sender, body = body, epochMillis = millisAt(date))

    @Test
    fun `a debit message becomes a debit entry`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(row("Rs 1200 debited from a/c XX1234 towards RENT PAYMENT. Available balance: Rs 30,500"))
        )

        assertEquals(1, entries.size)
        assertEquals(1200.0, entries.first().amount, 0.0001)
        assertEquals(SmsType.DEBIT, entries.first().type)
    }

    @Test
    fun `a credit message becomes a credit entry`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(row("Your a/c XX1234 credited with Rs 35000 towards SALARY"))
        )

        assertEquals(SmsType.CREDIT, entries.first().type)
        assertEquals(35000.0, entries.first().amount, 0.0001)
    }

    @Test
    fun `the balance amount is not mistaken for the transaction amount`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(row("Rs 500 debited from a/c XX1234. Available balance: Rs 42,500"))
        )

        assertEquals(500.0, entries.first().amount, 0.0001)
    }

    @Test
    fun `otp messages are dropped`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(row("123456 is your OTP for a transaction of Rs 0. Do not share it with anyone.", sender = "VM-HDFCBK"))
        )

        assertTrue(entries.isEmpty())
    }

    @Test
    fun `promotional messages are dropped`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(row("Get 10% cashback on your next purchase. T&C apply.", sender = "AD-AMAZON"))
        )

        assertTrue(entries.isEmpty())
    }

    @Test
    fun `scam bait with no transaction amount is dropped`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(row("URGENT: your electricity will be disconnected tonight. Call this number.", sender = "+91-9999999999"))
        )

        assertTrue(entries.isEmpty())
    }

    @Test
    fun `mixed inbox keeps only transaction messages`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(
                row("Rs 2000 debited from a/c XX1 towards UPI PAYMENT"),
                row("Your OTP is 445566"),
                row("Rs 50000 credited to a/c XX1 towards SALARY"),
                row("Big sale! Flat 70% off today")
            )
        )

        assertEquals(2, entries.size)
        assertEquals(SmsType.DEBIT, entries[0].type)
        assertEquals(SmsType.CREDIT, entries[1].type)
    }

    @Test
    fun `the row date is preserved`() {
        val date = LocalDate.of(2025, 2, 11)
        val entries = LiveSmsRepository.toEntries(listOf(row("Rs 100 debited from a/c XX1", date = date)))

        assertEquals(date, entries.first().date)
    }

    @Test
    fun `the sender is preserved for the forecast`() {
        val entries = LiveSmsRepository.toEntries(
            listOf(row("Rs 100 debited from a/c XX1", sender = "AXISBK"))
        )

        assertEquals("AXISBK", entries.first().sender)
    }

    @Test
    fun `an empty inbox yields no entries`() {
        assertTrue(LiveSmsRepository.toEntries(emptyList()).isEmpty())
    }

    @Test
    fun `epoch millis convert to a local date`() {
        val date = LocalDate.of(2025, 6, 15)
        assertEquals(date, LiveSmsRepository.toLocalDate(millisAt(date)))
    }
}
