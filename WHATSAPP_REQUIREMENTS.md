# متطلبات تشغيل VAE مع WhatsApp Integration

## المتطلبات الأساسية

### 1. حساب Meta/Facebook Business
- حساب Facebook Business مفعّل
- Business Manager مُعد (business.facebook.com)
- صلاحيات Admin على الـ App

### 2. تطبيق WhatsApp Business على Meta
- إنشاء تطبيق جديد أو استخدام موجود
- نوع التطبيق: **WhatsApp Business**
- Platform: **Web**

### 3. حساب WhatsApp Business
- رقم هاتف مُسجّل وموثّق
- التحقق من الرقم (SMS أو Call)
- نوع الحساب: **Business Account** (ليس Personal)

---

## خطوات الإعداد التفصيلية

### الخطوة 1: إنشاء تطبيق WhatsApp على Meta

```
1. اذهب إلى: https://developers.facebook.com/
2. اختر "My Apps" → "Create App"
3. اختر "Business" كنوع التطبيق
4. أكمل المعلومات الأساسية
5. اختر "WhatsApp" من المنتجات المتاحة
6. اضغط "Set Up"
```

### الخطوة 2: الحصول على Credentials

من لوحة تحكم التطبيق:

```
1. اذهب إلى Settings > Basic
   - App ID: احفظ هذا
   - App Secret: احفظ هذا

2. اذهب إلى WhatsApp > Getting started
   - Business Account ID: احفظ هذا
   - Business Phone Number ID: احفظ هذا
   - Access Token: احفظ هذا (صلاحية 24 ساعة - جدّده إذا انتهت)
```

### الخطوة 3: تكوين Webhook

في إعدادات التطبيق:

```
1. اذهب إلى WhatsApp > Configuration
2. اختر "Webhook"
3. في "Callback URL" ضع:
   https://your-domain.com/api/vae/webhook/whatsapp
   
4. في "Verify Token" ضع قيمة عشوائية آمنة مثل:
   my_webhook_verify_token_abc123xyz
```

---

## متطلبات متغيرات البيئة

أضف هذه المتغيرات إلى `.env.local`:

```env
# WhatsApp Configuration
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=my_webhook_verify_token_abc123xyz
WHATSAPP_API_VERSION=v18.0

# Domain for Webhook
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### الحصول على الـ Access Token

هناك نوعان من Tokens:

**1. Temporary Token (اختبار سريع - 24 ساعة)**
```
من WhatsApp > Getting started:
- ستجد "Test Credentials"
- Access Token يأتي مباشرة (صلاحية محدودة)
```

**2. Permanent Token (للإنتاج - مستمر)**
```
1. اذهب إلى Settings > Users and Permissions
2. اختر User Role: Manager
3. اختر Admin
4. الـ token سيكون دائم الصلاحية
```

---

## خطوات الربط العملية

### الخطوة 1: البيئة المحلية (localhost testing)

للاختبار على localhost، استخدم ngrok:

```bash
# 1. تحميل ngrok
brew install ngrok  # أو download من ngrok.com

# 2. بدء ngrok على port 3000
ngrok http 3000

# 3. انسخ الـ URL (مثل: https://xxxx-xxx-xxx.ngrok.io)

# 4. استخدم في WhatsApp Webhook:
https://xxxx-xxx-xxx.ngrok.io/api/vae/webhook/whatsapp
```

### الخطوة 2: البيئة الإنتاج (Vercel)

```
1. Deploy على Vercel
2. الـ domain الخاص بك سيكون: https://your-app.vercel.app
3. استخدم هذا في WhatsApp Webhook:
   https://your-app.vercel.app/api/vae/webhook/whatsapp
4. أضف متغيرات البيئة في Vercel Dashboard
```

---

## اختبار WhatsApp Integration

### اختبار 1: التحقق من Webhook

```bash
# الـ API سيتحقق من الـ verify token
curl -X GET "http://localhost:3000/api/vae/webhook/whatsapp?mode=subscribe&challenge=test&verify_token=my_webhook_verify_token_abc123xyz"

# يجب ترى الرد:
# {"status":true,"message":"Webhook verified"}
```

### اختبار 2: إرسال رسالة اختبار من Meta

```
1. اذهب إلى WhatsApp > Getting started
2. اختر "Send a test message"
3. اختر رقم هاتفك
4. اضغط "Send"
5. يجب تستقبل الرسالة على هاتفك
```

### اختبار 3: إرسال صورة من WhatsApp

```
1. من حسابك على WhatsApp
2. راسل رقم WhatsApp Business المربوط
3. أرسل صورة
4. الصورة ستُمعالَج تلقائياً

