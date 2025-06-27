"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import ChatInterface from "@/components/chat/ChatInterface";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ChatPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = params;

  // Verify the user has access to this conversation
  useEffect(() => {
    const checkAccess = async () => {
      const user = auth?.currentUser;
      if (!user || !db) {
        router.push("/auth/login");
        return;
      }

      // Get initial message from URL params
      const initialMsg = searchParams.get('initialMessage');
      console.log("Initial message from URL:", initialMsg);
      if (initialMsg) {
        const decodedMsg = decodeURIComponent(initialMsg);
        console.log("Decoded initial message:", decodedMsg);
        setInitialMessage(decodedMsg);
      }

      try {
        const conversationDoc = await getDoc(doc(db, "conversations", id));
        
        if (!conversationDoc.exists()) {
          router.push("/dashboard");
          return;
        }
        
        const conversation = conversationDoc.data();
        
        if (conversation.userId !== user.uid) {
          router.push("/dashboard");
          return;
        }
        
        setIsOwner(true);
      } catch (error) {
        console.error("Error checking conversation access:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [id, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading conversation...</div>
      </div>
    );
  }

  if (!isOwner) {
    return null; // Will redirect in the useEffect
  }

  return (
    <>
      <div className="border-b p-2 flex items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 mr-2 hover:bg-muted rounded-md"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-medium">Chat</h1>
      </div>
      <ChatInterface conversationId={id} initialMessage={initialMessage} />
    </>
  );
} 