"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowRight, Lock, User, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await api.login({ username, password })
      
      // Store token and user details in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.token)
        localStorage.setItem("user_id", response.user_id.toString())
        localStorage.setItem("username", response.username)
        
        // Also set a document cookie for middleware to access
        document.cookie = `token=${response.token}; path=/; max-age=604800; samesite=strict`
      }

      setSuccess(true)
      
      // Redirect after a short delay to show success state
      setTimeout(() => {
        window.location.href = "/"
      }, 500)

    } catch (err: any) {
      console.error("Login Error:", err)
      setError(err.message || "Invalid username or password. Please try again.")
    } finally {
      if (!success) setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10 space-y-2">
          <Link href="/" className="inline-block text-3xl font-black tracking-tighter text-primary mb-6">
            D.COMMERCE
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">Enter your details to access your account</p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 shadow-2xl shadow-primary/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    id="username" 
                    placeholder="johndoe" 
                    className="h-14 pl-12 rounded-2xl bg-background/50 focus-visible:ring-primary border-primary/10 transition-colors hover:border-primary/30" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm font-semibold text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••" 
                    className="h-14 pl-12 rounded-2xl bg-background/50 focus-visible:ring-primary border-primary/10 transition-colors hover:border-primary/30" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold text-center border border-destructive/20">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full h-14 rounded-full text-lg font-bold transition-all shadow-lg ${success ? 'bg-green-600 hover:bg-green-700 shadow-green-600/25' : 'shadow-primary/25'}`}
              disabled={loading || success}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Authenticated
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="font-bold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
