import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/account/login");

    // We skip Redis rate limiting in the Edge runtime (Next.js middleware limitation).
    // In a real enterprise app, use @upstash/redis for edge compatible rate limiting here.
    
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/account", req.url));
      }
      return null;
    }

    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/account/login", req.url));
      }
      if (token?.role !== "ADMIN" && token?.role !== "MANAGER") {
        return NextResponse.redirect(new URL("/account/login?error=AccessDenied", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle it
    },
  }
);

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
