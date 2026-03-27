# WhatsApp Hub - لوحة تحكم WhatsApp المتكاملة

منصة احترافية وآمنة وسريعة لإدارة WhatsApp مع دعم كامل للوسائط والرسائل والعمليات الآلية والتحديثات الفعلية.

## ✨ المميزات الرئيسية

- **المصادقة الآمنة 100%**: نظام مصادقة Supabase متقدم مع دعم Google OAuth
- **إدارة الجهات الحقيقية**: إدارة شاملة للعملاء مع تاريخ الرسائل الكامل
- **إدارة الرسائل**: إرسال واستقبال رسائل حقيقية مع دعم الوسائط
- **إدارة الأرقام**: ربط وإدارة أرقام WhatsApp Business
- **سير العمل**: إنشاء عمليات آلية ذكية
- **التحديثات الفعلية**: تحديثات فورية للبيانات مع Supabase Realtime
- **التحليلات**: إحصائيات مفصلة عن الأداء والرسائل
- **الأمان المتقدم**: Row Level Security والتشفير والـ rate limiting
- **الأداء السريع**: Caching متقدم و Pagination
- **السجلات الشاملة**: تسجيل كامل لجميع الأحداث والأخطاء

## 🏗️ البنية المعمارية

```
├── app/
│   ├── api/                    # API routes حقيقية
│   │   ├── stats/
│   │   ├── contacts/
│   │   ├── messages/
│   │   ├── numbers/
│   │   ├── workflows/
│   │   └── ...
│   ├── auth/                   # مسارات المصادقة
│   ├── login/                  # صفحة تسجيل الدخول
│   ├── (dashboard)/            # صفحات لوحة التحكم
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # عميل Supabase الخادم
│   │   ├── client.ts           # عميل Supabase المتصفح
│   │   ├── middleware.ts       # معالجة الجلسة
│   │   ├── query-builder.ts    # بناء الاستعلامات
│   │   └── error-handler.ts    # معالجة الأخطاء
│   ├── auth-helpers.ts         # دوال المصادقة والتفويض
│   ├── validators.ts           # التحقق من البيانات
│   ├── cache.ts                # إدارة الـ cache
│   ├── realtime.ts             # الاشتراكات الفعلية
│   ├── system-logs.ts          # تسجيل الأحداث
│   ├── api-wrapper.ts          # wrapper للـ API مع الأمان
│   ├── rate-limit.ts           # تحديد معدل الطلبات
│   ├── webhook-security.ts     # أمان الويب هوكس
│   └── ...
├── hooks/
│   ├── use-data.ts             # جلب البيانات
│   ├── use-realtime.ts         # تحديثات فعلية حقيقية
│   └── ...
└── components/                  # مكونات React
```

## 🚀 البدء السريع

### المتطلبات

- Node.js 18+
- pnpm (أو npm/yarn)
- حساب Supabase مفعل

### التثبيت والتشغيل

```bash
# 1. استنساخ المشروع
git clone <repo-url>
cd whatsapp-hub

# 2. تثبيت المكتبات
pnpm install

# 3. نسخ ملف البيئة
cp .env.example .env.local

# 4. إضافة Supabase credentials إلى .env.local
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# 5. تشغيل خادم التطوير
pnpm dev

# 6. الوصول إلى المشروع
# افتح المتصفح على: http://localhost:3000
```

## 🔐 الأمان والحماية

### مميزات الأمان المطبقة

1. **المصادقة المتقدمة**
   - Supabase Auth مع JWT tokens آمنة
   - دعم Google OAuth
   - جلسات محمية مع HTTP-only cookies
   - معالجة آمنة للأخطاء بدون تسريب المعلومات

2. **التفويض والصلاحيات**
   - Row Level Security (RLS) على جميع الجداول
   - التحقق من الوصول للمشروع لكل طلب
   - صلاحيات منفصلة لكل عملية
   - منع الوصول غير المصرح

3. **تحديد معدل الطلبات**
   - Rate Limiting لجميع endpoints
   - حماية من هجمات Brute Force
   - تتبع محاولات الدخول الفاشلة
   - إعادة محاولة ذكية

4. **التحقق من الصحة الدقيق**
   - Zod schemas للتحقق من البيانات
   - التحقق من المدخلات على الخادم
   - رسائل خطأ آمنة
   - منع injection attacks

5. **أمان الويب هوكس**
   - توقيع HMAC SHA-256
   - التحقق من التوقيع لكل طلب
   - timing-safe comparison
   - منع replay attacks

6. **التسجيل والمراقبة**
   - تسجيل جميع أحداث الأمان
   - تتبع محاولات الدخول
   - تسجيل الأخطاء مع السياق
   - إنذارات الأنشطة المريبة

## 📊 قاعدة البيانات

### الجداول المستخدمة

- `users` - بيانات المستخدمين
- `projects` - المشاريع (واحد لكل مستخدم)
- `contacts` - جهات الاتصال
- `messages` - الرسائل الفعلية
- `whatsapp_numbers` - أرقام WhatsApp Business
- `workflows` - العمليات الآلية
- `templates` - قوالب الرسائل
- `webhook_endpoints` - نقاط نهاية الويب هوكس
- `system_logs` - سجلات النظام الكاملة

