"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Simulate fetching products from the database or localStorage
    const storedProducts = JSON.parse(localStorage.getItem("notebooks")) || [];
    setProducts(storedProducts);
  }, []);

  const handleDelete = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem("notebooks", JSON.stringify(updatedProducts));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      <Link href="/admin/manage-products/add" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 mb-6 inline-block">
        Add New Product
      </Link>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex justify-between items-center p-4 border rounded-md shadow-md">
            <div className="flex items-center">
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
              <p className="text-xl font-semibold">{product.name}</p>
            </div>
            <div className="flex space-x-4">
              <Link href={`/admin/manage-products/edit/${product.id}`} className="text-blue-600 hover:underline">
                Edit
              </Link>
              <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
