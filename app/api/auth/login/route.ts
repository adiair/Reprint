import { type NextRequest, NextResponse } from "next/server"

// Manual authentication with hardcoded users
const users = [
  { email: "admin@adiair.com", password: "1Bt52o7x3cO4C42", role: "admin" },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      // In a real app, you'd generate a JWT token here
      return NextResponse.json({
        success: true,
        user: { email: user.email, role: user.role },
        token: "mock-jwt-token",
      })
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
