// Import necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHRVid_5lTWxr2KmqWHcDCyvaYUY-IoFs",
  authDomain: "notebookforu-ce0f7.firebaseapp.com",
  projectId: "notebookforu-ce0f7",
  storageBucket: "notebookforu-ce0f7.firebasestorage.app",
  messagingSenderId: "427956865500",
  appId: "1:427956865500:web:13eaf9895c39846d7d6719",
  measurementId: "G-PMX5LG23ND",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional: Only get analytics on the client
let analytics = null;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Add Firestore
const provider = new GoogleAuthProvider();

export { auth, db, provider, analytics };
