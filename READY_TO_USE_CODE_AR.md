# أكوار جاهزة للاستخدام الفوري

## 1. Webhook Handler متقدم مع Queue Processing

```typescript
// lib/webhooks/whatsapp-processor.ts

import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface WebhookPayload {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: Array<any>;
        statuses?: Array<any>;
        contacts?: Array<any>;
      };
    }>;
  }>;
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const hash = crypto
    .createHmac("sha256", process.env.WHATSAPP_APP_SECRET!)
    .update(payload)
    .digest("hex");

  return signature === `sha256=${hash}`;
}

export async function handleWhatsAppWebhook(payload: WebhookPayload) {
  const jobId = `webhook:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

  // أضف إلى Queue للمعالجة غير المتزامنة
  await redis.xadd(
    "whatsapp:webhooks:queue",
    "*",
    "payload",
    JSON.stringify(payload),
    "timestamp",
    Date.now().toString(),
    "job_id",
    jobId
  );

  return { success: true, jobId };
}

export async function processWebhookQueue() {
  const messages = await redis.xrange("whatsapp:webhooks:queue", "-", "+", {
    count: 10,
  });

  for (const [id, fields] of messages) {
    try {
      const payload = JSON.parse(fields.payload as string);
      await processWebhookPayload(payload);
      await redis.xdel("whatsapp:webhooks:queue", id);
    } catch (error) {
      console.error("[v0] Webhook processing error:", error);
      // أضف إلى Dead Letter Queue
      await redis.xadd(
        "whatsapp:webhooks:dlq",
        "*",
        "payload",
        fields.payload,
        "error",
        String(error)
      );
    }
  }
}

async function processWebhookPayload(payload: WebhookPayload) {
  const supabase = createSupabaseAdminClient();

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      // معالجة الرسائل الجديدة
      if (value.messages) {
        for (const message of value.messages) {
          await saveMessage(supabase, message, value);
        }
      }

      // معالجة تحديثات الحالة
      if (value.statuses) {
        for (const status of value.statuses) {
          await updateMessageStatus(supabase, status);
        }
      }
    }
  }
}

async function saveMessage(supabase: any, message: any, value: any) {
  const contact = value.contacts?.[0];

  const { data, error } = await supabase
    .from("messages")
    .insert({
      meta_message_id: message.id,
      direction: "inbound",
      status: "received",
      message_type: message.type,
      body: message.text?.body || "",
      media_id: message[message.type]?.id,
      sender_phone: message.from,
      receiver_phone: value.metadata?.phone_number_id,
      contact_name: contact?.profile?.name,
    })
    .select()
    .single();

  if (error) throw error;

  // أطلق Realtime event
  await supabase.channel("messages").send("broadcast", {
    event: "new_message",
    payload: data,
  });
}

async function updateMessageStatus(supabase: any, status: any) {
  const { error } = await supabase
    .from("messages")
    .update({ status: status.status })
    .eq("meta_message_id", status.id);

  if (error) throw error;
}
```

## 2. Webhook API Endpoint

```typescript
// app/api/webhooks/whatsapp/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  handleWhatsAppWebhook,
} from "@/lib/webhooks/whatsapp-processor";

export async function GET(request: NextRequest) {
  // Webhook verification من Meta
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const verifyToken = request.nextUrl.searchParams.get("hub.verify_token");

  if (mode === "subscribe" && verifyToken === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Unauthorized", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // تحقق من التوقيع
    const signature = request.headers.get("x-hub-signature-256") || "";
    const isValid = await verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.warn("[v0] Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // معالجة الـ Webhook
    const payload = JSON.parse(rawBody);
    await handleWhatsAppWebhook(payload);

    // الرد الفوري (ضروري للـ Meta)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[v0] Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 3. Service لإرسال الرسائل

```typescript
// lib/whatsapp/message-sender.ts

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  toPhoneNumber: string,
  message: string,
  accessToken: string,
  messageType: "text" | "template" = "text"
) {
  const url = `https://graph.instagram.com/v24.0/${phoneNumberId}/messages`;

  const payload =
    messageType === "text"
      ? {
          messaging_product: "whatsapp",
          to: toPhoneNumber,
          type: "text",
          text: { body: message },
        }
      : {
          messaging_product: "whatsapp",
          to: toPhoneNumber,
          type: "template",
          template: {
            name: message,
            language: { code: "ar" },
          },
        };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }

    const data = await response.json();

    // احفظ الرسالة في قاعدة البيانات
    const supabase = createSupabaseAdminClient();
    await supabase.from("messages").insert({
      meta_message_id: data.messages[0].id,
      direction: "outbound",
      status: "sent",
      message_type: messageType,
      body: message,
      receiver_phone: toPhoneNumber,
    });

    return data;
  } catch (error) {
    console.error("[v0] Error sending message:", error);
    throw error;
  }
}

