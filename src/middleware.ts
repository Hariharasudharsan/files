import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales
export const locales = ['en', 'hi', 'ta']
export const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore requests to API, Admin, public files, Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Check for saved locale in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const locale = cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale

  // Redirect if there is no locale
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
