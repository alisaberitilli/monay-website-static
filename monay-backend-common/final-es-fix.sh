#!/bin/bash

echo "=== FINAL ES MODULE CLEANUP FOR MONAY-BACKEND-COMMON ==="
echo "========================================================="

# Fix remaining require() statements
echo "1. Fixing remaining require() statements..."

# Fix in middleware files
sed -i '' "s/const jwt = require('jsonwebtoken');/import jwt from 'jsonwebtoken';/g" src/middleware/tenant-isolation.js 2>/dev/null || true
sed -i '' "s/const db = require('..\/models\/index.js');/import db from '..\/models\/index.js';/g" src/middleware/mfa.js 2>/dev/null || true

# Fix in routes
sed -i '' "s/const BusinessRuleEngine = require('..\/services\/businessRuleEngine.js');/import BusinessRuleEngine from '..\/services\/businessRuleEngine.js';/g" src/routes/benefitPortal.js 2>/dev/null || true

# Fix test files - convert to ES modules
echo "2. Converting test files to ES modules..."
find src/__tests__ -name "*.js" -exec sed -i '' "s/const \(.*\) = require(\(.*\));/import \1 from \2;/g" {} \; 2>/dev/null || true
find src/__tests__ -name "*.js" -exec sed -i '' "s/} = require(\(.*\));/} from \1;/g" {} \; 2>/dev/null || true

# Fix any remaining .default patterns
find src/__tests__ -name "*.js" -exec sed -i '' "s/').default;/'.js';/g" {} \; 2>/dev/null || true

# Fix scripts that use require
echo "3. Fixing script files..."
if [ -d "scripts" ]; then
  find scripts -name "*.js" -exec sed -i '' "s/const \(.*\) = require(\(.*\));/import \1 from \2;/g" {} \; 2>/dev/null || true
fi

echo "✅ ES module cleanup complete for monay-backend-common!"
