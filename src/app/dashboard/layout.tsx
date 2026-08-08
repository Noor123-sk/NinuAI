import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50 flex">

      <Sidebar />

      <section className="flex-1 p-8">
        {children}
      </section>

    </main>
  );
}