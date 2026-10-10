export type OrderStatus =
  | 'pending_payment'
  | 'paid_20'
  | 'assigned_driver'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderPricing {
  subtotalUsd: number
  subtotalLocal: number
  insuranceUsd: number
  shippingUsd: number
  totalUsd: number
  totalLocal: number
  payNowUsd: number
  payNowLocal: number
  payLaterUsd: number
  payLaterLocal: number
}
