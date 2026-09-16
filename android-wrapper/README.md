# UPI Rakshak — Android Native Wrapper

This directory contains the Android native wrapper that turns the UPI Rakshak web app into a system-level service.

## What This Does

- **NotificationListenerService** — Intercepts WhatsApp/SMS notifications at the OS level
- **OverlayService** — Shows a red warning banner over scam notifications in real-time
- **WebView Host** — Loads the React app and bridges it with native Android services
- **JavaScript Interface** — Allows the web app to trigger native overlays and access device info

## Prerequisites

- Android Studio (Hedgehog or later)
- Android SDK 34
- Kotlin 1.9+
- A physical Android device (emulator won't show real notifications)

## Build Instructions

### 1. Copy the React Build

Before building the Android app, copy the built React app into the assets folder:

```bash
# From the project root
npm run build
mkdir -p android-wrapper/app/src/main/assets
cp -r dist/* android-wrapper/app/src/main/assets/
```

### 2. Open in Android Studio

```bash
cd android-wrapper
# Open this directory in Android Studio
```

### 3. Build and Run

1. Connect your Android device (enable USB debugging)
2. Click "Run" in Android Studio
3. Grant the two required permissions when prompted:
   - **Notification Access** — allows Rakshak to read incoming messages
   - **Display Over Other Apps** — allows the warning overlay

## Funtunch OS Setup (iQOO/Vivo Devices)

Funtunch OS has aggressive battery optimization that can kill background services. Follow these steps to ensure Rakshak stays active:

### Step 1: Disable Battery Optimization

1. **Settings** → **Battery** → **Background power consumption management**
2. Find **UPI Rakshak**
3. Select **No restrictions**

### Step 2: Enable Autostart

1. **Settings** → **Apps & notifications** → **Special app access** → **Autostart**
2. Find **UPI Rakshak**
3. Toggle **ON**

### Step 3: Allow Display Over Other Apps

1. **Settings** → **Apps & notifications** → **Special app access** → **Display over other apps**
2. Find **UPI Rakshak**
3. Toggle **ON**

### Step 4: Enable Notification Access

1. **Settings** → **Apps & notifications** → **Special app access** → **Notification access**
2. Find **UPI Rakshak**
3. Toggle **ON**
4. Confirm the warning dialog

### Step 5: Lock the App in Recent Apps

1. Open **UPI Rakshak**
2. Swipe up to open **Recent Apps**
3. Long-press the Rakshak card
4. Tap the **lock icon** 🔒

This prevents the system from killing Rakshak when you clear recent apps.

## Demo Flow

Once installed and configured:

1. **Open WhatsApp** on the device
2. **Send a test scam message** to yourself (or have a friend send one):
   ```
   URGENT: Your electricity will be disconnected tonight! Pay now via QR to avoid ₹5000 fine. UPI: bsescare@icici
   ```
3. **Watch the magic**: Within 200ms, a red Rakshak overlay slides down from the top of the screen, warning you that this is a scam.
4. **Tap the overlay** to see the full analysis:
   - Why it's fraud (urgency + suspicious UPI + payment trap)
   - The safe action (use official BSES app)
   - Option to report to 1930

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Android OS                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  NotificationListenerService                     │   │
│  │  (RakshakNotificationListener.kt)                │   │
│  │                                                  │   │
│  │  • Intercepts all notifications                  │   │
│  │  • Filters for WhatsApp/SMS                      │   │
│  │  • Runs rules engine (Kotlin port)               │   │
│  │  • Triggers overlay on HIGH threat               │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  OverlayService                                  │   │
│  │  (OverlayService.kt)                             │   │
│  │                                                  │   │
│  │  • Shows system-level warning banner             │   │
│  │  • TYPE_APPLICATION_OVERLAY                      │   │
│  │  • Auto-dismiss after 8 seconds                  │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  MainActivity (WebView)                          │   │
│  │                                                  │   │
│  │  • Loads React app from assets/                  │   │
│  │  • Exposes RakshakAndroid JS interface           │   │
│  │  • Bridges web UI with native services           │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Web App (src/)                            │   │
│  │                                                  │   │
│  │  • Full UPI Rakshak UI                           │   │
│  │  • Cash flow dashboard                           │   │
│  │  • Loan comparison                               │   │
│  │  • Voice interface                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Permissions Explained

| Permission | Why It's Needed |
|---|---|
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Read incoming WhatsApp/SMS notifications |
| `SYSTEM_ALERT_WINDOW` | Show warning overlay over other apps |
| `POST_NOTIFICATIONS` | Show foreground service notification |
| `RECEIVE_BOOT_COMPLETED` | Restart services after device reboot |
| `FOREGROUND_SERVICE` | Keep overlay service running in background |

## Troubleshooting

### Overlay doesn't appear

- Check that **Display over other apps** is enabled for UPI Rakshak
- Make sure the app is not restricted in battery optimization
- Verify notification access is granted

### Services stop after reboot

- Lock the app in recent apps (see Step 5 above)
- Check autostart is enabled
- Some devices require you to open the app once after reboot

### False positives

- The rules engine uses keyword matching, which can trigger on legitimate urgent messages
- Future versions will use on-device ML for better accuracy

## Future Enhancements

- **On-device ML model** — Replace keyword matching with a lightweight fraud detection model
- **Encrypted SMS parsing** — Read bank SMS for cash flow analysis (requires additional permissions)
- **Multi-language support** — Expand beyond Hindi/English to Tamil, Telugu, Bengali, etc.
- **Community reporting** — Allow users to report new scam patterns
- **iQOO system integration** — Deep integration with Funtunch OS for native protection

## License

This is a hackathon project. Use at your own risk.

## Team

Built for the Agentic AI Hackathon — FinTech & Commerce domain.
