"use client"

import * as React from "react"
import Link from "next/link"
import { Star, MessageSquare, ChevronRight, Loader2, ArrowLeft, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { api, ReviewResponse } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function ReviewsPage() {
  const [reviews, setReviews] = React.useState<ReviewResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true)
        const data = await api.getReviews()
        setReviews(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        setError("Failed to load reviews. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter(review => 
    review.review?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl font-bold">Loading customer feedback...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Customer Voices</h1>
          <p className="text-muted-foreground text-lg">See what our global community is saying about D-Commerce.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary px-6 py-4 rounded-3xl flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-3xl font-black">{reviews.length}</span>
            <span className="text-xs font-bold uppercase tracking-wider">Total Reviews</span>
          </div>
          <div className="bg-amber-500/10 text-amber-500 px-6 py-4 rounded-3xl flex flex-col items-center justify-center min-w-[120px]">
             <div className="flex items-center gap-1">
               <span className="text-3xl font-black">
                 {(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / (reviews.length || 1)).toFixed(1)}
               </span>
               <Star className="w-5 h-5 fill-current" />
             </div>
             <span className="text-xs font-bold uppercase tracking-wider">Avg. Rating</span>
          </div>
        </div>
      </div>

      <Separator className="mb-12" />

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search reviews, products or users..." 
            className="pl-12 h-14 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-none bg-muted/50 hover:bg-muted font-bold text-base gap-2">
          <Filter className="w-5 h-5" /> Filter
        </Button>
      </div>

      {error ? (
        <div className="p-12 text-center bg-destructive/5 rounded-[2rem] border border-destructive/10">
          <h2 className="text-2xl font-bold text-destructive mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="rounded-full px-8">Try Again</Button>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-8">
          {filteredReviews.map((review) => (
            <div key={review.id} className="group p-8 border border-border rounded-[2rem] space-y-6 hover:shadow-2xl hover:border-primary/20 transition-all duration-300 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {review.user_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{review.user_name || "Anonymous User"}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={cn(
                            "w-4 h-4 transition-all", 
                            s <= (review.rating || 0) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/20"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.product_id && (
                  <Link href={`/products/${review.product_id}`}>
                    <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-bold hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer">
                      View Product <ChevronRight className="w-3 h-3 ml-1" />
                    </Badge>
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  "{review.review}"
                </p>
                {review.product_name && (
                  <div className="pt-4 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground font-medium italic">Reviewed on</span>
                    <span className="font-bold text-primary">{review.product_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-32 text-center space-y-6 border-2 border-dashed rounded-[3rem] bg-muted/20">
          <div className="p-6 bg-muted rounded-full">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">No reviews found</h3>
            <p className="text-muted-foreground max-w-sm">We couldn't find any reviews matching your search. Try adjusting your items or keywords.</p>
          </div>
          <Button variant="outline" className="rounded-full px-8" onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-24 p-12 bg-primary/5 rounded-[3rem] border border-primary/10 text-center space-y-6">
        <h2 className="text-3xl font-black">Want to share your experience?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Your feedback helps millions of shoppers make better choices and helps us improve our collection.</p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-10 h-14 font-black text-lg mt-4">
            Review a Product
          </Button>
        </Link>
      </div>
    </div>
  )
}
