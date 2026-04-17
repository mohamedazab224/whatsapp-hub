import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import { createLogger } from "@/lib/logger"
import { checkRateLimit } from "@/lib/ratelimit"
import { messageSchema, validateData } from "@/lib/validators"
import { ValidationError } from "@/lib/errors"
import { ResponseBuilder } from "@/lib/response/builder"

const logger = createLogger("API:Messages")

// Get user's first project
async function getUserProject(supabase: any, userEmail: string) {
  const { data: project, error } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_email", userEmail)
    .maybeSingle()

  if (error) throw error
  return project?.id || null
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

    const projectId = await getUserProject(supabase, user.email || "")

    if (!projectId) {
      logger.warn("Project not found", { userId: user.id })
      return ResponseBuilder.notFound("Project not found")
    }

    let query = supabase
      .from("messages")
      .select(
        `*, 
        contacts(name, wa_id)`,
        { count: "exact" }
      )
      .eq("project_id", projectId)

    if (contactId) {
      query = query.eq("contact_id", contactId)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: messages, count: total, error: messagesError } = await query
      .order("created_at", { ascending: false })
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
    const validatedData = validateData(body, messageSchema)

    logger.info("Creating message", { contactId: validatedData.contact_id })

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return ResponseBuilder.unauthorized()
    }

    const projectId = await getUserProject(supabase, user.email || "")

    if (!projectId) {
      logger.warn("Project not found", { userId: user.id })
      return ResponseBuilder.notFound("Project not found")
    }

    const { data: message, error: createError } = await supabase
      .from("messages")
      .insert({
        project_id: projectId,
        contact_id: validatedData.contact_id,
        body: validatedData.body,
        message_type: validatedData.type,
        direction: "outbound",
        status: "sent",
      })
      .select()
      .single()

    if (createError) throw createError

    const messageData = message as unknown as { id: string }
    logger.info("Message created successfully", { messageId: messageData.id })

    return ResponseBuilder.created(message)
  } catch (error) {
    logger.error("Failed to create message", error)
    if (error instanceof ValidationError) {
      return ResponseBuilder.badRequest(error.message)
    }
    return ResponseBuilder.internalError()
  }
}

