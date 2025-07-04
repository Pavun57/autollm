"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { BYOKProvider } from '@/components/BYOKProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // Check authentication state
  useEffect(() => {
    if (!auth) {
      toast({
        title: "Authentication Error",
        description: "Authentication service not available. Please try again later.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      }
      setIsAuthInitialized(true);
    });

    return () => unsubscribe();
  }, [router, toast]);

  // Show loading state while auth is initializing
  if (!isAuthInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <BYOKProvider>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </BYOKProvider>
  );
} 