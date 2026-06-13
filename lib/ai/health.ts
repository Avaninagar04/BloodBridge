export interface DonorEligibilityInput {
  age?: number | null
  weightKg?: number | null
  healthConditions?: string | null
  medications?: string | null
}

export function assessDonorEligibility(input: DonorEligibilityInput) {
  const failedChecks: string[] = []

  if (input.age == null || input.age < 18 || input.age > 65) {
    failedChecks.push('Age must be between 18 and 65 years')
  }

  if (input.weightKg == null || input.weightKg < 50) {
    failedChecks.push('Weight must be at least 50 kg')
  }

  if (containsAny(input.healthConditions, ['hiv', 'hepatitis', 'tuberculosis', 'syphilis'])) {
    failedChecks.push('Some listed health conditions require medical clearance before donation')
  }

  if (containsAny(input.medications, ['warfarin', 'isotretinoin', 'accutane'])) {
    failedChecks.push('Some listed medications may prevent donation')
  }

  const eligible = failedChecks.length === 0

  return {
    eligible,
    score: eligible ? 100 : Math.max(0, 100 - failedChecks.length * 25),
    failedChecks,
    recommendation: eligible
      ? 'You appear eligible to create a donor profile. Final eligibility must be confirmed by medical staff.'
      : `Please review before donating: ${failedChecks.join(', ')}`,
  }
}

function containsAny(value: string | null | undefined, keywords: string[]) {
  const normalized = value?.toLowerCase() || ''
  return keywords.some((keyword) => normalized.includes(keyword))
}
