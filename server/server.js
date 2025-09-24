const express = require("express")
const cors = require("cors")
const { neon } = require("@neondatabase/serverless")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL)

// Middleware
app.use(cors())
app.use(express.json())

// Test database connection
app.get("/api/test", async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as current_time`
    res.json({ message: "Database connected successfully", time: result[0].current_time })
  } catch (error) {
    console.error("Database connection error:", error)
    res.status(500).json({ error: "Database connection failed" })
  }
})

// Get all books with optional search and filtering
app.get("/api/books", async (req, res) => {
  try {
    const { search, genre, author, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `SELECT * FROM books WHERE 1=1`
    const params = []
    let paramIndex = 1

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR author ILIKE $${paramIndex + 1})`
      params.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    if (genre) {
      query += ` AND genre ILIKE $${paramIndex}`
      params.push(`%${genre}%`)
      paramIndex++
    }

    if (author) {
      query += ` AND author ILIKE $${paramIndex}`
      params.push(`%${author}%`)
      paramIndex++
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const books = await sql(query, params)

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM books WHERE 1=1`
    const countParams = []
    let countParamIndex = 1

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamIndex} OR author ILIKE $${countParamIndex + 1} OR isbn ILIKE $${countParamIndex + 2})`
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
      countParamIndex += 3
    }

    if (genre) {
      countQuery += ` AND genre ILIKE $${countParamIndex}`
      countParams.push(`%${genre}%`)
      countParamIndex++
    }

    if (author) {
      countQuery += ` AND author ILIKE $${countParamIndex}`
      countParams.push(`%${author}%`)
    }

    const totalResult = await sql(countQuery, countParams)
    const total = Number.parseInt(totalResult[0].count)

    res.json({
      books,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching books:", error)
    res.status(500).json({ error: "Failed to fetch books" })
  }
})

// Get a single book by ID
app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params
    const books = await sql`SELECT * FROM books WHERE id = ${id}`

    if (books.length === 0) {
      return res.status(404).json({ error: "Book not found" })
    }

    res.json(books[0])
  } catch (error) {
    console.error("Error fetching book:", error)
    res.status(500).json({ error: "Failed to fetch book" })
  }
})

// Create a new book
app.post("/api/books", async (req, res) => {
  try {
    const {
      title,
      author,
      // isbn,
      genre,
      publication_year,
      // publisher,
      // pages,
      description,
      // quantity = 1,
      // available_quantity = 1,
    } = req.body

    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" })
    }

    const result = await sql`
      INSERT INTO books (
        title, author, genre, publication_year, 
        description
      ) VALUES (
        ${title}, ${author}, ${genre}, ${publication_year},
        ${description}
      ) RETURNING *
    `

    res.status(201).json(result[0])
  } catch (error) {
    console.error("Error creating book:", error)
    if (error.code === "23505") {
      // Unique constraint violation
      res.status(400).json({ error: "Book already exists" })
    } else {
      res.status(500).json({ error: "Failed to create book" })
    }
  }
})

// Update a book
app.put("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      author,
      genre,
      publication_year,
      description,
    } = req.body

    // Check if book exists
    const existingBooks = await sql`SELECT * FROM books WHERE id = ${id}`
    if (existingBooks.length === 0) {
      return res.status(404).json({ error: "Book not found" })
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

    res.json(result[0])
  } catch (error) {
    console.error("Error updating book:", error)
    if (error.code === "23505") {
      // Unique constraint violation
      res.status(400).json({ error: "Book already exists" })
    } else {
      res.status(500).json({ error: "Failed to update book" })
    }
  }
})

// Delete a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Check if book exists
    const existingBooks = await sql`SELECT * FROM books WHERE id = ${id}`
    if (existingBooks.length === 0) {
      return res.status(404).json({ error: "Book not found" })
    }

    await sql`DELETE FROM books WHERE id = ${id}`
    res.json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error("Error deleting book:", error)
    res.status(500).json({ error: "Failed to delete book" })
  }
})

// Get book statistics
app.get("/api/stats", async (req, res) => {
  try {
    const totalBooks = await sql`SELECT COUNT(*) as count FROM books`
    const genreStats = await sql`
      SELECT genre, COUNT(*) as count 
      FROM books 
      WHERE genre IS NOT NULL 
      GROUP BY genre 
      ORDER BY count DESC
    `

    res.json({
      totalBooks: Number.parseInt(totalBooks[0].count),
      genreStats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({ error: "Failed to fetch statistics" })
  }
})

// Authentication endpoints (manual authentication)
const users = [
  { email: "admin@adiair.com", password: "1Bt52o7x3cO4C42", role: "admin" },
]

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body

  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    // In a real app, you'd generate a JWT token here
    res.json({
      success: true,
      user: { email: user.email, role: user.role },
      token: "mock-jwt-token",
    })
  } else {
    res.status(401).json({ error: "Invalid credentials" })
  }
})

app.post("/api/auth/signup", (req, res) => {
  const { email, password } = req.body

  // Check if user already exists
  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" })
  }

  // Add new user (in a real app, you'd hash the password)
  const newUser = { email, password, role: "user" }
  users.push(newUser)

  res.json({
    success: true,
    user: { email: newUser.email, role: newUser.role },
    token: "mock-jwt-token",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
