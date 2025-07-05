"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft
} from "react-icons/fi";
import {
  getRedirectResult,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserIfNotExists } from "@/lib/utils/createUserIfNotExists";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          createUserIfNotExists(result.user);
          toast.success("Google signup successful!");
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
        toast.error(getFriendlyError(error));
      });
  }, []);

  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 1;
      if (/[A-Z]/.test(formData.password)) strength += 1;
      if (/[a-z]/.test(formData.password)) strength += 1;
      if (/[0-9]/.test(formData.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
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
    else if (passwordStrength < 3) newErrors.password = "Use a stronger password";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!formData.terms) newErrors.terms = "You must accept the terms";

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      await sendEmailVerification(userCredential.user);

      createUserIfNotExists(userCredential.user).catch((error) =>
        console.error("Firestore error:", error)
      );

      setVerificationSent(true);
      setVerificationEmail(formData.email);

      toast.success(
        <div>
          <p className="font-medium">Verification email sent!</p>
          <p className="text-sm">Please check your inbox at {formData.email}</p>
        </div>,
        { autoClose: false }
      );
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(getFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFriendlyError = (error) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in.";
      case "auth/weak-password":
        return "Please choose a stronger password";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      case "auth/invalid-email":
        return "Please enter a valid email address";
      default:
        return error.message || "Registration failed. Please try again";
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      await createUserIfNotExists(result.user);
      toast.success("Google signup successful!");
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Google signup error:", error);
        toast.error(getFriendlyError(error));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;

    if (user) {
      await sendEmailVerification(user);
      toast.info("Verification email resent. Please check your inbox.");
      startResendTimer(60); // 60 seconds timer
    } else {
      toast.error("Unable to resend email. Please login again.");
      router.push("/admin/login");
    }
  } catch (error) {
    console.error("Resend verification error:", error);

    if (error.code === "auth/too-many-requests") {
      toast.error("You've requested too many emails. Please try again later.");
      startResendTimer(300); // 5 min block assumption
    } else {
      toast.error("Failed to resend verification email. Please try again.");
    }
  }
};

const startResendTimer = (seconds) => {
  setIsResendDisabled(true);
  setResendTimer(seconds);

  const interval = setInterval(() => {
    setResendTimer((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setIsResendDisabled(false);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white text-center">
            {verificationSent ? "Verify Your Email" : "Create Account"}
          </h1>
          <p className="text-blue-100 text-center mt-1">
            {verificationSent
              ? "Check your inbox to continue"
              : "Join our community today"}
          </p>
        </div>

        {verificationSent ? (
          <div className="p-6 sm:p-8 text-center animate-fadeIn">
            <div className="mb-6">
              <FiMail className="mx-auto text-blue-500" size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Verify Your Email Address
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to{" "}
              <span className="font-medium">{verificationEmail}</span>. Please
              click the link in that email to verify your account and continue.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
              Didn't receive the email? Check your spam folder or{" "}
              <button
  onClick={resendVerificationEmail}
  disabled={isResendDisabled}
  className={`text-blue-600 hover:text-blue-800 font-medium ${
    isResendDisabled ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  {isResendDisabled ? `Resend in ${resendTimer}s` : "click here to resend"}
</button>


            </div>
            <button
              onClick={() => router.push("/admin/login")}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Already verified? Login here
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={`pl-10 w-full py-2 px-3 border rounded-lg focus:outline-none ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`pl-10 w-full py-2 px-3 border rounded-lg focus:outline-none ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 w-full py-2 px-3 border rounded-lg focus:outline-none ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {passwordStrength < 2
                        ? "Weak"
                        : passwordStrength < 4
                        ? "Moderate"
                        : "Strong"}{" "}
                      password
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 w-full py-2 px-3 border rounded-lg focus:outline-none ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the{" "}
                  <Link
                    href="/terms-of-service"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
             {/* Google Signup Button */}
              <div className="my-4 flex items-center">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="mx-2 text-gray-500 text-sm">OR</span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>


<button
  onClick={handleGoogleSignup}
  disabled={isGoogleLoading}
  className={`w-full flex justify-center items-center py-2 px-4 mb-5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium ${
    isGoogleLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50"
  }`}
>
  {isGoogleLoading ? (
    <svg
      className="animate-spin h-5 w-5 text-gray-600 mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  ) : (
    <>
      <FcGoogle className="text-xl mr-2" />
      <span className="text-gray-700 font-medium">Sign up with Google</span>
    </>
  )}
</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
