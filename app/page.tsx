'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  Bell,
  Bot,
  Clock3,
  Droplets,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import AIAssistant from '@/components/AIAssistant'

const featureCards = [
  {
    icon: Droplets,
    title: 'Smart Matching',
    desc: 'Rule-based AI logic matches compatible donors with recipients using blood type, city, urgency, and availability.',
    tone: 'bg-red-50 text-red-700 border-red-100',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    desc: 'Donors and recipients receive scoped alerts when requests, offers, or status updates need attention.',
    tone: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    icon: MapPin,
    title: 'Area-Based Search',
    desc: 'Requests use practical city and area details so donors can understand nearby emergency needs quickly.',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    icon: Bot,
    title: 'Gemini Assistant',
    desc: 'A Gemini-powered chatbot answers donation, eligibility, compatibility, and emergency response questions.',
    tone: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  },
  {
    icon: Activity,
    title: 'Live Dashboards',
    desc: 'Donor, recipient, and admin dashboards use real Supabase data for requests, offers, inventory, and notifications.',
    tone: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Backend',
    desc: 'Supabase Auth, PostgreSQL RLS policies, protected dashboards, and server-safe routes keep app data controlled.',
    tone: 'bg-slate-50 text-slate-700 border-slate-200',
  },
]

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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-red-600 bb-soft-pulse" />
            <h1 className="text-2xl font-bold text-gray-900">BloodBridge</h1>
          </div>
          <nav className="hidden gap-8 md:flex">
            <a href="#features" className="text-gray-700 transition hover:text-red-600">Features</a>
            <a href="#how-it-works" className="text-gray-700 transition hover:text-red-600">How It Works</a>
            <a href="#impact" className="text-gray-700 transition hover:text-red-600">Impact</a>
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

      <section className="relative overflow-hidden px-4 pb-20 pt-32 bb-surface-pattern">
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/90 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center bb-fade-up">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/85 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            AI-powered blood donation and emergency response
          </div>
          <h2 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
            Connect. Donate. <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Save Lives</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            BloodBridge AI connects donors with recipients using compatibility, urgency, city details, and real-time notifications.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/sign-up?role=donor">
              <Button className="rounded-lg bg-red-600 px-8 py-6 text-lg text-white hover:bg-red-700">
                Become a Donor
              </Button>
            </Link>
            <Link href="/auth/sign-up?role=recipient">
              <Button variant="outline" className="rounded-lg border-2 px-8 py-6 text-lg">
                Request Blood
              </Button>
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { icon: HeartPulse, label: 'Emergency ready', value: 'Priority scoring' },
              { icon: Clock3, label: 'Faster response', value: 'Instant alerts' },
              { icon: ShieldCheck, label: 'Protected data', value: 'Auth + RLS' },
            ].map((item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className={`bb-shine rounded-lg border border-white/80 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bb-fade-up ${index === 1 ? 'bb-delay-1' : index === 2 ? 'bb-delay-2' : ''}`}
                >
                  <Icon className="mb-3 h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20 bb-fade-up bb-delay-1">
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="mb-16 text-center text-4xl font-bold text-gray-900">Features</h3>
          <div className="grid gap-8 md:grid-cols-3">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className={`bb-shine rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bb-fade-up ${index % 3 === 1 ? 'bb-delay-1' : index % 3 === 2 ? 'bb-delay-2' : ''}`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg border ${feature.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bb-fade-up bb-delay-2">
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="mb-16 text-center text-4xl font-bold text-gray-900">How It Works</h3>
          <div className="grid gap-12 md:grid-cols-2">
            <div className="rounded-lg border border-red-100 bg-white p-6 shadow-sm">
              <h4 className="mb-8 text-2xl font-bold text-gray-900">For Donors</h4>
              <div className="space-y-6">
                {['Sign up and verify eligibility', 'Complete health and location profile', 'Get matched with nearby recipients', 'Schedule donation offer', 'Track impact'].map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
              <h4 className="mb-8 text-2xl font-bold text-gray-900">For Recipients</h4>
              <div className="space-y-6">
                {['Create an account', 'Submit blood and hospital details', 'Get nearby compatible matches', 'Coordinate scheduled donor offers', 'Receive blood safely'].map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                      {index + 1}
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

      <section id="impact" className="bg-red-50 py-20 bb-fade-up bb-delay-2">
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="mb-16 text-center text-4xl font-bold text-gray-900">Our Impact</h3>
          <div className="grid gap-8 md:grid-cols-4">
            {impactStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`bb-shine rounded-lg border border-red-100 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md bb-fade-up ${index === 1 ? 'bb-delay-1' : index === 2 ? 'bb-delay-2' : index === 3 ? 'bb-delay-3' : ''}`}
              >
                <div className="mb-2 text-4xl font-bold text-red-600">{stat.number}</div>
                <div className="text-gray-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="mb-6 text-4xl font-bold">Ready to Make a Difference?</h3>
          <p className="mb-8 text-xl opacity-90">Join donors and recipients saving lives through faster matching.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/sign-up?role=donor">
              <Button className="rounded-lg bg-red-900 px-8 py-3 font-semibold text-white hover:bg-red-950">
                Sign Up as Donor
              </Button>
            </Link>
            <Link href="/auth/sign-up?role=recipient">
              <Button className="rounded-lg bg-red-500 px-8 py-3 font-semibold text-white hover:bg-red-400">
                Request Blood
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <h5 className="mb-4 font-semibold text-white">BloodBridge</h5>
              <p className="text-sm">AI-powered blood donation and emergency response.</p>
            </div>
            <div>
              <h5 className="mb-4 font-semibold text-white">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><Link href="/privacy" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 font-semibold text-white">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white">About</a></li>
                <li><a href="#impact" className="hover:text-white">Impact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 font-semibold text-white">Legal</h5>
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

      <AIAssistant />
    </div>
  )
}
