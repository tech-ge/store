export async function sendPush(params: {
  userId: string
  title: string
  body: string
  data?: Record<string, unknown>
}) {
  // Placeholder for Firebase Cloud Messaging or Ably Push integration
  return { queued: true, ...params }
}
