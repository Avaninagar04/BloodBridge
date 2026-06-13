import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="text-red-600 hover:underline font-medium">
          Back to BloodBridge
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <div className="space-y-4 text-gray-700">
            <p>
              BloodBridge helps coordinate blood donation interest and requests. It does not replace licensed medical care.
            </p>
            <p>
              Donation eligibility, transfusion decisions, and emergency care must be confirmed by qualified healthcare professionals.
            </p>
            <p>
              Users are responsible for providing accurate account, contact, and health-related information.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
