import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, db } from "@/lib/firebase-admin";
import { processChat } from "@/lib/openrouter";
import { checkUsageLimit, incrementUserUsage } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!auth || !db) {
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
    
    // Check if they've reached their usage limit
    const hasReachedLimit = await checkUsageLimit(uid);
    if (hasReachedLimit) {
      return NextResponse.json(
        { error: "Usage limit reached" },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { conversationId, messages } = body;
    
    if (!conversationId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    // Process the chat request
    const result = await processChat(messages);
    const { content, model, classification } = result;
    
    // Store the response in Firestore
    const messagesCollection = db.collection("conversations").doc(conversationId).collection("messages");
    const docRef = await messagesCollection.add({
      role: "assistant",
      content: content,
      model,
      metadata: {
        classification,
      },
      timestamp: new Date(),
    });
    
    // Update conversation metadata
    await db.collection("conversations").doc(conversationId).update({
      updatedAt: new Date(),
    });
    
    // Increment usage
    await incrementUserUsage(uid);
    
    // Return the response
    return NextResponse.json({
      id: docRef.id,
      role: "assistant",
      content: content,
      model,
      metadata: {
        classification,
      },
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
} 