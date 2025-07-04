"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BYOKProvider } from '@/components/BYOKProvider';

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

  const navItems = [
    { href: "/settings", label: "General" },
    // { href: "/settings/usage", label: "Usage" },
    // { href: "/settings/subscription", label: "Subscription" },
  ];

  return (
    <BYOKProvider>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="container py-6 flex-1 overflow-hidden">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Settings Sidebar */}
            <nav className="w-full md:w-64 space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm font-medium",
                    pathname === item.href 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Settings Content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </BYOKProvider>
  );
} 