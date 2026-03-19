import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import { createLogger } from "@/lib/logger"
import { checkRateLimit } from "@/lib/ratelimit"
import { validators, ValidationError } from "@/lib/validators"
import { ResponseBuilder } from "@/lib/response/builder"

const logger = createLogger("API:Messages")

async function ensureWorkspace(supabase: any, userId: string) {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle()

  if (error) throw error
  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return workspace.id
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(`api:${ip}`, 100, 60000)) {
      return ResponseBuilder.rateLimitExceeded()
    }

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contact_id")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50")))

    logger.info("Fetching messages", { page, limit, contactId: !!contactId })

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return ResponseBuilder.unauthorized()
    }

    const workspaceId = await ensureWorkspace(supabase, user.id)

    let query = supabase
      .from("messages")
      .select(
        `*, 
        contacts(name, wa_id),
        media:media_files(public_url, mime_type)`,
        { count: "exact" }
      )
      .eq("workspace_id", workspaceId)

    if (contactId) {
      query = query.eq("contact_id", contactId)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: messages, count: total, error: messagesError } = await query
      .order("timestamp", { ascending: false })
      .range(from, to)

    if (messagesError) throw messagesError

    logger.info("Retrieved messages", { count: messages?.length || 0, total })

    return ResponseBuilder.paginated(messages || [], total || 0, page, limit)
  } catch (error) {
    logger.error("Failed to fetch messages", error)
    if (error instanceof ValidationError) {
      return ResponseBuilder.badRequest(error.message)
    }
    return ResponseBuilder.internalError()
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(`api:${ip}:send`, 50, 60000)) {
      return ResponseBuilder.rateLimitExceeded()
    }

    const body = await request.json()

    // Validation
    validators.required(body.contact_id, "contact_id")
    validators.required(body.body, "body")
    validators.string(body.body, "body", 1, 4096)

    logger.info("Creating message", { contactId: body.contact_id })

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return ResponseBuilder.unauthorized()
    }

    const workspaceId = await ensureWorkspace(supabase, user.id)

    const { data: message, error: createError } = await supabase
      .from("messages")
      .insert({
        workspace_id: workspaceId,
        contact_id: validators.uuid(body.contact_id, "contact_id"),
        body: body.body,
        type: body.type || "text",
        direction: "outbound",
        status: "pending",
      })
      .select()
      .single()

    if (createError) throw createError

    logger.info("Message created successfully", { messageId: message.id })

    return ResponseBuilder.created(message)
  } catch (error) {
    logger.error("Failed to create message", error)
    if (error instanceof ValidationError) {
      return ResponseBuilder.badRequest(error.message)
    }
    return ResponseBuilder.internalError()
  }
}

