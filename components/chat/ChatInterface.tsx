'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { db, auth, Message } from "@/lib/firebase";
import { classifyPrompt, getModelForPrompt } from "@/lib/openrouter";
import { addMessageToMemory, createMemoryFromMessages } from "@/lib/langchain";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import BYOKModal from "@/components/ui/BYOKModal";
import { useBYOK } from "@/components/BYOKProvider";

interface ChatInterfaceProps {
  conversationId: string;
  initialMessage?: string | null;
}

export default function ChatInterface({ conversationId, initialMessage }: ChatInterfaceProps) {
  // All hooks must be at the top level
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [currentClassification, setCurrentClassification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);
  const { toast } = useToast();
  const router = useRouter();
  const { apiKey } = useBYOK();

  // Handle message submission
  const handleSubmit = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !apiKey) return;
    
    const user = auth?.currentUser;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    if (!db) {
      toast({
        title: "Error",
        description: "Database connection not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Ensure user document exists
      await ensureUserExists(user.uid, user.email || undefined);
      
      setIsLoading(true);
      setError(null);
      
      // Add user message to Firestore
      const userMessage: Omit<Message, "id"> = {
        conversationId,
        role: "user",
        content,
        timestamp: new Date(),
      };
      
      const userDocRef = await addDoc(
        collection(db, "conversations", conversationId, "messages"),
        userMessage
      );
      
      // Create placeholder for assistant message
      const assistantDocRef = await addDoc(
        collection(db, "conversations", conversationId, "messages"),
        {
          conversationId,
          role: "assistant",
          content: "...", // Will be updated as streaming comes in
          timestamp: new Date(),
        }
      );
      
      // Update conversation title and last message
      await updateDoc(doc(db, "conversations", conversationId), {
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        lastMessage: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
        updatedAt: new Date(),
      });
      
      // Prepare messages for API call
      const allMessages = [...messages, { ...userMessage, id: userDocRef.id }];
      
      // Predict which model will be used for UI display
      const classification = classifyPrompt(content);
      const predictedModel = getModelForPrompt(content);
      setCurrentModel(predictedModel);
      setCurrentClassification(classification);
      
      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();
      
      // Call server-side API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'x-openrouter-key': apiKey,
        },
        body: JSON.stringify({
          conversationId,
          messages: allMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: msg.id,
            model: msg.model,
            metadata: msg.metadata
          })),
          stream: false // Use non-streaming for simplicity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle usage limit error specifically
        if (response.status === 429) {
          setLimitReached(true);
          toast({
            title: "Usage Limit Reached",
            description: "You've reached your plan's usage limit. Please upgrade to continue.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to get response from API');
      }

      const result = await response.json();
      
      // Update current model info for UI display
      setCurrentModel(result.model);
      setCurrentClassification(result.classification);
      
      // Update the assistant message with the final response
      await updateDoc(doc(db, "conversations", conversationId, "messages", assistantDocRef.id), {
        content: result.content,
        model: result.model,
        metadata: {
          classification: result.classification,
        },
      });

      // Initialize memory if needed
      const memory = createMemoryFromMessages(allMessages);
      
      // Update memory with the full conversation
      addMessageToMemory(memory, "user", content);
      addMessageToMemory(memory, "assistant", result.content);
      
    } catch (error) {
      console.error("Error processing message:", error);
      setError("Failed to send message. Please try again.");
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentModel(null);
      setCurrentClassification(null);
    }
  }, [conversationId, isLoading, apiKey, router, toast, messages]);

  // Handle message regeneration
  const handleRegenerateMessage = useCallback(async (messageId: string) => {
    if (!db || isLoading || !apiKey) return;
    
    const user = auth?.currentUser;
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Find the message to regenerate and get conversation context
      const messageToRegenerate = messages.find(msg => msg.id === messageId);
      if (!messageToRegenerate || messageToRegenerate.role !== "assistant") return;
      
      // Get all messages up to this point (excluding the message being regenerated)
      const contextMessages = messages.filter(msg => 
        msg.timestamp <= messageToRegenerate.timestamp && msg.id !== messageId
      );
      
      // Update the message to show loading state
      await updateDoc(doc(db, "conversations", conversationId, "messages", messageId), {
        content: "...",
      });
      
      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();
      
      // Call server-side API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'x-openrouter-key': apiKey,
        },
        body: JSON.stringify({
          conversationId,
          messages: contextMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: msg.id,
            model: msg.model,
            metadata: msg.metadata
          })),
          stream: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate response');
      }

      const result = await response.json();
      
      // Update the message with the new response
      await updateDoc(doc(db, "conversations", conversationId, "messages", messageId), {
        content: result.content,
        model: result.model,
        metadata: {
          classification: result.classification,
        },
        regeneratedAt: new Date(),
      });
      
      toast({
        title: "Response regenerated",
        description: "A new response has been generated.",
      });
      
    } catch (error) {
      console.error("Error regenerating message:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate response. Please try again.",
        variant: "destructive",
      });
      
      // Restore original content if regeneration failed
      const originalMessage = messages.find(msg => msg.id === messageId);
      if (originalMessage) {
        await updateDoc(doc(db, "conversations", conversationId, "messages", messageId), {
          content: originalMessage.content,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading, apiKey, router, toast, messages]);

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!db) return;
    await updateDoc(doc(db, "conversations", conversationId, "messages", messageId), {
      content: newContent,
      editedAt: new Date(),
    });
  };

  const handleLikeMessage = (messageId: string) => { /* Placeholder */ };
  const handleDislikeMessage = (messageId: string) => { /* Placeholder */ };
  const retryLoading = () => setError(null);

  // Load initial messages for the conversation
  useEffect(() => {
    if (!conversationId) {
      console.error("No conversation ID provided");
      setError("No conversation ID provided");
      return;
    }

    if (!db) {
      console.error("Firestore DB is not initialized");
      setError("Database connection not available");
      return;
    }

    console.log(`Setting up message listener for conversation: ${conversationId}`);

    try {
      const q = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log(`Received ${snapshot.docs.length} messages for conversation ${conversationId}`);
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          msgs.push({
            id: doc.id,
            conversationId,
            role: data.role,
            content: data.content,
            model: data.model,
            timestamp: data.timestamp?.toDate(),
            metadata: data.metadata,
          });
        });
        
        setMessages(msgs);
        setError(null);
      }, (error) => {
        console.error("Error fetching messages:", error);
        setError("Could not load messages. Please try again.");
        toast({
          title: "Error",
          description: "Could not load messages. Please try again.",
          variant: "destructive",
        });
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up message listener:", err);
      setError("Error setting up message listener");
      return () => {};
    }
  }, [conversationId, toast]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0 && !isLoading && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      handleSubmit(initialMessage);
    }
  }, [initialMessage, messages.length, isLoading, handleSubmit]);

  // Helper function to ensure user document exists
  const ensureUserExists = async (userId: string, userEmail?: string) => {
    if (!db) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        // Create default user document
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const newUser = {
          uid: userId,
          email: userEmail || '',
          plan: 'free',
          usage: {
            period: {
              start: now,
              end: tomorrow,
            },
            promptsUsed: 0,
            promptsLimit: 10, // FREE tier limit
          },
          createdAt: now,
        };
        
        await setDoc(doc(db, 'users', userId), newUser);
        console.log(`Created new user document for ${userId}`);
      }
    } catch (error) {
      console.error("Error ensuring user exists:", error);
    }
  };

  // Conditional return after all hooks are declared
  if (!apiKey) {
    return <BYOKModal open={true} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={retryLoading}
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </button>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              onEdit={handleEditMessage}
              onRegenerate={handleRegenerateMessage}
              onLike={handleLikeMessage}
              onDislike={handleDislikeMessage}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
            <p className="text-muted-foreground max-w-md">
              Ask me anything - from writing and coding to research and analysis.
              I'll automatically select the best AI model for your query.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Model indicator */}
      {isLoading && currentModel && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>
              Thinking with {currentModel.includes("qwen3-30b-a3b:free") ? "Qwen3 30B" :
                           currentModel.includes("qwen3-14b:free") ? "Qwen3 14B" :
                           currentModel.includes("deepseek-r1:free") ? "DeepSeek R1" :
                           currentModel}
              {currentModel.includes(":free") && <span className="text-green-600 ml-1">FREE</span>}
            </span>
            {currentClassification && (
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {currentClassification}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Limit reached and upgrade UI removed */}
      <ChatInput
        onSubmit={handleSubmit}
        disabled={isLoading}
        isLoading={isLoading}
        currentModel={currentModel}
        currentClassification={currentClassification}
      />
    </div>
  );
} 