package com.upirakshak.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

/**
 * Persists flagged threats so the user can review what was caught.
 *
 * Backed by SharedPreferences rather than a database: history is capped at
 * [MAX_RECORDS] entries and only ever appended to, so a database would add a
 * dependency and schema without earning its keep.
 */
object ThreatHistoryStore {

    private const val TAG = "ThreatHistoryStore"
    private const val PREFS = "threat_history"
    private const val KEY_RECORDS = "records"
    private const val MAX_RECORDS = 50

    private val _history = MutableStateFlow<List<ThreatRecord>>(emptyList())
    val history: StateFlow<List<ThreatRecord>> = _history.asStateFlow()

    fun load(context: Context) {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_RECORDS, null)
        _history.value = ThreatHistoryCodec.decode(raw)
            .sortedByDescending { it.timestampMillis }
    }

    fun record(context: Context, record: ThreatRecord) {
        val updated = (listOf(record) + _history.value)
            .distinctBy { it.id }
            .sortedByDescending { it.timestampMillis }
            .take(MAX_RECORDS)

        _history.value = updated
        persist(context, updated)
    }

    fun clear(context: Context) {
        _history.value = emptyList()
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .remove(KEY_RECORDS)
            .apply()
    }

    fun newId(): String = UUID.randomUUID().toString()

    private fun persist(context: Context, records: List<ThreatRecord>) {
        runCatching {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString(KEY_RECORDS, ThreatHistoryCodec.encode(records))
                .apply()
        }.onFailure { Log.e(TAG, "Failed to persist threat history", it) }
    }
}
