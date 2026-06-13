'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Analytics {
  totalDonations: number
  activeDonors: number
  activeRequests: number
  fulfillmentRate: number
  averageMatchTime: number
  criticalNeed: boolean
}

export default function AIAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (!supabase) return
        // Get total donations
        const { count: donationCount } = await supabase
          .from('donations')
          .select('*', { count: 'exact' })

        // Get active donors
        const { count: donorCount } = await supabase
          .from('donors')
          .select('*', { count: 'exact' })
          .eq('is_available', true)

        // Get active requests
        const { count: requestCount } = await supabase
          .from('blood_requests')
          .select('*', { count: 'exact' })
          .eq('status', 'open')

        // Get critical needs
        const { data: criticalRequests } = await supabase
          .from('blood_requests')
          .select('*')
          .eq('status', 'open')
          .eq('urgency_level', 'critical')

        // Calculate fulfillment rate
        const { data: allRequests } = await supabase
          .from('blood_requests')
          .select('units_requested, units_fulfilled')

        const fulfillmentRate =
          allRequests && allRequests.length > 0
            ? Math.round(
                (allRequests.reduce((sum: number, r: any) => sum + (r.units_fulfilled || 0), 0) /
                  allRequests.reduce((sum: number, r: any) => sum + (r.units_requested || 0), 0)) *
                  100
              )
            : 0

        setAnalytics({
          totalDonations: donationCount || 0,
          activeDonors: donorCount || 0,
          activeRequests: requestCount || 0,
          fulfillmentRate,
          averageMatchTime: 4.2, // Placeholder - would calculate from timestamps
          criticalNeed: (criticalRequests?.length || 0) > 0,
        })
      } catch (error) {
        console.error('[v0] Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [supabase])

  if (loading) {
    return <div className="p-4">Loading analytics...</div>
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Total Donations</p>
        <p className="text-3xl font-bold text-red-600">{analytics.totalDonations}</p>
        <p className="text-xs text-gray-500 mt-2">Lives potentially saved</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Active Donors</p>
        <p className="text-3xl font-bold text-blue-600">{analytics.activeDonors}</p>
        <p className="text-xs text-gray-500 mt-2">Ready to donate now</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Fulfillment Rate</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-green-600">{analytics.fulfillmentRate}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${analytics.fulfillmentRate}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 col-span-1 md:col-span-2">
        <p className="text-sm text-gray-600 mb-2">Active Requests</p>
        <p className="text-3xl font-bold text-amber-600">{analytics.activeRequests}</p>
        <p className="text-xs text-gray-500 mt-2">Urgent matches needed</p>
        {analytics.criticalNeed && (
          <div className="mt-3 bg-red-50 p-2 rounded text-xs text-red-700">
            ⚠️ Critical blood need - Immediate donors needed
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Avg Match Time</p>
        <p className="text-3xl font-bold text-purple-600">{analytics.averageMatchTime}h</p>
        <p className="text-xs text-gray-500 mt-2">From request to match</p>
      </div>
    </div>
  )
}
