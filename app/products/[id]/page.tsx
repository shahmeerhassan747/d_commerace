"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, Heart, Share2, Truck, ShieldCheck, ChevronRight, Minus, Plus, Loader2, Info, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { api, SpecificProduct, ProductUpdate, ReviewResponse, ReviewCreate, WishlistCreate } from "@/lib/api"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [product, setProduct] = React.useState<SpecificProduct | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [reviews, setReviews] = React.useState<ReviewResponse[]>([])
  const [newReviewRating, setNewReviewRating] = React.useState(5)
  const [newReviewComment, setNewReviewComment] = React.useState("")
  const [currentUser, setCurrentUser] = React.useState<number | null>(null)
  const [submittingReview, setSubmittingReview] = React.useState(false)
  const [reviewSuccess, setReviewSuccess] = React.useState(false)
  const [editingReview, setEditingReview] = React.useState<ReviewResponse | null>(null)
  const [editReviewRating, setEditReviewRating] = React.useState(5)
  const [editReviewComment, setEditReviewComment] = React.useState("")
  const [updatingReview, setUpdatingReview] = React.useState(false)
  const [reviewToDelete, setReviewToDelete] = React.useState<ReviewResponse | null>(null)
  const [deletingReviewStatus, setDeletingReviewStatus] = React.useState(false)
  const [addingToCart, setAddingToCart] = React.useState(false)
  const [cartSuccess, setCartSuccess] = React.useState(false)
  const [addingToWishlist, setAddingToWishlist] = React.useState(false)
  const [wishlistSuccess, setWishlistSuccess] = React.useState(false)

  const handleAddToCart = async () => {
    if (!product || !currentUser) {
      if (!currentUser) alert("No valid user found to add items to cart.")
      return
    }

    try {
      setAddingToCart(true)
      await api.addToCart({
        product_id: product.id,
        user_id: currentUser,
        total_amount: product.price * quantity
      })
      setCartSuccess(true)
      setTimeout(() => setCartSuccess(false), 3000)
    } catch (err: any) {
      console.error("Failed to add to cart:", err)
      alert(err.message || "Failed to add to cart.")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!product || !currentUser) {
      if (!currentUser) alert("No valid user found to add to wishlist.")
      return
    }

    try {
      setAddingToWishlist(true)
      await api.addToWishlist({
        product_id: product.id,
        user_id: currentUser,
      })
      setWishlistSuccess(true)
      setTimeout(() => setWishlistSuccess(false), 3000)
    } catch (err: any) {
      console.error("Failed to add to wishlist:", err)
      alert(err.message || "Failed to add to wishlist.")
    } finally {
      setAddingToWishlist(false)
    }
  }

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [productData, reviewsData] = await Promise.all([
          api.getProduct(id),
          api.getReviews()
        ])
        setProduct(productData)
        // Filter reviews for this product using ID for robustness
        setReviews(reviewsData.filter(r => r.product_id === productData.id))
        
        // Set a valid current user if available
        if (typeof window !== "undefined") {
          const storedUserId = localStorage.getItem("user_id")
          if (storedUserId) {
            setCurrentUser(parseInt(storedUserId, 10))
          }
        }
        
        setError(null)
      } catch (err) {
        console.error("Failed to fetch product data:", err)
        setError("Failed to load product details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await api.deleteProduct(id)
      router.push("/products")
    } catch (err: any) {
      console.error("Failed to delete product:", err)
      alert(err.message || "Failed to delete product.")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !currentUser) {
      if (!currentUser) alert("No valid user found to submit a review.")
      return
    }

    try {
      setSubmittingReview(true)
      const reviewData: ReviewCreate = {
        rating: newReviewRating,
        review: newReviewComment,
        user_id: currentUser,
        product_id: product.id
      }

      const result = await api.createReview(reviewData)
      
      // Update local reviews list
      setReviews(prev => [{
        id: result.id,
        rating: result.rating,
        review: result.review,
        user_name: "You (Reviewer)",
        product_name: product.name,
        user_id: result.user_id,
        product_id: result.product_id
      }, ...prev])

      setReviewSuccess(true)
      setNewReviewComment("")
      setNewReviewRating(5)
      
      setTimeout(() => setReviewSuccess(false), 3000)

    } catch (err: any) {
      console.error("Failed to submit review:", err)
      alert(err.message || "Failed to submit review.")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleReviewUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReview || !product || !currentUser) return

    try {
      setUpdatingReview(true)
      const reviewData: ReviewCreate = {
        rating: editReviewRating,
        review: editReviewComment,
        user_id: currentUser,
        product_id: product.id
      }

      const result = await api.updateReview(editingReview.id, reviewData)
      
      // Update local reviews list
      setReviews(prev => prev.map(r => r.id === editingReview.id ? {
        ...r,
        rating: result.rating,
        review: result.review
      } : r))

      setEditingReview(null)
      setReviewSuccess(true)
      setTimeout(() => setReviewSuccess(false), 3000)

    } catch (err: any) {
      console.error("Failed to update review:", err)
      alert(err.message || "Failed to update review.")
    } finally {
      setUpdatingReview(false)
    }
  }

  const startEditing = (review: ReviewResponse) => {
    setEditingReview(review)
    setEditReviewRating(review.rating)
    setEditReviewComment(review.review || "")
  }

  const handleReviewDelete = async () => {
    if (!reviewToDelete) return
    try {
      setDeletingReviewStatus(true)
      await api.deleteReview(reviewToDelete.id)
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id))
      setReviewToDelete(null)
    } catch (err: any) {
      console.error("Failed to delete review:", err)
      alert(err.message || "Failed to delete review.")
    } finally {
      setDeletingReviewStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl font-bold">Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <Info className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">{error || "Product not found"}</h1>
        <Button onClick={() => window.location.reload()} className="rounded-full px-8">Try Again</Button>
      </div>
    )
  }

  // Placeholder images for the detail page
  const images = [
    `https://images.unsplash.com/photo-${1500000000000 + Number(id) * 1000}?w=800&q=80`,
    `https://images.unsplash.com/photo-${1500000000000 + Number(id) * 1100}?w=800&q=80`,
    `https://images.unsplash.com/photo-${1500000000000 + Number(id) * 1200}?w=800&q=80`
  ]

  const originalPrice = product.price / (1 - (product.discount || 0) / 100)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-auto md:overflow-visible">
            {images.map((img, i) => (
              <button 
                key={i} 
                className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}
                onClick={() => setSelectedImage(i)}
              >
                <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 aspect-square rounded-[2rem] overflow-hidden bg-muted order-1 md:order-2 self-start">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
            {product.discount ? (
              <div className="absolute top-4 left-4">
                <Badge className="bg-destructive text-destructive-foreground font-bold px-3 py-1 text-sm">
                  Save ${((originalPrice - product.price)).toFixed(2)}
                </Badge>
              </div>
            ) : null}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-lg">{product.rating || "N/A"}</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground">{product.review_count} Reviews</span>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground">{Math.floor(product.sold || 0)}+ Sold</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black leading-tight">{product.name}</h1>
            
            <div className="flex items-end gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <span className="text-4xl font-black text-primary">${product.price}</span>
              {product.discount ? (
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
                  <span className="text-sm font-bold text-destructive">
                    -{product.discount}% Discount
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold">Quantity <span className="text-muted-foreground font-medium text-xs ml-2">({product.quantity} available)</span></h3>
            <div className="flex items-center bg-muted rounded-full p-1 w-fit">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full rounded-r-none hover:bg-background"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full rounded-l-none hover:bg-background"
                onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="flex-1 rounded-full h-14 text-lg font-bold shadow-lg shadow-primary/20">
              Buy It Now
            </Button>
            <div className="flex-1 relative">
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full rounded-full h-14 text-lg font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {cartSuccess ? "Added to Cart!" : "Add to Cart"}
              </Button>
              {cartSuccess && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                  Item added!
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/products/${id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-14 w-14 rounded-full shrink-0")}
              >
                <Pencil className="w-5 h-5" />
              </Link>
              <Button size="icon" variant="outline" className="h-14 w-14 rounded-full shrink-0 text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className={cn("h-14 w-14 rounded-full relative shrink-0", wishlistSuccess && "text-destructive border-destructive")}
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
              >
                {addingToWishlist ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5", wishlistSuccess && "fill-current")} />}
                {wishlistSuccess && (
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                )}
              </Button>
              <Button size="icon" variant="outline" className="h-14 w-14 rounded-full shrink-0">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-6 bg-muted/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Free Worldwide Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Verified Product Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="details" className="w-full mt-12">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
          <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 text-lg font-bold">
            Product Details
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 text-lg font-bold">
            Customer Reviews ({product.review_count})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="pt-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-black">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description || "No description available."}</p>
              {product.custom && (
                <div>
                   <h4 className="font-bold text-lg mb-2">Specifications</h4>
                   <p className="text-muted-foreground">{product.custom}</p>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-black">Key Features</h3>
              <ul className="space-y-3">
                {product.key_features ? product.key_features.split(',').map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-primary/10 rounded-full shrink-0">
                      <ShieldCheck className="w-3 h-3 text-primary" />
                    </div>
                    <span>{feature.trim()}</span>
                  </li>
                )) : (
                  <li className="text-muted-foreground">Standard premium features included.</li>
                )}
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="pt-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Review Form */}
            <div className="lg:col-span-1 border border-primary/10 bg-primary/5 rounded-[2rem] p-8 h-fit space-y-6">
              <h3 className="text-2xl font-black">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={cn(
                            "w-8 h-8 transition-all", 
                            star <= newReviewRating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="comment" className="text-sm font-bold">Your Review</label>
                  <Textarea 
                    id="comment"
                    placeholder="Share your experience with this product..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="min-h-[120px] rounded-2xl resize-none focus-visible:ring-primary"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-full h-12 font-bold" 
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>

                {reviewSuccess && (
                  <div className="text-center text-sm font-bold text-green-600 animate-bounce">
                    Review submitted successfully!
                  </div>
                )}
              </form>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-8">
              <h3 className="text-2xl font-black">Customer Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 border border-border rounded-2xl space-y-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {review.user_name?.[0].toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold">{review.user_name || "Anonymous"}</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                  key={s} 
                                  className={cn(
                                    "w-4 h-4", 
                                    s <= (review.rating || 0) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                                  )} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Certified Buyer</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                            onClick={() => startEditing(review)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                            onClick={() => setReviewToDelete(review)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-20 text-muted-foreground italic border-2 border-dashed rounded-[2rem]">
                  No reviews yet. Be the first to share your thoughts!
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-[2rem] overflow-hidden p-0 gap-0">
          <div className="bg-destructive/10 p-8 flex justify-center">
            <div className="p-4 bg-destructive/20 rounded-full">
              <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
            </div>
          </div>
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-center">Delete product?</DialogTitle>
              <DialogDescription className="text-center text-base pt-2">
                This action cannot be undone. You are about to permanently remove <span className="font-bold text-foreground">"{product.name}"</span> from the platform.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 bg-transparent p-0 sm:justify-center border-none -mx-0 -mb-0 rounded-none">
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full h-12 px-8 font-bold order-2 sm:order-1"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="rounded-full h-12 px-8 font-black bg-destructive hover:bg-destructive/90 order-1 sm:order-2 shadow-lg shadow-destructive/20"
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}
                Confirm Delete
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Your Review</DialogTitle>
            <DialogDescription>
              Update your rating and comment for this product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReviewUpdate} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={cn(
                        "w-8 h-8 transition-all", 
                        star <= editReviewRating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-comment" className="text-sm font-bold">Your Review</label>
              <Textarea 
                id="edit-comment"
                placeholder="Share your experience..."
                value={editReviewComment}
                onChange={(e) => setEditReviewComment(e.target.value)}
                className="min-h-[120px] rounded-2xl resize-none"
                required
              />
            </div>

            <DialogFooter className="flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setEditingReview(null)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="rounded-full px-8 font-bold" 
                disabled={updatingReview}
              >
                {updatingReview ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Review Confirmation Dialog */}
      <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Delete review?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setReviewToDelete(null)}
              className="rounded-full"
              disabled={deletingReviewStatus}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReviewDelete}
              className="rounded-full px-8 font-bold"
              disabled={deletingReviewStatus}
            >
              {deletingReviewStatus ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
