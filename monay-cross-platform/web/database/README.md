# Monay Database Setup

## Quick Start

### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Setup Database (One Command)

```bash
npm run db:setup
```

This command will:
1. Create the `monay_wallet` database
2. Run the schema to create all tables
3. Populate with mock data

### 3. Alternative Manual Setup

```bash
# Create database
createdb monay_wallet

# Run schema
psql -d monay_wallet < database/schema.sql

# Seed with mock data
psql -d monay_wallet < database/seed-data.sql

# Or use the Node script
npm run seed:db
```

## Mock Data Overview

The seed data creates a consistent dataset across all Monay applications:

### Users (4 total)
| Name | Email/Phone | Balance | KYC Status |
|------|-------------|---------|------------|
| John Doe | +1 301-682-1633 | $12,450.75 | Verified |
| Jane Smith | jane.smith@example.com | $5,234.50 | Verified |
| Mike Wilson | mike.wilson@example.com | $150.00 | Pending |
| Sarah Johnson | sarah.johnson@example.com | $10,500.75 | Verified |

### Features per User
- **John Doe**: 10 transactions, 2 cards (Visa & Mastercard)
- **Jane Smith**: 3 transactions, 1 card
- **Mike Wilson**: No transactions yet (new user)
- **Sarah Johnson**: 2 transactions, 2 cards

### Transaction Categories
- Income (salaries, deposits)
- Shopping (Apple Store, Best Buy, Target)
- Dining (restaurants)
- Groceries (Whole Foods)
- Transportation (Uber)
- Entertainment (Netflix)
- Transfers between users

### Blockchain Integration
- Sample EVM addresses on Base/Polygon
- Sample Solana addresses
- Transaction hashes for on-chain operations

### Compliance Rules
- Daily transaction limits
- Single transaction limits
- Geo-restrictions
- MCC (merchant category) blocks
- KYC tier requirements

## Environment Configuration

Update `.env.local`:

```env
# Use PostgreSQL (not mock mode)
NEXT_PUBLIC_MOCK_MODE="false"

# Default PostgreSQL connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/monay_wallet?schema=public"

# Custom PostgreSQL credentials
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/monay_wallet?schema=public"
```

## Verify Setup

### Check Database Connection

```bash
psql -d monay_wallet -c "SELECT COUNT(*) FROM users;"
```

Should return: `4` (users)

### Test in Application

1. Start the app: `npm run dev`
2. Login with: `john.doe@example.com`
3. Check dashboard shows balance: `$2,547.83`
4. Add money - it will persist in database
5. Check transactions - shows history

## Database Schema

### Core Tables
- `users` - User accounts and KYC info
- `wallets` - User wallets with balances
- `transactions` - All financial transactions
- `cards` - Virtual/physical cards
- `payment_methods` - Bank accounts, cards, etc.

### Blockchain Tables
- `blockchain_transactions` - On-chain transaction records
- Fields for EVM and Solana addresses

### Compliance Tables
- `compliance_rules` - Business rules
- `kyc_documents` - User verification docs
- `audit_logs` - All system actions

## Common Issues

### Connection Refused
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Authentication Failed
```bash
# Update pg_hba.conf to trust local connections
# Location: /usr/local/var/postgres/pg_hba.conf (macOS)
# Change: local all all trust
```

### Database Does Not Exist
```bash
createdb monay_wallet
```

### Permission Denied
```bash
# Grant permissions
psql -c "GRANT ALL PRIVILEGES ON DATABASE monay_wallet TO your_user;"
```

## Data Consistency

The mock data is designed to be consistent across:
1. **Web Application** - This Next.js app
2. **Mobile Apps** - React Native apps
3. **Backend Services** - API servers
4. **Blockchain Services** - Smart contracts

All use the same:
- User IDs (user123, user456, etc.)
- Wallet IDs (wallet123, wallet456, etc.)
- Transaction patterns
- Balance calculations

## Next Steps

1. ✅ Database is populated with mock data
2. ✅ Application uses PostgreSQL for persistence
3. 🔜 Ready for blockchain integration
4. 🔜 Can add real payment gateway
5. 🔜 Ready for production deployment

## Scripts Reference

```bash
npm run db:create     # Create database
npm run db:schema     # Run schema.sql
npm run seed:db       # Populate with mock data
npm run db:setup      # Do all above in sequence
```