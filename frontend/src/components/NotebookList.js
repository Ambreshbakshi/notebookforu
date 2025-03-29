// src/components/NotebookList.js

"use client";
import { useState, useEffect } from "react";
import NotebookCard from "./NotebookCard";

const NotebookList = () => {
  const [notebooks, setNotebooks] = useState([]);

  useEffect(() => {
    // Simulated data (Later, this can be fetched from an API)
    setNotebooks([
      { id: "1", name: "Classic Notebook", price: "$9.99", image: "/notebook1.jpg" },
      { id: "2", name: "Custom Cover Notebook", price: "$12.99", image: "/notebook2.jpg" },
      { id: "3", name: "Premium Notebook", price: "$15.99", image: "/notebook3.jpg" },
    ]);
  }, []);

  return (
    <section className="py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">Our Notebooks</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {notebooks.map((notebook) => (
          <NotebookCard key={notebook.id} notebook={notebook} />
        ))}
      </div>
    </section>
  );
};

export default NotebookList;
