# VAE (Visual Accountability Engine) - نظام توثيق الأعمال الميدانية

نظام متقدم لتوثيق الأعمال الميدانية بالصور والفيديوهات مع تحليل ذكي بـ AI

## المكونات المبنية

### 1. قاعدة البيانات
**الملف**: `scripts/01-vae-schema.sql`

الجداول الرئيسية:
- `vae_projects` - المشاريع الرئيسية
- `vae_sites` - المواقع الفرعية لكل مشروع
- `vae_work_items` - الأعمال والمهام
- `vae_media` - الصور والفيديوهات المرفوعة
- `vae_ai_analysis` - نتائج تحليل AI
- `vae_progress_comparisons` - مقارنات Before/After
- `vae_event_logs` - سجل الأحداث
- `vae_reports` - التقارير المنتجة

### 2. TypeScript Types
**الملف**: `lib/types/vae.ts`

أنواع بيانات شاملة لجميع كائنات النظام مع IntelliSense كامل

### 3. API Endpoints

#### رفع الوسائط
**POST** `/api/vae/media/upload`
- استقبال الصور والفيديوهات
- تخزين في Supabase Storage
- إنشاء سجل الميديا في قاعدة البيانات
- إطلاق معالجة AI

**Body:**
```json
{
  "file": File,
  "work_item_id": "string",
  "site_id": "string",
  "photographer_name": "string",
  "notes": "string",
  "source": "manual" | "whatsapp" | "mobile_app" | "camera",
  "gps_location": {"lat": 0, "lng": 0}
}
```

#### تحليل AI
**POST** `/api/vae/analyze/process`
- تحليل الصور بـ AI
- كشف الكائنات والمشاكل
- حفظ النتائج

**Body:**
```json
{
  "media_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "analysis_id": "string",
  "quality_score": 78,
  "detected_objects": ["concrete", "workers"],
  "waste_detected": true,
  "safety_issues": ["missing_harness"],
  "recommendations": {}
}
```

#### إحصائيات Dashboard
**GET** `/api/vae/stats/dashboard?site_id=string`

**Response:**
```json
{
  "total_media": 45,
  "average_quality": 78.5,
  "sites_active": 3,
  "tasks_completed": 12,
  "waste_incidents": 2,
  "safety_incidents": 1,
  "daily_progress_percent": 35
}
```

#### Webhook WhatsApp
**POST** `/api/vae/webhook/whatsapp`
- استقبال الصور من WhatsApp
- معالجة تلقائية
- ربط بالموقع والعمل

**GET** `/api/vae/webhook/whatsapp`
- التحقق من الـ webhook (required by WhatsApp)

#### إنشاء التقارير
**GET** `/api/vae/reports/generate?site_id=string&type=daily&date=2024-01-01`

**Response:**
```json
{
  "id": "string",
  "site_id": "string",
  "report_type": "daily",
  "report_date": "2024-01-01",
  "summary": {},
  "statistics": {
    "totalMedia": 45,
    "averageQuality": 78.5,
    "wasteIncidents": 2,
    "safetyIssues": 1
  },
  "media_count": 45,
  "average_quality_score": 78.5,
  "progress_summary": "..."
}
```

### 4. صفحات الواجهة

#### Dashboard
**Route**: `/vae/dashboard`
- عرض الإحصائيات الرئيسية
- آخر الصور المرفوعة
- مشاكل الأمان المكتشفة
- قائمة المشاريع

#### رفع الوسائط
**Route**: `/vae/upload`
- نموذج لرفع الصور والفيديوهات
- إدخال المعلومات الإضافية
- معالجة فوري بـ AI

#### التقارير
**Route**: `/vae/reports`
- إنشاء التقارير اليومية/الأسبوعية/الشهرية
- عرض الإحصائيات
- تحميل التقارير

### 5. مكونات React

#### VAEDashboardContent
عرض البيانات الحقيقية من قاعدة البيانات:
- آخر الصور
- مشاكل الأمان
- متوسط الجودة
- المشاريع النشطة

#### VAEUploadForm
نموذج رفع الوسائط مع:
- اختيار الملف
- إدخال البيانات
- معالجة الرفع

