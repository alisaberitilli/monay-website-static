#!/bin/bash

# Deploy to cPanel Script
# This script builds a static export and prepares it for cPanel deployment

echo "🚀 Building Static Export for cPanel Deployment"
echo "=============================================="

# Step 1: Set environment variables for static build
echo "📝 Setting environment variables for static build..."
cat > .env.local << EOF
# API endpoint (Vercel-hosted API)
NEXT_PUBLIC_API_URL=https://monay.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
EOF

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Build static export
echo "🔨 Building static export..."
npm run build:cpanel

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Build failed! 'out' directory not created."
    exit 1
fi

# Step 4: Create .htaccess file for cPanel
echo "📝 Creating .htaccess file..."
cat > out/.htaccess << 'EOF'
# Enable URL rewriting
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Handle client-side routing - redirect all non-file requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Cache control for static assets
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>

# Cache control for HTML
<FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</FilesMatch>

# Compress text files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Prevent directory listing
Options -Indexes

# Block access to hidden files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
EOF

# Step 5: Create deployment info file
echo "📝 Creating deployment info..."
cat > out/deploy-info.txt << EOF
Deployment Date: $(date)
Build Type: Static Export for cPanel
API Endpoint: https://monay.com/api
EOF

# Step 6: Create a zip file for easy upload
echo "📦 Creating deployment package..."
cd out
zip -r ../monay-cpanel-deploy-$(date +%Y%m%d-%H%M%S).zip .
cd ..

echo ""
echo "✅ Build complete! Static files ready in 'out' directory"
echo ""
echo "📋 Next Steps:"
echo "1. Upload the contents of 'out' folder to your cPanel public_html"
echo "   OR use the generated zip file: monay-cpanel-deploy-*.zip"
echo ""
echo "2. Using cPanel File Manager:"
echo "   - Login to cPanel"
echo "   - Go to File Manager → public_html"
echo "   - Upload all files from 'out' folder"
echo "   - Make sure .htaccess is uploaded"
echo ""
echo "3. Using FTP (FileZilla, etc):"
echo "   - Connect to your server"
echo "   - Navigate to public_html"
echo "   - Upload all files from 'out' folder"
echo ""
echo "4. Verify deployment:"
echo "   - Visit https://monay.com"
echo "   - Test form submissions"
echo "   - Check browser console for any errors"
echo ""
echo "⚠️  Important Notes:"
echo "- The site will use Vercel-hosted API for form processing"
echo "- Ensure Vercel deployment is running with proper env variables"
echo "- For production, update reCAPTCHA keys"