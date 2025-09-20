"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Search, ChevronDown, Plus, Sparkles, BarChart3, Library, LogOut } from "lucide-react"
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
        <header className="border-b m-auto w-6xl border-border bg-card/80 sticky top-0 z-50">
          <div className="container mx-auto w-5xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Library className="h-8 w-8 text-amber-400" />
              <h1 className="text-2xl font-bold text-foreground">Reprint</h1>
            </div>
            <div className="flex gap-4">
              <Link href="#Hero" className="text-sm flex items-center gap-1 text-muted-foreground hover:text-primary">About  
              <ChevronDown className="h-4 w-4"/>
              </Link>
              <Link href="#features" className="text-sm flex items-center  text-muted-foreground hover:text-primary">
              Features
              </Link>
              <Link href="#books" className="text-sm flex items-center  text-muted-foreground hover:text-primary">Books</Link>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/books/add">
                <Button size="sm" className="bg-amber-400">Add Book</Button>
              </Link>
            </nav>
          </div>
        </header>

        <section className="relative mt-20 w-6xl m-auto rounded-md border-amber-400">
          <div className="absolute m-auto z-45 left-101 top-5 flex justify-center items-center gap-3 rounded-full p-1 w-80 border-2 border-amber-400 mt-5">
            <Sparkles className="h-4 w-4 text-emerald-400 rotate-5" />
            Trusted by more than 500+ users</div>
          <div className="relative w-full h-52 md:h-[24rem] mr-2 lg:h-[35rem]">
            <Image
              src="/reprint 2 copy.png"
              alt="Cover Image"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* Hero / Banner */}
        <section id="Hero" className="relative ">
          <div className="absolute inset-0" />
          <div className="relative border-t-2 border-b-2 border-dashed border-gray-400/50 container mx-auto px-4 py-30 text-center"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}>
            <h2 className=" text-4xl md:text-5xl font-extrabold text-foreground">
              Manage Your Library <span className="text-amber-500 ">Effortlessly</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Reprint is your professional book inventory system. Track, manage, and explore books with ease.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/books">
                <Button size="lg" className="bg-amber-400">
                  <BookOpen className="h-5 w-5 mr-2" /> Browse Books
                </Button>
              </Link>
              <Link href="/books/add">
                <Button size="lg" className="border-2 border-amber-400 bg-black text-white">
                  <Plus className="h-5 w-5 mr-2" /> Add Book
                </Button>
              </Link>
            </div>
          </div>
        </section>






        {/* Features */}
        <section id="features" className="container m-auto w-5xl mx-auto px-4 py-16">
          <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
          <div className="grid my-8 md:grid-cols-3 gap-8">
            <Card className="shadow-full shadow-gray-500">
              <CardContent className="p-6 text-center">
                <Search className="h-10 w-10 mx-auto text-amber-400 mb-4" />
                <h4 className="text-lg font-semibold ">Quick Search</h4>
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




        

        {/* All Total Books */}
        <section id="books" className="container mx-auto m-auto w-5xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">All Books</h3>
            <Link href="/books">
              <Button className="border-2 bg-black border-amber-400 text-amber-400" size="sm">View All</Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="relative hover:shadow-md bg-amber-500/15 transition-shadow">
                  <div className="absolute h-6 w-6 right-4 top-4 rounded-full bg-amber-400/80"></div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-primary">{book.title}</CardTitle>
                    <CardDescription>by {book.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <img
                        src={book.image_url || "/https://t3.ftcdn.net/jpg/06/13/47/20/360_F_613472072_YSkmDRTLl6twoSpkjXSYkCFE7kNCzet0.jpg"}
                        alt={book.title}
                        className="w-full h-80 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/https://t3.ftcdn.net/jpg/06/13/47/20/360_F_613472072_YSkmDRTLl6twoSpkjXSYkCFE7kNCzet0.jpg"
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Popular Genres */}
        {/* {stats && stats.genreStats.length > 0 && (
          <section id="genres" className=" m-auto w-5xl py-16">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold text-center mb-12">Popular Genres</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {stats.genreStats.slice(0, 6).map((genre) => (
                  <Card key={genre.genre} className="text-center bg-gray-400 hover:shadow-md transition-shadow">
                    <CardContent className="p-2">
                      <div className="text-2xl font-bold text-primary">{genre.count}</div>
                      <p className="text-sm text-muted-foreground">{genre.genre}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )} */}

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Reprint. All rights reserved.
          </div>
        </footer>
      </div>

    </ProtectedRoute>
  )
}
