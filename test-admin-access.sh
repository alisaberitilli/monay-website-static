#!/bin/bash

echo "🧪 Testing Admin Access..."
echo ""

# Login and get token
echo "1. Attempting admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@monay.com","password":"SecureAdmin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "Token (first 50 chars): ${TOKEN:0:50}..."
echo ""

# Decode JWT payload
echo "2. Decoding JWT token..."
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null || echo $TOKEN | cut -d'.' -f2 | base64 -D 2>/dev/null)
echo "Role: $(echo $PAYLOAD | jq -r '.role')"
echo "UserType: $(echo $PAYLOAD | jq -r '.userType')"
echo "Email: $(echo $PAYLOAD | jq -r '.email')"
echo ""

# Test endpoints
echo "3. Testing endpoints..."

echo "  → Treasury Transactions..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/super-admin/treasury/transactions)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
  echo "  Response: $(echo "$RESPONSE" | head -n -1)"
fi

echo "  → Treasury Wallets..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/super-admin/treasury/wallets)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
  echo "  Response: $(echo "$RESPONSE" | head -n -1)"
fi

echo "  → Revenue Metrics..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/super-admin/treasury/revenue)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
  echo "  Response: $(echo "$RESPONSE" | head -n -1)"
fi

echo "  → Platform Overview..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/super-admin/platform/overview)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
fi

echo "  → Role Permissions..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/roles/platform_admin/permissions)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 200 OK"
else
  echo "  ❌ $HTTP_CODE"
fi

echo ""
echo "✅ Admin access test complete!"