### Row Level Security (RLS)

جميع الجداول محمية بـ RLS:
- كل مستخدم يرى فقط بيانات مشروعه
- العمليات الحساسة محمية بـ service role
- لا يمكن الوصول لبيانات المستخدمين الآخرين

## 🔄 التحديثات الفعلية

استخدم hooks الفعلية للتحديثات الحية الفورية:

```typescript
import { useRealtimeContacts } from "@/hooks/use-realtime"

export function ContactsList({ projectId }) {
  const { contacts, isLoading, mutate } = useRealtimeContacts(projectId)
  
  return (
    <div>
      {contacts.map(contact => (
        <div key={contact.id}>{contact.name}</div>
      ))}
    </div>
  )
}
```

## 📝 API Routes (الحقيقية)

### Contacts (جهات الاتصال)
- `GET /api/contacts` - جلب جهات الاتصال مع pagination
- `POST /api/contacts` - إنشاء جهة اتصال
- `GET /api/contacts/:id` - جهة اتصال معينة

### Messages (الرسائل الحقيقية)
- `GET /api/messages` - جلب الرسائل
- `POST /api/messages` - إرسال رسالة
- `GET /api/messages/:id` - رسالة معينة

### Numbers (الأرقام)
- `GET /api/numbers` - جلب الأرقام المتصلة
- `POST /api/numbers` - إضافة رقم

### Stats (الإحصائيات)
- `GET /api/stats` - إحصائيات المشروع

### Workflows (سير العمل)
- `GET /api/workflows` - جلب سير العمل
- `POST /api/workflows` - إنشاء سير عمل

## ⚡ الأداء والتحسينات

### Caching الذكي
```typescript
import { invalidateCache, CACHE_TAGS } from "@/lib/cache"

// إبطال الـ cache عند التحديث
await invalidateCache(CACHE_TAGS.CONTACTS_BY_PROJECT(projectId))
```

### Pagination فعالة
```typescript
const { data, count, totalPages } = await paginatedFetch(
  "contacts",
  1, // page
  20, // limit
  { project_id: projectId }
)
```

### Batch Fetch للأداء
```typescript
const contacts = await batchFetch("contacts", ids, { project_id })
```

## 🧪 الاختبار

```bash
# تشغيل جميع الاختبارات
pnpm test

# اختبارات محددة
pnpm test basic-auth
pnpm test webhook-security
pnpm test logger
```

## 📚 التوثيق

### Validation مع Zod

```typescript
import { validateData, contactSchema } from "@/lib/validators"

const contact = validateData(req.body, contactSchema)
// سيرمي ValidationError إذا كانت البيانات غير صحيحة
```

### Logging الشامل

```typescript
import { logSystemEvent, logAuthEvent, logApiError } from "@/lib/system-logs"

// تسجيل حدث أمان
await logAuthEvent(userId, projectId, "login", true)

// تسجيل خطأ API
await logApiError(projectId, userId, "/api/messages", 500, "Database error")
```

### معالجة الأخطاء الآمنة

```typescript
import { withApiWrapper } from "@/lib/api-wrapper"

export const GET = withApiWrapper(
  async (req) => {
    // كودك هنا - المصادقة والأمان تعاملت تلقائياً
    return NextResponse.json({ data: "success" })
  },
  { requireAuth: true, rateLimit: { windowMs: 60000, max: 30 } }
)
```

## 🚀 النشر على Vercel

```bash
# 1. ربط المشروع
vercel link

# 2. إضافة متغيرات البيئة
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 3. النشر
vercel deploy --prod
```

## 📊 مراقبة النظام

### عرض السجلات
```typescript
import { getSystemLogs } from "@/lib/system-logs"

const logs = await getSystemLogs(projectId, { 
  category: "security",
  limit: 100 
})
```

### المقاييس المتاحة
- عدد الرسائل المرسلة/المستقبلة
- عدد جهات الاتصال النشطة
- معدل نجاح العمليات
- أخطاء النظام والتحذيرات

## 🐛 استكشاف الأخطاء

### المشاكل الشائعة

**1. خطأ في الاتصال بـ Supabase**
- تحقق من `.env.local` يحتوي على credentials صحيح
- تأكد من تفعيل Supabase
- تحقق من URL و keys

**2. مشاكل في المصادقة**
- امسح ملفات تعريف الارتباط: `Cmd+Shift+Delete`
- حاول تسجيل الخروج والدخول مجدداً
- تحقق من RLS policies

**3. بطء التطبيق**
- افحص Network tab في DevTools
- تحقق من Realtime subscriptions
- استخدم React DevTools للتحقق من rerenders

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

---

**ملاحظة**: هذا المشروع تم تنظيفه وتحسينه ليكون:
✓ نظيف وقابل للصيانة
✓ سريع الأداء مع caching و pagination
✓ آمن 100% مع RLS و rate limiting
✓ تحديثات فعلية حقيقية مع Supabase
✓ جميع الوظائف تعمل بشكل حقيقي، ليس وهمي

