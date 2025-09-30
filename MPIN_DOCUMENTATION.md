# MPIN (Mobile PIN) Documentation

## What is MPIN?

**MPIN** stands for **Mobile Personal Identification Number**. It's a 4-6 digit security PIN used specifically for mobile transactions and wallet operations in the Monay platform.

## Purpose in Monay Platform

MPIN serves as an additional layer of security for sensitive financial operations:

1. **Transaction Authorization**: Used to authorize payments, transfers, and withdrawals
2. **Wallet Security**: Required for accessing wallet features and viewing sensitive information
3. **Quick Authentication**: Faster than entering full passwords for frequent mobile operations
4. **Two-Factor Security**: Acts as a second factor alongside regular login credentials

## How It's Different from Password

| Feature | Password | MPIN |
|---------|----------|------|
| **Length** | 8+ characters | 4-6 digits |
| **Usage** | Account login | Transaction authorization |
| **Complexity** | Letters, numbers, symbols | Numbers only |
| **Change Frequency** | Periodic | Less frequent |
| **Purpose** | Account access | Payment security |

## MPIN Operations in Monay

Based on the API documentation found in the codebase:

### 1. Set MPIN
- **Endpoint**: `/api/user/set-mpin`
- **Purpose**: Initial MPIN setup for new users
- **Required**: After account creation

### 2. Verify MPIN
- **Endpoint**: `/api/user/verify-mpin`
- **Purpose**: Validate MPIN before transactions
- **Used for**: Payment authorization, withdrawals

### 3. Forgot MPIN
- **Endpoint**: `/api/user/forgot-mpin`
- **Purpose**: Initiate MPIN reset process
- **Process**: Sends OTP to registered mobile/email

### 4. Reset MPIN
- **Endpoint**: `/api/user/reset-mpin`
- **Purpose**: Set new MPIN after verification
- **Requires**: OTP verification

### 5. Update MPIN
- **Endpoint**: `/api/user/update-mpin`
- **Purpose**: Change existing MPIN
- **Requires**: Current MPIN verification

## Where MPIN is Used

1. **Payment Operations** (`/api/pay-money`)
   - P2P transfers
   - Bill payments
   - Merchant payments

2. **Add Money** (`/api/add-money`)
   - Loading wallet from bank
   - Card top-ups

3. **Payment Requests** (`/api/payment-request`)
   - Accepting payment requests
   - Authorizing recurring payments

4. **Withdrawals**
   - ATM withdrawals
   - Bank transfers

## Security Features

1. **Encryption**: MPIN is stored as a hashed value in the database
2. **Rate Limiting**: Limited attempts to prevent brute force
3. **Session-Based**: MPIN verification is valid for single transaction
4. **Biometric Alternative**: Can be replaced with fingerprint/Face ID on supported devices

## Database Implementation

The MPIN field was added to the `users` table:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS mpin VARCHAR(255);
```

In the Sequelize model (`User.js`):
```javascript
mpin: {
  type: DataTypes.STRING
  // Stores bcrypt hashed version of the PIN
}
```

## Best Practices

1. **Never store plain text MPIN** - Always hash before storage
2. **Implement attempt limits** - Lock after 3-5 failed attempts
3. **Session timeout** - Require re-entry after inactivity
4. **Different from other PINs** - Should not match ATM or card PINs
5. **Regular updates** - Prompt users to change periodically

## User Experience Flow

1. **Registration**: User creates account with email/phone
2. **MPIN Setup**: Prompted to set 4-6 digit MPIN
3. **Confirmation**: Re-enter MPIN to confirm
4. **Usage**: Enter MPIN for each transaction
5. **Biometric Option**: Can enable fingerprint/Face ID as alternative

## Error Handling

- **Invalid MPIN**: "Incorrect MPIN. X attempts remaining"
- **Locked Account**: "Account locked due to multiple failed attempts"
- **MPIN Not Set**: "Please set your MPIN to continue"
- **Session Expired**: "Please re-enter your MPIN"

## Summary

MPIN is a critical security feature in the Monay platform that provides:
- Quick and secure transaction authorization
- Additional security layer for financial operations
- Better user experience than entering full passwords repeatedly
- Compliance with financial services security standards

The MPIN system is fully integrated into the Monay platform with proper database support, API endpoints, and security measures to ensure safe and convenient mobile financial transactions.