import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { processChatStream, classifyPrompt, getModelForPrompt } from "@/lib/openrouter";


export async function POST(request: NextRequest) {
  try {
    const { conversationId, messages, stream = false } = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Check if Firebase Admin is initialized
    if (!auth || !db) {
      console.warn("Firebase Admin not initialized");
      return NextResponse.json(
        { error: "Firebase Admin not initialized. Set up your environment variables." },
        { status: 500 }
      );
    }
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    console.log(`Processing chat request for user: ${userId}, conversation: ${conversationId}`);
    
    // Get the last user message to classify and determine model
    const lastUserMessage = messages.filter((msg: any) => msg.role === 'user').pop();
    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    // Check for memory commands first
    const userContent = lastUserMessage.content.toLowerCase().trim();
    if (userContent.includes("forget") && (userContent.includes("memory") || userContent.includes("everything") || userContent.includes("all"))) {
      // Clear user memory
      await db.collection('users').doc(userId).set(
        { memory: null },
        { merge: true }
      );
      
      return NextResponse.json({
        content: "I've cleared my memory of our previous conversations and personal details. We can start fresh!",
        model: "system",
        classification: "memory-command",
        conversationId
      });
    }

    // Get current user memory for context
    const userDoc = await db.collection('users').doc(userId).get();
    const userMemory = userDoc.exists ? userDoc.data()?.memory : null;

    // Detect if user is sharing personal information
    const personalInfoPatterns = [
      /my name is (\w+)/i,
      /call me (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /i work at (.+)/i,
      /i work as (.+)/i,
      /i'm a (.+)/i,
      /i am a (.+)/i,
      /my job is (.+)/i,
      /i live in (.+)/i,
      /i'm from (.+)/i,
      /i am from (.+)/i
    ];

    let detectedInfo = "";
    for (const pattern of personalInfoPatterns) {
      const match = lastUserMessage.content.match(pattern);
      if (match) {
        detectedInfo += `${match[0]}. `;
      }
    }

    // Update memory if personal info detected
    if (detectedInfo) {
      const newMemory = userMemory ? `${userMemory} ${detectedInfo}` : detectedInfo;
      await db.collection('users').doc(userId).set(
        { memory: newMemory.trim() },
        { merge: true }
      );
      console.log(`Updated memory for user ${userId}: ${detectedInfo}`);
    }

    // Add memory to messages for context if it exists
    const contextMessages = [...messages];
    if (userMemory || detectedInfo) {
      const memoryContext = userMemory || detectedInfo;
      contextMessages.unshift({
        role: "system",
        content: `User's personal context (use this to personalize responses): ${memoryContext}`
      });
    }
    
    const classification = classifyPrompt(lastUserMessage.content);
    const model = getModelForPrompt(lastUserMessage.content);
    
    console.log(`Using model: ${model}, classification: ${classification}`);
    
    // Get OpenRouter API key from header
    const openrouterKey = request.headers.get("x-openrouter-key") || undefined;
    if (!openrouterKey) {
      return NextResponse.json({ error: "OpenRouter API key missing. Please provide your key in settings." }, { status: 400 });
    }
    
    // Process with OpenRouter using context messages and user key
    const { stream: responseStream } = await processChatStream(contextMessages, undefined, openrouterKey);
    
    // Collect the full response
    let fullResponse = "";
    for await (const chunk of responseStream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
    }
    
    console.log(`Generated response length: ${fullResponse.length}`);
    
    // Return the response
    return NextResponse.json({
      content: fullResponse,
      model,
      classification,
      conversationId
    });
    
  } catch (error) {
    console.error("Error in chat API:", error);
    
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