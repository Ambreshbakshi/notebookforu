import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        <Sidebar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}