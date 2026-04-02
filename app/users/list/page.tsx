"use client"

import { useState, useEffect } from "react"
import { Users, Search, ShoppingCart, Heart, MessageSquare, ArrowRight, Loader2, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { api, UserListItem } from "@/lib/api"
import Link from "next/link"

export default function UserListPage() {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers()
        setUsers(data)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" /> Community
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover and connect with other members of our platform.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10 h-12 rounded-2xl bg-muted/50 border-none shadow-sm focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading community members...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="group overflow-hidden rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card border border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl transition-transform group-hover:scale-110 duration-300">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                    <CardDescription className="font-medium">@{user.user_name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/50">
                    <ShoppingCart className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="text-lg font-bold">{user.cart_items}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Cart</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/50">
                    <Heart className="w-4 h-4 text-rose-500 mb-1" />
                    <span className="text-lg font-bold">{user.wishlist_items}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Wish</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/50">
                    <MessageSquare className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="text-lg font-bold">{user.total_reviews}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Reviews</span>
                  </div>
                </div>
                <Link href={`/profile?id=${user.id}`} passHref>
                  <Button className="w-full h-11 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white border-none transition-all gap-2 group">
                    View Profile <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
          <UserIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">No users found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Try adjusting your search terms to find the members you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}
