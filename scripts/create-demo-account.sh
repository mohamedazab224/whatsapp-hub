#!/bin/bash

# Simple script to create a demo user in Supabase

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  echo "Please set these in your .env.local"
  exit 1
fi

echo "🔧 Creating demo account in Supabase..."
echo "URL: $SUPABASE_URL"
echo "Email: demo@alazab.com"

# Create user via Supabase API
curl -X POST \
  "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@alazab.com",
    "password": "Demo@12345678",
    "user_metadata": {
      "full_name": "مستخدم تجريبي",
      "is_demo": true
    }
  }'

echo ""
echo "✅ Done! Demo account created."
echo "Email: demo@alazab.com"
echo "Password: Demo@12345678"
