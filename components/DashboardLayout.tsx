'use client'

import React, { useState } from 'react'
import { LogOut, Settings, User } from 'lucide-react'
import NotificationCenter from '@/components/NotificationCenter'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  title: string
  children: React.ReactNode
  userName?: string
  userRole?: string
  onLogout?: () => void
  quickActions?: React.ReactNode
  profile?: any
  user?: any
  ProfileModal?: React.ComponentType<any>
  SettingsModal?: React.ComponentType<any>
}

export function DashboardLayout({
  title: _title,
  children,
  userName = 'User',
  userRole = 'donor',
  onLogout,
  quickActions,
  profile,
  user,
  ProfileModal,
  SettingsModal,
}: DashboardLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const headerButtonClass =
    'border-red-200 bg-red-50 font-semibold text-red-800 hover:border-red-300 hover:bg-red-100 hover:text-red-900'

  const logoutButtonClass =
    'ml-2 border-red-200 bg-red-50 font-semibold text-red-800 hover:border-red-300 hover:bg-red-100 hover:text-red-900'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/40">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-red-600 shadow-sm bb-soft-pulse"></div>
              <h1 className="text-2xl font-bold text-gray-900">BloodBridge</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <NotificationCenter />
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-600 capitalize">{userRole}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileOpen(true)}
                className={headerButtonClass}
              >
                <User className="size-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className={headerButtonClass}
              >
                <Settings className="size-4" />
                Settings
              </Button>
              {onLogout && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className={logoutButtonClass}
                >
                  <LogOut className="size-4" />
                  Log Out
                </Button>
              )}
            </div>
          </div>
          {quickActions && <div className="mt-4 flex flex-wrap gap-2">{quickActions}</div>}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bb-fade-up">
        {children}
      </main>

      {ProfileModal && <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} profile={profile} user={user} />}
      {SettingsModal && <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} profile={profile} />}
    </div>
  )
}
