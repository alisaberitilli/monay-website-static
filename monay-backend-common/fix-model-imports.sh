#!/bin/bash

echo "Fixing model imports..."

# Fix all named imports from models/index.js
for file in $(grep -r "import {.*} from ['\"].*models/index" src --include="*.js" -l); do
  echo "Fixing $file..."
  
  # Extract the imports and convert to destructuring
  sed -i '' "s|import { \(.*\) } from '\(.*models/index\.js\)';|import db from '\2';\nconst { \1 } = db;|g" "$file"
  sed -i '' 's|import { \(.*\) } from "\(.*models/index\.js\)";|import db from "\2";\nconst { \1 } = db;|g' "$file"
done

echo "✅ Model imports fixed!"
