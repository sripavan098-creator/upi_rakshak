# UPI Rakshak — Native Android App

A Jetpack Compose Android app that intercepts WhatsApp/SMS notifications and shows real-time fraud warnings using system overlays.

## 🎯 What This Does

- **Monitors notifications** from WhatsApp, SMS, Telegram, and other messaging apps
- **Analyzes messages in real-time** using a rules engine that detects urgency keywords, suspicious UPI patterns, payment traps, and lookalike domains
- **Shows system overlays** over other apps when fraud is detected (red warning banner)
- **Speaks warnings in Hinglish** using Text-to-Speech
- **Predicts cash flow shortfalls** from packaged local transaction examples; it does not request SMS permission

## 🏗️ Architecture

```
MainActivity (Compose UI)
    ↓
NotificationProcessor (analyzes notifications)
    ↓
RulesEngine (detects fraud patterns)
    ↓
RakshakOverlayService (shows system overlay)
    ↓
VoiceOutput (speaks Hinglish warning)
```

## 📦 Project Structure

```
native-android/
├── app/
│   ├── src/main/java/com/upirakshak/
│   │   ├── MainActivity.kt              # Main entry point with navigation
│   │   ├── RakshakApp.kt                # Application class
│   │   ├── engine/
│   │   │   ├── ThreatLevel.kt           # HIGH/MEDIUM/SAFE enum
│   │   │   ├── ThreatAnalysis.kt        # Analysis result data class
│   │   │   ├── ScamPatterns.kt          # Fraud detection patterns
│   │   │   └── RulesEngine.kt           # Core analysis logic
│   │   ├── data/
│   │   │   ├── SmsEntry.kt              # SMS data model
│   │   │   ├── MockSmsRepository.kt     # 15 realistic SMS messages
│   │   │   └── CashFlowAnalyzer.kt      # Cash flow prediction
│   │   ├── notification/
│   │   │   ├── RakshakNotificationListener.kt  # Intercepts notifications
│   │   │   └── NotificationProcessor.kt        # Processes notifications
│   │   ├── overlay/
│   │   │   └── RakshakOverlayService.kt        # System overlay service
│   │   ├── voice/
│   │   │   └── VoiceOutput.kt                  # Hinglish TTS
│   │   ├── util/
│   │   │   ├── AppContextHolder.kt             # Global context
│   │   │   └── PermissionHelper.kt             # Permission utilities
│   │   └── ui/
│   │       ├── theme/
│   │       │   ├── Color.kt               # Dusk theme colors
│   │       │   ├── Type.kt                # Typography
│   │       │   └── Theme.kt               # Material 3 theme
│   │       └── screens/
│   │           ├── HomeScreen.kt          # Main screen with demo button
│   │           └── CashFlowScreen.kt      # Cash flow forecast
│   └── src/test/java/com/upirakshak/engine/
│       └── RulesEngineTest.kt             # 17 unit tests
├── build.gradle.kts
└── README.md
```

## 🚀 Build & Run

### Prerequisites

- Android Studio Hedgehog or later
- JDK 17
- Android SDK 34
- Physical Android device (API 26+) or emulator

### Build Commands

```bash
# Navigate to project
cd native-android

# Build debug APK for development only
./gradlew assembleDebug

# Build a signed release APK after creating keystore.properties
./gradlew assembleRelease

# Run unit tests
./gradlew test

# Install the release artifact on a connected device
adb install app/build/outputs/apk/release/app-release.apk

# Launch app
adb shell am start -n com.upirakshak/.MainActivity
```

### Offline operation

Fraud analysis, notification processing, QR parsing, cash-flow calculations, and packaged language strings run locally. The manifest intentionally does **not** request `android.permission.INTERNET`. Camera scanning uses the bundled ML Kit barcode dependency. Speech output uses the device's installed Android TTS engine; Android may require a one-time voice-data install, but Rakshak's rules engine does not download anything.

The language picker shows only the six locales currently packaged in the APK: English, Hindi, Bengali, Tamil, Telugu, and Marathi. Additional languages should not be shown until their translated resources are shipped.

### Release signing and Play Protect

Do not distribute `app-debug.apk`; it is a development artifact. For a local release build, create an uncommitted `keystore.properties` file beside this README:

```properties
storeFile=upirakshak-release.jks
storePassword=YOUR_LOCAL_PASSWORD
keyAlias=upirakshak-release
keyPassword=YOUR_LOCAL_PASSWORD
```

Then run `./gradlew assembleRelease`. The resulting `app-release.apk` is signed with that local key. A locally signed sideload can still receive a Play Protect warning because Google has not reviewed or distributed it through Play; application code cannot remove that warning. For public distribution, upload the signed release to Google Play or use an organisation-managed trusted distribution channel, and keep the signing key private.

### Grant Permissions

```bash
# Grant notification access
adb shell cmd notification allow_listener com.upirakshak/.notification.RakshakNotificationListener

# Grant overlay permission
adb shell appops set com.upirakshak SYSTEM_ALERT_WINDOW allow
```

