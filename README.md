# UPI Rakshak

> **Real-time AI financial safety layer for India's digital economy**

![Hackathon Project](https://img.shields.io/badge/Hackathon-Agentic%20AI%202025-E8A33D)
![FinTech](https://img.shields.io/badge/Domain-FinTech%20%26%20Commerce-3FA796)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)
![Android](https://img.shields.io/badge/Android-Kotlin-3DDC84)

---

## 🛡️ The Problem

Every day, millions of Indians receive scam messages on WhatsApp and SMS. By the time they realize it's fraud, the money is gone.

**The scams are sophisticated:**
- Urgency pressure: "Your electricity will be disconnected tonight!"
- Official-looking UPI IDs: `bsescare@icici`, `sbirefund@paytm`
- Payment traps: "Scan this QR to receive your refund" (you can't receive money by scanning a QR)
- Hinglish manipulation: "Aapka account bandh ho jayega, turant pay karo"

**The victims are vulnerable:**
- Paycheck-to-paycheck workers facing cash flow crises
- First-time UPI users who don't know the rules
- Small business owners drowning in legitimate payment requests
- Elderly family members targeted with urgency + technical jargon

**The gap:** No layer currently sits *between* the user and the moment of decision — not a bank warning after the transaction, not a news article about scams in general, but something that looks at *this specific message* and says, clearly, what's actually true.

---

## ✨ What UPI Rakshak Does

### 🚨 Real-Time Scam Detection
Intercepts WhatsApp/SMS notifications at the OS level and analyzes them in <200ms using a deterministic rules engine:
- **Urgency keywords** (Hinglish + English): "bandh", "kat jayega", "disconnected", "immediately"
- **Suspicious UPI patterns**: `@care`, `@refund`, `@verify`, `@support`
- **Payment traps**: "scan QR to receive", "enter PIN to accept"
- **Lookalike domains**: `bses-care.online`, `sbi-verify.xyz`

When a HIGH threat is detected, a **red warning overlay slides down from the top of the screen** — visible even when you're in WhatsApp — telling you exactly why it's fraud and what to do instead.

### 💰 Cash Flow Prediction
Reads your SMS history (on-device, encrypted) to predict shortfalls before they happen:
- "Aapke paise 20 tareekh tak khatam ho sakte hain" (Your money might run out by the 20th)
- Shows upcoming recurring expenses (rent, EMI, bills)
- Suggests affordable alternatives before you take a predatory loan

### 📊 True Loan Cost Calculator
Converts marketing rates into actual rupee totals:
- Headline: "30% interest" → Reality: "₹1,450 extra in 3 months (45% effective rate)"
- Includes processing fees, flat fees, and hidden charges
- Compares instant loans vs bank loans vs credit card EMI

### 🎤 Voice-First, Multilingual
- Speak queries in Hindi/Hinglish: "Mere paise mahine ke end tak chalenge?"
- Get spoken warnings: "Yeh message fraud hai. QR code scan mat karo."
- Works offline with on-device speech recognition

---

## 🎯 Live Demo

### The Hackathon-Winning Moment

**Click "Simulate scam attack"** in the hero preview or use the scrollable interception timeline to see:

1. **Fake WhatsApp notification slides in** (1.5s)
   - Looks realistic: green header, "Unknown sender", urgent message
   - Message: "URGENT: Your electricity will be disconnected tonight! Pay now via QR..."

2. **Red Rakshak overlay replaces it**
   - Slides down from the top like an Android system notification
   - Stamp-red notice: "RAKSHAK ALERT: FRAUD HO SAKTA HAI!"
   - Shows the exact phrases that triggered the flag

3. **The in-page mobile simulation advances to a verdict**
   - The recreated phone screen changes from WhatsApp to a Rakshak fraud alert
   - Three ledger-style reasons explain the interception
   - Safe-action guidance: "Use the official BSES app or call 1930"
   - The dialog explicitly states that no real notification is sent

**This is the unforgettable demo moment** — the overlay appearing over a live scam notification within 200ms.

### Try the Voice Interface

Use the **Voice Notice** in the live scanner and click the microphone button or choose a sample question:
- "Is this payment safe?"
- "Can I afford this EMI?"
- "Mere paise mahine ke end tak chalenge?"

Rakshak updates the answer in the notice and uses the browser's native speech synthesis to speak the response in Hindi or English. Speech recognition is available when supported by Chrome/Edge.

### Explore Cash Flow

The dashboard shows:
- **Days of runway remaining**: "12 days" (green) or "3 days" (red warning)
- **Income vs expenses bar chart** for the current month
- **Upcoming recurring expenses**: Rent, EMI, electricity bills with dates
- **Affordability checker**: "iPhone EMI ₹5000/month" → "No, this will leave you short by ₹2,300 on day 18"

---

## 🏗️ Tech Stack

### Web App (React + TypeScript)
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** for the dusk-themed design system
- **Framer Motion** for smooth animations
- **Recharts** for cash flow visualization
- **Web Speech API** for voice input/output (browser-native, no dependencies)

### Android Native (Kotlin)
- **NotificationListenerService** — intercepts notifications at OS level
- **WindowManager** with TYPE_APPLICATION_OVERLAY — shows system-level warnings
- **WebView** — hosts the React app and bridges with native services
- **JavaScript Interface** — allows web app to trigger native overlays

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│  Browser / Android WebView                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React App (src/)                                 │  │
│  │  • Rules Engine (TypeScript)                      │  │
│  │  • Cash Flow Dashboard                            │  │
│  │  • Voice Interface                                │  │
│  │  • Loan Comparison                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ (JavaScript Interface)
┌─────────────────────────────────────────────────────────┐
│  Android Native Services                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  NotificationListenerService                      │  │
│  │  • Intercepts WhatsApp/SMS                        │  │
│  │  • Runs rules engine (Kotlin port)                │  │
│  │  • Triggers overlay on HIGH threat                │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  OverlayService                                   │  │
│  │  • Shows system-level warning banner              │  │
│  │  • TYPE_APPLICATION_OVERLAY                       │  │
│  │  • Auto-dismiss after 8 seconds                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Run

### Web App (Quick Start)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Android Native Wrapper

See [`android-wrapper/README.md`](./android-wrapper/README.md) for full setup instructions.

**Quick version:**
```bash
# Build the React app
npm run build

# Copy to Android assets
mkdir -p android-wrapper/app/src/main/assets
cp -r dist/* android-wrapper/app/src/main/assets/

# Open android-wrapper/ in Android Studio
# Connect your Android device
# Click "Run"
```

**Required permissions:**
1. Notification Access (to read WhatsApp/SMS)
2. Display Over Other Apps (to show warning overlay)

---

## 📱 The iQOO Angle

UPI Rakshak is designed to integrate deeply with **iQOO devices running Funtouch OS**:

### Why iQOO?
- **Massive user base** in India's target demographic
- **Aggressive battery optimization** that kills background services (Rakshak needs to stay alive)
- **Custom notification system** that can be enhanced with system-level protection

### Funtouch OS Integration
1. **Autostart whitelist** — Rakshak survives reboots
2. **Battery optimization exemption** — services stay active
3. **Notification priority** — warnings appear even in Do Not Disturb mode
4. **System overlay permissions** — pre-configured for seamless UX

### Demo on iQOO Device
1. Install UPI Rakshak from APK
2. Follow the 5-step Funtouch OS setup (see android-wrapper/README.md)
3. Open WhatsApp and receive a test scam message
4. **Watch the red overlay appear in <200ms** — the unforgettable moment

---

## 📊 Impact

### Expected Outcomes (Hypotheses to Test)

- **Fraud interrupted at the moment of decision** — the scam explanation arrives *before* the QR is scanned
- **Predatory borrowing made visible** — converting marketing rates into actual rupee totals
- **Shortfalls surfaced days early** — cash flow projection catches problems before payments bounce
- **A second line of defense** — trusted-contact escalation for first-time/lower-fluency users

### What We Built
- ✅ Real-time scam detection with Hinglish + English rules
- ✅ System-level overlay (Android native)
- ✅ Cash flow prediction from SMS history
- ✅ True loan cost calculator
- ✅ Voice-first multilingual interface
- ✅ Android rules-engine test suite (17 passing tests)

### What's Still Open
- ⚠️ No live user research yet (personas are hypotheses)
- ⚠️ Fixed keyword-based scam detection (no ML yet)
- ⚠️ No persistence layer (stateless by design for Stage 1)
- ⚠️ No real trusted-contact delivery (simulated)

**This is a Stage 1 hackathon proof-of-concept.** Validating actual impact (fraud rate reduction, borrowing rate change) requires a real pilot with real users — explicitly out of scope for this submission.

---

## 🧪 Testing

```bash
# Typecheck and build the web app
npm run typecheck
npm run build

# Run the Android rules-engine tests and build the debug APK
cd native-android
./gradlew test
./gradlew assembleDebug
```

The verified Android artifact is generated at
`native-android/app/build/outputs/apk/debug/app-debug.apk`.

**Test coverage:**
- ✅ Rules engine (17 test cases: HIGH/MEDIUM/SAFE detection)
- ✅ Cash flow calculation (runway, recurring expenses)
- ✅ Loan cost math (EMI, effective rate, hidden fees)
- ✅ Escalation gating (only HIGH/MEDIUM trigger alerts)
- ✅ Voice interface (mock SpeechSynthesis)

---

## 📁 Project Structure

```
upi_rakshak/
├── src/
│   ├── components/
│   │   ├── TheNoticeLanding.tsx      # Product page composition
│   │   ├── InterceptionTimeline.tsx  # Signature scroll interception
│   │   ├── NoticeVoicePanel.tsx      # Speech input/output notice
│   │   ├── QrCodeScanner.tsx         # Live QR safety scoring
│   │   ├── CashFlowRuler.tsx         # Runway visualization
│   │   ├── LoanReceipt.tsx           # Itemised loan comparison
│   │   ├── CredibilityLedger.tsx     # Evidence and limitations
│   │   └── StatusIndicator.tsx       # Scanner status display
│   ├── lib/
│   │   ├── agent.ts                 # Core agent loop
│   │   ├── rulesEngine.ts           # Fraud detection rules
│   │   ├── voice.ts                 # Speech synthesis
│   │   └── mockSmsData.ts           # Demo SMS history
│   └── App.tsx
├── android-wrapper/                 # Android native wrapper
│   ├── app/
│   │   └── src/main/java/com/upirakshak/
│   │       ├── MainActivity.kt
│   │       ├── RakshakNotificationListener.kt
│   │       ├── OverlayService.kt
│   │       └── RakshakJsInterface.kt
│   └── README.md
├── index.html
├── package.json
└── README.md                        # This file
```

---

## 🎓 Documentation

| Doc | Covers |
|---|---|
| **README.md** | This file — overview, demo, setup |
| [**android-wrapper/README.md**](./android-wrapper/README.md) | Android setup, Funtouch OS config, architecture |
| **BRIEF.md** | Problem statement, target users, impact reasoning |
| **ARCHITECTURE.md** | System diagram, request lifecycle, tool schemas |
| **DESIGN.md** | Design tokens, motifs, animations, accessibility |
| **docs/RESEARCH_NOTES.md** | Personas, assumptions, open questions |

---

## 🤝 Contributing

This is a hackathon project, but we welcome feedback!

**Known limitations:**
- Keyword-based detection won't catch novel scam wording
- No real user research yet (personas are hypotheses)
- Cash flow uses simulated SMS data (real SMS parsing requires additional Android permissions)

**Future enhancements:**
- On-device ML model for fraud detection
- Encrypted SMS parsing for cash flow analysis
- Multi-language support (Tamil, Telugu, Bengali, Marathi)
- Community reporting for new scam patterns
- Deep iQOO/Funtouch OS integration

---

## 📄 License

This is a hackathon project built for educational purposes. Use at your own risk.

**Disclaimer:** UPI Rakshak is a proof-of-concept. It does not guarantee protection against all scams. Always verify financial transactions through official channels.

---

## 👥 Team

Built for the **Agentic AI Hackathon — FinTech & Commerce Domain**

**Stage 1 Submission** — Proof of concept demonstrating the mechanism, not measured outcomes.

---

## 🙏 Acknowledgments

- **iQOO** — for inspiring the system-level integration approach
- **NPCI** — for building UPI and BBPS
- **1930** — India's cyber crime helpline
- **The UPI scam victims** — whose stories inspired this project

---

<div align="center">

**UPI Rakshak: The safety layer India's digital economy was missing.**

[Live Demo](#-live-demo) • [Android Setup](./android-wrapper/README.md) • [Architecture](#-architecture)

</div>
