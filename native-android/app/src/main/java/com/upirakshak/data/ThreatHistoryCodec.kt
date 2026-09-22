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

    private const val RECORD_SEPARATOR = "\u001E"
    private const val FIELD_SEPARATOR = "\u001F"
    private const val LIST_SEPARATOR = "\u001D"

    /** Field count before the risk score was added; old records are still decoded. */
    private const val LEGACY_FIELD_COUNT = 9
    private const val FIELD_COUNT = 10

    fun encode(records: List<ThreatRecord>): String =
        records.joinToString(RECORD_SEPARATOR) { encodeRecord(it) }

    fun decode(raw: String?): List<ThreatRecord> {
        if (raw.isNullOrBlank()) return emptyList()

        return raw.split(RECORD_SEPARATOR)
            .mapNotNull { decodeRecord(it) }
    }

    private fun encodeRecord(record: ThreatRecord): String {
        val fields = listOf(
            record.id,
            record.timestampMillis.toString(),
            record.level.name,
            record.riskScore.toString(),
            record.title,
            record.sourcePackage,
            record.reasons.joinToString(LIST_SEPARATOR),
            record.suggestedAction,
            record.officialRoute.orEmpty(),
            record.originalText
        )
        return fields.joinToString(FIELD_SEPARATOR) { escape(it) }
    }

    private fun decodeRecord(chunk: String): ThreatRecord? {
        val fields = chunk.split(FIELD_SEPARATOR)
        if (fields.size != FIELD_COUNT && fields.size != LEGACY_FIELD_COUNT) return null

        val timestamp = fields[1].toLongOrNull() ?: return null
        val level = runCatching { ThreatLevel.valueOf(fields[2]) }.getOrNull() ?: return null
        if (fields[0].isBlank()) return null

        // Records written before the risk score existed have nine fields and no score.
        val scored = fields.size == FIELD_COUNT
        val offset = if (scored) 1 else 0

        return ThreatRecord(
            id = unescape(fields[0]),
            timestampMillis = timestamp,
            level = level,
            riskScore = if (scored) fields[3].toIntOrNull() ?: 0 else 0,
            title = unescape(fields[3 + offset]),
            sourcePackage = unescape(fields[4 + offset]),
            reasons = unescape(fields[5 + offset])
                .split(LIST_SEPARATOR)
                .filter { it.isNotBlank() },
            suggestedAction = unescape(fields[6 + offset]),
            officialRoute = unescape(fields[7 + offset]).ifBlank { null },
            originalText = unescape(fields[8 + offset])
        )
    }

    // Escaping keeps user-visible text containing our separators from splitting
    // a record into the wrong number of fields.
    private fun escape(value: String): String = value
        .replace("\\", "\\\\")
        .replace(RECORD_SEPARATOR, "\\r")
        .replace(FIELD_SEPARATOR, "\\f")
        .replace(LIST_SEPARATOR, "\\l")

    private fun unescape(value: String): String {
        val out = StringBuilder(value.length)
        var index = 0
        while (index < value.length) {
            val char = value[index]
            if (char != '\\' || index == value.length - 1) {
                out.append(char)
                index++
                continue
            }
            when (value[index + 1]) {
                'r' -> out.append(RECORD_SEPARATOR)
                'f' -> out.append(FIELD_SEPARATOR)
                'l' -> out.append(LIST_SEPARATOR)
                '\\' -> out.append('\\')
                else -> out.append(value[index + 1])
            }
            index += 2
        }
        return out.toString()
    }
}
