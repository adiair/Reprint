"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, Library } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/protected-route"

export default function AddBookPage() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    publication_year: "",
    publisher: "",
    image_url: "",
    description: "",
    quantity: "1",
    available_quantity: "1",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-update available quantity when quantity changes
    if (field === "quantity") {
      setFormData((prev) => ({
        ...prev,
        available_quantity: value,
      }))
    }

    if (field === "image_url") {
      setPreviewUrl(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          publication_year: formData.publication_year ? Number.parseInt(formData.publication_year) : null,
          quantity: Number.parseInt(formData.quantity),
          available_quantity: Number.parseInt(formData.available_quantity),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Book added successfully!")
        // Reset form
        setFormData({
          title: "",
          author: "",
          isbn: "",
          genre: "",
          publication_year: "",
          publisher: "",
          image_url: "",
          description: "",
          quantity: "1",
          available_quantity: "1",
        })
        setPreviewUrl("")

        // Notify other views to refresh their lists immediately
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('books_updated', String(Date.now()))
            window.dispatchEvent(new Event('books-updated'))
          }
        } catch { }

        // Redirect to the landing page immediately so lists refresh
        router.push(`/`)
      } else {
        setError(data.error || "Failed to add book")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full max-w-3xl mx-auto">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
              <Link href="/books" className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto text-emerald-400">
                  <ArrowLeft className="h-4 w-4 mr-2 text-emerald-400" />
                  Back to Books
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Library className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                <h1 className="text-lg sm:text-xl font-bold text-primary">Add New Book</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="w-full max-w-2xl mx-auto">
            <Card
              className="bg-gradient-to-r from-primary/5 via-primary/0 to-primary/5"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%), #000000",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Plus className="h-5 w-5 text-amber-400" />
                  Book Information
                </CardTitle>
                <CardDescription>Enter the details for the new book</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Alerts */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter book title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">
                        Author <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => handleInputChange("author", e.target.value)}
                        placeholder="Enter author name"
                        required
                      />
                    </div>
                  </div>

                  {/* ISBN + Genre */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={(e) => handleInputChange("isbn", e.target.value)}
                        placeholder="978-0-123456-78-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genre">Genre</Label>
                      <Select
                        value={formData.genre}
                        onValueChange={(value) => handleInputChange("genre", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fiction">Fiction</SelectItem>
                          <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                          <SelectItem value="Romance">Romance</SelectItem>
                          <SelectItem value="Mystery">Mystery</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Publication */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publication_year">Publication Year</Label>
                      <Input
                        id="publication_year"
                        type="number"
                        value={formData.publication_year}
                        onChange={(e) => handleInputChange("publication_year", e.target.value)}
                        placeholder="2024"
                        min="1000"
                        max="2030"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publisher">Publisher</Label>
                      <Input
                        id="publisher"
                        value={formData.publisher}
                        onChange={(e) => handleInputChange("publisher", e.target.value)}
                        placeholder="Publisher name"
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="image_url">Cover Image</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => handleInputChange("image_url", e.target.value)}
                            placeholder="https://.../cover.jpg"
                          />
                          <p className="text-xs text-muted-foreground">
                            Paste a direct image URL.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Input
                            id="image_file"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setPreviewUrl(url);
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Or select an image to preview (upload wiring next).
                          </p>
                        </div>
                      </div>
                      {previewUrl && (
                        <div className="mt-2">
                          <img
                            src={previewUrl}
                            alt="Cover preview"
                            className="h-48 w-36 object-cover rounded border"
                            onError={() => setPreviewUrl("")}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter book description..."
                      rows={4}
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-amber-400 w-full sm:w-auto"
                    >
                      {loading ? "Adding Book..." : "Add Book"}
                    </Button>
                    <Link href="/books" className="w-full sm:w-auto">
                      <Button type="button" variant="outline" className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
