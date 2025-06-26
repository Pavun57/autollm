"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, handleEmailSignIn } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function EmailSignInPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function processEmailLink() {
      try {
        const success = await handleEmailSignIn();
        
        if (success) {
          toast({
            title: "Sign-in Successful",
            description: "You have been signed in successfully.",
          });
          
          // Wait a moment for Firebase auth state to update
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          setError("This page is only valid when accessed via an email sign-in link.");
        }
      } catch (err) {
        console.error("Error signing in with email link:", err);
        setError("Failed to sign in. The link may be invalid or expired.");
      } finally {
        setIsLoading(false);
      }
    }

    processEmailLink();
  }, [router, toast]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Email Sign In
          </h1>
          
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Processing your sign-in link...
            </p>
          ) : error ? (
            <>
              <p className="text-sm text-red-500 mt-2">{error}</p>
              <Button
                className="mt-4"
                onClick={() => router.push("/auth/login")}
              >
                Back to Sign In
              </Button>
            </>
          ) : (
            <p className="text-sm text-green-500 mt-2">
              Sign-in successful! Redirecting you to the dashboard...
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 