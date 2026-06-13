'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import AdminDashboard from '@/components/AdminDashboard'
import AIAssistant from '@/components/AIAssistant'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profileData || profileData.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quickActions = (
    <>
      <Link href="/blood-compatibility">
        <Button size="sm" className="border border-red-200 bg-red-50 text-red-800 hover:border-red-300 hover:bg-red-100 hover:text-red-900">🧪 Compatibility</Button>
      </Link>
      <Link href="/emergency">
        <Button size="sm">🚨 Emergency</Button>
      </Link>
    </>
  )

  return (
    <div>
      <DashboardLayout
        title="Admin Dashboard"
        userName={profile?.first_name}
        userRole={profile?.role}
        onLogout={handleLogout}
        quickActions={quickActions}
      >
        <div className="space-y-8">
          <AdminDashboard user={user} profile={profile} />
        </div>
      </DashboardLayout>

      <AIAssistant />
    </div>
  )
}
