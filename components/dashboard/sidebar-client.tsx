"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PlusCircle,
  Inbox,
  Smartphone,
  Database,
  LogOut,
  FileText,
  Send,
  BarChart3,
  Share2,
  Terminal,
  Webhook,
  Key,
  Settings,
  HelpCircle,
  Activity,
  FileJson,
  ChevronDown,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo, useState } from "react"

type Project = {
  id: string
  name: string
}

type NumberRecord = {
  id: string
  project_id: string
}

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

const systemMenu = [
  { name: "إعدادات الذكاء الاصطناعي", href: "/settings/ai", icon: Terminal },
  { name: "إعدادات التكامل", href: "/settings/integrations", icon: Settings },
  { name: "إعدادات المشروع", href: "/settings/project", icon: Settings },
]

export function SidebarClient({ projects, numbers }: { projects: Project[]; numbers: NumberRecord[] }) {
  const pathname = usePathname()
  const [currentProject, setCurrentProject] = useState(projects[0] || { id: "", name: "بدون مشروع" })

  const numbersByProject = useMemo(() => {
    const counts = new Map<string, number>()
    for (const number of numbers) {
      counts.set(number.project_id, (counts.get(number.project_id) || 0) + 1)
    }
    return counts
  }, [numbers])

  return (
    <div className="flex h-full w-64 flex-col border-l bg-card">
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <span className="text-xl font-bold">العزب هاب</span>
        <div className="h-6 w-6 bg-emerald-500 rounded shadow-sm shadow-emerald-500/50" />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">المشروع</p>

          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <button className="w-full px-3 py-2 bg-muted/50 hover:bg-muted rounded-md border flex items-center justify-between mb-4 transition-colors">
                <span className="text-sm font-medium">{currentProject.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>اختر المشروع</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span>{project.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {numbersByProject.get(project.id) || 0} رقم
                    </span>
                  </div>
                  {currentProject.id === project.id && <Settings className="h-3 w-3 text-emerald-500" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-emerald-500 focus:text-emerald-600 focus:bg-emerald-50">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء مشروع جديد
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
            {systemMenu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "text-muted-foreground hover:bg-accent",
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
