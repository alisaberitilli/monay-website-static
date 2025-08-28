# MONAY Website

A modern, responsive website for MONAY's Coin-as-a-Service and Wallet-as-a-Service platform, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (already installed)
- npm (already installed)
- PostgreSQL 15+ (for local development)

### Installation
The project is already set up with all dependencies installed.

### Database Setup (Local Development)

#### 1. Install PostgreSQL
```bash
# Install PostgreSQL 15
brew install postgresql@15

# Add to PATH (add this to your ~/.zshrc)
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Start PostgreSQL service
brew services start postgresql@15
```

#### 2. Create Database and User
```bash
# Create database
createdb monay_otp

# Create superuser
createuser -s monay_user
```

#### 3. Configure Environment
Copy `.env.local.example` to `.env.local` and add:
```bash
POSTGRES_URL=postgresql://monay_user@localhost:5432/monay_otp
NUDGE_API_KEY=your_nudge_api_key
NUDGE_SMS_API_KEY=your_nudge_sms_api_key
```

#### 4. Verify Database Connection
```bash
# Test connection
psql -d monay_otp -U monay_user -c "\l"

# Should show monay_otp database in the list
```

### Development
To start the development server:

```bash
npm run dev
```

The website will be available at [http://localhost:3000](http://localhost:3000).

### Build
To build the project for production:

```bash
npm run build
```

### Start Production Server
To start the production server:

```bash
npm start
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons (SVG)
- **Fonts**: Geist Sans & Geist Mono

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main homepage with OTP forms
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   ├── favicon.ico       # Website icon
│   └── api/              # API routes
│       ├── send-otp/     # OTP generation endpoint
│       └── verify-otp/   # OTP verification endpoint
├── components/            # React components (can be added)
└── lib/                  # Utility functions
    ├── nudge-api.ts      # Nudge API integration
    ├── nudge-config.ts   # API configuration
    └── otp-store.ts      # Hybrid OTP storage system
```

## 🔐 OTP System Architecture

### Storage Strategy
- **Local Development**: PostgreSQL database with in-memory fallback
- **Fallback**: Global in-memory Map for reliability

### API Endpoints
- **`/api/send-otp`**: Generates and sends OTP via Nudge API
- **`/api/verify-otp`**: Verifies OTP and manages user state

### Verification Flow
1. User submits enrollment form (email + mobile)
2. Email OTP sent and verified first
3. Mobile OTP sent and verified second
4. Sequential verification ensures proper flow

## 🎨 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional design with gradients and animations
- **Navigation**: Sticky navigation with smooth scrolling
- **Sections**: Hero, Services, Platform, Partners, and Contact
- **Interactive Elements**: Hover effects and smooth transitions
- **Business Focus**: Coin-as-a-Service, Wallet-as-a-Service, USDM stablecoin platform
- **OTP System**: Email and SMS verification with Nudge API integration
- **Database Integration**: Hybrid storage (PostgreSQL + in-memory fallback)

## 🔧 Customization

### Colors
The website uses a blue-purple color scheme. You can customize colors in the Tailwind classes throughout the components.

### Content
Edit the content in `src/app/page.tsx` to match your business needs.

### Styling
Modify the Tailwind classes or add custom CSS in `src/app/globals.css`.

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

This project can be easily deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Any static hosting service

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🧪 Testing

### Automated OTP Testing

The project includes comprehensive automated testing for the OTP system:

#### Quick Test (npm script)
```bash
npm run test:otp
```

#### Direct Test
```bash
node test-otp-system.js
```

#### Shell Script (CI/CD friendly)
```bash
./run-otp-tests.sh
```

#### What Gets Tested
- ✅ **Email OTP**: Send and verify functionality
- ✅ **SMS OTP**: Send and verify functionality  
- ✅ **Error Handling**: Invalid OTPs, missing fields
- ✅ **Database Cleanup**: PostgreSQL storage verification
- ✅ **API Responses**: Proper JSON formatting and status codes

#### Test Results
- **PASS**: All tests successful (exit code 0)
- **FAIL**: Some tests failed (exit code 1)
- **Duration**: Total test execution time
- **Success Rate**: Percentage of passed tests

### Manual Testing

Test individual endpoints:
```bash
# Email OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@monay.com", "fullName": "Test User"}'

# SMS OTP  
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "3016821633", "fullName": "Test User"}'
```

## 🔧 Troubleshooting

### PostgreSQL Issues
- **Port 5432 already in use**: Check for other PostgreSQL instances with `lsof -i :5432`
- **Permission denied**: Ensure `monay_user` has proper privileges
- **Connection failed**: Verify service is running with `brew services list`

### OTP System Issues
- **"No POSTGRES_URL found"**: Check `.env.local` file and restart dev server
- **"Postgres connection failed"**: Verify database is running and accessible
- **OTP not received**: Check Nudge API keys and network connectivity

### Development Server Issues
- **Port conflicts**: Kill existing processes with `pkill -f "next dev"`
- **Build errors**: Clear cache with `rm -rf .next && npm run dev`

---

Built with ❤️ using Next.js and Tailwind CSS
