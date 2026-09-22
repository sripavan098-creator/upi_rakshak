# AGENTS.md

Repository-specific knowledge for agents working on UPI Rakshak. Read this before making changes.

## What this project is

UPI Rakshak is a UPI fraud and cash-flow safety app for India. It has two deliverables that coexist:

- A React/TypeScript web app (`src/`, deployed at upirakshak.vercel.app).
- A pure native Android app in Kotlin and Jetpack Compose (`native-android/`).

They are separate implementations, not one wrapped in the other. The web app is the browser demo and demo-day fallback. The Android app is the product: it reads notifications at the OS level and draws a real overlay over other apps.

## There are three android directories. Only one is real.

Do not start work in the wrong one. This has caused wasted effort.

| Directory | Tracked files | Status |
| --- | --- | --- |
| `native-android/` | 53 | The real app. Complete Gradle project, builds and tests pass. |
| `android-wrapper/` | 12 | Abandoned WebView prototype. No `settings.gradle`, no Gradle wrapper. Does not build. |
| `android/` | 5 | Abandoned Capacitor attempt. No Gradle files at all. Does not build. |

If a task concerns the Android app, it belongs in `native-android/`.

## Building the Android app

`native-android/` compiles and tests clean on this machine. There is no JDK, Gradle, or Android SDK preinstalled, so the first run needs the toolchain set up.

Versions the project needs:

- JDK 17 or newer. JDK 21 works.
- Gradle 8.2.1, fetched by the wrapper.
- Android Gradle Plugin 8.2.2, Kotlin 1.9.22, Compose compiler 1.5.8.
- compileSdk 34, minSdk 26, targetSdk 34.

Set up the toolchain once:

```bash
sudo apt-get update
sudo apt-get install -y openjdk-21-jdk-headless unzip

export ANDROID_SDK_ROOT=/opt/android-sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

sudo mkdir -p $ANDROID_SDK_ROOT/cmdline-tools
curl -sSL -o /tmp/cmdtools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q -o /tmp/cmdtools.zip -d /tmp/cmdtools
sudo mv /tmp/cmdtools/cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest

yes | sudo -E $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses
sudo -E $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager \
  "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

Then build and test:

```bash
cd native-android
export ANDROID_SDK_ROOT=/opt/android-sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

./gradlew test          # 17 unit tests
./gradlew assembleDebug # writes app/build/outputs/apk/debug/app-debug.apk
```

The debug APK is about 38 MB. Gradle needs network access on the first run to download dependencies. Use `--no-daemon` in short-lived sessions.

## Testing the web app

```bash
npm run typecheck
npm run lint
npm run test            # Vitest, 48 tests
npm run test:e2e        # Playwright, 27 tests
npm run build

# Everything at once
npm run test:all
```

Playwright needs its browser binary. In a fresh environment run `npx playwright install chromium` first, or every E2E test fails with "Executable doesn't exist".

## Android: what is deliberately switched off

`native-android/app/src/main/AndroidManifest.xml` force-removes permissions with `tools:node="remove"`:

- `INTERNET` and `ACCESS_NETWORK_STATE`: the app is offline by design.
- `READ_SMS`: cash flow runs on `MockSmsRepository`, not real messages.
- `RECEIVE_BOOT_COMPLETED`: the user restarts protection manually.

Do not re-enable these without asking. Turning on `READ_SMS` changes the app's privacy story from "reads no messages" to "reads all your bank SMS", which is a product decision, not a refactor.

## Feature gaps as of this writing

Missing from the native app, if a task calls for them:

- Trusted-contact escalation. Not implemented in either codebase.
- Room persistence for threat history. `NotificationProcessor` keeps the last analysis in a `StateFlow` and in SharedPreferences.
- Onboarding wizard. Only a language picker exists (`LanguageSelectionScreen`).

Do not trust outside gap analyses that describe `src/lib/agent.ts`, `src/lib/mockSmsData.ts`, `src/lib/nativeBridge.ts`, `Hero.tsx`, `Navbar.tsx`, or `AgentDemo.tsx`. Those files no longer exist or never did. Verify against the working tree.

## Code conventions

- Kotlin: 4-space indent, `object` for stateless engines, `data class` for results, `StateFlow` for observable state.
- TypeScript: strict mode, no `any`, explicit return types on exported functions.
- No comments that restate the code. Comment only non-obvious invariants or deliberate trade-offs.
- Keep the rules engine pure. `RulesEngine` and `CashFlowAnalyzer` take plain values and return data. No Android imports in `engine/` or `data/`.

## Commit and branch conventions

- Work on a feature branch. Never commit directly to `main`.
- Do not commit build output. `.gitignore` covers `dist/`, `build/`, `coverage/`, `test-results/`, and the Android keystore files.
- Never commit `keystore.properties`, `.jks`, or `.keystore` files.
