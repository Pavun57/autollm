"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [firebaseStatus, setFirebaseStatus] = useState({
    auth: false,
    db: false,
    apiKey: false,
    authDomain: false,
    projectId: false,
    appId: false,
  });

  useEffect(() => {
    // Check Firebase initialization
    setFirebaseStatus({
      auth: !!auth,
      db: !!db,
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }, []);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Firebase Debug Information</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Firebase Configuration</CardTitle>
          <CardDescription>Check if your Firebase environment variables are properly set</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>API Key:</div>
            <div className={firebaseStatus.apiKey ? "text-green-500" : "text-red-500"}>
              {firebaseStatus.apiKey ? "✅ Set" : "❌ Missing"}
            </div>
            
            <div>Auth Domain:</div>
            <div className={firebaseStatus.authDomain ? "text-green-500" : "text-red-500"}>
              {firebaseStatus.authDomain ? "✅ Set" : "❌ Missing"}
            </div>
            
            <div>Project ID:</div>
            <div className={firebaseStatus.projectId ? "text-green-500" : "text-red-500"}>
              {firebaseStatus.projectId ? "✅ Set" : "❌ Missing"}
            </div>
            
            <div>App ID:</div>
            <div className={firebaseStatus.appId ? "text-green-500" : "text-red-500"}>
              {firebaseStatus.appId ? "✅ Set" : "❌ Missing"}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Firebase Initialization</CardTitle>
          <CardDescription>Check if Firebase services are properly initialized</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>Auth Service:</div>
            <div className={firebaseStatus.auth ? "text-green-500" : "text-red-500"}>
              {firebaseStatus.auth ? "✅ Initialized" : "❌ Failed"}
            </div>
            
            <div>Firestore Service:</div>
            <div className={firebaseStatus.db ? "text-green-500" : "text-red-500"}>
              {firebaseStatus.db ? "✅ Initialized" : "❌ Failed"}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Check that you have a <code>.env</code> or <code>.env.local</code> file with the required Firebase configuration variables.</li>
          <li>Make sure the Firebase project is properly set up in the Firebase console.</li>
          <li>Ensure that Authentication and Firestore are enabled in your Firebase project.</li>
          <li>Try restarting the development server after updating your environment variables.</li>
          <li>Check the browser console for any Firebase-related errors.</li>
        </ol>
      </div>
    </div>
  );
} 