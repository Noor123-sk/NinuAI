import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
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
      <DashboardShell>{children}</DashboardShell>
    </ChatProvider>
  );
}
