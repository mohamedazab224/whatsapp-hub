import { SidebarClient } from "./sidebar-client"

export async function Sidebar() {
  // Mock data for now - replace with Supabase queries when configured
  const projects = [
    { id: "1", name: "المشروع الرئيسي" },
    { id: "2", name: "مشروع الاختبار" },
  ]
  
  const numbers = [
    { id: "1", project_id: "1" },
    { id: "2", project_id: "1" },
    { id: "3", project_id: "2" },
  ]

  return <SidebarClient projects={projects} numbers={numbers} />
}
