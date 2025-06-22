'use client';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, provider } from './firebase';
import { toast } from 'react-toastify';

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    toast.error(getAuthErrorMessage(error.code));
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    toast.error(getAuthErrorMessage(error.code));
    throw error;
  }
};

export const registerWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  } catch (error) {
    toast.error(getAuthErrorMessage(error.code));
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent');
  } catch (error) {
    toast.error(getAuthErrorMessage(error.code));
    throw error;
  }
};

export const updateUserProfile = async (updates) => {
  try {
    await updateProfile(auth.currentUser, updates);
    toast.success('Profile updated successfully');
    return auth.currentUser;
  } catch (error) {
    toast.error('Failed to update profile');
    throw error;
  }
};

// Helper function for user-friendly error messages
const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'Account disabled';
    case 'auth/user-not-found':
      return 'Account not found';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later';
    case 'auth/account-exists-with-different-credential':
      return 'Account exists with different login method';
    default:
      return 'Authentication failed. Please try again';
  }
};