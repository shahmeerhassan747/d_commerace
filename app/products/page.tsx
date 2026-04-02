"use client"

import { useEffect, useState, use } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Filter, ChevronDown, Star, Heart, Loader2, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api, Product, PaginatedProducts } from "@/lib/api"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search")
  
  const [data, setData] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        if (searchQuery) {
          // Reset page to 1 for new search
          const results = await api.searchProducts({ name: searchQuery })
          // Normalize search results to PaginatedProducts format
          setData({
            total: results.length,
            page: 1,
            limit: results.length,
            products: results.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              rating: p.rating || 0, // Fallback if missing
              review_count: p.review_count || 0, // Fallback if missing
              image: p.image
            }))
          })
        } else {
          const result = await api.getProducts(page)
          setData(result)
        }
        setError(null)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [page, searchQuery])

  const products = data?.products || []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {data ? `Showing ${products.length} of ${data.total} results` : "Loading products..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button variant="outline" className="rounded-full">
            Sort by: Recommended <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters (Hidden on smaller screens) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {['Electronics', 'Fashion', 'Home Decor', 'Beauty', 'Sports'].map(c => (
                <li key={c} className="flex justify-between hover:text-primary cursor-pointer transition-colors">
                  <span>{c}</span>
                  <span className="text-muted-foreground/50">({Math.floor(Math.random() * 1000)})</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading && page === 1 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Fetching premium products...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <p className="text-destructive font-semibold">{error}</p>
              <Button onClick={() => setPage(1)} variant="outline" className="rounded-full">Try Again</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
              <div className="p-6 bg-muted rounded-full">
                <SearchX className="w-16 h-16 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">No products found</h2>
                <p className="text-muted-foreground">We couldn't find any products matching your search.</p>
              </div>
              <Button onClick={() => window.location.href = '/products'} className="rounded-full px-8">
                Clear Search & Browse All
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="group overflow-hidden border-none shadow-none bg-transparent h-full">
                      <CardContent className="p-0 relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
                        <Image 
                          src={product.image || `https://images.unsplash.com/photo-${1500000000000 + product.id * 1000}?w=500&q=80`}
                          alt={product.name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                          <Button variant="secondary" size="icon" className="rounded-full bg-white shadow-md hover:bg-primary hover:text-white border-none h-8 w-8">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <Button className="w-full rounded-full bg-white text-black hover:bg-zinc-100 font-bold h-9">
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-1 p-3">
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500" /> {product.rating || "N/A"}
                          <span className="text-muted-foreground font-medium ml-1">({product.review_count || 0})</span>
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-black text-primary">${product.price}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {data && data.total > products.length && !searchQuery && (
                <div className="mt-12 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full px-12"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
