# Android Project Migration Guide

## Overview
This document outlines the changes made to modernize the Android project for compatibility with the latest Android versions (API 34/Android 14).

## Major Updates

### 1. Build Configuration Updates

#### Gradle Version
- **Old**: Gradle 6.5
- **New**: Gradle 8.2

#### Android Gradle Plugin
- **Old**: 4.1.2
- **New**: 8.2.0

#### Kotlin Version
- **Old**: 1.3.70
- **New**: 1.9.20

#### Target SDK
- **Old**: compileSdkVersion 30, targetSdkVersion 30
- **New**: compileSdkVersion 34, targetSdkVersion 34

#### Minimum SDK
- **Old**: minSdkVersion 21
- **New**: minSdkVersion 24

### 2. Dependency Updates

All major dependencies have been updated to their latest stable versions:
- AndroidX libraries updated to latest versions
- Firebase SDK updated to latest versions
- Retrofit updated from 2.7.1 to 2.9.0
- Glide updated from 4.11.0 to 4.16.0
- Room database updated from 2.3.0 to 2.6.1
- Material Design Components updated to 1.11.0
- OkHttp updated to 4.12.0

### 3. Permission Changes

#### Storage Permissions (Android 11+)
- Added granular media permissions for Android 13+:
  - READ_MEDIA_IMAGES
  - READ_MEDIA_VIDEO
  - READ_MEDIA_AUDIO
- Limited WRITE_EXTERNAL_STORAGE to Android 9 and below
- Limited READ_EXTERNAL_STORAGE to Android 12 and below

#### Notification Permission (Android 13+)
- Added POST_NOTIFICATIONS permission for Android 13+

### 4. Manifest Updates
- Added `android:exported` attribute to all activities with intent filters
- Added data extraction rules for Android 12+
- Updated FileProvider authority to use `${applicationId}.fileprovider`
- Added `android:enableOnBackInvokedCallback` for predictive back gesture

### 5. Deprecated API Replacements

#### kotlin-android-extensions
- **Status**: Deprecated and removed
- **Migration Required**: Replace with ViewBinding or findViewById
- **Affected Files**: Multiple activities using synthetic imports need migration

#### Firebase Instance ID
- **Old**: FirebaseInstanceId
- **New**: FirebaseMessaging.getInstance().token

#### Image Cropper
- **Old**: com.theartofdev.edmodo.cropper
- **New**: UCrop library (com.github.yalantis:ucrop)

### 6. Java Version Requirement
- **Required**: Java 17 or higher
- **Action**: Update your development environment to use Java 17

## Migration Steps for Developers

### 1. Update Java Version
```bash
# Check current Java version
java -version

# Install Java 17 if needed
# On macOS with Homebrew:
brew install openjdk@17

# Set JAVA_HOME to Java 17
export JAVA_HOME=/path/to/java17
```

### 2. Migrate kotlin-android-extensions
For each activity/fragment using synthetic imports:

**Before:**
```kotlin
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        textView.text = "Hello"
    }
}
```

**After (using ViewBinding):**
```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.textView.text = "Hello"
    }
}
```

### 3. Update Firebase Instance ID Usage

**Before:**
```kotlin
FirebaseInstanceId.getInstance().instanceId
    .addOnSuccessListener { instanceIdResult ->
        val token = instanceIdResult.token
    }
```

**After:**
```kotlin
FirebaseMessaging.getInstance().token
    .addOnSuccessListener { token ->
        // Use token
    }
```

### 4. Handle Storage Permissions

For Android 13+ (API 33+), request granular media permissions:

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    val permissions = arrayOf(
        Manifest.permission.READ_MEDIA_IMAGES,
        Manifest.permission.READ_MEDIA_VIDEO
    )
    requestPermissions(permissions, REQUEST_CODE)
} else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
    // Handle Android 11-12
    if (!Environment.isExternalStorageManager()) {
        val intent = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)
        startActivity(intent)
    }
} else {
    // Handle Android 10 and below
    val permissions = arrayOf(
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    )
    requestPermissions(permissions, REQUEST_CODE)
}
```

### 5. Handle Notification Permission

For Android 13+ (API 33+):

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    if (ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.POST_NOTIFICATIONS
        ) != PackageManager.PERMISSION_GRANTED
    ) {
        requestPermissions(
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            NOTIFICATION_PERMISSION_REQUEST_CODE
        )
    }
}
```

## Build and Run

1. Clean the project:
```bash
./gradlew clean
```

2. Build the project:
```bash
./gradlew assembleDebug
```

3. Run on device/emulator:
```bash
./gradlew installDebug
```

## Common Issues and Solutions

### Issue 1: Java Version Error
**Error**: Android Gradle plugin requires Java 17
**Solution**: Install Java 17 and update JAVA_HOME or gradle.properties

### Issue 2: Synthetic Import Errors
**Error**: Unresolved reference for synthetic imports
**Solution**: Migrate to ViewBinding as shown above

### Issue 3: Manifest Merger Failed
**Error**: android:exported needs to be explicitly specified
**Solution**: Add android:exported="true/false" to all activities with intent-filters

### Issue 4: Storage Permission Issues
**Error**: Permission denied for file access on Android 11+
**Solution**: Implement scoped storage or request MANAGE_EXTERNAL_STORAGE permission

## Testing Checklist

- [ ] App launches on Android 14 device/emulator
- [ ] App launches on Android 13 device/emulator
- [ ] App launches on Android 11 device/emulator
- [ ] Camera functionality works
- [ ] File upload/download works
- [ ] Push notifications work (Android 13+)
- [ ] All screens render correctly
- [ ] No crashes on app startup
- [ ] Payment features work correctly
- [ ] QR code scanning works

## Next Steps

1. Complete migration of kotlin-android-extensions to ViewBinding
2. Test thoroughly on different Android versions
3. Update ProGuard/R8 rules if needed
4. Update CI/CD pipeline to use Java 17
5. Consider implementing Material 3 design updates