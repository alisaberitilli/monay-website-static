#!/bin/bash

echo "🚀 Deploying to Vercel (monay.com)"
echo "=================================="

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Committing changes..."
    git add -A
    git commit -m "Deploy: Vtiger CRM integration with DDOS protection and reCAPTCHA v3

- Added Vtiger REST API integration for all forms
- Implemented reCAPTCHA v3 (invisible/frictionless)
- Added DDOS protection with rate limiting
- Browser fingerprinting to prevent abuse
- Submit button disabling after submission
- Comprehensive form data capture in lead description
- Source URL tracking for all submissions"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Push to GitHub (triggers Vercel auto-deploy)
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment triggered!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Watch the deployment progress"
echo "3. Add environment variables if not already set:"
echo "   - VTIGER_URL=https://utilliadmin.com/crm"
echo "   - VTIGER_USERNAME=admin"
echo "   - VTIGER_ACCESS_KEY=crsogur4p4yvzyur"
echo "   - EMAIL_TO=ali@monay.com"
echo "   - NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
echo "   - RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
echo ""
echo "🔗 Your site will be live at: https://monay.com"