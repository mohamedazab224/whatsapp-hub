import { SidebarClient } from "./sidebar-client"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function Sidebar() {
  const supabase = await createSupabaseServerClient()

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.log("[v0] Not authenticated in Sidebar")
    return <SidebarClient projects={[]} numbers={[]} />
  }

  try {
    // Get user's project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (projectError || !project) {
      console.log("[v0] No project found for user in Sidebar")
      return <SidebarClient projects={[]} numbers={[]} />
    }

    // Get WhatsApp numbers for the project
    const { data: numbers, error: numbersError } = await supabase
      .from("whatsapp_numbers")
      .select("id, display_phone_number, verified_name, project_id")
      .eq("project_id", project.id)

    const finalNumbers = numbersError ? [] : (numbers || [])

    console.log("[v0] Sidebar loaded - Project:", project.name, "Numbers:", finalNumbers.length)

    return <SidebarClient projects={[project]} numbers={finalNumbers} />
  } catch (error) {
    console.error("[v0] Error in Sidebar:", error)
    return <SidebarClient projects={[]} numbers={[]} />
  }
}

