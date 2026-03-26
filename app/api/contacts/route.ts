import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import { createLogger } from "@/lib/logger"
import { checkRateLimit } from "@/lib/ratelimit"
import { validators, validateData } from "@/lib/validators"
import { ValidationError } from "@/lib/errors"
import { ResponseBuilder } from "@/lib/response/builder"

const logger = createLogger("API:Contacts")

// Get user's first project (workspace equivalent)
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
    const search = searchParams.get("search")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20")))

    logger.info("Fetching contacts", { page, limit, search: !!search })

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.warn("Unauthorized access")
      return ResponseBuilder.unauthorized()
    }

    // Get user's project
    const projectId = await getUserProject(supabase, user.email || "")

    if (!projectId) {
      logger.warn("Project not found", { userId: user.id })
      return ResponseBuilder.notFound("Project not found")
    }

    // Build query with search
    let query = supabase
      .from("contacts")
      .select("id, wa_id, name, profile_picture_url, status, created_at, last_message_at", {
        count: "exact",
      })
      .eq("project_id", projectId)

    if (search) {
      query = query.or(`name.ilike.%${search}%,wa_id.ilike.%${search}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: contacts, count: total, error: contactsError } = await query
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .range(from, to)

    if (contactsError) throw contactsError

    logger.info("Retrieved contacts", { count: contacts?.length || 0, total })

    return ResponseBuilder.paginated(contacts || [], total || 0, page, limit)
  } catch (error) {
    logger.error("Failed to fetch contacts", error)
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
    if (!checkRateLimit(`api:${ip}:create`, 50, 60000)) {
      return ResponseBuilder.rateLimitExceeded()
    }

    const body = await request.json()

    // Validation
    validators.required(body.name, "name")
    validators.required(body.wa_id, "wa_id")
    validators.phoneNumber(body.wa_id)

    logger.info("Creating contact", { name: body.name, wa_id: body.wa_id })

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return ResponseBuilder.unauthorized()
    }

    // Get user's project
    const projectId = await getUserProject(supabase, user.email || "")

    if (!projectId) {
      return ResponseBuilder.notFound("Project not found")
    }

    const { data: contact, error: createError } = await supabase
      .from("contacts")
      .insert({
        project_id: projectId,
        name: validators.string(body.name, "name", 1, 255),
        wa_id: validators.phoneNumber(body.wa_id),
        status: body.status || "active",
      })
      .select()
      .single()

    if (createError) throw createError

    logger.info("Contact created successfully", { contactId: contact.id })

    return ResponseBuilder.created(contact)
  } catch (error) {
    logger.error("Failed to create contact", error)
    if (error instanceof ValidationError) {
      return ResponseBuilder.badRequest(error.message)
    }
    return ResponseBuilder.internalError()
  }
}

