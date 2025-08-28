# Updated Migration Code Plan
## Backend Consolidation and Admin Dashboard Reorganization

**Version:** 1.0  
**Date:** January 2025  
**Status:** Ready for Execution

---

## Executive Summary

This plan outlines the migration strategy to consolidate the Monay backend services and reorganize the admin dashboard for better maintainability and clarity. All changes will be reversible through a comprehensive archival system.

---

## Port Allocation Strategy

### Production Ports (Fixed)
| Application | Port | Description | Status |
|------------|------|-------------|--------|
| **monay-backend-common** | 3001 | Centralized Backend API | Primary Backend |
| **monay-website** | 3000 | Public Marketing Website | Active |
| **monay-admin** | 3002 | Admin Dashboard | Active |
| **monay-web** | 3003 | User Web Application | Active |
| **monay-mobile-api** | 3004 | Mobile-specific API (if needed) | Reserved |
| **monay-webhook** | 3005 | Webhook Service | Reserved |

### Development/Testing Ports
| Application | Port | Description |
|------------|------|-------------|
| **monay-backend-test** | 4001 | Backend Test Instance |
| **monay-website-dev** | 4000 | Website Development |
| **monay-admin-dev** | 4002 | Admin Development |
| **monay-web-dev** | 4003 | Web App Development |
| **PostgreSQL** | 5432 | Database (Standard) |
| **Redis** | 6379 | Cache (Standard) |

### Mobile App API Endpoints
- **iOS App**: Points to `http://localhost:3001` (development) / `https://api.monay.com` (production)
- **Android App**: Points to `http://10.0.2.2:3001` (emulator) / `https://api.monay.com` (production)

### Port Conflict Resolution
- Each application must check if its assigned port is available before starting
- Use environment variables to override default ports if needed
- Never use random ports in production

---

## Current Structure vs Target Structure

### Current Structure
```
/monay/
├── monay-wallet/
│   ├── backend/                    # Main backend (Port 3001)
│   └── web/
│       ├── [old React admin files]
│       └── monay-frontend-next/    # New Next.js Admin (Port 3002)
├── monay-website/                  # Public site (Port 3000)
├── monay-cross-platform/web/       # User web app
└── [other apps]
```

### Target Structure
```
/monay/
├── monay-backend-common/            # Centralized backend (Port 3001)
├── monay-admin/                     # Admin Dashboard (Port 3002)
├── monay-website/                   # Public site (Port 3000)
├── monay-cross-platform/web/        # User web app
├── old/archive/                     # Archived original versions
│   ├── ARCHIVE_CATALOG.md
│   ├── ROLLBACK_INSTRUCTIONS.md
│   └── [timestamped archives]
└── [other apps]
```

---

## Migration Tasks with Incremental Testing Strategy

### Testing Principles
- **Test after every change** - No moving forward until current step passes
- **Document all test results** - Keep log of what was tested and outcomes
- **Rollback immediately on failure** - If test fails, rollback and fix before retry
- **Use health checks** - Every service must have a /health endpoint
- **Test both positive and negative cases** - Ensure error handling works

## Migration Tasks (33 Steps with Incremental Testing)

### Phase 0: Archive Setup & Testing
1. **Create archive directory structure at /monay/old/archive**
   - Create folders with proper permissions
   - Set up timestamp-based naming convention

2. **Create ARCHIVE_CATALOG.md and ROLLBACK_INSTRUCTIONS.md templates**
   - Template for cataloging each archived item
   - Include metadata: date, reason, dependencies

3. **Test archive directory permissions and access**
   - Verify write permissions
   - Test file creation and retrieval

### Phase 1: Admin Dashboard Migration with Testing
4. **Move monay-wallet/web/monay-frontend-next to /monay-admin (Port 3002)**
   - Preserve all files and configurations
   - Maintain git history if possible

5. **Update monay-admin package.json name to 'monay-admin'**
   - Change name from "monay-frontend-next" to "monay-admin"
   - Update description and repository URL

6. **Test monay-admin startup on port 3002**
   - Run `npm install` and `npm run dev`
   - Verify application loads correctly
   - Check for console errors

7. **Archive old monay-wallet/web React admin to /monay/old/archive**
   - Move with timestamp (e.g., -2025-01-25)
   - Document all dependencies

8. **Document admin migration in ARCHIVE_CATALOG.md**
   - Record original location, new location, archive path
   - Note dependencies and rollback commands

