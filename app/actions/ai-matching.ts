'use server'

import { analyzeCompatibility, canDonateTo } from '@/lib/blood/compatibility'
import { scoreDonorMatch } from '@/lib/blood/matching'
import { createClient } from '@/lib/supabase/server'
import type { BloodRequestRecord, DonorRecord } from '@/types/bloodbridge'

interface RecipientContext {
  bloodType: string
  urgency: string
  latitude?: number
  longitude?: number
}

export async function findDonorMatches(
  recipientId: string,
  context: RecipientContext,
  limit: number = 10
) {
  const supabase = await createClient()

  const { data: donors, error } = await supabase
    .from('donors')
    .select('id, blood_type, is_available, latitude, longitude, user_id')
    .eq('is_available', true)

  if (error || !donors) return []

  const request = {
    id: recipientId,
    blood_type: context.bloodType,
    urgency_level: context.urgency,
    latitude: context.latitude,
    longitude: context.longitude,
  } as BloodRequestRecord

  return donors
    .map((donor) => {
      const match = scoreDonorMatch(donor as DonorRecord, request)
      return {
        id: donor.id,
        score: match.score,
        bloodType: donor.blood_type,
        distance: match.distance,
        availability: donor.is_available,
        compatibilityReason: match.reason,
      }
    })
    .filter((donor) => donor.score > 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export async function getRecipientRecommendations(donorId: string, bloodType: string) {
  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from('blood_requests')
    .select(
      `
      id,
      blood_type,
      units_requested,
      units_fulfilled,
      urgency_level,
      status,
      recipients (
        id,
        user_id,
        medical_condition,
        hospital_name,
        latitude,
        longitude
      )
    `
    )
    .eq('status', 'open')

  if (error || !requests) return []

  return requests
    .filter((request) => canDonateTo(bloodType, request.blood_type))
    .map((request) => ({
      id: request.id,
      bloodType: request.blood_type,
      unitsNeeded: request.units_requested - request.units_fulfilled,
      urgency: request.urgency_level,
      recipient: Array.isArray(request.recipients) ? request.recipients[0] : request.recipients,
    }))
    .sort((a, b) => {
      const urgencyScore = { critical: 3, urgent: 2, normal: 1 }
      return (
        (urgencyScore[b.urgency as keyof typeof urgencyScore] || 0) -
        (urgencyScore[a.urgency as keyof typeof urgencyScore] || 0)
      )
    })
}

export async function analyzeBloodCompatibility(donorType: string, recipientType: string) {
  return analyzeCompatibility(donorType, recipientType)
}
