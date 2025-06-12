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
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Update user profile with the provided name
      await updateProfile(result.user, {
        displayName: formData.name
      });

      // Save user details in Firestore
      await createUserIfNotExists(result.user);

      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
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
        setErrors({ form: "Google signup failed." });
      }
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
                placeholder="John Doe"
                className={`pl-10 w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          {/* Rest of the fields unchanged */}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
