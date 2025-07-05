"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast, ToastContainer } from 'react-toastify';
import { createUserIfNotExists } from "@/lib/utils/createUserIfNotExists";
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
  };

const handleRedirect = () => {
  try {
    const prevPath = typeof window !== "undefined" ? localStorage.getItem("prevPath") : null;
    const redirectUrl = prevPath || "/admin/dashboard/profile";
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("prevPath");
    }
    router.push(redirectUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    router.push("/admin/dashboard/profile");
  }
};


  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(credentials.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);

if (!userCredential.user.emailVerified) {
  toast.warn("Please verify your email address. Check your inbox.", {
    icon: <FiAlertCircle className="text-yellow-500" />,
    autoClose: 5000,
  });
  await auth.signOut();  // Important: logout immediately
  setLoading(false);
  return;
}

// Only if verified, proceed
toast.success("Logged in successfully!", {
  icon: <FiCheckCircle className="text-green-500" />,
});

localStorage.setItem(
  "user",
  JSON.stringify({
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName || credentials.email.split("@")[0],
  })
);

handleRedirect();

    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Login failed. Please try again.";

      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Account temporarily locked.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (error) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in.";
      case "auth/weak-password":
        return "Please choose a stronger password (min 8 characters)";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      case "auth/invalid-email":
        return "Please enter a valid email address";
      default:
        return error.message || "An error occurred. Please try again.";
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      await createUserIfNotExists(result.user);
      toast.success("Google login successful!");
      handleRedirect();
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Google login error:", error);
        toast.error(getFriendlyError(error));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-blue-100 mt-1">Login to access your account</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className={`w-full flex justify-center items-center py-2 px-4 mb-5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium ${
              googleLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50"
            }`}
          >
            {googleLoading ? <FiLoader className="animate-spin mr-2" /> : <FcGoogle className="text-lg mr-2" />}
            Sign in with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={credentials.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-500" />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link href="/admin/login/forget-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/admin/signup" className="font-medium text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
