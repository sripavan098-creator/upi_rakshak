# 🔧 Resolve 5 Merge Conflicts - Step-by-Step Guide

## Current Status

Your local repository has **5 files with merge conflicts** that need to be resolved:

1. `.gitignore`
2. `native-android/app/src/main/java/com/upirakshak/MainActivity.kt`
3. `native-android/gradle/wrapper/gradle-wrapper.properties`
4. `native-android/gradlew`
5. `native-android/gradlew.bat`

**This sandbox cannot execute git commands.** You must resolve these conflicts in your local terminal.

---

## 🎯 Quick Resolution (Copy-Paste Commands)

Run these commands in your terminal:

```bash
# 1. Navigate to your repository
cd /path/to/upi_rakshak

# 2. Check which files have conflicts
git status

# 3. Resolve all conflicts by keeping the current branch version
git checkout --theirs .gitignore
git checkout --theirs native-android/app/src/main/java/com/upirakshak/MainActivity.kt
git checkout --theirs native-android/gradle/wrapper/gradle-wrapper.properties
git checkout --theirs native-android/gradlew
git checkout --theirs native-android/gradlew.bat

# 4. Stage all resolved files
git add .gitignore
git add native-android/app/src/main/java/com/upirakshak/MainActivity.kt
git add native-android/gradle/wrapper/gradle-wrapper.properties
git add native-android/gradlew
git add native-android/gradlew.bat

# 5. Make gradlew executable (Unix/Mac)
chmod +x native-android/gradlew

# 6. Verify no conflicts remain
git status
git ls-files -u  # Should be empty

# 7. Commit the resolution
git commit -m "Resolve merge conflicts in 5 files

- Keep current branch versions for all conflicts
- Ensure gradlew is executable
- Clean merge state"

# 8. Push to update the branch
git push origin HEAD
```

---

## 📋 Detailed Resolution for Each File

### File 1: `.gitignore`

**What to keep:** The version that excludes `local.properties`

**Resolution:**
```bash
git checkout --theirs .gitignore
git add .gitignore
```

**Verify:**
```bash
grep "local.properties" .gitignore
# Should show 2 lines (17 and 43)
```

---

### File 2: `native-android/app/src/main/java/com/upirakshak/MainActivity.kt`

**What to keep:** The version with Capacitor plugin registration and 3-tab navigation

**Resolution:**
```bash
git checkout --theirs native-android/app/src/main/java/com/upirakshak/MainActivity.kt
git add native-android/app/src/main/java/com/upirakshak/MainActivity.kt
```

**Verify:**
```bash
wc -l native-android/app/src/main/java/com/upirakshak/MainActivity.kt
# Should show 123 lines

grep -n "registerPlugin" native-android/app/src/main/java/com/upirakshak/MainActivity.kt
# Should show Capacitor plugin registration
```

---

### File 3: `native-android/gradle/wrapper/gradle-wrapper.properties`

**What to keep:** The version with Gradle 8.2 configuration

**Resolution:**
```bash
git checkout --theirs native-android/gradle/wrapper/gradle-wrapper.properties
git add native-android/gradle/wrapper/gradle-wrapper.properties
```

**Verify:**
```bash
cat native-android/gradle/wrapper/gradle-wrapper.properties
# Should show Gradle 8.2 distribution URL
```

---

### File 4: `native-android/gradlew`

**What to keep:** The Unix/Mac Gradle wrapper script

**Resolution:**
```bash
git checkout --theirs native-android/gradlew
git add native-android/gradlew
chmod +x native-android/gradlew  # Make executable
```

**Verify:**
```bash
ls -l native-android/gradlew
# Should show executable permissions (-rwxr-xr-x)
```

---

### File 5: `native-android/gradlew.bat`

**What to keep:** The Windows Gradle wrapper script

**Resolution:**
```bash
git checkout --theirs native-android/gradlew.bat
git add native-android/gradlew.bat
```

**Verify:**
```bash
head -5 native-android/gradlew.bat
# Should show Windows batch script header
```

---

## 🔍 Manual Resolution (If Needed)

If `--theirs` doesn't work or you need to manually edit:

### Step 1: Open each file in your editor

```bash
code .gitignore
code native-android/app/src/main/java/com/upirakshak/MainActivity.kt
code native-android/gradle/wrapper/gradle-wrapper.properties
code native-android/gradlew
code native-android/gradlew.bat
```

### Step 2: Look for conflict markers

Search for these patterns:
```
<<<<<<< HEAD
[content from current branch]
=======
[content from other branch]
>>>>>>> [branch-name]
```

### Step 3: Choose which version to keep

