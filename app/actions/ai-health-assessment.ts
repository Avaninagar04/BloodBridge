'use server'

import { assessDonorEligibility as assessEligibility } from '@/lib/ai/health'
import { scoreEmergencyPriority } from '@/lib/blood/matching'

export async function assessDonorEligibility(answers: Record<string, any>) {
  return assessEligibility({
    age: Number(answers.age),
    weightKg: Number(answers.weightKg ?? answers.weight),
    healthConditions: Array.isArray(answers.healthConditions)
      ? answers.healthConditions.join(', ')
      : answers.healthConditions,
    medications: Array.isArray(answers.medications)
      ? answers.medications.join(', ')
      : answers.medications,
  })
}

export async function assessRecipientNeed(context: {
  urgency: 'normal' | 'urgent' | 'critical'
  bloodType: string
  unitsNeeded: number
  medicalCondition: string
}) {
  const score = scoreEmergencyPriority({
    urgency: context.urgency,
    unitsNeeded: context.unitsNeeded,
    neededWithinHours: context.urgency === 'critical' ? 1 : context.urgency === 'urgent' ? 6 : 24,
  })

  return {
    score,
    message:
      context.urgency === 'critical'
        ? 'Critical need - Immediate action required'
        : context.urgency === 'urgent'
          ? 'Urgent need - High priority'
          : 'Normal need - Routine request',
    recommendedTimeframe:
      context.urgency === 'critical'
        ? '< 1 hour'
        : context.urgency === 'urgent'
          ? '< 6 hours'
          : '< 24 hours',
    bloodType: context.bloodType,
    unitsNeeded: context.unitsNeeded,
    medicalContext: context.medicalCondition,
    priorityMultiplier: score / 50,
  }
}

export async function getPreDonationTips(bloodType: string) {
  return {
    generalTips: [
      'Drink plenty of fluids, especially water, in the days leading up to donation',
      'Eat iron-rich foods like spinach, beans, and red meat',
      'Get a good night of sleep before donating',
      'Avoid heavy exercise 24 hours before donation',
      'Have a healthy meal 2-3 hours before your appointment',
      'Bring a valid ID',
    ],
    bloodTypeInfo:
      {
        'O-': 'As a universal donor, your blood is in high demand.',
        'AB+': 'As a universal recipient, your matching is more flexible.',
        'O+': 'O+ blood is common and frequently needed.',
        'AB-': 'AB- is rare and especially valuable in emergencies.',
      }[bloodType] || 'Your blood type is valuable for matching with compatible recipients.',
  }
}

export async function getPostDonationCare() {
  return {
    immediate: [
      'Rest for at least 10-15 minutes after donation',
      'Have a snack and drink plenty of fluids',
      'Avoid strenuous activity for 24 hours',
    ],
    next24Hours: [
      'Drink extra fluids throughout the day',
      'Eat iron-rich foods to replenish your blood',
      'Keep the bandage on for at least 4 hours',
    ],
    recovery: [
      'Most donors feel fine after a few hours',
      'Contact the donation center if symptoms persist',
      'You can usually donate whole blood again after 56 days',
    ],
  }
}
