#!/bin/bash

# Deep fix: Convert all CommonJS to ES modules

echo "🔄 Converting all CommonJS require() to ES module imports..."

# Function to convert require to import
convert_file() {
    local file=$1
    echo "  Converting: $file"

    # Backup original
    cp "$file" "$file.bak"

    # Convert const/let/var x = require('y') to import x from 'y'
    sed -i '' -E "s/^const ([a-zA-Z_][a-zA-Z0-9_]*) = require\('([^']*)'\);?$/import \1 from '\2';/g" "$file"
    sed -i '' -E "s/^let ([a-zA-Z_][a-zA-Z0-9_]*) = require\('([^']*)'\);?$/import \1 from '\2';/g" "$file"
    sed -i '' -E "s/^var ([a-zA-Z_][a-zA-Z0-9_]*) = require\('([^']*)'\);?$/import \1 from '\2';/g" "$file"

    # Convert const { x, y } = require('z') to import { x, y } from 'z'
    sed -i '' -E "s/^const \{([^}]*)\} = require\('([^']*)'\);?$/import {\1} from '\2';/g" "$file"

    # Add .js to local imports
    sed -i '' -E "s/from '(\.\.[^']*)'([^.']*)';$/from '\1\2.js';/g" "$file"
    sed -i '' -E "s/from '(\.\/[^']*)'([^.']*)';$/from '\1\2.js';/g" "$file"

    # Fix double .js.js
    sed -i '' "s/\.js\.js/\.js/g" "$file"

    # Don't add .js to npm packages
    sed -i '' -E "s/from '([^./][^']*).js';/from '\1';/g" "$file"

    # Convert module.exports to export default
    sed -i '' "s/^module\.exports = /export default /g" "$file"
    sed -i '' "s/^module\.exports\./export /g" "$file"

    # Convert exports.x to export
    sed -i '' -E "s/^exports\.([a-zA-Z_][a-zA-Z0-9_]*) = /export const \1 = /g" "$file"
}

# Find all JS files with require statements
files_with_require=$(grep -r "require(" src --include="*.js" -l)

total=$(echo "$files_with_require" | wc -l)
current=0

echo "Found $total files with require() statements"

for file in $files_with_require; do
    current=$((current + 1))
    echo "[$current/$total] $file"
    convert_file "$file"
done

echo "✅ Conversion complete!"
echo ""
echo "🔧 Now fixing missing dependencies..."

# Check for missing Solana package
if ! npm list @solana/web3.js &>/dev/null; then
    echo "Installing @solana/web3.js..."
    npm install @solana/web3.js
fi

echo "✅ Dependencies installed!"