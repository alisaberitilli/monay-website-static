# Monay Platform - Comprehensive Authentication & Authorization Guide

**Version:** 2.0
**Last Updated:** January 2025
**Status:** Production-Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Backend Authentication System](#backend-authentication-system)
4. [Frontend Applications](#frontend-applications)
5. [Middleware & Permission Systems](#middleware--permission-systems)
6. [JWT Token Structure](#jwt-token-structure)
7. [User Roles & Permissions](#user-roles--permissions)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Test Credentials](#test-credentials)

---

## Executive Summary

The Monay platform uses a **centralized authentication system** with a single backend API (port 3001) serving three frontend applications:

- **Monay-Admin** (Port 3002) - Super Admin Manager
- **Monay-Consumer-Web** (Port 3003) - Consumer Super App
- **Monay-Enterprise-Wallet** (Port 3007) - Enterprise Wallet Management

All applications use **JWT Bearer Token** authentication with role-based access control (RBAC) and permission-based authorization.

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├──────────────────┬──────────────────┬──────────────────────┤
│  Monay-Admin     │  Consumer Web    │  Enterprise Wallet   │
│  Port: 3002      │  Port: 3003      │  Port: 3007          │
│  Role: Admin     │  Role: Consumer  │  Role: Enterprise    │
└────────┬─────────┴────────┬─────────┴─────────┬────────────┘
         │                  │                   │
         │   JWT Bearer Token Authentication    │
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                ┌───────────▼───────────┐
                │   Backend API Server  │
                │   Port: 3001          │
                │   Single Source       │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │  PostgreSQL Database  │
                │  Port: 5432           │
                │  Tables: users,       │
                │  organizations, etc.  │
                └───────────────────────┘
```

### Key Principles

1. **Centralized Backend**: Single backend API handles all authentication
2. **JWT Tokens**: Stateless authentication with bearer tokens
3. **Role-Based Access**: Users assigned roles (admin, consumer, enterprise, etc.)
4. **Permission-Based Authorization**: Fine-grained access control
5. **Multi-Tenant Support**: Tenant isolation and organization context
6. **Shared Database**: All applications use single PostgreSQL database

---

## Backend Authentication System

### Backend Server Configuration

**Location**: `/monay-backend-common/`
**Port**: 3001
**Framework**: Express.js with ES Modules
**Database**: PostgreSQL (port 5432)
**Cache**: Redis (port 6379)

### Main Authentication Routes

**File**: `/monay-backend-common/src/routes/auth.js`

#### Endpoint Summary

| Endpoint | Method | Purpose | Authentication Required | Used By |
|----------|--------|---------|------------------------|---------|
| `/api/auth/login` | POST | User/Admin login (wrapper) | No | Consumer, Admin, Enterprise |
| `/api/login` | POST | Direct user account login | No | Backend internal |
| `/api/admin/login` | POST | Direct admin login | No | Backend internal, Admin legacy |
| `/api/auth/login/organization` | POST | Organization-specific enterprise login | No | Enterprise Wallet |
| `/api/auth/logout` | POST | User logout | Yes | All apps |
| `/api/auth/me` | GET | Get current user info | Yes | All apps |
| `/api/auth/user` | GET | Get current user with token | Yes | All apps |
| `/api/account/me` | GET | Get account details | Yes | Consumer |
| `/api/auth/signup` | POST | User registration (wrapper) | No | All apps |
| `/api/user/signup` | POST | Direct user registration | No | Consumer, Backend internal |
| `/api/auth/register/consumer` | POST | Consumer registration | No | Consumer |
| `/api/auth/register/business` | POST | Business registration | No | Consumer |
| `/api/auth/register/enterprise` | POST | Enterprise user registration | No | Enterprise |
| `/api/auth/register/organization` | POST | Create enterprise organization | No | Enterprise |

**Note**: The `/api/auth/*` endpoints are wrappers that provide a cleaner API interface and handle routing internally to the appropriate controllers (`/api/login`, `/api/admin/login`, etc.).

### Login Flow Details

#### 1. Consumer/User Login Flow

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "phoneNumber": "+13016821633",
  "password": "Demo@123",
  "deviceType": "WEB"
}
```

**Or email-based**:
```json
{
  "email": "ali@monay.com",
  "password": "Demo@123",
  "deviceType": "WEB"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-cd06a4f0-b5fd-4c33-b0a2-79a518d62567",
    "email": "ali@monay.com",
    "firstName": "Ali",
    "lastName": "Saberi",
    "mobile": "+13016821633",
    "role": "basic_consumer",
    "userType": "user",
    "isEmailVerified": true,
    "isMobileVerified": true,
    "kycStatus": "pending",
    "walletBalance": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### 2. Admin Login Flow

**Endpoint**: `POST /api/auth/login` (auto-detects admin email)

**Detection Logic**: If email ends with `@monay.com` → Admin login

**Request**:
```json
{
  "email": "admin@monay.com",
  "password": "Admin@123",
  "deviceType": "WEB"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "admin-uuid",
    "email": "admin@monay.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "platform_admin",
    "userType": "admin",
    "permissions": [...],
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### 3. Enterprise/Organization Login Flow

**Endpoint**: `POST /api/auth/login/organization`

**Request**:
```json
{
  "email": "john@enterprise.com",
  "password": "Enterprise@123",
  "organizationId": "org-uuid-123" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Organization login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "john@enterprise.com",
      "role": "member",
      "permissions": {...}
    },
    "organization": {
      "id": "org-uuid-123",
      "name": "Acme Corporation",
      "wallet_type": "enterprise",
      "feature_tier": "premium"
    },
    "tenant": {
      "id": "tenant-uuid",
      "code": "acme_corp",
      "name": "Acme Corporation Tenant",
      "type": "organization"
    },
    "enterprise_wallet_access": true
  }
}
```

### Authentication Middleware

**Files**:
- `/monay-backend-common/src/middleware-app/auth-middleware.js` - Main auth
- `/monay-backend-common/src/middleware-app/tenant-middleware.js` - Tenant context
- `/monay-backend-common/src/middleware-app/resource-access-middleware.js` - Role checks

#### Auth Middleware Flow

```javascript
// 1. Extract JWT token from Authorization header
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

// 2. Verify JWT token
const decoded = jwt.verify(token, config.jwtSecret);

// 3. Load user from database
const user = await models.User.findByPk(decoded.id);

// 4. Set req.user with full context
req.user = {
  id: user.id,
  email: user.email,
  role: user.role,
  userType: isAdmin ? 'admin' : 'user',
  isAdmin: isAdmin,
  tenant_id: user.tenant_id,
  permissions: decoded.permissions || {},
  organization_id: decoded.organization_id,
  // ... more fields
};

// 5. Extract tenant context
await extractTenantContext(req, res, () => {});
```

#### Development Bypass

For development/testing, the auth middleware supports a bypass:

```javascript
// In development mode with header 'x-admin-bypass: true'
if (process.env.NODE_ENV === 'development' &&
    req.headers['x-admin-bypass'] === 'true') {
  req.user = {
    id: 'user-cd06a4f0-b5fd-4c33-b0a2-79a518d62567',
    email: 'test@monay.com',
    isAdmin: false,
    userType: 'user',
    role: 'basic_consumer'
  };
  return next();
}
```

### Resource Access Middleware

**File**: `/monay-backend-common/src/middleware-app/resource-access-middleware.js`

Checks if user's `userType` is allowed to access a route:

```javascript
const resourceAccessGuard = userTypeArr => async (req, res, next) => {
  const { user } = req;

  if (~userTypeArr.indexOf(user.userType)) {
    next(); // User has access
  } else {
    // 400 Bad Request - INVALID_USER_ACCESS
    const error = new Error('INVALID_USER_ACCESS');
    error.status = HttpStatus.BAD_REQUEST;
    error.message = `Resource can not be accessed by [${user.userType}]`;
    next(error);
  }
};

// Usage example
router.get('/admin/user',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  userController.getUserListForAdmin
);
```

### Controllers

**File**: `/monay-backend-common/src/controllers/account-controller.js`

#### Key Functions

1. **`userAccountLogin(req, res, next)`** - Consumer/user login
2. **`login(req, res, next)`** - Admin login
3. **`logout(req, res, next)`** - User logout
4. **`signup(req, res, next)`** - User registration

---

## Frontend Applications

### 1. Monay-Admin (Port 3002)

#### Purpose
Super Admin Manager for controlling both Monay-CaaS and Monay Consumer Wallet.

#### Authentication Service

**File**: `/monay-admin/src/services/auth.service.ts`

```typescript
class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Auto-detect admin vs user
    const endpoint = email === 'admin@monay.com'
      ? '/api/admin/login'
      : '/api/login';

    const response = await axiosInstance.post(endpoint, {
      email,
      password,
      deviceType: 'WEB'
    });

    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;

      // Store tokens
      localStorage.setItem('monay_admin_token', accessToken);
      localStorage.setItem('monay_admin_refresh_token', refreshToken);
      localStorage.setItem('monay_admin_user', JSON.stringify(user));

      return { success: true, data: response.data.data };
    }

    return response.data;
  }

  getToken(): string | null {
    return localStorage.getItem('monay_admin_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
```

#### Axios Configuration

**File**: `/monay-admin/src/lib/axios.ts`

```typescript
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Automatic token injection
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('monay_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('monay_admin_refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(
            'http://localhost:3001/api/auth/refresh',
            { refreshToken }
          );

          const { accessToken } = response.data.data;
          localStorage.setItem('monay_admin_token', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - redirect to login
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);
```

#### State Management

**File**: `/monay-admin/src/store/auth.ts`

Uses **Zustand** with persistence:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
          set({
            user: result.data.user,
            token: result.data.accessToken,
            isAuthenticated: true
          });
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false });
      },

      checkAuth: () => {
        const token = authService.getToken();
        const user = authService.getUser();
        set({
          token,
          user,
          isAuthenticated: !!token
        });
      }
    }),
    { name: 'auth-storage' }
  )
);
```

#### Login Page

**File**: `/monay-admin/src/app/(auth)/login/page.tsx`

Features:
- Email + Password login
- Test credentials displayed
- Error handling with toast notifications
- Redirect to dashboard on success

Test Credentials:
- **Admin**: `admin@monay.com` / `Admin@123`
- **User**: `john@example.com` / `Admin@123`

#### Environment

**File**: `/monay-admin/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

### 2. Monay-Consumer-Web (Port 3003)

#### Purpose
Consumer Super App - The First U.S.-Centric Super App combining financial services with lifestyle features.

#### Authentication Context

**File**: `/monay-cross-platform/web/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Support both phone and email login
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data));
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### API Service

**File**: `/monay-cross-platform/web/lib/api-service.ts`

```typescript
class ApiService {
  private baseUrl = 'http://localhost:3001/api';

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') ||
           localStorage.getItem('authToken');
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'device-id': this.getDeviceId(),
      'device-model': 'Web Browser',
      'os-version': 'Web',
      'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    return response.json();
  }
}
```

#### API Endpoints Configuration

**File**: `/monay-cross-platform/web/lib/api-config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  API_PREFIX: '/api',
  TIMEOUT: 30000
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/admin/login',
    SIGNUP: '/user/signup',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update-profile',
    CHANGE_PASSWORD: '/user/change-password'
  },
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    TRANSFER: '/wallet/transfer'
  }
};
```

#### Login Page

**File**: `/monay-cross-platform/web/app/auth/login/page.tsx`

Features:
- Phone number login (primary method)
- Email login (alternative)
- Mock account support for testing
- PostgreSQL database account support
- Remember me functionality
- Password visibility toggle

Test Credentials:
1. **Mock Account**: `+15551234567` / `demo123`
2. **Database Account**: `+13016821633` / `Demo@123`
3. **Email Login**: `ali@monay.com` / `Demo@123`

#### Environment

**File**: `/monay-cross-platform/web/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_USE_BETTER_AUTH=true
NODE_ENV=development
```

---

### 3. Monay-Enterprise-Wallet (Port 3007)

#### Purpose
Enterprise Wallet Management for Monay-CaaS platform - token creation, treasury operations, and organization management.

#### API Service

**File**: `/monay-caas/monay-enterprise-wallet/src/services/api.service.ts`

```typescript
class ApiService {
  private baseURL = 'http://localhost:3001/api';
  private tokenKey = 'token';
  private refreshTokenKey = 'refreshToken';

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });

    this.setTokens(response.token, response.refreshToken);
    return response;
  }

  async organizationLogin(email: string, password: string, organizationId?: string) {
    const response = await this.request('/auth/login/organization', {
      method: 'POST',
      body: JSON.stringify({ email, password, organizationId }),
      skipAuth: true
    });

    this.setTokens(response.data.token, response.data.refreshToken);
    return response;
  }

  setTokens(token: string, refreshToken: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (!options.skipAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401 && !options.skipAuth) {
      // Token expired - try refresh
      await this.refreshAccessToken();
      // Retry original request
      return this.request(endpoint, options);
    }

    return response.json();
  }
}
```

#### API Client (Alternative)

**File**: `/monay-caas/monay-enterprise-wallet/src/lib/api-client.ts`

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true
});

// Token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(
            'http://localhost:3001/api/auth/refresh',
            { refreshToken }
          );
          localStorage.setItem('authToken', response.data.token);
          error.config.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient.request(error.config);
        } catch {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

#### Login Page

**File**: `/monay-caas/monay-enterprise-wallet/src/app/auth/login/page.tsx`

Features:
- Multi-method authentication tabs:
  - **Password**: Traditional email + password
  - **Federal**: Login.gov, ID.me integration
  - **Biometric**: Fingerprint, Face ID (future)
- Enterprise SSO support (placeholder)
- Organization context selector

Direct API Call Example:
```typescript
const handlePasswordLogin = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailValue,
        password: passwordValue
      })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      router.push('/dashboard');
    } else {
      setError(data.error || 'Login failed');
    }
  } catch (error) {
    setError('Network error. Please try again.');
  }
};
```

#### Environment

**File**: `/monay-caas/monay-enterprise-wallet/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Monay Enterprise Wallet
NEXT_PUBLIC_WALLET_TYPE=enterprise
NODE_ENV=development
```

---

## Middleware & Permission Systems

### Middleware Architecture

The backend uses a **dual middleware system** for better organization:

#### Core Middleware (`/middleware-core/`)
System-critical, security-sensitive implementations (4 files):
- Authentication enforcement
- Security boundaries
- Audit logging
- Core system functions

#### Application Middleware (`/middleware-app/`)
Application business logic and features (27 files):
- Resource access control
- Tenant isolation
- Payment processing
- User management
- And more...

### Key Middleware Functions

#### 1. Auth Middleware

**File**: `/monay-backend-common/src/middleware-app/auth-middleware.js`

```javascript
const authenticateToken = async (req, res, next) => {
  // 1. Development bypass
  if (process.env.NODE_ENV === 'development' &&
      req.headers['x-admin-bypass'] === 'true') {
    req.user = { id: '...', email: 'test@monay.com', ... };
    return next();
  }

  // 2. Extract token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token is missing'
    });
  }

  try {
    // 3. Verify JWT
    const decoded = jwt.verify(token, config.jwtSecret);

    // 4. Load user from database
    const user = await models.User.findByPk(decoded.id || decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // 5. Set req.user with full context
    const isAdmin = user.email === 'admin@monay.com' ||
                    user.role === 'platform_admin';

    req.user = {
      ...decoded,
      id: user.id,
      email: user.email,
      isAdmin,
      userType: isAdmin ? 'admin' : (decoded.userType || 'user'),
      role: decoded.role || user.role,
      tenant_id: user.tenant_id,
      organization_id: decoded.organization_id,
      permissions: decoded.permissions || {}
    };

    // 6. Extract tenant context
    await extractTenantContext(req, res, () => {});

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};
```

#### 2. Resource Access Middleware

**File**: `/monay-backend-common/src/middleware-app/resource-access-middleware.js`

```javascript
const resourceAccessGuard = userTypeArr => async (req, res, next) => {
  const { user } = req;

  try {
    // Check if user's userType is in allowed array
    if (~userTypeArr.indexOf(user.userType)) {
      next(); // Access granted
    } else {
      // Access denied
      const error = new Error('INVALID_USER_ACCESS');
      error.status = HttpStatus.BAD_REQUEST;
      error.message = `Resource can not be accessed by [${user.userType}]`;
      next(error);
    }
  } catch (error) {
    error.status = HttpStatus.UNAUTHORIZED;
    next(error);
  }
};

// Usage example
router.get('/admin/user',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  userController.getUserListForAdmin
);
```

#### 3. Tenant Middleware

**File**: `/monay-backend-common/src/middleware-app/tenant-middleware.js`

```javascript
export const extractTenantContext = async (req, res, next) => {
  // Priority 1: Organization-specific tenant (enterprise wallet)
  if (req.user.organization_id) {
    const org = await models.Organization.findByPk(req.user.organization_id);
    if (org && org.tenant_id) {
      req.tenant = await models.Tenant.findByPk(org.tenant_id);
      req.tenantId = org.tenant_id;
      return next ? next() : null;
    }
  }

  // Priority 2: User's direct tenant
  if (req.user.tenant_id) {
    req.tenant = await models.Tenant.findByPk(req.user.tenant_id);
    req.tenantId = req.user.tenant_id;
    return next ? next() : null;
  }

  // Priority 3: Header-based tenant (for admin operations)
  const tenantCode = req.headers['x-tenant-code'] || req.headers['tenant-code'];
  if (tenantCode) {
    req.tenant = await models.Tenant.findOne({ where: { tenant_code: tenantCode } });
    req.tenantId = req.tenant?.id;
    return next ? next() : null;
  }

  // No tenant context - OK for platform-level operations
  return next ? next() : null;
};
```

#### 4. Validate Middleware

**File**: `/monay-backend-common/src/middleware-app/validate-middleware.js`

```javascript
const validateMiddleware = ({ schema }) => {
  return async (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          success: false,
          errors,
          message: 'Validation failed'
        });
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};
```

### Middleware Usage Examples

#### Example 1: Admin-Only Route

```javascript
import { Router } from 'express';
import middlewares from '../middleware-app/index.js';
import controllers from '../controllers/index.js';

const router = Router();
const { authMiddleware, resourceAccessMiddleware } = middlewares;
const { adminController } = controllers;

router.get('/admin/dashboard',
  authMiddleware,                              // 1. Verify JWT token
  resourceAccessMiddleware(['admin']),         // 2. Check user is admin
  adminController.getDashboard                 // 3. Execute controller
);
```

#### Example 2: User Route with Validation

```javascript
router.post('/user/update-profile',
  authMiddleware,                              // 1. Verify JWT token
  validateMiddleware({
    schema: userValidator.profileUpdateSchema  // 2. Validate request body
  }),
  userController.updateProfile                 // 3. Execute controller
);
```

#### Example 3: Multi-Role Route

```javascript
router.get('/transaction/history',
  authMiddleware,                              // 1. Verify JWT token
  resourceAccessMiddleware([                   // 2. Check user role
    'admin',
    'subadmin',
    'user'
  ]),
  transactionController.getHistory             // 3. Execute controller
);
```

#### Example 4: Tenant-Isolated Route

```javascript
router.get('/organization/members',
  authMiddleware,                              // 1. Verify JWT token
  resourceAccessMiddleware(['admin', 'user']), // 2. Check user role
  // Tenant context already extracted in authMiddleware
  organizationController.getMembers            // 3. Execute with tenant context
);
```

---

## Email & Mobile Verification System

### Overview

The Monay platform implements a **multi-factor verification system** that requires users to verify their email address and/or mobile number before accessing certain features. Verification requirements vary by user type and login method.

### Verification Status Fields

**Database Fields** (in `users` table):
- `email_verified` (boolean) - Maps to `isEmailVerified` in code
- `mobile_verified` (boolean) - Maps to `isMobileVerified` in code
- `phone_verified` (boolean) - Maps to `isPhoneVerified` in code (for landline phones)

**Model Definition** (`/monay-backend-common/src/models/User.js`):
```javascript
isEmailVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  field: 'email_verified'
},
isMobileVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  field: 'mobile_verified'
},
isPhoneVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  field: 'phone_verified'
}
```

### Verification Requirements by User Type

| User Type | Email Verification | Mobile Verification | Required Before |
|-----------|-------------------|---------------------|-----------------|
| **Consumer (Basic)** | ✅ **Required** | ✅ **Required** | Login, Transactions |
| **Consumer (Verified)** | ✅ **Required** | ✅ **Required** | Login, Transactions |
| **Consumer (Premium)** | ✅ **Required** | ✅ **Required** | Login, Transactions |
| **Admin** | ✅ **Required** | ❌ Optional | Login |
| **Enterprise User** | ✅ **Required** | ⚠️ Conditional | Login, Multi-sig operations |
| **Merchant** | ✅ **Required** | ✅ **Required** | Login, Payment acceptance |

### Login Flow with Verification Checks

#### 1. Email Login Flow (Admin/Enterprise)

**Flow**: `Login Request → Password Check → Email Verification Check → Grant Access or Redirect`

**Backend Logic** (`/monay-backend-common/src/repositories/account-repository.js:140-142`):
```javascript
if (isEmail) {
  if (!user.isEmailVerified) {
    return { status: 'verify_email' };
  }
}
```

**Response When Email Not Verified**:
```json
{
  "success": false,
  "data": {},
  "status": "verify_email",
  "message": "Please verify your email address"
}
```

**Frontend Handling**:
```typescript
if (response.status === 'verify_email') {
  // Redirect to email verification page
  router.push('/auth/verify-email');
}
```

#### 2. Mobile/Phone Login Flow (Consumer)

**Flow**: `Login Request → Password Check → Mobile Verification Check → Grant Access or Redirect`

**Backend Logic** (`/monay-backend-common/src/repositories/account-repository.js:144-146`):
```javascript
if (!isEmail) { // Phone/mobile login
  if (!user.isMobileVerified) {
    return { status: 'verify_phone_number' };
  }
}
```

**Response When Mobile Not Verified**:
```json
{
  "success": false,
  "data": {},
  "status": "verify_phone_number",
  "message": "Please verify your phone number"
}
```

**Frontend Handling**:
```typescript
if (response.status === 'verify_phone_number') {
  // Redirect to mobile verification page
  router.push('/auth/verify-mobile');
}
```

### Verification API Endpoints

#### Authenticated Endpoints (Require JWT Token)

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/verification/send-mobile-otp` | POST | Yes | Send OTP to user's mobile |
| `/api/verification/verify-mobile-otp` | POST | Yes | Verify mobile OTP |
| `/api/verification/send-email-otp` | POST | Yes | Send OTP to user's email |
| `/api/verification/verify-email-otp` | POST | Yes | Verify email OTP |
| `/api/verification/resend-otp` | POST | Yes | Resend OTP (mobile or email) |

#### Unauthenticated Endpoints (For Signup/Login Flow)

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/verification/send-otp-unauthenticated` | POST | No | Send OTP during signup |
| `/api/verification/verify-otp-unauthenticated` | POST | No | Verify OTP during signup |

### Email Verification Flow

#### Step 1: Send Email OTP

**Endpoint**: `POST /api/verification/send-email-otp`

**Request** (Authenticated):
```json
{
  // No body needed - uses JWT token to identify user
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "a**@example.com",
    "expiresIn": 300
  }
}
```

**Backend Implementation** (`/monay-backend-common/src/routes/verification.js:119-164`):
```javascript
router.post('/verification/send-email-otp', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findByPk(userId);

    if (!user.email) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No email address found for this user'
      });
    }

    if (user.isEmailVerified) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email address is already verified'
      });
    }

    const userName = `${user.firstName} ${user.lastName}`.trim() || 'User';
    const result = await nudgeOTPService.sendEmailOTP(user.email, userId, userName);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: result
    });
  } catch (error) {
    // Error handling...
  }
});
```

#### Step 2: Verify Email OTP

**Endpoint**: `POST /api/verification/verify-email-otp`

**Request**:
```json
{
  "otp": "123456"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "isEmailVerified": true
  }
}
```

**Response (Invalid OTP)**:
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**Backend Implementation** (`/monay-backend-common/src/routes/verification.js:167-222`):
```javascript
router.post('/verification/verify-email-otp', authMiddleware, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    const user = await models.User.findByPk(userId);

    // Verify OTP
    const result = nudgeOTPService.verifyOTP('email', user.email, userId, otp);

    if (result.success) {
      // Update user's email verification status
      await user.update({ isEmailVerified: true });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Email verified successfully',
        data: { isEmailVerified: true }
      });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    // Error handling...
  }
});
```

### Mobile Verification Flow

#### Step 1: Send Mobile OTP

**Endpoint**: `POST /api/verification/send-mobile-otp`

**Request** (Authenticated):
```json
{
  // No body needed - uses JWT token to identify user
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully to your mobile number",
  "data": {
    "mobile": "***-***-1633",
    "expiresIn": 300
  }
}
```

**Backend Implementation** (`/monay-backend-common/src/routes/verification.js:14-58`):
```javascript
router.post('/verification/send-mobile-otp', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findByPk(userId);

    if (!user.mobile) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No mobile number found for this user'
      });
    }

    if (user.isMobileVerified) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Mobile number is already verified'
      });
    }

    // Send OTP
    const result = await nudgeOTPService.sendSMSOTP(user.mobile, userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      data: {
        mobile: user.mobile.replace(/(\d{3})(\d{3})(\d{4})/, '***-***-$3'),
        ...result
      }
    });
  } catch (error) {
    // Error handling...
  }
});
```

#### Step 2: Verify Mobile OTP

**Endpoint**: `POST /api/verification/verify-mobile-otp`

**Request**:
```json
{
  "otp": "123456"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Mobile number verified successfully",
  "data": {
    "isMobileVerified": true
  }
}
```

**Backend Implementation** (`/monay-backend-common/src/routes/verification.js:61-116`):
```javascript
router.post('/verification/verify-mobile-otp', authMiddleware, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    const user = await models.User.findByPk(userId);

    // Verify OTP
    const result = nudgeOTPService.verifyOTP('sms', user.mobile, userId, otp);

    if (result.success) {
      // Update user's mobile verification status
      await user.update({ isMobileVerified: true });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Mobile number verified successfully',
        data: { isMobileVerified: true }
      });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    // Error handling...
  }
});
```

### Unauthenticated Verification (Signup Flow)

For users who need to verify during signup (before login):

#### Send OTP (Unauthenticated)

**Endpoint**: `POST /api/verification/send-otp-unauthenticated`

**Request**:
```json
{
  "identifier": "+13016821633",
  "type": "sms"
}
```

Or for email:
```json
{
  "identifier": "user@example.com",
  "type": "email"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "identifier": "***-***-1633",
    "expiresIn": 300,
    "userId": "user-uuid-123"
  }
}
```

#### Verify OTP (Unauthenticated)

**Endpoint**: `POST /api/verification/verify-otp-unauthenticated`

**Request**:
```json
{
  "identifier": "+13016821633",
  "type": "sms",
  "otp": "123456",
  "userId": "user-uuid-123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "verified": true,
    "userId": "user-uuid-123"
  }
}
```

### Resend OTP

**Endpoint**: `POST /api/verification/resend-otp`

**Request**:
```json
{
  "type": "sms"
}
```

Or:
```json
{
  "type": "email"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "expiresIn": 300
  }
}
```

**Rate Limiting**:
- Max 3 resend attempts per 15 minutes
- OTP expires after 5 minutes
- New OTP invalidates previous OTP

### Verification Status Checks in Code

#### Backend Model - Virtual Field

**File**: `/monay-backend-common/src/models/User.js:357-369`

```javascript
allVerificationsComplete: {
  type: DataTypes.VIRTUAL,
  get() {
    const requirements = this.get('requiredVerifications') || [];

    for (const req of requirements) {
      if (req === 'email' && !this.get('isEmailVerified')) return false;
      if (req === 'mobile' && !this.get('isMobileVerified')) return false;
      if (req === 'phone' && !this.get('isPhoneVerified')) return false;
    }

    return true;
  }
}
```

#### Frontend - API Config

**Consumer Wallet** (`/monay-cross-platform/web/lib/api-config.ts`):
```typescript
export const API_ENDPOINTS = {
  VERIFICATION: {
    SEND_MOBILE_OTP: '/verification/send-mobile-otp',
    VERIFY_MOBILE_OTP: '/verification/verify-mobile-otp',
    SEND_EMAIL_OTP: '/verification/send-email-otp',
    VERIFY_EMAIL_OTP: '/verification/verify-email-otp',
    RESEND_OTP: '/verification/resend-otp',
    SEND_OTP_UNAUTHENTICATED: '/verification/send-otp-unauthenticated',
    VERIFY_OTP_UNAUTHENTICATED: '/verification/verify-otp-unauthenticated',
  }
};
```

### Complete Registration Flow (Consumer)

```
1. User Signup
   ↓
2. Account Created (isEmailVerified: false, isMobileVerified: false)
   ↓
3. Send Email OTP → User receives email
   ↓
4. Verify Email OTP → isEmailVerified: true
   ↓
5. Send Mobile OTP → User receives SMS
   ↓
6. Verify Mobile OTP → isMobileVerified: true
   ↓
7. Setup MPIN (6-digit PIN)
   ↓
8. Complete KYC (ID verification)
   ↓
9. Access Granted → Full platform access
```

### Verification Enforcement Points

#### 1. Login Endpoint

**File**: `/monay-backend-common/src/repositories/account-repository.js:138-147`

Checks verification status before allowing login:
- **Email login**: Requires `isEmailVerified = true`
- **Mobile login**: Requires `isMobileVerified = true`

#### 2. Transaction Endpoints

Many transaction endpoints check verification status:
```javascript
if (!req.user.isMobileVerified || !req.user.isEmailVerified) {
  return res.status(HttpStatus.BAD_REQUEST).json({
    success: false,
    message: 'Please complete account verification'
  });
}
```

#### 3. Profile Changes

Changing email or mobile requires re-verification:
```javascript
// Change email
await user.update({
  email: newEmail,
  isEmailVerified: false // Must verify new email
});

// Send new OTP to new email
await nudgeOTPService.sendEmailOTP(newEmail, userId, userName);
```

### Testing Verification

**Test Scenarios**:

1. **Email Verification (Consumer)**:
```bash
# Login (should fail if not verified)
POST /api/auth/login
Body: { "email": "test@example.com", "password": "Test@123" }
Response: { "status": "verify_email" }

# Send OTP
POST /api/verification/send-email-otp
Headers: { "Authorization": "Bearer <token>" }

# Verify OTP
POST /api/verification/verify-email-otp
Headers: { "Authorization": "Bearer <token>" }
Body: { "otp": "123456" }

# Login again (should succeed)
POST /api/auth/login
Body: { "email": "test@example.com", "password": "Test@123" }
Response: { "success": true, "data": { "token": "..." } }
```

2. **Mobile Verification (Consumer)**:
```bash
# Login with phone (should fail if not verified)
POST /api/auth/login
Body: { "phoneNumber": "+13016821633", "password": "Demo@123" }
Response: { "status": "verify_phone_number" }

# Send OTP
POST /api/verification/send-mobile-otp
Headers: { "Authorization": "Bearer <token>" }

# Verify OTP
POST /api/verification/verify-mobile-otp
Headers: { "Authorization": "Bearer <token>" }
Body: { "otp": "123456" }

# Login again (should succeed)
POST /api/auth/login
Body: { "phoneNumber": "+13016821633", "password": "Demo@123" }
Response: { "success": true, "data": { "token": "..." } }
```

### Nudge OTP Service Integration

The platform uses **Nudge CRM** for OTP delivery:

**File**: `/monay-backend-common/src/services/nudge-otp.js`

**Key Methods**:
- `sendSMSOTP(mobile, userId)` - Send SMS OTP via Nudge
- `sendEmailOTP(email, userId, userName)` - Send email OTP via Nudge
- `verifyOTP(type, identifier, userId, otp)` - Verify OTP
- `resendOTP(type, identifier, userId, userName)` - Resend OTP

**Configuration**:
```javascript
const NUDGE_CONFIG = {
  apiUrl: process.env.NUDGE_API_URL || 'https://api.getnudge.com',
  apiKey: process.env.NUDGE_API_KEY,
  otpExpiry: 300, // 5 minutes
  otpLength: 6
};
```

### Security Considerations

1. **OTP Expiry**: All OTPs expire after 5 minutes
2. **Rate Limiting**: Max 3 OTP requests per 15 minutes per user
3. **Single Use**: Each OTP can only be used once
4. **Invalidation**: Requesting new OTP invalidates previous one
5. **Brute Force Protection**: Max 5 failed verification attempts
6. **Account Lockout**: Account locked for 30 minutes after 5 failed attempts

### Database Updates on Verification

When verification succeeds, multiple fields are updated:

```sql
UPDATE users SET
  email_verified = TRUE,
  verification_code = NULL,
  code_spent_time = NULL,
  updated_at = NOW()
WHERE id = 'user-uuid';
```

Or for mobile:
```sql
UPDATE users SET
  mobile_verified = TRUE,
  verification_otp = NULL,
  otp_spent_time = NULL,
  updated_at = NOW()
WHERE id = 'user-uuid';
```

### Error Codes Reference

| Error | Status Code | Meaning |
|-------|-------------|---------|
| `verify_email` | 200 (with data) | Email needs verification |
| `verify_phone_number` | 200 (with data) | Mobile needs verification |
| `EMAIL_NOT_VERIFIED` | 400 | Email not yet verified |
| `PHONE_NOT_VERIFIED` | 400 | Phone not yet verified |
| `INVALID_OTP` | 400 | OTP is incorrect |
| `OTP_EXPIRED` | 400 | OTP has expired |
| `OTP_ALREADY_USED` | 400 | OTP was already used |
| `TOO_MANY_ATTEMPTS` | 429 | Rate limit exceeded |

---

## MPIN (Mobile PIN) Authentication

### Overview

**MPIN** (Mobile Personal Identification Number) is a 6-digit security PIN used as an additional authentication layer for sensitive operations in the Monay platform. It provides quick, secure access without requiring full password authentication for every transaction.

### MPIN Usage by Application

| Application | MPIN Required | Purpose | When Used |
|------------|---------------|---------|-----------|
| **Consumer Wallet** | ✅ **Yes** (Mandatory) | Transaction security | Payment transfers, card operations, sensitive account changes |
| **Admin Dashboard** | ❌ **No** (Optional) | Not implemented | N/A - Admins use full password authentication |
| **Enterprise Wallet** | ⚠️ **Conditional** | Multi-signature approvals | Large transactions, treasury operations |

### MPIN Flow for Consumer Wallet

#### 1. MPIN Setup (First-Time)

**Endpoint**: `POST /api/auth/setup-mpin` or `POST /api/setup-mpin`

**Trigger**: After user completes initial signup and email verification

**Request**:
```json
{
  "mpin": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "MPIN setup successful",
  "data": {
    "mpin_set": true
  }
}
```

**Frontend Flow** (Consumer Wallet):
```
User Login → Email Verification → MPIN Setup → KYC → Dashboard
```

**File**: `/monay-cross-platform/web/app/auth/mpin-setup/page.tsx`

```typescript
const handleMPINSetup = async () => {
  try {
    const response = await authService.setupMPIN(mpin);

    if (response.success) {
      // MPIN successfully set, proceed to KYC
      router.push('/auth/kyc');
    }
  } catch (error) {
    console.error('MPIN setup failed:', error);
  }
};
```

#### 2. MPIN Verification (Transactions)

**Endpoint**: `POST /api/user/verify-mpin`

**When Required**:
- P2P money transfers
- Bill payments
- Card operations (activate, deactivate, view PIN)
- Changing sensitive settings (password, email, phone)
- Withdrawals to bank accounts

**Request**:
```json
{
  "mpin": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "data": [],
  "message": "PIN verified successfully"
}
```

**Failure Response**:
```json
{
  "success": false,
  "data": null,
  "message": "MPIN does not match"
}
```

#### 3. Forgot MPIN Flow

**Step 1**: Request OTP

**Endpoint**: `POST /api/user/forgot-pin`

**Request**:
```json
{
  "mobile": "+13016821633"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent to your registered mobile number"
}
```

**Step 2**: Verify OTP

**Endpoint**: `POST /api/user/verify-pin-otp`

**Request**:
```json
{
  "mobile": "+13016821633",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Step 3**: Reset MPIN

**Endpoint**: `POST /api/user/reset-pin`

**Request**:
```json
{
  "mobile": "+13016821633",
  "newMpin": "654321",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "PIN reset successfully"
}
```

#### 4. Change MPIN (When User Remembers Old PIN)

**Endpoint**: `POST /api/user/change-pin`

**Request**:
```json
{
  "oldMpin": "123456",
  "newMpin": "654321"
}
```

**Response**:
```json
{
  "success": true,
  "message": "PIN changed successfully"
}
```

### MPIN Security Features

#### 1. Storage

- **Backend**: MPIN is hashed using bcrypt (same as passwords) before storage in `users.mpin` column
- **Frontend**: Never stored in localStorage or sessionStorage
- **Transmission**: Always sent over HTTPS with JWT authentication

#### 2. Validation Rules

- **Length**: Exactly 6 digits
- **Format**: Numeric only (0-9)
- **Restrictions**:
  - Cannot be all same digits (e.g., "111111", "222222")
  - Cannot be sequential (e.g., "123456", "654321")
  - Cannot match last 3 MPINs (rotation policy)

#### 3. Rate Limiting

- **Max Attempts**: 5 failed attempts
- **Lockout Duration**: 30 minutes after 5 failed attempts
- **Account Lock**: After 10 failed attempts in 24 hours, account requires admin unlock

#### 4. MPIN vs Password

| Feature | MPIN | Password |
|---------|------|----------|
| **Length** | 6 digits | 8+ characters |
| **Complexity** | Numeric only | Alphanumeric + special chars |
| **Purpose** | Quick transaction auth | Full account access |
| **Usage** | Frequently (every transaction) | Infrequently (login, settings) |
| **Storage** | Bcrypt hashed | Bcrypt hashed |
| **Reset** | OTP via SMS/Email | Email link |
| **Expiry** | Never (unless changed) | Never (unless changed) |

### MPIN API Endpoints Reference

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/auth/setup-mpin` | POST | Yes | Initial MPIN setup (wrapper) |
| `/api/setup-mpin` | POST | Yes | Initial MPIN setup (direct) |
| `/api/user/verify-mpin` | POST | Yes | Verify MPIN for transaction |
| `/api/user/change-pin` | POST | Yes | Change MPIN (requires old PIN) |
| `/api/user/forgot-pin` | POST | Yes | Request OTP for PIN reset |
| `/api/user/verify-pin-otp` | POST | Yes | Verify OTP for PIN reset |
| `/api/user/reset-pin` | POST | Yes | Reset PIN with OTP |

### Consumer Wallet MPIN Integration

**File**: `/monay-cross-platform/web/lib/api-config.ts`

```typescript
export const API_ENDPOINTS = {
  USER: {
    // ... other endpoints
    CHANGE_PIN: '/user/change-pin',
    FORGOT_PIN: '/user/forgot-pin',
    VERIFY_PIN_OTP: '/user/verify-pin-otp',
    VERIFY_MPIN: '/user/verify-mpin',
    RESET_PIN: '/user/reset-pin',
    SET_PIN: '/user/set-pin',
  }
};
```

### Admin Dashboard MPIN Status

**MPIN is NOT used in the Admin Dashboard** because:
1. Admins have full platform access and use strong password authentication
2. Admin operations are audit-logged (don't need per-transaction MPIN)
3. Admin accounts have stricter password requirements and 2FA (future)
4. MPIN is designed for high-frequency consumer transactions

**File**: `/monay-admin/src/services/auth.service.ts` includes `setupMPIN()` method, but it's primarily for **testing consumer flows** from the admin interface, not for admin user authentication.

### Enterprise Wallet MPIN Status

**MPIN is CONDITIONALLY used** for:
1. **Multi-Signature Approvals**: When multiple approvers needed for large transactions
2. **Treasury Operations**: Minting/burning tokens, large transfers
3. **Quick Approvals**: For authorized users to approve pending operations

**Not required for**:
- Regular logins (password-based)
- Read-only operations
- Organization management

**Implementation Status**: Partial (MPIN setup page exists at `/monay-caas/monay-enterprise-wallet/src/app/auth/mpin-setup/page.tsx` but full integration pending)

### Database Schema

**Table**: `users`

**MPIN Column**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  mpin VARCHAR(255),  -- Bcrypt hashed 6-digit PIN
  mpin_attempts INT DEFAULT 0,
  mpin_locked_until TIMESTAMP,
  mpin_updated_at TIMESTAMP,
  -- ... other columns
);
```

### Backend Implementation

**File**: `/monay-backend-common/src/controllers/user-controller.js`

**Key Functions**:

1. **`verifyMpin(req, res, next)`** - Verify MPIN for transactions (line 547)
2. **`changeMpin(req, res, next)`** - Change MPIN with old PIN verification
3. **`forgotMpin(req, res, next)`** - Initiate forgot PIN flow with OTP
4. **`resetMpin(req, res, next)`** - Reset PIN after OTP verification

**File**: `/monay-backend-common/src/routes/user.js`

```javascript
// MPIN routes
router.post('/user/verify-pin-otp',
  authMiddleware,
  validateMiddleware({ schema: userValidator.verifyMpinOtpSchema }),
  accountMiddleware.checkPhoneNumberExists,
  accountMiddleware.checkExpireOtp,
  userController.verifyOtp
);

router.post('/user/verify-mpin',
  authMiddleware,
  validateMiddleware({ schema: userValidator.verifyMpinSchema }),
  userController.verifyMpin
);
```

### Testing MPIN

**Test Credentials** (Consumer Wallet):

| Account | Phone | Password | MPIN |
|---------|-------|----------|------|
| Mock Test User | `+15551234567` | `demo123` | `123456` |
| Database User | `+13016821633` | `Demo@123` | `123456` (after setup) |

**Test Flow**:
```bash
# 1. Login with password
POST http://localhost:3001/api/auth/login
Body: { "phoneNumber": "+13016821633", "password": "Demo@123" }

# 2. Setup MPIN (first time)
POST http://localhost:3001/api/auth/setup-mpin
Headers: { "Authorization": "Bearer <token>" }
Body: { "mpin": "123456" }

# 3. Verify MPIN (for transaction)
POST http://localhost:3001/api/user/verify-mpin
Headers: { "Authorization": "Bearer <token>" }
Body: { "mpin": "123456" }
```

### Best Practices

1. **Always prompt for MPIN** before executing financial transactions
2. **Never log MPIN values** in application logs or error messages
3. **Rate limit MPIN attempts** to prevent brute force attacks
4. **Implement biometric fallback** (fingerprint, Face ID) for better UX
5. **Show masked input** (dots/asterisks) when user enters MPIN
6. **Clear MPIN from memory** immediately after verification
7. **Lock account after multiple failed attempts** and require OTP to unlock

---

## JWT Token Structure

### Token Payload Fields

#### Consumer/User Token

```json
{
  "id": "user-cd06a4f0-b5fd-4c33-b0a2-79a518d62567",
  "user_id": "user-cd06a4f0-b5fd-4c33-b0a2-79a518d62567",
  "email": "ali@monay.com",
  "mobile": "+13016821633",
  "role": "basic_consumer",
  "userType": "user",
  "isAdmin": false,
  "tenant_id": null,
  "permissions": {},
  "iat": 1704067200,
  "exp": 1704153600
}
```

#### Admin Token

```json
{
  "id": "admin-uuid-123",
  "user_id": "admin-uuid-123",
  "email": "admin@monay.com",
  "role": "platform_admin",
  "userType": "admin",
  "isAdmin": true,
  "tenant_id": null,
  "permissions": {
    "users": ["read", "write", "delete"],
    "transactions": ["read", "write"],
    "compliance": ["read", "write"]
  },
  "iat": 1704067200,
  "exp": 1704153600
}
```

#### Enterprise/Organization Token

```json
{
  "id": "user-enterprise-uuid",
  "user_id": "user-enterprise-uuid",
  "email": "john@enterprise.com",
  "username": "john@enterprise.com",
  "organization_id": "org-uuid-123",
  "tenant_id": "tenant-uuid-456",
  "role": "member",
  "userType": "organization",
  "loginType": "enterprise_wallet",
  "permissions": {
    "wallet": ["read", "transfer"],
    "treasury": ["read"]
  },
  "organization": {
    "id": "org-uuid-123",
    "name": "Acme Corporation",
    "wallet_type": "enterprise",
    "feature_tier": "premium"
  },
  "tenant": {
    "id": "tenant-uuid-456",
    "code": "acme_corp",
    "name": "Acme Corporation Tenant",
    "type": "organization"
  },
  "iat": 1704067200,
  "exp": 1704153600
}
```

### Token Expiration

- **Access Token**: 24 hours (configurable)
- **Refresh Token**: 7 days (configurable)

### JWT Secret

**Location**: `/monay-backend-common/src/config/index.js`

```javascript
export default {
  jwtSecret: process.env.JWT_SECRET || 'monay-secret-key-2025',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
};
```

---

## User Roles & Permissions

### User Roles

The platform supports multiple user roles mapped from the database `role` field:

| Database Role | User Type | Description | Applications |
|--------------|-----------|-------------|-------------|
| `platform_admin` | `admin` | Platform administrator | Admin Dashboard |
| `compliance_officer` | `subadmin` | Compliance and KYC management | Admin Dashboard |
| `treasury_manager` | `subadmin` | Treasury and liquidity operations | Admin Dashboard |
| `support_agent` | `subadmin` | Customer support agent | Admin Dashboard |
| `basic_consumer` | `user` | Basic consumer account ($1K daily limit) | Consumer Wallet |
| `verified_consumer` | `user` | Verified consumer ($50K daily limit) | Consumer Wallet |
| `premium_consumer` | `user` | Premium consumer ($250K daily limit) | Consumer Wallet |
| `secondary_user` | `user` | Secondary/child user account | Consumer Wallet |
| `merchant` | `merchant` | Business merchant account | Consumer Wallet |
| `enterprise_admin` | `user` | Enterprise organization administrator | Enterprise Wallet |
| `enterprise_finance` | `user` | Enterprise finance team member | Enterprise Wallet |
| `enterprise_developer` | `user` | Enterprise developer with API access | Enterprise Wallet |

### Permission Model

Permissions are stored in the `role_permissions` table with the following structure:

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES roles(id),
  permission VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Permission Format

```javascript
{
  permission: "manage",      // Permission type
  resource: "users",         // Resource being accessed
  action: "write"            // Action being performed (read/write/delete/*)
}
```

#### Example Permissions

**Platform Admin**:
```json
{
  "users": ["read", "write", "delete"],
  "transactions": ["read", "write", "refund"],
  "compliance": ["read", "write", "approve"],
  "organizations": ["read", "write", "delete"],
  "system": ["read", "write", "configure"]
}
```

**Consumer User**:
```json
{
  "wallet": ["read", "transfer"],
  "transactions": ["read"],
  "profile": ["read", "write"],
  "cards": ["read", "request"]
}
```

**Enterprise Admin**:
```json
{
  "organization": ["read", "write", "invite"],
  "treasury": ["read", "write", "approve"],
  "members": ["read", "write", "remove"],
  "tokens": ["read", "write", "mint", "burn"],
  "reports": ["read", "export"]
}
```

### Checking Permissions

#### Backend

```javascript
// In controller or middleware
function hasPermission(user, permission, resource, action) {
  if (user.isAdmin) return true; // Admin has all permissions

  if (!user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }

  return user.permissions.some(p => {
    const permissionMatch = p.permission === permission;
    const resourceMatch = !resource || p.resource === resource || p.resource === '*';
    const actionMatch = !action || p.action === action || p.action === '*';

    return permissionMatch && resourceMatch && actionMatch;
  });
}

// Usage
if (!hasPermission(req.user, 'manage', 'users', 'write')) {
  return res.status(403).json({
    success: false,
    error: 'Insufficient permissions'
  });
}
```

#### Frontend (Admin)

**File**: `/monay-admin/src/contexts/UserContext.tsx`

```typescript
const hasPermission = (permission: string, resource?: string, action?: string): boolean => {
  if (!user?.permissions || !Array.isArray(user.permissions)) return false;

  return user.permissions.some(p => {
    if (!p || typeof p !== 'object') return false;
    const permissionMatch = p.permission === permission;
    const resourceMatch = !resource || p.resource === resource || p.resource === '*';
    const actionMatch = !action || p.action === action || p.action === '*';

    return permissionMatch && resourceMatch && actionMatch;
  });
};

const isAdmin = (): boolean => {
  return user?.role === 'platform_admin';
};

// Usage in components
const { hasPermission, isAdmin } = useUser();

if (hasPermission('manage', 'users', 'delete')) {
  // Show delete button
}

if (isAdmin()) {
  // Show admin-only features
}
```

---

## API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/login` | POST | No | User/Admin login (auto-detects) |
| `/api/auth/login/organization` | POST | No | Enterprise organization login |
| `/api/admin/login` | POST | No | Admin login (legacy) |
| `/api/login` | POST | No | User login (legacy) |
| `/api/auth/logout` | POST | Yes | User logout |
| `/api/auth/me` | GET | Yes | Get current user info |
| `/api/auth/user` | GET | Yes | Get current user with token |
| `/api/auth/refresh` | POST | No | Refresh access token |
| `/api/auth/signup` | POST | No | User registration |
| `/api/auth/register/consumer` | POST | No | Consumer registration |
| `/api/auth/register/business` | POST | No | Business registration |
| `/api/auth/register/enterprise` | POST | No | Enterprise user registration |
| `/api/auth/register/organization` | POST | No | Create enterprise organization |

### User Management Endpoints

| Endpoint | Method | Auth Required | Roles Allowed | Description |
|----------|--------|---------------|---------------|-------------|
| `/api/admin/user` | GET | Yes | admin, subadmin | Get all users list |
| `/api/admin/user-profile/:userId` | GET | Yes | admin, subadmin | Get user profile |
| `/api/admin/user/:userId/change-status` | PUT | Yes | admin, subadmin | Change user status |
| `/api/user/update-profile` | PUT | Yes | All | Update user profile |
| `/api/user/profile/:userId` | GET | Yes | All | Get user profile |
| `/api/user/context` | GET | Yes | All | Get user context |
| `/api/users` | GET | Yes | admin | Get users with filtering |

### Wallet & Transaction Endpoints

| Endpoint | Method | Auth Required | Roles Allowed | Description |
|----------|--------|---------------|---------------|-------------|
| `/api/wallet/balance` | GET | Yes | All | Get wallet balance |
| `/api/wallet/transactions` | GET | Yes | All | Get transaction history |
| `/api/wallet/transfer` | POST | Yes | All | Transfer funds |
| `/api/user/transaction` | GET | Yes | All | Get user transactions |
| `/api/user/transaction/:id` | GET | Yes | All | Get specific transaction |

### Organization Endpoints

| Endpoint | Method | Auth Required | Roles Allowed | Description |
|----------|--------|---------------|---------------|-------------|
| `/api/organizations` | GET | Yes | admin, user | List organizations |
| `/api/organizations/:id` | GET | Yes | admin, user | Get organization details |
| `/api/organizations/:id/users` | GET | Yes | admin, user | Get organization users |

### Payment Endpoints

| Endpoint | Method | Auth Required | Roles Allowed | Description |
|----------|--------|---------------|---------------|-------------|
| `/api/payment/request` | POST | Yes | All | Create payment request |
| `/api/p2p/transfer` | POST | Yes | All | P2P transfer |
| `/api/card/list` | GET | Yes | All | Get user cards |
| `/api/bank/list` | GET | Yes | All | Get user bank accounts |

---

## Security Best Practices

### Backend Security

1. **JWT Secret Management**
   ```bash
   # Production - use strong secret
   export JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **HTTPS Only in Production**
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (req.header('x-forwarded-proto') !== 'https') {
         res.redirect(`https://${req.header('host')}${req.url}`);
       } else {
         next();
       }
     });
   }
   ```

3. **Rate Limiting**
   ```javascript
   import rateLimit from 'express-rate-limit';

   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 requests per windowMs
     message: 'Too many login attempts, please try again later'
   });

   router.post('/api/auth/login', loginLimiter, accountController.login);
   ```

4. **Helmet for Security Headers**
   ```javascript
   import helmet from 'helmet';
   app.use(helmet());
   ```

5. **CORS Configuration**
   ```javascript
   import cors from 'cors';

   const allowedOrigins = [
     'http://localhost:3002', // Admin
     'http://localhost:3003', // Consumer
     'http://localhost:3007'  // Enterprise
   ];

   app.use(cors({
     origin: (origin, callback) => {
       if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true
   }));
   ```

6. **SQL Injection Prevention**
   ```javascript
   // Use parameterized queries
   await models.User.findOne({
     where: { email: email } // Sequelize auto-escapes
   });

   // Or use raw queries with replacements
   await sequelize.query(
     'SELECT * FROM users WHERE email = :email',
     {
       replacements: { email: email },
       type: sequelize.QueryTypes.SELECT
     }
   );
   ```

7. **Password Hashing**
   ```javascript
   import bcrypt from 'bcrypt';

   const hashPassword = async (password) => {
     const saltRounds = 10;
     return await bcrypt.hash(password, saltRounds);
   };

   const verifyPassword = async (password, hash) => {
     return await bcrypt.compare(password, hash);
   };
   ```

### Frontend Security

1. **Token Storage**
   - **DO**: Store tokens in `localStorage` (acceptable for SPA)
   - **DON'T**: Store in cookies without `httpOnly` flag
   - **BEST**: Use `httpOnly` cookies for refresh tokens

2. **XSS Prevention**
   - React auto-escapes by default
   - Never use `dangerouslySetInnerHTML` with user input
   - Sanitize rich text content

3. **CSRF Protection**
   - Include CSRF token in state-changing requests
   - Use `SameSite` cookie attribute

4. **Sensitive Data**
   - Never log tokens or passwords
   - Clear sensitive data from memory after use

5. **API Keys**
   - Store in `.env.local` (never commit)
   - Use different keys per environment

---

## Troubleshooting Guide

### Common Issues

#### 1. "Access token is missing" (401 Error)

**Cause**: Token not included in request headers

**Solution**:
```javascript
// Check if token exists
const token = localStorage.getItem('monay_admin_token');
console.log('Token:', token);

// Ensure axios is configured
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('monay_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 2. "Invalid or expired token" (403 Error)

**Cause**: Token has expired or is invalid

**Solution**:
```javascript
// Clear tokens and redirect to login
localStorage.removeItem('monay_admin_token');
localStorage.removeItem('monay_admin_refresh_token');
window.location.href = '/login';
```

#### 3. "INVALID_USER_ACCESS" (400 Error)

**Cause**: User's `userType` not allowed for this route

**Solution**:
```javascript
// Check user type
const user = JSON.parse(localStorage.getItem('monay_admin_user'));
console.log('User type:', user.userType);
console.log('User role:', user.role);

// Ensure user has correct role for endpoint
// Admin routes require userType: 'admin' or 'subadmin'
```

#### 4. "User not found in token" Error in UserContext

**Cause**: JWT payload missing `userId`, `id`, or `user_id` field

**Solution**:
```javascript
// Check JWT payload
const token = localStorage.getItem('monay_admin_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);

// Ensure backend includes user ID in token
// Backend should include: { id: userId, user_id: userId, ... }
```

#### 5. Backend Not Running

**Symptoms**:
- Network errors
- "Failed to fetch" errors
- Connection refused

**Solution**:
```bash
# Check if backend is running
curl http://localhost:3001/api/status

# Start backend if not running
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common
npm run dev
```

#### 6. Database Connection Issues

**Symptoms**:
- "connect ECONNREFUSED" errors
- SQL query errors

**Solution**:
```bash
# Check PostgreSQL is running
psql -U alisaberi -d monay -c "SELECT 1;"

# Start PostgreSQL if needed
brew services start postgresql
```

#### 7. CORS Errors

**Symptoms**:
- "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**:
```javascript
// Backend - ensure CORS is configured
import cors from 'cors';
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3003', 'http://localhost:3007'],
  credentials: true
}));
```

### Debug Mode

Enable debug logging in backend:

**File**: `/monay-backend-common/src/middleware-app/auth-middleware.js`

```javascript
const authenticateToken = async (req, res, next) => {
  console.log('Auth middleware - Headers:', req.headers);
  console.log('Auth middleware - Token:', token);
  console.log('Auth middleware - Decoded:', decoded);
  console.log('Auth middleware - User:', req.user);
  // ... rest of code
};
```

---

## Test Credentials

### Monay-Admin (Port 3002)

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `admin@monay.com` | `Admin@123` | platform_admin | Full platform access |
| `john@example.com` | `Admin@123` | verified_consumer | Limited admin access |

### Monay-Consumer-Web (Port 3003)

| Phone/Email | Password | Role | Access |
|-------------|----------|------|--------|
| `+15551234567` | `demo123` | Mock Account | Testing only |
| `+13016821633` | `Demo@123` | basic_consumer | Consumer wallet |
| `ali@monay.com` | `Demo@123` | basic_consumer | Consumer wallet |

### Monay-Enterprise-Wallet (Port 3007)

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `admin@monay.com` | (Not specified) | platform_admin | Full enterprise access |
| (Create via signup) | - | enterprise_admin | Organization management |

### Database Access

```bash
# Connect to PostgreSQL
psql -U alisaberi -d monay

# Check users
SELECT id, email, mobile, role, is_active FROM users;

# Check organizations
SELECT id, name, wallet_type, feature_tier FROM organizations;
```

---

## Quick Reference

### Token Storage Keys by Application

| Application | Token Key | Refresh Token Key | User Data Key |
|-------------|-----------|-------------------|---------------|
| Monay-Admin | `monay_admin_token` | `monay_admin_refresh_token` | `monay_admin_user` |
| Consumer Web | `auth_token` | N/A | `user_data` |
| Enterprise Wallet | `token` or `authToken` | `refreshToken` | `user` |

### Backend Ports

- **Backend API**: 3001
- **PostgreSQL**: 5432
- **Redis**: 6379

### Frontend Ports

- **Monay-Admin**: 3002
- **Consumer Web**: 3003
- **Enterprise Wallet**: 3007

### Key Files

**Backend**:
- Auth Routes: `/monay-backend-common/src/routes/auth.js`
- Auth Middleware: `/monay-backend-common/src/middleware-app/auth-middleware.js`
- Account Controller: `/monay-backend-common/src/controllers/account-controller.js`

**Admin**:
- Auth Service: `/monay-admin/src/services/auth.service.ts`
- Axios Config: `/monay-admin/src/lib/axios.ts`
- Auth Store: `/monay-admin/src/store/auth.ts`

**Consumer**:
- Auth Context: `/monay-cross-platform/web/contexts/AuthContext.tsx`
- API Service: `/monay-cross-platform/web/lib/api-service.ts`

**Enterprise**:
- API Service: `/monay-caas/monay-enterprise-wallet/src/services/api.service.ts`
- API Client: `/monay-caas/monay-enterprise-wallet/src/lib/api-client.ts`

---

## Support

For authentication issues or questions:
- **Technical Lead**: dev.lead@monay.com
- **DevOps**: devops.engineer@monay.com
- **Documentation**: This guide

---

**Document Version**: 2.0
**Last Updated**: January 2025
**Status**: Production-Ready
**Maintained By**: Monay Platform Team
