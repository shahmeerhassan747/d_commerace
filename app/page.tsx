"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Star, Zap, Clock, ShieldCheck, Truck, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, Product, PaginatedProducts } from "@/lib/api"
import { Loader2 } from "lucide-react"

const HERO_IMAGES = [
  {
    url: "/hero_banner_1.webp",
    title: "Revolutionize Your Tech",
    subtitle: "Up to 50% off on the latest gadgets and accessories.",
    color: "bg-indigo-900"
  },
  {
    url: "/hero_banner_2.webp",
    title: "Elevate Your Living",
    subtitle: "Premium home decor and lifestyle essentials for the modern home.",
    color: "bg-slate-900"
  }
]

const CATEGORIES = [
  { name: "Electronics", icon: "📱", items: "1.2k+ Items", color: "bg-blue-50" },
  { name: "Fashion", icon: "👗", items: "3.5k+ Items", color: "bg-pink-50" },
  { name: "Home Decor", icon: "🏠", items: "2.1k+ Items", color: "bg-amber-50" },
  { name: "Beauty", icon: "💄", items: "1.8k+ Items", color: "bg-purple-50" },
  { name: "Sports", icon: "🏀", items: "900+ Items", color: "bg-green-50" },
  { name: "Toys", icon: "🧸", items: "1.5k+ Items", color: "bg-orange-50" },
]

const FLASH_DEALS = [
  {
    id: 1,
    name: "Aura Pro Wireless Headphones",
    price: 129.99,
    originalPrice: 249.99,
    discount: 48,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    rating: 4.8,
    sold: 124
  },
  {
    id: 2,
    name: "Lumix Smart Watch Series 5",
    price: 199.00,
    originalPrice: 349.00,
    discount: 42,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    rating: 4.9,
    sold: 85
  },
  {
    id: 3,
    name: "Nordic Minimalist Desk Lamp",
    price: 45.50,
    originalPrice: 89.00,
    discount: 49,
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&q=80",
    rating: 4.7,
    sold: 230
  },
  {
    id: 4,
    name: "Zenith Mechanical Keyboard",
    price: 89.99,
    originalPrice: 159.99,
    discount: 44,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80",
    rating: 4.6,
    sold: 156
  }
]