For each conflict:
- **Keep the version that makes sense** (usually the one with more features or fixes)
- **Remove the conflict markers** (<<<<<<<, =======, >>>>>>>)
- **Save the file**

### Step 4: Stage the resolved files

```bash
git add .gitignore
git add native-android/app/src/main/java/com/upirakshak/MainActivity.kt
git add native-android/gradle/wrapper/gradle-wrapper.properties
git add native-android/gradlew
git add native-android/gradlew.bat
```

---

## ✅ Verification Checklist

After resolving all conflicts, verify:

### Git Status
```bash
git status
# Should show: "All conflicts fixed but you are still merging."
# OR: "nothing to commit, working tree clean"

git ls-files -u
# Should be empty (no unmerged files)
```

### No Conflict Markers
```bash
grep -rn "^<<<<<<<\|^=======\|^>>>>>>>" . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git
# Should return nothing
```

### Files Are Correct
```bash
# Check MainActivity.kt
wc -l native-android/app/src/main/java/com/upirakshak/MainActivity.kt
# Expected: 123 lines

# Check .gitignore
grep "local.properties" .gitignore
# Expected: 2 matches

# Check gradlew is executable
ls -l native-android/gradlew
# Expected: -rwxr-xr-x permissions
```

### Build Still Works
```bash
cd native-android
./gradlew clean assembleDebug
# Expected: BUILD SUCCESSFUL
```

---

## 🐛 Troubleshooting

### Issue: "error: you need to resolve your current index first"
**Solution:**
```bash
# You have unmerged files
git status
# Resolve all conflicts first, then commit
```

### Issue: "Permission denied" when running gradlew
**Solution:**
```bash
chmod +x native-android/gradlew
```

### Issue: Conflict markers still present after resolution
**Solution:**
```bash
# Find all files with conflict markers
grep -rl "^<<<<<<<" . --exclude-dir=node_modules --exclude-dir=.git

# Edit each file manually and remove markers
```

### Issue: "fatal: refusing to merge unrelated histories"
**Solution:**
```bash
# Allow merging unrelated histories
git merge --allow-unrelated-histories origin/main
```

---

## 🎯 Expected Result

After resolving all 5 conflicts:

```
✓ No conflict markers in any file
✓ git status shows clean state
✓ git ls-files -u is empty
✓ MainActivity.kt has 123 lines
✓ .gitignore excludes local.properties
✓ gradlew is executable
✓ Build passes successfully
```

---

## 📊 What Each File Should Contain

### .gitignore (55 lines)
```
# Dependencies
node_modules/
...
# Environment variables
.env
local.properties
...
# Android
native-android/.gradle/
native-android/local.properties
```

### MainActivity.kt (123 lines)
```kotlin
package com.upirakshak

import ...

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Register Capacitor plugin
        registerPlugin(RakshakPlugin::class.java)
        
        // 3-tab navigation
        setContent {
            ...
        }
    }
}
```

### gradle-wrapper.properties (8 lines)
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

### gradlew (Unix shell script)
```bash
#!/bin/sh
# Gradle wrapper script for Unix/Mac
...
```

### gradlew.bat (Windows batch script)
```batch
@rem Gradle wrapper script for Windows
...
```

---

## 🚀 After Resolution

Once all conflicts are resolved:

### 1. Commit the merge
```bash
git commit -m "Resolve merge conflicts

- Fixed conflicts in 5 files
- Kept current branch versions
- All builds passing"
```

### 2. Push to remote
```bash
git push origin HEAD
```

### 3. Verify on GitHub
- Go to your PR
- Check that conflicts are resolved
- Wait for CI to pass

### 4. Build and test
```bash
# Web
npm run build

# Android
cd native-android
./gradlew assembleDebug
```

---

## 📞 Need Help?

If you're stuck:

1. **Check the verification checklist** above
2. **Review troubleshooting section** for common issues
3. **Compare with sandbox files** - all files in this sandbox are conflict-free
4. **Ask for help** in hackathon Discord

---

## ✅ Summary

**5 files need conflict resolution:**
1. ✅ `.gitignore` - Keep version with local.properties exclusion
2. ✅ `MainActivity.kt` - Keep version with Capacitor plugin
3. ✅ `gradle-wrapper.properties` - Keep Gradle 8.2 config
4. ✅ `gradlew` - Keep Unix wrapper, make executable
5. ✅ `gradlew.bat` - Keep Windows wrapper

**Use the quick resolution commands above, or resolve manually if needed.**

**After resolution:** Commit, push, and verify on GitHub.

---

**All conflicts can be resolved in ~5 minutes!** 🚀
