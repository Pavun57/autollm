"use client";

import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Component that uses search params
function SubscriptionStatus() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    // Show toast based on URL parameters
    if (success) {
      toast({
        title: "Subscription Activated",
        description: "Your subscription has been activated successfully.",
      });
    } else if (canceled) {
      toast({
        title: "Subscription Canceled",
        description: "The subscription process was canceled.",
        variant: "destructive",
      });
    }
  }, [success, canceled, toast]);

  return null;
}

export default function SubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();

  // Load user data
  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth?.currentUser;
      if (!currentUser || !db) return;
      
      setIsLoading(true);
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists()) {
          setUser({
            ...currentUser,
            ...userDoc.data(),
          });
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Upgrade to pro
  const handleUpgrade = async () => {
    if (!user) return;
    
    setCheckoutLoading(true);
    
    try {
      const { sessionId } = await createCheckoutSession(
        user.uid,
        PLANS.PRO.stripePriceId!
      );
      
      // Redirect to Stripe Checkout
      const stripeJs = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripeJs.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <SubscriptionStatus />
      </Suspense>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="py-6 text-center animate-pulse">Loading subscription details...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className={`border rounded-lg p-6 ${user?.plan === "free" ? "border-primary" : ""}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{PLANS.FREE.name}</h3>
                    <p className="text-muted-foreground">
                      {PLANS.FREE.limit} prompts per {PLANS.FREE.period}
                    </p>
                  </div>
                  {user?.plan === "free" && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="mt-6">
                  <p className="text-2xl font-bold">Free</p>
                </div>
                <div className="mt-6">
                  {user?.plan === "free" ? (
                    <Button disabled variant="outline" className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      Downgrade
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className={`border rounded-lg p-6 ${user?.plan === "pro" ? "border-primary" : ""}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{PLANS.PRO.name}</h3>
                    <p className="text-muted-foreground">
                      {PLANS.PRO.limit} prompts per {PLANS.PRO.period}
                    </p>
                  </div>
                  {user?.plan === "pro" && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="mt-6">
                  <p className="text-2xl font-bold">${PLANS.PRO.price}</p>
                  <p className="text-muted-foreground">per month</p>
                </div>
                <div className="mt-6">
                  {user?.plan === "pro" ? (
                    <Button disabled variant="outline" className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUpgrade}
                      disabled={checkoutLoading}
                      className="w-full"
                    >
                      {checkoutLoading ? "Processing..." : "Upgrade to Pro"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and payment details.
            Contact support for special requirements.
          </p>
        </CardFooter>
      </Card>
      
      {/* Current Plan Details */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium">
                  {user.plan === "pro" ? PLANS.PRO.name : PLANS.FREE.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Allowed Usage</span>
                <span className="font-medium">
                  {user.plan === "pro" ? PLANS.PRO.limit : PLANS.FREE.limit} prompts per {user.plan === "pro" ? PLANS.PRO.period : PLANS.FREE.period}
                </span>
              </div>
              {user.plan === "pro" && user.usage?.period?.end && (
                <div className="flex justify-between">
                  <span>Renews On</span>
                  <span className="font-medium">
                    {new Date(user.usage.period.end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 