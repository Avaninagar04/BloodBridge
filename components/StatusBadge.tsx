'use client'

import React from 'react'

interface StatusBadgeProps {
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'critical'
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusMap: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    critical: { color: 'bg-red-200 text-red-900', label: 'Critical' },
  }

  const config = statusMap[status]

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color} ${className}`}>
      {config.label}
    </span>
  )
}
