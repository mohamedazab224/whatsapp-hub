# اختبار فعلي مباشر - إرسال صور من WhatsApp

## البيانات المطلوبة للاختبار

**رقم الهاتف للإرسال إليه:**
```
+201092750351
```

**نوع الاختبارات:**
1. صورة عادية (JPEG/PNG)
2. فيديو قصير
3. مستند (PDF)
4. رسالة نصية مع صورة

---

## ما يجب أن يحدث عند الإرسال

### الخطوة 1: أرسل من WhatsApp الخاص بك
- افتح WhatsApp
- ابحث عن الرقم +201092750351
- أرسل صورة من مشروع أو موقع عمل

### الخطوة 2: النظام يستقبل الطلب
**في السيرفر (console):**
```
[v0] Webhook received: image from +20XXXXXXXXX
[v0] Media ID: wamedia_xxxxx
[v0] Type: image/jpeg
[v0] Storing in database...
[v0] Saving to Supabase...
```

### الخطوة 3: التحقق من التخزين
**في Supabase (جدول vae_media):**
- ✅ تظهر صورة جديدة
- ✅ مع timestamp
- ✅ مع sender_phone_number: +20XXXXXXXXX
- ✅ مع media_url

### الخطوة 4: التحليل التلقائي بـ AI
**في قاعدة البيانات (جدول vae_ai_analysis):**
- ✅ نتيجة التحليل تظهر
- ✅ جودة الصورة
- ✅ الكشف عن الأشياء
- ✅ التصنيف التلقائي

### الخطوة 5: ظهور في Dashboard
- افتح http://localhost:3000/vae/dashboard
- ستظهر الصورة في:
  - آخر الوسائط المستقبلة
  - الإحصائيات الحية
  - نتائج AI

---

## نقاط الفحص الحرجة

### ✅ الفحص 1: استقبال الـ Webhook
```bash
# في الـ logs تحت:
[v0] POST /api/vae/webhook/whatsapp
[v0] Status: 200 OK
```

### ✅ الفحص 2: حفظ الصورة
```bash
# في Supabase -> vae_media:
- media_id (من WhatsApp)
- sender_phone_number (رقمك)
- media_type (image/jpeg etc)
- storage_path (صورة مخزنة)
```

### ✅ الفحص 3: تحليل AI
```bash
# في Supabase -> vae_ai_analysis:
- quality_score (0-100)
- detected_objects (القائمة)
- classification (نوع العمل)
```

### ✅ الفحص 4: ظهور في Dashboard
```bash
# في http://localhost:3000/vae/dashboard:
- صورتك تظهر مع timestamp
- معلومات المرسل
- نتائج التحليل
```

---

## خطوات الاختبار السريعة

### قبل الإرسال (من جهتك):

1. **تأكد من التشغيل:**
   ```bash
   pnpm dev
   # يجب ترى: Ready in 1.5s
   ```

2. **شغّل ngrok (أو tunnel آخر):**
   ```bash
   ngrok http 3000
   # ستحصل على URL مثل: https://xxxx-xxxx-xxxx.ngrok.io
   ```

3. **أضف الـ Webhook في Meta Dashboard:**
   - URL: `https://xxxx-xxxx-xxxx.ngrok.io/api/vae/webhook/whatsapp`
   - Token: `WHATSAPP_WEBHOOK_VERIFY_TOKEN` من .env.local

4. **افتح الـ Logs:**
   ```bash
   # Terminal جديد:
   tail -f .logs/webhook.log
   ```

5. **افتح Dashboard:**
   - http://localhost:3000/vae/dashboard

### عند الإرسال (من WhatsApp):

**أرسل هذه الأشياء بالترتيب:**

1. صورة عادية
   - رقم: +201092750351
   - نوع: JPG/PNG
   - الوقت: لاحظ الساعة

2. فيديو قصير
   - مدة: 5-10 ثواني
   - الحجم: أقل من 16 MB

3. صورة مع caption:
   - Caption: "test image for VAE"

4. مستند PDF (اختياري):
   - حجم صغير جداً

---

## التحقق من النتائج

### في Terminal (Logs):
```
✅ [v0] Webhook POST received
✅ [v0] Media downloaded from WhatsApp
✅ [v0] Uploaded to Supabase Storage
✅ [v0] Saved to vae_media table
✅ [v0] AI analysis started
✅ [v0] Results saved to vae_ai_analysis
```

### في Supabase:
```
✅ جدول vae_media: عدد الصور زاد
✅ جدول vae_ai_analysis: نتائج جديدة
✅ Storage: مجلد vae_media جديد
```

### في Dashboard:
```
✅ http://localhost:3000/vae/dashboard
✅ رؤية الصور المستقبلة
✅ رؤية الإحصائيات الحية
✅ رؤية نتائج التحليل
```

---

## الردّ العكسي (اختياري)

إذا أردت الرد من النظام إلى WhatsApp:

1. اضغط زر "إرسال تقرير"
2. النظام يرسل رسالة تلقائية مع النتائج
3. تصل لك على WhatsApp

---

## المشاكل المحتملة وحلولها

### ❌ لم تصل الصورة للـ logs

**السبب الأساسي: الـ webhook URL غير صحيح**
- تأكد من ngrok URL صحيح
- تأكد من إضافة `/api/vae/webhook/whatsapp` كاملة

**الحل:**
```bash
# شغّل ngrok مجددا واحصل على URL جديد
ngrok http 3000
# أضفها في Meta Dashboard مجددا
```

### ❌ رسالة "Signature mismatch"

**السبب: WHATSAPP_APP_SECRET خاطئ**

**الحل:**
```bash
# تحقق من .env.local:
WHATSAPP_APP_SECRET=xxxx (يجب أن يكون app secret من Meta)
# أعد التشغيل:
pnpm dev
```

### ❌ الصورة لم تُحفظ في Supabase

**السبب: مشكلة في Storage أو RLS**

**الحل:**
```bash
# تحقق من Storage bucket:
# Supabase -> Storage -> vae_media (يجب يكون موجود)
# إذا لم يكن موجود:
# أنشئه يدويا وأعطه صلاحيات public read
```

### ❌ Dashboard فارغ

**السبب: لم يتم تحديث الصفحة**

**الحل:**
```bash
# في المتصفح:
# Ctrl+Shift+R (Hard Refresh)
# أو اذهب مباشرة:
http://localhost:3000/vae/dashboard?t=Date.now()
```

---

## ملخص للفحص السريع

| الخطوة | الفحص | النتيجة المتوقعة |
|-------|-------|-----------------|
| 1 | إرسال صورة من WhatsApp | ✅ صورة مرسلة بنجاح |
| 2 | فحص Webhook logs | ✅ POST request ظهرت |
| 3 | فحص Supabase vae_media | ✅ صورة جديدة ظهرت |
| 4 | فحص AI analysis | ✅ نتائج التحليل |
| 5 | فحص Dashboard | ✅ الصورة والبيانات ظاهرة |

---

## معلومات الدعم

**إذا حصلت مشكلة:**

1. اقرأ logs في Terminal بعناية
2. فحص Supabase مباشرة
3. تحقق من env variables
4. أعد تشغيل السيرفر

---

**الآن جاهز للاختبار الحي!**

أرسل الصور وقل لي النتائج.
