# خطة تطوير الـ Backend الشاملة - WhatsApp Hub SaaS

## الحالة الحالية للـ Backend

### ✅ ما يعمل:
- 50+ API endpoint
- نظام مصادقة مع Supabase
- قاعدة بيانات SQL
- Webhook receiver للرسائل الواردة
- نظام Notifications SSE

### ❌ المشاكل الرئيسية:
1. **لا توجد معالجة Queue** - الـ Webhooks تعالج فوراً وقد تتجاوز الـ Timeout
2. **استخدام غير صحيح للـ Project ID** - الأكواد تستخدم user.id بدلاً من project_id
3. **عدم التحقق من الصلاحيات** - لا يوجد Row Level Security كافي
4. **معالجة أخطاء ضعيفة** - الـ Error responses غير متسقة
5. **لا توجد Rate Limiting** - عرضة للـ DDoS
6. **Logging غير مركزي** - لا يوجد نظام logging موحد
7. **عدم التحقق من البيانات** - Input validation ضعيف

---

## خطة الإصلاح (3 أيام عمل)

### اليوم 1: Foundation (الأساس)
**المهام:**
1. إنشاء مركزي Supabase Client (واحد فقط)
2. بناء نظام Rate Limiting موحد
3. بناء نظام Logging مركزي
4. إصلاح جميع APIs لاستخدام project_id بشكل صحيح

### اليوم 2: Queue & Processing
**المهام:**
1. بناء Webhook Queue System
2. بناء Background Job Processor
3. إنشاء Webhook Processing Pipeline
4. تحسين معالجة الرسائل

### اليوم 3: Security & Validation
**المهام:**
1. بناء Input Validation Layer
2. بناء نظام الصلاحيات (Role-Based Access Control)
3. إضافة Row Level Security
4. اختبار شامل

---

## المرحلة 1: Foundation (الأساس)

### 1.1 إنشاء Centralized Logger

