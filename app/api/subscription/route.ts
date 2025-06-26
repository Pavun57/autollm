import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase-admin";
import { createCheckoutSession } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!auth) {
      console.warn("Firebase Admin not initialized, skipping authentication");
      return NextResponse.json(
        { error: "Firebase Admin not initialized. Set up your environment variables." },
        { status: 500 }
      );
    }
    
    // Get the session token from cookies
    const sessionCookie = cookies().get("__session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Verify the session
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    
    // Check if the user exists
    const user = await auth.getUser(uid);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { priceId } = body;
    
    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }
    
    // Create a checkout session
    const { sessionId } = await createCheckoutSession(uid, priceId);
    
    // Return the session ID
    return NextResponse.json({ sessionId });
  } catch (error: any) {
    console.error("Error in subscription API:", error);
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
} 