"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "ai";
  text: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("ninu-chats");

    if (savedChats) {
      try {
        const parsed: Chat[] = JSON.parse(savedChats);

        if (parsed.length > 0) {
          setChats(parsed);
          setActiveChat(parsed[0]);
        } else {
          createNewChat();
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat, loading]);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("ninu-chats", JSON.stringify(chats));
    }
  }, [chats]);

  function createNewChat() {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [
        {
          role: "ai",
          text: "Hello! I am Ninu AI. How can I help you?",
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
  }

  function renameChat(chatId: string) {
    const chat = chats.find((item) => item.id === chatId);

    if (!chat) return;

    const newTitle = window.prompt("Rename chat", chat.title);

    if (!newTitle?.trim()) return;

    const updatedChat = {
      ...chat,
      title: newTitle.trim().slice(0, 40),
    };

    setChats((prev) =>
      prev.map((item) =>
        item.id === chatId ? updatedChat : item
      )
    );

    if (activeChat?.id === chatId) {
      setActiveChat(updatedChat);
    }
  }

  function deleteChat(chatId: string) {
    const chat = chats.find((item) => item.id === chatId);

    if (!chat) return;

    const confirmed = window.confirm(
      `Delete "${chat.title}"?`
    );

    if (!confirmed) return;

    const remainingChats = chats.filter(
      (item) => item.id !== chatId
    );

    if (remainingChats.length === 0) {
      const newChat: Chat = {
        id: crypto.randomUUID(),
        title: "New Chat",
        messages: [
          {
            role: "ai",
            text: "Hello! I am Ninu AI. How can I help you?",
          },
        ],
      };

      setChats([newChat]);
      setActiveChat(newChat);
      return;
    }

    setChats(remainingChats);

    if (activeChat?.id === chatId) {
      setActiveChat(remainingChats[0]);
    }
  }

  async function sendMessage() {
    if (!message.trim() || !activeChat || loading) {
      return;
    }

    const userText = message.trim();

    const updatedMessages: Message[] = [
      ...activeChat.messages,
      {
        role: "user",
        text: userText,
      },
    ];

    const updatedChat: Chat = {
      ...activeChat,
      title:
        activeChat.title === "New Chat"
          ? userText.slice(0, 25)
          : activeChat.title,
      messages: updatedMessages,
    };

    setActiveChat(updatedChat);

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id ? updatedChat : chat
      )
    );

    setMessage("");
    setLoading(true);

    let language = "Auto";
    let responseStyle = "Balanced";

    const savedSettings = localStorage.getItem("ninu-settings");

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);

        if (typeof settings.language === "string") {
          language = settings.language;
        }

        if (typeof settings.responseStyle === "string") {
          responseStyle = settings.responseStyle;
        }
      } catch {
        console.warn("Could not read Ninu settings.");
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          language,
          responseStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || "API request failed");
      }

      const finalMessages: Message[] = [
        ...updatedMessages,
        {
          role: "ai",
          text:
            data.reply ||
            "Sorry, I couldn't generate a response.",
        },
      ];

      const finalChat: Chat = {
        ...updatedChat,
        messages: finalMessages,
      };

      setActiveChat(finalChat);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id ? finalChat : chat
        )
      );
    } catch (error) {
      console.error("Chat Error:", error);

      const errorMessages: Message[] = [
        ...updatedMessages,
        {
          role: "ai",
          text: "Sorry bro, Ninu AI is temporarily unavailable.",
        },
      ];

      const errorChat: Chat = {
        ...updatedChat,
        messages: errorMessages,
      };

      setActiveChat(errorChat);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id ? errorChat : chat
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center">
        Loading Ninu AI...
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6">
      <aside className="w-64 bg-white border rounded-3xl p-5">
        <button
          onClick={createNewChat}
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
                activeChat.id === chat.id
                  ? "bg-gray-100 text-black"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <button
                onClick={() => setActiveChat(chat)}
                className="flex-1 text-left truncate"
                title={chat.title}
              >
                {chat.title}
              </button>

              <button
                onClick={() => renameChat(chat.id)}
                className="opacity-0 group-hover:opacity-100 text-sm px-1"
                title="Rename chat"
                aria-label={`Rename ${chat.title}`}
              >
                ✏️
              </button>

              <button
                onClick={() => deleteChat(chat.id)}
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

      <section className="flex-1 bg-white border rounded-3xl overflow-hidden flex flex-col">
        <div className="bg-black text-white p-5">
          <h2 className="text-xl font-bold">
            🤖 Ninu AI
          </h2>

          <p className="text-sm text-gray-300">
            Your intelligent AI assistant
          </p>
        </div>

        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          {activeChat.messages.map((msg, index) => (
            <div
              key={`${activeChat.id}-${index}`}
              className={
                msg.role === "user"
                  ? "bg-black text-white p-4 rounded-2xl max-w-lg ml-auto"
                  : "bg-gray-100 text-black p-4 rounded-2xl max-w-lg"
              }
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="bg-gray-100 p-4 rounded-2xl max-w-lg">
              🤖 Ninu AI is thinking
              <span className="animate-pulse">...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="border-t p-4 flex gap-3">
          <input
            value={message}
            disabled={loading}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Message Ninu AI..."
            className="flex-1 border rounded-full px-5 py-3 outline-none"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="bg-black text-white px-6 rounded-full flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={18} />

            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </section>
    </div>
  );
}