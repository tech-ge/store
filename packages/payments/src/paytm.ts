export async function createPaytmOrder(params: { orderId: string; amountInr: number }) {
  // Paytm requires checksum generation. Skipped at package layer; implement in API route.
  return { orderId: params.orderId, amount: params.amountInr }
}
