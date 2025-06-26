// Firebase Client SDK for client-side auth
import { initializeApp, FirebaseApp } from "firebase/app"
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  Auth
} from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

// Config for client-side Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we have the required config
const hasValidConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Log Firebase configuration status
console.log("Firebase configuration status:", {
  hasApiKey: Boolean(firebaseConfig.apiKey),
  hasAuthDomain: Boolean(firebaseConfig.authDomain),
  hasProjectId: Boolean(firebaseConfig.projectId),
  hasAppId: Boolean(firebaseConfig.appId),
  hasValidConfig,
  projectId: firebaseConfig.projectId // Log the actual project ID for debugging
});

// Initialize client-side Firebase only if we have valid config
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (hasValidConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } else {
    console.error("Firebase initialization failed: Missing required configuration");
    if (!firebaseConfig.apiKey) console.error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.projectId) console.error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { auth, db };

// Auth providers setup
export const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = () => {
  if (!auth) throw new Error("Firebase auth not initialized");
  return signInWithPopup(auth, googleProvider);
};

// Email link authentication
export const actionCodeSettings = {
  url: process.env.NEXT_PUBLIC_EMAIL_SIGNIN_URL || 'http://localhost:3000/auth/email-signin',
  handleCodeInApp: true,
};

export const sendEmailSignInLink = async (email: string) => {
  if (!auth) throw new Error("Firebase auth not initialized");
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  localStorage.setItem('emailForSignIn', email);
  return true;
};

export const handleEmailSignIn = async () => {
  if (!auth) throw new Error("Firebase auth not initialized");
  if (isSignInWithEmailLink(auth, window.location.href)) {
    const email = localStorage.getItem('emailForSignIn');
    if (!email) {
      // Handle case where no email is stored
      throw new Error('No email found for sign-in');
    }
    
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem('emailForSignIn');
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  return false;
};

// DB Schema Interfaces
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: 'free' | 'pro';
  usage: {
    period: {
      start: Date;
      end: Date;
    };
    promptsUsed: number;
    promptsLimit: number;
  };
  stripeCustomerId?: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: Date;
  metadata?: {
    promptTokens?: number;
    completionTokens?: number;
    classification?: string;
  };
}

// Existing waitlist functionality
export interface WaitlistEntry {
  name: string
  email: string
  company: string
  role: string
  useCase?: string
  aiExperience?: string
  timestamp: Date
  product: string
} 