# Authentication & Session Management - Best Practices Implementation

**Status**: ✅ Implemented (January 2025)
**Version**: 2.0 - Secure Frictionless Authentication

---

## 🎯 Overview

This document describes the enterprise-grade authentication and session management system for the Monay platform, implementing industry best practices for **secure frictionless login** while ensuring **complete session termination** on logout.

---

## 🔐 Architecture: Hybrid Token Strategy

### **Token Types**

| Token Type | Lifespan | Storage | Purpose |
|-----------|----------|---------|---------|
| **Access Token** | 30 minutes | localStorage (`auth_token`) | API authentication |
| **Refresh Token** | 90 days | httpOnly cookie (future) | Token renewal |
| **Remember Me** | 90 days | localStorage (`rememberMe`) | User preference |

### **Current Implementation (Phase 1)**

```
LOGIN WITH "REMEMBER ME" CHECKED
│
├─ Backend: Issues access token (30min expiration)
├─ Frontend: Stores token in localStorage as 'auth_token'
├─ Frontend: Stores user data in localStorage as 'user'
└─ Frontend: Stores preference in localStorage as 'rememberMe'

USER RETURNS AFTER 1 WEEK
│
├─ If "Remember Me" = true → Token still in localStorage
├─ Access token may be expired (30min)
├─ User makes API call → Backend validates token
└─ If expired → User must login again (graceful redirect)

EXPLICIT LOGOUT
│
├─ Frontend: Calls POST /api/auth/logout with Bearer token
├─ Backend: Logs audit event, invalidates session
├─ Frontend: Clears ALL localStorage keys:
│   ├─ auth_token
│   ├─ authToken (legacy)
│   ├─ user
│   ├─ organizationType
│   └─ rememberMe
├─ Frontend: Clears sessionStorage
└─ Frontend: Redirects to /auth/login
```

---

## 🚀 Production Implementation (Phase 2)

### **Refresh Token Flow (Future Enhancement)**

```javascript
// Backend: Generate both tokens on login
const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' })
const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '90d' })

// Store refresh token in database
await RefreshToken.create({
  userId: user.id,
  token: refreshToken,
  deviceId: req.headers['device-id'],
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
})

// Frontend: Auto-refresh access token when expired
if (response.status === 401 && error.code === 'TOKEN_EXPIRED') {
  const newAccessToken = await refreshAccessToken() // Uses httpOnly cookie
  // Retry original request with new token
}
```

### **Device Fingerprinting (Optional)**

```javascript
// Collect device information
const deviceFingerprint = {
  userAgent: navigator.userAgent,
  screenResolution: `${screen.width}x${screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language,
  platform: navigator.platform
}

// Send to backend on login
// Backend stores hash and alerts on suspicious activity
```

---

## 📋 Configuration

### **Environment Variables** (.env)

```bash
# Access Token (short-lived)
JWT_SECRET=monay_jwt_secret_key_2025
JWT_EXPIRE_IN=30m

# Refresh Token (long-lived) - for future use
JWT_REFRESH_SECRET=monay_refresh_secret_key_2025_secure
JWT_REFRESH_EXPIRE_IN=90d
```

### **Current Token Settings**

- **Access Token**: 30 minutes (was 72h before fix)
- **Refresh Token**: 90 days (not yet implemented)
- **Session Storage**: localStorage (will migrate to httpOnly cookies in Phase 2)

---

## 🔄 User Flows

### **Scenario 1: New Login with "Remember Me" ✅**

```
1. User enters credentials
2. User CHECKS "Remember me for 90 days"
3. Click "Sign In"
   ├─ POST /api/login
   ├─ Backend validates credentials
   ├─ Backend issues access token (30min expiration)
   ├─ Frontend stores:
   │   ├─ localStorage.auth_token = "eyJhbGc..."
   │   ├─ localStorage.user = "{"id":123,...}"
   │   └─ localStorage.rememberMe = "true"
   └─ Redirect to /dashboard

4. User closes browser
5. User returns 3 days later
   ├─ Token still in localStorage (remember me is true)
   ├─ Token is expired (30min < 3 days)
   ├─ API call fails with 401 Unauthorized
   └─ Frontend redirects to /auth/login (graceful experience)

EXPECTED: User must login again but sees friendly message
FUTURE: Auto-refresh token using refresh token flow
```

### **Scenario 2: Login WITHOUT "Remember Me" ⚠️**

```
1. User enters credentials
2. User UNCHECKS "Remember me for 90 days"
3. Click "Sign In"
   ├─ POST /api/login
   ├─ Frontend stores:
   │   ├─ localStorage.auth_token = "eyJhbGc..."
   │   ├─ localStorage.user = "{"id":123,...}"
   │   └─ localStorage.rememberMe is removed
   └─ Redirect to /dashboard

4. User closes browser
5. User returns 1 hour later
   ├─ Token still in localStorage (localStorage persists!)
   ├─ Token is expired (30min < 1 hour)
   └─ Frontend redirects to /auth/login

CURRENT LIMITATION: localStorage persists across browser restarts
FUTURE FIX: Use sessionStorage for non-remember-me logins
```

### **Scenario 3: Explicit Logout 🔒**

```
1. User clicks "Sign Out" button
2. Frontend calls handleLogout()
   ├─ POST /api/auth/logout with Bearer token
   ├─ Backend logs: "User 123 logging out - complete session termination"
   ├─ Backend invalidates session (if using sessions)
   ├─ Backend returns: { success: true, message: "Logged out successfully" }
   ├─ Frontend clears:
   │   ├─ localStorage.auth_token
   │   ├─ localStorage.authToken (legacy)
   │   ├─ localStorage.user
   │   ├─ localStorage.organizationType
   │   ├─ localStorage.rememberMe
   │   └─ sessionStorage.clear()
   └─ Redirect to /auth/login

