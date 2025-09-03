# Monay Website Forms Inventory

## Active Forms on monay.com

### 1. **Monay ID Signup Form**
- **URL**: `/signup/monay-id`
- **File**: `src/app/signup/monay-id/page.tsx`
- **Status**: ✅ Vtiger integration added
- **Fields**: firstName, lastName, email, company, phone, country, monthlyActiveUsers, useCase, message

### 2. **Monay WaaS (Wallet as a Service) Signup Form**
- **URL**: `/signup/monay-waas`
- **File**: `src/app/signup/monay-waas/page.tsx`
- **Status**: ⏳ Needs Vtiger integration
- **Fields**: To be checked

### 3. **Monay CaaS (Custody as a Service) Signup Form**
- **URL**: `/signup/monay-caas`
- **File**: `src/app/signup/monay-caas/page.tsx`
- **Status**: ⏳ Needs Vtiger integration
- **Fields**: To be checked

### 4. **Main Signup Page**
- **URL**: `/signup`
- **File**: `src/app/signup/page.tsx`
- **Status**: ⏳ To be checked (might be a landing page)

### 5. **Homepage Contact Form** (if exists)
- **URL**: `/`
- **File**: `src/app/page.tsx`
- **Status**: ⏳ To be checked

## Implementation Tasks

- [x] Monay ID form - Vtiger integration
- [ ] Monay WaaS form - Vtiger integration
- [ ] Monay CaaS form - Vtiger integration
- [ ] Add reCAPTCHA to all forms
- [ ] Disable submit button after submission
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test all forms locally
- [ ] Deploy to production