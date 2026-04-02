"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, DollarSign, List, Tag, Info, CheckCircle2, AlertCircle, Loader2, Plus, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { api, ProductCreate } from "@/lib/api"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [formData, setFormData] = React.useState<ProductCreate>({
    name: "",
    description: "",
    price: 0,
    quantity: 1,
    discount: 0,
    sold: 0,
    custom: "",
    key_features: "",
    image: "",
  })

  // Key features as a list for better UI
  const [features, setFeatures] = React.useState<string[]>([])
  const [newFeature, setNewFeature] = React.useState("")

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData(prev => ({ ...prev, image: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Prepare key_features as comma separated string
      const preparedData = {
        ...formData,
        key_features: features.join(", ")
      }

      const result = await api.createProduct(preparedData)
      setSuccess(true)
      
      // Auto redirect after success
      setTimeout(() => {
        router.push(`/products/${(result as any).id || ""}`)
      }, 2000)

    } catch (err: any) {
      console.error("Failed to create product:", err)
      setError(err.message || "Something went wrong while creating the product.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-2xl text-center">
        <div className="inline-flex items-center justify-center p-6 bg-green-500/10 rounded-full mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
        </div>
        <h1 className="text-4xl font-black mb-4">Product Created!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your product has been successfully added to D-Commerce. Redirecting you to the product page...
        </p>
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/products"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-black">Sell on D-Commerce</h1>
          <p className="text-muted-foreground italic mt-1 font-medium">Add a new premium product to your storefront.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Basic Information
              </CardTitle>
              <CardDescription>Tell us what you're selling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold ml-1">Product Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g. Premium Wireless Headphones" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold ml-1">Product Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe your product in detail..." 
                  className="min-h-[150px] rounded-2xl focus-visible:ring-primary resize-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Image */}
          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Product Image
              </CardTitle>
              <CardDescription>Upload a high-quality product photo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {!imagePreview ? (
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-3xl p-12 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-4 text-center group-hover:scale-105 transition-transform">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Click to upload photo</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG or WEBP (Max. 5MB)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-80 object-contain bg-muted/30"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="rounded-full h-12 w-12"
                      onClick={removeImage}
                    >
                      <X className="w-6 h-6" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-full h-12 font-bold px-6"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing and Inventory */}
          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Pricing & Inventory
              </CardTitle>
              <CardDescription>Set your price and stock levels.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 pt-8">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-bold ml-1">Price ($) *</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  required 
                  value={formData.price}
                  onChange={handleChange}
                  className="h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-bold ml-1">Quantity *</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  min="1" 
                  required 
                  value={formData.quantity}
                  onChange={handleChange}
                  className="h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-bold ml-1">Discount (%)</Label>
                <Input 
                  id="discount" 
                  name="discount" 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={formData.discount}
                  onChange={handleChange}
                  className="h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sold" className="text-sm font-bold ml-1">Initial "Sold" Count</Label>
                <Input 
                  id="sold" 
                  name="sold" 
                  type="number" 
                  min="0" 
                  value={formData.sold}
                  onChange={handleChange}
                  className="h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Features and Custom Specs */}
          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5 text-primary" /> Detailed Features
              </CardTitle>
              <CardDescription>Highlight the best parts of your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-4">
                <Label className="text-sm font-bold ml-1">Key Features</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a key feature..." 
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    className="h-12 rounded-xl focus-visible:ring-primary"
                  />
                  <Button type="button" onClick={addFeature} size="icon" className="h-12 w-12 shrink-0 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20">
                      {feature}
                      <button type="button" onClick={() => removeFeature(i)} className="hover:text-destructive transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {features.length === 0 && <p className="text-xs text-muted-foreground italic">No features added yet.</p>}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="custom" className="text-sm font-bold ml-1">Technical Specifications</Label>
                <Textarea 
                  id="custom" 
                  name="custom" 
                  placeholder="CPU: 8-core, RAM: 16GB, etc." 
                  className="min-h-[100px] rounded-2xl focus-visible:ring-primary resize-none"
                  value={formData.custom}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="bg-primary text-primary-foreground rounded-[2rem] border-none shadow-2xl shadow-primary/20 sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" /> Ready to publish?
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Review your details before going live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-white/10 rounded-2xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Product Name</span>
                  <span className="font-bold truncate max-w-[120px]">{formData.name || "---"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price</span>
                  <span className="font-black">${formData.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In Stock</span>
                  <span>{formData.quantity} units</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-4 bg-destructive text-destructive-foreground rounded-2xl text-xs font-bold leading-relaxed border border-white/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full h-14 bg-white text-primary hover:bg-white/90 rounded-full font-black text-lg" 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : "Publish Product"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-white/70 hover:text-white hover:bg-white/10 rounded-full font-bold"
                onClick={() => router.push("/products")}
                disabled={loading}
              >
                Discard Draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
