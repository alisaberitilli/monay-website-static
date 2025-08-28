# Monay Wallet Backend

A Next.js backend API for the Monay Wallet application with PostgreSQL database integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL installed and running
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up PostgreSQL database:**
```bash
# Create database (if not exists)
createdb monay_wallet

# Run Prisma migrations
npm run migrate
```

3. **Seed the database with test data:**
```bash
npm run seed
```

4. **Start the development server:**
```bash
npm run dev
# Server runs on http://localhost:3001
```

## 📊 Database Configuration

### Connection
- **Database**: PostgreSQL
- **Database Name**: `monay_wallet`
- **Connection String**: `postgresql://[username]@localhost:5432/monay_wallet`
- **ORM**: Prisma

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="postgresql://[username]@localhost:5432/monay_wallet"
JWT_SECRET=your_jwt_secret_here
```

## 🗃️ Database Schema

### Core Models
- **User** - User accounts with wallet balances
- **Transaction** - All financial transactions
- **UserBankAccount** - Linked bank accounts
- **UserCard** - Payment cards
- **Notification** - User notifications
- **Role** - User roles and permissions

## 🧪 Test Accounts

The seed script creates the following test accounts:

| Email | Password | Role | Balance | Description |
|-------|----------|------|---------|-------------|
| `admin@monay.com` | `Password123!` | Admin | $100,000 | Full system access |
| `john.doe@example.com` | `Password123!` | Premium | $12,450.75 | Premium features |
| `jane.smith@example.com` | `Password123!` | Regular | $8,920.30 | Standard user |
| `sarah.wilson@example.com` | `Password123!` | VIP | $45,890.25 | VIP privileges |
| `mike.johnson@example.com` | `Password123!` | Regular | $3,250.00 | Inactive account |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/me` - Get current user profile
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PATCH /api/transactions/:id` - Update transaction status

### Wallet
- `GET /api/wallet/balance` - Get wallet balance

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server (port 3001)

# Database
npm run migrate      # Run database migrations
npm run migrate:deploy # Deploy migrations to production
npm run seed         # Seed database with test data
npm run studio       # Open Prisma Studio (GUI for database)

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run format       # Format code with Prettier
```

## 🔍 Database Management

### View & Edit Data
```bash
npm run studio
```
Opens Prisma Studio at `http://localhost:5555` where you can:
- View all tables and records
- Edit data directly
- Export data
- Run queries

### Reset Database
```bash
# Drop all tables and re-run migrations
npx prisma migrate reset

# Re-seed with test data
npm run seed
```

## 📈 Seeded Data Summary

After running `npm run seed`, your database will contain:

- **5 Users** - Various roles and account statuses
- **8 Transactions** - Different types and statuses
- **2 Bank Accounts** - Linked to users
- **2 Payment Cards** - For transactions
- **4 Notifications** - User alerts
- **3 Activity Logs** - User actions
- **4 Roles** - Admin, VIP, Premium, User
- **5 Countries** - For user locations
- **3 KYC Document Types** - For verification
- **8 Settings** - System configuration
- **3 CMS Pages** - Terms, Privacy, About
- **4 FAQs** - Common questions

## 🏗️ Project Structure

```
monay-backend-next/
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Seed data script
│   └── migrations/      # Database migrations
├── src/
│   ├── app/
│   │   └── api/         # API routes
│   │       ├── auth/    # Authentication endpoints
│   │       ├── users/   # User management
│   │       ├── transactions/ # Transaction operations
│   │       └── wallet/  # Wallet operations
│   ├── lib/
│   │   ├── prisma.ts    # Prisma client
│   │   ├── auth.ts      # Authentication logic
│   │   └── api-response.ts # API response builder
│   └── services/        # Business logic services
└── package.json
```

## 🔐 Security Notes

- Default passwords are for development only
- Change `JWT_SECRET` in production
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Add proper CORS configuration

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 [PID]
```

### Database Connection Failed
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify database exists: `psql -l`

### Migration Issues
```bash
# Reset database and migrations
npx prisma migrate reset --force

# Generate Prisma client
npx prisma generate
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Frontend Integration

The frontend application at `http://localhost:3000` can connect to this backend API. Update frontend components to use:

```javascript
// Example API call from frontend
const response = await fetch('http://localhost:3001/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📝 License

Private - Monay Wallet © 2024