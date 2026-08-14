import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 30 requests per 10 seconds for general API traffic
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  analytics: true,
  prefix: "rate_limit",
});

export default withAuth(
  async function middleware(req) {
    const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Content-Type": "application/json",
          },
        });
      }
      return NextResponse.redirect(new URL("/429", req.url));
    }

    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/account/login");
    const isAdminAuthPage = req.nextUrl.pathname.startsWith("/admin/login");
      if (isAuth) {
        return NextResponse.redirect(new URL("/account", req.url));
      }
      return NextResponse.next();
    }
    
    if (isAdminAuthPage) {
      if (isAuth && (token?.role?.name === "ADMIN" || token?.role?.name === "MANAGER")) {
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
      if (token?.role?.name !== "ADMIN" && token?.role?.name !== "MANAGER") {
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
