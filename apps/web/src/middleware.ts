import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const country = req.headers.get('x-vercel-ip-country') || 'US'

  const res = NextResponse.next()
  res.headers.set('x-country', country)
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  const existing = req.cookies.get('country')?.value
  if (existing !== country) {
    res.cookies.set('country', country, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax'
    })
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
