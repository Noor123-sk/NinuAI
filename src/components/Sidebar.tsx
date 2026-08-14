"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold mb-10">
          Ninu AI
        </h1>

        {/* Menu */}
        <nav className="space-y-3">
          <Link
            href="/dashboard/chat"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/chat"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            🗨 Chat
          </Link>

          <Link
            href="/image-generator"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/image-generator"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            🎨 Image AI
          </Link>

          <Link
            href="/dashboard/vision"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/vision"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            👁️ Vision AI
          </Link>

          <Link
            href="/dashboard/data-analysis"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/data-analysis"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            📊 Data Analysis
          </Link>

          <Link
            href="/dashboard/code"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/code"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            💻 Code AI
          </Link>

          <Link
            href="/dashboard/documents"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/documents"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            📄 Documents
          </Link>

          <Link
            href="/dashboard/automation"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/automation"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            ⚡ Automation
          </Link>

          <Link
            href="/dashboard/settings"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/settings"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            ⚙ Settings
          </Link>
        </nav>
      </div>

      {/* Bottom Profile */}
      <div className="mt-auto border-t border-gray-700 pt-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            👤
          </div>

          <div>
            <p className="font-semibold">
              Nooran
            </p>

            <p className="text-sm text-gray-400">
              AI Creator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
