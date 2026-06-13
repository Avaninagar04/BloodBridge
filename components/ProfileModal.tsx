'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Mail, ShieldCheck, User, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface ProfileModalProps {
  profile: any
  user: any
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ profile, user, isOpen, onClose }: ProfileModalProps) {
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  useEffect(() => {
    if (!isOpen) return
    setFirstName(profile?.first_name || '')
    setLastName(profile?.last_name || '')
    setPhone(profile?.phone || '')
    setMessage('')
  }, [isOpen, profile])

  const handleSave = async () => {
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedFirstName || !trimmedLastName) {
      setMessageType('error')
      setMessage('First name and last name are required.')
      return
    }

    if (trimmedPhone && !/^[+\d][\d\s()-]{6,}$/.test(trimmedPhone)) {
      setMessageType('error')
      setMessage('Enter a valid phone number.')
      return
    }

    setLoading(true)
    try {
      if (!supabase) return
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          phone: trimmedPhone || null,
        })
        .eq('id', user.id)

      if (error) throw error
      setMessageType('success')
      setMessage('Profile updated successfully.')
      setTimeout(onClose, 1200)
    } catch {
      setMessageType('error')
      setMessage('Error updating profile.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const createdAt = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Not available'
  const fullName = [firstName || profile?.first_name, lastName || profile?.last_name].filter(Boolean).join(' ') || 'BloodBridge User'
  const initials = `${(firstName || profile?.first_name || 'B').charAt(0)}${(lastName || profile?.last_name || 'U').charAt(0)}`.toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white shadow-sm">
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                <p className="mt-1 text-sm text-gray-600">{fullName}</p>
                <span className="mt-2 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold capitalize text-red-700">
                  {profile?.role || 'user'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-red-600 bg-red-600 text-white transition hover:bg-red-700"
              aria-label="Close profile"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <section className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2">
              <User className="size-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="First Name"
                value={firstName}
                onChange={setFirstName}
                placeholder="Enter first name"
                required
              />
              <ProfileField
                label="Last Name"
                value={lastName}
                onChange={setLastName}
                placeholder="Enter last name"
                required
              />
              <ProfileField
                label="Phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+91 98765 43210"
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600">
                  <Mail className="size-4 text-gray-500" />
                  <span className="min-w-0 truncate">{user?.email || 'Not available'}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <ProfileStat icon={<ShieldCheck className="size-4" />} label="Role" value={profile?.role || 'User'} capitalize />
            <ProfileStat icon={<CalendarDays className="size-4" />} label="Joined" value={createdAt} />
            <ProfileStat icon={<CheckCircle2 className="size-4" />} label="Auth" value="Verified" />
          </section>

          {message && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                messageType === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              onClick={onClose}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-red-600 px-6 text-white hover:bg-red-700">
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
      />
    </div>
  )
}

function ProfileStat({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-red-600">{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 font-semibold text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}
