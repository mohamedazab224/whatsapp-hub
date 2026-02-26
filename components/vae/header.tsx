import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function VAEHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Camera className="h-8 w-8" />
          نظام توثيق الأعمال الميدانية
        </h1>
        <p className="text-muted-foreground mt-1">Visual Accountability Engine</p>
      </div>
      <div className="space-x-2">
        <Link href="/vae/upload">
          <Button>رفع صورة</Button>
        </Link>
        <Link href="/vae/projects">
          <Button variant="outline">المشاريع</Button>
        </Link>
      </div>
    </div>
  )
}
