"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("search") || "")

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/products")
    }
  }

  return (
    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <Input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search over 1,000,000 products..." 
        className="pl-10 h-11 border-2 focus-visible:ring-0 focus-visible:border-primary transition-all rounded-full"
      />
      <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-6 h-9">
        Search
      </Button>
    </form>
  )
}
