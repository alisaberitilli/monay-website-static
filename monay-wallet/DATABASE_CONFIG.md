# Monay Wallet Database Configuration

## Overview
All Monay projects are configured to use a local PostgreSQL database for development. This ensures consistency across all applications and services.

## Database Setup

### PostgreSQL Configuration
- **Version**: PostgreSQL 15
- **Host**: localhost
- **Port**: 5432
- **Username**: alisaberi
- **Password**: (empty for local development)
- **Main Database**: monay_wallet
- **OTP Database**: monay_otp
- **Test Database**: monay_wallet_test (to be created)

### Service Status
```bash
# Check PostgreSQL status
brew services list | grep postgres

# Start/Stop/Restart PostgreSQL
brew services start postgresql@15
brew services stop postgresql@15
brew services restart postgresql@15
```

## Project Configurations

### 1. Next.js Backend (monay-backend-next)
- **Location**: `/monay-wallet/web/monay-backend-next`
- **Config File**: `.env`
- **Connection String**: `postgresql://alisaberi@localhost:5432/monay_wallet`
- **ORM**: Prisma
- **Port**: 3001

#### Commands:
```bash
# Navigate to project
cd /Users/alisaberi/Downloads/monay/monay-wallet/web/monay-backend-next

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Start development server
npm run dev
```

### 2. Legacy Backend (monay-wallet/backend)
- **Location**: `/monay-wallet/backend`
- **Config File**: `.env` and `config/database.js`
- **ORM**: Sequelize
- **Dialect**: PostgreSQL (updated from MySQL)
- **Port**: 3000

#### Commands:
```bash
# Navigate to project
cd /Users/alisaberi/Downloads/monay/monay-wallet/backend

# Install PostgreSQL driver
npm install pg pg-hstore

# Run migrations (if using Sequelize)
npx sequelize-cli db:migrate

# Start server
npm start
```

### 3. iOS Application
- **Location**: `/monay-wallet/ios/monay`
- **Config File**: `Monay/Configuration/Configuration.swift`
- **API Endpoint**: `http://localhost:3001/api/v1` (development)
- **Connection**: Via REST API (not direct database connection)

#### Configuration:
```swift
// Development configuration in Configuration.swift
static let apiURL: String = {
    #if DEBUG
    return "http://localhost:3001/api/v1"  // Local PostgreSQL backend
    #else
    return value(forInfoDictionaryKey: .apiURL)
    #endif
}()
```

#### iOS Testing:
1. Ensure backend is running on port 3001
2. Open Xcode project
3. Select iPhone simulator
4. Build and run (⌘+R)
5. App will connect to local API at `http://localhost:3001`

### 4. Website (monay-website)
- **Location**: `/monay-website`
- **Database**: Not directly connected (uses API endpoints)
- **API Integration**: Configured for Nudge CRM

## Database Schema

### Main Tables:
- `users` - User accounts and profiles
- `transactions` - Transaction history
- `user_bank_accounts` - Linked bank accounts
- `user_cards` - Saved payment cards
- `payment_requests` - Payment request records
- `notifications` - User notifications
- `user_kyc` - KYC verification data
- `settings` - Application settings
- `countries` - Supported countries
- `roles` & `user_roles` - Role-based access control

## Testing Database Connection

### 1. PostgreSQL Direct Connection:
```bash
# Connect to database
psql -U alisaberi -d monay_wallet

# List tables
\dt

# Count users
SELECT COUNT(*) FROM users;

# Exit
\q
```

### 2. API Testing:
```bash
# Test Next.js API (port 3001)
curl http://localhost:3001/api/v1/health

# Test Legacy API (port 3000)
curl http://localhost:3000/api/health
```

### 3. Prisma Studio (Visual Database Editor):
```bash
cd /Users/alisaberi/Downloads/monay/monay-wallet/web/monay-backend-next
npx prisma studio
# Opens at http://localhost:5555
```

## Troubleshooting

### Common Issues:

1. **PostgreSQL not running:**
   ```bash
   brew services start postgresql@15
   ```

2. **Port already in use:**
   ```bash
   # Find process using port
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

3. **Database doesn't exist:**
   ```bash
   createdb -U alisaberi monay_wallet
   ```

4. **Permission denied:**
   ```bash
   # Grant permissions
   psql -U alisaberi -c "GRANT ALL PRIVILEGES ON DATABASE monay_wallet TO alisaberi;"
   ```

5. **iOS app can't connect to localhost:**
   - Ensure backend is running
   - Check that iOS simulator is selected (not physical device)
   - For physical device testing, use your Mac's IP address instead of localhost

## Environment Variables

### Development (.env):
```env
# Database
DATABASE_URL=postgresql://alisaberi@localhost:5432/monay_wallet
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=alisaberi
DB_PASSWORD=
DB_NAME=monay_wallet
DB_DIALECT=postgresql

# Application
NODE_ENV=development
PORT=3001
```

### Production Considerations:
- Use environment variables for sensitive data
- Enable SSL for database connections
- Use connection pooling
- Implement proper backup strategies
- Set up monitoring and alerts

## Backup and Restore

### Backup:
```bash
pg_dump -U alisaberi monay_wallet > monay_wallet_backup.sql
```

### Restore:
```bash
psql -U alisaberi monay_wallet < monay_wallet_backup.sql
```

## Security Notes

1. **Local Development Only**: Current configuration is for local development only
2. **No Password**: Local database has no password - add one for production
3. **SSL**: Enable SSL for production database connections
4. **Firewall**: Configure firewall rules for production
5. **Secrets Management**: Use proper secret management for production credentials

## Next Steps

1. Create test database: `createdb -U alisaberi monay_wallet_test`
2. Set up database migrations for legacy backend
3. Implement database seeders for development data
4. Configure database backups
5. Set up monitoring and logging
6. Document production deployment process