'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Bell, CalendarClock, FileText, HeartPulse, Shield, UserCog, X, Zap } from 'lucide-react'
import FeedbackDialog from '@/components/FeedbackDialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface SettingsModalProps {
  profile: any
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ profile, isOpen, onClose }: SettingsModalProps) {
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [donationReminders, setDonationReminders] = useState(true)
  const [emergencyAlerts, setEmergencyAlerts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({
    open: false,
    title: '',
    message: '',
    variant: 'info' as 'success' | 'error' | 'info',
  })

  useEffect(() => {
    if (!profile) return
    setEmailNotifications(profile.email_notifications ?? true)
    setDonationReminders(profile.donation_reminders ?? true)
    setEmergencyAlerts(profile.emergency_alerts ?? true)
  }, [profile])

  if (!isOpen) return null

  const savePreferences = async () => {
    if (!supabase || !profile?.id) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        email_notifications: emailNotifications,
        donation_reminders: donationReminders,
        emergency_alerts: emergencyAlerts,
      })
      .eq('id', profile.id)

    setSaving(false)

    if (error) {
      setFeedback({
        open: true,
        title: 'Could not save settings',
        message: error.message,
        variant: 'error',
      })
      return
    }

    setFeedback({
      open: true,
      title: 'Settings saved',
      message: 'Your BloodBridge preferences were updated successfully.',
      variant: 'success',
    })
  }

  const createdAt = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Not available'
  const updatedAt = profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Not available'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="mt-1 text-sm text-gray-600">Manage your account, notifications, privacy, and app preferences.</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-red-600 bg-red-600 text-white transition hover:bg-red-700"
            aria-label="Close settings"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5">
          <section className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2">
              <UserCog className="size-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Account Information</h3>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoRow label="Role" value={profile?.role || 'Unknown'} capitalize />
              <InfoRow label="Email" value={profile?.email || 'Not available'} />
              <InfoRow label="Phone" value={profile?.phone || 'Not added'} />
              <InfoRow label="Account created" value={createdAt} />
              <InfoRow label="Last profile update" value={updatedAt} />
              <InfoRow label="Authentication" value="Supabase Auth" />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="size-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-3">
              <SettingToggle
                icon={<Bell className="size-4" />}
                title="Email notifications"
                description="Receive important account and request updates."
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
              <SettingToggle
                icon={<CalendarClock className="size-4" />}
                title="Donation reminders"
                description="Get reminders about eligibility windows and donation follow-ups."
                checked={donationReminders}
                onChange={setDonationReminders}
              />
              <SettingToggle
                icon={<Zap className="size-4" />}
                title="Emergency alerts"
                description="Receive urgent compatible blood request alerts."
                checked={emergencyAlerts}
                onChange={setEmergencyAlerts}
              />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="size-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Privacy & Security</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Your private records are protected by Supabase Row Level Security and scoped to your authenticated account.</p>
              <p>Role changes are protected. Admin access must be granted from Supabase, not from the app UI.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => window.open('/privacy', '_blank', 'noopener,noreferrer')}
                >
                  <FileText className="size-4" />
                  Privacy Policy
                </Button>
                <Button
                  type="button"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => window.open('/terms', '_blank', 'noopener,noreferrer')}
                >
                  <FileText className="size-4" />
                  Terms
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2">
              <HeartPulse className="size-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">BloodBridge App</h3>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoRow label="Backend" value="Supabase" />
              <InfoRow label="AI assistant" value="Gemini optional" />
              <InfoRow label="Database security" value="RLS enabled" />
              <InfoRow label="Matching" value="Rule-based compatibility" />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={onClose}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={savePreferences}
              disabled={saving}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      <FeedbackDialog
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        variant={feedback.variant}
        onClose={() => setFeedback((current) => ({ ...current, open: false }))}
      />
    </div>
  )
}

function InfoRow({
  label,
  value,
  capitalize = false,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 font-medium text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}

function SettingToggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gray-200 p-3 transition hover:border-red-200 hover:bg-red-50/40">
      <span className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
          {icon}
        </span>
        <span>
          <span className="block text-sm font-medium text-gray-900">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-gray-600">{description}</span>
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-red-600"
      />
    </label>
  )
}
