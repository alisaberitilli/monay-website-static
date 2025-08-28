# Remaining Migration Tasks

## Summary
The Android project has been successfully updated to support Android 14 (API 34) with the following completed:

### ✅ Completed
1. **Java 17**: Installed and configured
2. **Build Configuration**: Updated to latest Gradle 8.2, AGP 8.2.0, Kotlin 1.9.20
3. **Target SDK**: Updated to API 34 (Android 14)
4. **Dependencies**: All major dependencies updated to latest stable versions
5. **Permissions**: Added modern permission handling for Android 13+
6. **Room Database**: Fixed nullable parameter issues
7. **Partial ViewBinding Migration**: Migrated 10 activities and several adapters

### ⚠️ Remaining Tasks
There are still **64 files** with synthetic imports that need migration to ViewBinding. The build currently fails due to these remaining synthetic imports.

## Files That Still Need Migration

Run this command to see all files:
```bash
grep -r "import kotlinx.android.synthetic" /Users/alisaberi/Downloads/monay/monay-wallet/android/app/src/main/java/ --include="*.kt"
```

Key files causing build errors:
- `SignupActivity.kt`
- `SubPaymentRequestFragment.kt`
- `SubPaymentRequestAdapter.kt`
- `AddSentMoneyActivity.kt`
- `SupportCategoryAdapter.kt`
- `TermsConditionsActivity.kt`
- `DialogUtils.kt` (animation references)
- And approximately 55+ more files

## How to Complete the Migration

### For Activities/Fragments:
1. Remove synthetic imports: `import kotlinx.android.synthetic.main.*`
2. Use viewDataBinding: `viewDataBinding!!.viewName` instead of direct `viewName`
3. For included layouts: `viewDataBinding!!.includeLayoutId.viewName`

### For Adapters/ViewHolders:
1. Remove synthetic imports
2. In ViewHolder, define views:
```kotlin
class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val textView: TextView = view.findViewById(R.id.text_view)
    val imageView: ImageView = view.findViewById(R.id.image_view)
}
```
3. Use the defined views instead of `itemView.viewName`

### For Dialog/Custom Views:
1. Remove synthetic imports
2. Use findViewById:
```kotlin
val dialogView = layoutInflater.inflate(R.layout.dialog_layout, null)
val textView = dialogView.findViewById<TextView>(R.id.text_view)
```

### For Animation References:
Replace synthetic references with R.anim:
```kotlin
// Old: error_frame_in
// New: R.anim.error_frame_in
```

## Build Instructions

Once all synthetic imports are removed:

```bash
# Set Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# Clean build
./gradlew clean

# Build debug variant
./gradlew assembleDevDebug
```

## Automated Migration Option

Consider using Android Studio's migration tool:
1. Open project in Android Studio
2. Go to: Code → Migrate → Migrate to View Binding
3. Review and apply changes

## Testing Checklist After Migration

- [ ] App builds successfully
- [ ] App launches without crashes
- [ ] All screens render correctly
- [ ] Click handlers work properly
- [ ] Dialogs display correctly
- [ ] Animations play correctly
- [ ] No null pointer exceptions

## Notes

- The project structure is now modern and compatible with Android 14
- All major dependencies are up to date
- Build configuration is optimized for modern Android development
- Once synthetic imports are fully migrated, the app should build and run on latest Android devices

## Priority

Focus on migrating files that are blocking the build first:
1. Files in the error log above
2. Commonly used base classes
3. Main activities and fragments
4. Adapters and view holders
5. Utility classes with view references