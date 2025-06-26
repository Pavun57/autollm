import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  const apps = getAdminApps();
  
  if (!apps.length) {
    try {
      // Check if we have the required environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      
      if (!projectId || !clientEmail || !privateKey) {
        console.warn("Firebase Admin SDK not initialized: Missing environment variables");
        return { db: null, auth: null };
      }
      
      // If using a service account JSON file
      initializeAdminApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
      return { db: null, auth: null };
    }
  }
  
  return { db: getFirestore(), auth: getAuth() };
}

// Export the Firebase Admin instances
export const { db, auth } = initializeFirebaseAdmin();

// Session cookie middleware
export async function createSessionCookie(idToken: string, expiresIn: number) {
  if (!auth) throw new Error("Firebase Admin Auth not initialized");
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
  return sessionCookie;
}

export async function verifySessionCookie(sessionCookie: string) {
  if (!auth) throw new Error("Firebase Admin Auth not initialized");
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return null;
  }
}

// Waitlist functions moved from firebase.ts
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!db) return false;
  
  try {
    const snapshot = await db
      .collection("autollm-waitlist")
      .where("email", "==", email)
      .limit(1)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking if email exists:", error);
    throw new Error("Failed to check if email exists");
  }
}

export interface WaitlistEntry {
  name: string;
  email: string;
  company: string;
  role: string;
  useCase?: string;
  aiExperience?: string;
  timestamp: Date;
  product: string;
}

export async function addToWaitlist(data: Omit<WaitlistEntry, "timestamp" | "product">): Promise<string> {
  if (!db) throw new Error("Firebase Admin Firestore not initialized");
  
  try {
    const waitlistEntry = {
      ...data,
      timestamp: new Date(),
      product: "AutoLLM",
    };

    const docRef = await db.collection("autollm-waitlist").add(waitlistEntry);
    console.log("Added to AutoLLM waitlist with ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("Error adding to AutoLLM waitlist:", error);
    throw new Error("Failed to add to AutoLLM waitlist");
  }
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection("autollm-waitlist").orderBy("timestamp", "desc").get();
    const entries: WaitlistEntry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        name: data.name,
        email: data.email,
        company: data.company || "",
        role: data.role || "",
        useCase: data.useCase,
        aiExperience: data.aiExperience,
        timestamp: data.timestamp.toDate(),
        product: data.product,
      });
    });

    return entries;
  } catch (error) {
    console.error("Error getting AutoLLM waitlist entries:", error);
    throw new Error("Failed to get AutoLLM waitlist entries");
  }
} 