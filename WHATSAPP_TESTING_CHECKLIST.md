# قائمة التحقق السريعة لاختبار WhatsApp

## المرحلة 1: إعداد Meta (15 دقيقة)

### Facebook Business
```
☐ حساب Facebook Business مفعّل
☐ دخول إلى business.facebook.com
☐ صلاحيات Admin
```

### تطبيق WhatsApp
```
☐ إنشاء تطبيق جديد (نوع: Business)
☐ إضافة منتج WhatsApp
☐ اختيار Platform: Web
```

### Business Account
```
☐ رقم هاتف موثّق ومسجّل
☐ حساب WhatsApp Business (ليس Personal)
☐ التحقق من الرقم
```

---

## المرحلة 2: الحصول على Credentials (5 دقائق)

```
☐ App ID: _______________________
☐ App Secret: _______________________
☐ Business Account ID: _______________________
☐ Phone Number ID: _______________________
☐ Access Token: _______________________
☐ Webhook Verify Token: my_webhook_abc123
```

---

## المرحلة 3: إعداد البيئة المحلية (5 دقائق)

```bash
# 1. تحديث .env.local
☐ WHATSAPP_BUSINESS_ACCOUNT_ID
☐ WHATSAPP_BUSINESS_PHONE_NUMBER_ID
☐ WHATSAPP_ACCESS_TOKEN
☐ WHATSAPP_APP_SECRET
☐ WHATSAPP_WEBHOOK_VERIFY_TOKEN

# 2. التحقق من المتغيرات
cat .env.local | grep WHATSAPP
```

---

## المرحلة 4: إعداد ngrok (للـ localhost)

```bash
☐ تحميل وتثبيت ngrok
☐ فتح terminal جديد
☐ تشغيل: ngrok http 3000
☐ نسخ الـ URL (https://xxxx-xxxx.ngrok.io)
☐ حفظ الـ URL

ngrok URL: _______________________
```

---

## المرحلة 5: تشغيل التطبيق

```bash
# Terminal 1: تشغيل ngrok
☐ ngrok http 3000

# Terminal 2: تشغيل التطبيق
☐ pnpm install
☐ pnpm dev

# تطبيقك الآن على:
Local: http://localhost:3000
Webhook: https://ngrok-url/api/vae/webhook/whatsapp
```

---

## المرحلة 6: ربط Webhook مع Meta

في Meta Developers Dashboard:

```
1. اذهب إلى WhatsApp > Configuration
2. اضغط "Edit Webhook"
3. أدخل:
   
   Callback URL: https://xxxx-xxxx.ngrok.io/api/vae/webhook/whatsapp
   Verify Token: my_webhook_abc123
   
4. اختر الـ events المراد استقبالها:
   ☐ messages
   ☐ message_template_status_update
   ☐ message_template_quality_update
   ☐ message_status

5. اضغط "Verify and Save"
```

---

## المرحلة 7: التحقق من الربط

```bash
# الاختبار الأول: التحقق من Webhook
curl -X GET "http://localhost:3000/api/vae/webhook/whatsapp?mode=subscribe&challenge=test&verify_token=my_webhook_abc123"

النتيجة المتوقعة:
✓ Status 200
✓ {"status":true,"message":"Webhook verified"}
```

---

## المرحلة 8: إرسال رسالة اختبار من Meta

```
في Meta Developers Dashboard:
1. اذهب إلى WhatsApp > Getting started
2. اختر "Send a test message"
3. اختر رقم هاتفك
4. اضغط "Send"

المتوقع:
✓ استقبال رسالة على WhatsApp
✓ رؤية الرسالة في قاعدة البيانات
```

---

## المرحلة 9: الاختبار الفعلي بالصور

### الاختبار 1: إرسال صورة

```
من هاتفك:
1. فتح WhatsApp
2. ابحث عن رقم WhatsApp Business المربوط
3. أرسل صورة (أي صورة)

في السيرفر (تتوقع رؤية):
✓ Received webhook with image
✓ Uploading to Supabase Storage
✓ Processing AI analysis
✓ Saving to database
```

### الاختبار 2: عرض البيانات

```
1. فتح http://localhost:3000/vae/dashboard
2. تسجيل دخول (إذا لزم)
3. انتظر تحديث البيانات

تتوقع رؤية:
✓ الصورة المرسلة
✓ معلومات الوسيط
✓ AI Analysis
✓ بيانات الوقت والموقع
```

### الاختبار 3: إرسال ملف

```
نفس الخطوات لكن مع ملف بدلاً من صورة:
✓ PDF
✓ DOC
✓ Video
✓ Audio
```

---

## جدول استكشاف الأخطاء

### خطأ: "Webhook verification failed"
```
الحل:
1. تحقق من الـ Verify Token (متطابق في المكانين)
2. تأكد من الـ URL صحيح
3. استخدم curl للاختبار:
   curl -X GET "http://localhost:3000/api/vae/webhook/whatsapp?mode=subscribe&challenge=test&verify_token=YOUR_TOKEN"
4. يجب ترى 200 OK
```

### خطأ: "Access Token expired"
```
الحل:
1. اذهب إلى Meta Dashboard
2. احصل على Access Token جديد
3. حدّث .env.local
4. أعد تشغيل السيرفر (Ctrl+C ثم pnpm dev)
```

### خطأ: "صورة لم تُستقبل"
```
الحل:
1. افحص الـ logs في Terminal
2. تأكد من ngrok يعمل
3. تحقق من الـ Webhook URL صحيح في Meta
4. أرسل رسالة اختبار من Meta Dashboard
```

### خطأ: "صورة استُقبلت لكن لم تُحفظ"
```
الحل:
1. افحص Supabase Storage bucket "vae_media"
2. تحقق من RLS policies
3. شاهد الـ logs في Supabase Dashboard
4. تأكد من WHATSAPP_BUSINESS_ACCOUNT_ID صحيح
```

### خطأ: "AI Analysis لم تبدأ"
```
الحل:
1. تحقق من قاعدة البيانات الاتصال
2. افحص الـ Edge Functions status
3. تحقق من متغيرات البيئة
4. شاهد server logs
```

---

## ملاحظات مهمة

### للإنتاج (Vercel):
```
1. استبدل ngrok URL بـ Vercel domain
2. أضف متغيرات البيئة في Vercel Dashboard
3. اختبر على الـ production URL
4. استخدم Access Token دائم (ليس مؤقت)
```

### للأمان:
```
☐ لا تشارك Access Token
☐ استخدم environment variables فقط
☐ فعّل HTTPS (ngrok يعطيك HTTPS تلقائياً)
☐ غيّر Verify Token بقيمة قوية عشوائية
```

### للأداء:
```
☐ معالجة الصور تحدث في الخلفية
☐ Dashboard يتحدّث فوراً
☐ قاعدة البيانات محسّنة مع Indexes
☐ Supabase Storage محسّن للأداء
```

---

## الدعم السريع

**مشكلة بـ ngrok؟**
- انسخ الـ URL الجديدة من ngrok
- حدّث الـ Webhook URL في Meta
- أعد تشغيل السيرفر

**مشكلة بـ Meta؟**
- تحقق من App ID و Secret
- تأكد من المنطقة الجغرافية صحيحة
- اتصل بـ Meta Support

**مشكلة بـ Supabase؟**
- افحص Dashboard
- تحقق من Storage buckets
- شاهد الـ Realtime status

---

## الخطوة التالية

```
✓ بعد نجاح الاختبار:
1. انشر على Vercel
2. حدّث الـ Webhook URL
3. فعّل الـ permanent access token
4. اختبر على الإنتاج
5. راقب الـ logs
```
