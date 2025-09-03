# Deployment Documentation - Monay Website

## Current Live Deployments

### 1. Vercel (Primary) - https://monay.com
- **Status**: ✅ Live
- **Type**: Full Next.js application with API routes
- **Auto-deploy**: Yes (from GitHub main branch)
- **Last Updated**: December 2024

### 2. cPanel (Static) - https://utilliadmin.com/crm/
- **Status**: ✅ Live  
- **Type**: Static HTML export
- **Hosting**: utilliadmin.com cPanel
- **Last Updated**: December 2024

## Credentials & Access

### GitHub Repository
```
Repository: monay-website-static
Branch: main
Auto-deploy: Enabled to Vercel
```

### Vercel Account
```
Project: monay-website-static
Domain: monay.com
Dashboard: https://vercel.com/dashboard
```

### cPanel FTP Access
```
Host: utilliadmin.com
Username: claudeftp_8987@utilliadmin.com
Password: vahnov-vupmet-2vyQvi
Protocol: FTP (port 21)
Path: /public_html/crm/
```

### Vtiger CRM Production
```
URL: https://utilliadmin.com/crm
Admin URL: https://utilliadmin.com/crm/index.php
Username: admin
Access Key: crsogur4p4yvzyur
```

## Environment Variables (Vercel)

These must be set in Vercel Dashboard → Settings → Environment Variables:

```env
# Vtiger CRM Configuration
VTIGER_URL=https://utilliadmin.com/crm
VTIGER_USERNAME=admin
VTIGER_ACCESS_KEY=crsogur4p4yvzyur

# Email Configuration
EMAIL_TO=ali@monay.com

# Google reCAPTCHA v3 (Currently using test keys!)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# API URL for static builds
NEXT_PUBLIC_API_URL=https://monay.com
```

## Deployment Procedures

### Deploy to Vercel (Automatic)
```bash
# Any push to main branch triggers deployment
git add -A
git commit -m "Your changes"
git push origin main

# Monitor deployment at:
# https://vercel.com/dashboard
```

### Deploy to cPanel (Manual)

#### Method 1: Using Scripts
```bash
# Step 1: Build static export
./deploy-cpanel.sh

# Step 2: Upload to cPanel
./deploy-to-cpanel.sh
# Enter FTP credentials when prompted
```

#### Method 2: Direct FTP with lftp
```bash
# Build first
NEXT_CONFIG=static npm run build

# Then upload
lftp -c "
set ssl:verify-certificate no
set ftp:ssl-allow no
open ftp://claudeftp_8987%40utilliadmin.com:vahnov-vupmet-2vyQvi@utilliadmin.com
cd /public_html/crm/
lcd out/
mirror -R . . --parallel=3 --verbose
put .htaccess
bye
"
```

#### Method 3: Using cPanel File Manager
1. Build locally: `NEXT_CONFIG=static npm run build`
2. Login to cPanel at utilliadmin.com
3. Navigate to File Manager
4. Go to `/public_html/crm/`
5. Upload contents of `out/` folder
6. Ensure `.htaccess` is uploaded

## Important Files

### Configuration Files
- `next.config.ts` - Main Next.js config (supports static export)
- `next.config.static.js` - Static export config (backup)
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables

### Deployment Scripts
- `deploy-cpanel.sh` - Builds static export
- `deploy-to-cpanel.sh` - Uploads to cPanel via FTP
- `deploy-vercel.sh` - Deploys to Vercel
- `ftp-upload.sh` - Basic FTP upload script

### Critical Files for cPanel
- `.htaccess` - URL rewriting and caching rules
- `out/` - Static export directory
- All files in `out/_next/static/` - JavaScript and CSS assets

## Monitoring & Verification

### Check Vercel Deployment
1. Visit https://vercel.com/dashboard
2. Check deployment status
3. View Function logs for API errors
4. Test forms at https://monay.com

### Check cPanel Deployment
1. Visit https://utilliadmin.com/crm/
2. Open browser console for errors
3. Test navigation between pages
4. Verify forms submit to Vercel API

### Verify Vtiger Integration
1. Submit test form
2. Login to Vtiger: https://utilliadmin.com/crm
3. Check Leads module for new entries
4. Verify all form data in lead description

## Rollback Procedures

### Vercel Rollback
1. Go to https://vercel.com/dashboard
2. Select project
3. Go to Deployments
4. Find previous working deployment
5. Click "..." menu → "Promote to Production"

### cPanel Rollback
1. Keep backup of previous deployment
2. Via FTP, delete current files in `/public_html/crm/`
3. Upload backup files
4. Verify `.htaccess` is correct

## Troubleshooting

### Form Submission Issues
```bash
# Test API directly
curl -X POST https://monay.com/api/vtiger \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","formType":"Test"}'

# Check rate limiting
# In browser console:
localStorage.clear()
sessionStorage.clear()
```

### Vercel Build Failures
1. Check build logs in Vercel dashboard
2. Common issues:
   - TypeScript errors
   - Missing environment variables
   - Package dependency issues

### cPanel Issues
1. Check `.htaccess` file exists
2. Verify file permissions (644 for files, 755 for directories)
3. Check error logs in cPanel

### Vtiger Connection Issues
1. Verify access key is correct
2. Check Vtiger server is accessible
3. Ensure custom fields exist (cf_913, cf_915, cf_917, cf_919)
4. Test API endpoint directly

## Security Checklist

- [ ] Never commit credentials to Git
- [ ] Use environment variables for sensitive data
- [ ] Update reCAPTCHA keys for production
- [ ] Monitor for spam submissions
- [ ] Review rate limiting effectiveness
- [ ] Check for unusual API usage
- [ ] Rotate access keys periodically
- [ ] Keep backups before deployments

## Performance Optimization

### Vercel
- API routes use edge functions
- Static assets cached with CDN
- Rate limiting prevents abuse

### cPanel
- Static HTML serves fast
- `.htaccess` enables caching
- Gzip compression enabled
- No server-side processing needed

## Support Information

### Technical Stack
- Frontend: Next.js 15.4.7 with TypeScript
- API: Vercel Functions (Node.js)
- CRM: Vtiger 8.x
- Protection: reCAPTCHA v3 + Custom Rate Limiting
- Deployment: Vercel + cPanel

### Key Features Implemented
1. Vtiger CRM REST API integration
2. Comprehensive form data capture
3. Source URL tracking
4. Browser fingerprinting
5. Rate limiting (5-minute cooldown)
6. reCAPTCHA v3 (invisible)
7. Submit button disabling
8. Dual deployment support

## Maintenance Schedule

### Daily
- Monitor form submissions in Vtiger
- Check for API errors in Vercel logs

### Weekly
- Review rate limiting effectiveness
- Check for spam submissions
- Verify both deployments are accessible

### Monthly
- Update dependencies (`npm update`)
- Review and rotate access keys
- Check for security updates
- Backup current deployments

### Quarterly
- Full security audit
- Performance review
- Update documentation
- Test disaster recovery

---

**Last Updated**: December 2024
**Maintained By**: Monay Development Team
**Documentation By**: Claude Code (claude.ai/code)