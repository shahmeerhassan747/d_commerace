"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"

const PUBLIC_ROUTES = ["/login", "/register", "/api/public"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"))

    if (!token && !isPublicRoute && pathname !== "/login") {
      console.log(`[AUTH GUARD] No token found. Redirecting ${pathname} -> /login`)
      router.push("/login")
    } else {
      setLoading(false)
    }
  }, [pathname, router])

  if (loading && !PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
