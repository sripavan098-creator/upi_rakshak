# 🔧 Troubleshooting Guide - Android Build Issues

## Common Build Errors and Solutions

---

## 1. "SDK location not found"

### Error Message
```
SDK location not found. Define location with sdk.dir in the local.properties 
file or with an ANDROID_HOME environment variable.
```

### Solution

**Option A: Create local.properties**
```bash
# Mac
echo "sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk" > local.properties

# Linux
echo "sdk.dir=/home/YOUR_USERNAME/Android/Sdk" > local.properties

# Windows
echo sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk > local.properties
```

**Option B: Set Environment Variable**

Mac/Linux:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

Windows:
1. Open System Properties (Win+Pause)
2. Click "Environment Variables"
3. Add new system variable:
   - Name: `ANDROID_HOME`
   - Value: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`

---

## 2. "Could not determine Java version"

### Error Message
```
Could not determine java version.
```

### Solution

Check Java version:
```bash
java -version
```

**Required:** JDK 17

**Install JDK 17:**
- Download from: https://adoptium.net/
- Or install via Android Studio (comes bundled)

**Set JAVA_HOME:**

Mac/Linux:
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

Windows:
1. System Properties → Environment Variables
2. Add `JAVA_HOME` = `C:\Program Files\Java\jdk-17`

---

## 3. "Failed to find Build Tools"

### Error Message
```
Failed to find Build Tools revision 34.0.0
```

### Solution

Install Build Tools via Android Studio:
1. Open Android Studio
2. Tools → SDK Manager
3. SDK Tools tab
4. Check "Android SDK Build-Tools 34"
5. Click Apply

Or via command line:
```bash
sdkmanager "build-tools;34.0.0"
sdkmanager "platforms;android-34"
```

---

## 4. "Execution failed for task ':app:compileDebugKotlin'"

### Error Message
```
Execution failed for task ':app:compileDebugKotlin'.
> Compilation error. See log for more details
```

### Solution

Get detailed error:
```bash
./gradlew assembleDebug --stacktrace --info 2>&1 | tee build-error.log
```

Check `build-error.log` for specific Kotlin compilation errors.

**Common causes:**
- Missing imports
- Syntax errors in Kotlin files
- Incompatible Kotlin/Compose versions

**Fix:**
```bash
./gradlew clean
./gradlew assembleDebug
```

---

## 5. "Gradle build daemon disappeared"

### Error Message
```
Gradle build daemon disappeared unexpectedly
```

### Solution

**Increase Gradle memory:**

Edit `gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError
```

**Stop existing daemons:**
```bash
./gradlew --stop
```

**Try again:**
```bash
./gradlew assembleDebug --no-daemon
```

---

## 6. "Could not resolve all files for configuration"

### Error Message
```
Could not resolve all files for configuration ':app:debugCompileClasspath'.
```

### Solution

**Check internet connection** - Gradle needs to download dependencies.

**Clear Gradle cache:**
```bash
# Mac/Linux
rm -rf ~/.gradle/caches

# Windows
rmdir /s /q %USERPROFILE%\.gradle\caches
```

**Use Maven Central mirror (if in China):**

Edit `build.gradle.kts`:
```kotlin
repositories {
    maven { url = uri("https://maven.aliyun.com/repository/google") }
    maven { url = uri("https://maven.aliyun.com/repository/central") }
    google()
    mavenCentral()
}
```

---

## 7. "Minimum supported Gradle version"

### Error Message
```
Minimum supported Gradle version is 8.2. Current version is 7.x
```

### Solution

The Gradle wrapper should handle this automatically. If not:

```bash
# Update wrapper
./gradlew wrapper --gradle-version 8.2

# Then build
./gradlew assembleDebug
```

---

## 8. "AAPT: error: resource not found"

### Error Message
```
AAPT: error: resource drawable/ic_launcher (aka com.upirakshak:drawable/ic_launcher) not found.
```

### Solution

**Check resource files exist:**
- `app/src/main/res/drawable/ic_launcher_background.xml`
- `app/src/main/res/drawable/ic_launcher_foreground.xml`
- `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`

**Clean and rebuild:**
```bash
./gradlew clean
./gradlew assembleDebug
```

---

## 9. "Installation failed - INSTALL_FAILED_UPDATE_INCOMPATIBLE"

### Error Message (during adb install)
```
Failure [INSTALL_FAILED_UPDATE_INCOMPATIBLE: Package com.upirakshak signatures do not match previously installed version]
```

### Solution

**Uninstall previous version first:**
```bash
adb uninstall com.upirakshak
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 10. "App crashes on launch"

### Error Message
```
FATAL EXCEPTION: main
Process: com.upirakshak, PID: 12345
java.lang.RuntimeException: ...
```

