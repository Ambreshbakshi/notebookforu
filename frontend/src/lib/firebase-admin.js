import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Validate environment variables
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing Firebase Admin environment variables: ${missingVars.join(', ')}\n` +
    'Ensure they are set in your deployment environment.'
  );
}

// Safely process private key
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (!privateKey || !privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
  throw new Error('Invalid Firebase private key format');
}

// Initialize Admin SDK only once
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });
}
const db = getFirestore();
const adminDb = getFirestore();
const adminAuth = getAuth();

// Debug log (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log("🔥 Firebase Admin initialized with project:", process.env.FIREBASE_PROJECT_ID);
}


export { db, adminDb, adminAuth };
