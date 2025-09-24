#!/bin/bash

# Safe Migration Script with Confirmation
# This script adds safety checks before running database migrations

echo "=========================================="
echo "   SAFE DATABASE MIGRATION TOOL"
echo "=========================================="
echo ""
echo "Database: ${DB_NAME:-monay}"
echo "Environment: ${NODE_ENV:-development}"
echo "User: ${USER}"
echo "Timestamp: $(date)"
echo ""

# Check if in production
if [ "$NODE_ENV" = "production" ]; then
    echo "⚠️  WARNING: You are in PRODUCTION environment!"
    echo ""
fi

# Show pending migrations
echo "Checking for pending migrations..."
npx sequelize db:migrate:status

echo ""
echo "⚠️  IMPORTANT: Migrations can modify your database schema!"
echo ""
read -p "Do you want to proceed with migrations? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "✅ Migration cancelled. Database unchanged."
    exit 0
fi

# Create a safety backup first
echo ""
echo "Creating safety backup..."
BACKUP_FILE="backups/pre_migration_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p backups
pg_dump -U ${DB_USER:-alisaberi} ${DB_NAME:-monay} > $BACKUP_FILE 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
else
    echo "⚠️  Backup failed. Proceeding without backup."
    read -p "Continue without backup? (yes/no): " continue_no_backup
    if [ "$continue_no_backup" != "yes" ]; then
        echo "Migration cancelled."
        exit 1
    fi
fi

# Run the migration
echo ""
echo "Running migrations..."
npx sequelize db:migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations completed successfully!"
else
    echo ""
    echo "❌ Migration failed!"
    echo "You can restore from backup: psql -U ${DB_USER:-alisaberi} ${DB_NAME:-monay} < $BACKUP_FILE"
fi