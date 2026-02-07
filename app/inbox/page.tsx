"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, MoreVertical, Send, Paperclip, CheckCheck, User, Pin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useContactsRealtime, useMessages } from "@/hooks/use-data"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InboxPage() {
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const { contacts, isLoading: contactsLoading } = useContactsRealtime()
  const { messages, mutate: mutateMessages } = useMessages({ 
    contact_id: selectedContact?.id 
  })

  // Auto-select first contact
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0])
    }
  }, [contacts, selectedContact])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContact) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          body: messageText,
          type: 'text',
        }),
      })

      if (response.ok) {
        setMessageText("")
        mutateMessages()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-right" dir="rtl">
      <Sidebar />

      {/* Contacts List */}
      <div className="w-80 border-l flex flex-col bg-card">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">صندوق الوارد</h1>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث عن أرقام الهواتف..." 
              className="pr-10 h-9 bg-muted/50 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {contactsLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              لا توجد محادثات
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {contacts.map((contact: any) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={contact.profile_picture_url} />
                      <AvatarFallback>
                        {contact.name?.[0] || <User className="h-6 w-6 text-muted-foreground" />}
                      </AvatarFallback>
                    </Avatar>
                    {contact.status === 'active' && (
                      <div className="absolute bottom-0 left-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold truncate">{contact.name || contact.wa_id}</span>
                      {contact.last_message_at && (
                        <span className="text-[10px] text-muted-foreground">
                          منذ {formatDistanceToNow(new Date(contact.last_message_at), { locale: ar, addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.wa_id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-background">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b bg-card px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={selectedContact.profile_picture_url} />
                  <AvatarFallback>
                    {selectedContact.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-bold">{selectedContact.name || selectedContact.wa_id}</h2>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedContact.status === 'active' ? 'نشط' : 'غير متصل'}
                  </p>
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
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    لا توجد رسائل. ابدأ محادثة جديدة!
                  </div>
                ) : (
                  messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-[70%] shadow-sm ${
                          message.direction === 'outbound'
                            ? 'bg-primary text-white rounded-tl-none'
                            : 'bg-card border rounded-tr-none'
                        }`}
                      >
                        {message.media_files?.[0] && (
                          <img
                            src={message.media_files[0].public_url}
                            alt="attachment"
                            className="rounded-lg mb-2 max-w-full"
                          />
                        )}
                        <p className="text-sm">{message.body}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span
                            className={`text-[9px] ${
                              message.direction === 'outbound' ? 'text-white/70' : 'text-muted-foreground'
                            }`}
                          >
                            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('ar', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : ''}
                          </span>
                          {message.direction === 'outbound' && (
                            <CheckCheck className="h-3 w-3 text-white/70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 bg-card border-t">
              <div className="max-w-4xl mx-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="اكتب رسالة..."
                    className="bg-muted/50 border-none h-11 pr-4 pl-4"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                </div>
                <Button 
                  size="icon" 
                  className="h-10 w-10 bg-primary hover:bg-primary/90 rounded-full"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send className="h-5 w-5 rotate-180" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            اختر محادثة لبدء المراسلة
          </div>
        )}
      </div>

      {/* Contact Info Panel */}
      {selectedContact && (
        <div className="w-80 border-r bg-card p-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">معلومات</TabsTrigger>
              <TabsTrigger value="details" className="flex-1">معلومات</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-6 mt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={selectedContact.profile_picture_url} />
                  <AvatarFallback className="text-2xl">
                    {selectedContact.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{selectedContact.name || selectedContact.wa_id}</h3>
                <p className="text-sm text-muted-foreground font-mono">{selectedContact.wa_id}</p>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  + إضافة ملاحظة
                </Button>
                <Button variant="outline" className="w-full">
                  عرض المحادثات
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">التعيين</span>
                  </div>
                  <p className="text-sm text-muted-foreground mr-6">لم يتم تعريفيه</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">الحالة</span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 mr-6">
                    نشط
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">النشاط</span>
                  </div>
                  <div className="text-sm text-muted-foreground mr-6 space-y-1">
                    {selectedContact.last_message_at && (
                      <p>
                        آخر مرة نشاط: منذ{' '}
                        {formatDistanceToNow(new Date(selectedContact.last_message_at), {
                          locale: ar,
                          addSuffix: false,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
