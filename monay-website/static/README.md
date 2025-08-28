# Monay Website - Static Deployment

This is a static version of the Monay website optimized for AWS Amplify deployment without backend dependencies.

## Features

- ✅ Static export (no server required)
- ✅ Client-side form handling
- ✅ Calendly integration for meeting scheduling  
- ✅ Local storage for demo data
- ✅ Dark mode support
- ✅ Mobile responsive

## Client-Side Services

Instead of API routes, this version uses:

1. **Formspree** - Contact form submissions
2. **EmailJS** - Email notifications to ali@monay.com
3. **Calendly** - Meeting scheduling (ali-monay)
4. **Local Storage** - Temporary data storage

## Setup Instructions

### 1. Configure Third-Party Services

#### Formspree (Contact Forms)
1. Sign up at https://formspree.io
2. Create a new form
3. Copy your form ID
4. Add to `.env.production`: `NEXT_PUBLIC_FORMSPREE_FORM_ID=your_id`

#### EmailJS (Email Notifications)
1. Sign up at https://www.emailjs.com
2. Create email service and template
3. Get your service ID, template ID, and public key
4. Add to `.env.production`:
   ```
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

#### Calendly (Already Configured)
- Default URL: https://calendly.com/ali-monay
- Meetings will send notifications to ali@monay.com

### 2. Build Locally

```bash
# Install dependencies
npm install

# Build static site
npm run build

# Test locally
npx serve out
```

### 3. Deploy to AWS Amplify

1. Push to GitHub:
```bash
git add .
git commit -m "Static version for AWS Amplify"
git push origin main
```

2. In AWS Amplify Console:
   - Connect your GitHub repository
   - Amplify will detect the static configuration
   - Deploy!

### 4. Environment Variables in Amplify

Add these in Amplify Console > App settings > Environment variables:

```
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/ali-monay
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## File Structure

```
static/
├── src/
│   ├── app/
│   │   ├── page.tsx (main page with static forms)
│   │   └── layout.tsx
│   └── lib/
│       └── client-services.ts (client-side service handlers)
├── public/
│   └── (assets)
├── next.config.ts (configured for static export)
├── amplify.yml (Amplify build config)
└── .env.production (environment variables)
```

## Features Comparison

| Feature | Original | Static Version |
|---------|----------|----------------|
| User Registration | Database | Local Storage + Formspree |
| Contact Forms | API Route | Formspree |
| Meeting Scheduling | Teams API | Calendly |
| Email Notifications | SendGrid | EmailJS |
| OTP Verification | Server-side | Demo (client-side) |
| Data Storage | PostgreSQL | Local Storage |

## Limitations

- No real user authentication (demo only)
- No database persistence
- OTP is for demo purposes only
- Forms rely on third-party services

## Cost

- **AWS Amplify**: ~$5-14/month
- **Formspree**: Free tier available (50 submissions/month)
- **EmailJS**: Free tier available (200 emails/month)
- **Calendly**: Free tier available

## Support

For meeting scheduling issues, contact: ali@monay.com