9. **Test rollback of admin dashboard from archive**
   - Execute rollback procedure
   - Verify admin can be restored
   - Re-execute forward migration

### Phase 2: Backend Migration with Testing
10. **Copy monay-wallet/backend to monay-backend-common**
    - Use cp -r to preserve structure
    - Maintain all configurations

11. **Update monay-backend-common package.json configurations**
    - Update name to "monay-backend-common"
    - Update repository references

12. **Test monay-backend-common startup on port 3001**
    - Run `npm install` and `npm run dev`
    - Verify health endpoint responds
    - Check for startup errors

13. **Test database connection from new backend location**
    - Verify PostgreSQL connection
    - Test basic CRUD operations
    - Check migration scripts work

### Phase 3: Update Frontend Applications with Incremental Testing

14. **Update monay-website API endpoint configurations**
    - Update .env file: `NEXT_PUBLIC_API_URL=http://localhost:3001`
    - Update any hardcoded API endpoints
    - Clear build cache if necessary

15. **Test monay-website connection (Port 3000)**
    ```bash
    cd monay-website && npm run dev
    ```
    - Test checklist:
      - [ ] Homepage loads without errors
      - [ ] API health check returns 200
      - [ ] User registration form submits
      - [ ] Login/logout flow works
      - [ ] Stripe integration functional
      - [ ] No console errors in browser
    - If fails: Rollback API endpoint changes

16. **Update monay-admin API configurations**
    - Update .env file: `NEXT_PUBLIC_API_URL=http://localhost:3001`
    - Update API service configurations
    - Update any WebSocket connections

17. **Test monay-admin connection (Port 3002)**
    ```bash
    cd monay-admin && npm run dev
    ```
    - Test checklist:
      - [ ] Admin login successful
      - [ ] Dashboard data loads
      - [ ] User management table populates
      - [ ] Can create/edit/delete records
      - [ ] Role permissions enforced
      - [ ] Real-time notifications work
    - If fails: Check CORS settings on backend

18. **Update monay-cross-platform/web API configurations**
    - Update .env file with new backend URL
    - Update API client configuration
    - Update WebSocket endpoints

19. **Test monay-web connection (Port 3003)**
    ```bash
    cd monay-cross-platform/web && npm run dev
    ```
    - Test checklist:
      - [ ] User authentication works
      - [ ] Wallet balance displays
      - [ ] Transaction history loads
      - [ ] Can send/receive payments
      - [ ] Card management functional
      - [ ] Profile updates save
    - If fails: Verify API authentication tokens

### Phase 4: Backend Archival with Verification

20. **Archive original monay-wallet/backend after all frontend apps verified**
    - Only archive after ALL frontend apps are working
    - Move to `/monay/old/archive/monay-wallet-backend-original-[timestamp]`
    - Keep detailed log of what was archived

21. **Document backend migration in ARCHIVE_CATALOG.md**
    - Record exact timestamp
    - List all dependent applications
    - Include rollback commands

22. **Test backend rollback from archive**
    - Stop monay-backend-common
    - Restore from archive
    - Start original backend
    - Verify all apps still work
    - Re-migrate to monay-backend-common

### Phase 5: Mobile Applications Update & Testing

23. **Update iOS app API configurations**
    - Update development URL to `http://localhost:3001`
    - Update production URL configuration
    - Update Info.plist if needed

24. **Test iOS app connection to new backend**
    ```bash
    cd monay-wallet/ios && pod install
    # Run in Xcode or simulator
    ```
    - Test checklist:
      - [ ] App launches without crash
      - [ ] Login/signup works
      - [ ] Biometric auth functional
      - [ ] Wallet operations work
      - [ ] Push notifications received
      - [ ] NFC functionality (if applicable)
    - If fails: Check iOS ATS settings

25. **Update Android app API configurations**
    - Update base URL in config files
    - Update gradle properties if needed
    - Update network security config

26. **Test Android app connection to new backend**
    ```bash
    cd monay-wallet/android && ./gradlew assembleDebug
    # Run in Android Studio or emulator
    ```
    - Test checklist:
      - [ ] App launches successfully
      - [ ] Authentication works
      - [ ] Fingerprint auth functional
      - [ ] All API calls succeed
      - [ ] Real-time updates work
      - [ ] Google Pay integration (if applicable)
    - If fails: Check network permissions

### Phase 6: Environment & Configuration Updates

