@echo off
REM UPI Rakshak - Android Build Script for Windows

echo.
echo ======================================
echo   UPI Rakshak - Android Build Script
echo ======================================
echo.

REM Check if we're in the right directory
if not exist "build.gradle.kts" (
    echo ERROR: build.gradle.kts not found
    echo Please run this script from the native-android directory
    pause
    exit /b 1
)

REM Check if gradlew exists
if not exist "gradlew.bat" (
    echo ERROR: gradlew.bat not found
    echo The Gradle wrapper is missing
    pause
    exit /b 1
)

echo [OK] Gradle wrapper found
echo.

REM Check Java
where java >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java is not installed
    echo Please install JDK 17 from https://adoptium.net/
    pause
    exit /b 1
)

for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VERSION=%%v
)
echo [OK] Java version: %JAVA_VERSION%
echo.

REM Check Android SDK
if "%ANDROID_HOME%"=="" (
    if "%ANDROID_SDK_ROOT%"=="" (
        echo ERROR: Android SDK not found
        echo.
        echo Please set ANDROID_HOME environment variable:
        echo.
        echo 1. Open System Properties (Win+Pause)
        echo 2. Click "Environment Variables"
        echo 3. Add new system variable:
        echo    Name: ANDROID_HOME
        echo    Value: C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
        echo.
        echo Or create local.properties with:
        echo    sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
        pause
        exit /b 1
    ) else (
        set SDK_PATH=%ANDROID_SDK_ROOT%
    )
) else (
    set SDK_PATH=%ANDROID_HOME%
)

echo [OK] Android SDK found at: %SDK_PATH%
echo.

REM Clean previous builds
echo Cleaning previous builds...
call gradlew.bat clean --quiet

REM Build the APK
echo.
echo Building debug APK...
echo.

call gradlew.bat assembleDebug --no-daemon

if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] Build successful!
    echo.
    
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
    
    if exist "%APK_PATH%" (
        echo APK Details:
        echo    Location: %APK_PATH%
        for %%F in ("%APK_PATH%") do echo    Size: %%~zF bytes
        echo.
        
        REM Check if ADB is available
        where adb >nul 2>nul
        if %ERRORLEVEL% equ 0 (
            echo [OK] ADB detected
            set /p INSTALL="Do you want to install on connected device? (y/n) "
            if /i "%INSTALL%"=="y" (
                echo.
                echo Installing APK...
                adb install -r "%APK_PATH%"
                echo.
                echo [OK] Installation complete!
                echo.
                set /p LAUNCH="Launch the app? (y/n) "
                if /i "%LAUNCH%"=="y" (
                    adb shell am start -n com.upirakshak/.MainActivity
                    echo [OK] App launched!
                )
            )
        ) else (
            echo ADB not found. To install manually:
            echo    1. Transfer %APK_PATH% to your Android device
            echo    2. Open the file on your device
            echo    3. Allow installation from unknown sources
            echo    4. Install the APK
        )
        
        echo.
        echo Build complete!
        echo.
    ) else (
        echo ERROR: APK file not found at expected location
        echo    Expected: %APK_PATH%
        pause
        exit /b 1
    )
) else (
    echo.
    echo ERROR: Build failed!
    echo.
    echo Getting detailed error information...
    echo.
    call gradlew.bat assembleDebug --stacktrace --info > build-error.log 2>&1
    echo.
    echo Error log saved to: build-error.log
    echo.
    echo Common solutions:
    echo   1. Check Android SDK is properly installed
    echo   2. Ensure JDK 17 is being used
    echo   3. Run 'gradlew.bat clean' and try again
    echo   4. Check build-error.log for specific errors
    echo.
    pause
    exit /b 1
)

pause
