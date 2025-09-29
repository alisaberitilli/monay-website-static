#!/bin/bash

echo "🔧 ES Module Comprehensive Fix"
echo "================================"

# Fix all Sequelize imports comprehensively
echo "Fixing Sequelize imports in all files..."

# Find all files with Sequelize imports
files_with_sequelize=$(grep -r "from 'sequelize'" src --include="*.js" -l 2>/dev/null)
files_with_sequelize_quotes=$(grep -r 'from "sequelize"' src --include="*.js" -l 2>/dev/null)

all_files="$files_with_sequelize $files_with_sequelize_quotes"

for file in $all_files; do
  echo "Processing $file..."
  
  # Create temp file with fixed imports
  cat "$file" | awk '
    /^import .* from ["'\'']sequelize["'\''];?$/ {
      if ($0 ~ /^import sequelize from/) {
        # Default import - keep as is
        print $0
      } else if ($0 ~ /^import \{/) {
        # Named imports - convert to CommonJS pattern
        gsub(/^import /, "")
        gsub(/ from .*$/, "")
        exports = $0
        print "import pkg from '\''sequelize'\'';"
        print "const " exports " = pkg;"
      } else {
        print $0
      }
      next
    }
    { print }
  ' > "${file}.tmp"
  
  mv "${file}.tmp" "$file"
done

echo "✅ Sequelize imports fixed!"
