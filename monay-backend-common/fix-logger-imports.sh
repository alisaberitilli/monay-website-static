#!/bin/bash

echo "Fixing logger imports..."

# Fix all { logger } imports to use default import or specific named exports
for file in $(grep -r "import { logger }" src --include="*.js" -l); do
  echo "Fixing $file..."
  # Change { logger } to default import
  sed -i '' "s/import { logger } from '\(.*logger\.js\)';/import logger from '\1';/g" "$file"
  sed -i '' 's/import { logger } from "\(.*logger\.js\)";/import logger from "\1";/g' "$file"
done

echo "✅ Logger imports fixed!"