export default function Home() {
  const [timeLeft, setTimeLeft] = React.useState({ hours: 12, minutes: 45, seconds: 30 })
  const [productsData, setProductsData] = React.useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const data = await api.getProducts(1, 10)
        setProductsData(data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    loadProducts()

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mt-6">
        <Carousel className="w-full overflow-hidden rounded-3xl" opts={{ loop: true }}>
          <CarouselContent>
            {HERO_IMAGES.map((hero, index) => (
              <CarouselItem key={index}>
                <div className={`relative h-[400px] md:h-[550px] w-full flex items-center overflow-hidden ${hero.color}`}>
                  <div className="absolute inset-0 opacity-50">
                    <Image 
                      src={hero.url} 
                      alt={hero.title} 
                      fill 
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                  <div className="relative z-10 w-full max-w-2xl px-8 md:px-16 space-y-6">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none px-4 py-1 backdrop-blur-md">
                      NEW ARRIVAL
                    </Badge>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">
                      {hero.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-lg">
                      {hero.subtitle}
                    </p>
                    <div className="flex gap-4 pt-4">
                      <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold">
                        Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                      <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg font-bold bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white/20">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-6 bg-white/20 text-white border-none backdrop-blur-md hover:bg-white/40" />
          <CarouselNext className="right-6 bg-white/20 text-white border-none backdrop-blur-md hover:bg-white/40" />
        </Carousel>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-card border rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold">Fast Delivery</h4>
              <p className="text-xs text-muted-foreground">To over 200 countries</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold">Secure Payment</h4>
              <p className="text-xs text-muted-foreground">100% encryption protected</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold">Easy Returns</h4>
              <p className="text-xs text-muted-foreground">30-day money-back guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold">24/7 Support</h4>
              <p className="text-xs text-muted-foreground">Our team is always here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">Shop by Category</h2>
          <Button variant="ghost" className="font-bold group text-primary">
            View All Categories <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat) => (
            <a key={cat.name} href="#" className={`group p-6 rounded-3xl flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-2 ${cat.color} border border-transparent hover:border-primary/20`}>
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
              <p className="text-xs text-muted-foreground">{cat.items}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      <section className="container mx-auto px-4">
        <div className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10">
          <div className="flex flex-col md:row items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-primary fill-primary animate-pulse" />
              <h2 className="text-3xl font-black">Flash Deals</h2>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm font-bold text-muted-foreground uppercase">Ends in:</span>
                <div className="flex gap-1">
                  {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((t, i) => (
                    <div key={i} className="bg-primary text-primary-foreground px-3 py-1 rounded-lg font-black min-w-[3rem] text-center">
                      {t.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button size="lg" className="rounded-full px-8">View All Deals</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FLASH_DEALS.map((deal) => (
              <Link key={deal.id} href={`/products/${deal.id}`} className="block">
                <Card className="group overflow-hidden border-none shadow-none bg-transparent h-full">
                  <CardContent className="p-0 relative aspect-square rounded-2xl overflow-hidden bg-white">
                    <Badge className="absolute top-4 left-4 z-10 bg-destructive text-destructive-foreground">
                      -{deal.discount}%
                    </Badge>
                    <Image 
                      src={deal.image} 
                      alt={deal.name} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Button className="w-full rounded-full bg-white text-black hover:bg-zinc-100 font-bold cursor-pointer">
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2 p-4">
                    <div className="flex items-center gap-1 text-sm text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-500" /> {deal.rating}
                      <span className="text-muted-foreground font-medium ml-1">({deal.sold} sold)</span>
                    </div>
                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{deal.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-primary">${deal.price}</span>
                      <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Tabbed */}
      <section className="container mx-auto px-4">
        <Tabs defaultValue="trending" className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <h2 className="text-3xl font-black">Featured Collection</h2>
            <TabsList className="bg-muted p-1 rounded-full h-12">
              <TabsTrigger value="trending" className="rounded-full px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Trending</TabsTrigger>
              <TabsTrigger value="new" className="rounded-full px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">New Arrivals</TabsTrigger>
              <TabsTrigger value="best" className="rounded-full px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Best Sellers</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="trending" className="mt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Curating your style...</p>
              </div>
            ) : error ? (
              <div className="text-center p-20 text-destructive font-medium border-2 border-dashed border-destructive/20 rounded-3xl">
                {error}
              </div>
            ) : !productsData || productsData.products.length === 0 ? (
              <div className="text-center p-20 text-muted-foreground italic border-2 border-dashed rounded-3xl">
                No products found in this collection.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {productsData?.products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group space-y-4 block">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                      <Image 
                        src={product.image || `https://images.unsplash.com/photo-${1500000000000 + product.id * 1000}?w=500&q=80`}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="icon" className="rounded-full bg-white shadow-xl hover:bg-primary hover:text-white border-none cursor-pointer">
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Catalogue</p>
                      <h4 className="font-bold line-clamp-1">{product.name}</h4>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-black text-lg">${product.price}</p>
                        {product.review_count > 0 && (
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                             <Star className="w-3 h-3 fill-amber-500" /> {product.rating || 0} ({product.review_count})
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && productsData && productsData.total > productsData.products.length && (
              <div className="flex justify-center mt-12">
                <Button variant="outline" size="lg" className="rounded-full px-10 h-14 font-bold border-2" onClick={async () => {
                  try {
                    setLoading(true);
                    const nextPage = productsData.page + 1;
                    const newData = await api.getProducts(nextPage, productsData.limit);
                    setProductsData({
                      ...newData,
                      products: [...productsData.products, ...newData.products]
                    });
                  } catch (err) {
                    console.error("Load more failed", err);
                  } finally {
                    setLoading(false);
                  }
                }}>
                  Load More Products
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="new">
             <div className="flex items-center justify-center p-20 text-muted-foreground italic border-2 border-dashed rounded-3xl">
               Nothing here yet! Check back soon.
             </div>
          </TabsContent>
          <TabsContent value="best">
             <div className="flex items-center justify-center p-20 text-muted-foreground italic border-2 border-dashed rounded-3xl">
               Nothing here yet! Check back soon.
             </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Newsletter / CTA */}
      <section className="container mx-auto px-4 py-10">
         <div className="relative rounded-[3rem] bg-indigo-600 overflow-hidden p-12 md:p-24 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
               <h2 className="text-4xl md:text-6xl font-black text-white">Join the D-Commerce Elite</h2>
               <p className="text-indigo-100 text-lg md:text-xl">Get early access to sales, exclusive drops, and personalized recommendations delivered to your inbox.</p>
               <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input placeholder="Enter your email" className="h-14 bg-white border-none text-black rounded-full px-6 placeholder:text-zinc-400" />
                  <Button size="lg" className="h-14 px-10 rounded-full bg-black text-white hover:bg-zinc-900 border-none font-bold">Subscribe</Button>
               </div>
               <p className="text-indigo-200 text-sm">By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
         </div>
      </section>
    </div>
  )
}
