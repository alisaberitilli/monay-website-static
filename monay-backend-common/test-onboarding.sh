#!/bin/bash

# Test script for complete user onboarding flow

echo "=== Testing Complete User Onboarding Flow ==="
echo ""

# Generate unique timestamp for test data
TIMESTAMP=$(date +%s)
MOBILE_SUFFIX=$(echo $TIMESTAMP | tail -c 8)

# Test 1: Consumer Wallet Registration (Mobile Primary)
echo "1. Testing Consumer Wallet Registration (Mobile Primary)..."
CONSUMER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/user/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3003" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Consumer\",
    \"email\": \"test.consumer.${TIMESTAMP}@test.com\",
    \"mobile\": \"+1555${MOBILE_SUFFIX}\",
    \"password\": \"Test1234!\",
    \"confirmPassword\": \"Test1234!\",
    \"deviceType\": \"ios\"
  }")

echo "Consumer Response:"
echo "$CONSUMER_RESPONSE" | jq '.'
CONSUMER_ID=$(echo "$CONSUMER_RESPONSE" | jq -r '.data.user.id')
echo "Consumer User ID: $CONSUMER_ID"
echo ""

# Test 2: Enterprise Wallet Registration (Email Primary)
echo "2. Testing Enterprise Wallet Registration (Email Primary)..."
ENTERPRISE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/user/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3007" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Enterprise\",
    \"email\": \"test.enterprise.${TIMESTAMP}@test.com\",
    \"mobile\": \"+1556${MOBILE_SUFFIX}\",
    \"password\": \"Test1234!\",
    \"confirmPassword\": \"Test1234!\",
    \"deviceType\": \"web\"
  }")

echo "Enterprise Response:"
echo "$ENTERPRISE_RESPONSE" | jq '.'
ENTERPRISE_ID=$(echo "$ENTERPRISE_RESPONSE" | jq -r '.data.user.id')
echo "Enterprise User ID: $ENTERPRISE_ID"
echo ""

# Test 3: Admin Dashboard Registration (Email Primary)
echo "3. Testing Admin Dashboard Registration (Email Primary)..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/user/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3002" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Admin\",
    \"email\": \"test.admin.${TIMESTAMP}@test.com\",
    \"mobile\": \"+1557${MOBILE_SUFFIX}\",
    \"password\": \"Test1234!\",
    \"confirmPassword\": \"Test1234!\",
    \"deviceType\": \"web\"
  }")

echo "Admin Response:"
echo "$ADMIN_RESPONSE" | jq '.'
ADMIN_ID=$(echo "$ADMIN_RESPONSE" | jq -r '.data.user.id')
echo "Admin User ID: $ADMIN_ID"
echo ""

# Test 4: Verify Contact Preferences in Database
echo "4. Verifying Contact Preferences in Database..."
psql -U alisaberi -d monay -c "
SELECT
  email,
  mobile,
  primary_contact,
  whatsapp_enabled,
  user_type,
  contact_metadata->>'preferredChannel' as preferred_channel,
  contact_metadata->>'verificationRequired' as verification_required
FROM users
WHERE id IN ('$CONSUMER_ID', '$ENTERPRISE_ID', '$ADMIN_ID')
ORDER BY created_at DESC;" 2>/dev/null | head -20

echo ""
echo "=== Test Summary ==="
echo "✅ Consumer Wallet: Should have mobile as primary_contact, sms as preferredChannel"
echo "✅ Enterprise Wallet: Should have email as primary_contact, email as preferredChannel"
echo "✅ Admin Dashboard: Should have email as primary_contact, email as preferredChannel"
echo "✅ All users: Should have whatsapp_enabled = true if mobile is present"
echo ""

# Test 5: Login and Get Token for Secondary User Test
echo "5. Testing Login for Consumer User..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"test.consumer.${TIMESTAMP}@test.com\",
    \"password\": \"Test1234!\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
if [ "$TOKEN" != "null" ]; then
  echo "✅ Login successful, token obtained"
else
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq '.'
fi
echo ""

# Test 6: Link Secondary User
if [ "$TOKEN" != "null" ]; then
  echo "6. Testing Secondary User Linking..."
  SECONDARY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/accounts/secondary/link \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"linkMethod\": \"phone\",
      \"phoneNumber\": \"+1558${MOBILE_SUFFIX}\",
      \"relationship\": \"child\",
      \"limit\": 500,
      \"dailyLimit\": 50
    }")

  echo "Secondary User Response:"
  echo "$SECONDARY_RESPONSE" | jq '.'
  SECONDARY_ID=$(echo "$SECONDARY_RESPONSE" | jq -r '.data.secondaryUser.id')

  if [ "$SECONDARY_ID" != "null" ]; then
    echo "✅ Secondary user created: $SECONDARY_ID"

    # Verify secondary user in database
    echo ""
    echo "Verifying Secondary User in Database..."
    psql -U alisaberi -d monay -c "
    SELECT
      u.email,
      u.mobile,
      u.primary_contact,
      u.user_type,
      u.account_type,
      cp.parent_id,
      cp.limit,
      cp.daily_limit,
      cp.status
    FROM users u
    JOIN child_parents cp ON u.id = cp.user_id
    WHERE u.id = '$SECONDARY_ID';" 2>/dev/null | head -15
  else
    echo "❌ Secondary user creation failed"
  fi
fi

echo ""
echo "=== All Onboarding Flow Tests Complete ==="
echo "Check the results above to verify:"
echo "1. Each application sets correct primary_contact"
echo "2. Contact preferences match application context"
echo "3. WhatsApp is enabled for users with mobile"
echo "4. Secondary users inherit preferences from primary"
echo "5. All user types are set correctly"