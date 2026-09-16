package com.upirakshak.data

object MockSmsRepository {
    
    val MOCK_SMS_HISTORY = listOf(
        SmsEntry("2025-01-01", "HDFC Bank", "Your a/c XX1234 credited with Rs 35000 on 01-01-2025 towards SALARY. Available balance: Rs 42,500", 35000.0, SmsType.CREDIT),
        SmsEntry("2025-01-05", "HDFC Bank", "Rs 12000 debited from a/c XX1234 on 05-01-2025 towards RENT PAYMENT. Available balance: Rs 30,500", 12000.0, SmsType.DEBIT),
        SmsEntry("2025-01-07", "HDFC Bank", "Rs 1200 debited from a/c XX1234 on 07-01-2025 at BIGBASKET. Available balance: Rs 29,300", 1200.0, SmsType.DEBIT),
        SmsEntry("2025-01-10", "HDFC Bank", "Rs 2400 debited from a/c XX1234 on 10-01-2025 towards BSES ELECTRICITY. Available balance: Rs 26,900", 2400.0, SmsType.DEBIT),
        SmsEntry("2025-01-12", "HDFC Bank", "Rs 800 debited from a/c XX1234 on 12-01-2025 at DMART. Available balance: Rs 26,100", 800.0, SmsType.DEBIT),
        SmsEntry("2025-01-15", "HDFC Bank", "Rs 4500 debited from a/c XX1234 on 15-01-2025 towards EMI for personal loan. Available balance: Rs 21,600", 4500.0, SmsType.DEBIT),
        SmsEntry("2025-01-16", "HDFC Bank", "Rs 299 debited from a/c XX1234 on 16-01-2025 towards JIO RECHARGE. Available balance: Rs 21,301", 299.0, SmsType.DEBIT),
        SmsEntry("2025-01-18", "HDFC Bank", "Rs 1500 debited from a/c XX1234 on 18-01-2025 at SWIGGY. Available balance: Rs 19,801", 1500.0, SmsType.DEBIT),
        SmsEntry("2025-01-20", "HDFC Bank", "Rs 2000 debited from a/c XX1234 on 20-01-2025 at AMAZON. Available balance: Rs 17,801", 2000.0, SmsType.DEBIT),
        SmsEntry("2025-01-22", "UNKNOWN", "URGENT: Your KYC is blocked. Click here to verify immediately or account will be suspended: http://sbi-verify.online", null, SmsType.INFO),
        SmsEntry("2025-01-23", "HDFC Bank", "Rs 600 debited from a/c XX1234 on 23-01-2025 at UBER. Available balance: Rs 17,201", 600.0, SmsType.DEBIT),
        SmsEntry("2025-01-25", "HDFC Bank", "Rs 1800 debited from a/c XX1234 on 25-01-2025 at ZOMATO. Available balance: Rs 15,401", 1800.0, SmsType.DEBIT),
        SmsEntry("2025-01-27", "HDFC Bank", "Rs 900 debited from a/c XX1234 on 27-01-2025 at MEDPLUS. Available balance: Rs 14,501", 900.0, SmsType.DEBIT),
        SmsEntry("2025-01-28", "HDFC Bank", "Rs 1100 debited from a/c XX1234 on 28-01-2025 at RELIANCE SMART. Available balance: Rs 13,401", 1100.0, SmsType.DEBIT),
        SmsEntry("2025-01-30", "HDFC Bank", "Rs 700 debited from a/c XX1234 on 30-01-2025 at IRCTC. Available balance: Rs 12,701", 700.0, SmsType.DEBIT)
    )
    
    fun getAll(): List<SmsEntry> = MOCK_SMS_HISTORY
}
