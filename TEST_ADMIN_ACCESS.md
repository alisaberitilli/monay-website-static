# Admin Access Testing Guide
**Backend Status:** ✅ Running on port 3001
**Date:** January 2025

## ✅ Backend Changes Applied

The following fixes have been implemented and the server has been restarted:

1. **Enhanced `requireSuperAdmin` middleware** - Now recognizes platform_admin role
2. **Fixed auth middleware** - Properly sets role field from JWT
3. **Added comprehensive logging** - For debugging authentication issues

## 🧪 Testing Steps

### Step 1: Clear Browser Cache & Re-Login

**IMPORTANT:** You must log out and log back in to get a fresh JWT token with the correct role field.

1. **Open Monay-Admin** (http://localhost:3002)
2. **Open Browser DevTools** → Application/Storage → Local Storage
3. **Delete all keys** (especially `token`, `auth`, `user`)
4. **Refresh page** and login with:
   - Email: `admin@monay.com`
   - Password: `Admin123!@#`

### Step 2: Verify JWT Token Contains Role

After login, check the JWT token:

**In Browser Console:**
```javascript
// Get the token
const token = localStorage.getItem('token');

// Decode it (base64)
const payload = JSON.parse(atob(token.split('.')[1]));

// Check these fields
console.log('Role:', payload.role);          // Should be: platform_admin
console.log('UserType:', payload.userType);  // Should be: admin
console.log('IsAdmin:', payload.isAdmin);    // Should be: true
console.log('Email:', payload.email);        // Should be: admin@monay.com
```

**Expected Output:**
```javascript
{
  role: "platform_admin",
  userType: "admin",
  isAdmin: true,
  email: "admin@monay.com",
  id: "admin-88da2d60-98f1-4161-9329-f51e340f8248",
  ...
}
```

### Step 3: Test Treasury Endpoints

Navigate to the Treasury Dashboard page or make API calls:

**Test 1: Treasury Transactions**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/super-admin/treasury/transactions
```

**Expected:** 200 OK with transaction data

**Test 2: Treasury Wallets**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/super-admin/treasury/wallets
```

**Expected:** 200 OK with wallet data

**Test 3: Revenue Metrics**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/super-admin/treasury/revenue
```

**Expected:** 200 OK with revenue data

### Step 4: Check Backend Logs

**Monitor backend logs** for authentication messages:

```bash
tail -f /tmp/backend-startup.log | grep -E "Auth middleware|requireSuperAdmin"
```

**You should see:**
```
Auth middleware - User authenticated: { email: 'admin@monay.com', role: 'platform_admin', userType: 'admin', isAdmin: true }
requireSuperAdmin: Access granted for user: admin@monay.com role: platform_admin
```

**If you see errors:**
```
requireSuperAdmin: Access denied for user: { email: '...', role: undefined, ... }
```
→ JWT token doesn't have role field - re-login to get fresh token

## 🔍 Troubleshooting

### Issue: Still Getting 403 Errors

**Cause:** Old JWT token without role field

**Solution:**
1. Logout completely
2. Clear browser storage
3. Login again to get new JWT
4. Verify new token has `role: "platform_admin"`

### Issue: Backend Logs Show "Access Denied"

**Check these fields in the log:**
```javascript
{ email, role, userType, isAdmin }
```

**If role is undefined:**
- Check database: User record should have `role='platform_admin'`
- Run: `psql -U alisaberi -d monay -c "SELECT id, email, role FROM users WHERE email='admin@monay.com';"`

**If userType is not 'admin':**
- Should still work due to role check, but indicates JWT issue

### Issue: Endpoints Return 404 Not Found

**Cause:** Routes not mounted correctly

**Check:**
```bash
curl http://localhost:3001/api/super-admin/platform/overview
```

**If 404:**
- Verify routes are registered in `/src/routes/index.js`
- Check route order (earlier routes take precedence)

## 📊 Test Matrix

| Endpoint | Expected Status | Notes |
|----------|----------------|-------|
| `/api/super-admin/platform/overview` | 200 OK | Platform metrics |
| `/api/super-admin/treasury/transactions` | 200 OK | Treasury transactions |
| `/api/super-admin/treasury/wallets` | 200 OK | Treasury wallets |
| `/api/super-admin/treasury/revenue` | 200 OK | Revenue metrics |
| `/api/super-admin/circle/wallets` | 200 OK | Circle wallets |
| `/api/super-admin/tempo/status` | 200 OK | Tempo provider status |
| `/api/roles/platform_admin/permissions` | 200 OK | Role permissions |
| `/api/admin/user-profile/:userId` | 200 OK | User profile (any user) |

## 🔐 Security Verification

### Platform Admin (Port 3002) - Should Have Access
- ✅ All super-admin endpoints
- ✅ All admin endpoints
- ✅ Cross-tenant queries
- ✅ Platform-wide data

### Enterprise Admin (Port 3007) - Should NOT Have Access
- ❌ Super-admin endpoints
- ❌ Other tenants' data
- ✅ Own organization data only

### Consumer (Port 3003) - Should NOT Have Access
- ❌ Any admin endpoints
- ❌ Other users' data
- ✅ Personal data only

## 🎯 Success Criteria

✅ Platform admin can login successfully

✅ JWT token contains `role: "platform_admin"`

✅ All treasury endpoints return 200 OK

✅ Backend logs show "Access granted"

✅ No 403 Forbidden errors

✅ Admin portal displays data correctly

## 📝 Quick Test Script

Save this as `test-admin-access.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Admin Access..."
echo ""

# Login and get token
echo "1. Attempting admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@monay.com","password":"Admin123!@#"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "Token (first 50 chars): ${TOKEN:0:50}..."
echo ""

# Decode JWT payload
echo "2. Decoding JWT token..."
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null)
echo "Role: $(echo $PAYLOAD | jq -r '.role')"
echo "UserType: $(echo $PAYLOAD | jq -r '.userType')"
echo "Email: $(echo $PAYLOAD | jq -r '.email')"
echo ""

# Test endpoints
echo "3. Testing endpoints..."

echo "  → Treasury Transactions..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/super-admin/treasury/transactions)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
fi

echo "  → Treasury Wallets..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/super-admin/treasury/wallets)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
fi

echo "  → Revenue Metrics..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/super-admin/treasury/revenue)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
fi

echo ""
echo "✅ Admin access test complete!"
```

**Run with:**
```bash
chmod +x test-admin-access.sh
./test-admin-access.sh
```

## 🎉 Expected Final State

After following all steps:

1. **Backend:** Running on port 3001 with updated middleware
2. **Admin Portal:** Can access all treasury and admin endpoints
3. **JWT Token:** Contains correct `role` field
4. **Logs:** Show "Access granted" messages
5. **No 403 errors:** All endpoints return data successfully

---

**Last Updated:** January 2025
**Status:** Ready for Testing
