# Vercel Deployment Fix Guide

## Problem
Your GitHub account requires re-authentication in Vercel, but the reauthorization is not working.

## Solution Options

### Option 1: Deploy Using Vercel CLI (Fastest)

1. **Login to Vercel CLI:**
   ```bash
   vercel login
   ```
   Enter your email when prompted.

2. **Link your project:**
   ```bash
   vercel link
   ```
   - Choose "Link to existing project" if you have one
   - Or create a new project

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Option 2: Fix GitHub Integration in Vercel Dashboard

1. **Go to Vercel Dashboard** → Settings → Integrations
2. **Remove GitHub integration completely:**
   - Click on GitHub integration
   - Click "Configure"
   - Scroll down and click "Uninstall"

3. **Re-add GitHub integration:**
   - Go back to Integrations
   - Click "Browse Marketplace"
   - Find GitHub and click "Add"
   - Authorize Vercel to access your repositories
   - Select the repository: `alisaberitilli/monay-website-static`

4. **Import project again:**
   - Go to Vercel dashboard
   - Click "Add New Project"
   - Import from GitHub
   - Select `monay-website-static`
   - Use these settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `out`
     - Install Command: `npm install --legacy-peer-deps`

### Option 3: Import from Git URL (Alternative)

1. **In Vercel Dashboard:**
   - Click "Add New Project"
   - Click "Import Third-Party Git Repository"
   - Enter: `https://github.com/alisaberitilli/monay-website-static.git`
   - Configure with same settings as Option 2

### Option 4: Deploy from Local Directory

1. **Build locally first:**
   ```bash
   npm run build
   ```

2. **Deploy the built files:**
   ```bash
   vercel --prebuilt --prod
   ```

## Current Project Status

✅ **Code is ready:** All SEO files have been added and committed
✅ **GitHub is updated:** Latest code is pushed to main branch
✅ **Build works:** Project builds successfully locally

## Files Added in Latest Deployment

- `sitemap.xml` - Search engine sitemap
- `robots.txt` - Crawler instructions
- `seo-meta-tags.html` - SEO templates
- `search-engine-submission.py` - Submission script
- `search-engine-submission-auto.py` - Automated submission
- `SEARCH_ENGINE_SUBMISSION_GUIDE.md` - SEO guide

## Quick Vercel CLI Commands

```bash
# Login to Vercel
vercel login

# Link to project (interactive)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Important Notes

- The project uses Next.js 15.4.7
- Node.js version required: >=18.0.0
- Uses `--legacy-peer-deps` flag for npm install
- Static export configured with `output: 'export'` in next.config.ts

## Need Help?

If none of these options work:
1. Try clearing browser cookies for vercel.com
2. Use a different browser or incognito mode
3. Contact Vercel support at support@vercel.com with your project details