"use client";
import { useParams } from "next/navigation";
import productData from "@/data/productData";
import Image from "next/image";

export default function DiaryDetail() {
  const { id } = useParams();
  const diary = productData.diaries[id]; // Directly access the diary by ID

  if (!diary) {
    return <div className="text-center text-red-500 text-lg">Diary not found.</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg flex gap-8">
        {/* Diary Image */}
        <img 
          src={diary.detailImage} 
          alt={diary.name} 
          className="w-1/2 h-96 object-cover rounded-lg"
        />

        {/* Diary Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-4">{diary.name}</h2>
          <p className="text-xl text-gray-700 mb-4">{diary.price}</p>
          <p><strong>Size:</strong> {diary.details.size}</p>
          <p><strong>Pages:</strong> {diary.details.pages}</p>
          <p><strong>Material:</strong> {diary.details.material}</p>
          <p><strong>Binding:</strong> {diary.details.binding}</p>
          <p><strong>GSM:</strong> {diary.details.gsm}</p>
          <p className="mt-4">{diary.details.description}</p>
        </div>
      </div>
    </div>
  );
}
