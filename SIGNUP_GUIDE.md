# Monay Platform - Complete Signup Guide

## Available Signup Options

### 🏦 Consumer Wallet (Port 3003)

#### 1. **Standard Registration**
**URL**: http://localhost:3003/auth/register
- Basic registration form
- Fields: First Name, Last Name, Email, Mobile Number, Password
- Creates a basic consumer account

#### 2. **Alternative Signup**
**URL**: http://localhost:3003/auth/signup
- Similar to register page
- Alternative endpoint for the same functionality

#### 3. **Enhanced Registration with Account Type** ✨ RECOMMENDED
**URL**: http://localhost:3003/auth/register-with-account-type
- **Best option for proper tenant setup**
- Choose account type:
  - **Individual/Personal**: For personal banking and payments
  - **Small Business**: For business owners (creates organization)
  - **Enterprise**: For joining existing organizations

### 🏢 Enterprise Wallet (Port 3007)

#### 1. **Enterprise Registration**
**URL**: http://localhost:3007/auth/register
- For enterprise users
- Creates enterprise account

#### 2. **Enterprise Signup**
**URL**: http://localhost:3007/auth/signup
- Alternative enterprise registration

### 🛠️ Admin Portal (Port 3002)

#### 1. **Admin Signup**
**URL**: http://localhost:3002/auth/signup
- For admin users only
- Requires admin privileges

## Which Signup to Use?

### For Consumers:
✅ **USE THIS**: http://localhost:3003/auth/register-with-account-type
- Select "Individual/Personal" for consumer accounts
- Properly sets up tenant relationships

### For Small Businesses:
✅ **USE THIS**: http://localhost:3003/auth/register-with-account-type
- Select "Small Business"
- Enter business name
- Creates organization with tenant

### For Enterprise Users:
Two options:
1. **Consumer Wallet**: http://localhost:3003/auth/register-with-account-type
   - Select "Enterprise"
   - Enter organization ID or invite code

2. **Enterprise Wallet**: http://localhost:3007/auth/register
   - Direct enterprise registration

## Working Test Credentials

### Consumer Login:
```
URL: http://localhost:3003/auth/login
Mobile: +15551234567
Password: demo123
```

### Sample Registration Data:

#### Individual Consumer:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "+15551234568",
  "password": "Test123!",
  "confirmPassword": "Test123!"
}
```

#### Small Business:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@business.com",
  "mobileNumber": "+15551234569",
  "password": "Test123!",
  "confirmPassword": "Test123!",
  "businessName": "Smith Enterprises LLC"
}
```

## Common Issues & Solutions

### Issue: "Invalid mobile number or password"
**Solution**:
- Ensure phone number includes country code (+1 for US)
- Password must be at least 6 characters
- Try clearing browser cache

### Issue: Registration says invalid after submitting
**Possible Causes**:
1. Email already exists in database
2. Phone number already registered
3. Password doesn't meet requirements
4. Missing required fields

**Solution**:
- Use unique email and phone number
- Ensure all fields are filled
- Password should be 6-15 characters

### Issue: Can't login after registration
**Solution**:
- Registration may need email/phone verification
- Try the demo credentials first to ensure login works
- Check console for specific error messages

## Testing Registration

### Quick Test Script:
```bash
# Test consumer registration
curl -X POST http://localhost:3001/api/auth/register/consumer \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@example.com",
    "mobile": "+1555'$(date +%s | tail -c 8)'",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'

# Test business registration
curl -X POST http://localhost:3001/api/auth/register/business \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Business",
    "lastName": "Owner",
    "email": "business'$(date +%s)'@example.com",
    "mobile": "+1556'$(date +%s | tail -c 8)'",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "businessName": "Test Business '$(date +%s)'"
  }'
```

## Backend Endpoints

All registration endpoints go through the backend at port 3001:

- `/api/auth/register` - Standard registration
- `/api/auth/signup` - Alternative registration
- `/api/auth/register/consumer` - Individual consumer
- `/api/auth/register/business` - Small business
- `/api/auth/register/enterprise` - Enterprise user
- `/api/auth/login` - Login endpoint

## Verification Steps

1. **Check if backend is running**:
```bash
curl http://localhost:3001/api/health
```

2. **Check registered users**:
```bash
psql -U alisaberi -d monay -c "SELECT email, user_type, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

3. **Check tenant relationships**:
```bash
psql -U alisaberi -d monay -c "SELECT * FROM tenant_summary;"
```

## Important Notes

1. **Device Type**: The system automatically detects device type (WEB, IOS, ANDROID) based on user agent

2. **Phone Format**: Always use international format with country code
   - Good: +15551234567
   - Good: 555-123-4567 (will be converted)
   - Bad: 5551234567 (missing country indicator)

3. **Password Requirements**:
   - Minimum 6 characters
   - Maximum 15 characters
   - No special character requirements (but recommended)

4. **Tenant Hierarchy**:
   - Individual consumers get direct tenant relationships
   - Business users (including small businesses) get organization-based relationships
   - Enterprise users join existing organizations

## Next Steps After Registration

1. **Email Verification**: Check for verification email (if enabled)
2. **Phone Verification**: Complete OTP verification at `/auth/verify`
3. **MPIN Setup**: Set up your mobile PIN at `/auth/mpin-setup`
4. **KYC**: Complete identity verification at `/auth/kyc`
5. **Dashboard Access**: Navigate to `/dashboard` after login

---

For issues or questions, check the backend logs or database directly.