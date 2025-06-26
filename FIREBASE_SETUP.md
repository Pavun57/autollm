# Firebase Setup Guide

This guide will help you set up Firebase for the AutoLLM project.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

## Steps to Set Up Firebase

1. **Create a Firebase Project**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project, go to "Authentication" in the sidebar
   - Click "Get started"
   - Enable the "Email/Password" provider
   - Optionally enable Google authentication

3. **Create a Firestore Database**
   - In your Firebase project, go to "Firestore Database" in the sidebar
   - Click "Create database"
   - Start in production mode
   - Choose a location close to your users

4. **Set Up Firebase Admin SDK**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the values for `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from the JSON file

5. **Get Your Web App Configuration**
   - In Project Settings > General, scroll down to "Your apps"
   - Click the web app icon (</>) to create a new web app if you haven't already
   - Register the app with a nickname
   - Copy the configuration values into your `.env.local` file

## Debugging Firebase Connection

If you're having issues connecting to Firebase:

1. Visit `/debug` in your application to check your Firebase configuration status
2. Check the browser console for any Firebase-related errors
3. Verify that all environment variables are correctly set
4. Ensure your Firebase project has the correct services enabled
5. Check that your Firebase project's authentication domain matches your application's domain

## Firestore Security Rules

For development, you can use these basic security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For production, you should implement more restrictive rules based on your application's needs. 