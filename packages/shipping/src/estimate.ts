export function estimateHours(distanceKm: number) {
  const avgSpeedKmh = 25
  return +(distanceKm / avgSpeedKmh).toFixed(2)
}

export function distanceFactor(distanceKm: number) {
  if (distanceKm < 50) return 1
  if (distanceKm < 200) return 1.5
  return 2.5
}
