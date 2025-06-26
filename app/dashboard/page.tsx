"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create a new chat and redirect to it
    const createAndRedirect = async () => {
      console.log("Dashboard page loaded, creating new conversation...");
      
      if (!auth) {
        console.error("Auth is not initialized");
        setError("Authentication service not available");
        router.push("/auth/login");
        setIsLoading(false);
        return;
      }
      
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found");
        setError("Please sign in to continue");
        router.push("/auth/login");
        setIsLoading(false);
        return;
      }
      
      console.log("User authenticated:", user.uid);
      
      if (!db) {
        console.error("Firestore DB is not initialized");
        setError("Database connection not available");
        toast({
          title: "Error",
          description: "Database connection not available. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        console.log("Creating new conversation for user:", user.uid);
        
        const docRef = await addDoc(collection(db, "conversations"), {
          userId: user.uid,
          title: "New Conversation",
          lastMessage: "",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        
        console.log("Created conversation with ID:", docRef.id);
        router.push(`/dashboard/chat/${docRef.id}`);
      } catch (error) {
        console.error("Error creating new conversation:", error);
        setError("Failed to create a new conversation");
        toast({
          title: "Error",
          description: "Failed to create a new conversation. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    createAndRedirect();
  }, [router, toast]);

  return (
    <div className="flex items-center justify-center h-full">
      {isLoading ? (
        <div className="animate-pulse">Creating a new chat...</div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Try Again
          </button>
        </div>
      ) : null}
    </div>
  );
} 