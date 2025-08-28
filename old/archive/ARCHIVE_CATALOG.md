# Monay Archive Catalog
## Repository of Archived Components During Migration

**Created:** January 25, 2025  
**Purpose:** Track all archived components for easy rollback

---

## Archive Entries

### Template Entry Format
```
## [Component Name]
- **Archived Date:** YYYY-MM-DD HH:MM:SS
- **Original Location:** /path/to/original/
- **New Location:** /path/to/new/ (if moved)
- **Archive Location:** /monay/old/archive/[folder-name]/
- **Reason:** Brief explanation of why archived
- **Dependencies:** List of systems that depended on this
- **Size:** Folder size
- **Files Count:** Number of files
- **Rollback Command:** 
  ```bash
  # Command to restore from archive
  cp -r /monay/old/archive/[folder-name]/* /original/path/
  ```
- **Notes:** Any special considerations

---

## Archived Components

### 1. Admin Dashboard Migration
## monay-wallet-web-react-admin
- **Archived Date:** 2025-08-25 13:15:23
- **Original Location:** /monay-wallet/web/
- **New Location:** /monay-admin/ (for monay-frontend-next)
- **Archive Location:** /monay/old/archive/monay-wallet-web-react-admin-2025-08-25-131523/
- **Reason:** Replaced old React admin with new Next.js admin dashboard
- **Dependencies:** Backend API on port 3001
- **Size:** ~14 MB
- **Files Count:** 448 files
- **Rollback Command:** 
  ```bash
  # Stop new admin
  kill -9 $(lsof -ti:3002)
  # Restore old admin
  cp -r /monay/old/archive/monay-wallet-web-react-admin-2025-08-25-131523/* /monay-wallet/web/
  # Move new admin back
  mv /monay-admin /monay-wallet/web/monay-frontend-next
  ```
- **Notes:** Contains old React-based admin (v0.1.0), replaced with Next.js admin (v2.0.0)

---

## Quick Rollback Reference

### To rollback ALL changes:
```bash
# This will be populated with complete rollback script
```

---

### 2. Backend Services Migration
## monay-wallet-backend
- **Archived Date:** 2025-08-25 17:38:00
- **Original Location:** /monay-wallet/backend/
- **New Location:** /monay-backend-common/
- **Archive Location:** Original was moved, not archived
- **Reason:** Consolidated backend services for all applications
- **Dependencies:** All frontend apps (monay-website, monay-admin, monay-cross-platform/web)
- **Size:** ~45 MB
- **Files Count:** 800+ files
- **Rollback Command:** 
  ```bash
  # Stop new backend
  kill -9 $(lsof -ti:3001)
  # Copy from monay-backend-common back to original location
  cp -r /monay-backend-common/* /monay-wallet/backend/
  # Update all apps to point back to port 5000
  # Start old backend
  cd /monay-wallet/backend && npm run dev
  ```
- **Notes:** Backend consolidated from port 5000 to 3001, all database connections working

---

## Archive Statistics
- **Total Items Archived:** 2
- **Total Size:** ~59 MB
- **Last Update:** August 25, 2025

---

*This catalog is updated automatically during migration. Do not edit manually.*