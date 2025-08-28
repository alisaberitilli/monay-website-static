# Vercel Deployment Guide

## 🚀 Quick Setup Steps

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `monay-website-static`
3. Description: "Monay static website - Coin-as-a-Service & Wallet-as-a-Service Platform"
4. Keep it **Public** (or Private if you prefer)
5. **DON'T** initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Push to GitHub

After creating the repository, run these commands:

```bash
cd /Users/alisaberi/Downloads/monay/monay-website-static

# Add GitHub remote
git remote add origin https://github.com/alisaberitilli/monay-website-static.git

# Push to GitHub
git push -u origin main
```

If you get authentication errors, use your GitHub personal access token as the password.

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Import from GitHub:
   - Search for `monay-website-static`
   - Click "Import"

### Step 4: Configure Vercel Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `out`
- **Install Command**: `npm install --legacy-peer-deps`

### Step 5: Environment Variables (Optional)

In Vercel dashboard, add these if needed:

```
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/ali-monay
```

### Step 6: Deploy

Click "Deploy" and wait 2-3 minutes. Your site will be live at:
- `https://monay-website-static.vercel.app`
- You can add a custom domain later

## 📝 Important Notes

### EmailJS Configuration
Your EmailJS is already configured in the code:
- Service ID: `service_d8hy50p`
- Template ID: `template_l1hzdda`
- Public Key: `MXz4p9OX623MHn40r`
- All emails go to: `ali@monay.com`

### Reb2b Tracking
Analytics tracking is integrated with key: `VN080HX77V6J`

### Build Issues?
If you encounter peer dependency errors:
1. In Vercel settings, go to "General"
2. Override install command: `npm install --legacy-peer-deps`
3. Redeploy

## 🔄 Automatic Deployments

After initial setup:
- Every push to `main` branch auto-deploys to production
- Create `dev` branch for staging if needed

## 🎯 Custom Domain

To add your domain (e.g., `monay.com`):
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions

## ✅ Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account connected
- [ ] Project imported to Vercel
- [ ] Site deployed successfully
- [ ] Test form submissions (should email ali@monay.com)
- [ ] Verify Reb2b tracking is working

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Static Export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- EmailJS: https://www.emailjs.com/docs/

---

**Repository**: https://github.com/alisaberitilli/monay-website-static
**Live Site**: https://monay-website-static.vercel.app (after deployment)