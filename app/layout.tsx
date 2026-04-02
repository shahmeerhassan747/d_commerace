import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ShoppingCart, User, Menu, Heart, Package, LogOut, Phone, Globe, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/search-bar";
import { HeaderActions } from "@/components/header-actions";
import { AuthGuard } from "@/components/auth-guard";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D-Commerce | Buy Premium Products Worldwide",
  description: "Experience the next level of e-commerce with D-Commerce. B2C platform inspired by global leaders.",
};

const NAV_LINKS = [
  { name: "Electronics", href: "/products" },
  { name: "Fashion", href: "/products" },
  { name: "Home & Garden", href: "/products" },
  { name: "Health & Beauty", href: "/products" },
  { name: "Sports", href: "/products" },
  { name: "Reviews", href: "/reviews" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background`}>
        <div className="flex min-h-screen flex-col">
          {/* Top Bar */}
          <div className="hidden border-b bg-muted/50 text-xs py-2 px-4 sm:flex justify-between items-center text-muted-foreground uppercase tracking-wider font-medium">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Ship to Worldwide</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +1 (800) D-COMM</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
              <Link href="/products/new" className="hover:text-primary transition-colors">Sell on D-Commerce</Link>
            </div>
          </div>

          {/* Main Navbar */}
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger render={
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  } />
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <nav className="flex flex-col gap-4 mt-8">
                      <h2 className="text-lg font-bold px-2 mb-2">Categories</h2>
                      {NAV_LINKS.map((link) => (
                        <Link key={link.name} href={link.href} className="text-lg font-medium hover:text-primary px-2 transition-colors">
                          {link.name}
                        </Link>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
                <Link href="/" className="text-2xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                  D.COMMERCE
                </Link>
              </div>

              {/* Search Bar */}
              <SearchBar />

              {/* Action Buttons */}
              <HeaderActions />
            </div>

            {/* Sub Nav */}
            <div className="border-t hidden lg:block bg-background">
              <div className="container mx-auto px-4 py-2 flex items-center gap-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary cursor-pointer hover:underline">
                  <Menu className="w-4 h-4" /> All Categories
                </div>
                {NAV_LINKS.map((link) => (
                  <Link key={link.name} href={link.href} className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground/80">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <main className="flex-1">
            <AuthGuard>
              {children}
            </AuthGuard>
          </main>

          {/* Footer */}
          <footer className="bg-muted pt-16 pb-8 px-4 border-t">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div>
                <h3 className="text-xl font-black mb-6">D.COMMERCE</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  One-stop shop for everything you need. Quality products from verified global suppliers delivered right to your doorstep.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Globe className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-6">Shopping Guide</h4>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary transition-colors">Payment Methods</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Shipping & Delivery</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Buyer Protection</Link></li>
                  <li><Link href="/reviews" className="hover:text-primary transition-colors font-bold text-primary">Customer Reviews</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">FAQs</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Get Updates</h4>
                <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for exclusive deals.</p>
                <div className="flex gap-2">
                  <Input placeholder="Email Address" className="rounded-l-lg focus-visible:ring-primary" />
                  <Button className="rounded-r-lg px-6">Join</Button>
                </div>
              </div>
            </div>
            <div className="container mx-auto mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} D-Commerce Inc. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
