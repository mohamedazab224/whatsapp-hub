# Backend Development - مستند التطوير المكتمل

## ✅ المرحلة 1: Foundation - تم إكمالها

### 1.1 المكتبات الأساسية الجديدة

#### ✅ Logger المركزي (`lib/logger/index.ts`)
- نظام logging موحد لجميع APIs
- دعم INFO, ERROR, WARN, DEBUG
- مخرجات JSON منسقة للـ Monitoring
- استخدام:
```typescript
import { createLogger } from '@/lib/logger'
const logger = createLogger('API:Contacts')
logger.info('Operation successful', { data })
```

#### ✅ Rate Limiting (`lib/ratelimit/index.ts`)
- حماية من DDoS والـ Brute Force
- نافذة زمنية متغيرة
- تنظيف تلقائي للـ Entries القديمة
- استخدام:
```typescript
if (!checkRateLimit(`api:${ip}`, 100, 60000)) {
  return ResponseBuilder.rateLimitExceeded()
}
```

#### ✅ Input Validators (`lib/validators/index.ts`)
- التحقق من البيانات المدخلة
- دعم: email, phone, uuid, string, number, boolean, enum, url
- رسائل خطأ واضحة
- استخدام:
```typescript
validators.email(body.email)
validators.phoneNumber(body.phone)
validators.string(body.name, 'name', 1, 255)
```

#### ✅ Response Builder (`lib/response/builder.ts`)
- استجابات موحدة لجميع الـ APIs
- دعم success, error, paginated responses
- Response codes صحيحة
- استخدام:
```typescript
ResponseBuilder.success(data)
ResponseBuilder.badRequest('Invalid input')
ResponseBuilder.paginated(data, total, page, limit)
```

#### ✅ Webhook Queue (`lib/queue/webhook-processor.ts`)
- معالجة الـ Webhooks بدون Timeout
- Retry logic مع exponential backoff
- Queue management آمن
- استخدام:
```typescript
const jobId = await webhookQueue.enqueue(payload)
```

---

## ✅ المرحلة 2: API Refactoring - تم إكمالها

### 2.1 APIs المُحدثة

#### ✅ Webhook Handler (`app/api/vae/webhook/whatsapp/route.ts`)
- ✅ Rate limiting
- ✅ Signature verification (HMAC-SHA256)
- ✅ Queue-based processing
- ✅ Centralized logging
- ✅ دعم GET و POST

#### ✅ Contacts API (`app/api/contacts/route.ts`)
- ✅ GET: جلب جهات الاتصال مع pagination و search
- ✅ POST: إنشاء جهة اتصال جديدة
- ✅ Input validation شامل
- ✅ Rate limiting
- ✅ Response موحد

#### ✅ Messages API (`app/api/messages/route.ts`)
- ✅ GET: جلب الرسائل مع pagination
- ✅ POST: إرسال رسالة جديدة
- ✅ Workspace management صحيح
- ✅ Input validation
- ✅ Error handling موحد

---

## 📋 الخطوات التالية المستعجلة

### المرحلة 3: تحديث بقية الـ APIs (يوم 1-2)

يجب تحديث هذه الـ APIs على نفس الطريقة:

```
❌ /api/whatsapp/numbers/route.ts
❌ /api/workflows/route.ts
❌ /api/templates/route.ts
❌ /api/broadcasts/route.ts
❌ /api/conversations/route.ts
❌ /api/analytics/route.ts
❌ /api/settings/*
❌ /api/project/route.ts
```

### Template للـ API الموحد

```typescript
import { NextRequest } from 'next/server'
import { createLogger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/ratelimit'
import { validators, ValidationError } from '@/lib/validators'
import { ResponseBuilder } from '@/lib/response/builder'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const logger = createLogger('API:FeatureName')

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`api:${ip}`, 100, 60000)) {
      return ResponseBuilder.rateLimitExceeded()
    }

    // 2. Parse & validate
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')))

    // 3. Auth
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return ResponseBuilder.unauthorized()

    // 4. Get workspace
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (!workspace) return ResponseBuilder.notFound('Workspace not found')

    // 5. Fetch data
    const { data, count: total, error } = await supabase
      .from('table_name')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspace.id)
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    logger.info('Success', { count: data?.length })
    return ResponseBuilder.paginated(data || [], total || 0, page, limit)
  } catch (error) {
    logger.error('Failed', error)
    if (error instanceof ValidationError) return ResponseBuilder.badRequest(error.message)
    return ResponseBuilder.internalError()
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`api:${ip}:create`, 50, 60000)) {
      return ResponseBuilder.rateLimitExceeded()
    }

    // 2. Parse & validate body
    const body = await request.json()
    validators.required(body.name, 'name')

    // 3. Auth
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return ResponseBuilder.unauthorized()

    // 4. Get workspace
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (!workspace) return ResponseBuilder.notFound('Workspace not found')

    // 5. Create
    const { data, error } = await supabase
      .from('table_name')
      .insert({ workspace_id: workspace.id, ...body })
      .select()
      .single()

    if (error) throw error

    logger.info('Created', { id: data?.id })
    return ResponseBuilder.created(data)
  } catch (error) {
    logger.error('Failed to create', error)
    if (error instanceof ValidationError) return ResponseBuilder.badRequest(error.message)
    return ResponseBuilder.internalError()
  }
}
```

---

## 🔍 Checklist التحقق من الـ APIs

عند تحديث كل API، تحقق من:

- [ ] Rate limiting مطبق
- [ ] Auth check موجود
- [ ] Workspace check موجود
- [ ] Input validation شامل
- [ ] Logger مطبق
- [ ] Response Builder مستخدم
- [ ] Pagination صحيحة (للـ GET)
- [ ] Error handling كامل
- [ ] Docstring/Comments موجود

---

## 🧪 اختبار الـ APIs

### اختبار Rate Limiting
```bash
# اختبر بـ 101 طلب خلال دقيقة - يجب أن يفشل الطلب 101
for i in {1..101}; do curl http://localhost:3000/api/contacts; done
```

### اختبار Validation
```bash
# اختبر بدون email
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'
# يجب أن يرد: 400 Bad Request
```

### اختبر Webhook Verification
```bash
curl "http://localhost:3000/api/vae/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE"
```

---

## 📊 الحالة الحالية

| العنصر | الحالة | الملاحظات |
|--------|--------|---------|
| Logger | ✅ | جاهز للاستخدام |
| Rate Limiting | ✅ | جاهز للاستخدام |
| Validators | ✅ | جاهز للاستخدام |
| Response Builder | ✅ | جاهز للاستخدام |
| Webhook Queue | ✅ | جاهز للاستخدام |
| Webhook Handler | ✅ | محدّث وآمن |
| Contacts API | ✅ | محدّث |
| Messages API | ✅ | محدّث |
| باقي الـ APIs | ❌ | تحتاج تحديث |

---

## 🎯 الأولويات للـ APIs المتبقية

1. **WhatsApp Numbers API** - حرج
2. **Workflows API** - حرج
3. **Templates API** - عادي
4. **Broadcasts API** - عادي
5. **Analytics API** - عادي

---

## 📝 ملاحظات التطوير

1. استخدم دائماً `workspace_id` وليس `project_id`
2. تحقق من الـ Workspace قبل أي عملية
3. استخدم الـ Logger المركزي لكل الـ Errors
4. لا تمرر Error objects مباشرة للـ Client
5. استخدم Response Builder لجميع الاستجابات
6. اختبر Rate Limiting لكل API جديدة
