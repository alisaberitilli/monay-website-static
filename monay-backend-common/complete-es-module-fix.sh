#!/bin/bash

echo "🔧 Complete ES Module Fix"
echo "========================="

# 1. Fix bridge-transfer-service.js (db already declared)
echo "1. Fixing bridge-transfer-service.js..."
sed -i '' 's/const { db, sequelize } = db;/const { sequelize } = db;/g' src/services/bridge-transfer-service.js

# 2. Fix lodash imports
echo "2. Fixing lodash imports..."
for file in $(grep -r "import { .* } from 'lodash'" src --include="*.js" -l); do
  echo "  Fixing $file"
  sed -i '' "s/import { \(.*\) } from 'lodash';/import _ from 'lodash';\nconst { \1 } = _;/g" "$file"
done

# 3. Really fix the auth-middleware User import
echo "3. Ensuring auth-middleware.js is fixed..."
if grep -q "import { User }" src/middlewares/auth-middleware.js; then
  sed -i '' "s/import { User } from '.*models\/index.js';/import db from '..\/models\/index.js';\nconst { User } = db;/g" src/middlewares/auth-middleware.js
fi

# 4. Fix any remaining transaction-repository.js Sequelize imports
echo "4. Fixing transaction-repository.js..."
if grep -q 'import { Op }' src/repositories/transaction-repository.js; then
  sed -i '' 's/import { Op } from "sequelize";/import pkg from "sequelize";\nconst { Op } = pkg;/g' src/repositories/transaction-repository.js
fi

echo "✅ Complete!"
