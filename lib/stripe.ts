import Stripe from 'stripe';
import { db, auth } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { PLANS } from './constants';

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

// Helper function to create or get user document (Admin SDK version)
async function createOrGetUser(userId: string, email?: string) {
  if (!db) throw new Error("Database not initialized");
  
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    // Get user info from Firebase Auth if email not provided
    let userEmail = email;
    if (!userEmail && auth) {
      try {
        const userRecord = await auth.getUser(userId);
        userEmail = userRecord.email;
      } catch (error) {
        console.warn("Could not get user email from Auth:", error);
      }
    }
    
    // Create new user document with default free tier settings
    const newUserData = {
      email: userEmail || '',
      plan: 'free',
      usage: {
        promptsUsed: 0,
        promptsLimit: PLANS.FREE.limit,
        period: {
          start: new Date(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day for free tier
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await userRef.set(newUserData);
    return newUserData;
  }
  
  return userDoc.data()!;
}

// Create a Stripe checkout session
export async function createCheckoutSession(userId: string, priceId: string) {
  if (!db) throw new Error("Database not initialized");
  
  // Get the user for the metadata
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data()!;
  let stripeCustomerId = userData.stripeCustomerId;

  // If user doesn't have a Stripe customer ID, create one
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: userData.email,
      metadata: {
        userId,
      },
    });
    
    stripeCustomerId = customer.id;
    
    // Update user with Stripe customer ID
    await userRef.update({
      stripeCustomerId,
    });
  }

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?canceled=true`,
    metadata: {
      userId,
    },
  });

  return { sessionId: session.id };
}

// Update user subscription status
export async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  if (!db) throw new Error("Database not initialized");
  
  const planId = subscription.items.data[0].price.id;
  const isPro = planId === process.env.STRIPE_PRO_PRICE_ID;
  const period = {
    start: new Date(subscription.current_period_start * 1000),
    end: new Date(subscription.current_period_end * 1000),
  };
  
  // Update user with subscription info
  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    plan: isPro ? 'pro' : 'free',
    'usage.period': period,
    'usage.promptsLimit': isPro ? PLANS.PRO.limit : PLANS.FREE.limit,
    'usage.promptsUsed': 0, // Reset usage when subscription changes
  });
  
  // Store subscription in subscriptions collection
  const subscriptionRef = db.collection('subscriptions').doc(subscription.id);
  await subscriptionRef.set({
    userId,
    status: subscription.status,
    planId,
    currentPeriodStart: period.start,
    currentPeriodEnd: period.end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

// Reset daily usage for free tier users
export async function resetDailyUsage(userId: string) {
  if (!db) return;
  
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) return;
  
  const userData = userDoc.data();
  if (!userData) return;
  
  // Only reset for free tier users
  if (userData.plan !== 'free') return;
  
  const lastReset = userData.usage?.period?.start;
  const today = new Date();
  
  if (lastReset) {
    const lastResetDate = lastReset.toDate ? lastReset.toDate() : new Date(lastReset);
    
    // Check if it's a new day (compare date only, not time)
    if (
      lastResetDate.getFullYear() === today.getFullYear() &&
      lastResetDate.getMonth() === today.getMonth() &&
      lastResetDate.getDate() === today.getDate()
    ) {
      return; // Already reset today
    }
  }
  
  // Reset daily usage
  await userRef.update({
    'usage.promptsUsed': 0,
    'usage.period.start': today,
    'usage.period.end': new Date(today.getTime() + 24 * 60 * 60 * 1000), // +1 day
  });
}

// Check if user has reached their usage limit
export async function checkUsageLimit(userId: string): Promise<boolean> {
  if (!db) throw new Error("Database not initialized");
  
  // Try to get user document, create if it doesn't exist
  const userData = await createOrGetUser(userId);
  
  // For free tier users, first check if we need to reset daily usage
  if (userData.plan === 'free') {
    await resetDailyUsage(userId);
    
    // Fetch updated user data after potential reset
    const userRef = db.collection('users').doc(userId);
    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();
    
    if (!updatedUserData) {
      throw new Error("User data not found after reset");
    }
    
    return updatedUserData.usage.promptsUsed >= updatedUserData.usage.promptsLimit;
  } else {
    // For pro users, just check the monthly limit
    return userData.usage.promptsUsed >= userData.usage.promptsLimit;
  }
}

// Increment usage count for user
export async function incrementUserUsage(userId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized");
  
  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    'usage.promptsUsed': FieldValue.increment(1),
  });
} 