# Demo Fallback Plan

If the live Android demo fails, use this 90-second screen recording as backup.

## Recording Script (90 seconds)

### 0:00-0:10 — Show iQOO phone home screen
- Show the phone unlocked
- Mention: "This is an iQOO device running Funtouch OS"

### 0:10-0:25 — Open WhatsApp, show the scam message arriving
- Open WhatsApp
- Show the scam message: "URGENT: Your electricity will be disconnected tonight! Pay via QR to bselscare@icici"
- Mention: "This is a real scam message that victims receive every day"

### 0:25-0:35 — Rakshak red overlay appears over WhatsApp (the magic moment)
- The red overlay slides down from the top
- Mention: "Within 200 milliseconds, Rakshak intercepts it"

### 0:35-0:50 — Tap overlay → app opens with explanation in Hinglish
- Tap the overlay
- Show the full explanation modal
- Mention: "It tells you exactly why this is fraud — in Hindi, in your language"

### 0:50-1:05 — Voice plays: "Yeh message fraud hai..."
- The voice output plays
- Mention: "Voice-first, multilingual — no literacy barrier"

### 1:05-1:20 — Switch to CashFlow tab, show "12 days of runway"
- Navigate to Cash Flow Dashboard
- Show the runway calculation
- Mention: "But Rakshak doesn't just stop scams. It predicts cash flow shortfalls before they happen"

### 1:20-1:30 — Show loan comparison: ₹10k → ₹14.5k repayment
- Navigate to loan comparison
- Show the true cost calculation
- Mention: "So you never feel forced to take a predatory loan"

## How to Record

### Option 1: Android Screen Recording
```
Settings → Screen recording → Start recording
```
Record the full demo flow, then transfer the video to your laptop.

### Option 2: Scrcpy (Recommended)
```bash
# Install scrcpy
brew install scrcpy  # macOS
# or
apt install scrcpy   # Linux

# Connect phone via USB
scrcpy --record demo.mp4
```
This records the phone screen directly to your laptop.

### Option 3: Web Demo Backup
If the Android device completely fails, use the web demo:
1. Open the web app on your laptop
2. Click "Simulate Scam Attack"
3. Walk through the same flow
4. Mention: "This is the web preview — the real product runs as a system-level service on Android"

## Key Talking Points

1. **Real-time interception** — "The overlay appears before you scan the QR"
2. **On-device analysis** — "No data leaves your phone"
3. **Hinglish support** — "Works for users with limited English"
4. **Cash flow prediction** — "Prevents predatory borrowing"
5. **iQOO integration** — "Built for Funtouch OS"

## If Everything Fails

Use this pitch pivot:

> "UPI Rakshak is an AI-powered fraud analyzer that turns suspicious UPI messages into clear, actionable safety verdicts. Today we're demonstrating the decision engine and user experience as a web app. In production, the same engine runs inside an Android notification listener with a system-level overlay, warning the user before they complete a fraudulent payment."

Then say:

> "The web demo proves the reasoning engine, explanation layer, and financial literacy tools. The Android implementation is the delivery mechanism."

That is much stronger than overclaiming.
