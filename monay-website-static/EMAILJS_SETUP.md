# EmailJS Setup Guide for Monay Website

This guide will help you set up EmailJS to send real emails from your static website to ali@monay.com.

## Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Click "Sign Up Free"
3. Create your account (200 emails/month free)

### Step 2: Add Email Service
1. In dashboard, click "Email Services"
2. Click "Add New Service"
3. Choose your email provider:
   - **Gmail** (recommended for personal)
   - **Outlook** (if using Microsoft)
   - **Custom SMTP** (for business email)
4. Follow the connection steps
5. Note your **Service ID** (like `service_abc123`)

### Step 3: Create Email Template
1. Click "Email Templates" in sidebar
2. Click "Create New Template"
3. Set up your template:

**Template Settings:**
- Template Name: `Monay Form Submissions`
- To Email: `ali@monay.com`
- From Name: `{{from_name}}`
- From Email: `{{from_email}}`
- Reply To: `{{from_email}}`
- Subject: `{{subject}}`

**Template Content:**
```
New Form Submission from Monay Website

From: {{from_name}}
Email: {{from_email}}
Company: {{company}}
Phone: {{phone}}

Message:
{{message}}

Form Type: {{form_type}}
Meeting Type: {{meeting_type}}
Date: {{date}}
Time: {{time}}

Additional Details:
{{form_data}}
{{meeting_details}}
{{application_details}}

---
This email was sent from the Monay static website.
```

4. Save template
5. Note your **Template ID** (like `template_xyz789`)

### Step 4: Get Your Public Key
1. Click on your account name (top right)
2. Go to "Account"
3. Find "API Keys" section
4. Copy your **Public Key** (like `BcK2j9Xp5yRq8Lm3N`)

### Step 5: Update Configuration
Edit `/src/lib/emailjs-config.ts`:

```typescript
export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY_HERE',  // From Step 4
  SERVICE_ID: 'service_abc123',        // From Step 2
  TEMPLATE_ID: 'template_xyz789',      // From Step 3
  TO_EMAIL: 'ali@monay.com'
};
```

### Step 6: Rebuild and Test
```bash
npm run build
npx serve out -p 3005
```

## Testing Your Setup

1. Open http://localhost:3005
2. Try submitting any form:
   - Contact Sales
   - Schedule Demo
   - Pilot Program Application
3. Check ali@monay.com inbox for the email

## Troubleshooting

### Email not received?
1. Check spam/junk folder
2. Verify EmailJS dashboard shows email was sent
3. Check browser console for errors
4. Ensure credentials are correct in `emailjs-config.ts`

### "Unauthorized" error?
- Double-check your Public Key is correct
- Make sure email service is active in EmailJS

### Rate limit exceeded?
- Free plan: 200 emails/month
- Upgrade to paid plan for more

## Alternative Options

If EmailJS doesn't work for you, here are alternatives:

### Option 2: Formspree
1. Sign up at https://formspree.io/
2. Create a form endpoint
3. Update `NEXT_PUBLIC_FORMSPREE_FORM_ID` in `.env.local`

### Option 3: Netlify Forms (if deploying to Netlify)
- Add `data-netlify="true"` to forms
- Emails automatically sent to account email

### Option 4: Web3Forms
1. Get API key from https://web3forms.com/
2. Similar setup to EmailJS but simpler

## Security Note

- EmailJS public key is safe to expose (it's meant to be public)
- Never expose SMTP passwords or private keys
- All emails go directly to ali@monay.com

## Support

If you need help:
1. Check EmailJS documentation: https://www.emailjs.com/docs/
2. Check browser console for error messages
3. Verify all form fields are being passed correctly

---

**Current Status:** EmailJS is installed but not configured. Forms will show setup instructions until you add your credentials.