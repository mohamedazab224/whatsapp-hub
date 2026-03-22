# دليل إعداد وتفعيل نظام السحب التلقائي من Seafile

## 🚀 البدء السريع

### 1. إضافة متغيرات البيئة

اذهب إلى **Settings → Vars** وأضف المتغيرات التالية:

```env
SEAFILE_SERVER=https://seafile.alazab.com
SEAFILE_TOKEN=your_auth_token_here
SEAFILE_LIB_ID=your_library_id
```

### 2. الحصول على معلومات Seafile

#### الخطوة 1: احصل على Server URL
- Server: `https://seafile.alazab.com`

#### الخطوة 2: توليد Token
1. سجّل الدخول إلى Seafile
2. اذهب إلى **Settings → Security**
3. اضغط **Generate new API Token**
4. انسخ الـ Token

#### الخطوة 3: احصل على Library ID
1. في Seafile Dashboard
2. ابحث عن مكتبة "WhatsApp Media" أو أنشئ واحدة جديدة
3. انقر على المكتبة
4. انسخ Library ID من الـ URL أو الإعدادات

## ✅ اختبار الاتصال

### باستخدام الـ API

```bash
# اختبر الاتصال بـ Seafile
curl -X POST http://localhost:3000/api/media/seafile-test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "connectionStatus": {
      "connected": true,
      "message": "Connected to Seafile. Found X repositories."
    },
    "directoryStatus": {
      "exists": true,
      "path": "/whatsapp/2024-03-15"
    },
    "files": {
      "count": 0,
      "list": []
    }
  }
}
```

### عرض حالة المزامنة

```bash
curl -X GET http://localhost:3000/api/media/sync-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**سيعيد:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalFiles": 42,
      "successCount": 40,
      "failedCount": 2,
      "pendingCount": 0,
      "successRate": "95.24",
      "totalSize": 52428800,
      "totalSizeMB": "50.00"
    },
    "seafile": {
      "connected": true,
      "message": "Connected to Seafile..."
    },
    "recentFiles": [...]
  }
}
```

## 📊 المراقبة والاختبار

### 1. أرسل رسالة اختبار من WhatsApp

- افتح الدردشة مع رقم الأعمال الخاص بك
- أرسل صورة أو ملف
- يجب أن تُسحب الملفات تلقائياً إلى Seafile

### 2. تحقق من السجلات

```
[v0] Downloading media (attempt 1/3): image.jpg
[v0] Media downloaded successfully: 1024000 bytes
[v0] Uploading to Seafile: /whatsapp/2024-03-15/image.jpg
[v0] Seafile upload successful: /whatsapp/2024-03-15/image.jpg
```

### 3. تحقق من Seafile

1. سجّل الدخول إلى Seafile
2. اذهب إلى المكتبة
3. تحقق من المجلد: `/whatsapp/YYYY-MM-DD/`
4. يجب أن ترى الملفات المُسحوبة

## 🔧 استكشاف الأخطاء

### مشكلة: "Seafile connection failed"

**السبب:** خطأ في الاتصال بـ Seafile

**الحل:**
1. تحقق من Server URL (يجب أن يكون `https://seafile.alazab.com` بدون `/`)
2. تحقق من صلاحية الـ Internet
3. تحقق من أن Server متاح: `ping seafile.alazab.com`

### مشكلة: "Authentication failed (401)"

**السبب:** Token غير صحيح أو انتهى صلاحيته

**الحل:**
1. توليد Token جديد
2. تحديث متغير البيئة `SEAFILE_TOKEN`
3. أعد تشغيل التطبيق

### مشكلة: "Library not found (404)"

**السبب:** Library ID غير صحيح

**الحل:**
1. تحقق من Library ID
2. تأكد من أن المكتبة موجودة وقابلة للوصول
3. حاول إنشاء مكتبة جديدة

### مشكلة: "Media files not uploading"

**السبب:** المجلد غير موجود أو لا توجد صلاحيات

**الحل:**
1. تأكد من أن لديك صلاحيات الكتابة
2. تحقق من مساحة التخزين المتاحة
3. تحقق من أن المجلد يمكن إنشاؤه تلقائياً

## 📈 الإحصائيات والأداء

### معايير الأداء

| المقياس | الهدف | الحالي |
|--------|------|--------|
| وقت التنزيل | < 5 ثواني | - |
| وقت الرفع | < 10 ثواني | - |
| معدل النجاح | > 95% | - |
| حجم الملف الأقصى | 100 MB | - |

### تتبع الإحصائيات

```bash
# اعرض آخر 100 ملف تم سحبه
curl -X GET http://localhost:3000/api/media/sync-status

# اختبر الاتصال مع التفاصيل
curl -X POST http://localhost:3000/api/media/seafile-test \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🔐 الأمان

### أفضل الممارسات

1. **استخدم Tokens آمنة**
   - لا تشارك الـ Token
   - غيّر الـ Token بانتظام

2. **استخدم HTTPS فقط**
   - تأكد من أن Server URL يستخدم HTTPS
   - لا تستخدم HTTP في الإنتاج

3. **حدّد الصلاحيات**
   - أعط الـ Token أقل صلاحيات مطلوبة
   - استخدم حساب خدمة منفصل إن أمكن

4. **راقب الأنشطة**
   - تحقق من السجلات بحثاً عن نشاط غير عادي
   - راقب استخدام النطاق الترددي

## 📚 المراجع الإضافية

### ملفات مهمة

- `lib/media/seafile-client.ts` - عميل Seafile
- `lib/media/whatsapp-media-handler.ts` - معالج الوسائط
- `app/api/media/sync-status/route.ts` - حالة المزامنة
- `app/api/media/seafile-test/route.ts` - اختبار الاتصال

### توثيق Seafile

- [Seafile API Docs](https://manual.seafile.com/develop/web_api_overview.html)
- [Upload File API](https://manual.seafile.com/develop/web_api.html#upload-file)
- [Create Directory API](https://manual.seafile.com/develop/web_api.html#create-directory)

## 🆘 الدعم

إذا واجهت مشاكل:

1. **تحقق من السجلات** - ابحث عن `[v0]` prefix
2. **استخدم API الاختبار** - جرب `/api/media/seafile-test`
3. **تحقق من الإعدادات** - تأكد من جميع متغيرات البيئة
4. **اتصل بـ Support** - سيساعدك فريق الدعم

## 📋 Checklist النشر

قبل النشر للإنتاج:

- [ ] تم تكوين Seafile
- [ ] تم اختبار الاتصال بنجاح
- [ ] تم إضافة جميع متغيرات البيئة
- [ ] تم اختبار السحب التلقائي مع ملف اختبار
- [ ] تم التحقق من السجلات للأخطاء
- [ ] تم عرض حالة المزامنة
- [ ] تم تقييم الأداء
- [ ] تم التأكد من الأمان
