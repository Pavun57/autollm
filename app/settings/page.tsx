"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useBYOK } from "@/components/BYOKProvider";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [memory, setMemory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingMemory, setIsClearingMemory] = useState(false);
  const { toast } = useToast();
  const { apiKey, setApiKey, removeApiKey } = useBYOK();
  const [editingKey, setEditingKey] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey || "");

  useEffect(() => {
    const user = auth?.currentUser;
    if (user && db) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      
      // Load user memory
      const loadMemory = async () => {
        try {
          if (db) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setMemory(userDoc.data()?.memory || "");
            }
          }
        } catch (error) {
          console.error("Error loading memory:", error);
        }
      };
      
      loadMemory();
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth?.currentUser;
    if (!user || !db) return;
    
    setIsLoading(true);
    
    try {
      await updateProfile(user, {
        displayName,
      });
      
      // Also update Firestore user document if it exists
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        await updateDoc(doc(db, "users", user.uid), {
          displayName,
          memory,
        });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMemory = async () => {
    const user = auth?.currentUser;
    if (!user || !db) return;
    
    setIsClearingMemory(true);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        memory: null,
      });
      
      setMemory("");
      
      toast({
        title: "Memory Cleared",
        description: "Your personal memory has been cleared successfully.",
      });
    } catch (error) {
      console.error("Error clearing memory:", error);
      toast({
        title: "Error",
        description: "Failed to clear memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearingMemory(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Memory</CardTitle>
          <CardDescription>Manage personal details for better AI responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memory">Personal Memory</Label>
            <Textarea
              id="memory"
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="Add personal details like your name, preferences, job role, etc. The AI will use this to personalize responses."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This information helps the AI provide more personalized responses. 
              You can also share personal details in chat, and they'll be automatically added here.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClearingMemory || !memory}>
                Clear Memory
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear AI Memory</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all personal information stored for AI responses. 
                  The AI will no longer remember your preferences, name, or other personal details.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearMemory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear Memory
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            onClick={handleUpdateProfile} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Saving..." : "Update Memory"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 