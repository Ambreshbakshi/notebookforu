// src/components/NotebookCard.js

import Image from "next/image";
import Link from "next/link";

const NotebookCard = ({ notebook }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      {/* Notebook Image */}
      <Link href={`/notebook/${notebook.id}`} className="block relative w-full h-64">
        <Image
          src={notebook.image}
          alt={notebook.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Notebook Details */}
      <div className="p-4 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">{notebook.name}</h2>
        <p className="text-gray-600 text-lg font-medium">
  ${Number(notebook.price).toFixed(2)}
</p>


        {/* View Details Button */}
        <Link
          href={`/notebook/${notebook.id}`}
          className="mt-4 block text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default NotebookCard;
