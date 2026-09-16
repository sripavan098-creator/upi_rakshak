package com.upirakshak.engine

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Unit tests for RulesEngine
 * Tests all 8 critical scam detection scenarios
 */
class RulesEngineTest {

    @Test
    fun testElectricityScamIsHighRisk() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "URGENT: Electricity disconnected tonight, scan QR to pay bsescare@icici"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testBankKycScamIsHighRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Your SBI account blocked, enter UPI PIN immediately"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testPrizeScamIsHighRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Congratulations! Pay ₹500 to receive ₹10,000"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testOtpMessageIsSafe() {
        val result = RulesEngine.analyze(
            "HDFC Bank",
            "Your OTP is 123456. Do not share."
        )
        assertEquals(ThreatLevel.SAFE, result.level)
    }

    @Test
    fun testFriendChatIsSafe() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "Hi, this is your friend, sending money"
        )
        assertEquals(ThreatLevel.SAFE, result.level)
    }

    @Test
    fun testPaytmCareLookalikeIsMediumRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Paytm care: verify your KYC now"
        )
        assertEquals(ThreatLevel.MEDIUM, result.level)
    }

    @Test
    fun testJobOfferScamIsHighRisk() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "Job offer! Registration fee ₹500 required"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testGovernmentSchemeWithSuspiciousUrlIsHighRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Government scheme approved. Click verify-kyc.online"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testRunTestsReturnsAllPassing() {
        val results = RulesEngine.runTests()
        assertEquals(8, results.size)
        results.forEach { (description, passed) ->
            assertEquals("Test failed: $description", true, passed)
        }
    }
}
