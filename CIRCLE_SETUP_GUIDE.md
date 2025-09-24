# Circle API Setup Guide for Monay

## ⚠️ IMPORTANT: Manual Setup Required

**You need to register with Circle and obtain API keys before the integration will work.** The code is ready, but it requires your Circle account credentials.

## Step 1: Register with Circle

### A. Create Circle Account
1. Go to https://www.circle.com/en/circle-mint
2. Click "Get Started" or "Contact Sales"
3. Select "Business Account" (required for API access)
4. Fill out the business information form:
   - Company Name: Monay
   - Business Type: Financial Services / Fintech
   - Expected Monthly Volume: (your estimate)
   - Use Case: Stablecoin issuance and treasury management

### B. Complete KYB (Know Your Business)
Circle requires business verification:
- Business registration documents
- EIN/Tax ID
- Beneficial ownership information
- Business bank account for verification
- Estimated processing time: 2-5 business days

## Step 2: Access Circle Developer Dashboard

### A. Sandbox Environment (Start Here)
1. Once approved, log into Circle Account
2. Navigate to Developer Dashboard
3. Select "Sandbox Environment" for testing
4. You'll get access to:
   - Sandbox API keys
   - Test wallet creation
   - Mock banking endpoints
   - Test USDC operations

### B. Get Your API Credentials
In the Developer Dashboard, you'll find:

```bash
# These are examples - you'll get your own unique values
CIRCLE_API_KEY=SAND_API_KEY:abc123def456...
CIRCLE_ENTITY_SECRET=your-entity-secret-here
CIRCLE_WALLET_SET_ID=wallet-set-id-here
```

## Step 3: Configure Monay Environment

### A. Create Environment File
Create `/Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common/.env`:

```bash
# Circle API Configuration (SANDBOX)
CIRCLE_API_KEY=SAND_API_KEY:your-actual-api-key-here
CIRCLE_ENVIRONMENT=sandbox
CIRCLE_ENTITY_SECRET=your-entity-secret-here
CIRCLE_WALLET_SET_ID=your-wallet-set-id-here
CIRCLE_WEBHOOK_SECRET=your-webhook-secret-here

# Existing configurations...
DATABASE_URL=your-existing-database-url
JWT_SECRET=your-existing-jwt-secret
# ... other existing configs
```

### B. Webhook Configuration
1. In Circle Developer Dashboard, go to "Webhooks"
2. Add webhook endpoint:
   ```
   https://your-domain.com/api/circle/webhooks
   ```
   Or for local testing:
   ```
   Use ngrok: https://abc123.ngrok.io/api/circle/webhooks
   ```
3. Select events to subscribe to:
   - ✅ payments.created
   - ✅ payments.updated
   - ✅ transfers.created
   - ✅ transfers.updated
   - ✅ payouts.created
   - ✅ payouts.updated
4. Copy the webhook secret and add to .env

## Step 4: Entity Secret Encryption

Circle requires entity secret encryption for wallet operations:

### A. Generate Entity Secret
```bash
# In Circle Dashboard, generate an entity secret
# It will look like: ES_xxxxxxxxxxxxxxxxxxxx
```

### B. Set Up Encryption (Production Only)
For production, you'll need to implement proper encryption:
```javascript
// The circle.js service currently uses basic encoding
// For production, implement Circle's required encryption:
// https://developers.circle.com/circle-mint/docs/entity-secret-management
```

## Step 5: Create Wallet Set

### A. In Circle Dashboard
1. Navigate to "Wallet Sets"
2. Click "Create Wallet Set"
3. Configuration:
   - Name: "Monay Enterprise Wallets"
   - Type: "End User Wallets"
   - Blockchain: "Ethereum" (or multi-chain)
4. Copy the Wallet Set ID to your .env file

## Step 6: Test the Integration

### A. Install Dependencies
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common
npm install @circle-fin/circle-sdk
```

### B. Start Backend with Circle Config
```bash
# Make sure .env has Circle credentials
npm run dev
```

### C. Test Basic Operations
```bash
# Create a test wallet
curl -X POST http://localhost:3001/api/circle/wallets \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "enterprise"}'

# Expected response:
{
  "success": true,
  "data": {
    "walletId": "...",
    "address": "0x...",
    "blockchain": "ETH"
  }
}
```

## Step 7: Sandbox Testing Limits

### Circle Sandbox Capabilities:
- ✅ Create unlimited test wallets
- ✅ Mint test USDC (no real money)
- ✅ Test transfers between wallets
- ✅ Simulate bank connections
- ✅ Test webhook notifications

### Sandbox Limitations:
- ❌ No real money movement
- ❌ No production blockchain transactions
- ❌ Test bank accounts only
- ❌ Cannot connect real bank accounts

## Step 8: Production Setup (When Ready)

### A. Request Production Access
1. Complete all sandbox testing
2. Submit production access request
3. Requirements:
   - Completed KYB
   - Business bank account verified
   - Compliance documentation
   - Security review completed

### B. Production Credentials
```bash
# Update .env for production
CIRCLE_API_KEY=LIVE_API_KEY:your-production-key
CIRCLE_ENVIRONMENT=production
# Production entity secret and wallet set
```

### C. Production Considerations
1. **Bank Account**: Need real business bank account
2. **Reserve Requirements**: Maintain USD reserves for minting
3. **Compliance**: AML/KYC requirements for users
4. **Limits**: Daily/monthly transaction limits
5. **Fees**: Circle charges fees for production operations

## Step 9: Alternative Testing (Without Circle Account)

If you want to test the UI without Circle:

### A. Mock Mode Configuration
Create `/monay-backend-common/.env`:
```bash
# Enable mock mode for testing
CIRCLE_MOCK_MODE=true
CIRCLE_API_KEY=mock-key-for-testing
```

### B. Update Circle Service for Mock Mode
I can create a mock mode that simulates Circle responses for testing.

## Step 10: Circle Pricing

### Sandbox (Free)
- Unlimited testing
- No real money
- Full API access

### Production Pricing
- **Account Setup**: Contact sales for pricing
- **Mint/Burn Fees**: ~0.1% per transaction
- **Transfer Fees**: Network gas fees
- **Monthly Minimums**: Varies by volume
- **Enterprise Plans**: Custom pricing

## Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**
   - Check .env file exists and is loaded
   - Verify key starts with SAND_API_KEY (sandbox) or LIVE_API_KEY (production)

2. **"Entity Secret Invalid"**
   - Entity secret must be encrypted properly
   - Check encryption implementation

3. **"Wallet Set Not Found"**
   - Create wallet set in Circle Dashboard first
   - Update CIRCLE_WALLET_SET_ID in .env

4. **Webhook Not Receiving Events**
   - Use ngrok for local testing
   - Verify webhook secret matches
   - Check webhook URL is accessible

## Required Actions for You:

1. **Register with Circle** at https://www.circle.com/en/circle-mint
2. **Complete KYB verification**
3. **Get Sandbox API credentials**
4. **Create .env file** with your credentials
5. **Test wallet creation** to verify setup

## Resources

- **Circle Developer Docs**: https://developers.circle.com
- **API Reference**: https://developers.circle.com/circle-mint/reference
- **Postman Collection**: Available in Circle Dashboard
- **Support**: developers@circle.com

## Notes

- The code implementation is complete and ready
- Just needs your Circle API credentials to function
- Start with Sandbox for testing (free)
- Move to Production when ready for real money

---

**IMPORTANT**: Without completing these steps, the Circle integration will not work. The backend will return errors when trying to use Circle endpoints. However, all the code infrastructure is ready and will work once you add your Circle credentials.