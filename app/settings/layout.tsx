"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication state
  useEffect(() => {
    if (!auth) {
      router.push("/auth/login");
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="container py-6 flex-1 overflow-hidden">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Sidebar */}
          <nav className="w-full md:w-64 space-y-1">
            <Link 
              href="/settings" 
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium",
                pathname === "/settings" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              General
            </Link>
            <Link 
              href="/settings/subscription" 
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium",
                pathname === "/settings/subscription" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              Subscription
            </Link>
            <Link 
              href="/settings/usage" 
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium",
                pathname === "/settings/usage" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              Usage
            </Link>
          </nav>
          
          {/* Settings Content */}
          <div className="flex-1 bg-card rounded-lg p-6 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 