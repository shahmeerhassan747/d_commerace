"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingCart, Minus, Plus, CreditCard, ShieldCheck, ArrowRight, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { api, CartItem } from "@/lib/api"

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null) // ID of item being updated/removed

  useEffect(() => {
    async function initCart() {
      try {
        setLoading(true)
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
        const userId = storedUserId ? parseInt(storedUserId, 10) : null;
        
        if (userId) {
          setCurrentUser(userId)
          const data = await api.getCart(userId)
          setItems(data || [])
        } else {
          setError("No user found. Please login first.")
        }
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch cart:", err)
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
          setError("Failed to load your cart. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }
    initCart()
  }, [])

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    if (!currentUser) return
    
    // Safety check for division by zero
    const price = item.product_price || 1;
    const currentQuantity = Math.max(1, Math.round(item.total_amount / price))
    const newQuantity = currentQuantity + delta
    if (newQuantity < 1) return

    try {
      setActionLoading(item.id)
      await api.updateCart(item.id, {
        product_id: 0, // Placeholder
        user_id: currentUser,
        total_amount: price * newQuantity
      })
      
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, total_amount: price * newQuantity } : i))
    } catch (err) {
      console.error("Failed to update quantity:", err)
      alert("Failed to update quantity. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      setActionLoading(itemId)
      await api.deleteCartItem(itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
    } catch (err) {
      console.error("Failed to remove item:", err)
      alert("Failed to remove item. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  const shipping = items.length > 0 ? 15.00 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl font-bold">Loading your shopping cart...</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50/50 dark:bg-black/50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <ShoppingCart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-3xl font-black">Shopping Cart</h1>
          <span className="text-muted-foreground font-medium ml-2">({items.length} items)</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed rounded-[2rem] bg-card">
            <Info className="w-12 h-12 text-destructive" />
            <p className="text-xl font-bold">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">Try Again</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-dashed rounded-[2rem] bg-card">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/20" />
            <div className="text-center">
              <h2 className="text-2xl font-bold">Your cart is empty</h2>
              <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
            </div>
            <Link href="/products">
              <Button className="rounded-full px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-6">
              <div className="bg-card rounded-[2rem] border shadow-sm overflow-hidden">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted shrink-0">
                        <Image 
                          src={`https://images.unsplash.com/photo-${1500000000000 + (item.id % 100) * 1000}?w=500&q=80`} 
                          alt={item.product_name || "Product"} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-lg leading-tight">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">Premium Selection</p>
                        <div className="flex items-center gap-2 pt-2">
                           <div className="text-xl font-black text-primary">${item.product_price}</div>
                           {item.product_discount ? (
                             <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0">-{item.product_discount}%</Badge>
                           ) : null}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto">
                        <div className="flex items-center bg-muted rounded-full p-1 w-fit">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full rounded-r-none hover:bg-background"
                            onClick={() => handleUpdateQuantity(item, -1)}
                            disabled={actionLoading === item.id}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-10 text-center font-bold text-sm">
                            {actionLoading === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                            ) : (
                              Math.round(item.total_amount / item.product_price)
                            )}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full rounded-l-none hover:bg-background"
                            onClick={() => handleUpdateQuantity(item, 1)}
                            disabled={actionLoading === item.id}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={actionLoading === item.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 shrink-0">
              <Card className="rounded-[2rem] border shadow-sm bg-card sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-black">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm font-medium">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping Estimate</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-black text-primary">${total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex gap-2">
                      <Input placeholder="Promo Code" className="rounded-full bg-muted/50 focus-visible:ring-primary/50" />
                      <Button variant="secondary" className="rounded-full font-bold">Apply</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 mt-2">
                  <Button size="lg" className="w-full rounded-full h-14 text-lg font-bold shadow-lg shadow-primary/20">
                    Checkout Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground mt-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Checkout
                  </div>
                  <div className="flex justify-center gap-2 mt-2 opacity-50 grayscale">
                     <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                     <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                     <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
