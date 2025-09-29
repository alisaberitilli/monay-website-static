# MONAY-API FOLDER ANALYSIS - CRITICAL FINDINGS

## What is monay-api?
**monay-api is the BUILD OUTPUT directory** - NOT old code!

## Current Build Process (BROKEN)
```json
{
  "build": "npm run clean && cp -r src monay-api",
  "serve": "NODE_ENV=production node monay-api/index.js",
  "clean": "rm -rf monay-api"
}
```

### The Problem
1. **Build command just COPIES files** from `src/` to `monay-api/`
2. **No transpilation happens** - just a straight copy
3. **monay-api/ contains OLD CommonJS code** from a previous build
4. **Production runs from monay-api/** not from src/

## Evidence
- **Dockerfile**: `CMD ["node", "monay-api/index.js"]`
- **Package.json**: Production serve command uses `monay-api/index.js`
- **Identical folder structure**: Both have same subfolders (controllers, models, etc.)

## Current Situation
```
src/              → ES Modules (NEW, updated code) ✅
monay-api/        → CommonJS (OLD build output) ❌
```

## Why This Is Dangerous
1. **Production uses OLD code** - The Dockerfile runs monay-api which has old CommonJS
2. **Development uses NEW code** - npm run dev uses src/ with ES modules
3. **Builds are BROKEN** - Running `npm run build` would break because it copies ES modules but monay-api expects CommonJS

## URGENT ACTIONS NEEDED

### Option 1: Remove Build Step (RECOMMENDED)
Since we're using ES modules natively, we don't need a build step:
1. Delete monay-api folder
2. Update Dockerfile to use src/
3. Update serve command to use src/
4. Remove build commands from package.json

### Option 2: Fix Build Process
If build step is needed for some reason:
1. Clear monay-api folder
2. Run proper build that maintains ES modules
3. Ensure monay-api uses ES modules

## Commands to Fix

### To implement Option 1 (Recommended):
```bash
# 1. Remove old build folder
rm -rf monay-api

# 2. Update package.json scripts
# Change "serve": "NODE_ENV=production node monay-api/index.js"
# To:     "serve": "NODE_ENV=production node src/index.js"

# 3. Update Dockerfile
# Change: CMD ["node", "monay-api/index.js"]
# To:     CMD ["node", "src/index.js"]

# 4. Remove build commands from package.json
# Remove: "build", "clean", "clean-windows", "build-windows"
```

## Current References to monay-api
1. **Dockerfile** - For production deployment
2. **package.json** - Build and serve scripts
3. **.gitignore** - Excludes monay-api from git
4. **PM2 restart command** - In setting-repository.js

## Conclusion
**monay-api is a BUILD ARTIFACT that should be removed** since we're using ES modules natively in Node.js 20+. The current setup is running old CommonJS code in production while development uses new ES modules - a critical inconsistency!