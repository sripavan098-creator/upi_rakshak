package com.upirakshak.engine

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ScamPatternsTest {

    private val categories: Map<String, List<String>> = mapOf(
        "URGENCY_KEYWORDS" to ScamPatterns.URGENCY_KEYWORDS,
        "SUSPICIOUS_UPI_PATTERNS" to ScamPatterns.SUSPICIOUS_UPI_PATTERNS,
        "PAYMENT_TRAPS" to ScamPatterns.PAYMENT_TRAPS,
        "LOOKALIKE_DOMAINS" to ScamPatterns.LOOKALIKE_DOMAINS,
        "SUSPICIOUS_KEYWORDS" to ScamPatterns.SUSPICIOUS_KEYWORDS,
        "AI_DEEPFAKE_KEYWORDS" to ScamPatterns.AI_DEEPFAKE_KEYWORDS,
        "AUTOPAY_TRAP_KEYWORDS" to ScamPatterns.AUTOPAY_TRAP_KEYWORDS,
        "AEPS_FRAUD_KEYWORDS" to ScamPatterns.AEPS_FRAUD_KEYWORDS,
        "CALL_MERGE_KEYWORDS" to ScamPatterns.CALL_MERGE_KEYWORDS,
        "ROGUE_QR_KEYWORDS" to ScamPatterns.ROGUE_QR_KEYWORDS,
        "MALWARE_APK_KEYWORDS" to ScamPatterns.MALWARE_APK_KEYWORDS,
        "REMOTE_ACCESS_KEYWORDS" to ScamPatterns.REMOTE_ACCESS_KEYWORDS,
        "DIGITAL_ARREST_KEYWORDS" to ScamPatterns.DIGITAL_ARREST_KEYWORDS,
        "INVESTMENT_SCAM_KEYWORDS" to ScamPatterns.INVESTMENT_SCAM_KEYWORDS,
        "LOAN_APP_TRAP_KEYWORDS" to ScamPatterns.LOAN_APP_TRAP_KEYWORDS,
        "JOB_SCAM_KEYWORDS" to ScamPatterns.JOB_SCAM_KEYWORDS,
        "LOTTERY_SCAM_KEYWORDS" to ScamPatterns.LOTTERY_SCAM_KEYWORDS,
        "CUSTOMER_CARE_SCAM_KEYWORDS" to ScamPatterns.CUSTOMER_CARE_SCAM_KEYWORDS,
        "COURIER_SCAM_KEYWORDS" to ScamPatterns.COURIER_SCAM_KEYWORDS,
        "SEXTORTION_KEYWORDS" to ScamPatterns.SEXTORTION_KEYWORDS,
        "ROMANCE_SCAM_KEYWORDS" to ScamPatterns.ROMANCE_SCAM_KEYWORDS,
        "CHARITY_SCAM_KEYWORDS" to ScamPatterns.CHARITY_SCAM_KEYWORDS,
        "REFUND_SCAM_KEYWORDS" to ScamPatterns.REFUND_SCAM_KEYWORDS,
        "SIM_SWAP_KEYWORDS" to ScamPatterns.SIM_SWAP_KEYWORDS,
        "FAKE_SCREENSHOT_KEYWORDS" to ScamPatterns.FAKE_SCREENSHOT_KEYWORDS,
        "SUSPICIOUS_APPS" to ScamPatterns.SUSPICIOUS_APPS
    )

    @Test
    fun `every category carries at least one signal`() {
        categories.forEach { (name, values) ->
            assertTrue("$name is empty", values.isNotEmpty())
        }
    }

    @Test
    fun `no category contains blank entries`() {
        categories.forEach { (name, values) ->
            values.forEach { value ->
                assertFalse("$name contains a blank entry", value.isBlank())
            }
        }
    }

    @Test
    fun `no category contains duplicates`() {
        categories.forEach { (name, values) ->
            val duplicates = values.groupingBy { it }.eachCount().filter { it.value > 1 }.keys
            assertTrue("$name has duplicates: $duplicates", duplicates.isEmpty())
        }
    }

    @Test
    fun `keyword signals are lowercase so matching stays case insensitive`() {
        val keywordCategories = categories.filterKeys { it.endsWith("_KEYWORDS") }
        keywordCategories.forEach { (name, values) ->
            val uppercase = values.filter { it != it.lowercase() }
            assertTrue("$name has non-lowercase entries: $uppercase", uppercase.isEmpty())
        }
    }

    @Test
    fun `upi id regex matches a standard vpa`() {
        val matches = ScamPatterns.UPI_ID_REGEX.findAll("pay to bsescare@icici now").toList()

        assertTrue("expected one VPA match", matches.isNotEmpty())
        assertTrue(matches.any { it.value == "bsescare@icici" })
    }

    @Test
    fun `url regex matches http and www forms`() {
        assertTrue(ScamPatterns.URL_REGEX.containsMatchIn("visit http://sbi-verify.online/kyc"))
        assertTrue(ScamPatterns.URL_REGEX.containsMatchIn("visit www.paybses.online"))
        assertFalse(ScamPatterns.URL_REGEX.containsMatchIn("no link in this message"))
    }

    @Test
    fun `the register is substantial enough to be credible`() {
        val totalSignals = categories.values.sumOf { it.size }

        assertTrue("expected a broad register, found $totalSignals", totalSignals >= 150)
    }
}
