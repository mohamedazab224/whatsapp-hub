# دليل البدء السريع - نظام طلبات الصيانة

## ✅ ما تم إنجازه

تم إنشاء نظام كامل لاستقبال طلبات الصيانة عبر WhatsApp Flow بالمتطلبات التالية:

### 1. قاعدة البيانات ✅
- ✅ جدول `customers` (تخزين بيانات العملاء)
- ✅ جدول `maintenance_requests` (تخزين الطلبات)
- ✅ علاقة `customer_id` (Foreign Key)
- ✅ قيد UNIQUE على `(project_id, phone)`
- ✅ RLS policies آمنة

### 2. معالج Flow ✅
- ✅ استخراج رقم الهاتف من Webhook
- ✅ البحث/إنشاء عميل تلقائياً
- ✅ إنشاء طلب صيانة مرتبط
- ✅ إرسال template تأكيد

### 3. تكامل Webhook ✅
- ✅ كشف Flow responses تلقائياً
- ✅ معالجة في workflow-engine
- ✅ دعم multi-project

### 4. تعريف Flow ✅
- ✅ JSON definition جاهز للرفع
- ✅ 3 شاشات (نوع الخدمة، التفاصيل، الموعد)
- ✅ دعم اللغة العربية

---

## 🚀 خطوات التشغيل

### الخطوة 1: رفع Flow إلى Meta

```bash
# 1. رفع JSON
curl -X POST \
  "https://graph.facebook.com/v21.0/{WABA_ID}/flows" \
  -H "Authorization: Bearer ${WHATSAPP_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "maintenance_request_form",
    "categories": ["OTHER"]
  }'

# سيعطيك FLOW_ID

# 2. رفع محتوى Flow
curl -X POST \
  "https://graph.facebook.com/v21.0/{FLOW_ID}/assets" \
  -H "Authorization: Bearer ${WHATSAPP_ACCESS_TOKEN}" \
  -F "file=@flows/maintenance_request_form.json" \
  -F "name=flow.json"

# 3. نشر Flow
curl -X POST \
  "https://graph.facebook.com/v21.0/{FLOW_ID}/publish" \
  -H "Authorization: Bearer ${WHATSAPP_ACCESS_TOKEN}"
```

### الخطوة 2: إرسال Flow لعميل

```typescript
// في التطبيق أو عبر API
const response = await fetch(
  `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: '966501234567',
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: 'طلب صيانة جديد'
        },
        body: {
          text: 'يرجى ملء النموذج التالي لإرسال طلب الصيانة'
        },
        footer: {
          text: 'شركة الصيانة'
        },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: crypto.randomUUID(),
            flow_id: 'YOUR_FLOW_ID',
            flow_cta: 'ابدأ الطلب',
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

### الخطوة 3: التحقق من الاستقبال

```sql
-- 1. تحقق من إنشاء العميل
SELECT * FROM customers 
WHERE phone = '966501234567'
ORDER BY created_at DESC;

-- 2. تحقق من الطلب
SELECT 
  mr.id,
  mr.service_type,
  mr.description,
  mr.status,
  c.name AS customer_name,
  c.phone AS customer_phone
FROM maintenance_requests mr
JOIN customers c ON mr.customer_id = c.id
ORDER BY mr.created_at DESC
LIMIT 10;
```

---

## 📝 مثال عملي كامل

### السيناريو:
عميل يريد إصلاح تسريب مياه

### 1. العميل يستلم رسالة Flow
```
📱 WhatsApp
┌─────────────────────────┐
│ طلب صيانة جديد          │
│                         │
│ يرجى ملء النموذج التالي │
│ لإرسال طلب الصيانة      │
│                         │
│ [ ابدأ الطلب ]          │
└─────────────────────────┘
```

### 2. العميل يملأ البيانات
```json
{
  "service_type": "plumbing",
  "description": "تسريب مياه في الحنفية",
  "address": "شارع الملك فهد، الرياض",
  "preferred_date": "2024-12-25",
  "preferred_time": "morning",
  "notes": "يرجى الاتصال قبل الوصول"
}
```

