# Email Verification Setup with Nudge.net API

## Overview
This website now includes email verification with OTP (One-Time Password) functionality for the pilot program application form. The system uses the Nudge.net API to send and verify OTP codes.

## Features
- **Email Verification**: Users must verify their email before submitting pilot program applications
- **OTP System**: 6-digit verification codes sent via email
- **Form Validation**: Complete form only appears after email verification
- **Error Handling**: Comprehensive error messages and user feedback
- **Rate Limiting**: Built-in protection against spam and abuse

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root with the following variables:

```bash
# Nudge.net API Configuration
NUDGE_API_KEY=your_actual_nudge_api_key_here
NUDGE_API_URL=https://app.nudge.net  # Optional, defaults to this URL
```

### 2. Nudge.net API Configuration
- Sign up for a Nudge.net account
- Generate your API key
- Configure your email templates (optional)
- Set up rate limiting rules

### 3. API Endpoints Created
The following API routes have been added:

- **`/api/send-otp`**: Sends OTP to user's email
- **`/api/verify-otp`**: Verifies the OTP code
- **`/api/submit-pilot`**: Submits the pilot program application

## How It Works

### Step 1: Email Input
- User enters their business email address
- Clicks "Send OTP" button
- System validates email format
- Calls Nudge.net API to send OTP

### Step 2: OTP Verification
- User receives 6-digit code via email
- Enters code in the verification field
- Clicks "Verify OTP" button
- System validates code with Nudge.net API

### Step 3: Application Form
- After successful verification, application form appears
- User fills out company details, requirements, and timeline
- Form submission is only allowed after email verification

## Security Features

- **Email Validation**: Proper email format validation
- **OTP Expiration**: 5-minute expiration for OTP codes
- **Rate Limiting**: Protection against brute force attacks
- **Input Sanitization**: All user inputs are validated and sanitized
- **Error Handling**: Generic error messages to prevent information leakage

## Customization Options

### Email Templates
You can customize the OTP email template in your Nudge.net dashboard:
- Template name: `pilot-program-otp`
- Customize subject line, body text, and styling
- Add your company branding

### Form Fields
The pilot application form includes:
- Company Type (Fintech, Bank, Government Agency, Other)
- Expected Token Volume ($1M-$10M, $10M-$100M, $100M+)
- Technical Requirements (checkboxes for specific needs)
- Timeline (3-6 months, 6-12 months, 12+ months)

### API Integration
The system is designed to easily integrate with:
- Database storage for applications
- CRM systems
- Email marketing platforms
- Project management tools

## Testing

### Development Testing
1. Start the development server: `npm run dev`
2. Navigate to the Pilot Program section
3. Test the email verification flow
4. Check browser console for API calls and responses
5. In development, `/api/send-otp` also returns `devOtp` in the JSON response for quick testing without email delivery

### Production Testing
1. Deploy with proper environment variables
2. Test with real email addresses
3. Verify OTP delivery and verification
4. Test form submission and data handling

## Troubleshooting

### Common Issues

**OTP Not Sending**
- Check NUDGE_API_KEY environment variable
- Verify Nudge.net API credentials
- Check API rate limits

**OTP Verification Failing**
- Ensure OTP code is 6 digits
- Check if OTP has expired (5 minutes)
- Verify email address matches

**Form Not Appearing**
- Ensure email verification is complete
- Check browser console for errors
- Verify all required fields are filled

### Debug Mode
Enable debug logging by checking the browser console and server logs for detailed error information.

## Support

For technical support with the email verification system:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test Nudge.net API credentials independently
4. Review server logs for detailed error information

## Future Enhancements

Potential improvements to consider:
- SMS OTP as backup verification method
- Two-factor authentication integration
- Advanced spam protection
- Analytics and tracking
- A/B testing for conversion optimization
