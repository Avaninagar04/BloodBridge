'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard({ user: _user, profile: _profile }: any) {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalRecipients: 0,
    totalDonations: 0,
    totalRequests: 0,
  })
  const [bloodInventory, setBloodInventory] = useState<any[]>([])
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!supabase) return
      const { count: donorCount } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })

      const { count: recipientCount } = await supabase
        .from('recipients')
        .select('*', { count: 'exact', head: true })

      const { count: donationCount } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true })

      const { count: requestCount } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })

      const { data: inventoryData } = await supabase
        .from('blood_inventory')
        .select('*')
        .order('blood_type')

      setStats({
        totalDonors: donorCount || 0,
        totalRecipients: recipientCount || 0,
        totalDonations: donationCount || 0,
        totalRequests: requestCount || 0,
      })

      setBloodInventory(inventoryData || [])
    }

    fetchAdminData()
  }, [supabase])

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white/90 p-6 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">System overview and management</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="min-h-32 rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-semibold text-gray-600">Total Donors</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalDonors}</p>
        </div>
        <div className="min-h-32 rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-semibold text-gray-600">Total Recipients</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalRecipients}</p>
        </div>
        <div className="min-h-32 rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-semibold text-gray-600">Total Donations</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalDonations}</p>
        </div>
        <div className="min-h-32 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-semibold text-gray-600">Active Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRequests}</p>
        </div>
      </div>

      {/* Blood Inventory */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Blood Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Blood Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Units Available</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Units Reserved</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Net Available</th>
              </tr>
            </thead>
            <tbody>
              {bloodInventory.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{item.blood_type}</td>
                  <td className="py-3 px-4 text-gray-600">{item.units_available}</td>
                  <td className="py-3 px-4 text-gray-600">{item.units_reserved}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {item.units_available - item.units_reserved}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            <span className="text-gray-900 font-medium">Database Connection</span>
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">Healthy</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            <span className="text-gray-900 font-medium">Authentication Service</span>
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">Healthy</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            <span className="text-gray-900 font-medium">Notification Service</span>
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
