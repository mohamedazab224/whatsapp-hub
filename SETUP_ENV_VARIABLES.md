# كيفية إضافة متغيرات البيئة (Environment Variables)

## الطريقة 1: استخدام v0 Vars Sidebar (الأسهل والأفضل)

### الخطوات:

1. **افتح v0 Sidebar على اليسار**
2. **اضغط على تبويب "Vars"** (متغيرات البيئة)
3. **اضغط على "+ Add Variable"** أو "إضافة متغير"
4. **أدخل البيانات:**
   - **Name:** اسم المتغير (مثل `WHATSAPP_ACCESS_TOKEN`)
   - **Value:** قيمة المتغير (المفتاح أو التوكن)

5. **كرر لكل متغير من القائمة أدناه**

## المتغيرات المطلوبة

### 1. Supabase (إلزامي)
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key (سري)
```

### 2. WhatsApp API (إلزامي)
```
WHATSAPP_ACCESS_TOKEN = your-meta-token (سري)
WHATSAPP_APP_SECRET = your-app-secret (سري)
WHATSAPP_PHONE_NUMBER_ID = 527697617099639
WHATSAPP_BUSINESS_ACCOUNT_ID = 109389858906854
WHATSAPP_API_VERSION = v24.0
```

### 3. Webhook (إلزامي)
```
WHATSAPP_WEBHOOK_VERIFY_TOKEN = QvacXnwH_5QWUTKsEsxEgtYd8kHpVcf3U
VERIFY_TOKEN = QvacXnwH_5QWUTKsEsxEgtYd8kHpVcf3U
```

### 4. Rate Limiting (اختياري)
```
WEBHOOK_RATE_LIMIT_MAX = 120
WEBHOOK_RATE_LIMIT_WINDOW_SEC = 60
QUEUE_RATE_LIMIT_MAX = 30
QUEUE_RATE_LIMIT_WINDOW_SEC = 60
```

### 5. Logging (اختياري)
```
LOG_LEVEL = info
QUEUE_SECRET = your-secret-key
```

### 6. App Config
```
NEXT_PUBLIC_API_URL = http://localhost:3000
```

## الطريقة 2: استخدام ملف .env.local (للتطوير المحلي فقط)

1. انسخ ملف `.env.example` إلى `.env.local`
2. ملء القيم الفعلية
3. لا تُرسل الملف إلى git (موجود في `.gitignore`)

## ملاحظات مهمة

- **المتغيرات الحمراء (السرية):** لا تشاركها مع أحد
- **NEXT_PUBLIC_* :** المتغيرات البدء ب NEXT_PUBLIC تكون مرئية في المتصفح (لا تضع فيها بيانات حساسة)
- **تحديث متغيرات:** بعد إضافة متغيرات جديدة، إعادة تشغيل التطبيق قد تكون مطلوبة
- **Vercel Production:** استخدم Vercel Dashboard لإضافة متغيرات الإنتاج
