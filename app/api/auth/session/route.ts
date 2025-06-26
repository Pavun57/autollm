import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionCookie } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

// Create session cookie when user authenticates
export async function POST(req: NextRequest) {
  try {
    // Get token from request
    const { idToken } = await req.json();
    
    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }
    
    try {
      // Set session expiration to 5 days
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      
      // Create session cookie
      const sessionCookie = await createSessionCookie(idToken, expiresIn);
      
      // Set the cookie
      cookies().set("__session", sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });
      
      return NextResponse.json({ status: "success" });
    } catch (error: any) {
      if (error.message.includes("not initialized")) {
        console.warn("Firebase Admin not initialized, setting dummy cookie for development");
        
        // For development, set a dummy cookie
        cookies().set("__session", "dummy-session-for-development", {
          maxAge: 60 * 60 * 24 * 5 * 1000, // 5 days
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        
        return NextResponse.json({ 
          status: "success", 
          warning: "Development mode: Using dummy session" 
        });
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error("Error creating session:", error);
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

// End session when user logs out
export async function DELETE() {
  try {
    // Clear the session cookie
    cookies().delete("__session");
    
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Error ending session:", error);
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
} 