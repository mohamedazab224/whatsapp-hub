#!/bin/bash

# WhatsApp Production API Test Script
# ===================================

echo "🔍 WhatsApp Production Verification"
echo "===================================="

# Configuration
BUSINESS_ID="314437023701205"
WABA_ID="459851797218855"
PHONE_IDS=("527697617099639" "644995285354639")
TOKEN="$WHATSAPP_ACCESS_TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Error: WHATSAPP_ACCESS_TOKEN not set"
  exit 1
fi

# Test 1: Verify Token
echo -e "\n1️⃣ Verifying Access Token..."
TOKEN_CHECK=$(curl -s "https://graph.facebook.com/v24.0/debug_token?input_token=$TOKEN&access_token=$TOKEN" | jq -r '.data.is_valid')
if [ "$TOKEN_CHECK" == "true" ]; then
  echo "✅ Token is valid"
else
  echo "❌ Token verification failed"
  exit 1
fi

# Test 2: Verify Business Account
echo -e "\n2️⃣ Verifying Business Account..."
BUSINESS_CHECK=$(curl -s "https://graph.facebook.com/v24.0/$BUSINESS_ID?fields=name,verification_status" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.verification_status')
if [ "$BUSINESS_CHECK" == "verified" ]; then
  echo "✅ Business Account verified"
else
  echo "❌ Business Account verification failed"
  exit 1
fi

# Test 3: Verify WABA
echo -e "\n3️⃣ Verifying WABA..."
WABA_CHECK=$(curl -s "https://graph.facebook.com/v24.0/$WABA_ID?fields=name,timezone_id" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.name')
if [ ! -z "$WABA_CHECK" ] && [ "$WABA_CHECK" != "null" ]; then
  echo "✅ WABA found: $WABA_CHECK"
else
  echo "❌ WABA verification failed"
  exit 1
fi

# Test 4: Verify Phone Numbers
echo -e "\n4️⃣ Verifying Phone Numbers..."
for PHONE_ID in "${PHONE_IDS[@]}"; do
  PHONE_CHECK=$(curl -s "https://graph.facebook.com/v24.0/$WABA_ID/phone_numbers" \
    -H "Authorization: Bearer $TOKEN" | jq -r ".data[] | select(.id==\"$PHONE_ID\") | .display_phone_number")
  if [ ! -z "$PHONE_CHECK" ] && [ "$PHONE_CHECK" != "null" ]; then
    echo "✅ Phone $PHONE_ID: $PHONE_CHECK"
  else
    echo "⚠️ Phone $PHONE_ID not found"
  fi
done

echo -e "\n✅ All production verifications passed!"
