import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  })
}

const db = getFirestore()

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

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const snapshot = await db
      .collection("autollm-waitlist")
      .where("email", "==", email)
      .limit(1)
      .get()

    return !snapshot.empty
  } catch (error) {
    console.error("Error checking if email exists:", error)
    throw new Error("Failed to check if email exists")
  }
}

export async function addToWaitlist(data: Omit<WaitlistEntry, "timestamp" | "product">): Promise<string> {
  try {
    const waitlistEntry: WaitlistEntry = {
      ...data,
      timestamp: new Date(),
      product: "AutoLLM",
    }

    const docRef = await db.collection("autollm-waitlist").add(waitlistEntry)
    console.log("Added to AutoLLM waitlist with ID:", docRef.id)

    return docRef.id
  } catch (error) {
    console.error("Error adding to AutoLLM waitlist:", error)
    throw new Error("Failed to add to AutoLLM waitlist")
  }
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    const snapshot = await db.collection("autollm-waitlist").orderBy("timestamp", "desc").get()
    const entries: WaitlistEntry[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      entries.push({
        name: data.name,
        email: data.email,
        company: data.company || "",
        role: data.role || "",
        useCase: data.useCase,
        aiExperience: data.aiExperience,
        timestamp: data.timestamp.toDate(),
        product: data.product,
      })
    })

    return entries
  } catch (error) {
    console.error("Error getting AutoLLM waitlist entries:", error)
    throw new Error("Failed to get AutoLLM waitlist entries")
  }
}
