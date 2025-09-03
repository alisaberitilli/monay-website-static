#!/bin/bash

# FTP Upload Script for Monay Website to cPanel
# Configure your FTP details below

# FTP Configuration (Update these with your actual credentials)
FTP_HOST="utilliadmin.com"
FTP_USER="your-ftp-username"
FTP_PASS="your-ftp-password"
FTP_DIR="/public_html"  # Target directory on server

# Local directory to upload
LOCAL_DIR="out"

echo "🚀 Uploading Monay Website to cPanel"
echo "===================================="
echo "Target: $FTP_HOST$FTP_DIR"
echo ""

# Check if out directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Error: 'out' directory not found. Run build:cpanel first."
    exit 1
fi

# Create a temporary FTP script
cat > ftp_commands.txt << EOF
open $FTP_HOST
user $FTP_USER $FTP_PASS
binary
cd $FTP_DIR
lcd $LOCAL_DIR
prompt off
mput -r *
put .htaccess
bye
EOF

echo "📤 Starting FTP upload..."
echo "This may take several minutes depending on your connection..."

# Execute FTP upload
ftp -n < ftp_commands.txt

# Clean up
rm ftp_commands.txt

echo ""
echo "✅ Upload complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Visit https://monay.com to verify the deployment"
echo "2. Test form submissions"
echo "3. Check browser console for any errors"
echo ""
echo "⚠️  Important:"
echo "- Ensure Vercel API is running with proper environment variables"
echo "- The site will use Vercel-hosted API for form processing"