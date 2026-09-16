# 📦 Build APK with GitHub Actions

## Quick Start (5 minutes)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
cd /path/to/your/project
git init
git add .
git commit -m "UPI Rakshak - Complete implementation"

# Create GitHub repository
# Go to https://github.com/new
# Create repository: upi-rakshak (or any name)

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/upi-rakshak.git
git branch -M main
git push -u origin main
```

### Step 2: Wait for Build (5-10 minutes)

GitHub Actions will automatically:
1. ✅ Set up JDK 17
2. ✅ Set up Android SDK
3. ✅ Build the APK
4. ✅ Upload as artifact
5. ✅ Create a release (on main branch)

### Step 3: Download APK

**Option A: From Artifacts (Any branch)**
1. Go to your GitHub repo
2. Click **Actions** tab
3. Click the latest workflow run
4. Scroll to **Artifacts** section
5. Click **UPI-Rakshak-APK** to download

**Option B: From Releases (Main branch only)**
1. Go to your GitHub repo
2. Click **Releases** on the right sidebar
3. Click the latest release
4. Download **app-debug.apk**

---

## 📱 Install APK on Your Device

### Method 1: USB Transfer
```bash
# After downloading APK
adb install app-debug.apk
```

### Method 2: Direct Download on Phone
1. Open the release/artifact link on your phone
2. Download the APK
3. Enable "Install from unknown sources" in Settings
4. Install the APK

### Method 3: Email/Cloud
1. Upload APK to Google Drive/Dropbox
2. Open on your phone
3. Install

---

## 🔧 Troubleshooting

### Build Failed?

**Check the logs:**
1. Go to Actions tab
2. Click the failed workflow
3. Expand the failed step
4. Check the error message

**Common issues:**

| Error | Solution |
|-------|----------|
| `SDK location not found` | Android SDK setup failed - retry workflow |
| `Gradle build failed` | Check Kotlin syntax errors |
| `Permission denied` | Run `chmod +x gradlew` locally first |

### APK Won't Install?

**Error: "App not installed"**
- Uninstall previous version first
- Check device has enough storage
- Enable "Install from unknown sources"

**Error: "Parse error"**
- APK might be corrupted - re-download
- Check Android version (requires Android 8.0+)

---

## 🎯 What Gets Built

The workflow builds:
- ✅ **Debug APK** (app-debug.apk)
- ✅ All 200+ fraud patterns
- ✅ All 22 language translations
- ✅ Complete feature set

**APK Size:** ~15-20 MB

**Min Android Version:** Android 8.0 (API 26)

**Target Android Version:** Android 16 (API 36)

---

## 🚀 Advanced: Custom Build

Want to customize the build? Edit `.github/workflows/build-apk.yml`:

### Build Release APK (signed)
```yaml
- name: Build Release APK
  run: |
    cd native-android
    ./gradlew assembleRelease
```

### Build Both Debug and Release
```yaml
- name: Build APKs
  run: |
    cd native-android
    ./gradlew assembleDebug assembleRelease
```

### Run Tests Before Build
```yaml
- name: Run Tests
  run: |
    cd native-android
    ./gradlew test
```

---

## 📊 Build History

Every push to main/master creates:
- ✅ New workflow run
- ✅ New APK artifact
- ✅ New release (with APK attached)

View all builds: `https://github.com/YOUR_USERNAME/upi-rakshak/actions`

---

## 🎪 For Hackathon Submission

### What to Submit:
1. **APK file** (from GitHub releases)
2. **Demo video** (screen recording)
3. **Source code** (GitHub repo link)
4. **README** (this project's README.md)

### Submission Checklist:
- [ ] APK downloaded from GitHub
- [ ] APK tested on real device
- [ ] Demo video recorded (60 seconds)
- [ ] All permissions granted
- [ ] Overlay working
- [ ] Voice output working
- [ ] Cash flow showing
- [ ] QR scanner working

---

## 💡 Pro Tips

### Speed Up Builds
Add caching to workflow:
```yaml
- name: Cache Gradle packages
  uses: actions/cache@v3
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

### Auto-Increment Version
```yaml
- name: Get version
  id: version
  run: echo "VERSION=1.0.${{ github.run_number }}" >> $GITHUB_OUTPUT
```

### Notify on Build Complete
```yaml
- name: Notify success
  if: success()
  run: echo "✅ Build successful! Download APK from releases."
```

---

## 🆘 Need Help?

**GitHub Actions not working?**
- Check `.github/workflows/build-apk.yml` syntax
- Ensure `native-android/` folder exists
- Verify `gradlew` file is executable

**APK not downloading?**
- Check Actions tab for build status
- Wait for workflow to complete (green checkmark)
- Try different browser or incognito mode

**Can't install APK?**
- Check Android version (8.0+ required)
- Enable unknown sources
- Try different installation method

---

## 📞 Quick Commands

```bash
# View workflow status
gh run list

# Download latest artifact
gh run download

# Trigger manual build
gh workflow run build-apk.yml

# View build logs
gh run view --log
```

---

**You're all set!** 🎉

Push to GitHub and your APK will be ready in 5-10 minutes.
