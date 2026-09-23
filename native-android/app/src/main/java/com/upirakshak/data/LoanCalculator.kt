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

        val totalInterest = monthlyEmi * n - option.principal
        val processingFee = option.principal * option.processingFeePercent / 100
        val totalFees = processingFee + option.flatFees

        // Fees are real money the borrower hands over, so they belong in the
        // total. Only counting interest here understates the cost of every loan.
        val totalRepayment = monthlyEmi * n + totalFees

        // The borrower receives principal minus the fees taken up front, so the
        // rate that actually applies to the money in hand is higher than nominal.
        val netProceeds = option.principal - totalFees
        val effectiveAnnualRate = annualPercentageRate(netProceeds, monthlyEmi, n)

        return LoanTotal(
            option = option,
            monthlyEmi = monthlyEmi,
            totalInterest = totalInterest,
            totalFees = totalFees,
            totalRepayment = totalRepayment,
            effectiveAnnualRate = effectiveAnnualRate
        )
    }

    /**
     * True annual percentage rate: the monthly discount rate at which the
     * scheduled payments equal the money the borrower actually receives.
     * Solved by bisection, which is stable for every input here and avoids
     * pulling in a maths dependency for one closed-form case.
     */
    private fun annualPercentageRate(
        netProceeds: Double,
        monthlyEmi: Double,
        tenureMonths: Double
    ): Double {
        if (netProceeds <= 0.0 || monthlyEmi <= 0.0 || tenureMonths <= 0.0) return 0.0

        var low = 0.0
        var high = 1.0
        repeat(200) {
            val mid = (low + high) / 2
            if (presentValue(monthlyEmi, mid, tenureMonths) > netProceeds) low = mid else high = mid
        }
        return (low + high) / 2 * 12 * 100
    }

    private fun presentValue(payment: Double, monthlyRate: Double, n: Double): Double =
        if (monthlyRate == 0.0) payment * n
        else payment * (1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate

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
