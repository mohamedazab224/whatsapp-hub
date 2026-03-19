# Backend Development - تعليمات للفريق التطويري

## 📋 ملخص التطوير المكتمل

تم تطوير البنية الأساسية الموثوقة للـ Backend. الآن جاهز لـ:
- معالجة آلاف الرسائل في نفس الوقت
- استجابات سريعة وآمنة
- نظام logging مركزي
- حماية من الهجمات

---

## 🎯 ما تم إنجازه

### ✅ المرحلة 1: Foundation (3 ملفات جديدة)
1. **Logger مركزي** - نظام logging موحد لجميع الـ APIs
2. **Rate Limiter** - حماية من DDoS والـ Brute Force
3. **Input Validators** - التحقق من صحة البيانات
4. **Response Builder** - استجابات موحدة ومنسقة
5. **Webhook Queue** - معالجة الـ Webhooks بدون Timeout

### ✅ المرحلة 2: API Refactoring (3 APIs محدثة)
1. **Webhook Handler** - الآن آمن وسريع وموثوق
2. **Contacts API** - نمط موحد مع validation
3. **Messages API** - نمط موحد مع workspace management

---

## 🚀 الخطوات التالية (Priority)

### المرحلة 3: تحديث بقية الـ APIs (2-3 أيام)

#### Priority 1 - حرج (يجب إنجازها اليوم)
```
app/api/whatsapp/numbers/route.ts      - إدارة أرقام WhatsApp
app/api/workflows/route.ts             - إدارة Workflows/Automations
app/api/messages/send/route.ts         - إرسال الرسائل
```

#### Priority 2 - عادي (خلال يومين)
```
app/api/templates/route.ts             - إدارة Templates
app/api/broadcasts/route.ts            - الرسائل الجماعية
app/api/conversations/route.ts         - المحادثات
```

#### Priority 3 - منخفض (خلال 3 أيام)
```
app/api/analytics/route.ts             - الإحصائيات
app/api/settings/*.ts                  - الإعدادات
app/api/media/route.ts                 - إدارة الوسائط
```

---

## 📖 كيفية تطوير API جديدة

### الخطوة 1: استخدم Template الموحد

انسخ هذا الـ Template لكل API جديدة:

```typescript
import { NextRequest } from 'next/server'
import { createLogger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/ratelimit'
import { validators, ValidationError } from '@/lib/validators'
import { ResponseBuilder } from '@/lib/response/builder'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const logger = createLogger('API:FeatureName')

// Helper function
async function getWorkspace(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Workspace not found')
  return data.id
}

// GET Handler
export async function GET(request: NextRequest) {
  try {
    // 1. Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`api:${ip}`, 100, 60000)) {
      return ResponseBuilder.rateLimitExceeded()
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')))

    logger.info('Fetching data', { page, limit })

    // 3. Auth check
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return ResponseBuilder.unauthorized()

    // 4. Workspace check
    const workspaceId = await getWorkspace(supabase, user.id)

    // 5. Fetch data
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count: total, error } = await supabase
      .from('table_name')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .range(from, to)

    if (error) throw error

    logger.info('Success', { count: data?.length, total })
    return ResponseBuilder.paginated(data || [], total || 0, page, limit)
  } catch (error) {
    logger.error('Failed', error)
    if (error instanceof ValidationError) return ResponseBuilder.badRequest(error.message)
    return ResponseBuilder.internalError()
  }
}

// POST Handler
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`api:${ip}:create`, 50, 60000)) {
      return ResponseBuilder.rateLimitExceeded()
    }

    // 2. Parse & validate
    const body = await request.json()
    validators.required(body.name, 'name')
    validators.string(body.name, 'name', 1, 255)

    logger.info('Creating resource', { name: body.name })

    // 3. Auth check
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return ResponseBuilder.unauthorized()

    // 4. Workspace check
    const workspaceId = await getWorkspace(supabase, user.id)

    // 5. Create
    const { data, error } = await supabase
      .from('table_name')
      .insert({
        workspace_id: workspaceId,
        name: body.name,
        // ... other fields
      })
      .select()
      .single()

    if (error) throw error

    logger.info('Created', { id: data.id })
    return ResponseBuilder.created(data)
  } catch (error) {
    logger.error('Failed to create', error)
    if (error instanceof ValidationError) return ResponseBuilder.badRequest(error.message)
    return ResponseBuilder.internalError()
  }
}
```

### الخطوة 2: أضف الـ Validators المطلوبة

