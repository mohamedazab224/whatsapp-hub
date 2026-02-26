# ملخص سريع: متطلبات اختبار WhatsApp

## 5 خطوات للبدء الفوري

### 1️⃣ إعداد Meta (15 دقيقة)
- إنشاء تطبيق WhatsApp Business
- الحصول على: App ID, App Secret, Business Account ID, Phone Number ID, Access Token

### 2️⃣ إعداد البيئة المحلية (5 دقائق)
```bash
# حدّث .env.local بـ 5 متغيرات:
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=my_token_123
```

### 3️⃣ تشغيل التطبيق (2 دقيقة)
```bash
pnpm install
pnpm dev
# السيرفر على: http://localhost:3000
```

### 4️⃣ إعداد ngrok (1 دقيقة)
```bash
# Terminal جديد:
ngrok http 3000
# انسخ الـ URL الذي تحصل عليه
```

### 5️⃣ ربط Webhook (2 دقيقة)
- في Meta Dashboard
- اذهب إلى WhatsApp > Configuration
- أضف الـ ngrok URL: `https://xxxx.ngrok.io/api/vae/webhook/whatsapp`
- أضف Verify Token: `my_token_123`

---

## اختبر الآن ✓

```bash
# من Terminal جديد:
bash scripts/test-whatsapp-webhook.sh
```

أو يدوياً:
```bash
curl "http://localhost:3000/api/vae/webhook/whatsapp?mode=subscribe&challenge=test&verify_token=my_token_123"
```

---

## شغّل الاختبار الفعلي

1. **أرسل صورة من WhatsApp**
   - راسل رقم WhatsApp Business
   - أرسل أي صورة

2. **شاهد النتائج**
   - Server logs ستظهر المعالجة
   - Dashboard: `http://localhost:3000/vae/dashboard`
   - الصورة والبيانات ستظهر

---

## الملفات المهمة

| الملف | الشرح |
|------|------|
| `WHATSAPP_REQUIREMENTS.md` | دليل شامل (20 صفحة) |
| `WHATSAPP_TESTING_CHECKLIST.md` | قائمة تحقق تفصيلية |
| `scripts/test-whatsapp-webhook.sh` | script تلقائي للاختبار |

---

## المشاكل الشائعة

| المشكلة | الحل |
|--------|------|
| Webhook verification failed | تحقق من الـ Token متطابق |
| لا أستقبل الرسائل | استخدم ngrok URL الجديد |
| صورة لم تُحفظ | افحص Supabase Storage bucket |
| AI لم تحلل الصورة | تحقق من قاعدة البيانات |

---

## وقت الإعداد الإجمالي: 25 دقيقة

✓ اتبع الخطوات 5 بالترتيب
✓ استخدم Script للاختبار
✓ اقرأ الملفات المفصلة للمزيد

---

## المقبل

بعد نجاح الاختبار:
- Deploy على Vercel
- استخدم Permanent Access Token
- فعّل monitoring و logging