### 3. النظام يعالج تلقائياً

```typescript
// 1. استخراج رقم الهاتف
phone = "966501234567"

// 2. البحث عن العميل
customer = await supabase
  .from('customers')
  .select('id')
  .eq('project_id', projectId)
  .eq('phone', phone)
  .single()

// إذا لم يوجد → إنشاء
if (!customer) {
  customer = await supabase
    .from('customers')
    .insert({ project_id, phone, name: '966501234567' })
    .select('id')
    .single()
}

// 3. إنشاء الطلب
await supabase
  .from('maintenance_requests')
  .insert({
    project_id: projectId,
    customer_id: customer.id,
    service_type: 'plumbing',
    description: 'تسريب مياه في الحنفية',
    address: 'شارع الملك فهد، الرياض',
    preferred_date: '2024-12-25',
    preferred_time: 'morning',
    notes: 'يرجى الاتصال قبل الوصول',
    status: 'pending'
  })

// 4. إرسال تأكيد
await sendTemplate('order_created', phone, [requestId])
```

### 4. العميل يستلم تأكيد
```
مرحباً! 🎉

تم استلام طلبك بنجاح
رقم الطلب: A1B2C3D4

سنتواصل معك قريباً لتأكيد الموعد.

شكراً لثقتك بنا! 💚
```

---

## 🔍 استعلامات مفيدة

### إحصائيات يومية
```sql
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed
FROM maintenance_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### أفضل العملاء
```sql
SELECT 
  c.name,
  c.phone,
  COUNT(mr.id) AS total_requests,
  MAX(mr.created_at) AS last_request
FROM customers c
JOIN maintenance_requests mr ON c.id = mr.customer_id
GROUP BY c.id
ORDER BY total_requests DESC
LIMIT 10;
```

### أنواع الخدمات الأكثر طلباً
```sql
SELECT 
  service_type,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM maintenance_requests
GROUP BY service_type
ORDER BY count DESC;
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يتم إنشاء الطلب

```sql
-- 1. تحقق من logs
SELECT * FROM system_logs 
WHERE message LIKE '%Flow%' 
ORDER BY created_at DESC 
LIMIT 20;

-- 2. تحقق من webhook events
SELECT * FROM webhook_events 
ORDER BY created_at DESC 
LIMIT 10;
```

### المشكلة: تكرار العملاء

```sql
-- عرض التكرارات
SELECT phone, COUNT(*) 
FROM customers 
GROUP BY phone 
HAVING COUNT(*) > 1;

-- حذف التكرارات (احتفظ بالأقدم)
DELETE FROM customers 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM customers 
  GROUP BY project_id, phone
);
```

---

## 📚 ملفات مهمة

| الملف | الوصف |
|------|-------|
| `/lib/flow-processor.ts` | معالج Flow الرئيسي |
| `/lib/workflow-engine.ts` | تكامل مع Webhook |
| `/scripts/14-create-maintenance-system.sql` | إنشاء الجداول |
| `/flows/maintenance_request_form.json` | تعريف Flow |
| `/app/api/flows/maintenance/route.ts` | API endpoint مباشر |
| `/docs/MAINTENANCE_FLOW_GUIDE.md` | التوثيق الكامل |

---

## ✨ الميزات

- ✅ **لا حاجة لإدخال رقم الهاتف** - يُستخرج تلقائياً
- ✅ **بيانات نظيفة** - لا تكرار للعملاء
- ✅ **علاقات صحيحة** - customer_id FK
- ✅ **آمن** - RLS policies محكمة
- ✅ **قابل للتوسع** - multi-project support
- ✅ **Production ready** - معالجة أخطاء كاملة

---

النظام جاهز تماماً! فقط قم برفع Flow إلى Meta والبدء 🚀
