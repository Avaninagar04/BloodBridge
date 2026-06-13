import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('public_platform_stats')

  if (error) {
    return NextResponse.json(
      {
        activeDonors: 0,
        livesImpacted: 0,
        totalDonations: 0,
        activeRequests: 0,
      },
      { status: 200 }
    )
  }

  const stats = Array.isArray(data) ? data[0] : data

  return NextResponse.json({
    activeDonors: Number(stats?.active_donors || 0),
    livesImpacted: Number(stats?.lives_impacted || 0),
    totalDonations: Number(stats?.total_donations || 0),
    activeRequests: Number(stats?.active_requests || 0),
  })
}
