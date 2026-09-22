package com.upirakshak.ui.onboarding

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class OnboardingPlanTest {

    private fun state(
        notification: Boolean = false,
        overlay: Boolean = false,
        dismissed: Boolean = false
    ) = OnboardingState(notification, overlay, dismissed)

    @Test
    fun `language is offered first`() {
        assertEquals(OnboardingStep.LANGUAGE, OnboardingPlan.steps.first())
    }

    @Test
    fun `notification access comes before overlay permission`() {
        val notificationIndex = OnboardingPlan.steps.indexOf(OnboardingStep.NOTIFICATION_ACCESS)
        val overlayIndex = OnboardingPlan.steps.indexOf(OnboardingStep.OVERLAY_PERMISSION)

        assertTrue(notificationIndex < overlayIndex)
    }

    @Test
    fun `first incomplete step is notification access on a fresh install`() {
        assertEquals(
            OnboardingStep.NOTIFICATION_ACCESS,
            OnboardingPlan.firstIncomplete(state())
        )
    }

    @Test
    fun `first incomplete moves to overlay once notification access is granted`() {
        assertEquals(
            OnboardingStep.OVERLAY_PERMISSION,
            OnboardingPlan.firstIncomplete(state(notification = true))
        )
    }

    @Test
    fun `no incomplete step remains when both grants are present`() {
        assertNull(OnboardingPlan.firstIncomplete(state(notification = true, overlay = true)))
    }

    @Test
    fun `protection needs both grants`() {
        assertFalse(OnboardingPlan.isProtectionReady(state(notification = true)))
        assertFalse(OnboardingPlan.isProtectionReady(state(overlay = true)))
        assertTrue(OnboardingPlan.isProtectionReady(state(notification = true, overlay = true)))
    }

    @Test
    fun `wizard shows when protection is not ready`() {
        assertTrue(OnboardingPlan.shouldShow(state()))
        assertTrue(OnboardingPlan.shouldShow(state(notification = true)))
    }

    @Test
    fun `wizard hides once protection is ready`() {
        assertFalse(OnboardingPlan.shouldShow(state(notification = true, overlay = true)))
    }

    @Test
    fun `skip suppresses the wizard even without grants`() {
        assertFalse(OnboardingPlan.shouldShow(state(dismissed = true)))
    }

    @Test
    fun `dismissal does not fake readiness`() {
        assertFalse(OnboardingPlan.isProtectionReady(state(dismissed = true)))
    }

    @Test
    fun `every step has a rationale that says why the access is needed`() {
        OnboardingPlan.steps.forEach { step ->
            val rationale = OnboardingPlan.rationale(step)

            assertTrue("$step rationale too short", rationale.length > 30)
        }
    }

    @Test
    fun `privacy claim is stated for notification access`() {
        val rationale = OnboardingPlan.rationale(OnboardingStep.NOTIFICATION_ACCESS)

        assertTrue(rationale.contains("never uploaded"))
    }
}
