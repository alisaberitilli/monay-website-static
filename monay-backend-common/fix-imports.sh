#!/bin/bash

# Fix ES module imports in monay-backend-common

echo "Fixing ES module imports..."

# Fix directory imports - add /index.js
find src/routes -name "*.js" -type f -exec sed -i '' \
  -e "s|from '../controllers'|from '../controllers/index.js'|g" \
  -e "s|from '../validations'|from '../validations/index.js'|g" \
  -e "s|from '../middlewares'|from '../middlewares/index.js'|g" \
  -e "s|from '../models'|from '../models/index.js'|g" \
  -e "s|from '../services'|from '../services/index.js'|g" \
  -e "s|from '../repositories'|from '../repositories/index.js'|g" \
  {} \;

# Fix auth-middleware imports
find src/routes -name "*.js" -type f -exec sed -i '' \
  -e "s|from '../middlewares/auth-middleware'|from '../middlewares/auth-middleware.js'|g" \
  {} \;

# Fix other common middleware imports
find src/routes -name "*.js" -type f -exec sed -i '' \
  -e "s|from '../middlewares/validate-middleware'|from '../middlewares/validate-middleware.js'|g" \
  -e "s|from '../middlewares/user-middleware'|from '../middlewares/user-middleware.js'|g" \
  -e "s|from '../middlewares/rate-limiter-middleware'|from '../middlewares/rate-limiter-middleware.js'|g" \
  {} \;

# Fix service imports without .js
find src/routes -name "*.js" -type f -exec sed -i '' \
  -e "s|from '../services/logger'|from '../services/logger.js'|g" \
  -e "s|from '../services/utility'|from '../services/utility.js'|g" \
  -e "s|from '../services/jwt'|from '../services/jwt.js'|g" \
  -e "s|from '../services/email'|from '../services/email.js'|g" \
  {} \;

# Fix config imports
find src/services -name "*.js" -type f -exec sed -i '' \
  -e "s|from '../config/index'|from '../config/index.js'|g" \
  {} \;

echo "Import fixes completed!"
