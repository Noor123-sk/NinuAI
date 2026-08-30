"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@/context/ChatContext";

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const {
    chats,
    activeChat,
    setActiveChat,
    createNewChat,
    renameChat,
    deleteChat,
  } = useChat();

  const handleNavigate = () => {
    onNavigate?.();
  };

  return (
    <aside className="flex h-full w-64 min-h-screen flex-col bg-black p-6 text-white">
      {/* Logo */}
      <div>
        <h1 className="mb-10 text-2xl font-bold">
          Ninu AI
        </h1>

        {/* Menu */}
        <nav className="space-y-3">
          <Link
            href="/dashboard/chat"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/chat"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            🗨 Chat
          </Link>

          <Link
            href="/image-generator"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/image-generator"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            🎨 Image AI
          </Link>

          <Link
            href="/dashboard/video"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/video"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            🎬 Video AI
          </Link>

          <Link
            href="/dashboard/vision"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/vision"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            👁️ Vision AI
          </Link>

          <Link
            href="/dashboard/data-analysis"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/data-analysis"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            📊 Data Analysis
          </Link>

          <Link
            href="/dashboard/code"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/code"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            💻 Code AI
          </Link>

          <Link
            href="/dashboard/documents"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/documents"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            📄 Documents
          </Link>

          <Link
            href="/dashboard/automation"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/automation"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            ⚡ Automation
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={handleNavigate}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/settings"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            ⚙ Settings
          </Link>

          {pathname === "/dashboard/chat" && (
            <div className="ml-2 mt-2">
              <button
                onClick={createNewChat}
                className="w-full rounded-lg bg-gray-800 px-3 py-2 text-left text-sm transition hover:bg-gray-700"
              >
                + New Chat
              </button>

              <p className="mb-2 mt-5 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Recent Chats
              </p>

              <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-1 rounded-lg transition ${
                      activeChat?.id === chat.id
                        ? "bg-gray-700"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveChat(chat);
                        handleNavigate();
                      }}
                      className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm"
                      title={chat.title}
                    >
                      {chat.title}
                    </button>

                    <button
                      onClick={() => renameChat(chat.id)}
                      className="px-1 text-xs opacity-0 transition group-hover:opacity-100"
                      title="Rename chat"
                      aria-label={`Rename ${chat.title}`}
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="px-1 text-xs opacity-0 transition group-hover:opacity-100"
                      title="Delete chat"
                      aria-label={`Delete ${chat.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile */}
          <Link
            href="/dashboard/profile"
            onClick={handleNavigate}
            className={`mt-3 block rounded-xl px-4 py-3 transition ${
              pathname === "/dashboard/profile"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            👤 Profile
          </Link>
        </nav>
      </div>

      {/* Bottom Profile */}
      <div className="mt-auto border-t border-gray-700 pt-5">
        <Link
          href="/dashboard/profile"
          onClick={handleNavigate}
          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-800"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
            👤
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">
              Nooran
            </p>

            <p className="text-sm text-gray-400">
              AI Creator
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
