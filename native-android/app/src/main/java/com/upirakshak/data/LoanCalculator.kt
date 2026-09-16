package com.upirakshak.data

data class LoanOption(
    val name: String,
    val principal: Double,
    val annualInterestRate: Double, // percentage
    val tenureMonths: Int,
    val processingFeePercent: Double = 0.0,
    val flatFees: Double = 0.0
)

data class LoanTotal(
    val option: LoanOption,
    val monthlyEmi: Double,
    val totalInterest: Double,
    val totalFees: Double,
    val totalRepayment: Double,
    val effectiveAnnualRate: Double
)

object LoanCalculator {
    fun calculate(option: LoanOption): LoanTotal {
        val monthlyRate = option.annualInterestRate / 100 / 12
        val n = option.tenureMonths.toDouble()

        // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
        val monthlyEmi = if (monthlyRate == 0.0) {
            option.principal / n
        } else {
            val pow = Math.pow(1 + monthlyRate, n)
            option.principal * monthlyRate * pow / (pow - 1)
        }

        val totalRepayment = monthlyEmi * n
        val totalInterest = totalRepayment - option.principal
        val processingFee = option.principal * option.processingFeePercent / 100
        val totalFees = processingFee + option.flatFees
        val totalCost = totalInterest + totalFees

        // Effective annual rate including all fees
        val effectiveAnnualRate = (totalCost / option.principal) * (12 / n) * 100

        return LoanTotal(
            option = option,
            monthlyEmi = monthlyEmi,
            totalInterest = totalInterest,
            totalFees = totalFees,
            totalRepayment = totalRepayment,
            effectiveAnnualRate = effectiveAnnualRate
        )
    }

    // Preset loan options for comparison
    val presetLoans = listOf(
        LoanOption(
            name = "Instant Loan App",
            principal = 10000.0,
            annualInterestRate = 36.0,
            tenureMonths = 3,
            processingFeePercent = 5.0,
            flatFees = 200.0
        ),
        LoanOption(
            name = "Bank Personal Loan",
            principal = 10000.0,
            annualInterestRate = 14.0,
            tenureMonths = 12,
            processingFeePercent = 1.0,
            flatFees = 0.0
        ),
        LoanOption(
            name = "Credit Card EMI",
            principal = 10000.0,
            annualInterestRate = 42.0,
            tenureMonths = 6,
            processingFeePercent = 0.0,
            flatFees = 199.0
        )
    )
}
