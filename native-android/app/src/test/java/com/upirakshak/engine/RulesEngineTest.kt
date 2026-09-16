package com.upirakshak.engine

import org.junit.Assert.*
import org.junit.Test

class RulesEngineTest {
    
    @Test
    fun `electricity scam should be HIGH risk`() {
        val title = "WhatsApp"
        val text = "URGENT: Your electricity will be disconnected tonight! Pay now via QR to avoid ₹5000 fine. UPI: bsescare@icici"
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.HIGH, result.level)
        assertTrue(result.reasons.isNotEmpty())
        assertNotNull(result.officialRoute)
    }
    
    @Test
    fun `bank KYC scam should be HIGH risk`() {
        val title = "SMS"
        val text = "Your SBI account has been blocked. Enter UPI PIN to verify and unblock immediately."
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.HIGH, result.level)
        assertTrue(result.reasons.isNotEmpty())
    }
    
    @Test
    fun `prize scam should be HIGH risk`() {
        val title = "SMS"
        val text = "Congratulations! Pay ₹500 processing fee to receive ₹10,000 lottery prize. UPI: refundcare@paytm"
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.HIGH, result.level)
        assertTrue(result.reasons.isNotEmpty())
    }
    
    @Test
    fun `OTP message should be SAFE`() {
        val title = "HDFC Bank"
        val text = "OTP for transaction is 123456. Valid for 5 minutes. Do not share with anyone."
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.SAFE, result.level)
    }
    
    @Test
    fun `friend chat should be SAFE`() {
        val title = "WhatsApp"
        val text = "Hi, this is your friend, sending money"
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.SAFE, result.level)
    }
    
    @Test
    fun `Paytm care lookalike should be MEDIUM risk`() {
        val title = "SMS"
        val text = "Paytm care: verify your KYC to avoid account suspension"
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.MEDIUM, result.level)
        assertTrue(result.reasons.isNotEmpty())
    }
    
    @Test
    fun `job registration fee scam should be HIGH risk`() {
        val title = "WhatsApp"
        val text = "URGENT: Pay ₹999 registration fee immediately to secure your job. Aaj hi pay karo or position chali jayegi. UPI: jobhelp@paytm"
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.HIGH, result.level)
        assertTrue(result.reasons.isNotEmpty())
    }
    
    @Test
    fun `government scheme scam should be HIGH risk`() {
        val title = "SMS"
        val text = "Congratulations! You have been selected for PM Kisan scheme. Pay ₹500 processing fee to verify-kyc.online to receive ₹2000 benefit."
        
        val result = RulesEngine.analyze(title, text)
        
        assertEquals(ThreatLevel.HIGH, result.level)
        assertTrue(result.reasons.isNotEmpty())
    }
}
