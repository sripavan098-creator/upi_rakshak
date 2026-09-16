# UPI Rakshak — Android Native Wrapper

This directory contains the Android native wrapper that turns the UPI Rakshak web app into a system-level service.

## What This Does

- **NotificationListenerService** — Intercepts WhatsApp/SMS notifications at the OS level
- **Kotlin Rules Engine** — On-device fraud detection (urgency keywords, UPI patterns, payment traps)
- **OverlayService** — Shows a red warning banner over scam notifications in real-time
- **WebView Host** — Loads the React app and bridges it with native Android services
- **JavaScript Bridge** — Allows the web app to trigger native overlays and access device info

## Architecture

```
Incoming Notification
        |
        v
NotificationListenerService
        |
        v
Kotlin Rules Engine
        |
        +--> If high threat: show native red overlay
        |
        +--> Send JSON event to React WebView
                    |
                    v
            React App (AgentTrace / Console)
```

## Prerequisites

- Android Studio (Hedgehog or later)
- Android SDK 34
- Kotlin 1.9+
- A physical Android device (emulator won't show real notifications)

## Build Instructions

### 1. Build the React App

```bash
# From the project root
npm run build
```

### 2. Copy to Android Assets

```bash
mkdir -p android-wrapper/app/src/main/assets/web
cp -r dist/* android-wrapper/app/src/main/assets/web/
```

### 3. Open in Android Studio

```bash
cd android-wrapper
# Open this directory in Android Studio
```

### 4. Build and Run

1. Connect your Android device (enable USB debugging)
2. Click "Run" in Android Studio
3. Grant the required permissions when prompted:
   - **Notification Access** — allows Rakshak to read incoming messages
   - **Display Over Other Apps** — allows the warning overlay

## Funtunch OS Setup (iQOO/Vivo Devices)

Funtunch OS has aggressive battery optimization. Follow these steps:

### Step 1: Notification Access

```
Settings > Apps > Special app access > Notification access
```
Enable UPI Rakshak.

### Step 2: Overlay Permission

```
Settings > More settings > Permission manager > Display over other apps
```
Or:
```
Settings > Apps > UPI Rakshak > Display over other apps
```
Allow it.

### Step 3: Autostart

```
Settings > Apps > Autostart
```
Enable UPI Rakshak.

Also check:
```
iManager > App management > Autostart
```

### Step 4: Battery Optimization

```
Settings > Battery > Background power consumption management
```
Allow UPI Rakshak to run in background.

Also:
```
Settings > Battery > More settings > High performance mode
```
Enable if available.

### Step 5: Lock App in Memory

Open UPI Rakshak, go to recent apps, and lock it if Funtunch OS supports the lock icon.

## Demo Flow

Once installed and configured:

1. **Open WhatsApp** on the device
2. **Send a test scam message** to yourself:
   ```
   URGENT: Your UPI account will be blocked. Pay ₹499 to helpdesk@upi to verify KYC immediately.
   ```
3. **Watch the magic**: Within 200ms, a red Rakshak overlay slides down from the top of the screen.
4. **Tap "Review"** to open the app and see the full agent trace.

## Expected Behavior

1. Notification appears in WhatsApp
2. `NotificationListenerService` intercepts it
3. Rules engine detects: urgency + UPI ID + amount + KYC trap
4. Red overlay appears (score: 94, critical: true)
5. React WebView receives the event via `rakshak:native` custom event
6. Clicking "Review" opens the app and shows the agent trace

## Critical Demo Safety Rules

For the live demo:

1. Test the scam message at least 10 times
2. Keep the app open before triggering the message
3. Make sure the phone is not in Do Not Disturb
4. Make sure WhatsApp/SMS notifications show message content
5. Use a controlled test number
6. Keep a screen recording as backup
7. Keep the web-only simulated demo ready in case the device misbehaves

## File Structure

```
android-wrapper/
├── app/
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/upirakshak/
│       │   ├── MainActivity.kt              # WebView host
│       │   ├── RakshakBridge.kt             # Singleton event bridge
│       │   ├── RakshakJsBridge.kt           # JS interface
│       │   ├── RakshakRulesEngine.kt        # Fraud detection
│       │   ├── RakshakNotificationListenerService.kt
│       │   └── RakshakOverlayService.kt     # Red warning banner
│       └── res/layout/
│           ├── activity_main.xml
│           └── overlay_rakshak.xml
├── build.gradle
└── README.md
```

## Permissions

| Permission | Why It's Needed |
|---|---|
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Read incoming WhatsApp/SMS notifications |
| `SYSTEM_ALERT_WINDOW` | Show warning overlay over other apps |
| `POST_NOTIFICATIONS` | Show foreground service notification |
| `FOREGROUND_SERVICE` | Keep overlay service running in background |
| `WAKE_LOCK` | Prevent device from sleeping during overlay |

## Troubleshooting

### Overlay doesn't appear

- Check that **Display over other apps** is enabled
- Make sure the app is not restricted in battery optimization
- Verify notification access is granted

### Services stop after reboot

- Lock the app in recent apps (see Step 5)
- Check autostart is enabled
- Some devices require you to open the app once after reboot

### False positives

- The rules engine uses keyword matching + scoring
- Score threshold is 70 for critical alerts
- Adjust `RakshakRulesEngine.kt` thresholds if needed

## Web-Only Fallback

If native becomes unstable, the React app has a "Simulate Scam Attack" button that triggers the same demo flow in the browser. Use this as a backup during the hackathon demo.

## License

This is a hackathon project. Use at your own risk.
