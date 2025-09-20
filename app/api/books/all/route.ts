import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM books
      ORDER BY created_at DESC
      LIMIT ${1000}
    `
    return NextResponse.json({ books: result })
  } catch (error: any) {
    console.error("/api/books/all error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch all books",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
