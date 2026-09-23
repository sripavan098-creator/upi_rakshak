package com.upirakshak.data

import android.content.Context
import android.util.Log
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Reads transaction messages from the device's SMS inbox.
 *
 * Replaces the packaged sample transactions for users who opt in. Access is never assumed:
 * [readRecentEntries] returns an empty list unless [SmsReadPreference] says the user granted
 * consent, and the caller is expected to have obtained [android.Manifest.permission.READ_SMS]
 * first. Nothing is uploaded; parsing happens on device and the messages are not retained
 * beyond the returned entries.
 *
 * READ_SMS is a Play-policy restricted permission, so this path is opt-in rather than the
 * default, and the app remains fully functional without it.
 */
object LiveSmsRepository {

    private const val TAG = "LiveSmsRepository"

    /** Enough history for a monthly cash-flow view without scanning the whole inbox. */
    const val DEFAULT_WINDOW_DAYS = 60L

    /** Hard cap so a large inbox cannot stall the UI thread. */
    private const val MAX_MESSAGES = 500

    /**
     * Transaction messages from the last [windowDays] days, newest first.
     *
     * Returns an empty list when consent has not been given, when the permission has not
     * been granted, or when the device has no SMS provider. Never throws.
     */
    fun readRecentEntries(context: Context, windowDays: Long = DEFAULT_WINDOW_DAYS): List<SmsEntry> {
        if (!SmsReadPreference.isEnabled(context)) return emptyList()
        if (!SmsReadPreference.hasPermission(context)) return emptyList()

        val since = System.currentTimeMillis() - windowDays * MILLIS_PER_DAY
        val entries = runCatching { queryInbox(context, since) }
            .onFailure { Log.e(TAG, "Could not read SMS inbox", it) }
            .getOrNull()
            ?: return emptyList()

        return entries.sortedByDescending { it.date }
    }

    private fun queryInbox(context: Context, since: Long): List<SmsEntry> {
        val projection = arrayOf(COLUMN_ADDRESS, COLUMN_BODY, COLUMN_DATE)
        val selection = "$COLUMN_DATE >= ?"
        val args = arrayOf(since.toString())

        val entries = mutableListOf<Row>()
        val inbox = android.net.Uri.parse("content://sms/inbox")
        val cursor = context.contentResolver.query(
            inbox, projection, selection, args, "$COLUMN_DATE DESC"
        ) ?: return emptyList()

        cursor.use { c ->
            val addressIndex = c.getColumnIndexOrThrow(COLUMN_ADDRESS)
            val bodyIndex = c.getColumnIndexOrThrow(COLUMN_BODY)
            val dateIndex = c.getColumnIndexOrThrow(COLUMN_DATE)

            while (c.moveToNext() && entries.size < MAX_MESSAGES) {
                entries.add(
                    Row(
                        sender = c.getString(addressIndex).orEmpty(),
                        body = c.getString(bodyIndex).orEmpty(),
                        epochMillis = c.getLong(dateIndex)
                    )
                )
            }
        }
        return toEntries(entries)
    }

    /** A raw inbox row, before the parser decides whether it describes a transaction. */
    data class Row(val sender: String, val body: String, val epochMillis: Long)

    /**
     * Keeps only rows that describe a transaction.
     *
     * OTPs, promotional traffic and scam bait have no parseable transaction amount, so the
     * parser returns an INFO entry or nothing at all; both are dropped here rather than
     * being guessed at, which keeps the forecast free of non-transaction noise.
     */
    fun toEntries(rows: List<Row>): List<SmsEntry> = rows.mapNotNull { row ->
        SmsMessageParser.parse(row.body, row.sender, toLocalDate(row.epochMillis))
            ?.takeIf { it.type != SmsType.INFO }
    }

    fun toLocalDate(epochMillis: Long): LocalDate =
        Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalDate()

    private const val MILLIS_PER_DAY = 24L * 60 * 60 * 1000
    private const val COLUMN_ADDRESS = "address"
    private const val COLUMN_BODY = "body"
    private const val COLUMN_DATE = "date"
}
