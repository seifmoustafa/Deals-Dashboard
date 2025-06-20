// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Regex to match any request for a file with an extension (e.g. .svg, .png, .css, .js, etc.)
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1) Whitelist public assets, Next internals, API and favicon ───────────────
  if (
    pathname.startsWith("/_next/") || // Next.js build files
    pathname.startsWith("/api/") || // API routes
    pathname === "/favicon.ico" || // Favicon
    PUBLIC_FILE.test(pathname) // Any file in /public (e.g. /login.svg, /logo.svg)
  ) {
    return NextResponse.next();
  }

  // ─── 2) Read your auth token ───────────────────────────────────────────────────
  const token = request.cookies.get("auth_token")?.value;

  // ─── 3) Detect if we’re on the login page ─────────────────────────────────────
  const isLoginPage = pathname === "/login";

  // ─── 4) Redirect rules ────────────────────────────────────────────────────────

  // a) If already logged in, don’t show them the login page
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/dashboard/users", request.url));
  }

  // b) If **not** logged in and trying to access **any other** page, send them to login
  if (!isLoginPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // c) Otherwise, everything’s fine
  return NextResponse.next();
}

// Apply this middleware to all routes except Next’s static/image handlers and favicon
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
