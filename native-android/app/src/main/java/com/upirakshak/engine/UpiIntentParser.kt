package com.upirakshak.engine

import android.net.Uri

/**
 * A `upi://pay` request lifted out of an incoming intent.
 *
 * Only the fields the user is asked to confirm are kept. Nothing is logged; the values are
 * shown back to the user so they can check the payee before their UPI app opens.
 */
data class UpiPaymentRequest(
    val payeeVpa: String,
    val payeeName: String?,
    val amount: String?,
    val transactionNote: String?,
    val merchantCode: String?
) {
    /**
     * The text handed to [RulesEngine]. Composed from the request fields so the existing
     * keyword catalogue applies without a second detection path.
     */
    fun toAnalysisText(): String = buildString {
        append("UPI payment request")
        append(" payee ").append(payeeVpa)
        payeeName?.let { append(" name ").append(it) }
        amount?.let { append(" amount ").append(it) }
        transactionNote?.let { append(" note ").append(it) }
        merchantCode?.let { append(" mcc ").append(it) }
    }
}

/**
 * Parses `upi://pay` deep links.
 *
 * Deliberately tolerant: UPI apps themselves disagree about which parameters are required,
 * so an unparseable link is rejected rather than guessed at, and optional fields stay null.
 */
object UpiIntentParser {

    /** UPI's own scheme. `upi://pay` is the collect/pay request form. */
    const val SCHEME = "upi"

    /** Host for a payment request. `upi://mandate` exists too but is not handled here. */
    const val HOST_PAY = "pay"

    /** `pa` (payee address) is the only field a payment cannot proceed without. */
    private const val PARAM_PAYEE = "pa"
    private const val PARAM_NAME = "pn"
    private const val PARAM_AMOUNT = "am"
    private const val PARAM_NOTE = "tn"
    private const val PARAM_MERCHANT_CODE = "mc"

    /**
     * A VPA is `localpart@handle`. Handles are alphanumeric, 2-20 chars by NPCI convention;
     * the local part may contain letters, digits, dot, hyphen and underscore.
     */
    private val VPA_REGEX = Regex("""^[A-Za-z0-9][A-Za-z0-9._-]{1,255}@[A-Za-z][A-Za-z0-9]{1,20}$""")

    /** Amounts are decimal with up to two places; anything else is treated as absent. */
    private val AMOUNT_REGEX = Regex("""^\d{1,12}(\.\d{1,2})?$""")

    /** Transaction notes can carry adversarial content; cap what we echo back. */
    private const val MAX_TEXT_LENGTH = 120

    /** Parameters read from a link, in the order they are documented. */
    private val PARAMS = listOf(
        PARAM_PAYEE, PARAM_NAME, PARAM_AMOUNT, PARAM_NOTE, PARAM_MERCHANT_CODE
    )

    /**
     * @return the parsed request, or null when the link is not a usable payment request.
     */
    fun parse(uri: Uri?): UpiPaymentRequest? {
        if (uri == null) return null
        return parse(
            scheme = uri.scheme,
            host = uri.host,
            // Uri decodes percent-escapes for us; validation happens on the decoded values.
            params = PARAMS.associateWith { uri.getQueryParameter(it) }
        )
    }

    /**
     * Decoded form of [parse], kept free of Android types so the validation rules are
     * testable on the JVM without an emulator.
     *
     * @param params query parameters, already percent-decoded; absent keys may be null.
     */
    fun parse(scheme: String?, host: String?, params: Map<String, String?>): UpiPaymentRequest? {
        if (!scheme.equals(SCHEME, ignoreCase = true)) return null
        if (!host.equals(HOST_PAY, ignoreCase = true)) return null

        val payee = params[PARAM_PAYEE]?.trim().orEmpty()
        if (!isValidVpa(payee)) return null

        return UpiPaymentRequest(
            payeeVpa = payee,
            payeeName = sanitizeOptional(params[PARAM_NAME]),
            amount = sanitizeAmount(params[PARAM_AMOUNT]),
            transactionNote = sanitizeOptional(params[PARAM_NOTE]),
            merchantCode = sanitizeOptional(params[PARAM_MERCHANT_CODE])
        )
    }

    /**
     * Validates a VPA before it is shown or matched against patterns.
     *
     * Rejects anything with whitespace, control characters, or a second `@`, so a crafted
     * `pa` value cannot smuggle extra text into the warning the user reads.
     */
    fun isValidVpa(candidate: String): Boolean = VPA_REGEX.matches(candidate)

    /**
     * Keeps a field only if it is non-blank and free of control characters, truncated to a
     * display-safe length. Returns null rather than an empty string so callers can omit it.
     */
    private fun sanitizeOptional(raw: String?): String? {
        val value = raw?.trim().orEmpty()
        if (value.isEmpty()) return null
        if (value.any { it.isISOControl() }) return null
        return value.take(MAX_TEXT_LENGTH)
    }

    private fun sanitizeAmount(raw: String?): String? {
        val value = raw?.trim().orEmpty()
        return if (AMOUNT_REGEX.matches(value)) value else null
    }
}
