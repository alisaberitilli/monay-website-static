#!/bin/bash

echo "🔍 COMPREHENSIVE COMMONJS DETECTION SCAN"
echo "========================================="
echo ""

# Function to scan a project
scan_project() {
  local project_name=$1
  local project_path=$2
  
  echo "📁 Scanning $project_name"
  echo "Path: $project_path"
  echo "-----------------------------------"
  
  cd "$project_path" || return
  
  # Check package.json for type module
  echo -n "✓ Package.json has 'type: module': "
  if grep -q '"type": "module"' package.json 2>/dev/null; then
    echo "YES ✅"
  else
    echo "NO ❌ - NEEDS FIXING!"
  fi
  
  # Check for require() statements (excluding node_modules and .next)
  echo -n "✓ Checking for require() statements: "
  local require_count=$(find . -path ./node_modules -prune -o -path ./.next -prune -o -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -h "require(" 2>/dev/null | grep -v "^//" | grep -v "^[[:space:]]*\*" | wc -l)
  if [ "$require_count" -eq 0 ]; then
    echo "NONE FOUND ✅"
  else
    echo "FOUND $require_count instances ❌"
    echo "  Files with require():"
    find . -path ./node_modules -prune -o -path ./.next -prune -o -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "require(" 2>/dev/null | grep -v node_modules | grep -v .next | head -5
  fi
  
  # Check for module.exports
  echo -n "✓ Checking for module.exports: "
  local exports_count=$(find . -path ./node_modules -prune -o -path ./.next -prune -o -name "*.js" -o -name "*.jsx" | xargs grep -h "module\.exports" 2>/dev/null | grep -v "^//" | wc -l)
  if [ "$exports_count" -eq 0 ]; then
    echo "NONE FOUND ✅"
  else
    echo "FOUND $exports_count instances ❌"
    echo "  Files with module.exports:"
    find . -path ./node_modules -prune -o -path ./.next -prune -o -name "*.js" -o -name "*.jsx" | xargs grep -l "module\.exports" 2>/dev/null | grep -v node_modules | grep -v .next | head -5
  fi
  
  # Check for exports.something
  echo -n "✓ Checking for exports.x patterns: "
  local exports_pattern=$(find . -path ./node_modules -prune -o -path ./.next -prune -o -name "*.js" -o -name "*.jsx" | xargs grep -h "^exports\." 2>/dev/null | wc -l)
  if [ "$exports_pattern" -eq 0 ]; then
    echo "NONE FOUND ✅"
  else
    echo "FOUND $exports_pattern instances ❌"
  fi
  
  echo ""
}

# Scan each project
scan_project "MONAY-ADMIN" "/Users/alisaberi/Data/0ProductBuild/monay/monay-admin"
scan_project "MONAY-ENTERPRISE-WALLET" "/Users/alisaberi/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet"
scan_project "MONAY-BACKEND-COMMON" "/Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common"
scan_project "MONAY-CONSUMER-WALLET" "/Users/alisaberi/Data/0ProductBuild/monay/monay-cross-platform/web"

echo "========================================="
echo "📊 SCAN COMPLETE"
echo "Check results above for any ❌ marks that need fixing"
