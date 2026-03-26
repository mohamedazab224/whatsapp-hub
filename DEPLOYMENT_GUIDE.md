# 🚀 دليل نشر الإنتاج الشامل - WhatsApp Hub

## 📋 المحتويات

1. [قائمة التحقق السريعة](#قائمة-التحقق-السريعة)
2. [المتطلبات الأساسية](#المتطلبات-الأساسية)
3. [خطوات النشر](#خطوات-النشر)
4. [إعدادات ما بعد النشر](#إعدادات-ما-بعد-النشر)
5. [المراقبة والصيانة](#المراقبة-والصيانة)
6. [استكشاف المشاكل](#استكشاف-المشاكل)

---

## 📋 قائمة التحقق السريعة

```bash
# 1. فحص الجاهزية
bash scripts/production-check.sh

# 2. البناء الكامل
npm run build

# 3. بدء محلياً للاختبار
npm start

# 4. زيارة الصحة
curl http://localhost:3000/api/health

# 5. النشر
npm run deploy:prod
```

---

## 🔧 المتطلبات الأساسية

### المتطلبات التقنية
- Node.js 18+
- npm أو pnpm
- حساب Vercel
- حساب Supabase
- تطبيق Meta/WhatsApp Business

### المتطلبات البيانية
- قاعدة بيانات Supabase معدّة
- RLS مفعل على جميع الجداول
- Webhook محدد في Meta

### المتطلبات الأمانية
- SSL/HTTPS مفعل
- CORS محمي
- Rate limiting قيد التنفيذ

---

## 🚀 خطوات النشر

### الخطوة 1: التحضير المحلي

```bash
# 1.1 تحديث الكود
git pull origin main

# 1.2 تنظيف البناء السابق
npm run clean

# 1.3 تثبيت المكتبات
npm install

# 1.4 بناء المشروع
npm run build

# 1.5 اختبار محلي
npm start
# افتح http://localhost:3000
```

### الخطوة 2: إعداد Vercel

```bash
# 2.1 تسجيل الدخول إلى Vercel
npx vercel login

# 2.2 ربط المشروع (إذا لم يكن موصولاً)
npx vercel link

# 2.3 إضافة متغيرات البيئة
# اذهب إلى: https://vercel.com/dashboard/[project]/settings/environment-variables

# أضف التالي:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_PHONE_NUMBER_ID=...
VERIFY_TOKEN=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### الخطوة 3: إعداد Supabase

```sql
-- 3.1 تمكين RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- 3.2 تمكين Realtime (اختياري)
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 3.3 إنشاء backup
-- اذهب إلى Database > Backups > Enable automated backups
```

### الخطوة 4: تكوين Meta/WhatsApp

```
4.1 اذهب إلى https://developers.facebook.com/apps/[app-id]/settings

4.2 أضف Webhook:
    URL: https://yourdomain.com/api/vae/webhook/whatsapp
    Verify Token: [استخدم القيمة من VERIFY_TOKEN]
    
4.3 اشترك في الأحداث:
    ☑ messages
    ☑ message_status
    ☑ message_template_status_update

4.4 حفظ الإعدادات
```

### الخطوة 5: النشر

```bash
# 5.1 الطريقة الأولى: من CLI
npx vercel deploy --prod

# 5.2 الطريقة الثانية: من Git
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
# Vercel سينشر تلقائياً

# 5.3 متابعة النشر
vercel logs production --tail
```

---

## ✅ إعدادات ما بعد النشر

### التحقق الأولي

```bash
# 1. التحقق من الصحة
curl https://yourdomain.com/api/health

# يجب أن تحصل على:
{
  "status": "healthy",
  "checks": {
    "database": { "status": true },
    "api": { "status": true }
  }
}

# 2. اختبار الويب هوك
curl -X POST https://yourdomain.com/api/vae/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"entry":[]}'

# 3. عرض السجلات
vercel logs production
```

### تفعيل المراقبة

```javascript
// أضف Sentry للمراقبة (اختياري)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### إعدادات CDN و Caching

```
1. اذهب إلى Vercel > Settings > Edge Config
2. أضف قواعس caching:
   - Static assets: max-age=31536000
   - API responses: no-cache
   - Images: max-age=86400
```

---

## 📊 المراقبة والصيانة

### المراقبة اليومية

```bash
# عرض الأخطاء
vercel logs production --tail --status error

# عرض الأداء
vercel analytics

# عرض الاستخدام
vercel usage

# البحث في السجلات
vercel logs production --search "error"
```

### التنبيهات

```
1. إعداد Vercel Monitoring:
   Settings > Monitoring > Enable all alerts

2. المؤشرات المهمة:
   - Error rate > 1%
   - Database connection pool > 80%
   - Response time > 2s
   - 4xx/5xx errors
```

### النسخ الاحتياطية

```bash
# إنشاء نسخة احتياطية يدوية
# Supabase > Database > Backups > Create backup

# التحقق من النسخ الاحتياطية التلقائية
# Supabase > Database > Backups
```

---

## 🆘 استكشاف المشاكل

### المشكلة: الموقع بطيء جداً

```bash
# 1. فحص الأداء
curl -i https://yourdomain.com

# 2. عرض metrics
vercel analytics

# 3. تحسينات:
   - تفعيل Caching
   - تحسين Database Queries
   - تقليل حجم الحزم
```

### المشكلة: الويب هوك لا يستقبل الرسائل

```bash
# 1. التحقق من إعدادات Meta
   Settings > Webhooks > Messages

# 2. اختبار الاتصال
curl -X POST https://yourdomain.com/api/vae/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"text":"test"}]}}]}]}'

# 3. عرض السجلات
vercel logs production --tail

# 4. التحقق من الـ Verify Token
echo $VERIFY_TOKEN
```

### المشكلة: خطأ "Unauthorized"

```bash
# 1. التحقق من SUPABASE_SERVICE_ROLE_KEY
echo $SUPABASE_SERVICE_ROLE_KEY | head -c 20

# 2. التحقق من RLS
# Supabase > Authentication > RLS

# 3. الحل:
   - أعد إنشاء المفاتيح
   - أعد تشغيل التطبيق
```

### المشكلة: قاعدة البيانات بطيئة

```bash
# 1. فحص الاتصالات
# Supabase > Database > Connections

# 2. عرض الاستعلامات البطيئة
# Supabase > Database > Query Performance

# 3. التحسينات:
   - أضف indexes على الأعمدة المستخدمة بكثرة
   - استخدم LIMIT للاستعلامات
   - تقليل الـ connections المتزامنة
```

### المشكلة: مشاكل الذاكرة

```bash
# 1. فحص استخدام الذاكرة
vercel logs production --tail | grep memory

# 2. تقليل الحجم
   - استخدم streaming للبيانات الكبيرة
   - حذف الـ subscriptions القديمة
   - تقليل cache size

# 3. زيادة حدود الدوال
# vercel.json > functions > memory
```

---

## 📈 التحسينات المستقبلية

### مدى القصير (أسبوع)
- [ ] فعّل Analytics على Vercel
- [ ] أضف Monitoring من Sentry
- [ ] إنشاء Dashboard للمراقبة
- [ ] إعداد automated backups

### مدى المتوسط (شهر)
- [ ] استخدم Redis للـ Cache
- [ ] أضف Load Balancing
- [ ] استخدم CDN عالمية
- [ ] تحسين Database Performance

### مدى الطويل (ربع سنة)
- [ ] ترحيل إلى microservices
- [ ] تطبيق CI/CD المتقدم
- [ ] شهادة SSL موثقة
- [ ] WAF (Web Application Firewall)

---

## 📞 الدعم الفني

### في حالة الطوارئ

```bash
# 1. التحقق من الحالة
curl https://yourdomain.com/api/health

# 2. الرجوع للنسخة السابقة
vercel rollback

# 3. إعادة تشغيل
vercel redeploy

# 4. اتصل بفريق الدعم
support@example.com
```

---

## 📚 الملفات المهمة

- `PRODUCTION_CHECKLIST.md` - قائمة تفصيلية للفحوصات
- `QUICK_DEPLOY.md` - نشر سريع في 5 دقائق
- `ENV_SETUP.md` - إعداد متغيرات البيئة
- `next.config.ts` - تكوين Next.js للإنتاج
- `vercel.json` - تكوين Vercel

---

**الحالة:** ✅ جاهز للإنتاج الآن
**آخر تحديث:** 2026-03-26
**الإصدار:** 1.0.0 Production Ready
