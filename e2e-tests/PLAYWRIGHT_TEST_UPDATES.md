# Playwright Test Updates - Consumer Wallet

**Date**: September 30, 2025
**Updated By**: Claude Code
**Status**: ✅ Complete

## 📋 Summary of Changes

Updated all Playwright tests to reflect the current consumer wallet implementation, including the new two-step registration flow, updated field names, and new demo credential buttons.

---

## 🔄 Major Changes Implemented

### 1. **Account Type Selection** (Updated in all registration tests)
**Previous Implementation:**
- Single "Get Started" button selector
- Used `.first()` which was fragile

**Current Implementation:**
```typescript
const accountTypeSelectors = [
  // Specific targeting for Personal Account card
  'div:has-text("Personal Account") button:has-text("Get Started")',
  'div:has-text("Personal wallet") button:has-text("Get Started")',
  // Fallback
  'button:has-text("Get Started")'
];
```

**Reason:** The registration page now offers three account types (Individual/Business/Enterprise), each with a "Get Started" button. More specific targeting prevents selecting the wrong account type.

---

### 2. **Mobile Number Field Name** (Updated in all tests)
**Previous Field Name:** `input[name="mobile"]`
**Current Field Name:** `input[name="mobileNumber"]`

**Updated Selectors:**
```typescript
// Registration form
const mobileSelectors = [
  'input[name="mobileNumber"]',  // Primary
  'input[name="mobile"]',         // Fallback
  'input[type="tel"]',
  // ... other fallbacks
];

// Login form (no name attribute)
const mobileLoginSelectors = [
  'input[type="tel"]',           // Primary for login
  'input[name="mobileNumber"]',
  // ... other fallbacks
];
```

**Reason:** Field naming standardized to `mobileNumber` across the app, but login page uses `type="tel"` without a `name` attribute.

---

### 3. **Two-Step Registration Flow** (New)
**Previous Flow:**
1. Navigate to registration page → Form immediately visible

**Current Flow:**
1. Navigate to registration page → Account type selection screen
2. Click "Get Started" on desired account type → Form appears

**Implementation:**
```typescript
// After clicking account type selection
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);  // Wait for form to appear
```

**Reason:** Registration now uses a two-step process to collect account type before showing the form.

---

### 4. **Login Button Text** (Updated)
**Previous:** Various ("Login", "Sign In", "Log In")
**Current:** "Sign in" (lowercase 'i')

**Updated Selector:**
```typescript
const loginSubmitSelectors = [
  'button[type="submit"]:has-text("Sign in")',  // Most specific
  'button[type="submit"]',
  'button:has-text("Sign in")',
  // ... fallbacks
];
```

---

### 5. **Demo Credentials Buttons** (New Feature)
**Added:** New test file `demo-credentials-test.spec.ts`

**Three Demo Accounts:**
1. **Test Account (Demo)**
   - Phone: `+15552223333`
   - Password: `password123`
   - Button: "Use Demo Credentials"

2. **Mock Test Account**
   - Phone: `+15551234567`
   - Password: `demo123`
   - Button: "Use Test Credentials"

3. **PostgreSQL Account**
   - Phone: `+13016821633`
   - Password: `Demo@123`
   - Button: "Use PostgreSQL Account"

**New Test Coverage:**
- Auto-fill functionality for all three demo accounts
- Complete login flow using demo credentials
- Verification of correct credential filling

---

## 📁 Files Updated

### Updated Test Files:
1. ✅ `consumer-wallet-login-test.spec.ts`
   - Account type selection logic
   - Mobile field selectors for login
   - Login button text

2. ✅ `consumer-wallet-registration.spec.ts`
   - Account type selection with two-step flow
   - Mobile field name updated
   - Form appearance wait logic

3. ✅ `consumer-wallet-complete-flow.spec.ts`
   - Account type selection
   - Mobile field name
   - Two-step flow handling

