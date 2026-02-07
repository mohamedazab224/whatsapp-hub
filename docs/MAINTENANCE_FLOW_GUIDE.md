# نظام طلبات الصيانة عبر WhatsApp Flow

## نظرة عامة

نظام متكامل لاستقبال ومعالجة طلبات الصيانة من العملاء عبر WhatsApp Flows، مع ربط تلقائي بين الطلبات والعملاء باستخدام رقم الهاتف.

---

## البنية الأساسية

### الجداول

#### 1. `customers`
تخزين بيانات العملاء (مصدر الحقيقة الوحيد).

**الأعمدة:**
- `id` (UUID) - معرف فريد
- `project_id` (UUID) - ربط بالمشروع
- `phone` (TEXT) - رقم الهاتف (UNIQUE per project)
- `name` (TEXT) - اسم العميل
- `email` (TEXT) - البريد الإلكتروني
- `address` (TEXT) - العنوان
- `city` (TEXT) - المدينة
- `notes` (TEXT) - ملاحظات
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**قيد فريد:** `UNIQUE(project_id, phone)`

#### 2. `maintenance_requests`
تخزين طلبات الصيانة.

**الأعمدة:**
- `id` (UUID) - معرف الطلب
- `project_id` (UUID) - المشروع
- `customer_id` (UUID) - ربط بالعميل (FK)
- `service_type` (TEXT) - نوع الخدمة
- `description` (TEXT) - وصف المشكلة
- `address` (TEXT) - عنوان التنفيذ
- `preferred_date` (DATE) - التاريخ المفضل
- `preferred_time` (TEXT) - الوقت المفضل
- `notes` (TEXT) - ملاحظات
- `photos` (JSONB) - صور المشكلة
- `status` (TEXT) - الحالة
- `technician_id` (UUID) - الفني المعين
- `assigned_at` (TIMESTAMP)
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)
- `cancelled_at` (TIMESTAMP)
- `cancellation_reason` (TEXT)

**الحالات المتاحة:**
- `pending` - قيد الانتظار
- `confirmed` - مؤكد
- `in_progress` - قيد التنفيذ
- `completed` - مكتمل
- `cancelled` - ملغي

---

## سير العمل (Workflow)

### 1. استقبال Webhook

```
WhatsApp → POST /api/webhook
├─ Verify signature
├─ Check rate limit
├─ Parse payload
└─ Detect Flow response
```

### 2. معالجة Flow

```typescript
// lib/flow-processor.ts
processMaintenanceFlow(payload, projectId)
├─ Extract phone from contacts[0].wa_id or messages[0].from
├─ Parse Flow data from nfm_reply.response_json
├─ Validate required fields
├─ Find or create customer
│   ├─ Search by (project_id, phone)
│   └─ Create if not exists
├─ Create maintenance_request
│   ├─ Link to customer_id
│   └─ Link to project_id
└─ Send confirmation template
```

### 3. بيانات Flow المستخرجة

```json
{
  "service_type": "plumbing",
  "description": "تسريب في الحنفية",
  "address": "شارع الملك فهد، الرياض",
  "preferred_date": "2024-12-25",
  "preferred_time": "morning",
  "notes": "يرجى الاتصال قبل الوصول"
}
```

---

## تعريف Flow على Meta

### الخطوات:

1. **إنشاء Flow في Meta Business Manager:**
   - اذهب إلى WhatsApp Manager
   - Flows → Create New Flow
   - استخدم الملف: `/flows/maintenance_request_form.json`

2. **رفع JSON:**
```bash
curl -X POST \
  "https://graph.facebook.com/v21.0/{FLOW_ID}" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -F "file=@maintenance_request_form.json"
```

3. **تفعيل Flow:**
```bash
curl -X POST \
  "https://graph.facebook.com/v21.0/{FLOW_ID}/publish" \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

---

## الاستخدام

### إرسال Flow للعميل

```typescript
const response = await fetch(
  `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: customerPhone,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: 'طلب صيانة جديد'
        },
        body: {
          text: 'يرجى ملء النموذج لإرسال طلب الصيانة'
        },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: 'UNIQUE_TOKEN',
            flow_id: 'YOUR_FLOW_ID',
            flow_cta: 'ابدأ',
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'SERVICE_TYPE'
            }
          }
        }
      }
    })
  }
)
```

---

## القواعد الإلزامية

### ✅ افعل:
- استخرج رقم الهاتف من Webhook
- ابحث عن العميل باستخدام `(project_id, phone)`
- أنشئ عميل جديد إذا لم يوجد
- اربط الطلب بـ `customer_id` دائماً
- تحقق من `service_type` و `description` (required)

### ❌ لا تفعل:
- لا تطلب رقم الهاتف من العميل في Flow
- لا تخزن الهاتف في جدول الطلبات
- لا تنشئ طلب بدون `customer_id`
- لا تستخدم email كمعرّف رئيسي
- لا تكرر البيانات

---

## قوالب التأكيد

### order_created (معتمد من Meta)

```
مرحباً! 🎉

تم استلام طلبك بنجاح
رقم الطلب: {{1}}

سنتواصل معك قريباً لتأكيد الموعد.

شكراً لثقتك بنا! 💚
```

---

## استعلامات SQL مفيدة

### عرض طلبات العميل
```sql
SELECT 
  mr.*,
  c.name AS customer_name,
  c.phone AS customer_phone
FROM maintenance_requests mr
JOIN customers c ON mr.customer_id = c.id
WHERE c.phone = '+966501234567'
ORDER BY mr.created_at DESC;
```

### إحصائيات الطلبات
```sql
SELECT 
  status,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_7_days
FROM maintenance_requests
GROUP BY status;
```

---

## الاختبار

### 1. Sandbox Mode (التطوير)
```bash
# استخدم رقم الاختبار الخاص بك
POST /api/webhook
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "contacts": [{"wa_id": "201099884670"}],
        "messages": [{
          "from": "201099884670",
          "type": "interactive",
          "interactive": {
            "type": "nfm_reply",
            "nfm_reply": {
              "name": "maintenance_request_form",
              "response_json": "{\"service_type\":\"plumbing\",\"description\":\"test\"}"
            }
          }
        }]
      }
    }]
  }]
}
```

### 2. Production Mode (الإنتاج)
- تأكد من اعتماد Flow من Meta
- استخدم webhook URL حقيقي
- راقب logs عبر `/logs`

---

## الأمان

### Webhook Verification
- ✅ التحقق من توقيع `x-hub-signature-256`
- ✅ Rate limiting (120 req/min)
- ✅ RLS policies على الجداول

### معالجة الأخطاء
```typescript
try {
  await processMaintenanceFlow(payload, projectId)
} catch (error) {
  // Log error but don't expose details to webhook sender
  logger.error('[Flow] Processing failed', { error })
  // Return 200 to avoid retries
  return { status: 'ok' }
}
```

---

## الدعم

**ملفات مهمة:**
- `/lib/flow-processor.ts` - معالج Flow الرئيسي
- `/scripts/14-create-maintenance-system.sql` - إنشاء الجداول
- `/flows/maintenance_request_form.json` - تعريف Flow
- `/app/api/flows/maintenance/route.ts` - API endpoint

**Logs:**
- البحث عن `[Flow]` في system_logs
- مراقبة webhook_events

---

النظام جاهز للاستخدام الفعلي! 🚀
