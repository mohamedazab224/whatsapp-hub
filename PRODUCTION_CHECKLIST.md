# 🚀 دليل نشر الإنتاج - WhatsApp Hub

## 📋 قائمة التحقق قبل النشر

### 1️⃣ متغيرات البيئة المطلوبة

تأكد من إضافة جميع هذه المتغيرات في Vercel Project Settings > Vars:

```
# Supabase Configuration (مطلوب)
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY

# Meta/WhatsApp Configuration (مطلوب)
✓ WHATSAPP_ACCESS_TOKEN
✓ WHATSAPP_APP_SECRET
✓ WHATSAPP_BUSINESS_ACCOUNT_ID
✓ WHATSAPP_PHONE_NUMBER_ID
✓ WHATSAPP_API_VERSION

# Webhook Security (مطلوب)
✓ VERIFY_TOKEN
✓ WHATSAPP_WEBHOOK_VERIFY_TOKEN

# App Configuration
✓ NEXT_PUBLIC_API_URL (مثال: https://yourdomain.com)

# Optional - Logging & Monitoring
✓ LOG_LEVEL
✓ SENTRY_DSN (اختياري للمراقبة)
```

### 2️⃣ الفحوصات التقنية

- [ ] تم بناء المشروع بدون أخطاء: `npm run build`
- [ ] لم تكن هناك تحذيرات ESLint: `npm run lint`
- [ ] جميع الاختبارات تمر: `npm test`
- [ ] لا توجد console errors في المتصفح
- [ ] جميع الصور محسنة وتحميلها سريع

### 3️⃣ اختبارات الأمان

- [ ] **HTTPS مفعل** على جميع الروابط
- [ ] **CORS محمي** - تقبل الطلبات من النطاق الصحيح فقط
- [ ] **Rate Limiting** يعمل على جميع الـ endpoints
- [ ] **RLS (Row Level Security)** مفعل على جميع الجداول في Supabase
- [ ] **لا توجد بيانات حساسة** في الـ console logs
- [ ] **Webhook Verification** يعمل بشكل صحيح

### 4️⃣ اختبارات الأداء

- [ ] وقت الصفحة الأولية < 3 ثانية
- [ ] أحجام الحزم معقولة (< 200KB)
- [ ] Caching headers صحيحة
- [ ] Database queries محسنة
- [ ] لا توجد memory leaks

### 5️⃣ اختبارات الميزات

- [ ] تسجيل الدخول يعمل مع Google OAuth
- [ ] إرسال الرسائل يعمل
- [ ] استقبال الرسائل يعمل
- [ ] إدارة الجهات تعمل بشكل صحيح
- [ ] التحديثات الفعلية تعمل
- [ ] جميع الـ API endpoints تستجيب

### 6️⃣ النسخ الاحتياطية والاستعادة

- [ ] **نسخة احتياطية من قاعدة البيانات** - تم إنشاء نسخة احتياطية كاملة
- [ ] **خطة الاستعادة موجودة** - معروف كيفية استعادة البيانات في حالة الطوارئ
- [ ] **Monitoring مفعل** - رصد أي مشاكل في الوقت الفعلي

---

## 🔧 خطوات النشر

### الخطوة 1: تجهيز المشروع محلياً

```bash
# 1. تحديث الكود من Git
git pull origin main

# 2. تنظيف وإعادة البناء
npm run clean
npm install
npm run build

# 3. اختبار محلي
npm run dev

# 4. فتح المتصفح والتحقق
# http://localhost:3000
```

### الخطوة 2: إضافة متغيرات البيئة في Vercel

```bash
# 1. افتح Vercel Console
# https://vercel.com/dashboard

# 2. اختر المشروع

# 3. انتقل إلى Settings > Environment Variables

# 4. أضف المتغيرات:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - WHATSAPP_ACCESS_TOKEN
# - إلخ...
```

### الخطوة 3: تكوين Supabase للإنتاج

```sql
-- 1. تمكين RLS على جميع الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- 2. إنشاء سياسات RLS
-- (تم بالفعل في schema)

-- 3. تمكين Realtime
-- الجداول الهامة: contacts, messages

-- 4. النسخ الاحتياطية التلقائية
-- اذهب إلى Database > Backups
-- فعّل Automated backups
```

