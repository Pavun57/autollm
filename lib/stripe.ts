import Stripe from 'stripe';
import { db } from './firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { increment as firestoreIncrement } from 'firebase/firestore';

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Plan configuration
export const PLANS = {
  FREE: {
    name: 'Free',
    limit: 10,
    period: 'day',
    price: 0,
  },
  PRO: {
    name: 'Pro',
    limit: 100,
    period: 'month',
    price: 9.99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
};

// Create a Stripe checkout session
export async function createCheckoutSession(userId: string, priceId: string) {
  // Get the user for the metadata
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  let stripeCustomerId = userDoc.data().stripeCustomerId;

  // If user doesn't have a Stripe customer ID, create one
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: userDoc.data().email,
      metadata: {
        userId,
      },
    });
    
    stripeCustomerId = customer.id;
    
    // Update user with Stripe customer ID
    await updateDoc(doc(db, 'users', userId), {
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
  const planId = subscription.items.data[0].price.id;
  const isPro = planId === process.env.STRIPE_PRO_PRICE_ID;
  const period = {
    start: new Date(subscription.current_period_start * 1000),
    end: new Date(subscription.current_period_end * 1000),
  };
  
  // Update user with subscription info
  await updateDoc(doc(db, 'users', userId), {
    plan: isPro ? 'pro' : 'free',
    'usage.period': period,
    'usage.promptsLimit': isPro ? PLANS.PRO.limit : PLANS.FREE.limit,
    'usage.promptsUsed': 0, // Reset usage when subscription changes
  });
  
  // Store subscription in subscriptions collection
  await setDoc(doc(db, 'subscriptions', subscription.id), {
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
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return;
  
  const userData = userDoc.data();
  
  // Only reset for free tier users
  if (userData.plan !== 'free') return;
  
  const lastReset = userData.usage?.period?.start;
  const today = new Date();
  
  if (lastReset) {
    const lastResetDate = new Date(lastReset);
    
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
  await updateDoc(doc(db, 'users', userId), {
    'usage.promptsUsed': 0,
    'usage.period.start': today,
    'usage.period.end': new Date(today.getTime() + 24 * 60 * 60 * 1000), // +1 day
  });
}

// Check if user has reached their usage limit
export async function checkUsageLimit(userId: string): Promise<boolean> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  
  // For free tier users, first check if we need to reset daily usage
  if (userData.plan === 'free') {
    await resetDailyUsage(userId);
    
    // Fetch updated user data after potential reset
    const updatedUserDoc = await getDoc(doc(db, 'users', userId));
    const updatedUserData = updatedUserDoc.data();
    
    return updatedUserData.usage.promptsUsed >= updatedUserData.usage.promptsLimit;
  } else {
    // For pro users, just check the monthly limit
    return userData.usage.promptsUsed >= userData.usage.promptsLimit;
  }
}

// Increment usage count for user
export async function incrementUserUsage(userId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    'usage.promptsUsed': firestoreIncrement(1),
  });
} 