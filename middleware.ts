import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/account/login");
    const isAdminAuthPage = req.nextUrl.pathname.startsWith("/admin/login");

    // We skip Redis rate limiting in the Edge runtime (Next.js middleware limitation).
    // In a real enterprise app, use @upstash/redis for edge compatible rate limiting here.
    
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/account", req.url));
      }
      return NextResponse.next();
    }
    
    if (isAdminAuthPage) {
      if (isAuth && (token?.role === "ADMIN" || token?.role === "MANAGER")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api/admin")) {
      if (!isAuth) {
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'content-type': 'application/json' } });
        }
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (token?.role !== "ADMIN" && token?.role !== "MANAGER") {
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { 'content-type': 'application/json' } });
        }
        return NextResponse.redirect(new URL("/admin/login?error=AccessDenied", req.url));
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
  matcher: ["/account/:path*", "/admin/:path*", "/api/admin/:path*"],
};
