import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// We need to disable body parsing for webhook endpoints
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  // Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Check if Firebase Admin is initialized
    if (!db) {
      console.warn("Firebase Admin not initialized, skipping database operations");
      return NextResponse.json({ 
        received: true,
        warning: "Development mode: Firebase Admin not initialized" 
      });
    }
    
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.client_reference_id;
        
        if (!userId) {
          throw new Error("No user ID found in session");
        }

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        
        // Update user in Firestore
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          stripeCustomerId: customerId,
          plan: "pro",
          usage: {
            period: {
              start: new Date(subscription.current_period_start * 1000),
              end: new Date(subscription.current_period_end * 1000),
            },
            promptsUsed: 0,
            promptsLimit: PLANS.PRO.limit,
          },
        });
        
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // Find user by customer ID
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("stripeCustomerId", "==", customerId).get();
        
        if (snapshot.empty) {
          console.log(`No user found for customer: ${customerId}`);
          break;
        }

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        
        // Update user
        const userId = snapshot.docs[0].id;
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          plan: "pro",
          usage: {
            period: {
              start: new Date(subscription.current_period_start * 1000),
              end: new Date(subscription.current_period_end * 1000),
            },
            promptsUsed: 0,
            promptsLimit: PLANS.PRO.limit,
          },
        });
        
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("stripeCustomerId", "==", customerId).get();
        
        if (snapshot.empty) {
          console.log(`No user found for customer: ${customerId}`);
          break;
        }

        // Downgrade the user to free plan
        const userId = snapshot.docs[0].id;
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          plan: "free",
          usage: {
            period: {
              start: new Date(),
              end: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
            },
            promptsUsed: 0,
            promptsLimit: PLANS.FREE.limit,
          },
        });
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error handling webhook: ${error.message}`);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
} 