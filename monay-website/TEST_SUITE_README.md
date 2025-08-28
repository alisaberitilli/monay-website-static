# OTP System Test Suite

This document describes the automated testing system for the MONAY website OTP functionality.

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:otp
```

### Run Tests Directly
```bash
node test-otp-system.js
```

### Run Tests with Shell Script (CI/CD friendly)
```bash
./run-otp-tests.sh
```

## 🧪 What Gets Tested

### 1. Email OTP Functionality
- ✅ **Send Email OTP**: Generates and sends OTP via Nudge API
- ✅ **Verify Email OTP**: Retrieves and verifies OTP from PostgreSQL
- ✅ **Auto-Cleanup**: OTP automatically deleted after verification

### 2. SMS OTP Functionality  
- ✅ **Send SMS OTP**: Generates and sends SMS OTP via Nudge API
- ✅ **Verify SMS OTP**: Retrieves and verifies SMS OTP from PostgreSQL
- ✅ **Mobile Formatting**: Automatically adds +1 prefix for US numbers
- ✅ **Auto-Cleanup**: OTP automatically deleted after verification

### 3. Error Handling
- ✅ **Invalid Email OTP**: Properly rejects invalid OTP codes
- ✅ **Invalid Mobile OTP**: Properly rejects invalid OTP codes  
- ✅ **Missing Required Fields**: Handles incomplete requests gracefully

### 4. Database Integration
- ✅ **PostgreSQL Storage**: OTPs stored in local PostgreSQL database
- ✅ **Database Cleanup**: Automatic cleanup after verification
- ✅ **Fallback Storage**: In-memory fallback if PostgreSQL unavailable

## 📊 Test Results

The test suite provides detailed results including:

- **Duration**: Total execution time
- **Tests Passed**: Number of successful tests
- **Success Rate**: Percentage of passed tests
- **Individual Test Status**: PASS/FAIL for each test with details
- **Exit Code**: 0 for success, 1 for failure (CI/CD friendly)

## 🔧 Prerequisites

### Required Services
- ✅ **Next.js Development Server**: Running on port 3000
- ✅ **Local PostgreSQL**: Database `monay_otp` accessible
- ✅ **Nudge API**: Email and SMS API keys configured
- ✅ **Node.js**: Version 18+ with fetch support

### Environment Variables
```bash
# .env.local
POSTGRES_URL=postgresql://monay_user@localhost:5432/monay_otp
NUDGE_API_KEY=your_email_api_key
NUDGE_SMS_API_KEY=your_sms_api_key
```

## 🚨 Troubleshooting

### Common Issues

#### Server Not Running
```
❌ Server is not running or not accessible
Please start the development server with: npm run dev
```

**Solution**: Start the dev server with `npm run dev`

#### Database Connection Failed
```
❌ Database Cleanup: FAIL
Could not check database: [error message]
```

**Solution**: 
1. Ensure PostgreSQL is running: `brew services start postgresql@15`
2. Check database exists: `psql -d monay_otp -U monay_user`
3. Verify `POSTGRES_URL` in `.env.local`

#### Nudge API Errors
```
❌ Email OTP Send: FAIL
API Error: [Nudge API error message]
```

**Solution**:
1. Check API keys in `.env.local`
2. Verify Nudge API account status
3. Check network connectivity

### Test Failures

#### Invalid OTP Tests Failing
- **Expected**: System should return error for invalid OTPs
- **Check**: API response format and status codes
- **Debug**: Use `curl` to test individual endpoints

#### Database Cleanup Tests Failing
- **Expected**: OTP table should be empty or contain very few records
- **Check**: PostgreSQL connection and table structure
- **Debug**: Check database manually with `psql`

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: OTP System Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:otp
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run test:otp
```

## 📝 Customization

### Test Configuration
Edit `test-otp-system.js` to modify:
- **Base URL**: Change `BASE_URL` for different environments
- **Test Data**: Modify `TEST_EMAIL`, `TEST_MOBILE`, `TEST_NAME`
- **Test Cases**: Add new test scenarios
- **Assertions**: Customize pass/fail criteria

### Adding New Tests
```javascript
async function testNewFeature() {
  logHeader('Testing New Feature');
  
  // Your test logic here
  const result = await makeRequest('/api/new-endpoint', testData);
  
  if (result.success && result.data.expectedField) {
    logTest('New Feature', 'PASS', 'Feature working correctly');
  } else {
    logTest('New Feature', 'FAIL', 'Feature not working');
  }
  
  return true;
}
```

## 🎯 Best Practices

### When to Run Tests
- ✅ **Before Commits**: Ensure no regressions
- ✅ **After Deployments**: Verify production functionality  
- ✅ **During Development**: Test new features
- ✅ **CI/CD Pipeline**: Automated testing

### Test Data Management
- ✅ **Use Test Accounts**: Separate from production data
- ✅ **Clean Test Data**: Tests should clean up after themselves
- ✅ **Unique Identifiers**: Avoid conflicts between test runs

### Performance Considerations
- ✅ **Parallel Testing**: Run independent tests concurrently
- ✅ **Database Cleanup**: Ensure tests don't accumulate data
- ✅ **API Rate Limits**: Respect Nudge API limits

## 📚 Related Documentation

- [Local PostgreSQL Setup](LOCAL_POSTGRES_SETUP.md)
- [Nudge API Integration](NUDGE_INTEGRATION.md)
- [Project README](README.md)

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Prerequisites**: Ensure all services are running
2. **Review Logs**: Check test output for specific error messages
3. **Manual Testing**: Use `curl` to test endpoints individually
4. **Database Check**: Verify PostgreSQL connection and data
5. **Environment Variables**: Confirm `.env.local` configuration

The test suite is designed to be self-documenting and provide clear feedback on what's working and what needs attention.
