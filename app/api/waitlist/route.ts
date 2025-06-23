import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { addToWaitlist, checkEmailExists } from "@/lib/firebase"
import { sendWelcomeEmail } from "@/lib/resend"

const waitlistSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").max(255, "Email is too long"),
  company: z.string().min(1, "Company is required").max(100, "Company name is too long"),
  role: z.string().min(1, "Role is required").max(50, "Role is too long"),
  useCase: z.string().optional(),
  aiExperience: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input data
    const validatedData = waitlistSchema.parse(body)

    // Check if email already exists
    const emailExists = await checkEmailExists(validatedData.email)
    if (emailExists) {
      return NextResponse.json(
        {
          success: false,
          message: "This email is already on our waitlist. Thank you for your interest!",
        },
        { status: 409 }, // Conflict status code
      )
    }

    // Add to Firebase Firestore
    const docId = await addToWaitlist(validatedData)

    // Send welcome email via Resend
    await sendWelcomeEmail(validatedData.email, validatedData.name)

    return NextResponse.json(
      {
        success: true,
        message: "Successfully added to AutoLLM waitlist",
        id: docId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("AutoLLM Waitlist API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 },
      )
    }

    // Handle different types of errors
    let errorMessage = "Internal server error"

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}
