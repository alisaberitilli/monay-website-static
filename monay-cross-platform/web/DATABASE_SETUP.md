# Database Setup Guide for Monay Web Application

## Current Setup

The application is configured to work in two modes:
1. **Mock Mode** (default) - Uses in-memory data store with React useState
2. **PostgreSQL Mode** - Connects to real PostgreSQL database

## Configuration

### 1. Environment Variables

Edit `.env.local` file:

```env
# Set to "false" to use real PostgreSQL database
NEXT_PUBLIC_MOCK_MODE="true"

# PostgreSQL connection string (update with your credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/monay_wallet?schema=public"
```

### 2. PostgreSQL Database Setup

If you have an existing PostgreSQL database:

```bash
# Connect to your PostgreSQL instance
psql -U your_username -d your_database

# Run the schema file to create tables
\i database/schema.sql
```

Or create a new database:

```bash
# Create database
createdb monay_wallet

# Run schema
psql -d monay_wallet < database/schema.sql
```

### 3. Data Consistency

The application maintains data consistency between:
- **Mock Data Store** (`lib/mock-data.ts`)
- **Database Service** (`lib/db-service.ts`)
- **API Routes** (`app/api/`)
- **Frontend Components** (using `hooks/useWalletData.ts`)

## Architecture

```
┌─────────────────────────────────────────────┐
│            Frontend Components              │
│         (Dashboard, Add Money, etc.)        │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│           useWalletData Hook                │
│      (Centralized data fetching)            │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              API Routes                     │
│  (/api/wallet, /api/transactions, etc.)     │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│           Database Service                  │
│    (Switches between Mock/PostgreSQL)       │
└─────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
┌──────────────────┐    ┌────────────────────┐
│   Mock Data Store │    │   PostgreSQL DB    │
│   (Development)   │    │   (Production)     │
└──────────────────┘    └────────────────────┘
```

## Mock Data Structure

The mock data store includes:
- **Users**: Default user with ID 'user123'
- **Wallets**: Balance of $2,547.83
- **Transactions**: Sample deposits, payments, transfers
- **Cards**: Virtual and physical cards
- **Analytics**: Spending categories and summaries

## API Endpoints

All endpoints support both mock and PostgreSQL modes:

- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/transactions` - Get transaction history
- `POST /api/transactions` - Create new transaction
- `POST /api/payments/add-money` - Add money to wallet
- `GET /api/analytics/spending` - Get spending analytics

## Testing Data Consistency

1. **In Mock Mode** (default):
```bash
# Start the application
npm run dev

# Test adding money
# Go to http://localhost:3000/add-money
# Add $100 - it will update the mock store

# Check balance updates across all pages
# Dashboard, transactions, and analytics should all reflect the change
```

2. **In PostgreSQL Mode**:
```bash
# Update .env.local
NEXT_PUBLIC_MOCK_MODE="false"
DATABASE_URL="your_postgresql_connection_string"

# Restart the application
npm run dev

# Data will now persist in PostgreSQL
```

## Data Migration

To migrate from mock data to PostgreSQL:

```javascript
// Run this script to migrate mock data to database
import { mockDataStore } from './lib/mock-data';
import { DatabaseService } from './lib/db-service';

async function migrateMockToDatabase() {
  // Get all mock data
  const users = mockDataStore.getAllUsers();
  
  // Insert into PostgreSQL
  for (const user of users) {
    await DatabaseService.createUser(user);
  }
  
  // Migrate wallets, transactions, cards...
}
```

## Switching Between Modes

The application automatically switches between mock and database based on `NEXT_PUBLIC_MOCK_MODE`:

- **Mock Mode**: Fast development, no database required
- **Database Mode**: Production-ready, data persistence

## Next Steps

1. **For Development**: Keep `NEXT_PUBLIC_MOCK_MODE="true"`
2. **For Testing with Database**: 
   - Set up PostgreSQL
   - Update connection string
   - Set `NEXT_PUBLIC_MOCK_MODE="false"`
3. **For Production**: 
   - Use real PostgreSQL instance
   - Implement authentication
   - Add blockchain integration

## Blockchain Integration (Future)

When ready to implement dual-rail blockchain:
1. The database schema already includes blockchain fields
2. Use `blockchain_tx_hash` and `blockchain_rail` columns
3. Implement services in separate modules
4. Follow the BLOCKCHAIN_DUAL_RAIL_SPEC.md

## Support

For issues or questions about database setup:
1. Check PostgreSQL logs
2. Verify connection string format
3. Ensure database permissions are correct
4. Test with `psql` command line first