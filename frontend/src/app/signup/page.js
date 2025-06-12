"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import {
  getRedirectResult,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { createUserIfNotExists } from "@/lib/utils/createUserIfNotExists";

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          createUserIfNotExists(result.user);
          router.push("/profile");
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
        setErrors({ form: "Google redirect login failed." });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 3) newErrors.name = "Name must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Minimum 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Create user and update profile in parallel with Firestore initialization
      const [{ user }] = await Promise.all([
        createUserWithEmailAndPassword(auth, formData.email, formData.password)
          .then(async (result) => {
            await updateProfile(result.user, { displayName: formData.name });
            return result;
          }),
        
        // Pre-load Firestore while auth operations are happening
        (async () => {
          const { getFirestore } = await import('firebase/firestore');
          return getFirestore();
        })()
      ]);

      // Firestore write happens separately but doesn't block UI
      createUserIfNotExists(user)
        .catch(error => console.error("Non-critical Firestore error:", error));

      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => router.push("/login"), 1500); // Reduced delay
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ form: getFriendlyError(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFriendlyError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/weak-password':
        return 'Please choose a stronger password (min 8 characters)';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return error.message || 'Registration failed. Please try again';
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      await createUserIfNotExists(result.user);
      router.push("/profile");
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Google signup error:", error);
        setErrors({ form: getFriendlyError(error) });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our community today</p>
        </div>

        {errors.form && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">
            {errors.form}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className={`pl-10 w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email"
                className={`pl-10 w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`pl-10 pr-10 w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Log in here
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
         <button
  type="button"
  onClick={handleGoogleSignup}
  className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-100 transition duration-200 shadow-sm"
>
  <svg
    className="w-5 h-5"
    viewBox="0 0 533.5 544.3"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M533.5 278.4c0-17.7-1.4-35-4.3-51.8H272v98h147.5c-6.4 34.4-25 63.5-53.6 83l86.6 67.2c50.6-46.6 80-115.3 80-196.4z"
      fill="#4285f4"
    />
    <path
      d="M272 544.3c72.6 0 133.6-24 178.2-65.1l-86.6-67.2c-24.1 16.2-55 25.7-91.6 25.7-70.4 0-130.1-47.6-151.4-111.6l-89.2 68.9c43.9 87.1 134.1 149.3 240.6 149.3z"
      fill="#34a853"
    />
    <path
      d="M120.6 325.8c-10.3-30.2-10.3-62.6 0-92.8l-89.2-68.9c-39.1 77.9-39.1 170.1 0 248l89.2-68.9z"
      fill="#fbbc04"
    />
    <path
      d="M272 107.6c39.5-.6 77.4 13.7 106.5 39.9l79.5-79.5C419.8 23.2 346.8-2.3 272 0 165.5 0 75.3 62.1 31.4 149.3l89.2 68.9C141.9 155.2 201.6 107.6 272 107.6z"
      fill="#ea4335"
    />
  </svg>
  Continue with Google
</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;