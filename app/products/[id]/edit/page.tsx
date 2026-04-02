"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, DollarSign, List, Info, CheckCircle2, AlertCircle, Loader2, Plus, X, Save, Trash2, AlertTriangle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { api, ProductUpdate, SpecificProduct } from "@/lib/api"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [formData, setFormData] = React.useState<ProductUpdate>({
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

  const [features, setFeatures] = React.useState<string[]>([])
  const [newFeature, setNewFeature] = React.useState("")

  React.useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const product = await api.getProduct(id)
        setFormData({
          name: product.name,
          description: product.description || "",
          price: product.price,
          quantity: product.quantity,
          discount: product.discount || 0,
          sold: product.sold || 0,
          custom: product.custom || "",
          key_features: product.key_features || "",
          image: product.image || ""
        })
        if (product.image) {
          setImagePreview(product.image)
        }
        if (product.key_features) {
          setFeatures(product.key_features.split(",").map(f => f.trim()))
        }
        setError(null)
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Failed to load product data.")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

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
    setSaving(true)
    setError(null)

    try {
      const preparedData = {
        ...formData,
        key_features: features.join(", ")
      }

      await api.updateProduct(id, preparedData)
      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/products/${id}`)
      }, 2000)

    } catch (err: any) {
      console.error("Failed to update product:", err)
      setError(err.message || "Something went wrong while updating the product.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await api.deleteProduct(id)
      router.push("/products")
    } catch (err: any) {
      console.error("Failed to delete product:", err)
      setError(err.message || "Failed to delete product.")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl font-bold">Loading product data...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-2xl text-center">
        <div className="inline-flex items-center justify-center p-6 bg-green-500/10 rounded-full mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
        </div>
        <h1 className="text-4xl font-black mb-4">Product Updated!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your changes have been successfully saved. Redirecting to product page...
        </p>
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/products/${id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-black">Edit Product</h1>
          <p className="text-muted-foreground italic mt-1 font-medium text-sm">Update the details for "{formData.name}".</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Basic Information
              </CardTitle>
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
              <CardDescription>Update your product photo.</CardDescription>
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

          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Pricing & Inventory
              </CardTitle>
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
                  min="0" 
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
                <Label htmlFor="sold" className="text-sm font-bold ml-1">Sold Count</Label>
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

          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5 text-primary" /> Detailed Features
              </CardTitle>
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
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="custom" className="text-sm font-bold ml-1">Technical Specifications</Label>
                <Textarea 
                  id="custom" 
                  name="custom" 
                  className="min-h-[100px] rounded-2xl focus-visible:ring-primary resize-none"
                  value={formData.custom}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-primary text-primary-foreground rounded-[2rem] border-none shadow-2xl shadow-primary/20 sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" /> Summary
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                You are updating this product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-white/10 rounded-2xl space-y-2">
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
                disabled={saving}
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> Update Product
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-white/70 hover:text-white hover:bg-white/10 rounded-full font-bold"
                onClick={() => router.push(`/products/${id}`)}
                disabled={saving || deleting}
              >
                Cancel Edits
              </Button>
              <Separator className="bg-white/20" />
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-destructive-foreground/70 hover:text-destructive-foreground hover:bg-destructive/20 rounded-full font-bold"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving || deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Product
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

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
                This action cannot be undone. You are about to permanently remove <span className="font-bold text-foreground">"{formData.name}"</span> from the platform.
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
    </div>
  )
}
