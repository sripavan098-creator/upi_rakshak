package com.upirakshak.ui.components

import com.upirakshak.R
import com.upirakshak.engine.ThreatLevel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class ThreatLevelPresentationTest {

    @Test
    fun `every level maps to a distinct badge string`() {
        val resources = ThreatLevel.entries.map { it.badgeRes }

        assertEquals(ThreatLevel.entries.size, resources.toSet().size)
    }

    @Test
    fun `high maps to the threat-detected string`() {
        assertEquals(R.string.threat_detected, ThreatLevel.HIGH.badgeRes)
    }

    @Test
    fun `medium maps to suspicious and never to safe`() {
        assertEquals(R.string.suspicious, ThreatLevel.MEDIUM.badgeRes)
        assertNotEquals(ThreatLevel.SAFE.badgeRes, ThreatLevel.MEDIUM.badgeRes)
    }

    @Test
    fun `safe maps to the safe string`() {
        assertEquals(R.string.safe, ThreatLevel.SAFE.badgeRes)
    }

    @Test
    fun `each level resolves to a different colour`() {
        val tints = ThreatLevel.entries.map { it.tint }

        assertEquals(ThreatLevel.entries.size, tints.toSet().size)
    }
}
