import { SidebarClient } from "./sidebar-client"
import { createSupabaseServerClient } from "@/lib/supabase/server"

interface Project {
  id: string
  name: string
}

interface WhatsAppNumber {
  id: string
  display_phone_number: string
  verified_name: string
  project_id: string
}

export async function Sidebar() {
  const projects: Project[] = []
  const numbers: WhatsAppNumber[] = []

  try {
    const supabase = await createSupabaseServerClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] Not authenticated in Sidebar")
      return <SidebarClient projects={[]} numbers={[]} />
    }

    // Get user's project
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (projectError) {
      console.error("[v0] Project query error:", projectError.message)
      return <SidebarClient projects={[]} numbers={[]} />
    }

    if (!projectData) {
      console.log("[v0] No project found for user in Sidebar")
      return <SidebarClient projects={[]} numbers={[]} />
    }

    // Add project to list
    projects.push({
      id: projectData.id,
      name: projectData.name,
    })

    // Get WhatsApp numbers for the project
    const { data: numbersData, error: numbersError } = await supabase
      .from("whatsapp_numbers")
      .select("id, display_phone_number, verified_name, project_id")
      .eq("project_id", projectData.id)

    if (numbersError) {
      console.error("[v0] Numbers query error:", numbersError.message)
      return <SidebarClient projects={projects} numbers={[]} />
    }

    if (numbersData && numbersData.length > 0) {
      numbersData.forEach((num) => {
        numbers.push({
          id: num.id,
          display_phone_number: num.display_phone_number,
          verified_name: num.verified_name,
          project_id: num.project_id,
        })
      })
    }

    console.log("[v0] Sidebar loaded - Project:", projects[0]?.name, "Numbers:", numbers.length)

    return <SidebarClient projects={projects} numbers={numbers} />
  } catch (error) {
    // Log the error message but don't pass the Error object to client component
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error in Sidebar:", errorMessage)
    return <SidebarClient projects={[]} numbers={[]} />
  }
}

