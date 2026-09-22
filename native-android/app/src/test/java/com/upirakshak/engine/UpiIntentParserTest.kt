package com.upirakshak.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The parser is the boundary between untrusted deep links and everything downstream, so the
 * rejection cases matter more than the happy path.
 */
class UpiIntentParserTest {

    /** Exercises the decoded entry point, which is what the Android layer delegates to. */
    private fun parse(vararg params: Pair<String, String?>): UpiPaymentRequest? =
        UpiIntentParser.parse("upi", "pay", params.toMap())

    @Test
    fun `parses a complete payment request`() {
        val request = parse(
            "pa" to "merchant@okhdfcbank",
            "pn" to "Corner Shop",
            "am" to "250.00",
            "tn" to "Order 123",
            "mc" to "5411"
        )

        assertTrue(request != null)
        assertEquals("merchant@okhdfcbank", request!!.payeeVpa)
        assertEquals("Corner Shop", request.payeeName)
        assertEquals("250.00", request.amount)
        assertEquals("Order 123", request.transactionNote)
        assertEquals("5411", request.merchantCode)
    }

    @Test
    fun `parses a request with only the payee`() {
        val request = parse("pa" to "someone@upi")

        assertTrue(request != null)
        assertEquals("someone@upi", request!!.payeeVpa)
        assertNull(request.payeeName)
        assertNull(request.amount)
        assertNull(request.transactionNote)
    }

    @Test
    fun `rejects a link with no payee`() {
        assertNull(parse("pn" to "Somebody", "am" to "10.00"))
    }

    @Test
    fun `rejects a malformed payee`() {
        assertNull(parse("pa" to "not-an-upi-id"))
        assertNull(parse("pa" to "two@at@signs"))
        assertNull(parse("pa" to "@handle"))
        assertNull(parse("pa" to "localpart@"))
    }

    @Test
    fun `rejects a payee carrying whitespace or control characters`() {
        assertNull(parse("pa" to "bad actor@upi"))
        assertNull(parse("pa" to "bad\nactor@upi"))
        assertNull(parse("pa" to "bad\tactor@upi"))
    }

    @Test
    fun `rejects other hosts and schemes`() {
        assertNull(UpiIntentParser.parse("upi", "mandate", mapOf("pa" to "someone@upi")))
        assertNull(UpiIntentParser.parse("https", "example.com", mapOf("pa" to "someone@upi")))
        assertNull(UpiIntentParser.parse(null, "pay", mapOf("pa" to "someone@upi")))
        assertNull(UpiIntentParser.parse("upi", null, mapOf("pa" to "someone@upi")))
    }

    @Test
    fun `accepts scheme and host case-insensitively`() {
        assertTrue(UpiIntentParser.parse("UPI", "PAY", mapOf("pa" to "someone@upi")) != null)
    }

    @Test
    fun `drops an amount that is not a plain decimal`() {
        assertNull(parse("pa" to "someone@upi", "am" to "abc")!!.amount)
        assertNull(parse("pa" to "someone@upi", "am" to "1.234")!!.amount)
        assertNull(parse("pa" to "someone@upi", "am" to "-5")!!.amount)
        assertNull(parse("pa" to "someone@upi", "am" to "1e5")!!.amount)
    }

    @Test
    fun `keeps a whole-number amount`() {
        assertEquals("500", parse("pa" to "someone@upi", "am" to "500")!!.amount)
    }

    @Test
    fun `drops a control-character note rather than echoing it`() {
        assertNull(parse("pa" to "someone@upi", "tn" to "bad\nvalue")!!.transactionNote)
    }

    @Test
    fun `truncates an overlong note`() {
        assertEquals(120, parse("pa" to "someone@upi", "tn" to "x".repeat(500))!!.transactionNote!!.length)
    }

    @Test
    fun `analysis text carries the payee so keyword rules can see it`() {
        val text = parse("pa" to "electricity-care@upi", "pn" to "BSES", "am" to "1200")!!
            .toAnalysisText()

        assertTrue(text.contains("electricity-care@upi"))
        assertTrue(text.contains("BSES"))
    }

    @Test
    fun `a lookalike payee is scored as suspicious by the engine`() {
        // End-to-end: what the interceptor actually does with a hostile link. The VPA
        // borrows the bank's name and the note carries the payment trap.
        val request = parse(
            "pa" to "bses-billpay@icici",
            "pn" to "BSES",
            "am" to "4999",
            "tn" to "URGENT electricity disconnected tonight scan qr to pay"
        )
        val analysis = RulesEngine.analyze("UPI payment request", request!!.toAnalysisText())

        assertEquals(ThreatLevel.HIGH, analysis.level)
        assertTrue(analysis.riskScore >= RiskScore.HIGH_THRESHOLD)
    }

    @Test
    fun `a benign payee is forwarded without a warning`() {
        val request = parse("pa" to "cornerstore@okaxis", "pn" to "Corner Store", "am" to "40")
        val analysis = RulesEngine.analyze("UPI payment request", request!!.toAnalysisText())

        assertEquals(ThreatLevel.SAFE, analysis.level)
    }

    @Test
    fun `a hostile note escalates a clean payee`() {
        // The payee is unremarkable; the note is the whole scam.
        val request = parse("pa" to "randomshop@okaxis", "tn" to "enter upi pin to receive refund money")
        val analysis = RulesEngine.analyze("UPI payment request", request!!.toAnalysisText())

        assertEquals(ThreatLevel.HIGH, analysis.level)
    }

    @Test
    fun `vpa validation accepts realistic handles`() {
        assertTrue(UpiIntentParser.isValidVpa("9876543210@ybl"))
        assertTrue(UpiIntentParser.isValidVpa("first.last-name_1@okicici"))
        assertTrue(UpiIntentParser.isValidVpa("shop@paytm"))
    }

    @Test
    fun `vpa validation rejects empty and oversized input`() {
        assertFalse(UpiIntentParser.isValidVpa(""))
        assertFalse(UpiIntentParser.isValidVpa("@"))
        assertFalse(UpiIntentParser.isValidVpa("a@" + "b".repeat(50)))
    }
}
