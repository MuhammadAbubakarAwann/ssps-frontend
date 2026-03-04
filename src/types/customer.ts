// Customer types
export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  avatar: string | null
  registrationDate: Date
  totalOrders: number
  totalSpendings: number
  subscriptionPlan: 'basic' | 'standard' | 'premium' | null
}

export interface CustomerWithDetails extends Customer {
  customerId: string
  address?: string
  status?: string
  createdAt: Date
  updatedAt: Date
}

// Subscription plan mapping
export const SUBSCRIPTION_PLAN_MAP = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium'
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLAN_MAP;