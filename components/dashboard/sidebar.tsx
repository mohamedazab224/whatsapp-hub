"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, Inbox, Smartphone, Database, LogOut, FileText, Send, BarChart3, Share2, Terminal, Webhook, Key, Settings, HelpCircle, Activity, FileJson } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "لوحة المعلومات", href: "/", icon: LayoutDashboard },
  { name: "أضف رقما جديدا", href: "/numbers/add", icon: PlusCircle },
]

const whatsappMenu = [
  { name: "صندوق الوارد", href: "/inbox", icon: Inbox },
  {
    name: "أرقام الهواتف",
    href: "/numbers",
    icon: Smartphone,
    children: [
      { name: "الأرقام المتصلة", href: "/numbers/connected" },
      { name: "الأرقام الرقمية", href: "/numbers/digital" },
      { name: "اختبار صندوق الرمل", href: "/numbers/sandbox" },
    ],
  },
  {
    name: "البيانات",
    href: "/data",
    icon: Database,
    children: [
      { name: "المحادثات", href: "/data/chats" },
      { name: "الرسائل", href: "/data/messages" },
      { name: "الإعلام", href: "/data/media" },
      { name: "جهات الاتصال", href: "/data/contacts" },
      { name: "النداءات", href: "/data/calls" },
      { name: "إعلانات (CTWA)", href: "/data/ads" },
    ],
  },
  { name: "الخروج", href: "/logout", icon: LogOut },
]

const toolsMenu = [
  { name: "القوالب", href: "/templates", icon: FileText },
  { name: "البث", href: "/broadcast", icon: Send },
  { name: "التحليلات", href: "/analytics", icon: BarChart3 },
  { name: "تدفقات واتساب", href: "/flows", icon: Share2 },
]

const apiMenu = [
  { name: "السجلات", href: "/logs", icon: Terminal },
  { name: "ويبهوكس", href: "/webhooks", icon: Webhook },
  { name: "مفاتيح واجهة برمجة التطبيقات", href: "/api-keys", icon: Key },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-l bg-card">
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <span className="text-xl font-bold">العزب هاب</span>
        <div className="h-6 w-6 bg-primary rounded" />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">المشروع</p>
          <div className="px-3 py-2 bg-muted/50 rounded-md border flex items-center justify-between mb-4">
            <span className="text-sm font-medium">أوبر فيكس</span>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <item.icon className="ml-3 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">واتساب</p>
          <nav className="space-y-1">
            {whatsappMenu.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname.startsWith(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <item.icon className="ml-3 h-4 w-4" />
                  {item.name}
                </Link>
                {item.children && pathname.startsWith(item.href) && (
                  <div className="mr-7 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "block px-3 py-1 text-xs font-medium rounded-md",
                          pathname === child.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {toolsMenu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <item.icon className="ml-3 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            واجهة برمجة التطبيقات
          </p>
          <nav className="space-y-1">
            {apiMenu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <item.icon className="ml-3 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t space-y-4">
        <nav className="space-y-1">
          <Link
            href="/support"
            className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md"
          >
            <HelpCircle className="ml-3 h-4 w-4" /> الدعم
          </Link>
          <Link
            href="/status"
            className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md"
          >
            <Activity className="ml-3 h-4 w-4" /> الحالة
          </Link>
          <Link
            href="/docs"
            className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md"
          >
            <FileJson className="ml-3 h-4 w-4" /> الوثائق
          </Link>
        </nav>
        <div className="flex items-center px-3 py-2">
          <Avatar className="h-8 w-8 ml-3">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium truncate">admin@alazab.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
