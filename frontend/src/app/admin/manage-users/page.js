"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulate fetching users from the database or localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex justify-between items-center p-4 border rounded-md shadow-md">
            <div className="flex items-center">
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-lg text-gray-600 ml-4">{user.email}</p>
            </div>
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="text-red-600 hover:underline"
            >
              Delete User
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUsers;
