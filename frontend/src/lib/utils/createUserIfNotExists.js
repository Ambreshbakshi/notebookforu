// src/lib/utils/createUserIfNotExists.js

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ensure this points to your Firestore instance

/**
 * Creates a Firestore user document if it doesn't already exist.
 * @param {Object} user - Firebase Auth user object
 */
export const createUserIfNotExists = async (user) => {
  if (!user || !user.uid) {
    console.error("Invalid user object passed to createUserIfNotExists");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData = {
        uid: user.uid,
        name: user.displayName || "Anonymous User",
        email: user.email || "No Email",
        photoURL: user.photoURL || "", // Include photoURL if available
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, userData);
      console.log("User document created successfully:", userData);
    } else {
      console.log("User document already exists:", user.uid);
    }
  } catch (error) {
    console.error("Error creating Firestore user document:", error);

    // Optional retry logic for transient errors like network issues
    if (error.message.includes("unavailable")) {
      console.warn("Retrying Firestore user creation due to network issue...");
      try {
        const userData = {
          uid: user.uid,
          name: user.displayName || "Anonymous User",
          email: user.email || "No Email",
          photoURL: user.photoURL || "",
          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, userData);
        console.log("User document created successfully on retry:", userData);
      } catch (retryError) {
        console.error("Retry failed:", retryError);
      }
    }
  }
};
