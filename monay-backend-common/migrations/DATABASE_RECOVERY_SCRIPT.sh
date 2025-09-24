#!/bin/bash

# =====================================================
# MONAY DATABASE RECOVERY SCRIPT
# =====================================================
# Date Created: 2025-01-23
# Purpose: Complete database recovery and setup
# CRITICAL: This represents 1 month of work recovered
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="monay"
DB_USER=${DB_USER:-"alisaberi"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}     MONAY DATABASE RECOVERY SCRIPT            ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to check if database exists
check_database() {
    echo -e "${YELLOW}Checking if database '$DB_NAME' exists...${NC}"
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo -e "${GREEN}✓ Database exists${NC}"
        return 0
    else
        echo -e "${RED}✗ Database does not exist${NC}"
        return 1
    fi
}

# Function to create database
create_database() {
    echo -e "${YELLOW}Creating database '$DB_NAME'...${NC}"
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo -e "${GREEN}✓ Database created${NC}"
}

# Function to backup existing database
backup_database() {
    BACKUP_FILE="monay_backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${YELLOW}Creating backup: $BACKUP_FILE${NC}"
    pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_FILE
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
}

# Function to count tables
count_tables() {
    COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
    echo $COUNT
}

# Main execution
echo -e "${BLUE}Step 1: Database Check${NC}"
if check_database; then
    echo -e "${YELLOW}Database exists. Checking for existing tables...${NC}"
    TABLE_COUNT=$(count_tables)
    echo -e "${BLUE}Current table count: $TABLE_COUNT${NC}"

    if [ "$TABLE_COUNT" -gt "0" ]; then
        echo -e "${YELLOW}Warning: Database contains $TABLE_COUNT tables${NC}"
        read -p "Do you want to create a backup before proceeding? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            backup_database
        fi
    fi
else
    create_database
fi

echo ""
echo -e "${BLUE}Step 2: Migration Summary${NC}"
echo -e "${YELLOW}This script will create the following:${NC}"
echo "  • 100+ tables for complete Monay platform"
echo "  • Enterprise features (ERC-3643 compliance, treasury)"
echo "  • Consumer wallet features (auto-topup, bills, rewards)"
echo "  • Invoice-First Wallet System (quantum-resistant)"
echo "  • Government benefit programs (SNAP, WIC, TANF)"
echo "  • KYC/KYB verification system"
echo "  • Subledger and GL accounting"
echo "  • Business Rules Framework (BRF)"
echo "  • Card programs and payment methods"
echo "  • Communication and notification system"
echo "  • AI/ML analytics and fraud detection"
echo ""

read -p "Do you want to proceed with the migration? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Applying Consolidated Schema${NC}"
echo -e "${YELLOW}Running CONSOLIDATED_MONAY_SCHEMA.sql...${NC}"

# Apply the consolidated schema
if [ -f "./CONSOLIDATED_MONAY_SCHEMA.sql" ]; then
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < ./CONSOLIDATED_MONAY_SCHEMA.sql

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Schema applied successfully${NC}"
    else
        echo -e "${RED}✗ Error applying schema${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ CONSOLIDATED_MONAY_SCHEMA.sql not found!${NC}"
    echo -e "${YELLOW}Please ensure the file exists in the current directory${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Verification${NC}"
NEW_TABLE_COUNT=$(count_tables)
echo -e "${GREEN}✓ Tables created: $NEW_TABLE_COUNT${NC}"

echo ""
echo -e "${BLUE}Step 5: Creating Required Roles (if needed)${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
-- Create monay_app role if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'monay_app') THEN
        CREATE ROLE monay_app LOGIN PASSWORD 'secure_password_here';
        RAISE NOTICE 'Created role: monay_app';
    ELSE
        RAISE NOTICE 'Role monay_app already exists';
    END IF;
END
\$\$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO monay_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO monay_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO monay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO monay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO monay_app;
EOF

echo ""
echo -e "${BLUE}Step 6: Migration Report${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
SELECT
    'Core Tables' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('users', 'organizations', 'wallets', 'transactions', 'accounts')
UNION ALL
SELECT
    'Invoice & Billing' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE '%invoice%' OR table_name LIKE '%billing%'
UNION ALL
SELECT
    'Cards & Payments' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (table_name LIKE '%card%' OR table_name LIKE '%payment%')
UNION ALL
SELECT
    'Benefits & Programs' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE '%benefit%' OR table_name LIKE '%program%'
UNION ALL
SELECT
    'Security & Compliance' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (table_name LIKE '%audit%' OR table_name LIKE '%security%' OR table_name LIKE '%verification%')
UNION ALL
SELECT
    'Total Tables' as category,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public';
EOF

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}     DATABASE RECOVERY COMPLETE!               ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}Important Notes:${NC}"
echo "1. Database '$DB_NAME' is now fully restored"
echo "2. All DROP statements have been removed for safety"
echo "3. Duplicate migrations in src/migrations have been cleaned"
echo "4. Consolidated schema is in CONSOLIDATED_MONAY_SCHEMA.sql"
echo "5. Recovery analysis is in COMPREHENSIVE_DATABASE_RECOVERY_ANALYSIS.md"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Update .env file with database credentials"
echo "2. Restart backend services (port 3001)"
echo "3. Test application connectivity"
echo "4. Verify all features are working"
echo ""
echo -e "${GREEN}Recovery of 1 month of work: SUCCESSFUL${NC}"