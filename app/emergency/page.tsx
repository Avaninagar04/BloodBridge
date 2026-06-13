'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import FeedbackDialog from '@/components/FeedbackDialog'
import { createClient } from '@/lib/supabase/client'
import { isMissingSchemaColumn, withoutOptionalColumns } from '@/lib/supabase/schema-fallback'
import { scoreEmergencyPriority } from '@/lib/blood/matching'
import { ArrowLeft, Crosshair } from 'lucide-react'

export default function EmergencySOS() {
  const [emergencyType, setEmergencyType] = useState<'blood_request' | 'donor_urgent' | null>(null)
  const [bloodType, setBloodType] = useState('O+')
  const [unitsNeeded, setUnitsNeeded] = useState(2)
  const [contact, setContact] = useState('')
  const [hospital, setHospital] = useState('')
  const [locationArea, setLocationArea] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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
  const router = useRouter()
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

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
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        setLocating(false)
      },
      () => {
        setFeedback({
          open: true,
          title: 'Location permission needed',
          message: 'Allow location access so nearby donors can be prioritized.',
          variant: 'error',
        })
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleEmergencyBloodRequest = async () => {
    if (!contact || !hospital || !city) {
      setFeedback({
        open: true,
        title: 'Missing information',
        message: 'Please enter hospital, city, and contact information.',
        variant: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: recipient } = await supabase
        .from('recipients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let recipientId = recipient?.id

      if (!recipientId) {
        const recipientPayload = {
          user_id: user.id,
          blood_type: bloodType,
          hospital_name: hospital,
          location_area: locationArea,
          city,
          state,
          doctor_contact: contact,
          urgency_level: 'critical',
          units_needed: unitsNeeded,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        }

        let { data: newRecipient, error: recipientError } = await supabase
          .from('recipients')
          .insert(recipientPayload)
          .select('id')
          .single()

        if (recipientError && isMissingSchemaColumn(recipientError)) {
          const retryPayload = withoutOptionalColumns(recipientPayload, ['latitude', 'longitude', 'location_area', 'city', 'state'])
          const retry = await supabase
            .from('recipients')
            .insert(retryPayload)
            .select('id')
            .single()
          newRecipient = retry.data
          recipientError = retry.error
        }

        if (recipientError || !newRecipient) {
          setFeedback({
            open: true,
            title: 'Could not create recipient profile',
            message: recipientError?.message || 'Supabase did not return the created recipient profile.',
            variant: 'error',
          })
          return
        }

        recipientId = newRecipient.id
      }

      // Create urgent blood request
      const requestPayload = {
        recipient_id: recipientId,
        blood_type: bloodType,
        units_requested: unitsNeeded,
        urgency_level: 'critical',
        location_area: locationArea,
        city,
        state,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        priority_score: scoreEmergencyPriority({
          urgency: 'critical',
          unitsNeeded,
          neededWithinHours: 1,
        }),
        status: 'open',
        needed_by_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      }

      let { error: requestError } = await supabase.from('blood_requests').insert(requestPayload)

      if (requestError && isMissingSchemaColumn(requestError)) {
        const retryPayload = withoutOptionalColumns(requestPayload, ['latitude', 'longitude', 'location_area', 'city', 'state'])
        const retry = await supabase.from('blood_requests').insert(retryPayload)
        requestError = retry.error
      }

      if (!requestError) {
        setSubmitted(true)
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setFeedback({
          open: true,
          title: 'Could not submit emergency request',
          message: requestError.message,
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('[v0] Emergency request error:', error)
      setFeedback({
        open: true,
        title: 'Emergency request failed',
        message: 'Error submitting emergency request.',
        variant: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUrgentDonor = async () => {
    if (!contact) {
      setFeedback({
        open: true,
        title: 'Missing contact',
        message: 'Please enter your contact information.',
        variant: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Mark donor as urgent availability
      const { data: donor } = await supabase
        .from('donors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (donor) {
        const { error } = await supabase
          .from('donors')
          .update({ is_available: true })
          .eq('id', donor.id)

        if (!error) {
          setSubmitted(true)
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setFeedback({
            open: true,
            title: 'Could not update availability',
            message: error.message,
            variant: 'error',
          })
        }
      } else {
        setFeedback({
          open: true,
          title: 'Donor profile required',
          message: 'Please complete your donor profile before marking yourself available.',
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('[v0] Urgent donor error:', error)
      setFeedback({
        open: true,
        title: 'Availability update failed',
        message: 'Error updating availability.',
        variant: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Thank You!</h1>
          <p className="text-green-700 mb-6">Your emergency request has been submitted.</p>
          <p className="text-sm text-green-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-red-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl animate-pulse">🚨</div>
            <h1 className="text-3xl font-bold">Emergency Blood Request</h1>
          </div>
          <p className="text-red-100">AI-Powered Urgent Response System</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!emergencyType ? (
          <div className="space-y-6">
            <div className="rounded-lg border-2 border-red-200 bg-white p-8 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What is your emergency?</h2>

              <div className="space-y-4">
                <button
                  onClick={() => setEmergencyType('blood_request')}
                  className="w-full rounded-lg border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-red-600 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🏥</div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Patient Needs Blood Urgently</h3>
                      <p className="text-sm text-gray-600">Create an emergency blood request to find donors immediately</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setEmergencyType('donor_urgent')}
                  className="w-full rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-600 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">💪</div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">I Can Donate Right Now</h3>
                      <p className="text-sm text-gray-600">Alert the system that you're available for immediate donation</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-semibold text-blue-900 mb-3">📞 Call for Immediate Help</h3>
              <p className="text-sm text-blue-800 mb-4">For life-threatening emergencies, call your local emergency services:</p>
              <div className="text-2xl font-bold text-blue-600">911</div>
            </div>
          </div>
        ) : emergencyType === 'blood_request' ? (
          <div className="rounded-lg bg-white p-8 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <button
              onClick={() => setEmergencyType(null)}
              className="mb-6 rounded-lg px-2 py-1 font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-700"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Blood Request</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Blood Type Needed *</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="O+">O+ (Most Common)</option>
                  <option value="O-">O- (Universal Donor)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Units Needed *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Hospital Name *</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="Enter hospital name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Area / Locality</label>
                  <input
                    type="text"
                    value={locationArea}
                    onChange={(e) => setLocationArea(e.target.value)}
                    placeholder="Near hospital, sector, locality"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bhopal"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Madhya Pradesh"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Contact Information *</label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone number or email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              <Button
                type="button"
                onClick={handleUseCurrentLocation}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Crosshair className="size-4" />
                {locating ? 'Finding nearby location...' : latitude && longitude ? 'GPS Priority Enabled' : 'Use Current Location for Nearby Donors'}
              </Button>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Important:</strong> This is marked as CRITICAL. Our AI system will immediately match donors and send urgent notifications.
                </p>
              </div>

              <Button
                onClick={handleEmergencyBloodRequest}
                disabled={submitting || !hospital || !contact || !city}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-bold rounded-lg"
              >
                {submitting ? 'Submitting...' : '🚨 Submit Emergency Request'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <button
              onClick={() => setEmergencyType(null)}
              className="mb-6 rounded-lg px-2 py-1 font-semibold text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">I Can Donate Right Now</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Your Blood Type</label>
                <div className="rounded-lg bg-blue-50 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-sm text-gray-600">Loading your blood type...</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Contact Information *</label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <p className="text-sm text-blue-800">
                  <strong>✓ Alert:</strong> You'll be immediately matched with urgent blood requests. Recipients will contact you within minutes.
                </p>
              </div>

              <Button
                onClick={handleUrgentDonor}
                disabled={submitting || !contact}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-bold rounded-lg"
              >
                {submitting ? 'Activating...' : '💪 Make Me Available Now'}
              </Button>
            </div>
          </div>
        )}
      </main>
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
