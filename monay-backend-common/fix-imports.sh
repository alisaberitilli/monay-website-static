#!/bin/bash

# Fix missing imports in erp-connectors.js
sed -i '' "s/require('..\/services\/oracleIntegration')/require('..\/services\/oracleNetSuiteIntegration')/g" src/routes/erp-connectors.js

# Find and fix other potential missing imports
echo "Fixing import issues..."

# Check for other mismatched imports
grep -r "behavioralBiometrics" src/routes/ | grep -v "//" || true
grep -r "fraudDetectionML" src/routes/ | grep -v "//" || true
grep -r "oracleIntegration" src/routes/ | grep -v "//" || true

echo "Import fixes applied. Please test the backend again."