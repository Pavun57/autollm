import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { db, auth, Message } from "@/lib/firebase";
import { processChat, processChatStream } from "@/lib/openrouter";
import { addMessageToMemory, createMemoryFromMessages } from "@/lib/langchain";
import { checkUsageLimit, incrementUserUsage } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

interface ChatInterfaceProps {
  conversationId: string;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Listen to messages from this conversation
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check usage limits
  useEffect(() => {
    const checkLimits = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      try {
        const hasReachedLimit = await checkUsageLimit(user.uid);
        setLimitReached(hasReachedLimit);
        
        if (hasReachedLimit) {
          toast({
            title: "Usage Limit Reached",
            description: "You've reached your plan's usage limit. Please upgrade to continue.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking usage limits:", error);
      }
    };

    checkLimits();
  }, [toast]);

  // Handle message submission
  const handleSubmit = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
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
      // Check usage limit again
      const hasReachedLimit = await checkUsageLimit(user.uid);
      if (hasReachedLimit) {
        setLimitReached(true);
        toast({
          title: "Usage Limit Reached",
          description: "You've reached your plan's usage limit. Please upgrade to continue.",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      console.log(`Sending message in conversation: ${conversationId}`);
      
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
      
      console.log(`Added user message with ID: ${userDocRef.id}`);
      
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
      
      console.log(`Added placeholder assistant message with ID: ${assistantDocRef.id}`);
      
      // Update conversation title and last message
      await updateDoc(doc(db, "conversations", conversationId), {
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        lastMessage: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
        updatedAt: new Date(),
      });
      
      console.log(`Updated conversation metadata`);
      
      // Process with OpenRouter and get response
      const allMessages = [...messages, { ...userMessage, id: userDocRef.id }];
      
      // Initialize memory if needed
      const memory = createMemoryFromMessages(allMessages);
      
      // Process the message and get AI response
      console.log("Calling OpenRouter API...");
      const { stream, model, classification } = await processChatStream(allMessages);
      
      console.log(`Got response stream from model: ${model}, classification: ${classification}`);
      
      // Create a variable to collect the full response
      let fullResponse = "";
      
      // Process the stream
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        
        // Update the assistant message as we receive chunks
        await updateDoc(doc(db, "conversations", conversationId, "messages", assistantDocRef.id), {
          content: fullResponse,
          model,
          metadata: {
            classification,
          },
        });
      }
      
      console.log("Stream completed, final response length:", fullResponse.length);
      
      // Update memory with the full conversation
      addMessageToMemory(memory, "user", content);
      addMessageToMemory(memory, "assistant", fullResponse);
      
      // Increment usage count
      await incrementUserUsage(user.uid);
      
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
    }
  };

  // Retry loading messages
  const retryLoading = () => {
    setError(null);
    setMessages([]);
    // This will trigger the useEffect to reload messages
  };

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
            <ChatMessage key={message.id} message={message} />
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
      
      {limitReached ? (
        <div className="p-4 border-t bg-muted">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <h3 className="font-medium mb-2">Usage Limit Reached</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've used all your prompts for now. Upgrade to Pro for more.
            </p>
            <Button onClick={() => router.push("/settings/subscription")}>
              Upgrade to Pro
            </Button>
          </div>
        </div>
      ) : (
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </div>
  );
} 