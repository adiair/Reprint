import { type NextRequest, NextResponse } from "next/server"

// In-memory user storage (in a real app, this would be in a database)
const users = [
  { email: "admin@library.com", password: "admin123", role: "admin" },
  { email: "librarian@library.com", password: "librarian123", role: "librarian" },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Add new user (in a real app, you'd hash the password)
    const newUser = { email, password, role: "librarian" as const }
    users.push(newUser)

    return NextResponse.json({
      success: true,
      user: { email: newUser.email, role: newUser.role },
      token: "mock-jwt-token",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
