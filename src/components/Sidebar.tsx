"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@/context/ChatContext";

export default function Sidebar() {
  const pathname = usePathname();
  const {
    chats,
    activeChat,
    setActiveChat,
    createNewChat,
    renameChat,
    deleteChat,
  } = useChat();

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
            href="/dashboard/video"
            className={`block px-4 py-3 rounded-xl transition ${
              pathname === "/dashboard/video"
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            🎬 Video AI
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

          {pathname === "/dashboard/chat" && (
            <div className="mt-2 ml-2">
              <button
                onClick={createNewChat}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition"
              >
                + New Chat
              </button>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2 px-2">
                Recent Chats
              </p>

              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
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
                      onClick={() => setActiveChat(chat)}
                      className="flex-1 min-w-0 text-left px-3 py-2 text-sm truncate"
                      title={chat.title}
                    >
                      {chat.title}
                    </button>

                    <button
                      onClick={() => renameChat(chat.id)}
                      className="opacity-0 group-hover:opacity-100 px-1 text-xs transition"
                      title="Rename chat"
                      aria-label={`Rename ${chat.title}`}
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="opacity-0 group-hover:opacity-100 px-1 text-xs transition"
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
