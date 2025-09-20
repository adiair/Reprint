"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Plus, Filter, ArrowLeft, ArrowRight, Library } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Library className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Book Collection</h1>
              </div>
            </div>
            <Link href="/books/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Book
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <div className="flex gap-3">
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-48">
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
                  className="w-48"
                />
                <Button type="button" variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {pagination && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
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
              <span className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="mt-1">by {book.author}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {book.available_quantity}/{book.quantity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <img
                      src={book.image_url || "/placeholder.jpg"}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg"
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {book.genre || "Unspecified"}
                      </Badge>
                      {book.publication_year && (
                        <span className="text-xs text-muted-foreground">{book.publication_year}</span>
                      )}
                    </div>
                    {book.isbn && <p className="text-xs text-muted-foreground font-mono">{book.isbn}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {book.description || "No description available."}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/books/${book.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View
                      </Button>
                    </Link>
                    <Link href={`/books/${book.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
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
    </div>
  )
}
