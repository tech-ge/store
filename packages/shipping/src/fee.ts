import { haversineKm } from './distance'
import { distanceFactor, estimateHours } from './estimate'

export interface ShippingInput {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  weightKg: number
  countryBaseRateUsd: number
  peakHour?: boolean
  express?: boolean
}

export function calculateShippingFee(input: ShippingInput) {
  const distanceKm = haversineKm(input.origin, input.destination)
  const dFactor = distanceFactor(distanceKm)
  const wFactor = Math.max(1, input.weightKg) * 0.3
  const timeFactor = input.peakHour ? 1.2 : 1
  const urgencyFactor = input.express ? 1.8 : 1

  const feeUsd = +(
    input.countryBaseRateUsd * dFactor * timeFactor * urgencyFactor + wFactor
  ).toFixed(2)

  return {
    distanceKm,
    estTimeHours: estimateHours(distanceKm),
    weightKg: input.weightKg,
    countryFactor: dFactor,
    finalFeeUsd: feeUsd
  }
}
