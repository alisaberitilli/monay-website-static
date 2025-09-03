# 🚀 Production Deployment Checklist

## Phase 1: Vercel Deployment (monay.com)

### Pre-Deployment Steps:
1. [ ] Test all forms locally one more time
2. [ ] Ensure Vtiger production is accessible
3. [ ] Have production environment variables ready

### Environment Variables for Vercel:
```bash
# Vtiger Production
VTIGER_URL=https://utilliadmin.com/crm
VTIGER_USERNAME=admin
VTIGER_ACCESS_KEY=[YOUR_PRODUCTION_ACCESS_KEY]
NEXT_PUBLIC_VTIGER_URL=https://utilliadmin.com/crm
NEXT_PUBLIC_VTIGER_USERNAME=admin

# Email
EMAIL_TO=ali@monay.com

# reCAPTCHA (Get real keys from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=[YOUR_PRODUCTION_SITE_KEY]
RECAPTCHA_SECRET_KEY=[YOUR_PRODUCTION_SECRET_KEY]
```

### Deployment Commands:
```bash
# 1. Commit changes
git add .
git commit -m "Add Vtiger CRM integration with DDOS protection and reCAPTCHA v3"

# 2. Push to GitHub (triggers Vercel auto-deploy)
git push origin main

# 3. Or deploy directly with Vercel CLI
vercel --prod
```

---

## Phase 2: cPanel Static Deployment

### Build Static Export:
```bash
# 1. Build static version
npm run build:cpanel

# 2. Files will be in 'out' directory
ls -la out/
```

### Upload to cPanel:
1. [ ] Login to cPanel
2. [ ] Navigate to File Manager
3. [ ] Go to public_html directory
4. [ ] Upload contents of 'out' folder
5. [ ] Ensure .htaccess is configured properly

### Required .htaccess for cPanel:
```apache
# Enable clean URLs
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Handle Next.js routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1.html [L]

# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
```

---

## Phase 3: API Deployment (for cPanel)

Since cPanel can't run Node.js API routes, deploy API separately to Vercel:

### Deploy API Only:
```bash
cd api-only
npm install
vercel --prod
```

### Update cPanel Environment:
Add to your static build environment:
```bash
NEXT_PUBLIC_API_URL=https://monay-api.vercel.app
```

---

## Phase 4: Testing Production

### Test Checklist:
1. [ ] Test form submission on production
2. [ ] Verify Vtiger leads are created
3. [ ] Check reCAPTCHA is working
4. [ ] Test rate limiting (DDOS protection)
5. [ ] Verify email notifications

### Monitor:
- Vercel Dashboard: https://vercel.com/dashboard
- Vtiger CRM: https://utilliadmin.com/crm
- Browser Console for errors

---

## Rollback Plan

### If Issues on Vercel:
```bash
# Revert to previous deployment
vercel rollback
```

### If Issues on cPanel:
1. Keep backup of previous files
2. Restore from backup if needed

### If Vtiger Issues:
1. Change access key in Vtiger
2. Update environment variables
3. Redeploy

---

## Important Notes

1. **Security**: Never commit access keys to Git
2. **Testing**: Always test on staging first
3. **Backup**: Keep backups before deployment
4. **Monitor**: Check logs after deployment

## Support Contacts
- Vtiger Issues: Check admin panel
- Vercel Issues: https://vercel.com/support
- cPanel Issues: Contact hosting provider

---

## Post-Deployment

1. [ ] Monitor form submissions for 24 hours
2. [ ] Check Vtiger for proper lead creation
3. [ ] Review rate limiting effectiveness
4. [ ] Gather user feedback

✅ Deployment Complete!