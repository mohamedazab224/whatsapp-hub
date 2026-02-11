import { NextResponse, NextRequest } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import type { Database } from "@/lib/database.types"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseAdminClient()

    // Check if id is a UUID (fetch by id) or a type string (fetch by type)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase.from("templates").select("*")

    if (isUUID) {
      query = query.eq("id", id)
    } else {
      // Treat as template type
      query = query.eq("type", id)
    }

    const { data, error } = await query

    if (error) {
      logger.error("Failed to fetch templates", { error, id })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(isUUID ? data[0] : data)
  } catch (error) {
    logger.error("Error fetching templates", { error })
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createSupabaseAdminClient()

    // If id is UUID, update. Otherwise, create with type.
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (isUUID) {
      const { data, error } = await supabase
        .from("templates")
        .update(body)
        .eq("id", id)
        .select()

      if (error) {
        logger.error("Failed to update template", { error, id })
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      logger.info("Template updated", { templateId: id })
      return NextResponse.json(data[0])
    } else {
      // Create with type
      const { data, error } = await supabase
        .from("templates")
        .insert([{ type: id, ...body }])
        .select()

      if (error) {
        logger.error("Failed to create template", { error, type: id })
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      logger.info("Template created", { type: id })
      return NextResponse.json(data[0])
    }
  } catch (error) {
    logger.error("Error creating/updating template", { error })
    return NextResponse.json({ error: "Failed to process template" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseAdminClient()

    const { data: template, error: fetchError } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (fetchError || !template) {
      logger.error("Template not found", { error: fetchError, templateId: id })
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { error: deleteError } = await supabase.from("templates").delete().eq("id", id)

    if (deleteError) {
      logger.error("Failed to delete template", { error: deleteError, templateId: id })
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    logger.info("Template deleted", { templateId: id })
    return NextResponse.json({ status: "ok" })
  } catch (error) {
    logger.error("Error deleting template", { error })
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}

