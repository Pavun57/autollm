import { NextRequest, NextResponse } from "next/server"
import { db, checkEmailExists } from "@/lib/firebase-admin"

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { email } = await req.json()
    
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    
    // Validate email format with a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }
    
    // Check if Firebase Admin is initialized
    if (!db) {
      console.warn("Firebase Admin not initialized, skipping database operations");
      return NextResponse.json(
        { success: true, message: "Added to waitlist successfully (dev mode)" },
        { status: 201 },
      )
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Store in Firestore
    await db.collection("waitlist").add({
      email,
      createdAt: new Date(),
    })

    // Return success
    return NextResponse.json(
      { success: true, message: "Added to waitlist successfully" },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error adding to waitlist:", error)

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    )
  }
}
