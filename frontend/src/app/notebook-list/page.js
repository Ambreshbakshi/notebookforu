"use client";
import NotebookList from "@/components/NotebookList";

const NotebookListPage = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Browse Notebooks</h1>
      <NotebookList />
    </div>
  );
};

export default NotebookListPage;
