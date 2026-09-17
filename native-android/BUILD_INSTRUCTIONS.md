# 🏗️ Android APK Build Instructions

## ✅ All Missing Files Created

The Android project is now complete and ready to build. Here's what was added:

### Files Added
1. ✅ `gradlew` - Unix/Mac Gradle wrapper script
2. ✅ `gradlew.bat` - Windows Gradle wrapper script
3. ✅ `gradle/wrapper/gradle-wrapper.properties` - Gradle wrapper configuration
4. ✅ `app/proguard-rules.pro` - ProGuard rules for release builds
5. ✅ `local.properties` - SDK location template
6. ✅ `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` - Adaptive icon
7. ✅ `app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml` - Round adaptive icon
8. ✅ `app/src/main/res/drawable/ic_launcher_background.xml` - Icon background
9. ✅ `app/src/main/res/drawable/ic_launcher_foreground.xml` - Icon foreground (shield with "R")
10. ✅ Fixed `build.gradle.kts` - Removed duplicate compileSdk/targetSdk lines
11. ✅ Fixed `themes.xml` - Updated to "The Notice" design system colors
12. ✅ Fixed `strings.xml` - Added missing `notification_listener_label`

---

## 🚀 How to Build the APK

### Prerequisites

1. **Android Studio** (Hedgehog 2023.1.1 or newer)
   - Download: https://developer.android.com/studio
   
2. **JDK 17** (comes with Android Studio)

3. **Android SDK** (comes with Android Studio)
   - SDK 34 (Android 14)
   - Build Tools 34.0.0

### Step 1: Open Project in Android Studio

```bash
# Open Android Studio
# File → Open → Select the "native-android" folder
```

Android Studio will:
- Sync Gradle files
- Download dependencies
- Index the project

### Step 2: Configure SDK Location

If Android Studio asks for SDK location:
1. Go to **File → Settings → Languages & Frameworks → Android SDK**
2. Set Android SDK Location (e.g., `/Users/username/Library/Android/sdk` on Mac)
3. Or edit `local.properties` and add:
   ```properties
   sdk.dir=/path/to/your/android/sdk
   ```

### Step 3: Build Debug APK

**Option A: Using Android Studio GUI**
1. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. Click "locate" in the notification popup
4. APK location: `native-android/app/build/outputs/apk/debug/app-debug.apk`

**Option B: Using Command Line**
```bash
cd native-android

# Make gradlew executable (Mac/Linux)
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# APK will be at:
# app/build/outputs/apk/debug/app-debug.apk
```

### Step 4: Install on Device

**Option A: Using Android Studio**
1. Connect your Android device via USB
2. Enable USB debugging on device
3. Click the green "Run" button in Android Studio
4. Select your device
5. Click OK

**Option B: Using ADB**
```bash
# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.upirakshak/.MainActivity
```

---

## 🔧 Troubleshooting

### Issue: "SDK location not found"
**Solution:**
```bash
# Edit local.properties and add your SDK path
echo "sdk.dir=/path/to/android/sdk" > local.properties
```

### Issue: "Gradle sync failed"
**Solution:**
1. In Android Studio: **File → Invalidate Caches / Restart**
2. Delete `.gradle` and `.idea` folders
3. Re-open project

### Issue: "Cannot resolve symbol 'R'"
**Solution:**
1. **Build → Clean Project**
2. **Build → Rebuild Project**

### Issue: "Permission denied" for gradlew
**Solution:**
```bash
chmod +x gradlew
```

### Issue: Build fails with "compileSdk is not specified"
**Solution:**
Already fixed in `app/build.gradle.kts` (set to 34)

---

## 📦 What's in the APK

### Features
- ✅ Real-time notification interception (WhatsApp, SMS, Telegram)
- ✅ 200+ fraud pattern detection
- ✅ System-level overlay warnings
- ✅ Hinglish voice output (22 languages)
- ✅ Haptic feedback
- ✅ QR code scanner (CameraX + ML Kit)
- ✅ Cash flow forecasting
- ✅ Loan cost comparison
- ✅ Multi-language UI
- ✅ Funtouch/OriginOS survival (guard service)

### Permissions Required
1. **Notification Access** - To read WhatsApp/SMS notifications
2. **Display Over Other Apps** - To show warning overlays
3. **Camera** - For QR scanning
4. **Record Audio** - For voice input (optional)
5. **Post Notifications** - For Android 13+
6. **Vibrate** - For haptic feedback

### App Info
- **Package Name:** `com.upirakshak`
- **Min SDK:** 26 (Android 8.0)
- **Target SDK:** 34 (Android 14)
- **Version:** 1.0.0
- **Size:** ~15-20 MB

---

## 🎯 Build Variants

### Debug Build (Default)
```bash
./gradlew assembleDebug
```
- No minification
- Debuggable
- Larger APK size
- Faster build time

### Release Build
```bash
./gradlew assembleRelease
```
- Minification enabled (ProGuard)
- Not debuggable
- Smaller APK size
- Slower build time
- Requires signing configuration

---

## 📊 Build Output

After successful build, you'll find:

```
native-android/app/build/outputs/apk/
├── debug/
│   └── app-debug.apk          ← Use this for testing
└── release/
    └── app-release-unsigned.apk  ← Needs signing for distribution
```

---

## 🚀 Quick Start (One-Liner)

If you have Android Studio and SDK configured:

```bash
cd native-android && ./gradlew assembleDebug && adb install app/build/outputs/apk/debug/app-debug.apk
```

This will:
1. Build the debug APK
2. Install it on connected device
3. Ready to test!

---

## 🎪 For Hackathon Demo

### Pre-Demo Checklist
- [ ] Build APK successfully
- [ ] Install on iQOO 15 (or test device)
- [ ] Grant all permissions
- [ ] Test notification interception
- [ ] Test overlay display
- [ ] Test voice output
- [ ] Test QR scanner
- [ ] Record demo video

### Demo Flow
1. Open UPI Rakshak → See "🛡️ Protection Active"
2. Tap "🎯 Simulate Scam Attack" → Overlay appears
3. Open WhatsApp → Receive test scam → Real overlay fires
4. Show Cash Flow tab → Runway gauge
5. Show Loans tab → Cost comparison
6. Show Language selector → Switch to Tamil

---

## 📝 Notes

- The project uses **Gradle 8.2** with **Kotlin 1.9.22**
- Compose compiler version: **1.5.8**
- Target API: **34** (Android 14)
- The app is designed for **iQOO 15** with OriginOS 6
- All 22 Indian languages are supported
- The design follows "The Notice" aesthetic (paper/ink/stamp-red)

---

## 🆘 Need Help?

If the build fails:
1. Check Android Studio's **Build** output window
2. Look for specific error messages
3. Check the Troubleshooting section above
4. Ensure all prerequisites are installed

**Common Issues:**
- Missing SDK → Install via Android Studio SDK Manager
- Gradle sync fails → Invalidate caches and restart
- Compilation errors → Check Kotlin version compatibility
- Resource not found → Clean and rebuild project

---

**The APK is ready to build!** 🎉

Just open the `native-android` folder in Android Studio and click Build.
