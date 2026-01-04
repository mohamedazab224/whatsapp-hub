import { Sidebar } from "@/components/dashboard/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, MoreVertical, Send, Paperclip, Smile, CheckCheck, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

const chats = [
  {
    id: 1,
    name: "محمد أحمد",
    phone: "201004006620",
    lastMessage: "شكراً لك، تم استلام الطلب",
    time: "1:24 م",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "سارة محمود",
    phone: "201234567890",
    lastMessage: "متى موعد زيارة فني الصيانة؟",
    time: "11:05 ص",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "شركة النور للتوريدات",
    phone: "201112223334",
    lastMessage: "تم إرسال الفاتورة عبر البريد",
    time: "أمس",
    unread: 0,
    online: false,
  },
]

export default function InboxPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      {/* Chats List Sidebar */}
      <div className="w-80 border-l flex flex-col bg-card">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">صندوق الوارد</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث في المحادثات..." className="pr-10 h-9 bg-muted/50 border-none" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-border/50">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors relative"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={`/.jpg?height=48&width=48&query=${chat.name}`} />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 left-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold truncate">{chat.name}</span>
                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-primary text-white text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center font-bold">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-background">
        {/* Chat Header */}
        <div className="h-16 border-b bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src="/mohamed.jpg" />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-bold">محمد أحمد</h2>
              <p className="text-[10px] text-emerald-500 font-medium">نشط الآن</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <span className="bg-card px-3 py-1 rounded-lg text-[10px] text-muted-foreground border shadow-sm uppercase tracking-wider">
                اليوم
              </span>
            </div>

            <div className="flex justify-start">
              <div className="bg-card border p-3 rounded-2xl rounded-tr-none max-w-[70%] shadow-sm">
                <p className="text-sm">السلام عليكم، هل يمكنني الاستفسار عن حالة طلب الصيانة الخاص بي؟</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] text-muted-foreground">1:20 م</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-primary text-white p-3 rounded-2xl rounded-tl-none max-w-[70%] shadow-sm">
                <p className="text-sm">
                  وعليكم السلام يا أستاذ محمد. طلبك حالياً قيد التنفيذ، وسوف يصلك الفني خلال ساعتين من الآن.
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] text-white/70">1:22 م</span>
                  <CheckCheck className="h-3 w-3 text-white/70" />
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-card border p-3 rounded-2xl rounded-tr-none max-w-[70%] shadow-sm">
                <p className="text-sm">شكراً لك، تم استلام الطلب</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] text-muted-foreground">1:24 م</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 bg-card border-t">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
              <Smile className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="اكتب رسالة..."
                className="bg-muted/50 border-none h-11 pr-4 pl-4 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <Button size="icon" className="h-10 w-10 bg-primary hover:bg-primary/90 rounded-full">
              <Send className="h-5 w-5 rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
