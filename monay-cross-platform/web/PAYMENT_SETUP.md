# Payment Integration Setup - TilliPay

## Overview
This application is configured to work with TilliPay payment gateway for processing card transactions and adding money to user wallets.

## Setup Instructions

### 1. Get TilliPay API Credentials
1. Visit [TilliPay.com](https://tillipay.com)
2. Sign up for a merchant account
3. Navigate to your dashboard → API Settings
4. Generate your API credentials:
   - API Key
   - Merchant ID
   - API URL (usually https://api.tillipay.com)

### 2. Configure Environment Variables
1. Create a `.env.local` file in the web directory:
```bash
cp .env.local.example .env.local
```

2. Add your TilliPay credentials:
```env
TILLIPAY_API_URL=https://api.tillipay.com
TILLIPAY_API_KEY=your_actual_api_key_here
TILLIPAY_MERCHANT_ID=your_merchant_id_here
```

### 3. Test the Integration
1. Restart your development server:
```bash
npm run dev
```

2. Navigate to the dashboard and click "Add Money"
3. Enter an amount and select a payment method
4. The transaction will be processed through TilliPay

## API Endpoints

### Add Money Endpoint
- **URL**: `/api/payments/add-money`
- **Method**: POST
- **Payload**:
```json
{
  "amount": 100.00,
  "paymentMethodId": "card",
  "cardDetails": {
    "last4": "8912",
    "brand": "Visa"
  },
  "userId": "user123"
}
```

### Check Transaction Status
- **URL**: `/api/payments/add-money?transactionId=xxx`
- **Method**: GET

## Current Implementation Status

✅ **Completed:**
- API route created at `/app/api/payments/add-money/route.ts`
- TilliPay integration code
- Environment variable configuration
- Frontend integration in Add Money page
- Error handling and validation

⚠️ **Required for Production:**
- Valid TilliPay API credentials
- Database integration for storing transactions
- User authentication integration
- Webhook handling for transaction status updates
- PCI compliance for handling card data
- SSL certificate for secure transactions

## Security Considerations

1. **Never expose API keys** in frontend code
2. **Use HTTPS** in production
3. **Implement rate limiting** on API endpoints
4. **Store sensitive data** encrypted in database
5. **Follow PCI DSS** compliance for card processing
6. **Implement proper authentication** before processing payments

## Troubleshooting

### "Payment gateway not configured" Error
- Ensure `.env.local` file exists with TilliPay credentials
- Restart the development server after adding environment variables

### Transaction Fails
- Check TilliPay dashboard for error logs
- Verify API credentials are correct
- Ensure your TilliPay account is active and has sufficient permissions

### Card Not Being Charged
- Currently in development mode - no real charges occur without valid API keys
- Check TilliPay dashboard for test mode settings
- Use TilliPay test card numbers for development

## Support

For TilliPay integration support:
- Documentation: https://docs.tillipay.com
- Support: support@tillipay.com

For application issues:
- Check the console for error messages
- Review the API response in Network tab
- Ensure all environment variables are set correctly