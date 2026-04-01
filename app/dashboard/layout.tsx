import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">DocuForge</h2>
        </div>
        <nav className="mt-4">
          <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
          <Link href="/dashboard/documents" className="block px-4 py-2 hover:bg-gray-700">Documents</Link>
          <Link href="/dashboard/companies" className="block px-4 py-2 hover:bg-gray-700">Companies</Link>
          <Link href="/dashboard/contacts" className="block px-4 py-2 hover:bg-gray-700">Contacts</Link>
          <Link href="/dashboard/items" className="block px-4 py-2 hover:bg-gray-700">Items</Link>
        </nav>
      </aside>
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}