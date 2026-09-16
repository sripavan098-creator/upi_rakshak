package com.upirakshak

object RakshakBridge {
    var onNativeEvent: ((String) -> Unit)? = null

    fun publish(json: String) {
        onNativeEvent?.invoke(json)
    }
}
