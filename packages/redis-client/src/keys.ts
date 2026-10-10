export const K = {
  rate: (currency: string) => `rate:USD:${currency}`,
  country: (cc: string) => `country:${cc}`,
  fxLock: (userId: string) => `fxl:${userId}`,
  session: (sid: string) => `sess:${sid}`,
  rlIp: (ip: string) => `rl:ip:${ip}`,
  rlLogin: (email: string) => `rl:login:${email}`,
  otp: (userId: string) => `otp:${userId}`,
  product: (id: string) => `product:${id}`,
  trending: () => `search:trending`
}
