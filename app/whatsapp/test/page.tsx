import { Sidebar } from "@/components/dashboard/sidebar"
import { WhatsAppTestClient } from "@/components/whatsapp/test-client"

export default function WhatsAppTestPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <WhatsAppTestClient />
      </main>
    </div>
  )
}
