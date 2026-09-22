package com.upirakshak.data

import java.time.LocalDate

/**
 * Packaged transaction history used when the user has not opted into reading their own
 * messages, and by tests that must not depend on a device inbox.
 *
 * Dates are fixed in the past so the forecast is deterministic; the figures are
 * illustrative, not a claim about the user's own finances.
 */
object SampleTransactions {

    val entries: List<SmsEntry> = listOf(
        // Day 1: Salary credit
        SmsEntry(
            date = LocalDate.of(2025, 1, 1),
            sender = "HDFC Bank",
            message = "Your a/c XX1234 credited with Rs 35000 on 01-01-2025 towards SALARY. Available balance: Rs 42,500",
            amount = 35000.0,
            type = SmsType.CREDIT
        ),

        // Day 5: Rent payment
        SmsEntry(
            date = LocalDate.of(2025, 1, 5),
            sender = "HDFC Bank",
            message = "Rs 12000 debited from a/c XX1234 on 05-01-2025 towards RENT PAYMENT. Available balance: Rs 30,500",
            amount = 12000.0,
            type = SmsType.DEBIT
        ),

        // Day 7: Grocery (BigBasket)
        SmsEntry(
            date = LocalDate.of(2025, 1, 7),
            sender = "HDFC Bank",
            message = "Rs 1200 debited from a/c XX1234 on 07-01-2025 at BIGBASKET. Available balance: Rs 29,300",
            amount = 1200.0,
            type = SmsType.DEBIT
        ),

        // Day 10: Electricity bill
        SmsEntry(
            date = LocalDate.of(2025, 1, 10),
            sender = "HDFC Bank",
            message = "Rs 2400 debited from a/c XX1234 on 10-01-2025 towards BSES ELECTRICITY. Available balance: Rs 26,900",
            amount = 2400.0,
            type = SmsType.DEBIT
        ),

        // Day 12: Grocery (DMart)
        SmsEntry(
            date = LocalDate.of(2025, 1, 12),
            sender = "HDFC Bank",
            message = "Rs 800 debited from a/c XX1234 on 12-01-2025 at DMART. Available balance: Rs 26,100",
            amount = 800.0,
            type = SmsType.DEBIT
        ),

        // Day 15: EMI payment
        SmsEntry(
            date = LocalDate.of(2025, 1, 15),
            sender = "HDFC Bank",
            message = "Rs 4500 debited from a/c XX1234 on 15-01-2025 towards EMI for personal loan. Available balance: Rs 21,600",
            amount = 4500.0,
            type = SmsType.DEBIT
        ),

        // Day 16: Jio recharge
        SmsEntry(
            date = LocalDate.of(2025, 1, 16),
            sender = "HDFC Bank",
            message = "Rs 299 debited from a/c XX1234 on 16-01-2025 towards JIO RECHARGE. Available balance: Rs 21,301",
            amount = 299.0,
            type = SmsType.DEBIT
        ),

        // Day 18: Food delivery (Swiggy)
        SmsEntry(
            date = LocalDate.of(2025, 1, 18),
            sender = "HDFC Bank",
            message = "Rs 1500 debited from a/c XX1234 on 18-01-2025 at SWIGGY. Available balance: Rs 19,801",
            amount = 1500.0,
            type = SmsType.DEBIT
        ),

        // Day 20: Online shopping (Amazon)
        SmsEntry(
            date = LocalDate.of(2025, 1, 20),
            sender = "HDFC Bank",
            message = "Rs 2000 debited from a/c XX1234 on 20-01-2025 at AMAZON. Available balance: Rs 17,801",
            amount = 2000.0,
            type = SmsType.DEBIT
        ),

        // Day 22: SCAM SMS (informational)
        SmsEntry(
            date = LocalDate.of(2025, 1, 22),
            sender = "UNKNOWN",
            message = "URGENT: Your KYC is blocked. Click here to verify immediately or account will be suspended: http://sbi-verify.online",
            amount = 0.0,
            type = SmsType.INFO
        ),

        // Day 23: Uber ride
        SmsEntry(
            date = LocalDate.of(2025, 1, 23),
            sender = "HDFC Bank",
            message = "Rs 600 debited from a/c XX1234 on 23-01-2025 at UBER. Available balance: Rs 17,201",
            amount = 600.0,
            type = SmsType.DEBIT
        ),

        // Day 25: Food delivery (Zomato)
        SmsEntry(
            date = LocalDate.of(2025, 1, 25),
            sender = "HDFC Bank",
            message = "Rs 1800 debited from a/c XX1234 on 25-01-2025 at ZOMATO. Available balance: Rs 15,401",
            amount = 1800.0,
            type = SmsType.DEBIT
        ),

        // Day 27: Medicine (MedPlus)
        SmsEntry(
            date = LocalDate.of(2025, 1, 27),
            sender = "HDFC Bank",
            message = "Rs 900 debited from a/c XX1234 on 27-01-2025 at MEDPLUS. Available balance: Rs 14,501",
            amount = 900.0,
            type = SmsType.DEBIT
        ),

        // Day 28: Grocery (Reliance Smart)
        SmsEntry(
            date = LocalDate.of(2025, 1, 28),
            sender = "HDFC Bank",
            message = "Rs 1100 debited from a/c XX1234 on 28-01-2025 at RELIANCE SMART. Available balance: Rs 13,401",
            amount = 1100.0,
            type = SmsType.DEBIT
        ),

        // Day 30: Train ticket (IRCTC)
        SmsEntry(
            date = LocalDate.of(2025, 1, 30),
            sender = "HDFC Bank",
            message = "Rs 700 debited from a/c XX1234 on 30-01-2025 at IRCTC. Available balance: Rs 12,701",
            amount = 700.0,
            type = SmsType.DEBIT
        )
    )
}
