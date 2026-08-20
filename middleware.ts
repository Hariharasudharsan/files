import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ['en', 'hi', 'ta'];
const defaultLocale = 'en';

function getLocale(request: NextRequest) {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && locales.includes(cookie)) return cookie;
  return defaultLocale;
}

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // 1. Auth Logic
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = pathname.includes("/account/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    // 2. i18n Logic
    // Ignore internal paths, APIs, admin, and static files
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/admin') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    const pathnameIsMissingLocale = locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
      const locale = getLocale(req);
      const url = new URL(`/${locale}${pathname === '/' ? '' : pathname}${req.nextUrl.search}`, req.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware handle it
    },
  }
);

export const config = {
  // Run middleware on all routes except static assets and api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
