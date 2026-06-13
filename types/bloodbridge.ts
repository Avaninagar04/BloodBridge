export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'

export type UserRole = 'donor' | 'recipient' | 'admin'

export type UrgencyLevel = 'normal' | 'urgent' | 'critical'

export type RequestStatus = 'open' | 'fulfilled' | 'cancelled'

export type DonationStatus = 'pending' | 'completed' | 'cancelled'

export interface DonorRecord {
  id: string
  user_id: string
  blood_type: BloodType
  is_available: boolean
  latitude?: number | null
  longitude?: number | null
}

export interface BloodRequestRecord {
  id: string
  blood_type: BloodType
  units_requested: number
  units_fulfilled: number
  urgency_level: UrgencyLevel
  status: RequestStatus
  latitude?: number | null
  longitude?: number | null
}