\`\`\`typescript
// lib/logger/index.ts
export class Logger {
  private context: string
  private isDev = process.env.NODE_ENV === 'development'

  constructor(context: string) {
    this.context = context
  }

  private format(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(data && { data }),
    }
    return logEntry
  }

  info(message: string, data?: any) {
    const log = this.format('INFO', message, data)
    console.log(JSON.stringify(log))
  }

  error(message: string, error?: any) {
    const log = this.format('ERROR', message, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    })
    console.error(JSON.stringify(log))
  }

  warn(message: string, data?: any) {
    const log = this.format('WARN', message, data)
    console.warn(JSON.stringify(log))
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      const log = this.format('DEBUG', message, data)
      console.debug(JSON.stringify(log))
    }
  }
}

export const createLogger = (context: string) => new Logger(context)
\`\`\`

### 1.2 إنشاء Centralized Supabase Client

\`\`\`typescript
// lib/supabase/unified.ts
import { createClient } from '@supabase/supabase-js'
import { createLogger } from '../logger'

const logger = createLogger('Supabase')

class SupabaseManager {
  private static instance: any = null

  static getInstance() {
    if (!SupabaseManager.instance) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!url || !key) {
        logger.error('Missing Supabase credentials')
        throw new Error('Supabase not configured')
      }

      SupabaseManager.instance = createClient(url, key)
    }
    return SupabaseManager.instance
  }
}

export const getSupabase = () => SupabaseManager.getInstance()
\`\`\`

### 1.3 إنشاء Rate Limiting Middleware

\`\`\`typescript
// lib/middleware/ratelimit.ts
import { createLogger } from '../logger'

const logger = createLogger('RateLimit')
const limitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const current = limitStore.get(key)

  if (!current || now > current.resetTime) {
    limitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    logger.warn('Rate limit exceeded', { key, count: current.count })
    return false
  }

  current.count++
  return true
}
\`\`\`

### 1.4 إنشاء Input Validator

\`\`\`typescript
// lib/validators/index.ts
export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const validators = {
  email: (email: string) => {
    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
    if (!re.test(email)) throw new ValidationError('email', 'Invalid email')
    return email
  },

  phoneNumber: (phone: string) => {
    const re = /^\\+?[1-9]\\d{1,14}$/
    if (!re.test(phone)) throw new ValidationError('phone', 'Invalid phone number')
    return phone
  },

  uuid: (id: string) => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!re.test(id)) throw new ValidationError('id', 'Invalid UUID')
    return id
  },

  required: (value: any, field: string) => {
    if (!value) throw new ValidationError(field, \`\${field} is required\`)
    return value
  },
}
\`\`\`

---

## المرحلة 2: API Refactoring (إعادة بناء الـ APIs)

### 2.1 API Template الموحد

\`\`\`typescript
// app/api/template/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createLogger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/middleware/ratelimit'
import { ValidationError, validators } from '@/lib/validators'
import { getSupabase } from '@/lib/supabase/unified'

const logger = createLogger('API:Template')

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limit check
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(\`api:\${ip}\`, 100, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // 2. Auth check
    const supabase = getSupabase()
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      logger.warn('Missing auth header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      logger.warn('Auth failed', { error: userError })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 4. Get workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (wsError || !workspace) {
      logger.warn('Workspace not found', { userId: user.id })
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // 5. Fetch data
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('workspace_id', workspace.id)

    if (error) throw error

    logger.info('Success')
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    logger.error('API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
\`\`\`

---

## المرحلة 3: Queue System (نظام الطوابير)

### 3.1 Webhook Queue Processor

\`\`\`typescript
// lib/queue/webhook-processor.ts
import { getSupabase } from '@/lib/supabase/unified'
import { createLogger } from '@/lib/logger'

const logger = createLogger('WebhookProcessor')

interface WebhookMessage {
  id: string
  payload: any
  retries: number
  createdAt: Date
}

class WebhookQueue {
  private queue: WebhookMessage[] = []
  private processing = false

  async enqueue(payload: any): Promise<string> {
    const id = \`msg:\${Date.now()}:\${Math.random()}\`
    this.queue.push({
      id,
      payload,
      retries: 0,
      createdAt: new Date(),
    })

    logger.info('Message queued', { id, queueSize: this.queue.length })

    // Start processing if not already running
    if (!this.processing) {
      this.process()
    }

    return id
  }

  private async process() {
    this.processing = true

    while (this.queue.length > 0) {
      const message = this.queue.shift()!

      try {
        await this.processMessage(message)
        logger.info('Message processed', { id: message.id })
      } catch (error) {
        logger.error('Processing failed', { id: message.id, error })

        if (message.retries < 3) {
          message.retries++
          this.queue.push(message) // Re-queue
          logger.info('Message re-queued', { id: message.id, retries: message.retries })
        }
      }
    }

    this.processing = false
  }

  private async processMessage(message: WebhookMessage) {
    const supabase = getSupabase()
    const payload = message.payload

    // Extract message data from WhatsApp webhook
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value) throw new Error('Invalid webhook payload')

    const messages = value.messages || []
    const contacts = value.contacts || []

    // Process each message
    for (const msg of messages) {
      const contact = contacts[0]

      const { error } = await supabase.from('messages').insert({
        phone_number_id: value.metadata?.phone_number_id,
        from: msg.from,
        to: value.metadata?.display_phone_number,
        type: msg.type,
        body: msg.text?.body || null,
        timestamp: new Date(msg.timestamp * 1000),
        webhook_message_id: msg.id,
      })

      if (error) throw error
    }
  }
}

export const webhookQueue = new WebhookQueue()
\`\`\`

### 3.2 Webhook Handler المحسّن

\`\`\`typescript
// app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { webhookQueue } from '@/lib/queue/webhook-processor'
import { createLogger } from '@/lib/logger'
import crypto from 'crypto'

const logger = createLogger('Webhook:WhatsApp')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify signature
    const signature = request.headers.get('x-hub-signature-256') || ''
    const secret = process.env.WHATSAPP_APP_SECRET

    if (secret) {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex')

      if (signature !== \`sha256=\${hash}\`) {
        logger.warn('Invalid signature')
        return new Response('Invalid signature', { status: 401 })
      }
    }

    // Enqueue for processing
    const jobId = await webhookQueue.enqueue(body)
    logger.info('Webhook received', { jobId })

    // Return immediately (required by Meta)
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Webhook error', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

// Webhook verification (GET request)
export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge)
  }

  return new Response('Forbidden', { status: 403 })
}
\`\`\`

---

## المرحلة 4: Utilities المهمة

### 4.1 Response Builder

\`\`\`typescript
// lib/response/builder.ts
import { NextResponse } from 'next/server'

export class ResponseBuilder {
  static success(data: any, statusCode = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  }

  static error(message: string, statusCode = 500, code?: string) {
    return NextResponse.json(
      {
        success: false,
        error: { message, code },
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  }

  static paginated(data: any[], total: number, page: number, limit: number) {
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    })
  }
}
\`\`\`

---

## الخطوات التالية المباشرة

1. **اليوم 1 صباحاً**: إنشاء المكتبات الأساسية (Logger, Supabase, RateLimit, Validators)
2. **اليوم 1 بعد الظهر**: تطبيق Template الموحد على 5 APIs رئيسية
3. **اليوم 2**: بناء Queue System وتطبيقه على Webhooks
4. **اليوم 3**: الاختبار الشامل والتحسينات النهائية

---

## KPIs الناجحة

✅ جميع APIs تستجيب في أقل من 500ms
✅ لا توجد أخطاء 500 في Production
✅ معالجة الـ Webhooks موثوقة 100%
✅ نظام Logging مركزي وشامل
✅ حماية من DDoS و Rate Limiting
✅ Input validation على جميع المدخلات
