// Mock order types for development
export interface OrderWithDetails {
  id: string
  orderNumber: string
  customerId: string
  customer: {
    id: string
    name: string | null
    email: string | null
  }
  restaurantId: string
  restaurant: {
    id: string
    name: string
    address: string
    phone: string | null
    owner: {
      name: string | null
    } | null
  }
  riderId: string | null
  rider: {
    id: string
    name: string
    phone: string
  } | null
  status: string
  paymentStatus: string
  totalAmount: number
  deliveryFee: number
  subtotal: number
  customerAddress: string
  customerPhone: string
  orderItems: {
    id: string
    itemName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    notes: string | null
  }[]
  notes: string | null
  orderedAt: Date
  confirmedAt: Date | null
  deliveredAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type OrderFilterStatus = 'ALL' | 'PENDING' | 'DELIVERED' | 'CANCELLED'

export interface OrdersCount {
  all: number
  total: number
  pending: number
  delivered: number
  cancelled: number
}

// Status mapping for filtering
export const ORDER_STATUS_MAP = {
  pending: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'],
  delivered: ['DELIVERED'],
  cancelled: ['CANCELLED']
} as const;