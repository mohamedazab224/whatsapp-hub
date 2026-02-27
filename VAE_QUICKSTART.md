# تعليمات التثبيت السريع - VAE System

## المتطلبات

- Node.js 18+ و pnpm
- حساب Supabase مفعل
- WhatsApp Business Account (اختياري)

## الخطوة 1: تنظيف وتثبيت الـ Dependencies

```bash
# تنظيف البناء السابق
pnpm run clean

# تثبيت الـ Dependencies الجديدة
pnpm install
```

## الخطوة 2: إعداد قاعدة البيانات

```bash
# 1. اذهب إلى Supabase Dashboard
# 2. افتح SQL Editor
# 3. نسخ محتوى: scripts/01-vae-schema.sql
# 4. الصق وقم بـ Run
```

أو استخدم CLI:
```bash
# إذا كان لديك Supabase CLI مثبت
supabase db push
```

## الخطوة 3: إعداد متغيرات البيئة

إنشاء ملف `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# WhatsApp (اختياري)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_API_VERSION=v21.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## الخطوة 4: إنشاء Storage Bucket

في Supabase Dashboard:

1. اذهب إلى Storage
2. انقر على "Create New Bucket"
3. اسم الـ Bucket: `vae_media`
4. اختر "Public" (للوصول العام)
5. انقر Create

## الخطوة 5: تشغيل التطبيق

```bash
# في وضع التطوير
pnpm dev

# يجب أن تظهر:
# ▲ Next.js 16.1.5 (Turbopack)
# - Local: http://localhost:3000
```

## الخطوة 6: الوصول إلى النظام

افتح المتصفح وذهب إلى:

```
http://localhost:3000/vae/dashboard
```

يجب أن تظهر لوحة التحكم الرئيسية

## اختبار النظام

### 1. رفع صورة تجريبية

```bash
# الذهاب إلى صفحة الرفع
http://localhost:3000/vae/upload

# ملئ النموذج:
- معرف الموقع: SITE-001
- معرف العمل: WORK-001
- اسم المصور: أحمد محمد
- رفع صورة

# يجب أن ترى الرسالة: "تم رفع الصورة بنجاح!"
```

### 2. عرض Dashboard

```bash
http://localhost:3000/vae/dashboard

# يجب أن تظهر:
- إحصائيات في الأعلى
- آخر الصور المرفوعة
- مشاكل الأمان
- قائمة المشاريع
```

### 3. إنشاء تقرير

```bash
http://localhost:3000/vae/reports

# ملئ البيانات:
- معرف الموقع: SITE-001
- نوع التقرير: يومي
- انقر "إنشاء التقرير"

# يجب أن تظهر الإحصائيات والملخص
```

## استكشاف الأخطاء

### خطأ: "Supabase connection failed"
```bash
# تحقق من:
1. NEXT_PUBLIC_SUPABASE_URL صحيح
2. NEXT_PUBLIC_SUPABASE_ANON_KEY صحيح
3. الاتصال بـ internet نشط
```

### خطأ: "Turbopack error"
```bash
# الحل:
pnpm run clean
pnpm install
pnpm dev
```

### خطأ: "Storage bucket not found"
```bash
# تحقق من:
1. الـ bucket اسمه "vae_media"
2. الـ bucket موجود في Supabase Dashboard
3. Permissions صحيحة
```

### خطأ: "Database tables not found"
```bash
# تحقق من:
1. تشغيل migration scripts
2. الـ database connection صحيح
3. الجداول موجودة في Supabase
```

## الأوامر الهامة

```bash
# تنظيف وإعادة تثبيت
pnpm run clean
pnpm run rebuild

# اختبار الـ Build
pnpm run build

# التحقق من الأخطاء
pnpm run lint

# تشغيل الـ production
pnpm start
```

## الدعم والمساعدة

- تحقق من `VAE_IMPLEMENTATION.md` للوثائق الكاملة
- اقرأ `VAE_SYSTEM_SUMMARY.md` لملخص النظام
- تحقق من الـ browser console للأخطاء

## الخطوات التالية

بعد التثبيت الناجح:

1. أنشئ مشروع في Dashboard
2. أضف مواقع للمشروع
3. أضف مهام للمواقع
4. ابدأ بـ رفع الصور
5. راقب التقارير والإحصائيات

---

**تم بنجاح!** النظام الآن جاهز للاستخدام.
