"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Loader2, ArrowRight, User, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    user_name: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const newUser = await api.createUser(formData)
      
      // Automatically log the user in after registration
      const loginResponse = await api.login({
        username: formData.user_name,
        password: formData.password
      })

      if (typeof window !== "undefined") {
        localStorage.setItem("token", loginResponse.token)
        localStorage.setItem("user_id", loginResponse.user_id.toString())
        localStorage.setItem("username", loginResponse.username)
        
        // Also set a document cookie for middleware/auth guard
        document.cookie = `token=${loginResponse.token}; path=/; max-age=604800; samesite=strict`
      }

      // Redirect to profile with a full reload to ensure session is active
      window.location.href = "/profile"
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <Card className="w-full max-w-md rounded-3xl border-none shadow-2xl bg-white/70 backdrop-blur-xl border border-white/20">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black">Create Account</CardTitle>
          <CardDescription className="text-base">
            Enter your details to start your journey with us
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-2xl font-medium border border-destructive/20 mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="pl-10 rounded-xl bg-background/50 border-muted-foreground/20 h-11 focus:ring-primary/20"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Username
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user_name"
                  name="user_name"
                  placeholder="johndoe"
                  required
                  className="pl-10 rounded-xl bg-background/50 border-muted-foreground/20 h-11 focus:ring-primary/20"
                  value={formData.user_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 rounded-xl bg-background/50 border-muted-foreground/20 h-11 focus:ring-primary/20"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary font-bold hover:underline underline-offset-4">
              Sign In
            </a>
          </div>
          <div className="text-[10px] text-center text-muted-foreground/60 px-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
