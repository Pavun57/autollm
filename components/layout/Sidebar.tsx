import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth, Conversation } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  MessageSquare, 
  RefreshCw, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
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
        } else {
          setError("Database connection not available");
        }
        return () => {};
      }
      
      try {
        const q = query(
          collection(db, "conversations"),
          where("userId", "==", user.uid),
          orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
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
          setError("Failed to load conversations");
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (err) {
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
      
      const docRef = await addDoc(collection(db, "conversations"), {
        userId: user.uid,
        title: "New Conversation",
        lastMessage: "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      
      router.push(`/dashboard/chat/${docRef.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a conversation title
  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title || "");
  };

  // Save edited title
  const saveEdit = async () => {
    if (!editingId || !db || !editingTitle.trim()) return;

    try {
      await updateDoc(doc(db, "conversations", editingId), {
        title: editingTitle.trim(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Conversation renamed",
        description: "The conversation title has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditingId(null);
      setEditingTitle("");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, "conversations", conversationId));
      
      // If we're currently viewing this conversation, redirect to dashboard
      if (pathname?.includes(`/chat/${conversationId}`)) {
        router.push("/dashboard");
      }

      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  // Retry loading conversations
  const retryLoadConversations = () => {
    setIsLoading(true);
    setError(null);
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
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted transition-colors group",
                  pathname?.includes(`/chat/${conversation.id}`) && "bg-muted"
                )}
              >
                {editingId === conversation.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-6 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={saveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/dashboard/chat/${conversation.id}`}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="truncate text-sm">
                        {conversation.title || "New Conversation"}
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-1">
                      {conversation.updatedAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conversation.updatedAt)}
                        </span>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => startEditing(conversation)}>
                            <Edit2 className="h-3 w-3 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(conversation.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : !isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new chat to get going!</p>
          </div>
        ) : null}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => conversationToDelete && deleteConversation(conversationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 