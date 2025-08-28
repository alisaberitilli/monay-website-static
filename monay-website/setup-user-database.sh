#!/bin/bash

# Setup User Database Script
# This script creates the users table in your PostgreSQL database

echo "🚀 Setting up User Database..."

# Check if PostgreSQL is accessible
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client not found. Please install PostgreSQL first."
    exit 1
fi

# Check if the database exists
if ! psql -d monay_otp -U monay_user -c "SELECT 1;" &> /dev/null; then
    echo "❌ Cannot connect to database 'monay_otp' as user 'monay_user'"
    echo "Please ensure:"
    echo "1. PostgreSQL is running"
    echo "2. Database 'monay_otp' exists"
    echo "3. User 'monay_user' has access"
    exit 1
fi

echo "✅ Connected to database successfully"

# Run the SQL script
echo "📝 Creating users table..."
psql -d monay_otp -U monay_user -f create-user-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Users table created successfully!"
    echo ""
    echo "📊 Table structure:"
    psql -d monay_otp -U monay_user -c "\d users"
    
    echo ""
    echo "🎯 You can now test the user registration flow!"
    echo "The system will automatically save user data after SMS OTP verification."
else
    echo "❌ Failed to create users table"
    exit 1
fi
