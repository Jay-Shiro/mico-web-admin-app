import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Handle unauthenticated users
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Get the first segment of the path to determine the section
    const section = pathname.split("/")[1];

    // Role-based route protection
    switch (section) {
      case "admin":
        if (token.role !== "admin") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        break;
      case "list":
        if (token.role !== "admin" && token.role !== "account") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        break;
      case "support":
        if (token.role !== "admin" && token.role !== "support") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        break;
      case "login":
        // Redirect authenticated users away from login
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/list/:path*",
    "/support/:path*",
    "/login",
    "/profile",
    "/settings",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
