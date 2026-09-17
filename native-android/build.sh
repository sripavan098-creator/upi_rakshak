#!/bin/bash

# UPI Rakshak - Android Build Script
# This script builds the native Android APK

set -e  # Exit on error

echo "🔨 UPI Rakshak - Android Build Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "build.gradle.kts" ]; then
    echo "❌ Error: build.gradle.kts not found"
    echo "Please run this script from the native-android directory"
    exit 1
fi

# Check if gradlew exists and is executable
if [ ! -f "gradlew" ]; then
    echo "❌ Error: gradlew not found"
    echo "The Gradle wrapper is missing"
    exit 1
fi

# Make gradlew executable
chmod +x gradlew

echo "✅ Gradle wrapper found"
echo ""

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java is not installed"
    echo "Please install JDK 17 from https://adoptium.net/"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
echo "✅ Java version: $JAVA_VERSION"

if [ "$JAVA_VERSION" != "17" ]; then
    echo "⚠️  Warning: Java 17 is recommended (found Java $JAVA_VERSION)"
    echo "   The build may still work, but Java 17 is preferred"
fi

echo ""

# Check Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "❌ Error: Android SDK not found"
    echo ""
    echo "Please set ANDROID_HOME environment variable:"
    echo ""
    echo "Mac:"
    echo "  export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo ""
    echo "Linux:"
    echo "  export ANDROID_HOME=\$HOME/Android/Sdk"
    echo ""
    echo "Windows (PowerShell):"
    echo "  \$env:ANDROID_HOME = \"\$env:LOCALAPPDATA\\Android\\Sdk\""
    echo ""
    echo "Or create local.properties with:"
    echo "  sdk.dir=/path/to/android/sdk"
    exit 1
fi

SDK_PATH="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
echo "✅ Android SDK found at: $SDK_PATH"
echo ""

# Check if SDK has required components
if [ ! -d "$SDK_PATH/platforms/android-34" ]; then
    echo "⚠️  Warning: Android SDK 34 not found"
    echo "Please install it via Android Studio SDK Manager"
    echo ""
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean --quiet

# Build the APK
echo ""
echo "🔨 Building debug APK..."
echo ""

if ./gradlew assembleDebug --no-daemon; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "📦 APK Details:"
        echo "   Location: $APK_PATH"
        echo "   Size: $APK_SIZE"
        echo ""
        
        # Offer to install
        if command -v adb &> /dev/null; then
            echo "📱 ADB detected"
            read -p "Do you want to install on connected device? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo ""
                echo "📲 Installing APK..."
                adb install -r "$APK_PATH"
                echo ""
                echo "✅ Installation complete!"
                echo ""
                read -p "Launch the app? (y/n) " -n 1 -r
                echo ""
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    adb shell am start -n com.upirakshak/.MainActivity
                    echo "✅ App launched!"
                fi
            fi
        else
            echo "💡 ADB not found. To install manually:"
            echo "   1. Transfer $APK_PATH to your Android device"
            echo "   2. Open the file on your device"
            echo "   3. Allow installation from unknown sources"
            echo "   4. Install the APK"
        fi
        
        echo ""
        echo "🎉 Build complete!"
        echo ""
    else
        echo "❌ Error: APK file not found at expected location"
        echo "   Expected: $APK_PATH"
        exit 1
    fi
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "📋 Getting detailed error information..."
    echo ""
    ./gradlew assembleDebug --stacktrace --info 2>&1 | tee build-error.log
    echo ""
    echo "💡 Error log saved to: build-error.log"
    echo ""
    echo "Common solutions:"
    echo "  1. Check Android SDK is properly installed"
    echo "  2. Ensure JDK 17 is being used"
    echo "  3. Run './gradlew clean' and try again"
    echo "  4. Check build-error.log for specific errors"
    echo ""
    exit 1
fi
