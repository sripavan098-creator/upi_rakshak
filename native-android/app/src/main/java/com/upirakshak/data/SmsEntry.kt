package com.upirakshak.data

import java.time.LocalDate

/**
 * Represents a single SMS message from bank/app notifications
 */
data class SmsEntry(
    val date: LocalDate,
    val sender: String,
    val message: String,
    val amount: Double,
    val type: SmsType
)

/**
 * Type of SMS transaction
 */
enum class SmsType {
    CREDIT,  // Money received (salary, refund, etc.)
    DEBIT,   // Money spent (rent, EMI, groceries, etc.)
    INFO     // Informational (OTP, alerts, etc.)
}
