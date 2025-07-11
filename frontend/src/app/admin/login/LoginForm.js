"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithRedirect
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiLoader, FiAlertCircle, FiCheckCircle
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast, ToastContainer } from 'react-toastify';
import { createUserIfNotExists } from "@/lib/utils/createUserIfNotExists";
import { handlePostLoginRedirect } from "@/hooks/useAuth"; // ✅ IMPORTED
import 'react-toastify/dist/ReactToastify.css';

const AUTH_CONFIG = {
  signupPath: '/admin/signup',
  forgotPasswordPath: '/admin/login/forget-password',
  storageKeys: {
    user: 'firebase:auth:user'
  }
};

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  const storage = {
    get: (key) => {
      try {
        if (typeof window !== 'undefined') {
          const item = localStorage.getItem(`${AUTH_CONFIG.storageKeys[key]}`);
          return item ? JSON.parse(item) : null;
        }
      } catch (error) {
        console.error('Storage get error:', error);
      }
      return null;
    },
    set: (key, value) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${AUTH_CONFIG.storageKeys[key]}`, JSON.stringify(value));
        }
      } catch (error) {
        console.error('Storage set error:', error);
      }
    },
    remove: (key) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`${AUTH_CONFIG.storageKeys[key]}`);
        }
      } catch (error) {
        console.error('Storage remove error:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getAuthErrorMessage = (errorCode) => {
    const errorMap = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/too-many-requests": "Too many attempts. Account temporarily locked.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/invalid-email": "Please enter a valid email address",
      "auth/network-request-failed": "Network error. Please check your connection",
      "auth/popup-closed-by-user": "Google sign-in was cancelled",
      default: "Login failed. Please try again."
    };
    return errorMap[errorCode] || errorMap.default;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(credentials.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, credentials.email, credentials.password
      );

      if (!userCredential.user.emailVerified) {
        toast.warn("Please verify your email address. Check your inbox.", {
          icon: <FiAlertCircle className="text-yellow-500" />,
          autoClose: 5000,
        });
        await auth.signOut();
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully!", {
        icon: <FiCheckCircle className="text-green-500" />,
      });

      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || credentials.email.split("@")[0],
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        lastLogin: new Date().toISOString()
      };

      storage.set('user', userData);
      handlePostLoginRedirect(); // ✅ universal redirect
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      await createUserIfNotExists(result.user);

      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split("@")[0],
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        lastLogin: new Date().toISOString()
      };

      storage.set('user', userData);
      toast.success("Google login successful!");
      handlePostLoginRedirect(); // ✅
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error("Redirect login error:", redirectError);
          toast.error(getAuthErrorMessage(redirectError.code));
        }
      } else {
        console.error("Google login error:", error);
        toast.error(getAuthErrorMessage(error.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
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
        {googleLoading ? (
          <FiLoader className="animate-spin mr-2" />
        ) : (
          <FcGoogle className="text-lg mr-2" />
        )}
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
              autoComplete="username"
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
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FiEyeOff className="text-gray-400 hover:text-gray-500" />
              ) : (
                <FiEye className="text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <Link href={AUTH_CONFIG.forgotPasswordPath} className="text-sm text-blue-600 hover:text-blue-800">
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
        Don&apos;t have an account?{" "}
        <Link href={AUTH_CONFIG.signupPath} className="font-medium text-blue-600 hover:text-blue-800">
          Sign up
        </Link>
      </div>

      <ToastContainer position="top-center" autoClose={5000} theme="colored" />
    </div>
  );
};

export default LoginForm;
