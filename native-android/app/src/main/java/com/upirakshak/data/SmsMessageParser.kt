package com.upirakshak.data

import java.time.LocalDate

/**
 * Turns a raw bank or wallet SMS into a structured [SmsEntry].
 *
 * This is the parsing half of cash-flow input. It is deliberately decoupled from
 * where the messages come from: the app currently feeds it mock data, but the
 * same parser works unchanged if a real SMS source is ever wired in.
 */
object SmsMessageParser {

    private val AMOUNT_REGEX = Regex(
        """(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)""",
        RegexOption.IGNORE_CASE
    )

    private val CREDIT_MARKERS = listOf(
        "credited", "credit", "received", "refund", "cashback", "deposited"
    )

    private val DEBIT_MARKERS = listOf(
        "debited", "debit", "spent", "withdrawn", "paid", "purchase", "sent"
    )

    // Balance clauses carry an amount we must not mistake for the transaction.
    private val BALANCE_MARKERS = listOf("balance", "bal.", "bal ", "avl", "available")

    private const val BALANCE_LOOKBEHIND = 24

    /**
     * Parse a single message. Returns null when there is no transaction amount,
     * which is the case for OTPs, promos, and scam bait.
     */
    fun parse(message: String, sender: String, date: LocalDate): SmsEntry? {
        val amount = extractTransactionAmount(message) ?: return SmsEntry(
            date = date,
            sender = sender,
            message = message,
            amount = 0.0,
            type = SmsType.INFO
        )

        return SmsEntry(
            date = date,
            sender = sender,
            message = message,
            amount = amount,
            type = detectType(message)
        )
    }

    /**
     * Find the transaction amount, skipping any amount that sits inside a
     * balance clause such as "Available balance: Rs 42,500".
     */
    fun extractTransactionAmount(message: String): Double? {
        val lower = message.lowercase()
        val matches = AMOUNT_REGEX.findAll(message)

        val candidate = matches.firstOrNull { match ->
            val prefixStart = (match.range.first - BALANCE_LOOKBEHIND).coerceAtLeast(0)
            val prefix = lower.substring(prefixStart, match.range.first)
            BALANCE_MARKERS.none { prefix.contains(it) }
        } ?: return null

        val digits = candidate.groupValues[1].replace(",", "")
        return digits.toDoubleOrNull()
    }

    fun detectType(message: String): SmsType {
        val lower = message.lowercase()
        // Debit markers are checked first: "debited ... balance credited" style
        // messages describe a debit, and the debit verb leads.
        val debitIndex = DEBIT_MARKERS.mapNotNull { marker -> indexOfWord(lower, marker) }.minOrNull()
        val creditIndex = CREDIT_MARKERS.mapNotNull { marker -> indexOfWord(lower, marker) }.minOrNull()

        return when {
            debitIndex == null && creditIndex == null -> SmsType.INFO
            debitIndex == null -> SmsType.CREDIT
            creditIndex == null -> SmsType.DEBIT
            debitIndex <= creditIndex -> SmsType.DEBIT
            else -> SmsType.CREDIT
        }
    }

    private fun indexOfWord(haystack: String, needle: String): Int? {
        val index = haystack.indexOf(needle)
        return if (index >= 0) index else null
    }
}
