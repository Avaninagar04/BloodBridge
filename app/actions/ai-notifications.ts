'use server'

import { createClient } from '@/lib/supabase/server'

export async function generateSmartNotifications(userId: string) {
  const supabase = await createClient()

  // Get user profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('id', userId)
    .single()

  if (!profile) return []

  const notifications = []

  if (profile.role === 'donor') {
    // Check if donor profile is complete
    const { data: donor } = await supabase
      .from('donors')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!donor) {
      notifications.push({
        title: '📋 Complete Your Profile',
        message: 'Add your blood type and health information to start receiving donation opportunities',
        type: 'profile_incomplete',
        priority: 'high',
      })
    } else if (donor.blood_type === 'O-') {
      notifications.push({
        title: '🩸 Universal Donor Needed',
        message: 'Your O- blood is critical! Multiple recipients need your blood type urgently.',
        type: 'high_demand',
        priority: 'critical',
      })
    }

    // Check for matching blood requests
    const { data: requests } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('blood_type', donor?.blood_type)
      .eq('status', 'open')
      .order('urgency_level', { ascending: false })
      .limit(1)

    if (requests && requests.length > 0) {
      const request = requests[0]
      notifications.push({
        title: '🎯 Perfect Match Found!',
        message: `A recipient needs ${request.blood_type} blood urgently. Your donation can save a life!`,
        type: 'match_found',
        priority: request.urgency_level === 'critical' ? 'critical' : 'high',
      })
    }

    // Donation interval reminder
    if (donor.last_donation_date) {
      const lastDonation = new Date(donor.last_donation_date)
      const daysSinceLastDonation =
        (new Date().getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceLastDonation >= 56 && daysSinceLastDonation < 90) {
        notifications.push({
          title: '💪 Ready to Donate Again',
          message: 'You\'re now eligible to donate again. Schedule your next donation today!',
          type: 'eligibility_reminder',
          priority: 'medium',
        })
      }
    }
  } else if (profile.role === 'recipient') {
    // Check if recipient profile is complete
    const { data: recipient } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!recipient) {
      notifications.push({
        title: '📋 Complete Your Request',
        message: 'Add your blood type and medical information to request blood',
        type: 'profile_incomplete',
        priority: 'high',
      })
    } else {
      // Check for active blood requests
      const { data: requests } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('recipient_id', recipient.id)
        .eq('status', 'open')
        .order('urgency_level', { ascending: false })
        .limit(1)

      if (requests && requests.length > 0) {
        const request = requests[0]
        const unitsRemaining = request.units_requested - request.units_fulfilled

        if (unitsRemaining === 0) {
          notifications.push({
            title: '✅ Request Fulfilled',
            message: 'All units for your blood request have been found. Contact your hospital to arrange pickup.',
            type: 'request_fulfilled',
            priority: 'high',
          })
        } else if (unitsRemaining <= 2) {
          notifications.push({
            title: '⏳ Almost There',
            message: `Only ${unitsRemaining} unit(s) remaining. We're matching donors now.`,
            type: 'near_completion',
            priority: 'high',
          })
        }

        // Time-based urgency alert
        if (request.needed_by_date) {
          const neededBy = new Date(request.needed_by_date)
          const hoursUntilNeeded =
            (neededBy.getTime() - new Date().getTime()) / (1000 * 60 * 60)

          if (hoursUntilNeeded < 24 && hoursUntilNeeded > 0) {
            notifications.push({
              title: '⚠️ Urgent Timeline',
              message: `Blood needed within ${Math.round(hoursUntilNeeded)} hours. We're prioritizing donor matches.`,
              type: 'time_urgent',
              priority: 'critical',
            })
          }
        }
      }
    }
  }

  return notifications
}

export async function getPersonalizedRecommendations(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('id', userId)
    .single()

  if (!profile) return { recommendations: [], insights: [] }

  const recommendations = []
  const insights = []

  if (profile.role === 'donor') {
    const { data: donor } = await supabase
      .from('donors')
      .select('*, donations(count)')
      .eq('user_id', userId)
      .single()

    // Count donations
    const { count: donationCount } = await supabase
      .from('donations')
      .select('*', { count: 'exact' })
      .eq('donor_id', donor?.id)

    insights.push({
      metric: 'Total Lives Impacted',
      value: donationCount || 0,
      description: `Your ${donationCount || 0} donation(s) have potentially saved multiple lives`,
    })

    if (donationCount && donationCount > 5) {
      recommendations.push({
        title: 'Platinum Donor Achievement',
        description: 'You\'ve made 5+ donations! Consider joining our VIP donor program for special recognition.',
        action: 'Learn More',
      })
    }

    if (!donor?.health_conditions) {
      recommendations.push({
        title: 'Health Check-In',
        description: 'Update your health information to ensure continued eligibility',
        action: 'Update Profile',
      })
    }
  } else if (profile.role === 'recipient') {
    const { data: recipient } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (recipient) {
      insights.push({
        metric: 'Active Requests',
        value: 1,
        description: 'Your blood request is being prioritized',
      })

      recommendations.push({
        title: 'Hospital Coordination',
        description: 'Keep your hospital informed about incoming blood donations for smooth coordination',
        action: 'View Details',
      })

      recommendations.push({
        title: 'Donor Thank You',
        description: 'Send a message to your donors expressing gratitude for their life-saving donations',
        action: 'Send Message',
      })
    }
  }

  return { recommendations, insights }
}

export async function suggestDonationCampaigns() {
  const campaigns = [
    {
      name: 'Emergency Response Drive',
      description: 'Critical need for O- blood due to recent emergency',
      bloodTypes: ['O-', 'O+'],
      reward: 'Priority access to health screenings',
      status: 'active',
    },
    {
      name: 'Hospital Partnership Week',
      description: 'Special partnership with local hospitals for routine donations',
      bloodTypes: ['All'],
      reward: 'Exclusive donor merchandise',
      status: 'active',
    },
    {
      name: 'Seasonal Drive',
      description: 'Regular seasonal blood drive to maintain inventory',
      bloodTypes: ['All'],
      reward: 'Entry into monthly donor raffle',
      status: 'upcoming',
    },
  ]

  return campaigns
}
