# cPanel Deployment Guide for Monay Website

## Prerequisites
- Access to cPanel hosting account
- Node.js support on your hosting (if available)
- FTP/File Manager access

## Static Export Deployment (Recommended for cPanel)

### Step 1: Build Static Version
```bash
# Build the static version
npm run build:cpanel
```

This creates an `out` directory with static HTML/CSS/JS files.

### Step 2: Configure API Endpoint
Since cPanel hosts static files, the API needs to be hosted separately (Vercel).

Edit `.env.local` before building:
```
NEXT_PUBLIC_API_URL=https://monay-api.vercel.app
```

### Step 3: Upload to cPanel

#### Option A: Using cPanel File Manager
1. Login to cPanel
2. Navigate to File Manager
3. Go to `public_html` directory
4. Upload contents of `out` folder (not the folder itself)
5. Ensure `.htaccess` file is uploaded

#### Option B: Using FTP
```bash
# Connect via FTP client (FileZilla, etc.)
Server: your-domain.com
Username: your-cpanel-username
Password: your-cpanel-password
Port: 21

# Upload contents of 'out' folder to public_html
```

### Step 4: Configure .htaccess
Create/update `.htaccess` in public_html:
```apache
# Enable URL rewriting
RewriteEngine On

# Redirect all requests to index.html for client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"

# Cache control for static assets
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js)$">
Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

## API Endpoint Architecture

Since cPanel typically doesn't support Node.js APIs:

### Current Setup:
- **Static Site**: Hosted on cPanel (https://monay.com)
- **API Server**: Hosted on Vercel (https://monay-api.vercel.app)
- **Form Submissions**: Static site → Vercel API → Vtiger CRM

### API Routes on Vercel:
- `/api/vtiger` - Handles Vtiger CRM integration
- `/api/send-email` - Email notifications
- `/api/verify-recaptcha` - reCAPTCHA verification

## Environment Variables

### For Static Build (in .env.local before building):
```
NEXT_PUBLIC_API_URL=https://monay-api.vercel.app
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

### For Vercel API (set in Vercel Dashboard):
```
VTIGER_URL=https://utilliadmin.com/crm
VTIGER_USERNAME=admin
VTIGER_ACCESS_KEY=crsogur4p4yvzyur
EMAIL_TO=ali@monay.com
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## Testing

### 1. Test Form Submission
- Visit https://monay.com/signup/monay-id
- Submit a test form
- Check browser console for API responses
- Verify lead created in Vtiger CRM

### 2. Test Rate Limiting
- Try submitting form multiple times
- Should see cooldown message after first submission

### 3. Test reCAPTCHA
- Forms should work without visible CAPTCHA
- Bot-like behavior should be blocked

## Troubleshooting

### Issue: Forms not submitting
- Check browser console for errors
- Verify API URL is correct in page source
- Ensure Vercel API is running

### Issue: CORS errors
- Vercel API already configured with proper CORS headers
- No additional configuration needed

### Issue: 404 errors on page refresh
- Ensure .htaccess rewrite rules are in place
- Check that index.html exists in root

## Rollback Plan

If issues occur:
1. Keep backup of previous `public_html` content
2. To rollback: Delete new files, restore backup
3. DNS changes not required (using same domain)

## Monitoring

### Check API Health:
```bash
curl https://monay-api.vercel.app/api/health
```

### View Vercel Logs:
1. Go to https://vercel.com/dashboard
2. Select project
3. View Functions logs

## Support

For issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Verify environment variables in both environments
4. Test API endpoints directly with curl/Postman