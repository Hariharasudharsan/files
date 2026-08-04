import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/account/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/account", req.url));
      }
      return null;
    }

    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/account/login?error=AccessDenied", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
