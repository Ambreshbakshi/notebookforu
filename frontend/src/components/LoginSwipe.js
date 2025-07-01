"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff, FiX, FiLoader, FiAlertCircle, FiCheckCircle, FiLogOut } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import { createUserIfNotExists } from "@/lib/utils/createUserIfNotExists";

const LoginSwipe = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const db = getFirestore();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const fetchName = async () => {
      if (user?.uid) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfileName(userSnap.data().name || "");
          }
        } catch (err) {
          console.error("Failed to fetch profile name", err);
        }
      }
    };

    fetchName();
  }, [user]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
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
        toast.warn("Please verify your email. Check your inbox.", { icon: <FiAlertCircle className="text-yellow-500" />, autoClose: 5000 });
        await auth.signOut();
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully!", { icon: <FiCheckCircle className="text-green-500" /> });
      onClose();
    } catch (err) {
      let errorMessage = "Login failed. Please try again.";
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Try again later.";
          break;
      }
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
      toast.success("Google login successful!");
      onClose();
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        toast.error("Google login failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully!");
      onClose();
    } catch (err) {
      toast.error("Logout failed!");
    }
  };

  return (
  <AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-50">
      
      {/* Full Black Blur Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in Login Box */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", ease: "easeInOut" }}
        className="absolute top-0 right-0 h-full w-80 bg-white shadow-lg flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Sign In</h2>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {user ? (
            <div className="text-center mt-8">
              <FiUser className="mx-auto text-4xl mb-2" />
              <h3 className="font-semibold text-lg mb-1">
                {profileName || user.displayName || "No Name"}
              </h3>
              <p className="text-gray-500 mb-4">{user.email}</p>

              <button
                onClick={handleLogout}
                className="w-full py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg flex justify-center items-center"
              >
                <FiLogOut className="mr-2" /> Log Out
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-3 p-2 text-sm text-red-600 bg-red-50 rounded flex items-center">
                  <FiAlertCircle className="mr-2" /> {error}
                </div>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Email address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="pl-10 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 pr-10 py-2 border rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 text-white rounded-lg ${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <span className="flex justify-center items-center">
                      <FiLoader className="animate-spin mr-2" /> Signing in...
                    </span>
                  ) : (
                    "Log In"
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = "/admin/signup";
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Create an account
                </button>
              </p>

              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-gray-200" />
                <span className="mx-2 text-sm text-gray-500">Or sign in with</span>
                <div className="flex-grow h-px bg-gray-200" />
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className={`w-full flex justify-center items-center py-2 mb-4 border border-gray-300 rounded-lg ${
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
            </>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>



  );
};

export default LoginSwipe;
