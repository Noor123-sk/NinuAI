"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "ai";
  text: string;
};

type Chat = {
  id: number;
  title: string;
  messages: Message[];
};

const STORAGE_KEY = "ninu-ai-chats";

export default function Dashboard() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      title: "New conversation",
      messages: [
        {
          role: "ai",
          text: "Hello! I'm Ninu AI 👋 How can I help you today?",
        },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? chats[0];

  const messages = activeChat?.messages ?? [];

  useEffect(() => {
    try {
      const savedChats = localStorage.getItem(STORAGE_KEY);

      if (savedChats) {
        const parsedChats: Chat[] = JSON.parse(savedChats);

        if (Array.isArray(parsedChats) && parsedChats.length > 0) {
          setChats(parsedChats);
          setActiveChatId(parsedChats[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load saved chats:", error);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save chats:", error);
    }
  }, [chats, isReady]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const createNewChat = () => {
    if (isLoading) return;

    const newChat: Chat = {
      id: Date.now(),
      title: "New conversation",
      messages: [
        {
          role: "ai",
          text: "Hello! I'm Ninu AI 👋 How can I help you today?",
        },
      ],
    };

    setChats((current) => [newChat, ...current]);
    setActiveChatId(newChat.id);
    setInput("");
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || isLoading || !activeChat) return;

    const userMessage: Message = {
      role: "user",
      text,
    };

    const updatedMessages = [...messages, userMessage];

    setChats((current) =>
      current.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title:
                chat.messages.length <= 1
                  ? text.slice(0, 35)
                  : chat.title,
              messages: [
                ...updatedMessages,
                {
                  role: "ai",
                  text: "",
                },
              ],
            }
          : chat
      )
    );

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to Ninu AI.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let aiText = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        aiText += chunk;

        setChats((current) =>
          current.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((message, index) =>
                    index === chat.messages.length - 1
                      ? {
                          role: "ai",
                          text: aiText,
                        }
                      : message
                  ),
                }
              : chat
          )
        );
      }

      const remainingText = decoder.decode();

      if (remainingText) {
        aiText += remainingText;

        setChats((current) =>
          current.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((message, index) =>
                    index === chat.messages.length - 1
                      ? {
                          role: "ai",
                          text: aiText,
                        }
                      : message
                  ),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);

      setChats((current) =>
        current.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: chat.messages.map((message, index) =>
                  index === chat.messages.length - 1
                    ? {
                        role: "ai",
                        text: "Ninu AI is temporarily unavailable.",
                      }
                    : message
                ),
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-screen w-72 bg-white border-r p-5 flex flex-col transition-transform duration-200 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Ninu AI
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Your AI workspace
            </p>
          </div>

          <button
            className="md:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <button
          onClick={createNewChat}
          className="w-full bg-black text-white rounded-xl px-4 py-3 font-medium hover:opacity-90 transition"
        >
          + New Chat
        </button>

        <div className="mt-8 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Recent chats
          </p>

          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm truncate transition ${
                  chat.id === activeChatId
                    ? "bg-gray-100 font-medium"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                💬 {chat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <button className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 text-sm">
            ⚙️ Settings
          </button>

          <button className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 text-sm">
            👤 Profile
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto p-5 md:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden bg-white border rounded-xl px-3 py-2"
              >
                ☰
              </button>

              <div>
                <h2 className="text-3xl font-bold">
                  Welcome to Ninu AI 👋
                </h2>

                <p className="text-gray-600 mt-2">
                  Your all-in-one AI workspace
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">
                🤖 {activeChat?.title || "Ninu AI"}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Powered by Ninu AI
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[520px] overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "ai"
                      ? "bg-gray-100 p-4 rounded-2xl max-w-3xl"
                      : "bg-black text-white p-4 rounded-2xl ml-auto max-w-2xl"
                  }
                >
                  <div className="text-xs opacity-60 mb-1">
                    {message.role === "ai" ? "Ninu AI" : "You"}
                  </div>

                  {message.text ? (
                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.text}
                    </div>
                  ) : (
                    <span className="animate-pulse text-gray-500">
                      Ninu is thinking...
                    </span>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-5">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask Ninu anything..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 resize-none border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                />

                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-black text-white px-6 py-3 rounded-2xl disabled:opacity-40 hover:opacity-90 transition"
                >
                  {isLoading ? "..." : "Send"}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Enter to send • Shift + Enter for a new line
              </p>
            </div>
          </div>

          {/* Tool Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-10">

            {/* Image Generator */}
            <Link
              href="/image-generator"
              className="block bg-white p-6 rounded-2xl border hover:shadow-md transition cursor-pointer"
            >
              <h3 className="font-bold text-xl">
                🎨 Image Generator
              </h3>

              <p className="text-gray-600 mt-2">
                Create images with AI.
              </p>
            </Link>

            {/* Code Assistant */}
            <div className="bg-white p-6 rounded-2xl border hover:shadow-md transition cursor-pointer">
              <h3 className="font-bold text-xl">
                💻 Code Assistant
              </h3>

              <p className="text-gray-600 mt-2">
                Build and debug code faster.
              </p>
            </div>

            {/* Automation */}
            <div className="bg-white p-6 rounded-2xl border hover:shadow-md transition cursor-pointer">
              <h3 className="font-bold text-xl">
                ⚡ Automation
              </h3>

              <p className="text-gray-600 mt-2">
                Automate daily workflows.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}