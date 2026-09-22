package com.upirakshak.data

/**
 * Encodes a list of records, each a list of string fields, into a single delimited string.
 *
 * Shared by every offline store that persists to SharedPreferences rather than a database.
 * The tricky part is escaping: user-visible text regularly contains commas, quotes and
 * newlines, and a threat message or transaction memo containing our own separators must not
 * be able to split a record into the wrong number of fields.
 *
 * Uses ASCII record/group/unit separators, which cannot appear in text a user would type.
 */
object DelimitedCodec {

    const val FIELD_SEPARATOR = "\u001F"
    private const val RECORD_SEPARATOR = "\u001E"
    private const val LIST_SEPARATOR = "\u001D"

    /**
     * @param records each record's fields, in order. Every record must have the same field
     *   count; callers are responsible for that invariant.
     */
    fun encodeRecords(records: List<List<String>>): String =
        records.joinToString(RECORD_SEPARATOR) { record ->
            record.joinToString(FIELD_SEPARATOR) { escape(it) }
        }

    /**
     * Joins a per-record list value (such as a list of reasons) into one field.
     *
     * The elements are deliberately *not* escaped here. The whole field is escaped once by
     * [encodeRecords], which turns the list separator into a placeholder, so escaping again
     * would double-encode and the separator would survive [decodeList] as literal text.
     */
    fun encodeList(values: List<String>): String = values.joinToString(LIST_SEPARATOR)

    /**
     * Inverse of [encodeList]. Expects an already-unescaped field; see the note on
     * [encodeList] for why the elements are not unescaped again here.
     */
    fun decodeList(unescapedField: String): List<String> =
        if (unescapedField.isEmpty()) emptyList()
        else unescapedField.split(LIST_SEPARATOR)

    /** Splits into records. Records are returned field-split but not unescaped. */
    fun splitRecords(raw: String?): List<List<String>> {
        if (raw.isNullOrBlank()) return emptyList()
        return raw.split(RECORD_SEPARATOR).map { it.split(FIELD_SEPARATOR) }
    }

    fun unescape(value: String): String {
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

    fun escape(value: String): String = value
        .replace("\\", "\\\\")
        .replace(RECORD_SEPARATOR, "\\r")
        .replace(FIELD_SEPARATOR, "\\f")
        .replace(LIST_SEPARATOR, "\\l")
}