### New Test Files:
4. ✅ `demo-credentials-test.spec.ts` (NEW)
   - Test all three demo credential buttons
   - Complete login flow with demo account
   - Auto-fill verification

---

## 🧪 Test Execution

### Run Individual Tests:
```bash
# Login test
npx playwright test consumer-wallet-login-test.spec.ts

# Registration test
npx playwright test consumer-wallet-registration.spec.ts

# Complete flow test
npx playwright test consumer-wallet-complete-flow.spec.ts

# Demo credentials test
npx playwright test demo-credentials-test.spec.ts
```

### Run All Consumer Wallet Tests:
```bash
npx playwright test tests/consumer-wallet*.spec.ts
```

### Run All Tests (including new demo test):
```bash
npx playwright test
```

---

## ⚠️ Important Notes

### Field Name Changes:
- **Registration form:** Uses `name="mobileNumber"`
- **Login form:** Uses `type="tel"` (no name attribute)
- Tests use selector priority to handle both cases

### Account Type Cards:
- Three cards: Individual, Business, Enterprise
- All have "Get Started" buttons
- Use specific text matching to target correct card
- Current tests target "Personal Account" (Individual)

### Two-Step Flow:
- Account selection triggers page state change
- Form doesn't navigate to new URL
- Wait for `networkidle` + 2s timeout for form to appear

### Demo Credentials:
- Three sets of working credentials on login page
- Auto-fill buttons for quick testing
- Tests verify correct auto-fill behavior

---

## 🔍 Breaking Changes from Previous Tests

| Change | Previous | Current | Impact |
|--------|----------|---------|--------|
| Mobile field name | `input[name="mobile"]` | `input[name="mobileNumber"]` | High - would fail to find field |
| Account selection | `.first()` on "Get Started" | Specific card targeting | Medium - might select wrong type |
| Login button | "Login" | "Sign in" | Low - fallback selectors work |
| Registration flow | Direct to form | Two-step selection | High - form not immediately visible |

---

## ✅ Verification Checklist

Before running tests, ensure:
- [ ] Backend running on port 3001
- [ ] Consumer wallet running on port 3003
- [ ] Database is populated with demo accounts
- [ ] Demo account credentials are accurate:
  - `+15552223333` / `password123`
  - `+15551234567` / `demo123`
  - `+13016821633` / `Demo@123`

---

## 📊 Test Coverage

| Feature | Test File | Status |
|---------|-----------|--------|
| Account type selection | All registration tests | ✅ Updated |
| Mobile field (registration) | All registration tests | ✅ Updated |
| Mobile field (login) | Login test | ✅ Updated |
| Two-step flow | All registration tests | ✅ Updated |
| Demo credentials auto-fill | demo-credentials-test | ✅ New |
| Complete login flow | Login test | ✅ Updated |
| Form validation | Complete flow test | ✅ Updated |

---

## 🚀 Next Steps

1. **Run tests** to verify all updates work correctly
2. **Review screenshots** generated during test runs
3. **Update CI/CD pipeline** if needed for new test file
4. **Document any failures** for further investigation
5. **Consider adding**:
   - Business account registration test
   - Enterprise account registration test
   - Error handling tests for invalid credentials

---

## 📝 Additional Notes

### Selector Strategy:
Tests use a "waterfall" selector approach:
1. Most specific selector (e.g., `div:has-text("Personal Account") button`)
2. Moderately specific (e.g., `input[name="mobileNumber"]`)
3. Generic fallbacks (e.g., `input[type="tel"]`)

This ensures tests are resilient to minor UI changes while still being specific enough to target the correct elements.

### Error Handling:
All tests include:
- Console logging for debugging
- Screenshots on failure
- Multiple selector attempts with fallbacks
- Explicit error messages when elements not found

### Performance:
- Tests use appropriate timeouts (2-5 seconds)
- `waitForLoadState('networkidle')` ensures page fully loaded
- Additional `waitForTimeout()` only where necessary (e.g., after clicking buttons)

---

**End of Update Documentation**
