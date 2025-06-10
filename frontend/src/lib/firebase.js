// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const firebaseConfig = {
  apiKey: "AIzaSyCHRVid_5lTWxr2KmqWHcDCyvaYUY-IoFs",
  authDomain: "notebookforu-ce0f7.firebaseapp.com",
  projectId: "notebookforu-ce0f7",
  storageBucket: "notebookforu-ce0f7.firebasestorage.app",
  messagingSenderId: "427956865500",
  appId: "1:427956865500:web:13eaf9895c39846d7d6719",
  measurementId: "G-PMX5LG23ND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;
if (typeof window !== "undefined") {
  const { getAnalytics } = require("firebase/analytics");
  analytics = getAnalytics(app);
}
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider, analytics };