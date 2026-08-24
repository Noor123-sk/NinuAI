"use client";

import type { Chat } from "@/types/chat";

type ChatHistoryProps = {
  chats: Chat[];
  activeChat: Chat | null;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onRenameChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
};

export default function ChatHistory({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: ChatHistoryProps) {
  return (
    <aside className="w-64 bg-white border rounded-3xl p-5">
      <button
        onClick={onNewChat}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        + New Chat
      </button>

      <h3 className="font-bold mt-8 mb-4">
        Recent Chats
      </h3>

      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 p-3 rounded-xl ${
              activeChat?.id === chat.id
                ? "bg-gray-100 text-black"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <button
              onClick={() => onSelectChat(chat)}
              className="flex-1 text-left truncate"
              title={chat.title}
            >
              {chat.title}
            </button>

            <button
              onClick={() => onRenameChat(chat.id)}
              className="opacity-0 group-hover:opacity-100 text-sm px-1"
              title="Rename chat"
              aria-label={`Rename ${chat.title}`}
            >
              ✏️
            </button>

            <button
              onClick={() => onDeleteChat(chat.id)}
              className="opacity-0 group-hover:opacity-100 text-sm px-1"
              title="Delete chat"
              aria-label={`Delete ${chat.title}`}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
