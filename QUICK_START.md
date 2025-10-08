# Quick Start - Payment Request Demo

## 🚀 Access the Demo

1. **Make sure the dev server is running:**
   ```bash
   npm run dev
   ```

2. **Open your browser to:**
   ```
   http://localhost:3000/pay
   ```

## 📁 Sample JSON File

A sample payment request is provided at:
```
./sample-payment-request.json
```

Contents:
```json
{
  "accountNumber": "ACC-123456",
  "firstName": "John",
  "lastName": "Doe",
  "amountDue": 1250.00,
  "dueDate": "2025-12-31"
}
```

## 🎯 Quick Test Flow

1. Navigate to http://localhost:3000/pay
2. Upload `sample-payment-request.json`
3. Select any payment method:
   - **Traditional**: eCheck, Credit Card
   - **Digital Wallets**: Apple Pay, Google Pay, Venmo, PayPal
   - **Stablecoins**: USDC, USDT, PYUSD
4. Click "Complete Payment"
5. Download receipt

## 📚 Full Documentation

See `PAYMENT_REQUEST_DEMO.md` for complete documentation.

## ✅ What's Included

- ✅ JSON file upload with validation
- ✅ 9 payment method options
- ✅ Realistic payment simulation
- ✅ Transaction confirmation
- ✅ Downloadable receipt
- ✅ Fully responsive design
- ✅ Modern UI with animations

## 🎨 Features

- Drag & drop file upload
- Real-time validation
- Payment method comparison
- Processing time & fee display
- Transaction ID generation
- Receipt download
- Share functionality

Enjoy testing the multi-rail payment system! 🎉
