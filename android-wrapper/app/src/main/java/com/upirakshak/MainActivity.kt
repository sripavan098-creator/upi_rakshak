package com.upirakshak

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Register the Rakshak plugin
        registerPlugin(RakshakPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
