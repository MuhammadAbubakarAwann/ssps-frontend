// Restaurant types
export interface Restaurant {
  id: string
  restaurantName: string
  restaurantId: string
  phoneNumber: string
  email: string
  address: string
  status: string
  verificationStatus: string
  registrationDate: Date
  cuisineType: string
}

export interface RestaurantWithDetails {
  id: string
  restaurantName: string
  restaurantId: string
  phoneNumber: string
  email: string
  address: string
  status: string
  registrationDate: Date
  cuisineType: string
  owner?: {
    id: string
    name: string | null
    email: string | null
  } | null
  description?: string | null
  rating?: number
  totalOrders?: number
  createdAt: Date
  updatedAt: Date
}

export type RestaurantFilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED'

export interface RestaurantsCount {
  total: number
  pending: number
  approved: number
  rejected: number
  disabled: number
}

// Status mapping for filtering
export const RESTAURANT_STATUS_MAP = {
  pending: ['PENDING', 'DOCUMENTS_PENDING', 'PROFILE_INCOMPLETE'],
  approved: ['APPROVED'],
  rejected: ['REJECTED'],
  disabled: ['DISABLED']
} as const;
