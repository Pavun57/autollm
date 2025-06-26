"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle, sendEmailSignInLink } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email link sign in
  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await sendEmailSignInLink(email);
      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: "Check your email for a sign-in link.",
      });
    } catch (error) {
      console.error("Error sending email link:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to send sign-in link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In / Sign Up</CardTitle>
        <CardDescription>
          Access your AI assistant account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
        
        <div className="flex items-center justify-center my-4">
          <Separator className="flex-1" />
          <span className="px-2 text-sm text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        
        {!emailSent ? (
          <form onSubmit={handleEmailLinkSignIn}>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Sign In Link"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-muted p-4 rounded-md text-center">
            <h3 className="font-medium">Check your email</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We've sent a sign-in link to <span className="font-medium">{email}</span>
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
      </CardFooter>
    </Card>
  );
} 