## 🎪 Demo Flow

### 1. Launch App
- Open UPI Rakshak
- Grant notification access and overlay permission
- See "🛡️ Protection Active" status

### 2. Test Scam Detection
- Tap "🎯 Simulate Scam Attack" button
- Red overlay slides down from top
- Tap overlay → app opens with analysis
- Voice speaks: "Yeh message fraud hai..."

### 3. Test Real Notification
- Open WhatsApp on device
- Send yourself: "URGENT: Your electricity will be disconnected tonight! Pay via QR to bsescare@icici"
- Red overlay is triggered by the local rules path; observed latency depends on device load and notification-access state
- Tap overlay → see full analysis

### 4. Test Cash Flow
- Navigate to Cash Flow tab
- See "12 days of runway remaining"
- Type "iPhone EMI ₹5000"
- See: "❌ No, this will leave you short by ₹2,300"

## 🧪 Test Coverage

17 unit tests covering:
- ✅ Electricity scam → HIGH
- ✅ Bank KYC scam → HIGH
- ✅ Prize scam → HIGH
- ✅ OTP message → SAFE
- ✅ Friend chat → SAFE
- ✅ Paytm care lookalike → MEDIUM
- ✅ Job registration fee → HIGH
- ✅ Government scheme → HIGH

Run tests:
```bash
./gradlew test
```

## 🎨 Design System

**Theme:** Dusk guardian — ink/gold/teal/coral

- **Ink:** `#14132B` (background)
- **Gold:** `#E8A33D` (brand/CTA)
- **Safe:** `#3FA796` (low risk)
- **Risk Med:** `#E8A33D` (medium risk)
- **Risk High:** `#E1554A` (high risk)

**Typography:** System sans-serif (Space Grotesk in web version)

## 🔐 Permissions

| Permission | Why |
|---|---|
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Read WhatsApp/SMS notifications |
| `SYSTEM_ALERT_WINDOW` | Show warning overlay over other apps |
| `FOREGROUND_SERVICE` | Keep overlay service running |
| `POST_NOTIFICATIONS` | Show foreground service notification |
| `VIBRATE` | Haptic feedback on HIGH threat |

## 📱 iQOO / Funtouch OS Setup

Funtouch OS aggressively kills background services. Do ALL of these:

1. **Settings → Apps → UPI Rakshak → Battery → Unrestricted**
2. **Settings → Apps → UPI Rakshak → Autostart → Enable**
3. **Settings → Apps → Special access → Display over other apps → Enable**
4. **Settings → Apps → Special access → Notification access → Enable**
5. **Open app → Recents → Lock icon 🔒** (prevent swipe-kill)

## 🎯 Key Features

### 1. Real-Time Fraud Detection
- Monitors 6 messaging apps (WhatsApp, SMS, Telegram, etc.)
- Detects urgency keywords (Hinglish + English)
- Identifies suspicious UPI IDs (`@care`, `@refund`, `@verify`)
- Catches payment traps ("scan QR to receive")
- Flags lookalike domains (`bses-care.online`)

### 2. System Overlay
- Shows red warning banner over other apps
- Uses `TYPE_APPLICATION_OVERLAY` (system-level)
- Auto-hides after 8 seconds
- Tap to open app with full analysis

### 3. Hinglish Voice
- Speaks warnings in Hindi/English
- Uses Android Text-to-Speech
- Prefers Hindi voice, falls back to Indian English
- Speech rate: 0.9x (slower for clarity)

### 4. Cash Flow Prediction
- Analyzes 15 realistic SMS messages
- Calculates "days of runway remaining"
- Identifies recurring expenses (rent, EMI, electricity)
- Affordability checker for new purchases

## 📊 Performance

- **Notification processing:** <50ms
- **Overlay display:** designed for sub-200ms local handling; measure on the target device
- **APK size:** approximately 32MB for the current bundled camera/barcode release
- **Min SDK:** 26 (Android 8.0)
- **Target SDK:** 34 (Android 14)

## 🐛 Troubleshooting

### Overlay doesn't appear
- Check overlay permission: `Settings → Apps → Special access → Display over other apps`
- Check battery optimization: `Settings → Apps → UPI Rakshak → Battery → Unrestricted`

### Notification listener not working
- Check notification access: `Settings → Apps → Special access → Notification access`
- Reboot device after enabling

### App crashes on startup
- Check logcat: `adb logcat | grep -E "Rakshak|AndroidRuntime"`
- Common issue: Missing permissions

### Voice not working
- Check TTS engine: `Settings → System → Languages → Text-to-speech`
- Install Hindi voice data if missing

## 📝 License

Hackathon project — use at your own risk.

## 🙏 Acknowledgments

- **iQOO** — for inspiring system-level integration
- **NPCI** — for building UPI and BBPS
- **1930** — India's cyber crime helpline

---

**Built for the Agentic AI Hackathon — FinTech & Commerce Domain**

**Stage 1 Submission — Proof of concept demonstrating the mechanism.**
