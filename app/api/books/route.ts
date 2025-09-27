import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const genre = searchParams.get("genre")
    const author = searchParams.get("author")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Build the WHERE clause parts
    const whereValues: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push(`(title ILIKE $${whereValues.length + 1} OR author ILIKE $${whereValues.length + 2})`);
      whereValues.push(`%${search}%`, `%${search}%`);
    }

    if (genre && genre !== 'all') {
      conditions.push(`genre ILIKE $${whereValues.length + 1}`);
      whereValues.push(`%${genre}%`);
    }

    if (author) {
      conditions.push(`author ILIKE $${whereValues.length + 1}`);
      whereValues.push(`%${author}%`);
    }

    // Build the final query
    const queryParams = [...whereValues, limit, offset];
    const query = `
      SELECT * FROM books 
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
      ORDER BY created_at DESC 
      LIMIT $${whereValues.length + 1} OFFSET $${whereValues.length + 2}
    `;

    // Execute the query with bound parameters using sql.query
    const booksResult = await (sql as any).query(query, queryParams);
    const books = Array.isArray(booksResult?.rows) ? booksResult.rows : (Array.isArray(booksResult) ? booksResult : []);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM books 
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
    `;

    const totalResult = await (sql as any).query(countQuery, whereValues);
    const totalRows = Array.isArray(totalResult?.rows) ? totalResult.rows : (Array.isArray(totalResult) ? totalResult : []);
    const total = Number((totalRows && totalRows.length > 0 ? totalRows[0].count : 0) || 0);

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching books:", error);
    const errorResponse = {
      error: "Failed to fetch books",
      details: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined
      })
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      author,
      
      genre,
      publication_year,
      
      description,
      
      image_url,
    } = body

    // Validate required fields
    if (!title || !author) {
      const errorResponse = {
        error: "Title and author are required",
        details: "Please provide both title and author",
        ...(process.env.NODE_ENV === 'development' && {
          stack: undefined,
        })
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const result = await sql`
      INSERT INTO books (
        title, author, genre, publication_year,
         description, image_url
      ) VALUES (
        ${title}, ${author}, ${genre}, ${publication_year},
         ${description}, ${image_url}
      ) RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating book:", error)
    if (error.code === "23505") {
      // Unique constraint violation
      return NextResponse.json({ error: "ISBN already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}
