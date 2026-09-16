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
    fun testDigitalArrestScamIsHighRisk() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "CBI officer video call, digital arrest, money laundering verification"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testApkDistributionIsHighRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Install this APK for traffic e-challan fine payment"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testRemoteAccessAppIsHighRisk() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "Please install AnyDesk for screen share, we will help with KYC"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testAutopayTrapIsHighRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Verify your account with ₹1 to activate subscription"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testPinForReceivingIsHighRisk() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "Enter UPI PIN to receive your refund money"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testInvestmentScamIsHighRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Guaranteed returns of 30% monthly in our trading group"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testLoanAppPredatoryIsHighRisk() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "Instant loan in 10 minutes, no documents, contact access required"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testJobScamIsHighRisk() {
        val result = RulesEngine.analyze(
            "SMS",
            "Work from home, part time job, registration fee ₹500"
        )
        assertEquals(ThreatLevel.HIGH, result.level)
    }

    @Test
    fun testSimSwapFraudIsHighRisk() {
        val result = RulesEngine.analyze(
            "WhatsApp",
            "Your SIM will be blocked, OTP was sent but no request was made"
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
