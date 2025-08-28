# AWS Amplify Setup Guide for Monay Website

## Quick Start Deployment Steps

### Step 1: Prepare Your GitHub Repository

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Monay website ready for AWS Amplify"
```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `monay-website`
   - Set as Private (recommended)
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/monay-website.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to AWS Amplify

1. **Sign in to AWS Console**:
   - Go to https://console.aws.amazon.com/amplify
   - Select your preferred region (e.g., us-east-1)

2. **Create New App**:
   - Click "New app" → "Host web app"
   - Choose "GitHub" as your repository service
   - Click "Continue"

3. **Connect to GitHub**:
   - Authorize AWS Amplify to access your GitHub
   - Select repository: `monay-website`
   - Select branch: `main`
   - Click "Next"

4. **Configure Build Settings**:
   - Framework should auto-detect as "Next.js - SSR"
   - Build settings will auto-populate from `amplify.yml`
   - Click "Next"

5. **Configure Environment Variables**:
   Click "Advanced settings" and add these variables:

   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:3001` or your production URL | Backend API endpoint |
   | `DATABASE_URL` | Your PostgreSQL connection string | Database connection |
   | `NUDGE_API_KEY` | Your Nudge API key | CRM integration |
   | `NODE_ENV` | `production` | Environment setting |

6. **Review and Deploy**:
   - Review all settings
   - Click "Save and deploy"

### Step 3: Monitor Deployment

1. **Watch Build Progress**:
   - Amplify will start provisioning resources
   - Build process takes 5-10 minutes initially
   - You can view build logs in real-time

2. **Verify Deployment**:
   - Once complete, click the generated URL
   - Format: `https://main.d1234567890abc.amplifyapp.com`

### Step 4: Configure Custom Domain (Optional)

1. **In Amplify Console**:
   - Go to "Domain management"
   - Click "Add domain"

2. **Add Your Domain**:
   - Enter: `monay.com` or your domain
   - Amplify will automatically set up:
     - SSL certificate
     - www redirect
     - DNS configuration

3. **Update DNS Records**:
   - Add CNAME records as shown by Amplify
   - Wait for DNS propagation (5-30 minutes)

### Step 5: Set Up Continuous Deployment

Amplify automatically sets up CI/CD. Every push to `main` will:

1. Trigger a new build
2. Run tests (if configured)
3. Deploy to production
4. Create preview URLs for pull requests

### Step 6: Configure Branch Deployments (Optional)

1. **Add Development Branch**:
```bash
git checkout -b develop
git push origin develop
```

2. **In Amplify Console**:
   - Go to "Branch deployments"
   - Connect `develop` branch
   - Set different environment variables if needed

### Environment Variables Reference

```bash
# Required for Production
NEXT_PUBLIC_BACKEND_URL=https://api.monay.com  # Your backend API URL
DATABASE_URL=postgresql://...                   # PostgreSQL connection
NUDGE_API_KEY=S'grH6txwh1WG...                 # From NUDGE_INTEGRATION.md

# Optional - Teams Integration
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=...

# Optional - Email Service
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@monay.com

# Optional - Monitoring
NEXT_PUBLIC_SENTRY_DSN=...
DATADOG_API_KEY=...
```

### Build Settings Customization

The `amplify.yml` file controls the build process. Current settings:

- **Node version**: 18 (default)
- **Build command**: `npm run build`
- **Build output**: `.next` directory
- **Caching**: Node modules and npm cache

### Monitoring & Logs

1. **Access Logs**:
   - Build logs: Available during and after build
   - Application logs: CloudWatch integration
   - Access logs: Available in Monitoring tab

2. **Set Up Alarms**:
   - Go to Monitoring → Alarms
   - Set up alerts for:
     - Build failures
     - High error rates
     - Performance issues

### Troubleshooting Common Issues

#### Build Failures

1. **"Module not found" errors**:
   - Check `package.json` dependencies
   - Clear cache in Amplify Console

2. **Environment variable issues**:
   - Verify all required variables are set
   - Check for typos in variable names

3. **Memory errors during build**:
   - Amplify provides 3 GB RAM by default
   - Optimize build process if needed

#### Runtime Issues

1. **API connection failures**:
   - Verify `NEXT_PUBLIC_BACKEND_URL` is correct
   - Check CORS settings on backend

2. **Database connection issues**:
   - Verify `DATABASE_URL` format
   - Check network security settings

### Performance Optimization

1. **Enable Caching**:
   - Already configured in `amplify.yml`
   - Reduces build time by 50-70%

2. **Image Optimization**:
   - Next.js Image component enabled
   - Automatic WebP/AVIF conversion

3. **CDN Configuration**:
   - CloudFront automatically configured
   - Global edge locations for fast delivery

### Security Best Practices

1. **Environment Variables**:
   - Never commit secrets to GitHub
   - Use Amplify Console for sensitive data

2. **Branch Protection**:
   - Enable branch protection on GitHub
   - Require PR reviews before merge

3. **Access Control**:
   - Use IAM roles for Amplify
   - Limit team access as needed

### Cost Estimation

For a typical Monay website:

| Resource | Monthly Usage | Estimated Cost |
|----------|--------------|----------------|
| Build minutes | 500 minutes | $5.00 |
| Hosting | 100 GB transfer | $8.50 |
| Storage | 5 GB | $0.12 |
| **Total** | | **~$14/month** |

*First 1000 build minutes free each month*

### Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to Amplify
3. ✅ Configure environment variables
4. ⬜ Set up custom domain
5. ⬜ Configure monitoring alerts
6. ⬜ Set up staging environment
7. ⬜ Enable preview deployments

### Support Resources

- **AWS Amplify Docs**: https://docs.amplify.aws
- **Next.js on Amplify**: https://docs.amplify.aws/guides/hosting/nextjs
- **Troubleshooting**: https://docs.amplify.aws/guides/hosting/nextjs/troubleshooting

### Quick Commands Reference

```bash
# Check build locally before deploying
npm run build

# Test production build locally
npm run build && npm run start

# View environment variables (don't commit!)
cat .env.local

# Create feature branch with preview
git checkout -b feature/new-feature
git push origin feature/new-feature
# Amplify creates preview URL automatically
```

## Ready to Deploy! 🚀

Your Monay website is now configured for AWS Amplify deployment. Follow the steps above to get your site live in minutes!