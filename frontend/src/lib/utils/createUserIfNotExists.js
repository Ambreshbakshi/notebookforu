// src/lib/utils/createUserIfNotExists.js

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ensure this points to your Firestore instance

export const createUserIfNotExists = async (user) => {
  if (!user || !user.uid) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "No Name",
      email: user.email || "",
      createdAt: new Date().toISOString()
    });
  }
};
