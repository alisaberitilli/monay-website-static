#!/bin/bash

echo "Testing Monay Signup Endpoints"
echo "==============================="
echo ""

# Generate unique timestamp
TIMESTAMP=$(date +%s)

# Test 1: Regular signup
echo "1. Testing regular signup at /api/auth/register"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"mobile\": \"+1555${TIMESTAMP: -7}\",
    \"password\": \"Test123!\",
    \"confirmPassword\": \"Test123!\",
    \"deviceType\": \"WEB\"
  }" -s | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "Failed"
echo ""

# Test 2: Consumer signup
echo "2. Testing consumer signup at /api/auth/register/consumer"
curl -X POST http://localhost:3001/api/auth/register/consumer \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Consumer\",
    \"lastName\": \"Test\",
    \"email\": \"consumer${TIMESTAMP}@example.com\",
    \"mobile\": \"+1556${TIMESTAMP: -7}\",
    \"password\": \"Test123!\",
    \"confirmPassword\": \"Test123!\"
  }" -s | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "Failed"
echo ""

# Test 3: Business signup
echo "3. Testing business signup at /api/auth/register/business"
curl -X POST http://localhost:3001/api/auth/register/business \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Business\",
    \"lastName\": \"Owner\",
    \"email\": \"business${TIMESTAMP}@example.com\",
    \"mobile\": \"+1557${TIMESTAMP: -7}\",
    \"password\": \"Test123!\",
    \"confirmPassword\": \"Test123!\",
    \"businessName\": \"Test Business ${TIMESTAMP}\"
  }" -s | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "Failed"
echo ""

echo "==============================="
echo "Signup tests complete"