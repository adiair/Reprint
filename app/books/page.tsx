"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Plus, Filter, ArrowLeft, ArrowRight, Library, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

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

interface BooksResponse {
  books: Book[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function BooksPage() {
  const searchParams = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState<BooksResponse["pagination"] | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "")
  const [genreFilter, setGenreFilter] = useState("all")
  const [authorFilter, setAuthorFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [currentPage, genreFilter, authorFilter])

  useEffect(() => {
    if (searchParams?.get("search")) {
      setSearchTerm(searchParams.get("search") || "")
      fetchBooks()
    }
  }, [searchParams])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (genreFilter !== "all") params.append("genre", genreFilter)
      if (authorFilter) params.append("author", authorFilter)

      const response = await fetch(`/api/books?${params}`)
      if (!response.ok) {
        console.error("/api/books failed", response.status)
        setBooks([])
        setPagination(null)
        return
      }
      const data: any = await response.json()
      const nextBooks = Array.isArray(data?.books) ? data.books : []
      setBooks(nextBooks)
      setPagination(data && typeof data === 'object' ? data.pagination : null)
    } catch (error) {
      console.error("Error fetching books:", error)
      setBooks([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchBooks()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setGenreFilter("all")
    setAuthorFilter("")
    setCurrentPage(1)
    fetchBooks()
  }

  const openModal = (book: Book) => {
    setSelectedBook(book)
  }

  const closeModal = () => {
    setSelectedBook(null)
  }

  return (
    <div
      className="min-h-screen w-full max-w-6xl mx-auto bg-background"
      style={{
        background: "#000000",
        backgroundImage: `
      radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)
    `,
        backgroundSize: "30px 30px",
        backgroundPosition: "0 0",
      }}
    >
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Back + Title */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/">
                <Button variant="ghost" className="text-emerald-400" size="sm">
                  <ArrowLeft className="h-5 w-5 sm:h-7 sm:w-7 text-emerald-400" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:ml-10">
                <Library className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                <h1 className="text-lg sm:text-xl font-bold">Book Collection</h1>
              </div>
            </div>

            {/* Add Button */}
            <Link href="/books/add" className="w-full sm:w-auto">
              <Button className="bg-amber-400 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add New Book
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-4">
        {/* Search + Filters */}
        <Card className="mb-8 border-2 border-amber-400/40">
          <CardHeader>
            <CardTitle className="flex text-md items-center gap-2">
              <Search className="h-3 w-3" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Search by title, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Search className="h-3 w-3 mr-2" />
                  Search
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col md:flex-row gap-2">
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Dystopian Fiction">Dystopian Fiction</SelectItem>
                    <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                    <SelectItem value="Biography">Biography</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Filter by author"
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full md:w-40"
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full md:w-auto"
                >
                  <Filter className="h-3 w-3 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Pagination (Top) */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} books
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {pagination.page} of {pagination.pages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or add some books to your collection.
              </p>
              <Link href="/books/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Book
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-md bg-amber-700/30 transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="mt-1">by {book.author}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <img
                      src={book.image_url || "/placeholder copy.jpg"}
                      alt={book.title}
                      className="w-full border-4 border-black aspect-[2/3] object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder copy.jpg"
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {book.genre || "Unspecified"}
                    </Badge>
                    {book.publication_year && (
                      <span className="text-xs text-muted-foreground">{book.publication_year}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1 text-white w-full bg-transparent border-2 border-amber-400"
                      onClick={() => openModal(book)}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination (Bottom) */}
        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between mt-8 gap-4">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Button variant="outline" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                First
              </Button>
              <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, currentPage - 2)) + i

                if (pageNum <= pagination.pages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                }
                return null
              })}

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.pages)}
                disabled={currentPage === pagination.pages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
          <div className="absolute inset-0 bg-black/80" onClick={closeModal} />
          <div
            className="relative z-10 w-full max-w-3xl bg-card mx-auto rounded-lg shadow-lg border border-border max-h-[85vh] overflow-y-auto"
            style={{
              backgroundImage: `radial-gradient(circle 500px at 50% 300px, rgba(16,185,129,0.35), transparent)`,
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">{selectedBook.title}</h2>
                <p className="text-sm text-muted-foreground">by {selectedBook.author}</p>
              </div>
              <button
                aria-label="Close"
                className="p-2 rounded hover:bg-amber-800"
                onClick={closeModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <img
                  src={selectedBook.image_url || "/placeholder copy.jpg"}
                  alt={selectedBook.title}
                  className="w-full max-h-[60vh] border-4 border-white object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder copy.jpg"
                  }}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedBook.genre || "Unspecified"}
                  </Badge>
                  {selectedBook.publication_year && (
                    <span className="text-xs text-muted-foreground">{selectedBook.publication_year}</span>
                  )}
                  {selectedBook.publisher && (
                    <span className="text-xs text-muted-foreground">{selectedBook.publisher}</span>
                  )}
                </div>
                
                
                
                <div className="pt-2">
                  <h3 className="font-semibold mb-1">Description</h3>
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
                    {selectedBook.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button className="bg-amber-400" size="sm" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
