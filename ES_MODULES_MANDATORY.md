# 🚨 ES MODULES MANDATORY - HARD RULE 🚨

## Enforcement Date: September 28, 2025

## THIS IS NON-NEGOTIABLE

### ⛔ ABSOLUTE REQUIREMENT
**Every single Monay project MUST use ES Modules. No exceptions. Period.**

## The Rule
```json
// REQUIRED in EVERY package.json
{
  "type": "module"
}
```

## ✅ ALWAYS USE ES MODULES
```javascript
// CORRECT - ES Modules
import express from 'express';
import { Router } from 'express';
import db from './models/index.js';
export default app;
export { function1, function2 };
```

## ❌ NEVER USE COMMONJS
```javascript
// WRONG - CommonJS (FORBIDDEN)
const express = require('express');
const { Router } = require('express');
module.exports = app;
exports.function = () => {};
```

## Project Status - ALL CONVERTED ✅

| Project | Location | Module System | Status |
|---------|----------|--------------|--------|
| monay-backend-common | `/monay-backend-common` | ES Modules | ✅ CONVERTED |
| monay-admin | `/monay-admin` | ES Modules | ✅ CONVERTED |
| monay-enterprise-wallet | `/monay-caas/monay-enterprise-wallet` | ES Modules | ✅ CONVERTED |
| monay-consumer-wallet | `/monay-cross-platform/web` | ES Modules | ✅ CONVERTED |

## Config Files
If a config file MUST use CommonJS (rare cases), rename it:
- `next.config.js` → `next.config.cjs`
- `jest.config.js` → `jest.config.cjs`
- `postcss.config.js` → `postcss.config.cjs`

## Import Rules
1. **Always include .js extension for local files**
   ```javascript
   import utils from './utils.js';  // ✅ CORRECT
   import utils from './utils';     // ❌ WRONG
   ```

2. **CommonJS modules compatibility**
   ```javascript
   // For CommonJS packages
   import pkg from 'commonjs-package';
   const { namedExport } = pkg;
   ```

3. **Dynamic imports**
   ```javascript
   const module = await import('./module.js');
   ```

## Testing
All test files must also use ES modules:
```javascript
// ✅ CORRECT test file
import { describe, it, expect } from '@jest/globals';
import myFunction from '../src/function.js';

// ❌ WRONG test file
const { describe, it, expect } = require('@jest/globals');
const myFunction = require('../src/function');
```

## Scripts
All scripts must use ES modules:
```javascript
#!/usr/bin/env node
// ✅ CORRECT script
import fs from 'fs';
import path from 'path';

// ❌ WRONG script
const fs = require('fs');
const path = require('path');
```

## CI/CD Enforcement
The CI/CD pipeline will:
1. Check for `"type": "module"` in all package.json files
2. Scan for any `require()` statements
3. Scan for any `module.exports` patterns
4. **FAIL the build if CommonJS is detected**

## Developer Guidelines
1. **New files**: Always use ES modules
2. **Existing files**: Already converted - maintain ES modules
3. **Third-party packages**: Use dynamic imports if needed
4. **Node.js version**: Ensure Node.js 20+ for full ES module support

## Common Patterns

### Importing JSON
```javascript
import packageJson from './package.json' assert { type: 'json' };
```

### __dirname and __filename
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Environment Variables
```javascript
import dotenv from 'dotenv';
dotenv.config();
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| `Cannot use import statement outside a module` | Add `"type": "module"` to package.json |
| `ERR_MODULE_NOT_FOUND` | Add `.js` extension to import |
| `Named export not found` | Use default import for CommonJS packages |
| `Cannot find module` | Check file extension is `.js` |

## Enforcement
- **Code Reviews**: Will reject any CommonJS code
- **Pre-commit Hooks**: Will block CommonJS patterns
- **CI/CD**: Will fail builds with CommonJS
- **Monitoring**: Automated scans for CommonJS patterns

## Why ES Modules?
1. **Standards Compliance**: ES modules are the ECMAScript standard
2. **Performance**: Better tree-shaking and optimization
3. **Future-Proof**: CommonJS will eventually be deprecated
4. **Consistency**: One module system across all projects
5. **Modern**: Aligns with modern JavaScript best practices

## Contact
For questions about ES modules migration:
- Check this document first
- Review CLAUDE.md for project conventions
- Contact: Technical Lead

---
**Remember: ES Modules are MANDATORY. No exceptions. No debates. This is the way.**