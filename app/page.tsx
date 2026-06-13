'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import AIAssistant from '@/components/AIAssistant'

export default function LandingPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [impactStats, setImpactStats] = useState([
    { number: '0', label: 'Active Donors' },
    { number: '0', label: 'Lives Impacted' },
    { number: '0', label: 'Donation Offers' },
    { number: '0', label: 'Active Requests' },
  ])
  const router = useRouter()
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  useEffect(() => {
    const getSession = async () => {
      if (!supabase) return
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setIsChecking(false)
      }
    }
    getSession()
  }, [router, supabase])

  useEffect(() => {
    const loadImpactStats = async () => {
      const response = await fetch('/api/public-stats')
      if (!response.ok) return
      const stats = await response.json()

      setImpactStats([
        { number: stats.activeDonors.toLocaleString(), label: 'Active Donors' },
        { number: stats.livesImpacted.toLocaleString(), label: 'Lives Impacted' },
        { number: stats.totalDonations.toLocaleString(), label: 'Donation Offers' },
        { number: stats.activeRequests.toLocaleString(), label: 'Active Requests' },
      ])
    }

    loadImpactStats().catch(() => undefined)
  }, [])

  if (isChecking) {
    return null // Don't render while checking session
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">BloodBridge</h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-gray-700 hover:text-red-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-red-600 transition">How It Works</a>
            <a href="#impact" className="text-gray-700 hover:text-red-600 transition">Impact</a>
          </nav>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-red-600 hover:bg-red-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect. Donate. <span className="text-red-600">Save Lives</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            BloodBridge AI is an AI-powered blood donation and emergency response system that connects donors with recipients using compatibility, urgency, location, and real-time notifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up?role=donor">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-lg">
                Become a Donor
              </Button>
            </Link>
            <Link href="/auth/sign-up?role=recipient">
              <Button variant="outline" className="px-8 py-6 text-lg rounded-lg border-2">
                Request Blood
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🩸',
                title: 'Smart Matching',
                desc: 'AI-powered algorithms match compatible donors with recipients based on blood type, GPS location, and urgency.'
              },
              {
                icon: '⚡',
                title: 'Real-Time Notifications',
                desc: 'Get instant alerts when a compatible donor is available or when your blood request is fulfilled.'
              },
              {
                icon: '📍',
                title: 'Location-Based Search',
                desc: 'Find nearby compatible donors using GPS location, city details, and proximity-aware matching.'
              },
              {
                icon: '💬',
                title: 'AI Assistant',
                desc: 'Get medical guidance, donation tips, and answers to your blood-related questions from our AI assistant.'
              },
              {
                icon: '📊',
                title: 'Donor Dashboard',
                desc: 'Track your donation history, scheduled offers, eligibility status, and impact on the community.'
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                desc: 'Your data is protected with Supabase authentication, PostgreSQL RLS policies, and server-safe API routes.'
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg bg-gray-50 transition-all duration-200 hover:-translate-y-1 hover:bg-gray-100 hover:shadow-md">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-8">For Donors</h4>
              <div className="space-y-6">
                {['Sign up and verify eligibility', 'Complete health and location profile', 'Get matched with nearby recipients', 'Schedule donation offer', 'Track impact'].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-8">For Recipients</h4>
              <div className="space-y-6">
                {['Create an account', 'Submit blood and hospital details', 'Get nearby compatible matches', 'Coordinate scheduled donor offers', 'Receive blood safely'].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-red-50">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">Our Impact</h3>
          <div className="grid md:grid-cols-4 gap-8">
            {impactStats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h3>
          <p className="text-xl mb-8 opacity-90">Join thousands of donors and recipients saving lives every day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up?role=donor">
              <Button className="bg-red-900 text-white hover:bg-red-950 px-8 py-3 rounded-lg font-semibold">
                Sign Up as Donor
              </Button>
            </Link>
            <Link href="/auth/sign-up?role=recipient">
              <Button className="bg-red-500 hover:bg-red-400 text-white px-8 py-3 rounded-lg font-semibold">
                Request Blood
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-semibold text-white mb-4">BloodBridge</h5>
              <p className="text-sm">Connecting donors with recipients to save lives.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><Link href="/privacy" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white">About</a></li>
                <li><a href="#impact" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 BloodBridge AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  )
}