المتوقع:
- الصورة تُحفظ في Supabase Storage
- الـ metadata يُحفظ في قاعدة البيانات
- AI analysis يبدأ تلقائياً
```

---

## الملفات المطلوبة في المشروع

### 1. API Route للـ Webhook

✅ **موجود:** `/app/api/vae/webhook/whatsapp/route.ts`

يتعامل مع:
- التحقق من Webhook
- استقبال الرسائل
- معالجة الوسائط
- تخزين البيانات

### 2. API Route لمعالجة الصور

✅ **موجود:** `/app/api/vae/media/upload/route.ts`

يتعامل مع:
- رفع الصور
- تخزين في Supabase
- حفظ البيانات الوصفية

### 3. API Route للتحليل

✅ **موجود:** `/app/api/vae/analyze/process/route.ts`

يتعامل مع:
- تحليل الصور بـ AI
- استخراج البيانات
- تحديث قاعدة البيانات

---

## قائمة التحقق قبل الاختبار

- [ ] تطبيق WhatsApp Business معروف على Meta
- [ ] Business Account ID موجود
- [ ] Phone Number ID موجود
- [ ] Access Token نسختك وجديد
- [ ] App Secret محفوظ
- [ ] Webhook URL مُسجّلة في Meta
- [ ] Verify Token متطابق في الكود والـ .env
- [ ] ngrok شغّال (للـ localhost)
- [ ] Vercel deployed (للإنتاج)
- [ ] متغيرات البيئة مضافة في .env.local
- [ ] Storage bucket "vae_media" موجود في Supabase
- [ ] قاعدة البيانات تعمل بتمام

---

## مثال عملي: الرسالة من WhatsApp → النظام

### ما يحدث في الخلفية:

```
1. تُرسل صورة من WhatsApp
   ↓
2. Webhook يستقبلها في: /api/vae/webhook/whatsapp
   ↓
3. يتحقق من التوقيع HMAC
   ↓
4. يحفظ بيانات الرسالة في جدول: media_captures
   ↓
5. يرفع الصورة إلى Supabase Storage
   ↓
6. يبدأ معالجة AI في الخلفية
   ↓
7. يحفظ النتائج في: ai_analysis
   ↓
8. Dashboard يعرض البيانات الجديدة فوراً
```

---

## حل المشاكل الشائعة

### المشكلة: "Webhook not verified"
**الحل:**
```
- تحقق من الـ Verify Token متطابق
- تأكد من URL صحيح
- استخدم ngrok للـ localhost
```

### المشكلة: "Access Token expired"
**الحل:**
```
- اذهب إلى Meta Dashboard
- احصل على Access Token جديد
- حدّث .env.local
```

### المشكلة: "صورة لم تُحفظ"
**الحل:**
```
- تحقق من وجود Storage bucket "vae_media"
- تأكد من RLS policies السليمة
- شاهد الـ logs في Supabase
```

### المشكلة: "AI Analysis لم تبدأ"
**الحل:**
```
- تأكد من الـ database connection
- افحص الـ logs في server
- تحقق من الـ Edge Functions status
```

---

## الخطوات الفورية للبدء

### 1. إعداد الـ Environment (5 دقائق)
```bash
cp .env.example .env.local

# أضف القيم:
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
```

### 2. تشغيل السيرفر (2 دقيقة)
```bash
pnpm install
pnpm dev
```

### 3. إعداد ngrok (1 دقيقة)
```bash
ngrok http 3000
# انسخ الـ URL
```

### 4. ربط الـ Webhook (2 دقيقة)
```
في Meta Dashboard:
- Webhook URL: https://ngrok-url/api/vae/webhook/whatsapp
- Verify Token: القيمة من .env
```

### 5. الاختبار (2 دقيقة)
```
أرسل صورة من WhatsApp
انتظر المعالجة
افتح Dashboard وشاهد النتائج
```

**الوقت الإجمالي: 12 دقيقة**

---

## موارد مهمة

- Meta Developers: https://developers.facebook.com/docs/whatsapp
- WhatsApp API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- ngrok: https://ngrok.com/
- Supabase Storage: https://supabase.com/docs/guides/storage

---

## الدعم والمساعدة

إذا واجهت مشكلة:

1. افحص الـ logs في server (terminal)
2. افحص الـ Network tab في DevTools
3. تحقق من Supabase Dashboard
4. اقرأ الأخطاء بعناية (في console)