27. **Update all environment variable files**
    - Create .env.example for each application
    - Update all .env files with new paths
    - Document all required variables

28. **Test all apps with updated environment variables**
    - Restart all applications
    - Run through basic smoke tests for each
    - Verify no hardcoded values remain

### Phase 7: Documentation Updates

29. **Update CLAUDE.md with final structure**
    - Update application paths to new locations
    - Update port references
    - Verify all information is current

30. **Update DEVELOPMENT_ENVIRONMENT_SETUP.md**
    - Update setup instructions for new structure
    - Update all application locations
    - Update startup commands

### Phase 8: Final Integration Testing

31. **Run full integration test of all applications**
    ```bash
    # Start all services
    cd monay-backend-common && npm run dev &
    cd monay-website && npm run dev &
    cd monay-admin && npm run dev &
    cd monay-cross-platform/web && npm run dev &
    ```
    - Integration test checklist:
      - [ ] All services start without conflicts
      - [ ] Cross-service communication works
      - [ ] Database transactions complete
      - [ ] WebSocket connections stable
      - [ ] No port conflicts
      - [ ] Memory usage acceptable
      - [ ] CPU usage normal
    - Run automated test suite if available

32. **Complete ROLLBACK_INSTRUCTIONS.md with tested procedures**
    - Document each rollback step that was tested
    - Include exact commands
    - Note any issues encountered during testing

33. **Final verification and sign-off**
    - Review all changes made
    - Verify archive is complete
    - Confirm all tests passed
    - Get team approval
    - Create git tag for milestone

### Phase 6: Testing & Verification
24. **Test backend startup and health checks**
    ```bash
    cd /monay/monay-backend-common
    npm run dev
    # Verify http://localhost:3001/health
    ```

25. **Test monay-website connection to new backend**
    - Test API calls
    - Verify authentication

26. **Test monay-admin connection to new backend**
    - Test admin functions
    - Verify data access

27. **Test monay-cross-platform/web connection to new backend**
    - Test user functions
    - Verify wallet operations

28. **Test mobile apps connection to new backend**
    - Test iOS connectivity
    - Test Android connectivity

### Phase 7: Finalization
29. **Create ROLLBACK_INSTRUCTIONS.md for emergency reversion**
    - Step-by-step rollback procedures
    - Include all command sequences

30. **Final review and verification of all changes**
    - Checklist verification
    - Team sign-off

---

## Archive Catalog Structure

Each archived item will be cataloged with:

```markdown
## [Component Name]
- **Archived Date:** YYYY-MM-DD HH:MM:SS
- **Original Location:** /path/to/original/
- **New Location:** /path/to/new/
- **Archive Location:** /monay/old/archive/[name-timestamp]/
- **Reason:** Brief explanation
- **Dependencies:** List of dependent systems
- **Rollback Command:** 
  ```bash
  cp -r /monay/old/archive/[name-timestamp]/* /original/location/
  ```
```

---

## Comprehensive Testing Matrix

### Test Categories by Phase

| Phase | Component | Test Type | Success Criteria | Rollback Trigger |
|-------|-----------|-----------|------------------|-------------------|
| 0 | Archive Setup | Infrastructure | Directory writable | Cannot create files |
| 1 | Admin Migration | Functional | App starts on 3002 | Build fails or runtime error |
| 2 | Backend Migration | Functional | API responds on 3001 | Health check fails |
| 2 | Database | Integration | CRUD operations work | Connection timeout |
| 3 | Frontend Apps | Integration | API calls succeed | 4XX/5XX errors |
| 4 | Archive | Verification | Can restore from archive | Restore fails |
| 5 | Mobile Apps | E2E | Full user flow works | Crash or API failure |
| 6 | Environment | Configuration | All env vars loaded | Missing required vars |
| 8 | Full System | Integration | All apps work together | Any service fails |

### Incremental Test Points

1. **After Each Move/Copy Operation**
   - Verify files exist in new location
   - Check permissions are correct
   - Ensure no files were lost

2. **After Each Configuration Change**
   - Application starts without errors
   - Configuration loads correctly
   - No hardcoded values remain

3. **After Each API Update**
   - Health endpoint responds
   - Authentication works
   - Basic CRUD operations succeed

4. **After Each Archive Operation**
   - Files exist in archive
   - Can read from archive
   - Rollback procedure works

### Test Commands for Each Service

```bash
# Backend Health Check
curl http://localhost:3001/health

# Website Health Check
curl http://localhost:3000/api/health

# Admin Health Check
curl http://localhost:3002/api/health

# Web App Health Check
curl http://localhost:3003/api/health

# Database Connection Test
psql -h localhost -U monay_user -d monay_db -c "SELECT 1"

# Redis Connection Test
redis-cli ping

# Full System Test
for port in 3000 3001 3002 3003; do
  echo "Testing port $port:"
  curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health
done
```

### Critical Test Scenarios

1. **User Registration Flow**
   - Start at monay-website (3000)
   - Submit registration
   - Verify in monay-admin (3002)
   - Login to monay-web (3003)

2. **Transaction Flow**
   - Create transaction in monay-web
   - Verify in backend database
   - Check in admin dashboard
   - Confirm in mobile app

3. **Admin Operations**
   - Login to admin dashboard
   - Modify user permissions
   - Verify changes propagate
   - Check audit logs

---

## Rollback Strategy

### Quick Rollback Commands

#### Rollback Backend
```bash
# Stop new backend
cd /monay/monay-backend-common && npm stop

# Restore original backend
cp -r /monay/old/archive/monay-wallet-backend-original-*/* /monay/monay-wallet/backend/

