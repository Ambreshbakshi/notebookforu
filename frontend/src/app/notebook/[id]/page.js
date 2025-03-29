"use client"; // Add this at the top

import { useParams } from "next/navigation";
import productData from "@/data/productData";
import Image from "next/image";
export default function NotebookDetail() {
  const { id } = useParams();
  const notebook = productData.notebooks[id]; // Direct object lookup

  if (!notebook) {
    return <div className="text-center text-red-500 text-lg">Notebook not found.</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg flex gap-8">
        {/* Notebook Image */}
        <img 
          src={notebook.detailImage} 
          alt={notebook.name} 
          className="w-1/2 h-96 object-cover rounded-lg"
        />

        {/* Notebook Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-4">{notebook.name}</h2>
          <p className="text-xl text-gray-700 mb-4">{notebook.price}</p>
          <p><strong>Size:</strong> {notebook.details.size}</p>
          <p><strong>Pages:</strong> {notebook.details.pages}</p>
          <p><strong>Material:</strong> {notebook.details.material}</p>
          <p><strong>Binding:</strong> {notebook.details.binding}</p>
          <p><strong>GSM:</strong> {notebook.details.gsm}</p>
          <p className="mt-4">{notebook.details.description}</p>
        </div>
      </div>
    </div>
  );
}
