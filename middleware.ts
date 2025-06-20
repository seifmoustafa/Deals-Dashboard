import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  // Check if the user is trying to access the login page
  const isLoginPage = request.nextUrl.pathname === "/login"

  // Check if the user is trying to access a protected page
  const isProtectedPage =
    !request.nextUrl.pathname.startsWith("/_next") && !request.nextUrl.pathname.startsWith("/api") && !isLoginPage

  // If user is logged in and trying to access login page, redirect to users page
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/dashboard/users", request.url))
  }

  // If user is not logged in and trying to access a protected page, redirect to login
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
