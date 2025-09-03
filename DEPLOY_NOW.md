# 🚀 QUICK DEPLOYMENT GUIDE

## Choose Your Deployment:

### 1️⃣ **Deploy to Vercel (RECOMMENDED - Full Features)**
```bash
# Run this command:
./deploy-vercel.sh

# Or manually:
git add -A
git commit -m "Add Vtiger integration"
git push origin main
```

**Then add these to Vercel Dashboard → Settings → Environment Variables:**
```
VTIGER_URL=https://utilliadmin.com/crm
VTIGER_USERNAME=admin
VTIGER_ACCESS_KEY=crsogur4p4yvzyur
NEXT_PUBLIC_VTIGER_URL=https://utilliadmin.com/crm
NEXT_PUBLIC_VTIGER_USERNAME=admin
NEXT_PUBLIC_VTIGER_ACCESS_KEY=crsogur4p4yvzyur
EMAIL_TO=ali@monay.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

---

### 2️⃣ **Deploy to cPanel (Static Site)**
```bash
# Run this command:
./deploy-cpanel.sh

# Then:
1. Login to cPanel
2. Upload 'out' folder contents to public_html
3. Update .htaccess file
```

---

## ✅ What's Included:

- **Vtiger CRM Integration** - All forms create leads
- **DDOS Protection** - 5-minute cooldown between submissions
- **reCAPTCHA v3** - Invisible bot protection
- **Submit Button Disabling** - Prevents duplicates
- **Browser Fingerprinting** - Advanced protection
- **Source URL Tracking** - Know where leads come from

## 🔍 Testing After Deployment:

1. Submit a form on production
2. Check Vtiger CRM for new lead
3. Try submitting again (should be blocked)
4. Check browser console for success messages

## ⚠️ Important Notes:

- **Vercel**: Full functionality with API routes
- **cPanel**: Static only, uses client-side fallback
- **reCAPTCHA**: Using test keys - get production keys from Google

## 📞 Issues?

Check:
- Vercel Dashboard logs
- Browser console for errors
- Vtiger CRM admin panel
- Network tab in browser DevTools

---

**Ready? Run `./deploy-vercel.sh` to deploy to production!**