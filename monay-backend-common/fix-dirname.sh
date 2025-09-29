#!/bin/bash

echo "Fixing __dirname usage in ES modules..."

# Files to fix
files=(
  "src/config/index.js"
  "src/bootstrap.js"
)

for file in "${files[@]}"; do
  if grep -q "__dirname" "$file"; then
    echo "Fixing $file..."
    
    # Check if already has import.meta.url fix
    if ! grep -q "import.meta.url" "$file"; then
      # Add imports at the top of the file after other imports
      sed -i '' '1s/^/import { fileURLToPath } from '\''url'\'';\nimport { dirname } from '\''path'\'';\n\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\n\n/' "$file"
    fi
  fi
done

echo "✅ __dirname usage fixed!"
