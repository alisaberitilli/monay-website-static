#!/bin/bash

echo "📦 Building Static Export for cPanel"
echo "===================================="

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf out

# Build the application
echo "🔨 Building application..."
npm run build

# Export static files
echo "📤 Exporting static files..."
npm run export

# Check if build was successful
if [ -d "out" ]; then
    echo "✅ Build successful! Files are in 'out' directory"
    echo ""
    echo "📁 Build size:"
    du -sh out
    echo ""
    echo "📋 Next Steps for cPanel Deployment:"
    echo "1. Login to your cPanel"
    echo "2. Navigate to File Manager"
    echo "3. Go to public_html directory"
    echo "4. Upload all contents from 'out' folder"
    echo "5. Create/update .htaccess file with:"
    echo ""
    echo "RewriteEngine On"
    echo "RewriteCond %{HTTPS} off"
    echo "RewriteRule ^(.*)$ https://%{HTTP_HOST}/\$1 [R=301,L]"
    echo ""
    echo "# Handle Next.js routes"
    echo "RewriteCond %{REQUEST_FILENAME} !-f"
    echo "RewriteCond %{REQUEST_FILENAME} !-d"
    echo "RewriteRule ^(.*)$ /\$1.html [L]"
    echo ""
    echo "⚠️  Note: API routes won't work on static hosting"
    echo "    Forms will use client-side Vtiger integration as fallback"
else
    echo "❌ Build failed! Please check for errors above."
    exit 1
fi