import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ChatProvider } from "@/context/ChatContext";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ChatProvider>
      <main className="h-screen bg-gray-50 flex overflow-hidden">
        <aside className="w-64 h-screen shrink-0">
          <Sidebar />
        </aside>

        <section className="flex-1 min-w-0 h-screen overflow-y-auto p-8">
          {children}
        </section>
      </main>
    </ChatProvider>
  );
}