#### VAEReportsClient
إنشاء وتحميل التقارير

## كيفية الاستخدام

### 1. تثبيت قاعدة البيانات
```bash
# تشغيل migration
psql -U postgres -d your_database -f scripts/01-vae-schema.sql
```

### 2. تكوين البيئة
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=verify_token
```

### 3. إنشاء Storage Bucket
```bash
# في Supabase Dashboard
# إنشاء bucket اسمه "vae_media"
```

### 4. تشغيل التطبيق
```bash
pnpm install
pnpm dev
```

### 5. الوصول إلى الواجهات
- Dashboard: `http://localhost:3000/vae/dashboard`
- رفع الصور: `http://localhost:3000/vae/upload`
- التقارير: `http://localhost:3000/vae/reports`

## التكامل مع WhatsApp

### إعداد Webhook
1. اذهب إلى Meta for Developers
2. اختر تطبيقك
3. في Settings > Webhooks
4. أضف URL: `https://your-domain.com/api/vae/webhook/whatsapp`
5. Verify Token: قيمة `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

### استقبال الصور
الصور المرسلة عبر WhatsApp تُعالج تلقائياً:
1. يتم تحميل الصورة من WhatsApp
2. حفظها في Supabase Storage
3. إنشاء سجل الميديا
4. تحليل بـ AI
5. حفظ النتائج

## AI Analysis

### الميزات المطبقة
- كشف الكائنات (concrete, workers, equipment, etc.)
- تقييم جودة الصورة (0-100)
- كشف مشاكل الجودة
- تحديد مؤشرات التقدم
- كشف الهدر والمخلفات
- كشف مشاكل الأمان
- توصيات محسّنة

### النموذج الحالي
استخدام Claude Vision API (يمكن تغييره إلى Google Vision أو TensorFlow)

### التوسعات المستقبلية
- دعم مراقبة فيديو حية
- مقارنات Before/After تلقائية
- تنبيهات فورية للمشاكل
- تتبع الأداء عبر الزمن

## الأداء والتحسينات

### Caching
- استخدام Supabase Query مع Indexes
- Pagination للبيانات الكبيرة

### معالجة غير متزامنة
- رفع الملفات + معالجة AI في خط منفصل
- عدم حجب الـ User Experience

### Storage
- ضغط الصور تلقائياً
- تخزين محلي في Supabase Storage
- CDN للسرعة

## الأمان

### Authentication
- Supabase Auth (مدمج مع النظام الحالي)
- توثيق جميع API calls

### Row Level Security (RLS)
- كل مستخدم يرى فقط بياناته
- المسؤولون لديهم صلاحيات كاملة

### Validation
- التحقق من جميع المدخلات
- منع Upload ملفات خطرة
- توثيق HMAC للـ Webhooks

## الإحصائيات والتقارير

### المقاييس المتابعة
- عدد الصور والفيديوهات
- متوسط جودة الصور
- نسب التقدم
- حوادث الهدر
- مشاكل الأمان
- أوقات المعالجة

### أنواع التقارير
- يومية (Daily)
- أسبوعية (Weekly)
- شهرية (Monthly)

## الملفات الرئيسية

```
├── scripts/
│   └── 01-vae-schema.sql          # Database schema
├── lib/
│   ├── types/
│   │   └── vae.ts                 # TypeScript types
│   └── ...
├── app/
│   ├── api/vae/
│   │   ├── media/upload/          # Upload API
│   │   ├── analyze/process/       # AI Analysis API
│   │   ├── stats/dashboard/       # Stats API
│   │   ├── webhook/whatsapp/      # WhatsApp Webhook
│   │   └── reports/generate/      # Reports API
│   └── vae/
│       ├── dashboard/              # Dashboard page
│       ├── upload/                 # Upload page
│       └── reports/                # Reports page
└── components/vae/
    ├── dashboard-content.tsx       # Dashboard component
    ├── header.tsx                  # Header component
    ├── upload-form.tsx             # Upload form
    └── reports-client.tsx          # Reports component
```

## المتطلبات

- Next.js 16+
- Supabase
- WhatsApp Business Account (اختياري)
- Node.js 18+

## الترخيص

MIT
