import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const totalBooks = await sql`SELECT COUNT(*) as count FROM books`
    const genreStats = await sql`
      SELECT genre, COUNT(*) as count 
      FROM books 
      WHERE genre IS NOT NULL 
      GROUP BY genre 
      ORDER BY count DESC
    `

    return NextResponse.json({
      totalBooks: Number.parseInt(totalBooks[0].count),
      genreStats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
