# Auto-Login Feature Testing Guide

## ✅ Implementation Complete

**Feature:** One-click auto-login from Admin Organizations page to Enterprise Wallet (Dev/QA only)

**Date:** September 30, 2025
**Status:** Ready for Testing

---

## 🎯 What Was Implemented

### 1. **Backend: Magic Login Token Endpoint** (`/monay-backend-common/src/routes/auth.js`)
- **Endpoint:** `POST /api/auth/dev-login-token`
- **Security:** Only works when `NODE_ENV=development` or `NODE_ENV=qa` or `ENABLE_DEV_LOGIN=true`
- **Functionality:**
  - Generates a valid JWT token for any user by email
  - No password required
  - Associates token with organization ID
  - Logs all dev logins for audit trail

### 2. **Admin: Organizations Page Update** (`/monay-admin/src/app/(dashboard)/organizations/page.tsx`)
- **Updated:** "Test in Enterprise Wallet" menu item
- **Functionality:**
  - Calls `/api/auth/dev-login-token` with `enterprise@monay.com` and organization ID
  - Opens Enterprise Wallet in new tab with token in URL
  - Shows success toast with organization name

### 3. **Enterprise Wallet: Auto-Login** (`/monay-caas/monay-enterprise-wallet/src/app/auth/login/page.tsx`)
- **Added:** `useEffect` hook for auto-login
- **Functionality:**
  - Detects `?token=xxx&org=yyy` in URL
  - Validates token with `/api/auth/me` endpoint
  - Stores token and user data in localStorage
  - Redirects to dashboard automatically
  - Cleans URL parameters after successful login

---

## 🧪 How to Test

### Prerequisites
1. Backend running on port 3001
2. Admin dashboard running on port 3002
3. Enterprise Wallet running on port 3007
4. At least one organization in the database

### Test Steps

#### **Step 1: Start Services**
```bash
# Terminal 1 - Backend
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common
npm run dev

# Terminal 2 - Admin Dashboard
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-admin
npm run dev

# Terminal 3 - Enterprise Wallet
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet
npm run dev
```

#### **Step 2: Access Organizations Page**
1. Open browser: `http://localhost:3002/organizations`
2. Login as admin if needed
3. You should see list of organizations

#### **Step 3: Test Auto-Login**
1. Click the **three-dot menu** (⋮) on any organization card
2. Click **"Test in Enterprise Wallet"**
3. **Expected Behavior:**
   - Toast message: "Opening Enterprise Wallet as [Organization Name]"
   - New tab opens to Enterprise Wallet
   - Loading indicator appears briefly
   - **Automatically redirects to dashboard** (no manual login!)
   - Console shows: `✅ Auto-login successful: enterprise@monay.com`

#### **Step 4: Verify Login**
1. Check Enterprise Wallet dashboard is loaded
2. Check localStorage:
   ```javascript
   localStorage.getItem('auth_token') // Should have JWT
   localStorage.getItem('user') // Should have user object
   ```
3. Check backend console for log:
   ```
   🔓 DEV LOGIN: Generated magic token for enterprise@monay.com (Organization: org-xxx)
   ```

---

## 🐛 Troubleshooting

### Issue: "This endpoint is only available in development and QA environments"
**Solution:**
```bash
# Check .env file in monay-backend-common
cat /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common/.env | grep NODE_ENV

# Should show:
NODE_ENV=development

# Or add:
ENABLE_DEV_LOGIN=true
```

### Issue: "User not found"
**Solution:**
Create the enterprise test user:
```sql
-- Connect to PostgreSQL
psql -U alisaberi -d monay

-- Check if user exists
SELECT id, email, role FROM users WHERE email = 'enterprise@monay.com';

-- If not exists, create:
INSERT INTO users (id, email, password, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'enterprise@monay.com',
  '$2b$10$abcdefghijklmnopqrstuv', -- Hashed password (not needed for dev login)
  'enterprise_admin',
  NOW(),
  NOW()
);
```

### Issue: Enterprise Wallet doesn't auto-login
**Check:**
1. URL has `?token=xxx` parameter
2. Browser console for errors
3. Network tab shows `/api/auth/me` request succeeds
4. Token is stored in localStorage

### Issue: Token expired
**Solution:**
Tokens expire after 24 hours. Click "Test in Enterprise Wallet" again to generate a new token.

---

## 🔒 Security Notes

### ✅ Safe for Dev/QA
- Only works when `NODE_ENV=development` or `NODE_ENV=qa`
- Disabled in production automatically
- All dev logins are logged with `🔓 DEV LOGIN` prefix
- Tokens flagged with `isDevelopmentLogin: true`

### ⚠️ Production Safeguards
```javascript
// Backend check (auth.js:201-203)
const isDevelopment = process.env.NODE_ENV === 'development' ||
                    process.env.NODE_ENV === 'qa' ||
                    process.env.ENABLE_DEV_LOGIN === 'true';

if (!isDevelopment) {
  return res.status(403).json({
    success: false,
    message: 'This endpoint is only available in development and QA environments',
    error: 'DEV_ONLY_ENDPOINT'
  });
}
```

**In production:**
- Set `NODE_ENV=production`
- Never set `ENABLE_DEV_LOGIN=true`
- Endpoint returns 403 Forbidden

---

## 📝 Manual Fallback (If Auto-Login Fails)

You can still manually login:
1. Go to `http://localhost:3007/auth/login`
2. Enter credentials:
   - **Email:** `enterprise@monay.com`
   - **Password:** `password123` (or check database)
3. Click "Sign In"

Or use the "Copy Test Credentials" button:
1. Click three-dot menu on organization
2. Click "Copy Test Credentials"
3. Paste credentials from clipboard

---

## 🎉 Success Criteria

**✅ Feature is working if:**
1. Click "Test in Enterprise Wallet" on organization
2. New tab opens automatically
3. Dashboard appears within 1-2 seconds
4. No manual login required
5. User is logged in as `enterprise@monay.com`
6. Organization context is correct

---

## 📊 Test Results Template

**Date:** _________________
**Tester:** _________________

| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| Click "Test in Enterprise Wallet" | New tab opens | | |
| Auto-login occurs | Dashboard loads automatically | | |
| User is logged in | User email shown in UI | | |
| Token in localStorage | Token exists and is valid | | |
| Backend logs dev login | Console shows 🔓 DEV LOGIN | | |
| Production safeguard | 403 when NODE_ENV=production | | |

**Overall Result:** ☐ Pass ☐ Fail

**Notes:**
_________________________________________________________________
_________________________________________________________________

---

## 🔧 Future Enhancements (Optional)

1. **Organization-Specific Users:**
   - Currently uses generic `enterprise@monay.com`
   - Could create org-specific test users: `org-123@monay.com`

2. **Role Selection:**
   - Allow choosing role: admin, finance, viewer
   - Different permissions for testing

3. **QA Environment Toggle:**
   - UI toggle to enable/disable dev login
   - Admin setting in dashboard

4. **Audit Dashboard:**
   - Show all dev logins in admin panel
   - Track who tested which organization when

---

## 📞 Support

**Questions?**
- Check implementation files listed above
- Review console logs for detailed errors
- Check backend logs: `tail -f monay-backend-common/logs/combined.log`

**Found a bug?**
- Create GitHub issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Console logs
  - Network request/response

---

**Happy Testing! 🚀**
