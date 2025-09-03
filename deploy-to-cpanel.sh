#!/bin/bash

# Secure deployment script for Monay website to cPanel
# This script uses lftp for secure FTP upload

echo "🚀 Deploying Monay Website to Production (cPanel)"
echo "================================================"

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Error: 'out' directory not found."
    echo "Run 'npm run build:cpanel' first to create the static export."
    exit 1
fi

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo "❌ Error: lftp is not installed."
    echo "Install it with: brew install lftp"
    exit 1
fi

# Prompt for FTP credentials (secure - not stored in script)
echo ""
echo "Please enter your cPanel FTP credentials:"
read -p "FTP Host (e.g., ftp.utilliadmin.com): " FTP_HOST
read -p "FTP Username: " FTP_USER
read -s -p "FTP Password: " FTP_PASS
echo ""
read -p "Target directory (default: /public_html): " FTP_DIR
FTP_DIR=${FTP_DIR:-/public_html}

echo ""
echo "📤 Starting deployment to $FTP_HOST$FTP_DIR"
echo "This may take several minutes..."

# Create backup of current site (optional)
BACKUP_DIR="${FTP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup at $BACKUP_DIR..."

# Use lftp to upload files
lftp -c "
set ssl:verify-certificate no
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
mirror -R out/ $FTP_DIR --parallel=5 --verbose
put out/.htaccess -o $FTP_DIR/.htaccess
bye
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Post-Deployment Checklist:"
    echo "[ ] Visit https://monay.com to verify the site loads"
    echo "[ ] Test navigation between pages"
    echo "[ ] Submit a test form on /signup/monay-id"
    echo "[ ] Check Vtiger CRM for the test lead"
    echo "[ ] Verify rate limiting (try submitting form twice)"
    echo "[ ] Test on mobile devices"
    echo ""
    echo "⚠️  Important Notes:"
    echo "- Forms will submit to Vercel-hosted API"
    echo "- Ensure Vercel has proper environment variables set"
    echo "- Monitor browser console for any errors"
    echo "- For production, update reCAPTCHA keys"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check your FTP credentials and connection."
fi