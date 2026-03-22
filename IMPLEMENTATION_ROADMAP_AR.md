# خارطة الطريق التنفيذية - WhatsApp Hub SaaS

## المرحلة الحالية: Foundation Complete ✓
- ✓ المصادقة والأمان
- ✓ قاعدة البيانات الأساسية
- ✓ Webhook Reception
- ✓ واجهة Inbox بسيطة

---

## المرحلة 1: تحسين الـ Core (الأسبوع 1-2)

### 1.1 تحسين معالجة الـ Webhooks
**المشكلة**: المعالجة الفورية تسبب Timeout تحت الضغط

```typescript
// app/api/webhooks/whatsapp/route.ts - التحسينات المطلوبة

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1000, "1 m"), // 1000 رسالة في الدقيقة
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. التحقق من التوقيع (HMAC-SHA256)
    const signature = request.headers.get("x-hub-signature-256") || "";
    const hash = crypto
      .createHmac("sha256", process.env.WHATSAPP_APP_SECRET!)
      .update(JSON.stringify(body))
      .digest("hex");
    
    if (signature !== `sha256=${hash}`) {
      return new Response("Invalid signature", { status: 401 });
    }

    // 2. فحص Rate Limit
    const { success } = await ratelimit.limit(`webhook:${request.headers.get("x-forwarded-for")}`);
    if (!success) {
      // ارسل المرة القادمة Retry بعد وقت
      return new Response("Too many requests", { status: 429 });
    }

    // 3. إضافة فوراً إلى Queue (لا تنتظر المعالجة)
    const jobId = `webhook:${Date.now()}:${Math.random()}`;
    await redis.xadd("whatsapp:messages:queue", "*", 
      "payload", JSON.stringify(body),
      "timestamp", Date.now().toString()
    );

    // 4. استدعاء معالج غير متزامن (لا تنتظر النتيجة)
    // يمكن استخدام Vercel Functions أو Worker Thread
    if (process.env.NODE_ENV === "production") {
      // استدعاء endpoint منفصل للمعالجة
      fetch(`${process.env.VERCEL_URL}/api/webhooks/whatsapp/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, payload: body }),
      }).catch(err => console.error("[v0] Processing error:", err));
    } else {
      // في التطوير: معالجة فوراً
      await processWhatsAppMessage(body);
    }

    // 5. الرد الفوري (ضروري جداً للـ Meta)
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[v0] Webhook error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// معالج الـ Queue (يعمل بشكل منفصل)
async function processWhatsAppMessage(payload: any) {
  try {
    // استخرج البيانات
    const message = payload.entry[0].changes[0].value.messages[0];
    const contact = payload.entry[0].changes[0].value.contacts[0];
    
    // احفظ في قاعدة البيانات
    const supabase = createSupabaseAdminClient();
    
    // ابدأ Transaction
    const { data: savedMessage, error: dbError } = await supabase
      .from("messages")
      .insert({
        meta_message_id: message.id,
        direction: "inbound",
        status: "received",
        body: message.text?.body || "",
        message_type: message.type,
        // ... باقي البيانات
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // أطلق Realtime Events
    await supabase
      .channel(`workspace:${workspace_id}`)
      .send("broadcast", {
        event: "new_message",
        payload: savedMessage
      });

    // شغل الـ Workflows المطابقة
    await triggerMatchingWorkflows(savedMessage);

  } catch (error) {
    console.error("[v0] Message processing error:", error);
    // أضف إلى Dead Letter Queue للمحاولة لاحقاً
    await addToDeadLetterQueue(payload, error);
  }
}
```

### 1.2 تحسينات Inbox UI
```typescript
// components/inbox/inbox-page.tsx - المميزات المطلوبة الجديدة

// أضف:
- useSearch() - بحث فوري في الرسائل والعملاء
- useFilter() - فلترة حسب (التاريخ، الرقم، الحالة)
- useBulkActions() - تحديد متعدد وإجراءات جماعية
- useConversationThreading() - تجميع الرسائل بمحادثات
- useLabels() - وضع علامات على الرسائل
- useAssignment() - إعادة توجيه للمشرفين
```

### 1.3 نظام Template Management
```typescript
// app/api/templates/route.ts - إنشاء، تحديث، حذف

export async function POST(request: Request) {
  // إنشاء template جديد
  // التحقق من صحة المتغيرات
  // حفظ في قاعدة البيانات
  // (اختياري) مزامنة مع Meta
}

export async function GET(request: Request) {
  // احصل على كل القوالب للـ Workspace
  // مع عدد الاستخدام والإحصائيات
}
```

---

## المرحلة 2: Workflow Automation (الأسبوع 3-4)

### 2.1 Flow Builder UI

```typescript
// components/workflows/flow-builder.tsx

// المكونات المطلوبة:
1. Canvas (لرسم الـ Nodes)
2. Node Types:
   - Trigger Node (متى يبدأ الـ Workflow)
   - Action Node (ماذا يفعل)
   - Condition Node (شروط)
   - Delay Node (تأخير زمني)
   - End Node (نهاية)

3. Visual Editor:
   - Drag & Drop لإضافة Nodes
   - Connection Lines بين الـ Nodes
   - Configuration Panel لكل Node
   - Preview و Testing

مثال Flow:
┌────────────────┐
│ Trigger: Message received with keyword "price" │
└────────┬───────┘
         │
    ┌────▼─────┐
    │ Send Template: "Our Prices" │
    └────┬──────┘
         │
    ┌────▼────────────┐
    │ Wait 5 seconds   │
    └────┬─────────────┘
         │
    ┌────▼──────────────────┐
    │ If: User replied with "buy"? │
    └────┬─────────────┬────┘
       Yes│            │No
         │            │
    ┌────▼─────┐ ┌────▼──────────┐
    │Send Form │ │Archive Conv.   │
    └──────────┘ └────────────────┘
```

### 2.2 Workflow Execution Engine

```typescript
// lib/workflows/executor.ts

export class WorkflowExecutor {
  async execute(workflow: Workflow, trigger: TriggerEvent) {
    // اقرأ خطوات الـ Workflow
    const steps = workflow.steps;
    
    // احتفظ بـ Context للمحادثة
    const context = {
      message: trigger.message,
      contact: trigger.contact,
      variables: {},
    };

    // نفذ الخطوات بالترتيب
    for (const step of steps) {
      try {
        switch (step.type) {
          case "action":
            await this.executeAction(step, context);
            break;
          case "condition":
            const shouldContinue = await this.evaluateCondition(step, context);
            if (!shouldContinue) return; // توقف الـ Workflow
            break;
          case "delay":
            await this.delay(step.config.seconds * 1000);
            break;
        }
      } catch (error) {
        console.error("[v0] Step execution error:", error);
        // سجل الخطأ وتابع أو توقف حسب الإعدادات
      }
    }
  }

  private async executeAction(step: ActionStep, context: Context) {
    switch (step.action) {
      case "send_message":
        await this.sendMessage(step.config.template, context);
        break;
      case "call_webhook":
        await this.callWebhook(step.config.url, context);
        break;
      case "send_to_agent":
        await this.assignToAgent(step.config.agentId, context);
        break;
    }
  }

  private async evaluateCondition(step: ConditionStep, context: Context) {
    // مثال: "if message contains 'buy'"
    const condition = step.config.condition; // { field: "body", operator: "contains", value: "buy" }
    
    switch (condition.field) {
      case "body":
        return this.evaluateTextCondition(context.message.body, condition);
      case "sentiment":
        const sentiment = await this.analyzeSentiment(context.message.body);
        return this.evaluateNumericCondition(sentiment, condition);
    }
  }
}
```

### 2.3 Trigger Types

```typescript
// lib/workflows/triggers.ts

export enum TriggerType {
  MESSAGE_RECEIVED = "message_received", // رسالة جديدة
  KEYWORD_MATCH = "keyword_match",       // كلمة محددة
  NO_RESPONSE = "no_response",           // لا رد لـ X دقائق
  TIME_BASED = "time_based",             // وقت محدد يومياً
  API_CALL = "api_call",                 // استدعاء من API خارجي
}

export interface Trigger {
  type: TriggerType;
  config: {
    // لـ KEYWORD_MATCH
    keywords?: string[];
    case_sensitive?: boolean;
    
    // لـ NO_RESPONSE
    timeout_minutes?: number;
    
    // لـ TIME_BASED
    time?: "09:00"; // بتنسيق HH:MM
    timezone?: string;
  };
}
```

---

## المرحلة 3: AI Integration (الأسبوع 5-6)

### 3.1 تكامل OpenAI

```typescript
// lib/ai/openai-integration.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSmartReply(
  messageBody: string,
  contactName: string,
  context: any
): Promise<string> {
  const systemPrompt = `أنت مساعد خدمة عملاء احترافي للشركة.
  - رد بشكل ودود وحترافي
  - استخدم اسم العميل عند الإمكان
  - كن قصيراً (أقل من 160 حرف)
  - الرد باللغة العربية`;

  const userPrompt = `رسالة من ${contactName}: "${messageBody}"
  
  السياق: ${JSON.stringify(context)}
  
  الرجاء الرد بشكل مناسب:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 160,
  });

  return response.choices[0].message.content || "";
}

// استخدام في Workflow
export async function handleWithAI(message: Message) {
  const reply = await generateSmartReply(
    message.body,
    message.contact.name,
    { order_history: [], purchase_behavior: "" }
  );
  
  return await sendMessage(message.contact_id, reply);
}
```

### 3.2 Intent Recognition

```typescript
// lib/ai/intent-recognition.ts

export enum Intent {
  GREETING = "greeting",
  QUESTION = "question", 
  COMPLAINT = "complaint",
  ORDER = "order",
  SUPPORT = "support",
  FEEDBACK = "feedback",
  OTHER = "other",
}

export async function recognizeIntent(text: string): Promise<Intent> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `حدد نية الرسالة من القائمة: ${Object.values(Intent).join(", ")}`,
      },
      { role: "user", content: text },
    ],
  });

  const intent = response.choices[0].message.content as Intent;
  return intent;
}

// في الـ Workflow:
// إذا كان Intent = COMPLAINT → وجه للـ Support Agent
// إذا كان Intent = ORDER → استخرج تفاصيل الطلب
```

---

## المرحلة 4: Advanced Features (الأسبوع 7-8)

### 4.1 نظام البث الجماعي (Broadcast)

```typescript
// app/api/broadcasts/route.ts

export async function POST(request: Request) {
  const { 
    workspace_id, 
    template_id, 
    recipients, // "all" أو array من contact IDs
    schedule_time, // null = فوراً
    personalization // { name: "{{name}}", product: "{{product}}" }
  } = await request.json();

  // 1. تحقق من القيود (max broadcasts/month)
  const { count: sentThisMonth } = await supabase
    .from("broadcasts")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace_id)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (sentThisMonth >= workspace.max_broadcasts_per_month) {
    return NextResponse.json({ error: "Broadcast limit reached" }, { status: 429 });
  }

  // 2. أنشئ سجل الحملة
  const { data: broadcast } = await supabase
    .from("broadcasts")
    .insert({
      workspace_id,
      template_id,
      status: schedule_time ? "scheduled" : "queued",
      recipients_count: recipients === "all" ? await countAllContacts() : recipients.length,
      scheduled_at: schedule_time,
    })
    .select()
    .single();

  // 3. أنشئ وظائف الإرسال
  if (schedule_time) {
    // جدول للإرسال في الوقت المحدد
    await scheduleJob(broadcast.id, schedule_time);
  } else {
    // أرسل فوراً
    await queueBroadcastMessages(broadcast.id, recipients, personalization);
  }

  return NextResponse.json({ broadcast });
}

// معالج الإرسال
async function queueBroadcastMessages(
  broadcastId: string,
  recipients: string[] | "all",
  personalization: any
) {
  const contacts = recipients === "all" 
    ? await getAllActiveContacts()
    : await getContactsByIds(recipients);

  for (const contact of contacts) {
    // تحقق من قائمة عدم الاتصال
    if (contact.do_not_contact) continue;

    // طبق التخصيص
    const message = template.body
      .replace("{{name}}", contact.name)
      .replace("{{product}}", personalization.product || "");

    // أضف إلى Queue
    await redis.xadd("broadcast:messages", "*",
      "contact_id", contact.id,
      "message", message,
      "broadcast_id", broadcastId
    );
  }
}
```

### 4.2 التحليلات المتقدمة

```typescript
// app/api/analytics/route.ts

export async function GET(request: Request) {
  const { workspace_id, date_from, date_to } = getQueryParams(request);

  // 1. إجمالي الرسائل
  const totalMessages = await getTotalMessages(workspace_id, date_from, date_to);

  // 2. معدل الاستجابة
  const responseRate = await calculateResponseRate(workspace_id, date_from, date_to);

  // 3. متوسط وقت الاستجابة
  const avgResponseTime = await calculateAvgResponseTime(workspace_id, date_from, date_to);

  // 4. الرسائل حسب الرقم
  const messagesByNumber = await getMessagesByNumber(workspace_id, date_from, date_to);

  // 5. أفضل الجهات (معظم الرسائل)
  const topContacts = await getTopContacts(workspace_id, date_from, date_to, 10);

  // 6. معدل النمو
  const growthRate = calculateGrowthRate(totalMessages);

  return NextResponse.json({
    totalMessages,
    responseRate,
    avgResponseTime,
    messagesByNumber,
    topContacts,
    growthRate,
  });
}
```

### 4.3 إدارة الفريق

```typescript
// app/api/workspace/members/route.ts

export async function POST(request: Request) {
  const { workspace_id, email, role } = await request.json();

  // 1. تحقق من أن الطالب هو Owner
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace_id)
    .eq("user_id", user.id)
    .single();

  if (member.role !== "owner") {
    return NextResponse.json({ error: "Only owner can add members" }, { status: 403 });
  }

  // 2. ابحث عن المستخدم أو أنشئه
  let targetUser = await findUserByEmail(email);
  if (!targetUser) {
    // أرسل دعوة للانضمام
    await sendInviteEmail(email, workspace_id);
    return NextResponse.json({ pending: true });
  }

  // 3. أضفه إلى الـ Workspace
  await supabase
    .from("workspace_members")
    .insert({
      workspace_id,
      user_id: targetUser.id,
      role,
      joined_at: new Date().toISOString(),
    });

  return NextResponse.json({ success: true });
}
```

---

## Timeline التنفيذ الكامل

| المرحلة | المدة | الأولوية |
|-------|-------|----------|
| 1. تحسين الـ Core | أسبوعان | 🔴 عالية جداً |
| 2. Workflow Automation | أسبوعان | 🔴 عالية |
| 3. AI Integration | أسبوعان | 🟡 متوسطة |
| 4. Advanced Features | أسبوعان | 🟡 متوسطة |
| Testing & Optimization | أسبوع | 🔴 عالية |
| Launch & Monitoring | مستمر | 🔴 عالية |

**الإجمالي: 8-10 أسابيع للإطلاق الأول**
