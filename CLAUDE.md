# CLAUDE.md - AI Assistant Instructions

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monay Website - A Next.js 15 application with Vtiger CRM integration, featuring:
- Full-stack web application with TypeScript
- Vtiger CRM REST API integration for lead management
- Dual deployment capability (Vercel + cPanel)
- Enterprise-grade form protection (reCAPTCHA v3 + rate limiting)
- Static export support for traditional hosting

## Recent Implementation (December 2024)

### Successfully Completed
1. **Vtiger CRM Integration**
   - REST API endpoint at `/api/vtiger`
   - All forms submit to production Vtiger
   - Comprehensive data capture in lead descriptions
   - Custom field mapping (cf_913, cf_915, cf_917, cf_919)

2. **Form Protection**
   - Google reCAPTCHA v3 (invisible)
   - Rate limiting with 5-minute cooldown
   - Browser fingerprinting
   - Session-based blocking

3. **Deployment Infrastructure**
   - Vercel (primary): https://monay.com
   - cPanel (static): https://utilliadmin.com/crm/
   - Automated deployment scripts

## Tech Stack

### Frontend
- **Framework**: Next.js 15.4.7
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: React 19.1.0
- **Forms**: Custom form wrapper with protection

### Backend
- **API Routes**: Vercel Functions (serverless)
- **CRM**: Vtiger 8.x REST API
- **Protection**: reCAPTCHA v3 + custom rate limiting
- **Environment**: Node.js 18+

### Deployment
- **Primary**: Vercel (automatic from GitHub)
- **Secondary**: cPanel (static export via FTP)
- **CI/CD**: GitHub → Vercel integration

## Development Commands

### Local Development
```bash
npm install
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run lint         # Run linting
npm run type-check   # Check TypeScript types
```

### Deployment
```bash
# Vercel (automatic)
git push origin main

# cPanel (manual)
./deploy-cpanel.sh        # Build static export
./deploy-to-cpanel.sh     # Upload via FTP
```

## Architecture Patterns

### Form Handling Pattern
All forms use the `VtigerFormWrapperV3` component:
```typescript
<VtigerFormWrapperV3
  formData={formData}
  formType="Form Name"
  resetFormData={resetFormData}
  successMessage="Success message"
  submitButtonText="Submit"
>
  {/* Form fields */}
</VtigerFormWrapperV3>
```

### API Route Pattern
API routes follow Next.js 13+ app directory structure:
```typescript
// /app/api/[endpoint]/route.ts
export async function POST(req: Request) {
  // Handle request
  return NextResponse.json({ success: true });
}
```

### Rate Limiting Pattern
Browser-based rate limiting with fingerprinting:
```typescript
if (isFormRecentlySubmitted(formType, 5)) {
  // Block submission
}
markFormAsSubmitted(formType);
```

## Important Files & Locations

### Core Integration
- `/src/app/api/vtiger/route.ts` - Vtiger API endpoint
- `/src/components/VtigerFormWrapperV3.tsx` - Form wrapper
- `/src/lib/form-protection.ts` - Rate limiting logic
- `/src/lib/vtiger-api-integration.ts` - API client

### Configuration
- `next.config.ts` - Next.js configuration
- `.env.local` - Local environment variables
- `.env.production` - Production variables (not in git)

### Deployment
- `deploy-cpanel.sh` - Static build script
- `deploy-to-cpanel.sh` - FTP upload script
- `.htaccess` - Apache configuration for cPanel

## Environment Variables

Required for production:
```env
VTIGER_URL=https://utilliadmin.com/crm
VTIGER_USERNAME=admin
VTIGER_ACCESS_KEY=crsogur4p4yvzyur
EMAIL_TO=ali@monay.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=[production_key]
RECAPTCHA_SECRET_KEY=[production_secret]
```

## Security Considerations

1. **Never commit credentials** - Use environment variables
2. **Rate limiting** - 5-minute cooldown prevents spam
3. **reCAPTCHA v3** - Invisible bot protection
4. **HTTPS only** - Enforced via .htaccess
5. **Input validation** - All forms validate client and server-side
6. **Session protection** - Fingerprinting prevents abuse

## Common Tasks

### Add a New Form
1. Create form component with state management
2. Wrap with `VtigerFormWrapperV3`
3. Test rate limiting and reCAPTCHA
4. Verify data in Vtiger CRM

### Update Vtiger Field Mapping
1. Edit `/src/app/api/vtiger/route.ts`
2. Update field mappings in buildDescription()
3. Test with sample submission
4. Verify in Vtiger lead record

### Deploy Updates
1. Commit changes to Git
2. Push to main branch (auto-deploys to Vercel)
3. For cPanel: run deployment scripts
4. Verify both deployments

## Troubleshooting Guide

### Forms Not Submitting
- Check browser console for errors
- Clear localStorage/sessionStorage
- Verify API endpoint accessible
- Check rate limiting cooldown

### Vtiger Integration Issues
- Verify environment variables
- Check access key is correct
- Ensure custom fields exist
- Test API directly with curl

### Deployment Issues
- Vercel: Check build logs
- cPanel: Verify FTP credentials
- Both: Ensure .env variables set

## Testing Procedures

### Form Testing
```bash
# Test API directly
curl -X POST https://monay.com/api/vtiger \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
```

### Rate Limit Testing
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

## Code Style Guidelines

1. **TypeScript** - Use strict types, avoid `any`
2. **Components** - Functional components with hooks
3. **Async/Await** - Prefer over promises
4. **Error Handling** - Always catch and log errors
5. **Comments** - Only when necessary for clarity

## Performance Considerations

1. **Static Export** - Use for cPanel deployment
2. **API Routes** - Keep lightweight, use edge runtime
3. **Rate Limiting** - Prevent API abuse
4. **Caching** - Use .htaccess for static assets
5. **Bundle Size** - Monitor with `npm run analyze`

## Future Improvements

- [ ] Production reCAPTCHA keys
- [ ] Webhook notifications for leads
- [ ] Lead scoring/qualification
- [ ] Analytics integration
- [ ] A/B testing for forms
- [ ] Email automation
- [ ] CRM dashboard

## Support Information

**Project**: Monay Website
**Repository**: monay-website-static
**Live Sites**: 
- https://monay.com (Vercel)
- https://utilliadmin.com/crm/ (cPanel)

**Documentation**:
- README.md - Project overview
- DEPLOYMENT.md - Deployment guide
- CLAUDE.md - This file

---

Last Updated: December 2024
For: Claude Code (claude.ai/code)