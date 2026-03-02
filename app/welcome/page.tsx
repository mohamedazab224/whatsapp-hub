'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getPublicEnv } from '@/lib/env.public'
import { redirect } from 'next/navigation'

export default function WelcomePage() {
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkProject = async () => {
      try {
        const env = getPublicEnv()
        const supabase = createBrowserClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          redirect('/login')
          return
        }

        // Check if user has a project
        const { data: project } = await supabase
          .from('projects')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (project) {
          // User has a project, redirect to inbox
          redirect('/inbox')
        } else {
          // No project, redirect to init
          redirect('/init')
        }
      } catch (error) {
        console.error('Error checking project:', error)
        // If there's an error, redirect to init to let them set up
        redirect('/init')
      } finally {
        setIsChecking(false)
      }
    }

    checkProject()
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">جاري التحقق من مشروعك...</p>
      </div>
    </div>
  )
}
