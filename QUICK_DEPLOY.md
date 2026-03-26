# 📚 دليل النشر السريع - WhatsApp Hub

## ⚡ النشر في 5 دقائق

### 1. تحضير المشروع

```bash
# تحديث الكود
git pull origin main

# بناء وتحقق
npm run build

# اختبر الصحة
curl http://localhost:3000/api/health
```

### 2. إعدادات Vercel

```bash
# تسجيل دخول Vercel
npx vercel login

# ربط المشروع
npx vercel link

# إضافة متغيرات البيئة
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add WHATSAPP_ACCESS_TOKEN
npx vercel env add WHATSAPP_APP_SECRET
npx vercel env add WHATSAPP_BUSINESS_ACCOUNT_ID
npx vercel env add WHATSAPP_PHONE_NUMBER_ID
npx vercel env add VERIFY_TOKEN
npx vercel env add WHATSAPP_WEBHOOK_VERIFY_TOKEN
```

### 3. النشر

```bash
# نشر للإنتاج
npx vercel deploy --prod

# أو بـ Git
git push origin main
# Vercel سينشر تلقائياً
```

---

## 🔍 التحقق بعد النشر

```bash
# 1. التحقق من الصحة
curl https://yourdomain.com/api/health

# 2. عرض السجلات
vercel logs production

# 3. اختبر الويب هوك
curl -X POST https://yourdomain.com/api/vae/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature: sha256=..." \
  -d '{"entry":[]}'
```

---

## ⚠️ المشاكل الشائعة وحلولها

| المشكلة | الحل |
|--------|------|
| خطأ Supabase | تحقق من `NEXT_PUBLIC_SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` |
| الويب هوك لا يعمل | تحقق من `VERIFY_TOKEN` و `WHATSAPP_WEBHOOK_VERIFY_TOKEN` |
| بطء الأداء | فعّل Caching وتحقق من database performance |
| خطأ 503 | اختبر `/api/health` للتحقق من الخدمات |

---

## 📊 المراقبة

### Vercel Dashboard
- https://vercel.com/dashboard
- شاهد: Web Vitals, Errors, Deployments

### Supabase Dashboard
- https://app.supabase.com
- شاهد: Database, API, Real-time

### السجلات الفعلية

```bash
# المتابعة الحية للسجلات
vercel logs production --tail

# فقط الأخطاء
vercel logs production --tail --status error
```

---

## 🆘 الطوارئ

### إعادة تشغيل الخدمات

```bash
# إعادة تشغيل التطبيق
vercel redeploy

# إعادة تشغيل قاعدة البيانات (Supabase)
# انتقل إلى Settings > Database > Restart
```

### الرجوع للإصدار السابق

```bash
# عرض جميع النسخ
vercel list

# الرجوع لنسخة سابقة
vercel promote <deployment-id>
```

---

## 📋 قائمة التحقق النهائية

- [ ] جميع الاختبارات تمر
- [ ] لا توجد أخطاء في البناء
- [ ] متغيرات البيئة موجودة في Vercel
- [ ] Supabase متصل والـ RLS مفعل
- [ ] Meta Webhook معروّف بشكل صحيح
- [ ] SSL/HTTPS مفعل
- [ ] النسخة الاحتياطية من البيانات موجودة

---

**الحالة:** ✅ جاهز للإنتاج
