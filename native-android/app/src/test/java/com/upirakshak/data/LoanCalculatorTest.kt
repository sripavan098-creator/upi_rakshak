package com.upirakshak.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LoanCalculatorTest {

    private fun option(
        principal: Double = 10000.0,
        rate: Double = 12.0,
        months: Int = 12,
        feePercent: Double = 0.0,
        flatFees: Double = 0.0
    ) = LoanOption(
        name = "Test",
        principal = principal,
        annualInterestRate = rate,
        tenureMonths = months,
        processingFeePercent = feePercent,
        flatFees = flatFees
    )

    @Test
    fun `zero interest splits principal evenly across tenure`() {
        val result = LoanCalculator.calculate(option(rate = 0.0, months = 10))

        assertEquals(1000.0, result.monthlyEmi, 0.01)
        assertEquals(0.0, result.totalInterest, 0.01)
    }

    @Test
    fun `emi matches the standard annuity formula`() {
        // P=100000, 12% annual, 12 months -> EMI 8884.88
        val result = LoanCalculator.calculate(
            option(principal = 100000.0, rate = 12.0, months = 12)
        )

        assertEquals(8884.88, result.monthlyEmi, 0.01)
    }

    @Test
    fun `total interest is repayment minus principal`() {
        val result = LoanCalculator.calculate(option(principal = 100000.0, rate = 12.0, months = 12))

        assertEquals(result.totalRepayment - 100000.0, result.totalInterest, 0.01)
    }

    @Test
    fun `processing fee is a percentage of principal and adds to fees`() {
        val result = LoanCalculator.calculate(option(feePercent = 5.0))

        assertEquals(500.0, result.totalFees, 0.01)
    }

    @Test
    fun `flat fees are added on top of the percentage fee`() {
        val result = LoanCalculator.calculate(option(feePercent = 5.0, flatFees = 200.0))

        assertEquals(700.0, result.totalFees, 0.01)
    }

    @Test
    fun `total repayment covers principal interest and fees`() {
        val result = LoanCalculator.calculate(option(feePercent = 1.0, flatFees = 50.0))

        assertEquals(
            result.option.principal + result.totalInterest + result.totalFees,
            result.totalRepayment,
            0.01
        )
    }

    @Test
    fun `effective annual rate exceeds the nominal rate when fees apply`() {
        val result = LoanCalculator.calculate(option(rate = 14.0, feePercent = 1.0))

        assertTrue(
            "fees should push the effective rate above nominal",
            result.effectiveAnnualRate > 14.0
        )
    }

    @Test
    fun `effective annual rate equals nominal when there are no fees`() {
        val result = LoanCalculator.calculate(option(rate = 14.0))

        assertEquals(14.0, result.effectiveAnnualRate, 0.1)
    }

    @Test
    fun `shorter tenure costs more to service per month`() {
        val threeMonths = LoanCalculator.calculate(option(months = 3))
        val twelveMonths = LoanCalculator.calculate(option(months = 12))

        assertTrue(threeMonths.monthlyEmi > twelveMonths.monthlyEmi)
    }

    @Test
    fun `presets are ordered from worst to best total cost`() {
        val totals = LoanCalculator.presetLoans.map { LoanCalculator.calculate(it) }

        val instant = totals.single { it.option.name == "Instant Loan App" }
        val bank = totals.single { it.option.name == "Bank Personal Loan" }

        assertTrue(
            "instant loan apps should cost more than a bank loan",
            instant.effectiveAnnualRate > bank.effectiveAnnualRate
        )
    }

    @Test
    fun `all presets return finite positive figures`() {
        LoanCalculator.presetLoans.forEach { preset ->
            val result = LoanCalculator.calculate(preset)

            assertTrue("${preset.name} emi", result.monthlyEmi > 0)
            assertTrue("${preset.name} repayment", result.totalRepayment > 0)
            assertTrue("${preset.name} rate", result.effectiveAnnualRate.isFinite())
        }
    }
}
