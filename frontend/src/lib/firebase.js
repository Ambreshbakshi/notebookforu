import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
 
// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore with persistence
let db;
if (typeof window !== "undefined") {
  // Client-side initialization
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
  
  // Emulator setup (development only)
  if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "true") {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
} else {
  // Server-side initialization
  db = getFirestore(app);
}

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Failed to set auth persistence:", error);
    // Fallback to session persistence if local fails
    setPersistence(auth, browserSessionPersistence)
      .catch((fallbackError) => {
        console.error("Failed to set session persistence:", fallbackError);
      });
  });

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection every time
});

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics (client-side only)
let analytics;
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  import("firebase/analytics")
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log("Firebase Analytics initialized");
        }
      });
    })
    .catch((err) => {
      console.warn("Firebase Analytics not available:", err);
    });
}

export { 
  app, 
  auth, 
  db, 
  storage,
  googleProvider as provider, 
  analytics, 
  firebaseConfig 
};