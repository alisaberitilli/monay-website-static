#!/bin/bash

# PostgreSQL Setup Script for Monay Wallet
echo "🚀 Setting up PostgreSQL for Monay Wallet..."

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    brew services start postgresql@15
    sleep 2
fi

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw monay_wallet; then
    echo "✅ Database 'monay_wallet' already exists"
else
    echo "📦 Creating database 'monay_wallet'..."
    createdb monay_wallet
fi

# Run schema
echo "🏗️  Creating tables..."
psql -d monay_wallet < database/schema.sql 2>/dev/null || echo "Tables might already exist"

# Run seed data
echo "🌱 Seeding database with mock data..."
psql -d monay_wallet < database/seed-data.sql

# Update .env.local to use PostgreSQL
echo "⚙️  Switching to PostgreSQL mode..."
sed -i '' 's/NEXT_PUBLIC_MOCK_MODE="true"/NEXT_PUBLIC_MOCK_MODE="false"/' .env.local

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "📊 Database Status:"
psql -d monay_wallet -c "SELECT 'Users:' as item, COUNT(*) as count FROM users UNION ALL SELECT 'Wallets:', COUNT(*) FROM wallets UNION ALL SELECT 'Transactions:', COUNT(*) FROM transactions;"
echo ""
echo "👤 John Doe's Account:"
psql -d monay_wallet -c "SELECT u.name, u.phone, w.balance, w.currency FROM users u JOIN wallets w ON u.id = w.user_id WHERE u.id = 'user123';"
echo ""
echo "🎉 You can now login with:"
echo "   Mobile: 3016821633"
echo "   Password: (any password)"
echo ""
echo "💡 The app will automatically reload with PostgreSQL data!"