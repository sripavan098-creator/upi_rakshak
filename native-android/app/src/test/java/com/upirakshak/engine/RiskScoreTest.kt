package com.upirakshak.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The score is the contract behind every verdict, so thresholds and weighting are
 * asserted directly rather than only through end-to-end message fixtures.
 */
class RiskScoreTest {

    @Test
    fun `thresholds map to the three threat levels`() {
        assertEquals(ThreatLevel.SAFE, RiskScore.levelFor(0))
        assertEquals(ThreatLevel.SAFE, RiskScore.levelFor(RiskScore.MEDIUM_THRESHOLD - 1))
        assertEquals(ThreatLevel.MEDIUM, RiskScore.levelFor(RiskScore.MEDIUM_THRESHOLD))
        assertEquals(ThreatLevel.MEDIUM, RiskScore.levelFor(RiskScore.HIGH_THRESHOLD - 1))
        assertEquals(ThreatLevel.HIGH, RiskScore.levelFor(RiskScore.HIGH_THRESHOLD))
    }

    @Test
    fun `medium threshold is below high threshold`() {
        assertTrue(RiskScore.MEDIUM_THRESHOLD < RiskScore.HIGH_THRESHOLD)
    }

    @Test
    fun `a payment trap alone reaches high`() {
        assertTrue(RiskScore.PAYMENT_TRAP >= RiskScore.HIGH_THRESHOLD)
    }

    @Test
    fun `a named high category alone reaches high`() {
        assertTrue(RiskScore.HIGH_CATEGORY >= RiskScore.HIGH_THRESHOLD)
    }

    @Test
    fun `a contextual category alone does not reach high`() {
        // romance/charity/fake-screenshot need corroboration to escalate.
        assertTrue(RiskScore.MEDIUM_CATEGORY < RiskScore.HIGH_THRESHOLD)
        assertTrue(RiskScore.MEDIUM_CATEGORY >= RiskScore.MEDIUM_THRESHOLD)
    }

    @Test
    fun `two weak signals together still stay below high`() {
        val score = RiskScore.URGENCY_KEYWORD_WEIGHT + RiskScore.SUSPICIOUS_KEYWORD_WEIGHT
        assertTrue(score < RiskScore.HIGH_THRESHOLD)
    }

    @Test
    fun `displayed score is clamped for the gauge`() {
        assertEquals(0, RiskScore.displayedScore(-10))
        assertEquals(RiskScore.MAX_DISPLAYED, RiskScore.displayedScore(175))
        assertEquals(50, RiskScore.displayedScore(50))
    }

    @Test
    fun `score above the display maximum still reports HIGH`() {
        // Digital-arrest style messages stack many categories well past 100.
        assertEquals(ThreatLevel.HIGH, RiskScore.levelFor(RiskScore.MAX_DISPLAYED + 75))
    }
}
