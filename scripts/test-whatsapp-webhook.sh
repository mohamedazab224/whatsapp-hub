#!/bin/bash

# Script لاختبار WhatsApp Webhook Integration
# الاستخدام: bash scripts/test-whatsapp-webhook.sh

echo "======================================"
echo "WhatsApp Webhook Integration Test"
echo "======================================"
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# التحقق من المتغيرات المطلوبة
echo -e "${YELLOW}[1/5] التحقق من متغيرات البيئة...${NC}"

required_vars=(
    "WHATSAPP_BUSINESS_ACCOUNT_ID"
    "WHATSAPP_BUSINESS_PHONE_NUMBER_ID"
    "WHATSAPP_ACCESS_TOKEN"
    "WHATSAPP_APP_SECRET"
    "WHATSAPP_WEBHOOK_VERIFY_TOKEN"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗ ${var} غير موجود${NC}"
        missing_vars=$((missing_vars + 1))
    else
        echo -e "${GREEN}✓ ${var} موجود${NC}"
    fi
done

if [ $missing_vars -gt 0 ]; then
    echo -e "${RED}✗ متطلبات ناقصة. أضف المتغيرات إلى .env.local${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/5] التحقق من الاتصال بـ Supabase...${NC}"

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}✗ Supabase غير مُعدّ${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Supabase متصل${NC}"
fi

echo ""
echo -e "${YELLOW}[3/5] اختبار Webhook Verification...${NC}"

# الحصول على localhost URL
LOCAL_URL="http://localhost:3000"
WEBHOOK_URL="${LOCAL_URL}/api/vae/webhook/whatsapp"
VERIFY_TOKEN="${WHATSAPP_WEBHOOK_VERIFY_TOKEN}"

# محاولة الاتصال
response=$(curl -s -w "\n%{http_code}" -X GET \
    "${WEBHOOK_URL}?mode=subscribe&challenge=test&verify_token=${VERIFY_TOKEN}")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Webhook Verification نجح (HTTP 200)${NC}"
    echo "   Response: $response_body"
else
    echo -e "${RED}✗ Webhook Verification فشل (HTTP $http_code)${NC}"
    echo "   Response: $response_body"
    echo ""
    echo "تصحيح سريع:"
    echo "- تأكد من السيرفر يعمل: pnpm dev"
    echo "- تحقق من الـ Verify Token صحيح"
    echo "- جرّب: curl '$WEBHOOK_URL?mode=subscribe&challenge=test&verify_token=$VERIFY_TOKEN'"
fi

echo ""
echo -e "${YELLOW}[4/5] عرض معلومات الاتصال...${NC}"

echo ""
echo "معلومات Meta Business:"
echo "  Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID:0:20}..."
echo "  Phone Number ID: ${WHATSAPP_BUSINESS_PHONE_NUMBER_ID:0:20}..."
echo "  API Version: ${WHATSAPP_API_VERSION:=v18.0}"

echo ""
echo "معلومات Webhook:"
echo "  Webhook URL: $WEBHOOK_URL"
echo "  Verify Token: ${WHATSAPP_WEBHOOK_VERIFY_TOKEN:0:20}..."

echo ""
echo "معلومات Supabase:"
echo "  URL: ${NEXT_PUBLIC_SUPABASE_URL:0:40}..."
echo "  Storage Bucket: vae_media"

echo ""
echo -e "${YELLOW}[5/5] الخطوات التالية...${NC}"

echo ""
echo "الآن أنت جاهز للاختبار:"
echo ""
echo "1. إذا كنت على localhost استخدم ngrok:"
echo "   ngrok http 3000"
echo ""
echo "2. انسخ URL من ngrok وأضفها إلى Meta Dashboard"
echo ""
echo "3. أرسل رسالة صورة من WhatsApp"
echo ""
echo "4. افحص البيانات في Dashboard:"
echo "   http://localhost:3000/vae/dashboard"
echo ""
echo "5. للمساعدة، اقرأ:"
echo "   WHATSAPP_REQUIREMENTS.md"
echo "   WHATSAPP_TESTING_CHECKLIST.md"

echo ""
echo -e "${GREEN}======================================"
echo "✓ الاختبار انتهى بنجاح!"
echo "======================================${NC}"
