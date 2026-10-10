/// <reference path="./tronweb.d.ts" />

type TronWebCtor = new (opts: { fullHost: string; privateKey?: string }) => any

let cached: any = null

export async function getTron(): Promise<any> {
  if (cached) return cached
  const mod = await import('tronweb').catch(() => null as any)
  if (!mod) throw new Error('tronweb not installed')
  const Ctor: TronWebCtor = (mod as any).default || (mod as any).TronWeb
  cached = new Ctor({
    fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
    privateKey: process.env.TRON_HOT_WALLET_PK
  })
  return cached
}

export async function createTrc20Address() {
  const tron = await getTron()
  const account = await tron.createAccount()
  return {
    address: account.address.base58,
    privateKey: account.privateKey
  }
}
