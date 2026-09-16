# Building and Installing the UPI Rakshak Android APK

## Prerequisites

- Node.js 18+ and npm
- Android Studio (for SDK and build tools)
- Java 17 (OpenJDK)
- An Android device with USB debugging enabled (iQOO recommended)

## Step 1: Build the Web App

```bash
npm run build
```

This creates the `dist/` directory with the compiled React app.

## Step 2: Sync to Android

```bash
npx cap sync android
```

This copies the web assets to `android/app/src/main/assets/public/` and syncs Capacitor plugins.

## Step 3: Open in Android Studio

```bash
npx cap open android
```

Android Studio will open the Android project. Wait for Gradle sync to complete.

## Step 4: Build Debug APK

### Option A: Via Android Studio
1. In Android Studio, go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for the build to complete
3. Click "locate" in the notification to find the APK

### Option B: Via Command Line
```bash
cd android
./gradlew assembleDebug
```

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Step 5: Install on Device

### Option A: Via ADB (Recommended)
```bash
# Connect your device via USB
adb devices  # Verify device is connected

# Install the APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Manual Transfer
1. Copy `app-debug.apk` to your phone
2. Open Files app on phone
3. Tap the APK file
4. Allow installation from unknown sources if prompted
5. Tap Install

## Step 6: Grant Permissions

Follow the steps in [docs/iqoo-demo-setup.md](./docs/iqoo-demo-setup.md) to grant:
- Notification access
- Overlay permission
- Battery optimization exemption

## Step 7: Test the Demo

1. Open UPI Rakshak app
2. You should see "🛡️ Rakshak is protecting you in real-time"
3. Open WhatsApp
4. Send a test scam message to yourself
5. The red overlay should appear within 2 seconds

## Troubleshooting

### "App not installed" error
- Uninstall any previous version first: `adb uninstall com.upirakshak.app`
- Try installing again

### "Overlay permission not granted"
- Go to Settings → Apps → UPI Rakshak → Display over other apps → Allow

### "Notification listener not working"
- Go to Settings → Apps → Special access → Notification access → UPI Rakshak → Enable
- Reboot the phone after enabling

### App crashes on startup
- Check logcat: `adb logcat | grep -E "Rakshak|Capacitor"`
- Common issue: Missing permissions
- Re-grant all permissions in Settings

### Overlay doesn't appear
- Check that notification access is enabled
- Check that overlay permission is enabled
- Check that battery optimization is disabled for the app
- Try rebooting the phone

## Quick Build Script

Save this as `build-apk.sh`:

```bash
#!/bin/bash
set -e

echo "🔨 Building web app..."
npm run build

echo "🔄 Syncing to Android..."
npx cap sync android

echo "📦 Building APK..."
cd android
./gradlew assembleDebug

echo "✅ APK built at: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on connected device:"
echo "  adb install -r android/app/build/outputs/apk/debug/app-debug.apk"
```

Make it executable:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

## File Structure

```
upi_rakshak/
├── dist/                          # Built web app
├── android/                       # Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/upirakshak/app/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── RakshakPlugin.kt
│   │   │   │   ├── RakshakNotificationListener.kt
│   │   │   │   └── RakshakOverlayService.kt
│   │   │   └── assets/public/     # Web assets (auto-synced)
│   │   └── build.gradle
│   └── build.gradle
├── src/                           # React source
│   ├── lib/
│   │   ├── rakshakNative.ts       # Capacitor plugin bridge
│   │   └── rulesEngine.ts
│   ├── hooks/
│   │   └── useRakshakListener.ts
│   └── components/
└── docs/
    ├── iqoo-demo-setup.md
    └── demo-fallback.md
```

## Next Steps

After successful installation:
1. Follow [docs/iqoo-demo-setup.md](./docs/iqoo-demo-setup.md) for iQOO-specific setup
2. Record a backup demo following [docs/demo-fallback.md](./docs/demo-fallback.md)
3. Test the full flow at least 10 times before the presentation
