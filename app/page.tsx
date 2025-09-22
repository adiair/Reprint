"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Search, ChevronDown, Plus, Menu, Sparkles, BarChart3, Library, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ProtectedRoute from "@/components/auth/protected-route"

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  genre: string
  publication_year: number
  publisher: string
  pages: number
  description: string
  quantity: number
  available_quantity: number
  created_at: string
  updated_at: string
  image_url?: string
}

interface Stats {
  totalBooks: number
  totalQuantity: number
  availableQuantity: number
  genreStats: Array<{ genre: string; count: number }>
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  const fetchAllBooks = async () => {
    try {
      const response = await fetch(`/api/books/all`, { cache: "no-store" })
      if (!response.ok) {
        console.error("/api/books (all) failed", response.status)
        setAllBooks([])
        return
      }
      const data = await response.json()
      const nextBooks = Array.isArray(data?.books) ? data.books : []
      console.debug("Home fetch /api/books/all ->", { count: nextBooks.length })
      setAllBooks(nextBooks)
    } catch (error) {
      console.error("Error fetching all books:", error)
      setAllBooks([])
    }
  }

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // initial fetch
    fetchBooks()
    fetchStats()
    fetchAllBooks()

    // refetch on focus/visibility
    const refetch = () => {
      fetchBooks()
      fetchAllBooks()
    }
    window.addEventListener("focus", refetch)
    window.addEventListener("books-updated", refetch as EventListener)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'books_updated') refetch()
    }
    window.addEventListener("storage", onStorage)
    const onVisibility = () => {
      if (document.visibilityState === "visible") refetch()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("focus", refetch)
      window.removeEventListener("books-updated", refetch as EventListener)
      window.removeEventListener("storage", onStorage)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books?limit=6", { cache: "no-store" })
      if (!response.ok) {
        console.error("/api/books failed", response.status)
        setBooks([])
        return
      }
      const data = await response.json()
      const nextBooks = Array.isArray(data?.books) ? data.books : []
      console.debug("Home fetch /api/books?limit=6 ->", { count: nextBooks.length })
      setBooks(nextBooks)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (!response.ok) return
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchTerm)}`
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    window.location.href = "/auth/login"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Library className="h-12 w-12 mx-auto mb-4 text-amber-400 animate-pulse" />
          <p className="text-muted-foreground">Loading Reprint...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b w-full border-border bg-card/80 sticky top-0 z-50">
          <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Library className="h-8 w-8 text-amber-400" />
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Reprint</h1>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex gap-4">
              <Link href="#Hero" className="text-sm flex items-center gap-1 text-muted-foreground hover:text-primary">
                About <ChevronDown className="h-4 w-4" />
              </Link>
              <Link href="#features" className="text-sm flex items-center text-muted-foreground hover:text-primary">
                Features
              </Link>
              <Link href="#books" className="text-sm flex items-center text-muted-foreground hover:text-primary">
                Books
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-4">
              <Link href="/books/add">
                <Button size="sm" className="bg-amber-400">Add Book</Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button size="sm" variant="outline">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Image Section */}
        <section className="relative mt-10 md:mt-20 max-w-6xl w-full mx-auto rounded-md border-amber-400 px-4">
          <div className="absolute left-1/2 -translate-x-1/2 z-40 -top-5 sm:top-4 md:top-6 flex justify-center items-center gap-1 sm:gap-3 rounded-full px-3 py-1 max-w-[75%] sm:max-w-[90%] md:w-80 border-2 border-amber-400 backdrop-blur">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400 rotate-5" />
            <span className="text-[8px] sm:text-xs md:text-sm text-foreground">
              Trusted by more than 500+ users
            </span>
          </div>

          <div className="relative w-full h-40 sm:h-52 md:h-[24rem] lg:h-[35rem]">
            <Image
              src="/reprint 2 copy.png"
              alt="Cover Image"
              fill
              priority
              sizes="100vw"
              className="object-cover rounded"
            />
          </div>
        </section>

        {/* Hero / Banner */}
        <section id="Hero" className="relative mt-12 md:mt-20">
          <div className="absolute inset-0" />
          <div
            className="relative border-t-2 border-b-2 border-dashed border-gray-400/50 container mx-auto px-4 py-16 md:py-30 text-center"
            style={{
              backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
              backgroundSize: "60px 60px",
            }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
            Your Personal Book <span className="text-amber-500">Encyclopedia</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Reprint is a book encyclopedia where users can add books by uploading images and instantly fetch summaries.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/books">
                <Button size="lg" className="bg-amber-400 w-full sm:w-auto">
                  <BookOpen className="h-5 w-5 mr-2" /> Browse Books
                </Button>
              </Link>
              <Link href="/books/add">
                <Button size="lg" className="border-2 border-amber-400 bg-black text-white w-full sm:w-auto">
                  <Plus className="h-5 w-5 mr-2" /> Add Book
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container max-w-6xl mx-auto px-4 py-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <Card className="shadow-full shadow-gray-500">
              <CardContent className="p-6 text-center">
                <Search className="h-10 w-10 mx-auto text-amber-400 mb-4" />
                <h4 className="text-lg font-semibold">Quick Search</h4>
                <p className="text-sm text-muted-foreground mt-2">Find books by title, author, or ISBN instantly.</p>
              </CardContent>
            </Card>
            <Card className="shadow-full shadow-gray-500">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-10 w-10 mx-auto text-amber-400 mb-4" />
                <h4 className="text-lg font-semibold">Detailed Stats</h4>
                <p className="text-sm text-muted-foreground mt-2">Track books, copies, availability, and genres.</p>
              </CardContent>
            </Card>
            <Card className="shadow-full shadow-gray-500">
              <CardContent className="p-6 text-center">
                <Library className="h-10 w-10 mx-auto text-amber-400 mb-4" />
                <h4 className="text-lg font-semibold">Smart Management</h4>
                <p className="text-sm text-muted-foreground mt-2">Easily add, update, and manage your collection.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Books */}
        <section id="books" className="container mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold">All Books</h3>
            <Link href="/books">
              <Button className="border-2 bg-black border-amber-400 text-amber-400" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {books.length === 0 ? (
            <Card className="text-center">
              <CardContent className="py-10">
                <p className="text-muted-foreground mb-4">Add your first book to see it here.</p>
                <Link href="/books/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Book
                  </Button>
                </Link>
              </CardContent>
            </Card>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="relative hover:shadow-md bg-amber-500/25 transition-shadow">
                  <div className="absolute h-6 w-6 right-4 top-4 rounded-full bg-amber-400/80"></div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-primary">{book.title}</CardTitle>
                    <CardDescription>by {book.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <img
                        src={
                          book.image_url ||
                          "/placeholder copy.jpg"
                        }
                        alt={book.title}
                        className="w-full h-80 border-5 sm:h-72 md:h-80 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder copy.jpg";
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Reprint. Developed by <a href="https://adiair.vercel.app/">adiair</a>@.
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
