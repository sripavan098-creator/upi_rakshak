package com.upirakshak.ui.onboarding

/**
 * The things the user must do before protection actually works.
 *
 * Kept as plain data so ordering and completion logic can be unit tested
 * without a Compose runtime.
 */
enum class OnboardingStep {
    LANGUAGE,
    NOTIFICATION_ACCESS,
    OVERLAY_PERMISSION
}

/** What the app knows about the user's progress right now. */
data class OnboardingState(
    val notificationAccessGranted: Boolean,
    val overlayGranted: Boolean,
    val dismissed: Boolean
)

object OnboardingPlan {

    /** Steps in the order they should be shown. */
    val steps: List<OnboardingStep> = listOf(
        OnboardingStep.LANGUAGE,
        OnboardingStep.NOTIFICATION_ACCESS,
        OnboardingStep.OVERLAY_PERMISSION
    )

    fun firstIncomplete(state: OnboardingState): OnboardingStep? = steps.firstOrNull { step ->
        when (step) {
            // Language has a working default, so it never blocks progress.
            OnboardingStep.LANGUAGE -> false
            OnboardingStep.NOTIFICATION_ACCESS -> !state.notificationAccessGranted
            OnboardingStep.OVERLAY_PERMISSION -> !state.overlayGranted
        }
    }

    /** Protection needs both runtime grants, regardless of the language. */
    fun isProtectionReady(state: OnboardingState): Boolean =
        state.notificationAccessGranted && state.overlayGranted

    /** The wizard stops showing once protection is ready or the user opts out. */
    fun shouldShow(state: OnboardingState): Boolean =
        !state.dismissed && !isProtectionReady(state)

    /**
     * A short reason shown with each grant button. Explains why the access is
     * needed rather than just asking for it.
     */
    fun rationale(step: OnboardingStep): String = when (step) {
        OnboardingStep.LANGUAGE ->
            "Choose the language for warnings and voice alerts."
        OnboardingStep.NOTIFICATION_ACCESS ->
            "Reads incoming WhatsApp and SMS on this phone so a scam is caught before you act. Messages are checked on the device and never uploaded."
        OnboardingStep.OVERLAY_PERMISSION ->
            "Draws the red warning over whatever app you are using, so the alert cannot be missed."
    }
}
