"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingCart, Heart, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api, WishlistItem } from "@/lib/api"

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchWishlist() {
      try {
        setLoading(true)
        // Fetch users to get a valid user ID
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
        const currentUserId = storedUserId ? parseInt(storedUserId, 10) : null;
        
        if (!currentUserId) {
          setError("Please login to view your wishlist.");
          setLoading(false);
          return;
        }

        const data = await api.getWishlist(currentUserId)
        setItems(data || [])
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch wishlist:", err)
        if (err.message?.includes("404") || err.message?.includes("status: 404")) {
          // Stale session, user might be deleted
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            localStorage.removeItem("user_id")
            localStorage.removeItem("username")
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          }
          router.push("/login")
        } else {
          setError("Failed to load wishlist. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id)
      await api.deleteWishlist(id)
      setItems(prevItems => prevItems.filter(item => item.id !== id))
    } catch (err: any) {
      console.error("Failed to delete wishlist item:", err)
      alert(err.message || "Failed to remove item from wishlist.")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl font-bold">Loading your wishlist...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-3xl font-black">My Wishlist</h1>
        <Badge variant="secondary" className="ml-2 rounded-full px-3 py-1 font-bold text-sm bg-muted">
          {items.length} Items
        </Badge>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed rounded-[2rem]">
          <Info className="w-12 h-12 text-destructive" />
          <p className="text-xl font-bold">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">Try Again</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-dashed rounded-[2rem]">
          <Heart className="w-16 h-16 text-muted-foreground/20" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
            <p className="text-muted-foreground mt-2">Save items you love to find them easily later.</p>
          </div>
          <Link href="/products">
            <Button className="rounded-full px-8">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group overflow-hidden border border-border shadow-sm bg-card transition-all hover:shadow-lg rounded-[2rem]">
              <CardContent className="p-0 relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-muted">
                <Image 
                  src={`https://images.unsplash.com/photo-${1500000000000 + (item.id % 100) * 1000}?w=500&q=80`} 
                  alt={item.product_name || "Product"} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-destructive hover:text-white border-none h-10 w-10 text-muted-foreground transition-colors"
                  title="Remove from wishlist"
                  onClick={(e) => {
                    e.preventDefault(); // prevent triggering row level link if present
                    handleDelete(item.id);
                  }}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4 p-6">
                <div className="space-y-1 w-full">
                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.product_name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-black">${item.product_price}</p>
                    {item.product_discount ? (
                      <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0">-{item.product_discount}%</Badge>
                    ) : null}
                  </div>
                </div>
                <Button 
                  className="w-full rounded-full h-12 font-bold text-sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
