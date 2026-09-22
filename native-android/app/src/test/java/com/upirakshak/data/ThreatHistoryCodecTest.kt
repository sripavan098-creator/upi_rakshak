package com.upirakshak.data

import com.upirakshak.engine.ThreatLevel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ThreatHistoryCodecTest {

    private fun record(
        id: String = "id-1",
        timestamp: Long = 1_700_000_000_000L,
        level: ThreatLevel = ThreatLevel.HIGH,
        score: Int = 95,
        title: String = "BSES",
        source: String = "com.whatsapp",
        reasons: List<String> = listOf("Urgency language", "Payment trap"),
        action: String = "Do not pay",
        route: String? = "Use the official BSES app",
        original: String = "URGENT: pay now"
    ) = ThreatRecord(
        id = id,
        timestampMillis = timestamp,
        level = level,
        riskScore = score,
        title = title,
        sourcePackage = source,
        reasons = reasons,
        suggestedAction = action,
        officialRoute = route,
        originalText = original
    )

    @Test
    fun `round trips a single record`() {
        val original = record()

        val restored = ThreatHistoryCodec.decode(ThreatHistoryCodec.encode(listOf(original)))

        assertEquals(1, restored.size)
        assertEquals(original, restored.single())
    }

    @Test
    fun `round trips multiple records in order`() {
        val records = listOf(
            record(id = "a", timestamp = 3),
            record(id = "b", timestamp = 2),
            record(id = "c", timestamp = 1)
        )

        val restored = ThreatHistoryCodec.decode(ThreatHistoryCodec.encode(records))

        assertEquals(records.map { it.id }, restored.map { it.id })
    }

    @Test
    fun `preserves every threat level`() {
        val records = ThreatLevel.entries.mapIndexed { index, level ->
            record(id = "id-$index", level = level)
        }

        val restored = ThreatHistoryCodec.decode(ThreatHistoryCodec.encode(records))

        assertEquals(ThreatLevel.entries.toList(), restored.map { it.level })
    }

    @Test
    fun `null official route survives as null`() {
        val restored = ThreatHistoryCodec.decode(
            ThreatHistoryCodec.encode(listOf(record(route = null)))
        )

        assertNull(restored.single().officialRoute)
    }

    @Test
    fun `blank official route is normalised to null`() {
        val restored = ThreatHistoryCodec.decode(
            ThreatHistoryCodec.encode(listOf(record(route = "")))
        )

        assertNull(restored.single().officialRoute)
    }

    @Test
    fun `empty reason list round trips`() {
        val restored = ThreatHistoryCodec.decode(
            ThreatHistoryCodec.encode(listOf(record(reasons = emptyList())))
        )

        assertTrue(restored.single().reasons.isEmpty())
    }

    @Test
    fun `separator characters inside text do not split the record`() {
        val hostile = record(
            title = "title\u001Fwith\u001Eour\u001Dseparators",
            original = "text\u001F\u001E\u001Dend",
            reasons = listOf("reason\u001Fone", "reason\u001Etwo")
        )

        val restored = ThreatHistoryCodec.decode(ThreatHistoryCodec.encode(listOf(hostile)))

        assertEquals(1, restored.size)
        assertEquals(hostile.title, restored.single().title)
        assertEquals(hostile.originalText, restored.single().originalText)
        assertEquals(hostile.reasons, restored.single().reasons)
    }

    @Test
    fun `backslashes survive escaping`() {
        val hostile = record(original = "C:\\path\\to\\scam\\file")

        val restored = ThreatHistoryCodec.decode(ThreatHistoryCodec.encode(listOf(hostile)))

        assertEquals(hostile.originalText, restored.single().originalText)
    }

    @Test
    fun `decode of null or blank yields empty history`() {
        assertTrue(ThreatHistoryCodec.decode(null).isEmpty())
        assertTrue(ThreatHistoryCodec.decode("").isEmpty())
        assertTrue(ThreatHistoryCodec.decode("   ").isEmpty())
    }

    @Test
    fun `malformed record is dropped without losing good ones`() {
        val good = ThreatHistoryCodec.encode(listOf(record(id = "keep")))
        val corrupted = "$good\u001Enot-a-valid-record"

        val restored = ThreatHistoryCodec.decode(corrupted)

        assertEquals(1, restored.size)
        assertEquals("keep", restored.single().id)
    }

    @Test
    fun `record with a bad timestamp is rejected`() {
        val encoded = ThreatHistoryCodec.encode(listOf(record()))
        val tampered = encoded.replace(Regex("\\u001F\\d+\\u001F"), "\u001Fnot-a-number\u001F")

        assertTrue(ThreatHistoryCodec.decode(tampered).isEmpty())
    }

    @Test
    fun `record with an unknown threat level is rejected`() {
        val encoded = ThreatHistoryCodec.encode(listOf(record()))
        val tampered = encoded.replace("\u001FHIGH\u001F", "\u001FCRITICAL\u001F")

        assertTrue(ThreatHistoryCodec.decode(tampered).isEmpty())
    }

    @Test
    fun `record with a blank id is rejected`() {
        val encoded = ThreatHistoryCodec.encode(listOf(record(id = "x")))
        // Blank out the leading id field; it is first, so no separator precedes it.
        val tampered = "\u001F" + encoded.substring(1)

        assertTrue(ThreatHistoryCodec.decode(tampered).isEmpty())
    }

    @Test
    fun `large history round trips intact`() {
        val records = (1..50).map { record(id = "id-$it", timestamp = it.toLong()) }

        val restored = ThreatHistoryCodec.decode(ThreatHistoryCodec.encode(records))

        assertEquals(50, restored.size)
        assertEquals(records.map { it.id }, restored.map { it.id })
    }

    @Test
    fun `a record round-trips its risk score`() {
        val decoded = ThreatHistoryCodec.decode(ThreatHistoryCodec.encode(listOf(record(score = 130))))

        assertEquals(1, decoded.size)
        assertEquals(130, decoded.first().riskScore)
    }

    @Test
    fun `history written before the risk score existed still decodes`() {
        // Nine-field layout persisted by an earlier build: no score column.
        val sep = "\u001E"
        val field = "\u001F"
        val legacy = listOf(
            "legacy-1", "1700000000000", "HIGH", "BSES", "com.whatsapp",
            "Urgency language", "Do not pay", "Use the official BSES app", "URGENT: pay now"
        ).joinToString(field)
        val raw = legacy + sep + listOf(
            "legacy-2", "1700000001000", "SAFE", "Bank", "com.android.mms",
            "None", "Looks fine", "", "OTP is 123456"
        ).joinToString(field)

        val decoded = ThreatHistoryCodec.decode(raw)

        assertEquals(2, decoded.size)
        assertEquals("legacy-1", decoded[0].id)
        assertEquals(ThreatLevel.HIGH, decoded[0].level)
        assertEquals("BSES", decoded[0].title)
        assertEquals("URGENT: pay now", decoded[0].originalText)
        assertEquals("Use the official BSES app", decoded[0].officialRoute)
        // Missing score degrades to zero rather than dropping the record.
        assertEquals(0, decoded[0].riskScore)
        assertEquals("legacy-2", decoded[1].id)
        assertNull(decoded[1].officialRoute)
    }

    @Test
    fun `a record with too few fields is dropped`() {
        assertTrue(ThreatHistoryCodec.decode("only\u001Ftwo").isEmpty())
    }
}
