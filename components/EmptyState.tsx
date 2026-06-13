'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon = '📭', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <Card className={`${className}`}>
      <CardContent className="py-12 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  )
}
