import type { NextResponse } from 'next/server'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production'
}

export function setAccessTokenCookie(res: NextResponse, accessToken: string) {
  res.cookies.set('accessToken', accessToken, {
    ...cookieOptions,
    path: '/',
    maxAge: 60 * 60
  })
}

export function setAuthCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  setAccessTokenCookie(res, accessToken)
  res.cookies.set('refreshToken', refreshToken, {
    ...cookieOptions,
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60
  })

  // Remove refresh cookies created by the previous, refresh-only path.
  res.cookies.set('refreshToken', '', {
    ...cookieOptions,
    path: '/api/auth/refresh',
    maxAge: 0
  })
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set('accessToken', '', {
    ...cookieOptions,
    path: '/',
    maxAge: 0
  })
  res.cookies.set('refreshToken', '', {
    ...cookieOptions,
    path: '/api/auth',
    maxAge: 0
  })
  res.cookies.set('refreshToken', '', {
    ...cookieOptions,
    path: '/api/auth/refresh',
    maxAge: 0
  })
}
