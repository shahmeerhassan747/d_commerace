"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Heart, User, LogOut, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
  DropdownMenuGroup 
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api"

export function HeaderActions() {
  const router = useRouter()
  const [cartCount, setCartCount] = React.useState(0)
  const [wishlistCount, setWishlistCount] = React.useState(0)
  const [username, setUsername] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchCounts() {
      try {
        if (typeof window !== "undefined") {
          const storedUserId = localStorage.getItem("user_id")
          const storedUsername = localStorage.getItem("username")
          
          if (storedUserId) {
            setUsername(storedUsername)
            const userId = Number(storedUserId)
            const [cartData, wishlistData] = await Promise.all([
              api.getCart(userId),
              api.getWishlist(userId)
            ])
            setCartCount(cartData?.length || 0)
            setWishlistCount(wishlistData?.length || 0)
          }
        }
      } catch (err) {
        console.error("Failed to fetch header counts:", err)
      }
    }
    fetchCounts()
  }, [])

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative">
          <User className="h-5 w-5" />
        </Button>} />
        <DropdownMenuContent align="end" className="w-56 mt-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/profile" className="flex items-center w-full min-w-0" />}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<a href="/profile" className="flex items-center w-full min-w-0" />}>
              <Package className="mr-2 h-4 w-4" /> Orders
            </DropdownMenuItem>
            <DropdownMenuItem render={<a href="/wishlist" className="flex items-center w-full min-w-0" />}>
              <Heart className="mr-2 h-4 w-4" /> Wishlist
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token")
              localStorage.removeItem("user_id")
              localStorage.removeItem("username")
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
              router.push("/login")
              router.refresh()
            }
          }} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4 text-destructive" /> 
            <span className="text-destructive">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/wishlist">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative">
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground">
              {wishlistCount}
            </Badge>
          )}
        </Button>
      </Link>

      <Link href="/cart">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {cartCount}
            </Badge>
          )}
        </Button>
      </Link>
    </div>
  )
}
