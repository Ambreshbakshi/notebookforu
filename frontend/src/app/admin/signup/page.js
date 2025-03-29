"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AdminSignup = () => {
  const router = useRouter();
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Check if password matches
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Simulate saving the new admin account (this would be handled in a backend)
    localStorage.setItem("admin", JSON.stringify(newAdmin));
    router.push("/admin/login");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Signup</h1>
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={newAdmin.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newAdmin.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={newAdmin.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Signup
        </button>
      </form>
    </div>
  );
};

export default AdminSignup;