```typescript
// للبيانات المختلفة
validators.email(body.email)                    // تحقق من البريد
validators.phoneNumber(body.phone)              // تحقق من الهاتف
validators.uuid(body.id, 'id')                 // تحقق من UUID
validators.string(body.name, 'name', 1, 255)  // تحقق من النص
validators.number(body.count, 'count', 0, 100) // تحقق من الرقم
validators.boolean(body.active, 'active')      // تحقق من Boolean
validators.enum(body.type, 'type', ['a', 'b']) // تحقق من Enum
validators.url(body.url, 'url')                 // تحقق من URL
```

### الخطوة 3: استخدم Response Builder

```typescript
// للاستجابات الناجحة
ResponseBuilder.success(data)              // 200 OK
ResponseBuilder.created(data)              // 201 Created
ResponseBuilder.paginated(data, t, p, l)  // 200 مع pagination

// للأخطاء
ResponseBuilder.badRequest('Invalid')      // 400
ResponseBuilder.unauthorized()             // 401
ResponseBuilder.forbidden()                // 403
ResponseBuilder.notFound()                 // 404
ResponseBuilder.conflict('Already exists') // 409
ResponseBuilder.internalError()            // 500
ResponseBuilder.rateLimitExceeded()        // 429
```

---

## 🧪 اختبار كل API

```bash
# اختبر الـ GET
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/feature-name

# اختبر الـ POST
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}' \
  http://localhost:3000/api/feature-name

# اختبر Rate Limiting (يجب أن يفشل الطلب الـ 101)
for i in {1..101}; do curl -s http://localhost:3000/api/feature-name; done
```

---

## 📊 الهيكل الجديد للـ Project

```
lib/
├── logger/              ✅ Logger مركزي
├── ratelimit/           ✅ Rate Limiting
├── validators/          ✅ Input Validators
├── response/            ✅ Response Builder
├── queue/               ✅ Webhook Queue
└── supabase/
    ├── server.ts        ✅ Server Client
    └── admin.ts         ✅ Admin Client

app/api/
├── vae/webhook/whatsapp/route.ts   ✅ محدث
├── contacts/route.ts               ✅ محدث
├── messages/route.ts               ✅ محدث
├── whatsapp/numbers/route.ts       ⏳ قريباً
├── workflows/route.ts              ⏳ قريباً
├── templates/route.ts              ⏳ قريباً
├── broadcasts/route.ts             ⏳ قريباً
├── conversations/route.ts          ⏳ قريباً
└── analytics/route.ts              ⏳ قريباً
```

---

## 💡 نصائح مهمة

### ✅ افعل
- ✅ استخدم `workspace_id` وليس `project_id` أو `user_id`
- ✅ افحص الـ Workspace قبل أي عملية
- ✅ استخدم Logger المركزي لـ logging
- ✅ استخدم Validators للـ Input
- ✅ استخدم Response Builder للاستجابات
- ✅ أضف Rate Limiting لكل API
- ✅ افحص Auth قبل الوصول للبيانات

### ❌ لا تفعل
- ❌ لا تمرر Error objects للـ Client مباشرة
- ❌ لا تستخدم `user.id` كـ project identifier
- ❌ لا تستخدم NextResponse.json() مباشرة
- ❌ لا تنسى Rate Limiting
- ❌ لا تنسى Workspace check
- ❌ لا تترك console.log() في الـ Production Code
- ❌ لا تخزن secrets في الـ Code

---

## 📞 أسئلة شائعة

### س: كيف أعرف إذا كانت الـ API صحيحة؟
ج: افحص:
- [ ] تم استخدام Response Builder
- [ ] تم استخدام Logger
- [ ] تم استخدام Rate Limiting
- [ ] تم استخدام Validators
- [ ] تم افحص Auth
- [ ] تم افحص Workspace
- [ ] الاختبارات تعمل

### س: ماذا لو حدث خطأ في قاعدة البيانات؟
ج: يتم في Logger:
```typescript
logger.error('Database error', error)  // يتم تسجيل الخطأ
return ResponseBuilder.internalError() // يتم إرجاع 500
```

### س: كيف أتعامل مع Pagination الكبيرة؟
ج: استخدم limit صغير وصحيح:
```typescript
const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
// الحد الأقصى 100 عنصر
```

---

## 🎓 مراجع سريعة

- **Logger**: `createLogger('API:Name')`
- **Rate Limit**: `checkRateLimit(key, max, windowMs)`
- **Validators**: `validators.email()`, `validators.phoneNumber()`, إلخ
- **Response**: `ResponseBuilder.success()`, `.created()`, `.paginated()`, etc.
- **Queue**: `webhookQueue.enqueue(payload)`

---

## ✉️ دعم الفريق

إذا واجهت مشاكل:
1. افحص الـ Logger والـ Logs
2. اقرأ BACKEND_DEVELOPMENT_COMPLETE_AR.md
3. اتبع الـ Template الموحد
4. اختبر مع الـ test script

**استمتع بالتطوير! 🚀**
