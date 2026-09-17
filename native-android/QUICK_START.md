# 🚀 Quick Start: Build UPI Rakshak APK

## One-Command Build (If you have Android SDK)

```bash
cd native-android
chmod +x gradlew
./gradlew assembleDebug
```

**APK Location:** `app/build/outputs/apk/debug/app-debug.apk`

---

## Using Android Studio (Recommended)

1. **Open Android Studio**
2. **File → Open** → Select `native-android` folder
3. **Wait for Gradle sync** (2-3 minutes first time)
4. **Build → Build APK** (or click the hammer icon)
5. **APK ready!** Click "locate" in the notification

---

## Install on Device

```bash
# Connect device via USB, then:
adb install app/build/outputs/apk/debug/app-debug.apk

# Launch app:
adb shell am start -n com.upirakshak/.MainActivity
```

---

## What Was Fixed

✅ Added Gradle wrapper (`gradlew`, `gradlew.bat`)  
✅ Added launcher icons (shield with "R")  
✅ Fixed duplicate SDK versions in build.gradle  
✅ Added missing string resources  
✅ Updated theme to "The Notice" design  
✅ Created ProGuard rules  
✅ Created build documentation  

---

## Troubleshooting

**"SDK location not found"**
```bash
echo "sdk.dir=/path/to/android/sdk" > local.properties
```

**"Permission denied" for gradlew**
```bash
chmod +x gradlew
```

**Build fails**
- Open in Android Studio
- File → Invalidate Caches / Restart
- Build → Clean Project
- Build → Rebuild Project

---

## Need Android Studio?

Download: https://developer.android.com/studio

**Installation includes:**
- Android SDK
- Build tools
- Emulator
- Everything you need

---

## App Info

- **Package:** `com.upirakshak`
- **Min Android:** 8.0 (API 26)
- **Target Android:** 14 (API 34)
- **Size:** ~15-20 MB
- **Features:** 200+ fraud patterns, 22 languages, QR scanner, voice output

---

**Ready to build!** 🎉
