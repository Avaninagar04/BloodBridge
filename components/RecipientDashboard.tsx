'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, ClipboardList, Crosshair, Droplet, HeartHandshake, Hospital, Timer } from 'lucide-react'
import { scoreEmergencyPriority } from '@/lib/blood/matching'
import { createClient } from '@/lib/supabase/client'
import { isMissingSchemaColumn, withoutOptionalColumns } from '@/lib/supabase/schema-fallback'
import { Button } from '@/components/ui/button'
import FeedbackDialog from '@/components/FeedbackDialog'

export default function RecipientDashboard({ user, profile }: any) {
  const [recipient, setRecipient] = useState<any>(null)
  const [bloodRequest, setBloodRequest] = useState<any>(null)
  const [requestHistory, setRequestHistory] = useState<any[]>([])
  const [donationOffers, setDonationOffers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
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
    medical_condition: '',
    hospital_name: '',
    location_area: '',
    city: '',
    state: '',
    doctor_name: '',
    doctor_contact: '',
    urgency_level: 'normal',
    units_needed: '1',
    latitude: '',
    longitude: '',
  })
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  const fetchRecipientData = useMemo(() => async () => {
    if (!supabase) return
    const { data: recipientData } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!recipientData) {
      setRecipient(null)
      setBloodRequest(null)
      setRequestHistory([])
      setDonationOffers([])
      return
    }

    setRecipient(recipientData)
    setFormData({
      blood_type: recipientData.blood_type || 'O+',
      age: recipientData.age?.toString() || '',
      medical_condition: recipientData.medical_condition || '',
      hospital_name: recipientData.hospital_name || '',
      location_area: recipientData.location_area || '',
      city: recipientData.city || '',
      state: recipientData.state || '',
      doctor_name: recipientData.doctor_name || '',
      doctor_contact: recipientData.doctor_contact || '',
      urgency_level: recipientData.urgency_level || 'normal',
      units_needed: recipientData.units_needed?.toString() || '1',
      latitude: recipientData.latitude?.toString() || '',
      longitude: recipientData.longitude?.toString() || '',
    })

    const { data: requestsData } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('recipient_id', recipientData.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const requests = requestsData || []
    setRequestHistory(requests)
    setBloodRequest(requests.find((request) => request.status === 'open') || requests[0] || null)

    const requestIds = requests.map((request) => request.id)
    if (requestIds.length > 0) {
      const { data: offersData } = await supabase
        .from('donations')
        .select('id, blood_request_id, units_donated, status, scheduled_at, donation_date, created_at')
        .in('blood_request_id', requestIds)
        .order('created_at', { ascending: false })
        .limit(12)

      setDonationOffers(offersData || [])
    } else {
      setDonationOffers([])
    }
  }, [supabase, user.id])

  useEffect(() => {
    fetchRecipientData()
  }, [fetchRecipientData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    const unitsRequested = parseInt(formData.units_needed)
    const recipientPayload = {
      user_id: user.id,
      blood_type: formData.blood_type,
      medical_condition: formData.medical_condition,
      hospital_name: formData.hospital_name,
      location_area: formData.location_area,
      city: formData.city,
      state: formData.state,
      doctor_name: formData.doctor_name,
      doctor_contact: formData.doctor_contact,
      urgency_level: formData.urgency_level,
      age: formData.age ? parseInt(formData.age) : null,
      units_needed: unitsRequested,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    }

    let { data: savedRecipient, error: recipientError } = await supabase
      .from('recipients')
      .upsert(recipientPayload, { onConflict: 'user_id' })
      .select()
      .single()

    if (recipientError && isMissingSchemaColumn(recipientError)) {
      const retryPayload = withoutOptionalColumns(recipientPayload, ['latitude', 'longitude', 'location_area', 'city', 'state'])
      const retry = await supabase
        .from('recipients')
        .upsert(retryPayload, { onConflict: 'user_id' })
        .select()
        .single()
      savedRecipient = retry.data
      recipientError = retry.error
    }

    if (recipientError) {
      setFeedback({
        open: true,
        title: 'Could not save recipient profile',
        message: recipientError.message,
        variant: 'error',
      })
      return
    }

    const requestPayload = {
      recipient_id: savedRecipient.id,
      blood_type: formData.blood_type,
      units_requested: unitsRequested,
      urgency_level: formData.urgency_level,
      location_area: formData.location_area,
      city: formData.city,
      state: formData.state,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      priority_score: scoreEmergencyPriority({
        urgency: formData.urgency_level as any,
        unitsNeeded: unitsRequested,
        neededWithinHours: formData.urgency_level === 'critical' ? 1 : formData.urgency_level === 'urgent' ? 6 : 24,
      }),
      status: 'open',
    }

    let { data: newRequest, error: requestError } = await supabase
      .from('blood_requests')
      .insert([requestPayload])
      .select()
      .single()

    if (requestError && isMissingSchemaColumn(requestError)) {
      const retryPayload = withoutOptionalColumns(requestPayload, ['latitude', 'longitude', 'location_area', 'city', 'state'])
      const retry = await supabase
        .from('blood_requests')
        .insert([retryPayload])
        .select()
        .single()
      newRequest = retry.data
      requestError = retry.error
    }

    if (requestError) {
      setFeedback({
        open: true,
        title: 'Could not create blood request',
        message: requestError.message,
        variant: 'error',
      })
      return
    }

    setRecipient(savedRecipient)
    setBloodRequest(newRequest)
    setShowForm(false)
    setFeedback({
      open: true,
      title: 'Blood request created',
      message: 'Compatible donors will be matched and notified automatically.',
      variant: 'success',
    })
    fetchRecipientData()
  }

  const handleUpdateRequest = async (requestId: string, status: string) => {
    if (!supabase) return

    const { error } = await supabase
      .from('blood_requests')
      .update({ status })
      .eq('id', requestId)

    if (error) {
      setFeedback({
        open: true,
        title: 'Could not update request',
        message: error.message,
        variant: 'error',
      })
      return
    }

    setFeedback({
      open: true,
      title: 'Request updated',
      message: `Blood request status changed to ${status}.`,
      variant: 'success',
    })
    fetchRecipientData()
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
                  message: 'Allow location access for nearby matching, or enter area and city manually.',
          variant: 'error',
        })
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const pendingOffers = donationOffers.filter((offer) => offer.status === 'pending').length
  const totalRequested = requestHistory.reduce((sum, request) => sum + (request.units_requested || 0), 0)
  const totalFulfilled = requestHistory.reduce((sum, request) => sum + (request.units_fulfilled || 0), 0)
  const activeProgress = bloodRequest?.units_requested
    ? Math.round(((bloodRequest.units_fulfilled || 0) / bloodRequest.units_requested) * 100)
    : 0

  return (
    <div className="space-y-7">
      <div className="rounded-lg border border-gray-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {profile.first_name}!</h2>
          <p className="text-gray-600 mt-1">Your blood requests, donation offers, and request progress</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
          {recipient ? 'Create New Request' : 'Create Blood Request'}
        </Button>
      </div>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <h3 className="text-xl font-semibold mb-4">Create Blood Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <DashboardField label="Blood Type Needed">
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
              <DashboardInput label="Units Needed" type="number" value={formData.units_needed} onChange={(value) => setFormData({...formData, units_needed: value})} required />
              <DashboardField label="Urgency Level">
                <select
                  value={formData.urgency_level}
                  onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </DashboardField>
              <DashboardInput label="Hospital Name" value={formData.hospital_name} onChange={(value) => setFormData({...formData, hospital_name: value})} required />
              <DashboardInput label="Area / Locality" value={formData.location_area} onChange={(value) => setFormData({...formData, location_area: value})} placeholder="Near AIIMS, MP Nagar, etc." />
              <DashboardInput label="City" value={formData.city} onChange={(value) => setFormData({...formData, city: value})} placeholder="Bhopal" required />
              <DashboardInput label="State" value={formData.state} onChange={(value) => setFormData({...formData, state: value})} placeholder="Madhya Pradesh" />
              <DashboardInput label="Doctor Name" value={formData.doctor_name} onChange={(value) => setFormData({...formData, doctor_name: value})} required />
              <DashboardInput label="Doctor Contact" value={formData.doctor_contact} onChange={(value) => setFormData({...formData, doctor_contact: value})} required />
              <DashboardInput label="Age" type="number" value={formData.age} onChange={(value) => setFormData({...formData, age: value})} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition</label>
                <textarea
                  value={formData.medical_condition}
                  onChange={(e) => setFormData({...formData, medical_condition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Briefly describe the medical condition..."
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleUseCurrentLocation} className="bg-red-600 text-white hover:bg-red-700">
                <Crosshair className="size-4" />
                {locating ? 'Finding nearby location...' : formData.latitude && formData.longitude ? 'GPS Matching Enabled' : 'Use GPS for Nearby Matching'}
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">Create Request</Button>
              <Button type="button" onClick={() => setShowForm(false)} className="bg-red-600 text-white hover:bg-red-700">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {recipient && (
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Blood Type" value={recipient.blood_type} icon={<Droplet className="size-5" />} color="text-red-600" />
          <StatCard label="Open Requests" value={requestHistory.filter((request) => request.status === 'open').length} icon={<ClipboardList className="size-5" />} color="text-blue-600" />
          <StatCard label="Pending Offers" value={pendingOffers} icon={<HeartHandshake className="size-5" />} color="text-green-600" />
          <StatCard label="Units Progress" value={`${totalFulfilled}/${totalRequested || 0}`} icon={<Activity className="size-5" />} color="text-gray-900" />
        </div>
      )}

      {bloodRequest && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Active Blood Request</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoLine label="Blood Type" value={bloodRequest.blood_type} />
                <InfoLine label="Urgency" value={bloodRequest.urgency_level} capitalize />
                <InfoLine label="Units Needed" value={bloodRequest.units_requested} />
                <InfoLine label="Status" value={bloodRequest.status} capitalize />
                <InfoLine label="Location" value={formatReadableLocation(bloodRequest) || formatReadableLocation(recipient) || 'Not set'} />
                <InfoLine label="Nearby Matching" value={bloodRequest.latitude && bloodRequest.longitude ? 'Enabled' : 'City based'} />
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>Fulfillment progress</span>
                  <span>{activeProgress}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100">
                  <div className="h-3 rounded-full bg-red-600" style={{ width: `${Math.min(activeProgress, 100)}%` }} />
                </div>
              </div>
            </div>
            {bloodRequest.status === 'open' && (
              <div className="flex gap-2">
                <Button onClick={() => handleUpdateRequest(bloodRequest.id, 'fulfilled')} className="bg-red-600 hover:bg-red-700">
                  Mark Fulfilled
                </Button>
                <Button onClick={() => handleUpdateRequest(bloodRequest.id, 'cancelled')} className="bg-red-600 text-white hover:bg-red-700">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {recipient && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <Hospital className="size-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Hospital Details</h3>
            </div>
            <div className="space-y-3">
              <InfoLine label="Hospital" value={recipient.hospital_name || 'Not set'} />
              <InfoLine label="Area" value={formatReadableLocation(recipient) || 'Not set'} />
              <InfoLine label="Doctor" value={recipient.doctor_name || 'Not set'} />
              <InfoLine label="Contact" value={recipient.doctor_contact || 'Not set'} />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <Timer className="size-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Donation Offers</h3>
            </div>
            {donationOffers.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">No donor offers yet</div>
            ) : (
              <div className="space-y-3">
                {donationOffers.slice(0, 5).map((offer) => (
                  <div key={offer.id} className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Donation offer #{offer.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">Units offered: {offer.units_donated}</p>
                      <p className="text-sm text-gray-600">
                        Scheduled: {offer.scheduled_at ? new Date(offer.scheduled_at).toLocaleString() : 'Not scheduled'}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`text-sm font-semibold capitalize ${offer.status === 'pending' ? 'text-blue-600' : 'text-green-600'}`}>{offer.status}</p>
                      <p className="text-xs text-gray-500">{new Date(offer.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Request History</h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          {requestHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No blood requests yet</div>
          ) : (
            requestHistory.map((request) => (
              <div key={request.id} className="flex flex-col gap-2 border-b border-gray-100 p-4 transition-colors duration-200 last:border-b-0 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">{request.blood_type}</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold capitalize text-blue-700">{request.urgency_level}</span>
                  </div>
                  <p className="text-sm text-gray-600">Units: {request.units_fulfilled}/{request.units_requested}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold capitalize text-blue-600">{request.status}</p>
                  <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
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

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const normalizedLabel = label.toLowerCase()
  const colorClasses =
    normalizedLabel.includes('blood') ? 'border-red-200 bg-red-50' :
    normalizedLabel.includes('open') ? 'border-blue-200 bg-blue-50' :
    normalizedLabel.includes('offer') ? 'border-green-200 bg-green-50' :
    normalizedLabel.includes('progress') ? 'border-blue-200 bg-blue-50' :
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

function InfoLine({ label, value, capitalize = false }: { label: string; value: string | number; capitalize?: boolean }) {
  const normalizedLabel = label.toLowerCase()
  const color =
    normalizedLabel.includes('blood') ? 'red' :
    normalizedLabel.includes('urgency') ? 'blue' :
    normalizedLabel.includes('unit') ? 'blue' :
    normalizedLabel.includes('status') ? 'green' :
    'gray'
  const colorClasses = {
    red: 'border-red-200 bg-red-50 text-red-950 [&_.info-label]:text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-950 [&_.info-label]:text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-950 [&_.info-label]:text-green-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-950 [&_.info-label]:text-gray-600',
  }[color]

  return (
    <div className={`rounded-lg border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${colorClasses}`}>
      <p className="info-label text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className={`mt-1 font-semibold ${capitalize ? 'capitalize' : ''}`}>{value}</p>
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
  return [record?.location_area, record?.city, record?.state].filter(Boolean).join(', ')
}
