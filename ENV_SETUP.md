# Production Environment Variables
# ================================
# اتبع الخطوات أدناه لإعداد متغيرات الإنتاج في Vercel

## الخطوة 1: متغيرات Supabase (مطلوب)

# احصل على هذه القيم من: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

## الخطوة 2: متغيرات Meta/WhatsApp (مطلوب)

# احصل على هذه القيم من: https://developers.facebook.com/apps/[app-id]/settings/basic
WHATSAPP_ACCESS_TOKEN=[your-access-token]
WHATSAPP_APP_SECRET=[your-app-secret]
WHATSAPP_BUSINESS_ACCOUNT_ID=[your-waba-id]
WHATSAPP_PHONE_NUMBER_ID=[your-phone-number-id]
WHATSAPP_API_VERSION=v24.0

## الخطوة 3: Webhook Security (مطلوب)

# اختر قيمة عشوائية قوية (استخدم: openssl rand -hex 32)
VERIFY_TOKEN=[random-hex-32]
WHATSAPP_WEBHOOK_VERIFY_TOKEN=[same-as-verify-token]

## الخطوة 4: تكوين التطبيق

# URL الإنتاج الخاص بك
NEXT_PUBLIC_API_URL=https://yourdomain.com

## الخطوة 5: السجلات والمراقبة (اختياري)

LOG_LEVEL=info
NEXT_PUBLIC_ENVIRONMENT=production

# Sentry للمراقبة (اختياري)
SENTRY_DSN=[your-sentry-dsn]

---

## كيفية الإضافة في Vercel

### الطريقة 1: من سطر الأوامر

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ثم أدخل القيمة

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ثم أدخل القيمة

# كرر لجميع المتغيرات
```

### الطريقة 2: من لوحة Vercel

1. اذهب إلى: https://vercel.com/dashboard
2. اختر المشروع
3. انتقل إلى: Settings > Environment Variables
4. أضف كل متغير على حدة
5. اختر: Production

### الطريقة 3: ملف .env.local (للاختبار المحلي فقط)

```bash
# انسخ هذا الملف باسم .env.local
cp .env.example .env.local

# أضف القيم الحقيقية
nano .env.local
```

---

## التحقق من المتغيرات

```bash
# عرض المتغيرات المعروّفة (بدون القيم)
vercel env list

# اختبر أن المتغيرات موجودة
npm run build
```

---

## كلمات السر وأفضل الممارسات

### 🔐 الأمان

- ✅ استخدم قيم فريدة قوية
- ✅ تجنب إعادة استخدام كلمات السر
- ✅ لا تقم أبداً بإدراج المتغيرات في Git
- ✅ غيّر المتغيرات الحساسة بانتظام
- ✅ استخدم Vercel Secrets بدلاً من hardcoding

### 🔑 توليد الرموز الآمنة

```bash
# توليد VERIFY_TOKEN
openssl rand -hex 32

# توليد سر API عشوائي
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# توليد رمز UUID
node -e "console.log(require('crypto').randomUUID())"
```

### 📝 قائمة التحقق

- [ ] تم الحصول على Supabase keys
- [ ] تم الحصول على Meta/WhatsApp tokens
- [ ] تم توليد VERIFY_TOKEN آمن
- [ ] تم إدخال جميع المتغيرات في Vercel
- [ ] تم اختبار الاتصال بـ Supabase
- [ ] تم اختبار Webhook Meta
- [ ] تم التحقق من `.env.local` ليس في Git

---

## استكشاف المشاكل

### "Supabase not configured"
- تحقق من `NEXT_PUBLIC_SUPABASE_URL`
- تحقق من `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Unauthorized" على API endpoints
- تحقق من `SUPABASE_SERVICE_ROLE_KEY`
- تأكد من RLS policies صحيحة

### "Webhook verification failed"
- تحقق من `VERIFY_TOKEN` و `WHATSAPP_WEBHOOK_VERIFY_TOKEN` متطابقة
- تأكد من URL الويب هوك في Meta تطابق

### "Invalid credentials"
- أعد توليد الـ tokens من Meta
- تحقق من أن tokens لم تنتهي صلاحيتها
- تحقق من صلاحيات التطبيق في Meta

---

## إعادة تعيين المتغيرات

إذا أردت إعادة تعيين جميع المتغيرات:

```bash
# حذف متغير واحد
vercel env rm VARIABLE_NAME

# حذف جميع متغيرات الإنتاج (احذر!)
# vercel env rm --all production
```

---

**⚠️ تذكير أمني مهم:**
- لا تشارك المتغيرات الحساسة مع أحد
- لا تلتقط لقطات شاشة تحتوي على متغيرات
- عطّل المتغيرات عند التوقف عن استخدام الخدمات
- راجع السجلات لأي وصول غير مصرح