### الخطوة 4: تكوين Meta/WhatsApp

```
1. انتقل إلى https://developers.facebook.com/apps
2. اختر تطبيقك
3. اذهب إلى Messenger > Settings
4. أضف Webhook:
   URL: https://yourdomain.com/api/vae/webhook/whatsapp
   Verify Token: (استخدم VERIFY_TOKEN من متغيرات البيئة)
   
5. اشترك في هذه الأحداث:
   ✓ messages
   ✓ message_status
   ✓ message_template_status_update
   ✓ message_template_quality_update
```

### الخطوة 5: النشر على Vercel

```bash
# الخيار 1: من CLI
vercel deploy --prod

# الخيار 2: من Git
# مجرد push إلى main branch
git add .
git commit -m "chore: production ready"
git push origin main

# Vercel سينشر تلقائياً
```

### الخطوة 6: التحقق بعد النشر

```bash
# 1. تحقق من URL
curl https://yourdomain.com

# 2. تحقق من الصحة
curl https://yourdomain.com/api/health

# 3. اختبر webhook
curl -X POST https://yourdomain.com/api/vae/webhook/whatsapp

# 4. شاهد السجلات
vercel logs production
```

---

## 🔐 إعدادات الأمان الإنتاجية

### CORS Configuration

```typescript
// في API routes
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
]

if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
}
```

### Rate Limiting

```typescript
// تفعيل تحديد المعدل على جميع endpoints
// الحد الأقصى 120 طلب لكل 60 ثانية
```

### Content Security Policy

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline';
```

### HTTPS فقط

- تم تفعيل في Vercel تلقائياً
- جميع HTTP requests تعيد توجيهها لـ HTTPS

---

## 📊 المراقبة والسجلات

### Vercel Analytics
```
1. Dashboard > Analytics
2. شاهد:
   - Web Vitals (CLS, LCP, FID)
   - معدل الخطأ
   - استخدام النطاق الترددي
```

### Supabase Monitoring
```
1. Database > Monitoring
2. شاهد:
   - استخدام الـ CPU
   - الذاكرة
   - عدد الاتصالات
   - Query performance
```

### System Logs
```typescript
// في التطبيق
GET /api/logs
GET /api/logs/errors
GET /api/logs/security
```

---

## 🆘 استكشاف المشاكل

### المشكلة: الموقع بطيء جداً

```bash
# 1. تحقق من Web Vitals
# Vercel Dashboard > Analytics

# 2. فعّل Caching
# تأكد من Cache headers

# 3. حسّن Database Queries
# تحقق من Supabase Monitoring

# 4. قلل حجم الحزم
# npm analyze
```

### المشكلة: الويب هوك لا يعمل

```bash
# 1. تحقق من الـ Verify Token
echo $VERIFY_TOKEN

# 2. اختبر الويب هوك يدوياً
curl -X POST https://yourdomain.com/api/vae/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"text":"test"}]}}]}]}'

# 3. شاهد السجلات
vercel logs production --tail
```

### المشكلة: خطأ في قاعدة البيانات

```bash
# 1. تحقق من الاتصال
# Supabase > Database > Connections

# 2. تحقق من الحدود
# Supabase > Settings > Database

# 3. أعد تشغيل الاتصال
# اذهب إلى الإعدادات > Database > Restart
```

---

## 📈 التحسينات المستقبلية

- [ ] إضافة CDN لـ Static Assets
- [ ] تفعيل Page Caching
- [ ] استخدام Redis للـ Session Storage
- [ ] إضافة شهادة SSL موثقة
- [ ] تحسين Database Indexes
- [ ] إضافة Load Balancing
- [ ] تفعيل WAF (Web Application Firewall)

---

## 📞 الدعم والمساعدة

### في حالة المشاكل:

1. **تحقق من السجلات**
   ```bash
   vercel logs production --tail
   ```

2. **راجع الأخطاء الشائعة** في هذا الملف

3. **اتصل بالفريق**
   - البريد الإلكتروني: support@example.com
   - Slack: #production-issues

---

**تاريخ آخر تحديث:** {{NOW}}
**الإصدار:** 1.0.0
**الحالة:** ✅ جاهز للإنتاج
