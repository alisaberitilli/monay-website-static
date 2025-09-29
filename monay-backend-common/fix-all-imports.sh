#!/bin/bash

echo "🔧 Comprehensive ES Module Fix Script"
echo "====================================="

# 1. Fix syntax errors in p2p-transfer.js
echo "1. Fixing syntax errors in p2p-transfer.js..."
sed -i '' 's/scheduledDate$/scheduledDate }/' src/routes/p2p-transfer.js 2>/dev/null || true

# 2. Fix UUID import syntax (v4: to v4 as)
echo "2. Fixing UUID import syntax..."
find src -name "*.js" -exec sed -i '' 's/import { v4: uuidv4 }/import { v4 as uuidv4 }/g' {} \;

# 3. Fix @solana/web3 to @solana/web3.js
echo "3. Fixing Solana package imports..."
find src -name "*.js" -exec sed -i '' 's/@solana\/web3"/@solana\/web3.js"/g' {} \;
find src -name "*.js" -exec sed -i '' "s/@solana\/web3'/@solana\/web3.js'/g" {} \;

# 4. Add .js extensions to all local imports
echo "4. Adding .js extensions to local imports..."
for file in $(find src -name "*.js"); do
  # Add .js to imports from services
  sed -i '' "s|from '\(\./services/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\./services/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\./services/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\.\./services/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\.\./services/[^']*\)'|from '\1.js'|g" "$file"

  # Add .js to imports from models
  sed -i '' "s|from '\(\./models/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\./models/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\./models/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\.\./models/[^"]*\)"|from "\1.js"|g' "$file"

  # Add .js to imports from controllers
  sed -i '' "s|from '\(\./controllers/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\./controllers/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\./controllers/[^']*\)'|from '\1.js'|g" "$file"

  # Add .js to imports from middlewares
  sed -i '' "s|from '\(\./middlewares/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\./middlewares/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\./middlewares/[^']*\)'|from '\1.js'|g" "$file"

  # Add .js to imports from repositories
  sed -i '' "s|from '\(\./repositories/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\./repositories/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\./repositories/[^']*\)'|from '\1.js'|g" "$file"

  # Add .js to imports from validations
  sed -i '' "s|from '\(\./validations/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\./validations/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\./validations/[^']*\)'|from '\1.js'|g" "$file"

  # Add .js to imports from routes
  sed -i '' "s|from '\(\./routes/[^']*\)'|from '\1.js'|g" "$file"
  sed -i '' 's|from "\(\./routes/[^"]*\)"|from "\1.js"|g' "$file"
  sed -i '' "s|from '\(\.\./routes/[^']*\)'|from '\1.js'|g" "$file"

  # Fix double .js.js
  sed -i '' 's/\.js\.js/\.js/g' "$file"
done

# 5. Fix Sequelize CommonJS imports
echo "5. Fixing Sequelize CommonJS imports..."
for file in $(grep -r "import { Op" src --include="*.js" -l 2>/dev/null); do
  echo "  Fixing $file"
  # Replace import { Op } from 'sequelize' with CommonJS compatible pattern
  sed -i '' "s/import { Op } from 'sequelize';/import pkg from 'sequelize';\nconst { Op } = pkg;/g" "$file"
  sed -i '' "s/import { Op, Sequelize } from 'sequelize';/import pkg from 'sequelize';\nconst { Op, Sequelize } = pkg;/g" "$file"
  sed -i '' "s/import { DataTypes } from 'sequelize';/import pkg from 'sequelize';\nconst { DataTypes } = pkg;/g" "$file"
  sed -i '' "s/import { Model, DataTypes } from 'sequelize';/import pkg from 'sequelize';\nconst { Model, DataTypes } = pkg;/g" "$file"
done

# 6. Fix bcrypt typo
echo "6. Fixing bcrypt typos..."
find src -name "*.js" -exec sed -i '' "s/from 'bcryp'/from 'bcrypt'/g" {} \;

# 7. Fix exceljs typo
echo "7. Fixing exceljs typos..."
find src -name "*.js" -exec sed -i '' "s/from 'exce'/from 'exceljs'/g" {} \;

echo ""
echo "✅ All fixes applied!"
