# Native Android Build & Verification

How to build, test, and lint the Jetpack Compose app under `native-android/`, plus the
toolchain versions these commands have been verified against.

## Toolchain

The build has been verified end to end in a headless Linux container with:

| Tool | Version |
|---|---|
| JDK | 21 (compiles to Java 17 bytecode) |
| Gradle | 8.2.1 (wrapper) |
| Android Gradle Plugin | 8.2.2 |
| Kotlin | 1.9.22 |
| Compose compiler | 1.5.8 |
| compileSdk / targetSdk | 34 |
| minSdk | 26 |
| Android SDK | `platforms/android-34` |

`sourceCompatibility` / `targetCompatibility` / `jvmTarget` are pinned to 17, so JDK 17
and JDK 21 both work. Set `ANDROID_SDK_ROOT` (or `ANDROID_HOME`) to an SDK install
containing platform 34 before building.

## Build

```bash
export ANDROID_SDK_ROOT=/path/to/android-sdk
cd native-android

./gradlew assembleDebug      # debug APK
./gradlew assembleRelease    # release APK (needs keystore.properties, see README)
```

Debug output lands at `app/build/outputs/apk/debug/app-debug.apk`. The current artifact is
about 36 MB, most of which is the bundled ML Kit barcode model — the app ships its scanner
model inside the APK so it works with no network access.

## Test and lint

```bash
./gradlew test        # JVM unit tests
./gradlew lintDebug   # Android lint, XML report at app/build/reports/lint-results-debug.xml
```

All three gates (`lintDebug`, `test`, `assembleDebug`) pass cleanly:

- **97 unit tests, 0 failures.**
- **0 lint errors.**
- **0 Kotlin compiler warnings.**

To read the lint summary without opening the HTML report:

```bash
python3 - <<'PY'
import collections, xml.etree.ElementTree as ET
root = ET.parse('app/build/reports/lint-results-debug.xml').getroot()
counts = collections.Counter(
    i.get('id') for i in root.iter('issue') if i.get('severity') == 'Warning'
)
errors = [i.get('id') for i in root.iter('issue') if i.get('severity') == 'Error']
print('errors:', errors)
print(counts.most_common())
PY
```

### Known remaining warnings

These are intentionally deferred; each is either informational or not worth the churn:

| Warning | Count | Why it is left alone |
|---|---|---|
| `GradleDependency` | 11 | Newer releases exist but Kotlin 1.9.22 and Compose compiler 1.5.8 must move together. Bumping them is a coordinated upgrade, not a lint fix. |
| `SetTextI18n` | 2 | Concatenated strings that embed a runtime value. Each needs a `plurals`/format-arg resource; tracked as follow-up i18n work. |
| `ObsoleteLintCustomCheck` | 1 | Emitted by a third-party lint rule inside a dependency; not fixable in this repo. |
| `ObsoleteSdkInt` | 1 | Version check that is only redundant on the *current* minSdk; removing it would break lower-API behaviour. |
| `StaticFieldLeak` | 1 | The `Application` context held by `AppContextHolder`. Application context is a deliberate, safe singleton — the warning does not apply. |

## Notification-driven reminders

`READ_SMS`, `RECEIVE_BOOT_COMPLETED`, `INTERNET`, and `ACCESS_NETWORK_STATE` are present in
the manifest but marked `tools:node="remove"`, so the shipped artifact does **not** request
them. Fraud analysis is driven entirely by the notification listener, and the app performs no
network calls. If you deliberately re-enable SMS ingestion, remove the corresponding
`tools:node="remove"` line and re-check the permission rationale — Play Store review treats
`READ_SMS` as a sensitive, restricted permission.

## Verifying a build on a device

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.upirakshak/.MainActivity

# Permissions granted via Settings are not grantable by adb for the
# notification listener; use the onboarding wizard in the app instead.

# Watch for runtime problems
adb logcat | grep -E 'Rakshak|AndroidRuntime'
```

See `README.md` in this directory for permission setup, the iQOO/Funtouch OS battery
allowlists, and the demo walkthrough.