# Start original backend
cd /monay/monay-wallet/backend && npm run dev
```

#### Rollback Admin Dashboard
```bash
# Move admin back
mv /monay/monay-admin /monay/monay-wallet/web/monay-frontend-next

# Restore old React admin if needed
cp -r /monay/old/archive/monay-wallet-web-react-admin-*/* /monay/monay-wallet/web/
```

---

## Safety Measures

1. **No Deletions** - Everything is archived, nothing deleted
2. **Timestamped Archives** - Easy to identify versions
3. **Documentation** - Every change is documented
4. **Testing Phases** - Verify each step before proceeding
5. **Rollback Plan** - Clear instructions for reversal

---

## Success Criteria

- [ ] All applications connect to new backend successfully
- [ ] Admin dashboard accessible at new location
- [ ] No data loss or corruption
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Archive catalog complete
- [ ] Rollback tested and verified

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|-------------------|
| Service Downtime | Perform migration during low-traffic hours |
| Connection Failures | Test each application individually |
| Data Loss | Complete backups before migration |
| Configuration Errors | Document all configuration changes |
| Rollback Needed | Comprehensive archive system in place |

---

## Team Responsibilities

- **DevOps Lead**: Infrastructure and deployment
- **Backend Team**: Backend migration and testing
- **Frontend Team**: Update application configurations
- **QA Team**: Comprehensive testing
- **Documentation**: Update all docs and guides

---

## Timeline

- **Phase 0-1**: 2 hours (Archive setup and admin migration)
- **Phase 2**: 2 hours (Backend migration)
- **Phase 3-4**: 3 hours (Update all apps and configs)
- **Phase 5**: 1 hour (Documentation)
- **Phase 6**: 2 hours (Testing)
- **Phase 7**: 1 hour (Finalization)

**Total Estimated Time**: 11 hours

---

## Commands Reference

### Check Current Structure
```bash
ls -la /monay/monay-wallet/backend/
ls -la /monay/monay-wallet/web/monay-frontend-next/
```

### Create Archive Structure
```bash
mkdir -p /monay/old/archive
touch /monay/old/archive/ARCHIVE_CATALOG.md
touch /monay/old/archive/ROLLBACK_INSTRUCTIONS.md
```

### Move Operations
```bash
# Move admin dashboard
mv /monay/monay-wallet/web/monay-frontend-next /monay/monay-admin

# Copy backend (preserve original)
cp -r /monay/monay-wallet/backend /monay/monay-backend-common

# Archive originals
mv /monay/monay-wallet/backend /monay/old/archive/monay-wallet-backend-original-$(date +%Y-%m-%d)
mv /monay/monay-wallet/web /monay/old/archive/monay-wallet-web-react-admin-$(date +%Y-%m-%d)
```

---

## Post-Migration Checklist

- [ ] Backend running on port 3001
- [ ] Admin dashboard running on port 3002
- [ ] Website running on port 3000
- [ ] All API connections verified
- [ ] Database connections stable
- [ ] Mobile apps connecting
- [ ] Documentation updated
- [ ] Archive catalog complete
- [ ] Team notified of changes
- [ ] Monitoring enabled

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Monay Team | Initial migration plan |

---

*This document should be referenced before and during the migration process. Any deviations should be documented and approved by the team lead.*