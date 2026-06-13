'use client'

import { CheckCircle2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FeedbackVariant = 'success' | 'error' | 'info'

interface FeedbackDialogProps {
  open: boolean
  title?: string
  message: string
  variant?: FeedbackVariant
  onClose: () => void
}

export default function FeedbackDialog({
  open,
  title,
  message,
  variant = 'info',
  onClose,
}: FeedbackDialogProps) {
  if (!open) return null

  const isSuccess = variant === 'success'
  const Icon = isSuccess ? CheckCircle2 : TriangleAlert

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
              isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            <Icon className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {title || (isSuccess ? 'Success' : 'Action needed')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="bg-red-600 px-6 text-white hover:bg-red-700">
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
