import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const books = await sql`SELECT * FROM books WHERE id = ${id}`

    if (books.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json(books[0])
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      title,
      author,
      
      genre,
      publication_year,
      
      description,
      
    } = body

    // Check if book exists
    const existingBooks = await sql`SELECT * FROM books WHERE id = ${id}`
    if (existingBooks.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE books SET
        title = ${title},
        author = ${author},
        genre = ${genre},
        publication_year = ${publication_year},
        description = ${description},
    
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating book:", error)
    if (error.code === "23505") {
      // Unique constraint violation
      return NextResponse.json({ error: "ISBN already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if book exists
    const existingBooks = await sql`SELECT * FROM books WHERE id = ${id}`
    if (existingBooks.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    await sql`DELETE FROM books WHERE id = ${id}`
    return NextResponse.json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 })
  }
}
