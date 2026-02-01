"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextPath = searchParams.get("next") || "/"

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    router.replace(nextPath)
  }

  const handleGoogleLogin = async () => {
    setErrorMessage(null)
    const supabase = createSupabaseBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })

    if (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
        <p className="text-sm text-muted-foreground">مرحبًا بعودتك! أدخل بياناتك للمتابعة.</p>
      </div>

      <form className="space-y-4" onSubmit={handleEmailLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">أو</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
        تسجيل الدخول عبر Google
      </Button>
    </div>
  )
}
