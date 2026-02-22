// Rider types
export interface Rider {
  id: string
  riderName: string
  riderId: string
  phoneNumber: string
  email: string
  address: string
  status: string
  verificationStatus: string
  registrationDate: Date
  vehicleType: string
  licenseNumber: string
}

export interface RiderWithDetails {
  id: string
  riderName: string
  riderId: string
  phoneNumber: string
  email: string
  address: string
  status: string
  registrationDate: Date
  vehicleType: string
  licenseNumber: string
  owner?: {
    id: string
    name: string | null
    email: string | null
  } | null
  rating?: number
  totalDeliveries?: number
  createdAt: Date
  updatedAt: Date
}

export type RiderFilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED'

export interface RidersCount {
  total: number
  pending: number
  approved: number
  rejected: number
  disabled: number
}

// Status mapping for filtering
export const RIDER_STATUS_MAP = {
  pending: ['PENDING', 'DOCUMENTS_PENDING', 'PROFILE_INCOMPLETE'],
  approved: ['APPROVED'],
  rejected: ['REJECTED'],
  disabled: ['DISABLED']
};