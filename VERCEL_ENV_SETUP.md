# Vercel Environment Variables Setup

To ensure the contact form posts correctly to Vtiger CRM in production, you need to set these environment variables in Vercel Dashboard:

## Required Environment Variables

Go to your Vercel Dashboard → Project Settings → Environment Variables and add:

### Production Environment Variables

```
VTIGER_URL=https://utilliadmin.com/crm
VTIGER_USERNAME=admin
VTIGER_ACCESS_KEY=crsogur4p4yvzyur
EMAIL_TO=ali@monay.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## How to Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project "monay-website-static"
3. Go to "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add each variable listed above with:
   - Key: Variable name (e.g., `VTIGER_URL`)
   - Value: Variable value (e.g., `https://utilliadmin.com/crm`)
   - Environment: Select "Production" (you can also select Preview and Development)
6. Click "Save" for each variable

## Verify Environment Variables

After adding all variables, you should see them listed in the Environment Variables section.

## Redeploy

After adding environment variables:
1. Go to the "Deployments" tab
2. Click on the three dots next to the latest deployment
3. Select "Redeploy"
4. Click "Redeploy" in the confirmation dialog

## Test the Form

After redeployment completes:
1. Visit https://www.monay.com/contact?dept=Investors&subject=Investment%20Inquiry
2. Fill out and submit the form
3. Check your Vtiger CRM at https://utilliadmin.com/crm for the new lead

## Troubleshooting

If forms still don't create leads:
1. Check browser console for errors (F12 → Console tab)
2. Check Vercel Function Logs:
   - Go to Vercel Dashboard → Functions tab
   - Click on "api/vtiger" 
   - View the logs for any errors

## API Testing

You can test the API directly with this curl command:

```bash
curl -X POST https://www.monay.com/api/vtiger \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "Test Form",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "555-1234",
    "company": "Test Company",
    "department": "Investors",
    "message": "Testing API",
    "pageUrl": "https://www.monay.com/contact",
    "recaptchaToken": "test"
  }'
```

If this returns a success response with leadId, the API is working correctly.