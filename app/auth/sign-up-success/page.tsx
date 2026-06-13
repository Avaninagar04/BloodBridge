'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h1>
          <p className="text-gray-600 mb-4">
            Your account has been successfully created.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm text-blue-900 font-medium">Email Confirmation</p>
              <p className="text-sm text-blue-800 mt-1">
                Check your email for a confirmation link. Click it to activate your account and start using BloodBridge.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            If you don&apos;t see the email, check your spam folder or try signing up again with a different email address.
          </p>
        </div>

        <Link href="/auth/login">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  )
}
