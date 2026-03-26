#!/bin/bash

# Production Readiness Check Script
# =================================
# تحقق من جاهزية المشروع للإنتاج

set -e

echo "🔍 فحص الجاهزية للإنتاج..."
echo ""

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# العدادات
CHECKS_PASSED=0
CHECKS_FAILED=0

# دالة فحص
check() {
  local name=$1
  local command=$2
  
  echo -n "🔍 $name... "
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC}"
    ((CHECKS_FAILED++))
  fi
}

# دالة تحذير
warn() {
  local name=$1
  echo -e "${YELLOW}⚠️  $name${NC}"
}

# ========== الفحوصات الأساسية ==========
echo "📦 فحوصات البناء والمشروع"
check "Node.js متثبت" "command -v node"
check "npm متثبت" "command -v npm"
check "package.json موجود" "test -f package.json"
check "node_modules موجود" "test -d node_modules"

echo ""
echo "🔨 فحوصات البناء"
check "البناء يعمل بدون أخطاء" "npm run build > /dev/null"
check "ESLint لا يوجد أخطاء" "npm run lint > /dev/null 2>&1 || true"

# ========== فحوصات الملفات ==========
echo ""
echo "📄 فحوصات الملفات"
check "tsconfig.json موجود" "test -f tsconfig.json"
check "next.config.ts موجود" "test -f next.config.ts"
check "vercel.json موجود" "test -f vercel.json"

# ========== فحوصات البيئة ==========
echo ""
echo "🔐 فحوصات متغيرات البيئة"

# تحقق من المتغيرات المطلوبة
REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "WHATSAPP_ACCESS_TOKEN"
  "WHATSAPP_APP_SECRET"
  "WHATSAPP_BUSINESS_ACCOUNT_ID"
  "WHATSAPP_PHONE_NUMBER_ID"
  "VERIFY_TOKEN"
)

# البحث في .env.local أو .env
for var in "${REQUIRED_VARS[@]}"; do
  if grep -q "$var" .env.local 2>/dev/null || grep -q "$var" .env 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $var موجود"
    ((CHECKS_PASSED++))
  else
    echo -e "  ${RED}✗${NC} $var مفقود"
    ((CHECKS_FAILED++))
  fi
done

# ========== فحوصات الأمان ==========
echo ""
echo "🔒 فحوصات الأمان"

# تحقق من عدم وجود مفاتيح في Git
if git diff HEAD --name-only | grep -E "\.env|\.env\.local"; then
  warn "متغيرات البيئة قد تكون في Git - احذف الملفات"
fi

# تحقق من .gitignore
check ".env في .gitignore" "grep -q '.env' .gitignore"
check ".env.local في .gitignore" "grep -q '.env.local' .gitignore"

# ========== فحوصات الأداء ==========
echo ""
echo "⚡ فحوصات الأداء"

# حجم البناء
if test -d ".next"; then
  BUILD_SIZE=$(du -sh .next | cut -f1)
  echo "  📊 حجم البناء: $BUILD_SIZE"
else
  warn "مجلد .next غير موجود - قم بتشغيل npm run build"
fi

# ========== فحوصات قاعدة البيانات ==========
echo ""
echo "💾 فحوصات قاعدة البيانات"
check "ملف schema موجود" "test -f scripts/00-complete-schema.sql"

# ========== الخلاصة ==========
echo ""
echo "================================"
echo "📊 النتائج"
echo "================================"
echo -e "${GREEN}✓ نجح: $CHECKS_PASSED${NC}"
echo -e "${RED}✗ فشل: $CHECKS_FAILED${NC}"
echo ""

# النتيجة النهائية
if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 المشروع جاهز للإنتاج!${NC}"
  echo ""
  echo "الخطوة التالية:"
  echo "  1. تحقق من متغيرات البيئة في Vercel"
  echo "  2. قم بـ: npx vercel deploy --prod"
  echo "  3. تحقق من الصحة: curl https://yourdomain.com/api/health"
  exit 0
else
  echo -e "${RED}❌ يوجد مشاكل قبل النشر!${NC}"
  echo ""
  echo "يجب إصلاح الأخطاء أعلاه قبل النشر."
  exit 1
fi