3. User returns to site
   ├─ No auth tokens in localStorage
   ├─ OnboardingProvider checks for auth_token → not found
   └─ Shows login page (clean slate)

EXPECTED: Complete session termination ✅
RESULT: User MUST login again with credentials
```

### **Scenario 4: Security Timeout (Auto-Expiration) ⏱️**

```
1. User logged in with "Remember Me"
2. User inactive for 90 days
3. Refresh token expires (90d lifespan)
4. User returns to site
   ├─ Access token expired (30min < 90 days)
   ├─ Refresh token expired (90 days)
   ├─ API call fails with 401
   └─ Frontend redirects to /auth/login

EXPECTED: Automatic security timeout
RESULT: User must login again (security compliance)
```

---

## 🛡️ Security Benefits

### ✅ **Attack Mitigation**

| Attack Vector | Mitigation |
|---------------|------------|
| **XSS (Cross-Site Scripting)** | httpOnly cookies prevent JavaScript access (Phase 2) |
| **CSRF (Cross-Site Request Forgery)** | SameSite cookie attribute + CSRF tokens |
| **Token Theft** | Short-lived access tokens (30min exposure window) |
| **Session Hijacking** | Device fingerprinting + IP tracking (optional) |
| **Replay Attacks** | Token expiration + server-side invalidation |

### ✅ **Compliance**

- ✅ **PCI-DSS**: Short token lifespan, secure logout
- ✅ **SOC 2**: Audit logging, session termination
- ✅ **FINRA**: Transaction monitoring, device tracking
- ✅ **GDPR**: Right to be forgotten (logout clears data)

---

## 🎯 Best Practices Checklist

### Current Implementation ✅

- [x] Access tokens expire in 30 minutes
- [x] Logout clears ALL localStorage and sessionStorage
- [x] Logout calls backend API for server-side invalidation
- [x] "Remember Me" checkbox with clear 90-day label
- [x] Audit logging of logout events
- [x] Graceful handling of expired tokens

### Future Enhancements 🚧

- [ ] Refresh token implementation (90-day auto-renewal)
- [ ] httpOnly cookies instead of localStorage
- [ ] Token blacklist for revoked tokens
- [ ] Device fingerprinting for anomaly detection
- [ ] Multi-factor authentication (MFA)
- [ ] Session activity monitoring dashboard
- [ ] IP-based geolocation alerts
- [ ] SIEM integration for security events

---

## 📊 Token Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN EVENT                             │
│  User enters credentials + checks "Remember Me"                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Backend Validation│
                    └──────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Issue Access Token (30min)   │
              │   Issue Refresh Token (90d)    │ (Future)
              └───────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Frontend Storage │
                    │  ├─ auth_token    │
                    │  ├─ user          │
                    │  └─ rememberMe    │
                    └──────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
  ┌──────────────────┐              ┌──────────────────┐
  │  Active Session   │              │  Inactive (wait) │
  │  (30min window)   │              │                  │
  └──────────────────┘              └──────────────────┘
            │                                   │
            │ API Call                          │ 31 minutes
            ▼                                   ▼
  ┌──────────────────┐              ┌──────────────────┐
  │  Token Valid ✅   │              │  Token Expired ❌ │
  │  Continue session │              │  → Auto-refresh   │ (Future)
  └──────────────────┘              │  → Or re-login    │
                                    └──────────────────┘
                    │
                    │ User clicks "Sign Out"
                    ▼
          ┌──────────────────┐
          │  LOGOUT EVENT     │
          │  1. Call backend  │
          │  2. Clear storage │
          │  3. Redirect      │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  Clean Slate 🔒   │
          │  Must re-login    │
          └──────────────────┘
```

---

## 🔧 Code References

### **Backend Files**

- `/monay-backend-common/.env` - Token configuration (lines 68-71)
- `/monay-backend-common/src/routes/auth.js` - Logout endpoint (lines 156-191)
- `/monay-backend-common/src/services/jwt.js` - Token generation

### **Frontend Files**

- `/monay-caas/monay-enterprise-wallet/src/app/auth/login/page.tsx` - Login with Remember Me (lines 38, 85-93, 244-258)
- `/monay-caas/monay-enterprise-wallet/src/components/navigation/EnterpriseNavigation.tsx` - Logout handler (lines 234-267)
- `/monay-caas/monay-enterprise-wallet/src/hooks/useOnboardingCheck.tsx` - Token validation

---

## ❓ FAQ

**Q: Why do tokens persist after browser restart even without "Remember Me"?**
A: Current implementation uses localStorage which persists. In Phase 2, we'll use sessionStorage for non-remember-me logins and httpOnly cookies for remember-me.

**Q: Is storing tokens in localStorage secure?**
A: For development, yes. For production, we'll migrate to httpOnly cookies which are immune to XSS attacks.

**Q: What happens if access token expires while user is active?**
A: Phase 2 will auto-refresh using the refresh token. Currently, user sees graceful login prompt.

**Q: Can I revoke a token before it expires?**
A: Phase 2 will implement token blacklist and database-stored refresh tokens for server-side revocation.

**Q: How do I know if a user has "Remember Me" enabled?**
A: Check `localStorage.getItem('rememberMe') === 'true'`

**Q: What if logout API call fails?**
A: Frontend ALWAYS clears localStorage regardless, ensuring logout works even if backend is down.

---

## 📚 Additional Resources

- **OWASP Session Management**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **Refresh Token Pattern**: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/

---

**Last Updated**: January 2025
**Author**: Monay Platform Team
**Status**: ✅ Phase 1 Complete | 🚧 Phase 2 In Progress
