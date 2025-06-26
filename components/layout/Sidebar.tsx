import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth, Conversation } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Listen to conversation updates
  useEffect(() => {
    const loadConversations = () => {
      setIsLoading(true);
      setError(null);
      
      const user = auth?.currentUser;
      if (!user || !db) {
        setIsLoading(false);
        if (!user) {
          setError("Please sign in to view your conversations");
          console.error("No authenticated user found");
        } else {
          setError("Database connection not available");
          console.error("Firestore DB not initialized");
        }
        return () => {};
      }
      
      console.log("Setting up conversations listener for user:", user.uid);
      
      try {
        const q = query(
          collection(db, "conversations"),
          where("userId", "==", user.uid),
          orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log(`Received ${snapshot.docs.length} conversations`);
          const convos: Conversation[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            convos.push({
              id: doc.id,
              userId: data.userId,
              title: data.title,
              lastMessage: data.lastMessage,
              updatedAt: data.updatedAt?.toDate(),
              createdAt: data.createdAt?.toDate(),
            });
          });
          
          setConversations(convos);
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching conversations:", error);
          setError("Failed to load conversations");
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Error setting up conversations listener:", err);
        setError("Error setting up conversations listener");
        setIsLoading(false);
        return () => {};
      }
    };

    const unsubscribe = loadConversations();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Create a new conversation
  const createNewChat = async () => {
    const user = auth?.currentUser;
    if (!user || !db) {
      if (!user) {
        router.push("/auth/login");
      } else {
        toast({
          title: "Error",
          description: "Database connection not available. Please try again later.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      
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
      toast({
        title: "Error",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Retry loading conversations
  const retryLoadConversations = () => {
    setIsLoading(true);
    setError(null);
    
    // Force re-render to trigger the useEffect
    setConversations([]);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full w-64 border-r">
      <div className="p-3">
        <Button 
          onClick={createNewChat}
          className="w-full"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {error ? (
          <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button 
              onClick={retryLoadConversations} 
              className="mt-2 flex items-center text-xs text-primary hover:underline"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </button>
          </div>
        ) : conversations.length > 0 ? (
          <div className="px-2 py-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dashboard/chat/${conversation.id}`}
                className={cn(
                  "flex items-center justify-between px-2 py-3 rounded-md hover:bg-muted transition-colors group",
                  pathname?.includes(`/chat/${conversation.id}`) && "bg-muted"
                )}
              >
                <div className="flex items-center max-w-[70%]">
                  <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="truncate">
                    {conversation.title || "New Conversation"}
                  </div>
                </div>
                {conversation.updatedAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(conversation.updatedAt)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading conversations...</p>
            ) : (
              <>
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a new chat to begin
                </p>
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 