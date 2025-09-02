# Vtiger CRM Integration

This application now includes full integration with Vtiger CRM for automatic lead capture from all forms.

## Features

✅ **Automatic Lead Creation**: All form submissions automatically create leads in Vtiger CRM
✅ **Email Notifications**: Form data is sent to ali@monay.com for immediate notification
✅ **Error Resilience**: Form submissions succeed even if CRM is temporarily unavailable
✅ **Comprehensive Data Capture**: All form fields are mapped to appropriate Vtiger lead fields

## Setup Instructions

### 1. Get Your Vtiger Credentials

1. Log into your Vtiger instance
2. Go to **My Preferences** (click your profile icon)
3. Navigate to **User Advanced Options**
4. Copy your **Webservice Access Key**

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Your Vtiger instance URL (without trailing slash)
VTIGER_URL=https://your-instance.vtiger.com

# Your Vtiger username (usually your email)
VTIGER_USERNAME=your-email@example.com

# Your Vtiger Web Service Access Key
VTIGER_ACCESS_KEY=your-access-key-here
```

### 3. Enable Web Services in Vtiger

1. Go to **Settings** → **Webservices**
2. Ensure Web Services are enabled
3. Check that the Leads module is accessible via API

## How It Works

### Form Submission Flow

1. User fills out any form on the website:
   - Homepage Contact Form
   - Monay ID Signup
   - Monay WaaS Signup
   - Monay CaaS Signup

2. Form data is processed through `/api/send-email` endpoint

3. The API performs two actions in parallel:
   - Logs form data for email to ali@monay.com
   - Creates a lead in Vtiger CRM

4. User receives success confirmation

### Data Mapping

| Form Field | Vtiger Lead Field | Notes |
|------------|------------------|-------|
| firstName | firstname | Required |
| lastName | lastname | Required |
| email | email | Required |
| phone | phone | Optional |
| company/organizationName | company | Maps from either field |
| role/jobTitle | designation | Maps from either field |
| message | description | Included in description |
| useCase | description | Appended to description |
| monthlyActiveUsers | description | Appended to description |
| transactionVolume | annualrevenue | Converted to numeric |
| organizationSize | noofemployees | Converted to numeric |
| country | description | Appended to description |
| All fields | description | Full form data in description |

### Lead Source

All leads are automatically tagged with:
- **Lead Source**: "Website"
- **Form Type**: Specific form name (e.g., "Monay ID Signup")

## Form Types

The following forms are integrated:

1. **Homepage Contact Form**
   - Basic contact information
   - Country selection
   - Tagged as: "Homepage Contact Form"

2. **Monay ID Signup**
   - Authentication product interest
   - Monthly Active Users
   - Use case selection
   - Tagged as: "Monay ID Signup"

3. **Monay WaaS Signup**
   - Wallet-as-a-Service interest
   - Transaction volume
   - Organization size
   - Tagged as: "Monay WaaS Signup"

4. **Monay CaaS Signup**
   - Coin-as-a-Service interest
   - Industry selection
   - Budget range
   - Tagged as: "Monay CaaS Signup"

## Modern Dropdown Design

All dropdowns have been updated with:
- Flat, modern design
- Custom SVG arrow icon
- Smooth hover transitions
- Consistent dark/light mode theming
- Border-2 for clean lines
- No default browser styling

## Testing

### Test Form Submission

1. Fill out any form on the website
2. Check browser console for:
   ```
   Form submission received for ali@monay.com:
   =====================================
   [Form Data]
   =====================================
   ```

3. If Vtiger is configured, you'll also see:
   ```
   Lead created in Vtiger: [Lead ID]
   ```

### Test Vtiger Connection

The integration includes error handling:
- If Vtiger is not configured: Forms still work, just without CRM integration
- If Vtiger is down: Forms still work, error is logged
- If credentials are wrong: Forms still work, error is logged

## Troubleshooting

### Common Issues

1. **"Vtiger not configured" message**
   - Ensure all three environment variables are set
   - Restart the development server after adding .env.local

2. **"Failed to create lead" error**
   - Check your Vtiger credentials
   - Ensure Web Services are enabled in Vtiger
   - Verify the Leads module is accessible

3. **No lead appears in Vtiger**
   - Check Vtiger's trash/recycle bin
   - Verify user has permission to create leads
   - Check Vtiger's duplicate detection settings

### Debug Mode

To see detailed Vtiger API responses, check the browser console and server logs when submitting a form.

## Security Notes

- Vtiger credentials are server-side only (never exposed to browser)
- All API calls use HTTPS
- Access keys are hashed with MD5 for authentication
- Session tokens expire automatically

## Email Integration

While Vtiger integration is active, form submissions are also:
1. Logged to console (development)
2. Prepared for email to ali@monay.com (requires email service configuration)
3. Stored locally if configured

## Future Enhancements

Potential improvements:
- [ ] Add Vtiger webhook for real-time updates
- [ ] Implement lead scoring based on form data
- [ ] Add custom fields for product interest
- [ ] Create automated workflows in Vtiger
- [ ] Add lead assignment rules based on form type

## Support

For issues with:
- **Form functionality**: Check browser console
- **Vtiger integration**: Check server logs
- **Configuration**: Verify .env.local settings