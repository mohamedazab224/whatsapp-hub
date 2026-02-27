## مشكلة التوكن

التوكن الحالي **غير صالح** (Error 401).

## الحل - احصل على توكن جديد:

### الخطوة 1: اذهب إلى Meta App Dashboard
https://developers.facebook.com/apps/724370950034089/

### الخطوة 2: احصل على User Access Token
- اذهب إلى Tools > Access Token Debugger
- أو: Settings > User Access Tokens
- اختر: Generate Token
- صلاحيات مطلوبة:
  - whatsapp_business_messaging
  - business_management

### الخطوة 3: نسخ التوكن الجديد
ثم ضعه في .env.local:
```
WHATSAPP_ACCESS_TOKEN=<التوكن الجديد هنا>
```

### الخطوة 4: شغّل الاختبار مرة أخرى
```bash
node scripts/send-test-image.js
```

---

**ملاحظة:** التوكنات تنتهي صلاحيتها. تأكد من أن التوكن الجديد نشط وله صلاحيات.
