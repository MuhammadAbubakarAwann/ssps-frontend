// Define types manually until Prisma client is regenerated
export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'

export type User = {
  id: string
  name?: string | null
  email?: string | null
  emailVerified?: Date | null
  image?: string | null
  role: Role
  createdAt: Date
  updatedAt: Date
}

export type Account = {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
  createdAt: Date
  updatedAt: Date
}

export type Session = {
  id: string
  sessionToken: string
  userId: string
  expires: Date
  createdAt: Date
  updatedAt: Date
}

export type VerificationToken = {
  identifier: string
  token: string
  expires: Date
}

export type CreateUserInput = {
  email?: string
  name?: string
  role?: Role
}

export type SubscriptionPlan = {
  id: string
  restaurantId: string | null
  isSystemPlan: boolean
  name: string
  description: string
  planType: string
  durationWeeks: number
  price: number
  mealsPerWeek: number
  paymentFrequency: string
  weeklyPrice: number
  biweeklyPrice: number
  monthlyPrice: number
  startDayOfWeek: number
  deliveryDays: number[]
  features: string[]
  isActive: boolean
  isMostPopular: boolean
  createdAt: string
  updatedAt: string
  restaurant: any
  activatedByRestaurants: any[]
  customerPlans: any[]
  _count: {
    customerPlans: number
    activatedByRestaurants: number
  }
}

export type CreateSubscriptionPlanInput = {
  name: string
  price: number | string
  mealsIncluded: number
  features: string[]
  isActive: boolean
  isMostPopular: boolean
}

export type UpdateSubscriptionPlanInput = Partial<CreateSubscriptionPlanInput> & {
  id: string
}

export type UpdateUserInput = {
  name?: string
  email?: string
  emailVerified?: Date
  image?: string
  role?: Role
}

export type UserWithRelations = User & {
  accounts?: Account[]
  sessions?: Session[]
  _count?: {
    accounts: number
    sessions: number
  }
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}