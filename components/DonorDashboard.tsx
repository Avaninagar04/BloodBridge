'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarClock, Crosshair, Droplet, HeartHandshake, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'
import { assessDonorEligibility } from '@/lib/ai/health'
import { scoreDonorMatch } from '@/lib/blood/matching'
import { createClient } from '@/lib/supabase/client'
import { isMissingSchemaColumn, withoutOptionalColumns } from '@/lib/supabase/schema-fallback'
import { Button } from '@/components/ui/button'
import FeedbackDialog from '@/components/FeedbackDialog'

export default function DonorDashboard({ user, profile }: any) {
  const [donor, setDonor] = useState<any>(null)
  const [bloodRequests, setBloodRequests] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [scheduleByRequest, setScheduleByRequest] = useState<Record<string, string>>({})
  const [locating, setLocating] = useState(false)
  const [feedback, setFeedback] = useState<{
    open: boolean
    title: string
    message: string
    variant: 'success' | 'error' | 'info'
  }>({
    open: false,
    title: '',
    message: '',
    variant: 'info',
  })
  const [formData, setFormData] = useState({
    blood_type: 'O+',
    age: '',
    weight: '',
    health_conditions: '',
    medications: '',
    address: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
  })
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  const fetchDonorData = useMemo(() => async () => {
    if (!supabase) return
    const { data: donorData } = await supabase
      .from('donors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: requestsData } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('status', 'open')
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12)

    if (donorData) {
      setDonor(donorData)
      setFormData({
        blood_type: donorData.blood_type || 'O+',
        age: donorData.age?.toString() || '',
        weight: donorData.weight?.toString() || '',
        health_conditions: donorData.health_conditions || '',
        medications: donorData.medications || '',
        address: donorData.address || '',
        city: donorData.city || '',
        state: donorData.state || '',
        country: donorData.country || '',
        latitude: donorData.latitude?.toString() || '',
        longitude: donorData.longitude?.toString() || '',
      })

      setBloodRequests(
        (requestsData || [])
          .map((request: any) => ({ ...request, match: scoreDonorMatch(donorData as any, request as any) }))
          .filter((request: any) => request.match.compatible)
          .sort((a: any, b: any) => b.match.score - a.match.score)
      )

      const { data: donationData } = await supabase
        .from('donations')
        .select('id, blood_request_id, units_donated, status, scheduled_at, donation_date, created_at')
        .eq('donor_id', donorData.id)
        .order('created_at', { ascending: false })
        .limit(8)

      setDonations(donationData || [])
    } else {
      setDonor(null)
      setBloodRequests(requestsData || [])
      setDonations([])
    }
  }, [supabase, user.id])

  useEffect(() => {
    fetchDonorData()
  }, [fetchDonorData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    const age = formData.age ? parseInt(formData.age) : null
    const weight = formData.weight ? parseFloat(formData.weight) : null
    const eligibility = assessDonorEligibility({
      age,
      weightKg: weight,
      healthConditions: formData.health_conditions,
      medications: formData.medications,
    })

    if (!eligibility.eligible) {
      setFeedback({
        open: true,
        title: 'Eligibility check',
        message: eligibility.recommendation,
        variant: 'error',
      })
      return
    }

    const payload = {
      user_id: user.id,
      blood_type: formData.blood_type,
      health_conditions: formData.health_conditions,
      medications: formData.medications,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      age,
      weight,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      is_available: donor?.is_available ?? true,
    }

    let { data: savedDonor, error } = await supabase
      .from('donors')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error && isMissingSchemaColumn(error)) {
      const retryPayload = withoutOptionalColumns(payload, ['latitude', 'longitude'])
      const retry = await supabase
        .from('donors')
        .upsert(retryPayload, { onConflict: 'user_id' })
        .select()
        .single()
      savedDonor = retry.data
      error = retry.error
    }

    if (error) {
      setFeedback({
        open: true,
        title: 'Could not save profile',
        message: error.message,
        variant: 'error',
      })
      return
    }

    setDonor(savedDonor)
    setShowForm(false)
    setFeedback({
      open: true,
      title: 'Donor profile saved',
      message: 'Your donor details and eligibility information were updated.',
      variant: 'success',
    })
    fetchDonorData()
  }

  const handleAvailabilityToggle = async () => {
    if (!donor || !supabase) return
    const nextAvailability = !donor.is_available

    const { error } = await supabase
      .from('donors')
      .update({ is_available: nextAvailability })
      .eq('id', donor.id)

    if (error) {
      setFeedback({
        open: true,
        title: 'Could not update availability',
        message: error.message,
        variant: 'error',
      })
      return
    }

    setDonor({ ...donor, is_available: nextAvailability })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFeedback({
        open: true,
        title: 'Location unavailable',
        message: 'Your browser does not support GPS location.',
        variant: 'error',
      })
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }))
        setLocating(false)
      },
      () => {
        setFeedback({
          open: true,
          title: 'Location permission needed',
          message: 'Allow location access or enter your city/state manually.',
          variant: 'error',
        })
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleDonate = async (requestId: string) => {
    if (!donor || !supabase) return

    const { data: existingOffer } = await supabase
      .from('donations')
      .select('id')
      .eq('donor_id', donor.id)
      .eq('blood_request_id', requestId)
      .maybeSingle()

    if (existingOffer) {
      setFeedback({
        open: true,
        title: 'Offer already registered',
        message: 'You have already offered to donate for this request.',
        variant: 'info',
      })
      return
    }

    const donationPayload = {
      donor_id: donor.id,
      blood_request_id: requestId,
      units_donated: 1,
      scheduled_at: scheduleByRequest[requestId] ? new Date(scheduleByRequest[requestId]).toISOString() : null,
      donation_date: scheduleByRequest[requestId] ? new Date(scheduleByRequest[requestId]).toISOString() : new Date().toISOString(),
      status: 'pending',
    }

    let { error } = await supabase
      .from('donations')
      .insert([donationPayload])

    if (error && isMissingSchemaColumn(error)) {
      const retryPayload = withoutOptionalColumns(donationPayload, ['scheduled_at'])
      const retry = await supabase
        .from('donations')
        .insert([retryPayload])
      error = retry.error
    }

    if (error) {
      setFeedback({
        open: true,
        title: 'Could not register donation',
        message: error.message,
        variant: 'error',
      })
      return
    }

    setFeedback({
      open: true,
      title: 'Donation interest registered',
      message: scheduleByRequest[requestId]
        ? 'Your scheduled offer was saved and the recipient has been notified.'
        : 'Your offer was saved and the recipient has been notified.',
      variant: 'success',
    })
    fetchDonorData()
  }

  const eligibilityPreview = donor
    ? assessDonorEligibility({
        age: donor.age,
        weightKg: donor.weight,
        healthConditions: donor.health_conditions,
        medications: donor.medications,
      })
    : null

  return (
    <div className="space-y-7">
      <div className="rounded-lg border border-gray-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {profile.first_name}!</h2>
          <p className="text-gray-600 mt-1">Your donation profile, AI matches, and donation activity</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {donor && (
            <Button
              type="button"
              onClick={handleAvailabilityToggle}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {donor.is_available ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
              {donor.is_available ? 'Available' : 'Unavailable'}
            </Button>
          )}
          <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
            {donor ? 'Update Donor Profile' : 'Complete Donor Profile'}
          </Button>
        </div>
      </div>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <h3 className="text-xl font-semibold mb-4">{donor ? 'Update Your Donor Profile' : 'Create Your Donor Profile'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <DashboardField label="Blood Type">
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </DashboardField>
              <DashboardInput label="Age" type="number" value={formData.age} onChange={(value) => setFormData({...formData, age: value})} required />
              <DashboardInput label="Weight (kg)" type="number" value={formData.weight} onChange={(value) => setFormData({...formData, weight: value})} required />
              <DashboardInput label="Area / Locality" value={formData.address} onChange={(value) => setFormData({...formData, address: value})} placeholder="MP Nagar, Saket, near city hospital..." />
              <DashboardInput label="City" value={formData.city} onChange={(value) => setFormData({...formData, city: value})} placeholder="Bhopal" />
              <DashboardInput label="State" value={formData.state} onChange={(value) => setFormData({...formData, state: value})} placeholder="Madhya Pradesh" />
              <DashboardInput label="Country" value={formData.country} onChange={(value) => setFormData({...formData, country: value})} placeholder="India" />
              <DashboardInput label="Medications" value={formData.medications} onChange={(value) => setFormData({...formData, medications: value})} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Conditions</label>
                <textarea
                  value={formData.health_conditions}
                  onChange={(e) => setFormData({...formData, health_conditions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Any relevant health conditions..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleUseCurrentLocation} className="bg-red-600 text-white hover:bg-red-700">
                <Crosshair className="size-4" />
                {locating ? 'Finding nearby location...' : formData.latitude && formData.longitude ? 'GPS Matching Enabled' : 'Use GPS for Nearby Matching'}
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">Save Profile</Button>
              <Button type="button" onClick={() => setShowForm(false)} className="bg-red-600 text-white hover:bg-red-700">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {donor && (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard label="Blood Type" value={donor.blood_type} icon={<Droplet className="size-5" />} color="text-red-600" />
            <StatCard label="Total Donations" value={donor.total_donations ?? 0} icon={<HeartHandshake className="size-5" />} color="text-blue-600" />
            <StatCard label="Matchable Requests" value={bloodRequests.length} icon={<Activity className="size-5" />} color="text-gray-900" />
            <StatCard label="Status" value={donor.is_available ? 'Available' : 'Not Available'} icon={<ShieldCheck className="size-5" />} color={donor.is_available ? 'text-green-600' : 'text-gray-600'} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Profile Summary</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoLine label="Age" value={donor.age || 'Not set'} />
                <InfoLine label="Weight" value={donor.weight ? `${donor.weight} kg` : 'Not set'} />
                <InfoLine label="Location" value={formatReadableLocation(donor) || 'Not set'} />
                <InfoLine label="Nearby Matching" value={donor.latitude && donor.longitude ? 'Enabled' : 'City based'} />
                <InfoLine label="Last Donation" value={donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'No completed donation yet'} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Eligibility</h3>
              <p className={`text-2xl font-bold ${eligibilityPreview?.eligible ? 'text-green-600' : 'text-red-600'}`}>
                {eligibilityPreview?.score ?? 0}/100
              </p>
              <p className="mt-2 text-sm text-gray-600">{eligibilityPreview?.recommendation}</p>
            </div>
          </div>
        </>
      )}

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Available Blood Requests</h3>
        <div className="grid gap-4">
          {bloodRequests.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="text-gray-600">No compatible open blood requests at the moment</p>
            </div>
          ) : (
            bloodRequests.map((request: any) => (
              <div key={request.id} className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">{request.blood_type}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        request.urgency_level === 'critical' ? 'bg-red-100 text-red-700' :
                        request.urgency_level === 'urgent' ? 'bg-red-50 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {request.urgency_level.charAt(0).toUpperCase() + request.urgency_level.slice(1)}
                      </span>
                      {request.match && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          {request.match.score}% match
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">Units needed: {request.units_requested}</p>
                    <p className="text-sm text-gray-500">Posted: {new Date(request.posted_date || request.created_at).toLocaleDateString()}</p>
                    {request.needed_by_date && (
                      <p className="text-sm text-gray-500">Needed by: {new Date(request.needed_by_date).toLocaleDateString()}</p>
                    )}
                    {request.match?.distance !== 999 && (
                      <p className="text-sm text-gray-500">Distance: about {request.match.distance} miles</p>
                    )}
                  </div>
                  {donor && (
                    <div className="min-w-56 space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <CalendarClock className="size-4 text-red-600" />
                        Schedule donation
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduleByRequest[request.id] || ''}
                        onChange={(event) => setScheduleByRequest((current) => ({ ...current, [request.id]: event.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                      <Button onClick={() => handleDonate(request.id)} className="w-full bg-red-600 hover:bg-red-700">
                        I Can Donate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {donor && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Donation Offers</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            {donations.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No donation offers yet</div>
            ) : (
              donations.map((donation) => (
                <div key={donation.id} className="flex flex-col gap-2 border-b border-blue-100 bg-blue-50 p-4 transition-all duration-200 last:border-b-0 hover:bg-blue-100 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Offer for request #{donation.blood_request_id?.slice(0, 8) || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Units offered: {donation.units_donated}</p>
                    <p className="text-sm text-gray-600">
                      Scheduled: {donation.scheduled_at ? new Date(donation.scheduled_at).toLocaleString() : 'Not scheduled'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold capitalize text-blue-600">{donation.status}</p>
                    <p className="text-xs text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const normalizedLabel = label.toLowerCase()
  const colorClasses =
    normalizedLabel.includes('blood') ? 'border-red-200 bg-red-50' :
    normalizedLabel.includes('donation') ? 'border-blue-200 bg-blue-50' :
    normalizedLabel.includes('request') ? 'border-blue-200 bg-blue-50' :
    normalizedLabel.includes('status') ? 'border-green-200 bg-green-50' :
    'border-gray-200 bg-white'

  return (
    <div className={`min-h-32 rounded-lg border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${colorClasses}`}>
      <div className="mb-3 flex items-center justify-between text-gray-500">
        <p className="text-sm font-semibold">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string | number }) {
  const normalizedLabel = label.toLowerCase()
  const color =
    normalizedLabel.includes('last') ? 'red' :
    normalizedLabel.includes('location') ? 'blue' :
    'gray'
  const colorClasses = {
    red: 'border-red-200 bg-red-50 text-red-950 [&_.info-label]:text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-950 [&_.info-label]:text-blue-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-950 [&_.info-label]:text-gray-600',
  }[color]

  return (
    <div className={`rounded-lg border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${colorClasses}`}>
      <p className="info-label text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

function DashboardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function DashboardInput({
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
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <DashboardField label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        required={required}
      />
    </DashboardField>
  )
}

function formatReadableLocation(record: any) {
  return [record?.address, record?.city, record?.state, record?.country].filter(Boolean).join(', ')
}
