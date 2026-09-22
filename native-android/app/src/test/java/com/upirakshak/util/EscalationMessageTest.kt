package com.upirakshak.util

import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Covers the escalation copy only. The intents are built here too but not
 * asserted on, because Android's Intent is a stub in plain JVM tests.
 */
class EscalationMessageTest {

    private fun analysis(
        level: ThreatLevel = ThreatLevel.HIGH,
        reasons: List<String> = listOf("Urgency language"),
        action: String = "Do not pay",
        route: String? = "Use the official BSES app",
        original: String = "URGENT: electricity disconnected tonight"
    ) = ThreatAnalysis(
        level = level,
        reasons = reasons,
        matchedPatterns = emptyList(),
        suggestedAction = action,
        officialRoute = route,
        originalText = original
    )

    @Test
    fun `high threat message names the risk plainly`() {
        val text = EscalationMessage.build(analysis())

        assertTrue(text.startsWith("UPI Rakshak alert: this payment request looks like fraud"))
    }

    @Test
    fun `medium threat asks for a check rather than alleging fraud`() {
        val text = EscalationMessage.build(analysis(level = ThreatLevel.MEDIUM))

        assertTrue(text.contains("please check this payment request"))
        assertFalse(text.contains("looks like fraud"))
    }

    @Test
    fun `the original message is quoted so the contact can judge it`() {
        val text = EscalationMessage.build(analysis())

        assertTrue(text.contains("URGENT: electricity disconnected tonight"))
    }

    @Test
    fun `reasons appear as a bullet list`() {
        val text = EscalationMessage.build(
            analysis(reasons = listOf("Urgency language", "Lookalike UPI ID"))
        )

        assertTrue(text.contains("• Urgency language"))
        assertTrue(text.contains("• Lookalike UPI ID"))
    }

    @Test
    fun `official route is included when present`() {
        val text = EscalationMessage.build(analysis())

        assertTrue(text.contains("Safe route: Use the official BSES app"))
    }

    @Test
    fun `official route is omitted when absent`() {
        val text = EscalationMessage.build(analysis(route = null))

        assertFalse(text.contains("Safe route:"))
    }

    @Test
    fun `blank original text does not leave an empty quote block`() {
        val text = EscalationMessage.build(analysis(original = "   "))

        assertFalse(text.contains("Message received:"))
    }

    @Test
    fun `message always closes with the confirmation ask`() {
        listOf(ThreatLevel.HIGH, ThreatLevel.MEDIUM, ThreatLevel.SAFE).forEach { level ->
            val text = EscalationMessage.build(analysis(level = level))
            assertTrue("level $level", text.trimEnd().endsWith("Please confirm before I pay."))
        }
    }

    @Test
    fun `suggested action is always carried into the message`() {
        val text = EscalationMessage.build(analysis(action = "Verify on the official app"))

        assertTrue(text.contains("Verify on the official app"))
    }

    @Test
    fun `the helpline constant is the government number`() {
        assertTrue(CYBERCRIME_HELPLINE == "1930")
    }
}