### Solution

**Get crash logs:**
```bash
adb logcat | grep -E "AndroidRuntime|FATAL|com.upirakshak"
```

**Common causes:**
- Missing permissions (check AndroidManifest.xml)
- Null pointer exceptions
- Missing resources

**Check permissions:**
```bash
# Grant notification access
adb shell cmd notification allow_listener com.upirakshak/.notification.RakshakNotificationListener

# Grant overlay permission
adb shell appops set com.upirakshak SYSTEM_ALERT_WINDOW allow
```

---

## 11. "Overlay doesn't appear"

### Issue
App runs but overlay doesn't show when scam detected.

### Solution

**Check overlay permission:**
```bash
adb shell appops get com.upirakshak SYSTEM_ALERT_WINDOW
```

Should show: `SYSTEM_ALERT_WINDOW: allow`

If not:
```bash
adb shell appops set com.upirakshak SYSTEM_ALERT_WINDOW allow
```

**Check notification listener:**
```bash
adb shell cmd notification list_listeners
```

Should include: `com.upirakshak/.notification.RakshakNotificationListener`

If not:
```bash
adb shell cmd notification allow_listener com.upirakshak/.notification.RakshakNotificationListener
```

---

## 12. "Voice output not working"

### Issue
App runs but no voice when scam detected.

### Solution

**Check TTS engine:**
```bash
# List available TTS engines
adb shell pm list packages | grep tts
```

**Install Google TTS if missing:**
- Open Play Store on device
- Search "Google Text-to-Speech"
- Install it

**Check TTS settings:**
- Settings → Accessibility → Text-to-speech output
- Preferred engine: Google
- Language: Hindi (or your preferred language)

---

## 13. Build succeeds but APK is too large

### Issue
APK size > 50MB

### Solution

**Enable minification for release:**

Edit `app/build.gradle.kts`:
```kotlin
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

**Build release APK:**
```bash
./gradlew assembleRelease
```

Release APK should be ~15-20MB.

---

## 14. "Permission denied" for gradlew

### Error Message
```
bash: ./gradlew: Permission denied
```

### Solution

```bash
chmod +x gradlew
chmod +x gradlew.bat  # Windows (Git Bash)
```

---

## 15. "Could not find method compileSdk()"

### Error Message
```
Could not find method compileSdk() for arguments [34]
```

### Solution

**Check build.gradle.kts syntax:**

Correct:
```kotlin
android {
    compileSdk = 34
    // or
    compileSdk(34)
}
```

Incorrect:
```kotlin
android {
    compileSdk 34  // Missing = or ()
}
```

---

## Getting More Help

### Enable verbose logging
```bash
./gradlew assembleDebug --stacktrace --info --debug 2>&1 | tee full-build.log
```

### Check Gradle version
```bash
./gradlew --version
```

### Clean everything
```bash
./gradlew clean
rm -rf .gradle
rm -rf build
rm -rf app/build
./gradlew assembleDebug
```

### Get system info
```bash
# Java version
java -version

# Gradle version
./gradlew --version

# Android SDK
echo $ANDROID_HOME
ls $ANDROID_HOME/platforms
ls $ANDROID_HOME/build-tools
```

---

## Quick Diagnostic Script

Save this as `diagnose.sh`:

```bash
#!/bin/bash
echo "=== UPI Rakshak Build Diagnostics ==="
echo ""
echo "Java version:"
java -version 2>&1 | head -n 1
echo ""
echo "Gradle version:"
./gradlew --version 2>&1 | grep "Gradle" | head -n 1
echo ""
echo "Android SDK:"
echo "ANDROID_HOME: $ANDROID_HOME"
if [ -d "$ANDROID_HOME/platforms" ]; then
    echo "Platforms:"
    ls -1 $ANDROID_HOME/platforms
else
    echo "ERROR: platforms directory not found"
fi
echo ""
echo "Build tools:"
if [ -d "$ANDROID_HOME/build-tools" ]; then
    ls -1 $ANDROID_HOME/build-tools
else
    echo "ERROR: build-tools directory not found"
fi
echo ""
echo "Project structure:"
ls -la | grep -E "gradle|build"
echo ""
echo "Ready to build!"
```

Run: `chmod +x diagnose.sh && ./diagnose.sh`

---

## Still Stuck?

1. **Check the error log:** `build-error.log` or `full-build.log`
2. **Search the error message** on Stack Overflow
3. **Check Android Studio:** Open project in Android Studio and let it sync
4. **Ask for help:** Share the error log in your hackathon Discord/forum

**Most common solution:** Clean build + check SDK path
```bash
./gradlew clean
./gradlew assembleDebug
```
