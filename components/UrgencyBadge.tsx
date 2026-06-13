'use client'

import React from 'react'

interface UrgencyBadgeProps {
  level: 'low' | 'normal' | 'high' | 'critical'
  className?: string
}

export function UrgencyBadge({ level, className = '' }: UrgencyBadgeProps) {
  const levelMap: Record<string, { color: string; icon: string }> = {
    low: { color: 'bg-blue-100 text-blue-800', icon: '•' },
    normal: { color: 'bg-green-100 text-green-800', icon: '••' },
    high: { color: 'bg-orange-100 text-orange-800', icon: '•••' },
    critical: { color: 'bg-red-100 text-red-800', icon: '•••••' },
  }

  const config = levelMap[level]

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color} ${className}`}>
      {config.icon} {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}
