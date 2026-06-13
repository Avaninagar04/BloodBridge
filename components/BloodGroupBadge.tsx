'use client'

import React from 'react'

interface BloodGroupBadgeProps {
  bloodType: string
  className?: string
}

export function BloodGroupBadge({ bloodType, className = '' }: BloodGroupBadgeProps) {
  const bgColorMap: Record<string, string> = {
    'O+': 'bg-red-100 text-red-800',
    'O-': 'bg-red-200 text-red-900',
    'A+': 'bg-blue-100 text-blue-800',
    'A-': 'bg-blue-200 text-blue-900',
    'B+': 'bg-yellow-100 text-yellow-800',
    'B-': 'bg-yellow-200 text-yellow-900',
    'AB+': 'bg-purple-100 text-purple-800',
    'AB-': 'bg-purple-200 text-purple-900',
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bgColorMap[bloodType] || 'bg-gray-100 text-gray-800'} ${className}`}>
      {bloodType}
    </span>
  )
}
