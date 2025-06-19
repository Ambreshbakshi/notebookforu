// frontend/src/lib/firebase-admin.js

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// TEMP LOG FOR DEBUGGING (optional — remove in production)
console.log("🔥 Firebase Admin ENV:", {
  projectId,
  clientEmail,
  privateKeyLoaded: !!privateKey
});

// Initialize Firebase Admin SDK
const adminApp = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  : getApps()[0];

const db = getFirestore();
const adminAuth = getAuth();

export { db, adminAuth, adminApp };
