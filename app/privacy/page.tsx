import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="text-red-600 hover:underline font-medium">
          Back to BloodBridge
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <div className="space-y-4 text-gray-700">
            <p>
              BloodBridge stores account, profile, donation, and request data in Supabase with row-level security enabled.
            </p>
            <p>
              Users can access their own private data. Admin access is role-restricted and should only be granted to trusted operators.
            </p>
            <p>
              The Gemini chatbot is optional. Do not enter sensitive medical details into chat unless your deployment policy allows it.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
