"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Copy, Download, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type MediaActionsProps = {
  id: string
  publicUrl?: string
}

export function MediaActions({ id, publicUrl }: MediaActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCopy = async () => {
    const response = await fetch(`/api/media/${id}/copy`)
    if (!response.ok) {
      alert("تعذر إنشاء رابط النسخ.")
      return
    }
    const data = await response.json()
    await navigator.clipboard.writeText(data.url)
    alert("تم نسخ الرابط.")
  }

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف الوسائط؟")) return
    setIsDeleting(true)
    const response = await fetch(`/api/media/${id}`, { method: "DELETE" })
    setIsDeleting(false)
    if (!response.ok) {
      alert("تعذر حذف الوسائط.")
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <a href={publicUrl || "#"} target="_blank" rel="noreferrer">
          <Eye className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <a href={publicUrl || "#"} download>
          <Download className="h-4 w-4" />
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
