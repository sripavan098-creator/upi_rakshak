package com.upirakshak.data

enum class SmsType {
    CREDIT, DEBIT, INFO
}

data class SmsEntry(
    val date: String,
    val sender: String,
    val message: String,
    val amount: Double? = null,
    val type: SmsType
)
