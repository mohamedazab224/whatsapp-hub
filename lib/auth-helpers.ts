import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"
import { UnauthorizedError, ForbiddenError } from "@/lib/errors"

/**
 * Get the current authenticated user from Supabase
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new UnauthorizedError("No authenticated user found")
  }
  
  return user
}

/**
 * Get the current user's project ID
 * In this system, we use the user's ID as the project_id (single-tenant per user)
 */
export async function getCurrentProjectId() {
  const user = await getCurrentUser()
  return user.id
}

/**
 * Verify user has access to a specific project
 */
export async function verifyProjectAccess(projectId: string) {
  const currentProjectId = await getCurrentProjectId()
  
  if (projectId !== currentProjectId) {
    throw new ForbiddenError("You do not have access to this project")
  }
  
  return true
}

/**
 * Fetch user profile from database
 */
export async function getUserProfile(userId: string) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()
  
  if (error) throw error
  return data as Database["public"]["Tables"]["users"]["Row"]
}

/**
 * Check if user has admin access (owner of project)
 */
export async function isProjectOwner(projectId: string) {
  const user = await getCurrentUser()
  
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single()
  
  if (error || !data) {
    return false
  }
  
  return true
}
