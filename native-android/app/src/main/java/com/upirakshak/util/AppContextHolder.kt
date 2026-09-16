package com.upirakshak.util

import android.content.Context

object AppContextHolder {
    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun get(): Context {
        return appContext ?: throw IllegalStateException(
            "AppContextHolder not initialized. Call init() in Application.onCreate()"
        )
    }
}
