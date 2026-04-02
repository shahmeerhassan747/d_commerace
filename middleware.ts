import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/api/public']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // LOGGING FOR DEBUGGING - Check your server console
  console.log(`[AUTH MIDDLEWARE] Path: ${pathname}`)

  // 1. Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Include assets that might have leaked into the matcher
  const isPublicFile = pathname.includes('.') || pathname.startsWith('/_next')

  if (isPublicRoute || isPublicFile) {
    return NextResponse.next()
  }

  // 2. Check for the token cookie
  const token = request.cookies.get('token')?.value
  console.log(`[AUTH MIDDLEWARE] Token found: ${!!token}`)

  // 3. If no token, redirect to login page
  if (!token) {
    console.log(`[AUTH MIDDLEWARE] Redirecting ${pathname} -> /login`)
    const loginUrl = new URL('/login', request.url)
    // Add original path as a return_to parameter if desired
    // loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Ensure middleware only runs on meaningful routes, skipping static files, images, api, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
