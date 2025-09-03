# cPanel Deployment Guide for Monay Website

## Overview
This guide explains how to deploy the Monay website to cPanel hosting while keeping the API on Vercel for processing form submissions and Vtiger CRM integration.

## Architecture
- **Static Website**: Hosted on cPanel (https://monay.com)
- **API Backend**: Hosted on Vercel (handles form processing, Vtiger integration)
- **Vtiger CRM**: Production instance at utilliadmin.com

## Prerequisites
- Access to cPanel hosting account
- FTP client (FileZilla) or cPanel File Manager access
- Node.js installed locally for building
- Git repository access

## Quick Deployment

### Option 1: Automated Script (Recommended)
```bash
# Make the script executable
chmod +x deploy-cpanel.sh

# Run the deployment script
./deploy-cpanel.sh
```

This script will:
1. Set up environment variables
2. Build the static export
3. Create proper .htaccess file
4. Generate a deployment package (zip file)

### Option 2: Manual Build
```bash
# Set environment variables
echo "NEXT_PUBLIC_API_URL=https://monay.com" > .env.local
echo "NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" >> .env.local

# Install dependencies
npm install

# Build static export
npm run build:cpanel
```

## Upload to cPanel

### Method 1: Using cPanel File Manager (Easiest)
1. Login to your cPanel account
2. Open **File Manager**
3. Navigate to `public_html` directory
4. **Delete or backup** existing files if needed
5. Click **Upload** button
6. Either:
   - Upload the generated `monay-cpanel-deploy-*.zip` and extract it
   - Upload all files from `out` folder individually
7. Ensure `.htaccess` file is uploaded (may be hidden - enable "Show Hidden Files")

### Method 2: Using FTP (FileZilla)
```bash
# FTP Connection Details
Server: ftp.monay.com (or your cPanel server)
Username: your-cpanel-username
Password: your-cpanel-password
Port: 21
Protocol: FTP or SFTP

# Steps:
1. Connect to server
2. Navigate to /public_html
3. Upload all contents from 'out' folder
4. Ensure .htaccess is uploaded
```

### Method 3: Using Command Line (Advanced)
```bash
# Using rsync (if SSH access available)
rsync -avz --delete out/ username@monay.com:~/public_html/

# Using lftp
lftp ftp://username:password@monay.com -e "mirror -R out/ /public_html; quit"
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

## Verification Checklist

After deployment, verify:

- [ ] Website loads at https://monay.com
- [ ] All pages navigate correctly
- [ ] Forms display properly
- [ ] Submit a test form on /signup/monay-id
- [ ] Check Vtiger CRM for new lead
- [ ] Verify rate limiting works (try submitting twice)
- [ ] Check browser console for any errors
- [ ] Test on mobile devices

## Troubleshooting

### Issue: Forms not submitting
```bash
# Check if API is accessible
curl https://monay.com/api/health

# Check browser console for:
- Network errors
- CORS issues
- 404/500 errors
```

**Solutions:**
- Verify Vercel deployment is running
- Check environment variables in Vercel dashboard
- Ensure API URL is correct in built files

### Issue: 404 errors on page refresh
**Solution:** Ensure .htaccess file is properly uploaded with rewrite rules

### Issue: CORS errors
**Solution:** Vercel API already has CORS configured. If issues persist, check:
- API URL matches exactly (no trailing slash)
- HTTPS is being used

### Issue: Rate limiting too aggressive
**Solution:** Forms have 5-minute cooldown. Clear browser localStorage to reset:
```javascript
localStorage.clear()
sessionStorage.clear()
```

### Issue: reCAPTCHA not working
**Solution:** Current keys are test keys. For production:
1. Go to https://www.google.com/recaptcha/admin
2. Register domain: monay.com
3. Get new keys and update in Vercel dashboard

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