export async function sendMessageToContact(
  contactId: string,
  message: string,
  templateName?: string
) {
  const supabase = createSupabaseAdminClient();

  // احصل على بيانات الجهة
  const { data: contact } = await supabase
    .from("contacts")
    .select("phone_number, whatsapp_number_id")
    .eq("id", contactId)
    .single();

  if (!contact) throw new Error("Contact not found");

  // احصل على بيانات الرقم
  const { data: number } = await supabase
    .from("whatsapp_numbers")
    .select("phone_number_id, access_token_encrypted")
    .eq("id", contact.whatsapp_number_id)
    .single();

  if (!number) throw new Error("WhatsApp number not found");

  // فك تشفير التوكن
  const accessToken = decryptToken(number.access_token_encrypted);

  // أرسل الرسالة
  return await sendWhatsAppMessage(
    number.phone_number_id,
    contact.phone_number,
    templateName || message,
    accessToken,
    templateName ? "template" : "text"
  );
}
```

## 4. Workflow Engine الأساسي

```typescript
// lib/workflows/engine.ts

export interface WorkflowStep {
  id: string;
  type: "action" | "condition" | "delay";
  config: any;
}

export interface Workflow {
  id: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

export class WorkflowEngine {
  private supabase = createSupabaseAdminClient();

  async executeWorkflow(workflow: Workflow, triggerData: any) {
    const context = {
      message: triggerData.message,
      contact: triggerData.contact,
      variables: {},
    };

    for (const step of workflow.steps) {
      try {
        switch (step.type) {
          case "action":
            await this.executeAction(step, context);
            break;
          case "condition":
            const shouldContinue = this.evaluateCondition(
              step.config,
              context
            );
            if (!shouldContinue) return;
            break;
          case "delay":
            await new Promise((resolve) =>
              setTimeout(resolve, step.config.seconds * 1000)
            );
            break;
        }
      } catch (error) {
        console.error("[v0] Workflow step error:", error);
        throw error;
      }
    }
  }

  private async executeAction(step: WorkflowStep, context: any) {
    const { action, config } = step;

    switch (action) {
      case "send_message":
        await sendWhatsAppMessage(
          config.phone_number_id,
          context.contact.phone_number,
          config.message,
          config.access_token
        );
        break;

      case "send_template":
        await sendWhatsAppMessage(
          config.phone_number_id,
          context.contact.phone_number,
          config.template_name,
          config.access_token,
          "template"
        );
        break;

      case "call_webhook":
        await fetch(config.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context),
        });
        break;

      case "log":
        console.log("[v0] Workflow log:", config.message);
        break;
    }
  }

  private evaluateCondition(config: any, context: any): boolean {
    const { field, operator, value } = config;

    switch (operator) {
      case "contains":
        return context.message.body.includes(value);
      case "equals":
        return context.message.body === value;
      case "starts_with":
        return context.message.body.startsWith(value);
      case "ends_with":
        return context.message.body.endsWith(value);
      default:
        return true;
    }
  }
}
```

## 5. Realtime Listener

```typescript
// lib/realtime/message-listener.ts

import { createSupabaseClientBrowser } from "@/lib/supabase/client";

export function setupMessageListener(workspaceId: string, callback: (msg: any) => void) {
  const supabase = createSupabaseClientBrowser();

  return supabase
    .channel(`workspace:${workspaceId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `workspace_id=eq.${workspaceId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}

// في Component:
import { useEffect } from "react";

export function useMessages(workspaceId: string) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const subscription = setupMessageListener(workspaceId, (newMessage) => {
      setMessages((prev) => [newMessage, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [workspaceId]);

  return messages;
}
```

---

## ملاحظات تنفيذية مهمة

### 1. تشفير التوكنات
```typescript
import crypto from "crypto";

export function encryptToken(token: string): string {
  const cipher = crypto.createCipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY!
  );
  return cipher.update(token, "utf8", "hex") + cipher.final("hex");
}

export function decryptToken(encrypted: string): string {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY!
  );
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}
```

### 2. Error Handling
```typescript
export class WhatsAppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

export async function handleWhatsAppError(error: any) {
  if (error.response?.status === 429) {
    throw new WhatsAppError(
      "RATE_LIMITED",
      "تم تجاوز حد الرسائل المسموح",
      error.response.data
    );
  }
  // ... معالجة الأخطاء الأخرى
}
```

### 3. Logging
```typescript
export async function logEvent(
  workspaceId: string,
  event: string,
  data: any
) {
  const supabase = createSupabaseAdminClient();

  await supabase.from("event_logs").insert({
    workspace_id: workspaceId,
    event,
    data,
    timestamp: new Date().toISOString(),
  });
}
```
