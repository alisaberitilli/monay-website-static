#!/bin/bash

# Test Tenant Flow - Registration and Context Retrieval
# This script tests the complete tenant hierarchy implementation

echo "================================================"
echo "Testing Tenant Flow Implementation"
echo "================================================"
echo ""

BASE_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register Individual Consumer
echo -e "${YELLOW}Test 1: Register Individual Consumer${NC}"
echo "---------------------------------------"
CONSUMER_EMAIL="consumer_${TIMESTAMP}@test.com"
CONSUMER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register/consumer" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Consumer\",
    \"email\": \"${CONSUMER_EMAIL}\",
    \"mobile\": \"+1555000${TIMESTAMP: -4}\",
    \"password\": \"TestPass123!\",
    \"confirmPassword\": \"TestPass123!\"
  }")

echo "Response: ${CONSUMER_RESPONSE}" | head -n 5
if echo "$CONSUMER_RESPONSE" | grep -q "error"; then
  echo -e "${RED}❌ Consumer registration may have failed${NC}"
else
  echo -e "${GREEN}✅ Consumer registration request sent${NC}"
fi
echo ""

# Test 2: Register Small Business
echo -e "${YELLOW}Test 2: Register Small Business${NC}"
echo "---------------------------------------"
BUSINESS_EMAIL="business_${TIMESTAMP}@test.com"
BUSINESS_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register/business" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Business\",
    \"lastName\": \"Owner\",
    \"email\": \"${BUSINESS_EMAIL}\",
    \"mobile\": \"+1555001${TIMESTAMP: -4}\",
    \"password\": \"TestPass123!\",
    \"confirmPassword\": \"TestPass123!\",
    \"businessName\": \"Test Business ${TIMESTAMP}\"
  }")

echo "Response: ${BUSINESS_RESPONSE}" | head -n 5
if echo "$BUSINESS_RESPONSE" | grep -q "error"; then
  echo -e "${RED}❌ Business registration may have failed${NC}"
else
  echo -e "${GREEN}✅ Business registration request sent${NC}"
fi
echo ""

# Test 3: Login and Get Context (Consumer)
echo -e "${YELLOW}Test 3: Login and Get Tenant Context (Consumer)${NC}"
echo "------------------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${CONSUMER_EMAIL}\",
    \"password\": \"TestPass123!\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful, token obtained${NC}"

  # Get tenant context
  CONTEXT_RESPONSE=$(curl -s -X GET "${BASE_URL}/user/context" \
    -H "Authorization: Bearer ${TOKEN}")

  echo "Tenant Context:"
  echo "${CONTEXT_RESPONSE}" | python3 -m json.tool 2>/dev/null || echo "${CONTEXT_RESPONSE}"

  if echo "$CONTEXT_RESPONSE" | grep -q "tenantId"; then
    echo -e "${GREEN}✅ Tenant context retrieved successfully${NC}"
  else
    echo -e "${RED}❌ Failed to retrieve tenant context${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Could not obtain token (user might already exist)${NC}"
fi
echo ""

# Test 4: Check Database State
echo -e "${YELLOW}Test 4: Database Verification${NC}"
echo "------------------------------"
echo "Checking tenant summary from database..."

psql -U alisaberi -d monay -c "SELECT * FROM tenant_summary;" 2>/dev/null || echo "Could not query database directly"

echo ""
echo "================================================"
echo "Test Complete"
echo "================================================"
echo ""
echo "Summary:"
echo "- Individual consumers should have direct tenant relationships"
echo "- Business users should have organization-based tenant relationships"
echo "- Organization users should NOT appear in tenant_users table"
echo ""
echo "To verify in database:"
echo "  psql -U alisaberi -d monay"
echo "  SELECT * FROM tenant_summary;"
echo "  SELECT * FROM tenant_hierarchy_view LIMIT 10;"