# Local PostgreSQL Setup Guide

This guide walks you through setting up PostgreSQL locally for the MONAY website OTP system.

## 🐘 PostgreSQL Installation (macOS)

### 1. Install PostgreSQL via Homebrew

```bash
# Install PostgreSQL 15
brew install postgresql@15

# Add to PATH (add this to your ~/.zshrc)
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Reload your shell or run:
source ~/.zshrc

# Start PostgreSQL service
brew services start postgresql@15
```

### 2. Verify Installation

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Should show: postgresql@15 started
```

### 3. Create Database and User

```bash
# Create the OTP database
createdb monay_otp

# Create a superuser for the application
createuser -s monay_user

# Verify database was created
psql -l | grep monay_otp
```

### 4. Test Connection

```bash
# Test connection to the database
psql -d monay_otp -U monay_user -c "\l"

# Should list all databases including monay_otp
```

## ⚙️ Environment Configuration

### 1. Update .env.local

Add or update your `.env.local` file with:

```bash
# Local PostgreSQL connection
POSTGRES_URL=postgresql://monay_user@localhost:5432/monay_otp

# Nudge API Keys (your existing keys)
NUDGE_API_KEY=your_nudge_api_key_here
NUDGE_SMS_API_KEY=your_nudge_sms_api_key_here
```

### 2. Restart Development Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Verification

When you restart the development server, you should see:

```
✅ Local PostgreSQL available, using database storage
✅ Local PostgreSQL OTP table initialized successfully
```

If you see fallback messages, check the troubleshooting section below.

## 🛠️ Database Management

### View OTP Table Structure

```bash
psql -d monay_otp -U monay_user -c "\d otp_store"
```

### View Stored OTPs

```bash
psql -d monay_otp -U monay_user -c "SELECT * FROM otp_store;"
```

### Clear All OTPs

```bash
psql -d monay_otp -U monay_user -c "DELETE FROM otp_store;"
```

### Drop and Recreate Database (if needed)

```bash
dropdb monay_otp
createdb monay_otp
```

## 🔧 Troubleshooting

### PostgreSQL Not Starting

```bash
# Check if port 5432 is already in use
lsof -i :5432

# If another PostgreSQL instance is running, stop it
brew services stop postgresql
brew services stop postgresql@14  # if you have older versions

# Start PostgreSQL 15
brew services start postgresql@15
```

### Connection Failed

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Check logs
tail -f /opt/homebrew/var/log/postgresql@15.log

# Restart PostgreSQL
brew services restart postgresql@15
```

### Permission Issues

```bash
# Ensure monay_user has superuser privileges
psql -d postgres -c "ALTER USER monay_user WITH SUPERUSER;"

# Or recreate the user
dropuser monay_user
createuser -s monay_user
```

### Environment Variables Not Loading

```bash
# Verify .env.local exists and has correct format
cat .env.local

# Restart development server completely
pkill -f "next dev"
npm run dev
```

## 🚀 Testing OTP System

### 1. Test Email OTP

1. Go to `http://localhost:3000`
2. Fill out the "Pilot Coin Program Application" form
3. Click "Send OTP" for email verification
4. Check console logs for PostgreSQL storage confirmation

### 2. Test SMS OTP

1. After email verification, the mobile OTP section will appear
2. Enter a 10-digit US mobile number
3. Click "Send OTP" for mobile verification
4. Check console logs for PostgreSQL storage confirmation

### 3. Monitor Database

```bash
# Watch OTP table in real-time
watch -n 2 'psql -d monay_otp -U monay_user -c "SELECT identifier, code, type, created_at FROM otp_store ORDER BY created_at DESC LIMIT 5;"'
```

## 📊 Storage Strategy

The application uses a **hybrid storage approach**:

1. **Primary**: Local PostgreSQL database
2. **Fallback**: Global in-memory Map (if PostgreSQL fails)

This ensures OTPs always work, even if there are database connection issues.

## 🔒 Security Notes

- OTPs automatically expire after 5 minutes
- Database credentials are stored in `.env.local` (not committed to git)
- PostgreSQL runs locally on your machine only
- OTPs are automatically cleaned up on expiration

## 💡 Tips

- Keep PostgreSQL running with `brew services start postgresql@15`
- Monitor logs during development: `tail -f /opt/homebrew/var/log/postgresql@15.log`
- Use a database client like pgAdmin or TablePlus for easier database management
- The OTP table is automatically created when the application starts

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Verify PostgreSQL is running: `brew services list`
3. Check application logs for error messages
4. Ensure `.env.local` has the correct `POSTGRES_URL`
5. Try restarting both PostgreSQL and the development server
