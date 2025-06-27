import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { createCheckoutSession } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { action, priceId } = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Check if Firebase Admin is initialized
    if (!auth) {
      console.warn("Firebase Admin not initialized");
      return NextResponse.json(
        { error: "Firebase Admin not initialized. Set up your environment variables." },
        { status: 500 }
      );
    }
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    console.log(`Processing subscription request for user: ${userId}, action: ${action}`);
    
    if (action === 'create-checkout-session') {
      if (!priceId) {
        return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
      }
      
      const result = await createCheckoutSession(userId, priceId);
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    
  } catch (error) {
    console.error("Error in subscription API:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 