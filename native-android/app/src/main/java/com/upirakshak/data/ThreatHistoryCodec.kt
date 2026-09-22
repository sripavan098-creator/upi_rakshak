package com.upirakshak.data

import com.upirakshak.engine.ThreatLevel

/**
 * Encodes threat history into a single delimited string so it survives process
 * death without a database.
 *
 * The storage medium is deliberately swappable: this codec only needs somewhere
 * to put a string. Keeping encoding separate from storage means the tricky part,
 * correct escaping, is fully unit tested without an Android runtime.
 */
object ThreatHistoryCodec {

    /** Field count before the risk score was added; old records are still decoded. */
    private const val LEGACY_FIELD_COUNT = 9
    private const val FIELD_COUNT = 10

    fun encode(records: List<ThreatRecord>): String =
        DelimitedCodec.encodeRecords(records.map { encodeRecord(it) })

    fun decode(raw: String?): List<ThreatRecord> =
        DelimitedCodec.splitRecords(raw).mapNotNull { decodeRecord(it) }

    private fun encodeRecord(record: ThreatRecord): List<String> = listOf(
        record.id,
        record.timestampMillis.toString(),
        record.level.name,
        record.riskScore.toString(),
        record.title,
        record.sourcePackage,
        DelimitedCodec.encodeList(record.reasons),
        record.suggestedAction,
        record.officialRoute.orEmpty(),
        record.originalText
    )

    private fun decodeRecord(fields: List<String>): ThreatRecord? {
        if (fields.size != FIELD_COUNT && fields.size != LEGACY_FIELD_COUNT) return null

        val timestamp = fields[1].toLongOrNull() ?: return null
        val level = runCatching { ThreatLevel.valueOf(fields[2]) }.getOrNull() ?: return null
        if (fields[0].isBlank()) return null

        // Records written before the risk score existed have nine fields and no score.
        val scored = fields.size == FIELD_COUNT
        val offset = if (scored) 1 else 0

        return ThreatRecord(
            id = DelimitedCodec.unescape(fields[0]),
            timestampMillis = timestamp,
            level = level,
            riskScore = if (scored) fields[3].toIntOrNull() ?: 0 else 0,
            title = DelimitedCodec.unescape(fields[3 + offset]),
            sourcePackage = DelimitedCodec.unescape(fields[4 + offset]),
            reasons = DelimitedCodec.decodeList(DelimitedCodec.unescape(fields[5 + offset])),
            suggestedAction = DelimitedCodec.unescape(fields[6 + offset]),
            officialRoute = DelimitedCodec.unescape(fields[7 + offset]).ifBlank { null },
            originalText = DelimitedCodec.unescape(fields[8 + offset])
        )
    }
}
