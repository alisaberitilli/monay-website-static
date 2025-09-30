# 🚀 Icon Migration Tool - Complete Guide

## Overview

This tool safely migrates all Monay applications from `lucide-react` to the optimized `@monay/icons` local SVG library, providing significant performance improvements and bundle size reductions.

## ⚡ Quick Start

### Interactive Mode (Recommended)
```bash
cd shared/icons/migration
npm install
node migrate.ts
```

### Automatic Mode
```bash
node migrate.ts --auto
```

### Dry Run (Preview Only)
```bash
node migrate.ts --dry-run
```

## 📊 Expected Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Bundle Size** | ~2.5MB | ~2.0MB | -20% |
| **Icon Library** | ~500KB | ~75KB | -85% |
| **Build Time** | ~45s | ~30s | -33% |
| **Tree-shaking** | Partial | Full | 100% |

## 🔧 Migration Process

### Step 1: Analysis
```bash
node 1-analyze-icons.ts
```
- Scans all TypeScript/TSX files
- Identifies icon usage patterns
- Detects missing icons
- Finds unused icon libraries

**Output**: `icon-analysis-report.json`

### Step 2: Backup
```bash
node 2-backup-files.ts
```
- Creates timestamped backups
- Generates restore script
- Verifies backup integrity
- Saves manifest file

**Output**: `backups/backup-[timestamp]/`

### Step 3: Migrate Imports
```bash
# Dry run (preview)
node 3-migrate-icons.ts

# Live (apply changes)
node 3-migrate-icons.ts --live
```
- Updates import statements
- Converts `lucide-react` → `@monay/icons`
- Handles namespace imports
- File-by-file confirmation

**Output**: `migration-log-[timestamp].txt`

### Step 4: Update Package.json
```bash
# Dry run
node 4-update-package-json.ts

# Live
node 4-update-package-json.ts --live
```
- Adds `@monay/icons` dependency
- Removes unused icon libraries
- Updates tsconfig.json paths
- Creates install script

**Output**: `install-dependencies.sh`

### Step 5: Install Dependencies
```bash
bash install-dependencies.sh
# Or manually:
cd monay-admin && npm install
cd monay-caas/monay-enterprise-wallet && npm install
cd monay-cross-platform/web && npm install
```

### Step 6: Verify Migration
```bash
node 5-verify-migration.ts
```
- Checks package.json configuration
- Verifies icon installation
- Tests TypeScript compilation
- Validates all icons available
- Optional build test

**Output**: `verification-report-[timestamp].json`

## 🎯 What Gets Migrated

### Import Statements
**Before:**
```typescript
import { Shield, Users, Settings } from 'lucide-react';
```

**After:**
```typescript
import { Shield, Users, Settings } from '@monay/icons';
```

### Package Dependencies
**Before:**
```json
{
  "dependencies": {
    "lucide-react": "^0.312.0",
    "react-icons": "^5.5.0"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "@monay/icons": "file:../../shared/icons"
  }
}
```

### TypeScript Configuration
**Added to tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@monay/icons": ["../../shared/icons"],
      "@monay/icons/*": ["../../shared/icons/*"]
    }
  }
}
```

## 🔄 Rollback Process

If you need to revert the migration:

### Option 1: Automatic Restore
```bash
# Find your backup
ls backups/

# Run restore script
bash backups/backup-[timestamp]/restore.sh
```

### Option 2: Manual Restore
1. Copy files from `backups/backup-[timestamp]/`
2. Restore original package.json files
3. Run `npm install` in each application

## ⚠️ Common Issues & Solutions

### Issue: Module not found '@monay/icons'
**Solution:**
```bash
# Ensure dependencies are installed
cd [app-directory]
npm install
```

### Issue: TypeScript errors with icon imports
**Solution:**
```bash
# Check tsconfig.json has correct paths
# Verify @monay/icons is in node_modules
ls node_modules/@monay/
```

### Issue: Icon not available in @monay/icons
**Solution:**
1. Add missing icon to `/shared/icons/Icon.tsx`
2. Re-run migration step 5 (verify)

### Issue: Build fails after migration
**Solution:**
1. Check verification report for specific issues
2. Ensure all imports are updated
3. Clear build cache: `rm -rf .next`
4. Rebuild: `npm run build`

## 📋 Pre-Migration Checklist

- [ ] All changes committed to git
- [ ] Node.js 18+ installed
- [ ] All applications present
- [ ] No ongoing deployments
- [ ] Team notified of migration

## 📈 Post-Migration Checklist

- [ ] All applications build successfully
- [ ] TypeScript compilation passes
- [ ] Tests pass
- [ ] Visual inspection of icons
- [ ] Performance metrics improved
- [ ] Bundle size reduced

## 🛠️ Advanced Options

### Run Specific Steps
```bash
npm run 1-analyze          # Analysis only
npm run 2-backup           # Backup only
npm run 3-migrate-dry      # Migration preview
npm run 3-migrate-live     # Apply migration
npm run 4-update-packages-dry  # Package update preview
npm run 4-update-packages-live # Apply package updates
npm run 5-verify           # Verification only
```

### Full Migration (All Steps)
```bash
npm run migrate:full
```

### Dry Run (All Steps, No Changes)
```bash
npm run migrate:dry-run
```

## 📊 Migration Report Examples

### Successful Migration
```
✅ monay-admin: 6/6 checks passed
✅ monay-enterprise-wallet: 6/6 checks passed
✅ monay-consumer-web: 6/6 checks passed

Performance Improvements:
• Bundle size: 425KB saved
• Build time: 15s faster
• 60 icons optimized
```

### Migration with Issues
```
❌ monay-admin: 4/6 checks passed
   Issues:
   - 3 files still import from lucide-react
   - Missing icon: BarChart2

⚠️ Fix issues and run verification again
```

## 🔍 Debugging

### Enable Verbose Output
```bash
DEBUG=* node migrate.ts
```

### Check Specific Application
```bash
cd monay-admin
npx tsc --noEmit  # TypeScript check
npm run build      # Build test
```

### Manual Icon Import Test
```typescript
// Test file: test-icons.tsx
import { Shield, Home, Users } from '@monay/icons';

console.log(Shield, Home, Users);
```

## 📚 Additional Resources

- [Icon Library Documentation](../README.md)
- [Available Icons List](../Icon.tsx)
- [Performance Analysis](../MIGRATION_GUIDE.md)

## 🆘 Support

If you encounter issues:

1. Check this README
2. Review error messages carefully
3. Consult verification report
4. Check backup/restore options
5. Contact development team

## ⚡ Performance Tips

After migration:
1. Remove old icon libraries from package.json
2. Clear node_modules and reinstall
3. Update any dynamic icon imports
4. Use Icon component for dynamic icons
5. Enable production builds for testing

## 🎉 Success Metrics

You'll know the migration succeeded when:
- ✅ All applications build without errors
- ✅ TypeScript compilation passes
- ✅ Icons render correctly in UI
- ✅ Bundle size decreased by ~400KB
- ✅ Build times improved by 30%+

---

## 📝 Notes

- **Always backup first** - The tool does this automatically
- **Test thoroughly** - Verify all icons render correctly
- **Keep lucide-react** temporarily as fallback during transition
- **Commit after success** - Once verified, commit all changes

**Version**: 1.0.0
**Last Updated**: January 2025
**Maintained by**: Monay Development Team