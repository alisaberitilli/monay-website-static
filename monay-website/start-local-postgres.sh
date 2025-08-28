#!/bin/bash

echo "🐘 Starting local Postgres database for Monay OTP development..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Postgres
echo "🚀 Starting Postgres container..."
docker-compose up -d postgres

# Wait for Postgres to be ready
echo "⏳ Waiting for Postgres to be ready..."
until docker exec monay-postgres pg_isready -U monay_user -d monay_otp > /dev/null 2>&1; do
    echo "   Still waiting..."
    sleep 2
done

echo ""
echo "✅ Postgres is ready!"
echo "📊 Database: monay_otp"
echo "👤 User: monay_user"
echo "🔑 Password: monay_password"
echo "🌐 Port: 5432"
echo ""
echo "🔗 Connection URL: postgresql://monay_user:monay_password@localhost:5432/monay_otp"
echo ""
echo "📝 Add this to your .env.local file:"
echo "POSTGRES_URL=postgresql://monay_user:monay_password@localhost:5432/monay_otp"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart postgres"
