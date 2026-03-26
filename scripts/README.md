# 🔧 سكريبتات الإنتاج

هذا المجلد يحتوي على السكريبتات المساعدة لنشر الإنتاج.

## 📝 السكريبتات المتاحة

### 1. **production-check.sh**
فحص شامل لجاهزية المشروع للإنتاج.

```bash
bash scripts/production-check.sh
```

**يفحص:**
- ✓ تثبيت Node.js و npm
- ✓ وجود package.json
- ✓ البناء بدون أخطاء
- ✓ ESLint بدون أخطاء
- ✓ وجود ملفات التكوين
- ✓ متغيرات البيئة المطلوبة
- ✓ الملفات الأمنية
- ✓ حجم البناء

**النتيجة:**
- ✅ إذا كان كل شيء جاهز: "المشروع جاهز للإنتاج"
- ❌ إذا كان هناك مشاكل: قائمة بالمشاكل والحلول

---

### 2. **production-build.sh**
بناء شامل مع تنظيف وتحقق كامل.

```bash
bash scripts/production-build.sh
```

**ما يفعله:**
1. تنظيف البناء السابق
2. تثبيت المكتبات
3. فحص الأمان (ESLint)
4. بناء المشروع
5. عرض حجم الملفات
6. نصائح النشر

**المدة المتوقعة:** 2-5 دقائق

---

### 3. **setup-demo-user.js**
إعداد مستخدم تجريبي.

```bash
node scripts/setup-demo-user.js
```

**ما يفعله:**
- إنشاء مستخدم demo
- إنشاء مشروع demo
- إضافة أرقام تجريبية
- إضافة جهات اتصال تجريبية

**الاستخدام:**
- اختبار التطبيق قبل النشر
- عرض توضيحي للعملاء

---

### 4. **send-test-message.js**
إرسال رسالة تجريبية.

```bash
node scripts/send-test-message.js
```

**المتطلبات:**
- مستخدم demo موجود
- WHATSAPP_ACCESS_TOKEN معروّف

**ما يفعله:**
- إرسال رسالة اختبار
- تسجيل النتيجة
- التحقق من الاتصال

---

### 5. **import-meta-data.js**
استيراد بيانات من Meta/WhatsApp.

```bash
node scripts/import-meta-data.js
```

**ما يفعله:**
- استيراد الأرقام من Meta
- استيراد الرسائل السابقة
- استيراد المعلومات الأخرى

---

## 🚀 الاستخدام السريع

### نشر أول مرة

```bash
# 1. فحص الجاهزية
bash scripts/production-check.sh

# 2. بناء شامل
bash scripts/production-build.sh

# 3. النشر
npm run deploy:prod
```

### اختبار ما بعد النشر

```bash
# 1. التحقق من الصحة
curl https://yourdomain.com/api/health

# 2. عرض السجلات
npm run logs

# 3. اختبار الويب هوك
node scripts/send-test-message.js
```

---

## 📊 المتغيرات المطلوبة

لتشغيل السكريبتات، تأكد من وجود:

```bash
# متغيرات Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# متغيرات Meta/WhatsApp
WHATSAPP_ACCESS_TOKEN
WHATSAPP_APP_SECRET
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_PHONE_NUMBER_ID
```

---

## ⚙️ تخصيص السكريبتات

لتعديل السكريبتات لاحتياجاتك:

```bash
# افتح السكريبت
nano scripts/production-check.sh

# عدّل حسب احتياجاتك
# احفظ (Ctrl+O ثم Ctrl+X)

# شغّل النسخة المعدلة
bash scripts/production-check.sh
```

---

## 🆘 استكشاف المشاكل

### "Permission denied: production-check.sh"

```bash
# أعطِ الصلاحيات
chmod +x scripts/*.sh

# ثم شغّل
bash scripts/production-check.sh
```

### "Node command not found"

```bash
# تأكد من تثبيت Node.js
node --version

# أعد تثبيت إذا لزم الأمر
# https://nodejs.org/
```

### "npm: command not found"

```bash
# تأكد من npm مثبت
npm --version

# اعد تثبيت node_modules
npm install
```

---

## 📝 إنشاء سكريبت جديد

```bash
#!/bin/bash

# إضافة في أعلى الملف
set -e  # توقف عند أي خطأ

echo "🚀 شروع السكريبت..."

# الكود هنا

echo "✅ انتهى!"
```

---

**Created:** 2026-03-26
**Status:** ✅ جاهز للاستخدام
