'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { analyzeBloodCompatibility } from '@/app/actions/ai-matching'
import { ArrowLeft } from 'lucide-react'

const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export default function BloodCompatibilityPage() {
  const [donorType, setDonorType] = useState('O+')
  const [recipientType, setRecipientType] = useState('A+')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const compatibility = await analyzeBloodCompatibility(donorType, recipientType)
      setResult(compatibility)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg px-2 py-1 text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Compatibility Analyzer</h1>
            <p className="text-gray-600 mt-2">Check if a donor's blood is compatible with a recipient</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-8 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Blood Types</h2>

              <div className="space-y-6">
                {/* Donor Blood Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    🩸 Donor Blood Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setDonorType(type)}
                        className={`rounded-lg px-3 py-2 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                          donorType === type
                            ? 'bg-red-600 text-white'
                            : 'border border-red-200 bg-red-50 text-red-800 hover:border-red-300 hover:bg-red-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Blood Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    🏥 Recipient Blood Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setRecipientType(type)}
                        className={`rounded-lg px-3 py-2 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                          recipientType === type
                            ? 'bg-blue-600 text-white'
                            : 'border border-red-200 bg-red-50 text-red-800 hover:border-red-300 hover:bg-red-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  {loading ? 'Analyzing...' : 'Analyze Compatibility'}
                </Button>
              </div>
            </div>

            {/* Blood Type Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-semibold text-blue-900 mb-3">💡 About Blood Types</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li><strong>O-:</strong> Universal donor - can give to anyone</li>
                <li><strong>O+:</strong> Can donate to O+, A+, B+, AB+</li>
                <li><strong>AB+:</strong> Universal recipient - can receive from anyone</li>
                <li><strong>AB-:</strong> Can receive O-, A-, B-, AB-</li>
              </ul>
            </div>
          </div>

          {/* Result Section */}
          <div>
            {result ? (
              <div
                className={`rounded-lg border-l-4 bg-white p-8 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  result.compatible ? 'border-green-600' : 'border-red-600'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white ${
                      result.compatible ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {result.compatible ? '✓' : '✗'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Compatibility Result</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.compatible ? 'Compatible' : 'Not Compatible'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Donor Type</p>
                    <p className="text-lg font-semibold text-red-600">{result.donor}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recipient Type</p>
                    <p className="text-lg font-semibold text-blue-600">{result.recipient}</p>
                  </div>

                    <div className="rounded-lg bg-gray-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">Analysis</p>
                    <p className="text-gray-900">{result.message}</p>
                  </div>

                  {result.compatible && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                      <p className="text-sm font-semibold text-green-900 mb-2">✓ Safe for Transfusion</p>
                      <p className="text-sm text-green-800">
                        This blood type combination is safe for transfusion. Cross-matching should still be performed before actual transfusion.
                      </p>
                    </div>
                  )}

                  {!result.compatible && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                      <p className="text-sm font-semibold text-red-900 mb-2">✗ Not Safe for Transfusion</p>
                      <p className="text-sm text-red-800">
                        This blood type combination would cause an immune reaction. Do not proceed with transfusion.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <p className="text-gray-500 mb-2">🧪 Select blood types and click analyze to check compatibility</p>
              </div>
            )}
          </div>
        </div>

        {/* Compatibility Matrix */}
        <div className="mt-12 rounded-lg bg-white p-8 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Blood Type Compatibility Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Donor</th>
                  {bloodTypes.map((type) => (
                    <th key={type} className="px-4 py-3 text-center font-semibold text-gray-900">
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloodTypes.map((donor) => (
                  <tr key={donor} className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900 bg-gray-50">{donor}</td>
                    {bloodTypes.map((recipient) => {
                      const canDonate =
                        donor === 'O-' ||
                        (donor === 'O+' && (recipient.startsWith('O') || recipient.startsWith('A') || recipient.startsWith('B') || recipient.startsWith('AB'))) ||
                        (donor === 'A+' && (recipient === 'A+' || recipient === 'AB+')) ||
                        (donor === 'A-' && (recipient === 'A+' || recipient === 'A-' || recipient === 'AB+' || recipient === 'AB-')) ||
                        (donor === 'B+' && (recipient === 'B+' || recipient === 'AB+')) ||
                        (donor === 'B-' && (recipient === 'B+' || recipient === 'B-' || recipient === 'AB+' || recipient === 'AB-')) ||
                        (donor === 'AB+' && recipient === 'AB+') ||
                        (donor === 'AB-' && (recipient === 'AB+' || recipient === 'AB-'))

                      return (
                        <td
                          key={`${donor}-${recipient}`}
                          className={`px-4 py-3 text-center font-medium ${
                            canDonate
                              ? 'bg-green-100 text-green-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {canDonate ? '✓' : '✗'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-4">✓ = Compatible | ✗ = Not Compatible</p>
        </div>
      </main>
    </div>
  )
}
