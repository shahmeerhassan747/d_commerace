"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Settings, Package, Heart, Bell, CreditCard, ChevronRight, User as UserIcon, Shield, Loader2, Save, X, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api, UserListItem } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  // const searchParams = useSearchParams()
  // const userIdFromUrl = searchParams.get("id") || "4" // Default to 4 if not provided
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<UserListItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    user_name: "",
    password: "",
    image: "",
  })

  useEffect(() => {
    // Check authentication and get ID client-side
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id')
      if (storedUserId) {
        setCurrentUserId(storedUserId)
      } else {
        router.push('/login')
        return
      }
    }
  }, [router])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUserId) return;
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.getUser(currentUserId)
        setProfile(data)
        setFormData({
          name: data.name,
          user_name: data.user_name,
          password: "",
          image: data.image || "",
        })
      } catch (err: any) {
        console.error("Failed to fetch user:", err)
        // If user is not found (404), they might have been deleted. Log them out.
        if (err.message?.includes("404") || err.message?.includes("status: 404")) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            localStorage.removeItem("user_id")
            localStorage.removeItem("username")
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          }
          router.push("/login")
        } else {
          setError("User not found or failed to load profile data.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUserId) {
      fetchUserData()
    }
  }, [currentUserId])

  const handleEdit = () => {
    if (!profile) return
    setFormData({ 
      name: profile.name, 
      user_name: profile.user_name, 
      password: "",
      image: profile.image || ""
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      await api.updateUser(profile.id, formData)
      setProfile({ 
        ...profile, 
        name: formData.name, 
        user_name: formData.user_name,
        image: formData.image
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!profile) return
    if (!confirm("Are you sure you want to delete this account? This action cannot be undone.")) return

    setIsDeleting(true)
    try {
      await api.deleteUser(profile.id)
      // Clear session data after deletion
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user_id")
        localStorage.removeItem("username")
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      }
      // Redirect to login after deletion
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Failed to delete account:", error)
      alert("Failed to delete account. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Fetching profile details...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-black mb-4">Profile Unavailable</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          {error || "We couldn't find the profile you're looking for. It may have been deleted or the link is broken."}
        </p>
        <Button onClick={() => router.push("/users/list")} className="rounded-full px-8 h-12">
          View All Users
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <div className="flex items-center gap-4 mb-8 p-4 bg-muted/50 rounded-2xl relative overflow-hidden group">
            {profile.image || formData.image ? (
              <img src={isEditing ? formData.image : profile.image} alt="Profile" className="w-16 h-16 rounded-full object-cover z-10" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl z-10">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            
            <div className="z-10 bg-muted/50 w-full rounded p-2">
              <h3 className="font-bold">{profile.name}</h3>
              <p className="text-xs text-muted-foreground">Certified Member</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Button variant="ghost" className="justify-start font-medium bg-primary/5 text-primary">
              <UserIcon className="w-4 h-4 mr-3" /> Personal Information
            </Button>
            <Button variant="ghost" className="justify-start font-medium text-muted-foreground hover:text-foreground">
              <Package className="w-4 h-4 mr-3" /> My Orders
            </Button>
            <Button variant="ghost" className="justify-start font-medium text-muted-foreground hover:text-foreground">
              <Heart className="w-4 h-4 mr-3" /> Wishlist
            </Button>
            <Button variant="ghost" className="justify-start font-medium text-muted-foreground hover:text-foreground">
              <CreditCard className="w-4 h-4 mr-3" /> Payment Methods
            </Button>
            <Button variant="ghost" className="justify-start font-medium text-muted-foreground hover:text-foreground" onClick={() => router.push("/settings")}>
              <Settings className="w-4 h-4 mr-3" /> Account Settings
            </Button>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Personal Information</h1>
            <Button variant="destructive" size="sm" className="rounded-xl gap-2 font-bold" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Account
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-2xl border-none shadow-sm bg-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="inline-flex items-center gap-2"><UserIcon className="w-5 h-5 text-primary" /> Profile Details</CardTitle>
                  <CardDescription>Manage personal information.</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={handleEdit}>Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl" onClick={handleCancel} disabled={isSaving}><X className="w-4 h-4" /></Button>
                    <Button variant="default" size="sm" className="rounded-xl" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {isEditing && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      {formData.image ? (
                        <img src={formData.image} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><UserIcon className="w-5 h-5 text-primary" /></div>
                      )}
                      <input ref={profileImageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" /><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => profileImageInputRef.current?.click()}>Upload Photo</Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Full Name</label>
                  {isEditing ? (
                    <Input name="name" value={formData.name} onChange={handleChange} className="rounded-xl h-10" />
                  ) : (
                    <p className="font-medium">{profile.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Username</label>
                  {isEditing ? (
                    <Input name="user_name" value={formData.user_name} onChange={handleChange} className="rounded-xl h-10" />
                  ) : (
                    <p className="font-medium text-primary">@{profile.user_name}</p>
                  )}
                </div>
                {isEditing && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Update Password (Optional)</label>
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="rounded-xl h-10" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Account Status</label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-xl font-black">{profile.cart_items}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Cart</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black">{profile.wishlist_items}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Wishlist</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black">{profile.total_reviews}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Reviews</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-card border">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Security</CardTitle>
                <CardDescription>Keep account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Password</h4>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="ghost" size="sm">Change</Button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <h4 className="font-bold text-sm">Two-Factor Auth</h4>
                    <p className="text-sm text-muted-foreground">Not enabled</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-card border mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">No activity yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Recent interactions and orders will appear here for tracking purposes.</p>
                <Button className="rounded-full px-8">Browse Products</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
