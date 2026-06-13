import type { BloodType } from '@/types/bloodbridge'

export const bloodTypes: BloodType[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const donorCompatibility: Record<BloodType, BloodType[]> = {
  'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'A+': ['A+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB+', 'AB-'],
  'AB+': ['AB+'],
}

export function canDonateTo(donorType: string, recipientType: string): boolean {
  if (!isBloodType(donorType) || !isBloodType(recipientType)) return false
  return donorCompatibility[donorType].includes(recipientType)
}

export function isBloodType(value: string): value is BloodType {
  return bloodTypes.includes(value as BloodType)
}

export function analyzeCompatibility(donorType: string, recipientType: string) {
  const compatible = canDonateTo(donorType, recipientType)

  return {
    compatible,
    donor: donorType,
    recipient: recipientType,
    message: compatible
      ? `${donorType} blood can safely be given to ${recipientType} recipients`
      : `${donorType} blood cannot be given to ${recipientType} recipients`,
  }
}
