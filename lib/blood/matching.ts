import { canDonateTo } from '@/lib/blood/compatibility'
import type { BloodRequestRecord, DonorRecord, UrgencyLevel } from '@/types/bloodbridge'

export function calculateDistanceMiles(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 999

  const radiusMiles = 3959
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return radiusMiles * c
}

export function scoreDonorMatch(
  donor: Pick<DonorRecord, 'blood_type' | 'is_available' | 'latitude' | 'longitude'>,
  request: Pick<BloodRequestRecord, 'blood_type' | 'urgency_level' | 'latitude' | 'longitude'>
) {
  const compatible = canDonateTo(donor.blood_type, request.blood_type)
  const distance = calculateDistanceMiles(request.latitude, request.longitude, donor.latitude, donor.longitude)
  let score = 0

  if (compatible) score += 50
  if (donor.blood_type === request.blood_type) score += 15
  if (donor.is_available) score += 15
  if (distance < 5) score += 10
  else if (distance < 25) score += 7
  else if (distance < 50) score += 4
  if (request.urgency_level === 'critical') score += 10
  else if (request.urgency_level === 'urgent') score += 5

  return {
    compatible,
    score: Math.min(score, 100),
    distance: Math.round(distance * 10) / 10,
    reason:
      compatible && donor.blood_type === request.blood_type
        ? 'Perfect match'
        : compatible
          ? 'Compatible blood type'
          : 'Not compatible',
  }
}

export function scoreEmergencyPriority(input: {
  urgency: UrgencyLevel
  unitsNeeded: number
  neededWithinHours?: number
}) {
  let score = input.urgency === 'critical' ? 80 : input.urgency === 'urgent' ? 60 : 35
  score += Math.min(input.unitsNeeded * 3, 15)

  if (input.neededWithinHours != null) {
    if (input.neededWithinHours <= 1) score += 10
    else if (input.neededWithinHours <= 6) score += 7
    else if (input.neededWithinHours <= 24) score += 4
  }

  return Math.min(score, 100)
}
