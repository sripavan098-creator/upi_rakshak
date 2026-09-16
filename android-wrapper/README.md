# UPI Rakshak — Android Native Wrapper

## Why This Exists

UPI Rakshak's web app is a demo. The real product is a system-level safety layer on Android. This wrapper hosts the React app in a WebView and connects it to native Android services that intercept notifications and show warnings in real-time.

## Architecture

```
[WebView with React App] ↔ [JavaScript Interface] ↔ [NotificationListenerService] ↔ [OverlayService]
```

- **NotificationListenerService** intercepts WhatsApp/SMS at the OS level
- **Kotlin Rules Engine** analyzes messages on-device (no network calls)
- **OverlayService** shows a red warning banner using `TYPE_APPLICATION_OVERLAY`
- **JavaScript Bridge** forwards events to the React app

## Required Permissions

1. **Notification Access** — to read WhatsApp/SMS messages
2. **Display Over Other Apps** — to show the warning overlay
3. **Foreground Service** — to keep the overlay service alive

## Funtouch OS Setup (iQOO Devices) — CRITICAL

Funtouch OS will kill background services aggressively. Do ALL of these:

### Step 1: Battery Optimization
```
Settings → Apps → UPI Rakshak → Battery → Unrestricted
```

### Step 2: Autostart
```
Settings → Apps → UPI Rakshak → Autostart → Enable
```

### Step 3: Display Over Other Apps
```
Settings → Apps → Special access → Display over other apps → Enable UPI Rakshak
```

### Step 4: Notification Access
```
Settings → Apps → Special access → Notification access → Enable UPI Rakshak
```

### Step 5: Lock App in Recents
Open the app → Swipe up to open Recents → Long-press the app card → Tap the lock icon 🔒

This prevents the system from killing Rakshak when you clear recent apps.

### Step 6: Developer Options (Optional but Recommended)
```
Settings → Developer options → Don't keep activities → Disable
```

## Building

```bash
# From the project root
npm run build

# Copy the built React app to Android assets
mkdir -p android-wrapper/app/src/main/assets/web
cp -r dist/* android-wrapper/app/src/main/assets/web/

# Open android-wrapper/ in Android Studio
# Connect your iQOO device (enable USB debugging)
# Click "Run"
```

## Testing the Demo

1. Open WhatsApp on the iQOO device
2. Send yourself the test scam message:
   ```
   URGENT: Your UPI account will be blocked. Pay ₹499 to helpdesk@upi to verify KYC immediately.
   ```
3. Watch the red overlay appear in <200ms
4. Tap the overlay to see the full explanation
5. Tap "Review" to open the app and see the agent trace

## Expected Behavior

1. Notification appears in WhatsApp
2. `NotificationListenerService` intercepts it
3. `RakshakRulesEngine.analyze()` scores the message:
   - Urgency keywords: +12 each (max 4)
   - UPI ID present: +35
   - Amount requested: +20
   - Link present: +20
   - Payment trap: +25
   - OTP/PIN request: +20
   - **Score ≥ 70 = CRITICAL** → show overlay
4. Red overlay appears via `OverlayService`
5. React WebView receives the event via `rakshak:native` custom event
6. Clicking "Review" opens the app and shows the full agent trace

## Troubleshooting

### Overlay not appearing
- Check **Display over other apps** permission is enabled
- Make sure the app is not restricted in battery optimization
- Verify notification access is granted
- Check Logcat for `RakshakOverlayService` logs

### Service killed after 5 minutes
- Check battery optimization is set to "Unrestricted"
- Verify autostart is enabled
- Lock the app in recents (Step 5 above)
- Some devices require you to open the app once after reboot

### Notification listener not working
- Check **Notification access** permission is enabled
- Restart the device after enabling notification access
- Check Logcat for `RakshakNotificationListenerService` logs

### WebView not loading
- Make sure you copied `dist/*` to `app/src/main/assets/web/`
- Check that `MainActivity.kt` loads `file:///android_asset/web/index.html`
- Enable USB debugging and check Chrome DevTools for console errors

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
│       │   ├── RakshakRulesEngine.kt        # Fraud detection (Kotlin)
│       │   ├── RakshakNotificationListenerService.kt
│       │   └── RakshakOverlayService.kt     # Red warning banner
│       └── res/layout/
│           ├── activity_main.xml
│           └── overlay_rakshak.xml
├── build.gradle
└── README.md
```

## Web-Only Fallback

If native becomes unstable, the React app has a "Simulate Scam Attack" button that triggers the same demo flow in the browser. Use this as a backup during the hackathon demo.

The web demo proves the reasoning engine, explanation layer, and financial literacy tools. The Android implementation is the delivery mechanism.

## Critical Demo Safety Rules

For the live demo:

1. **Test the scam message at least 10 times** before the presentation
2. **Keep the app open** before triggering the message
3. **Make sure the phone is not in Do Not Disturb**
4. **Make sure WhatsApp/SMS notifications show message content** (not just "New message")
5. **Use a controlled test number** (send to yourself or a teammate)
6. **Keep a screen recording as backup** in case the live demo fails
7. **Keep the web-only simulated demo ready** in case the device misbehaves

## Privacy Promise

All message analysis happens **on-device**. No data is sent to any server. The rules engine runs entirely in Kotlin on the user's phone.

## License

This is a hackathon project. Use at your own risk.
