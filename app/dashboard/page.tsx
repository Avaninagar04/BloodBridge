'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  useEffect(() => {
    const getUser = async () => {
      try {
        if (!supabase) return
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }

        // Get existing profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          // Route based on existing profile
          if (profileData.role === 'donor') {
            router.push('/donor/dashboard')
          } else if (profileData.role === 'recipient') {
            router.push('/recipient/dashboard')
          } else if (profileData.role === 'admin') {
            router.push('/admin/dashboard')
          }
        } else {
          // Wait a moment for the trigger to create the profile
          setTimeout(async () => {
            const { data: newProfileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (newProfileData) {
              const role = newProfileData.role || 'donor'
              if (role === 'donor') {
                router.push('/donor/dashboard')
              } else if (role === 'recipient') {
                router.push('/recipient/dashboard')
              } else if (role === 'admin') {
                router.push('/admin/dashboard')
              }
            } else {
              console.error('[v0] Profile not found even after trigger')
              router.push('/auth/login')
            }
          }, 1000)
        }
      } catch (err) {
        console.error('[v0] Error in getUser:', err)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirect based on role happens in useEffect, this shouldn't render
  return null
}
