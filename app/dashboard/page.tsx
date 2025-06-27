"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    // Check authentication but don't create conversation automatically
    const checkAuth = () => {
      if (!auth) {
        console.error("Auth is not initialized");
        router.push("/auth/login");
        return;
      }
      
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found");
        router.push("/auth/login");
        return;
      }
      
      console.log("User authenticated:", user.uid);
    };

    checkAuth();
  }, [router]);

  const handleSendMessage = async (message: string) => {
    if (!auth || !db) {
      toast({
        title: "Error",
        description: "Service not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setIsCreatingChat(true);

    try {
      console.log("Creating new conversation for user:", user.uid);
      
      // Create new conversation
      const docRef = await addDoc(collection(db, "conversations"), {
        userId: user.uid,
        title: message.length > 50 ? message.substring(0, 50) + "..." : message,
        lastMessage: message,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      
      console.log("Created conversation with ID:", docRef.id);
      
      // Redirect to the new chat with the initial message
      const chatUrl = `/dashboard/chat/${docRef.id}?initialMessage=${encodeURIComponent(message)}`;
      console.log("Navigating to:", chatUrl);
      
      // Try both approaches for better compatibility
      try {
        await router.push(chatUrl);
        console.log("Router.push successful");
      } catch (routerError) {
        console.log("Router.push failed, using window.location:", routerError);
        window.location.href = chatUrl;
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive",
      });
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <VercelV0Chat 
        onSendMessage={handleSendMessage}
        isLoading={isCreatingChat}
      />
    </div>
  );
} 