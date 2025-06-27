import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Check if Firebase Admin is initialized
    if (!auth || !db) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Get user memory
    const userDoc = await db.collection('users').doc(userId).get();
    const memory = userDoc.exists ? userDoc.data()?.memory || null : null;
    
    return NextResponse.json({ memory });
    
  } catch (error) {
    console.error("Error getting memory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { memory } = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Check if Firebase Admin is initialized
    if (!auth || !db) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Update user memory
    await db.collection('users').doc(userId).set(
      { memory: memory || null },
      { merge: true }
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error updating memory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Check if Firebase Admin is initialized
    if (!auth || !db) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Clear user memory
    await db.collection('users').doc(userId).set(
      { memory: null },
      { merge: true }
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error clearing memory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 