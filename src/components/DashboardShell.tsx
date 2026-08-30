"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 md:flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <section className="min-w-0 flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border px-3 py-2 text-lg"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <span className="font-bold">Ninu AI</span>
        </div>

        <div className="h-[calc(100vh-57px)] overflow-y-auto p-4 sm:p-6 md:h-screen md:p-8">
          {children}
        </div>
      </section>
    </main>
  );
}
