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

function formatAIText(text: string) {
  let clean = text;

  // Remove JSON wrapper if the API returns {"reply":"..."}
  try {
    const parsed = JSON.parse(clean);
    if (parsed?.reply) clean = parsed.reply;
  } catch {
    // Keep normal text unchanged
  }

  clean = clean.replace(/\\n/g, "\n");

  return clean;
}

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
                          text: formatAIText(aiText),
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
                          text: formatAIText(aiText),
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
                        text: "Ninu AI is temporarily unavailable. Please try again.",
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
    <div className="min-h-screen bg-[#f7f7f8] text-gray-900">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r border-gray-200 bg-white p-4 transition-transform duration-200 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Ninu AI</h1>
            <p className="mt-1 text-xs text-gray-500">
              Your AI workspace
            </p>
          </div>

          <button
            className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <button
          onClick={createNewChat}
          className="mb-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-85"
        >
          + New Chat
        </button>

        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Recent chats
        </p>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                setSidebarOpen(false);
              }}
              className={`w-full truncate rounded-xl px-3 py-3 text-left text-sm transition ${
                chat.id === activeChatId
                  ? "bg-gray-100 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              💬 {chat.title}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-3">
          <Link
            href="/dashboard/settings"
            className="block w-full rounded-xl px-3 py-3 text-left text-sm text-gray-600 transition hover:bg-gray-50"
          >
            ⚙️ Settings
          </Link>

          <Link
            href="/dashboard/settings"
            className="block w-full rounded-xl px-3 py-3 text-left text-sm text-gray-600 transition hover:bg-gray-50"
          >
            👤 Profile
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen md:ml-[280px]">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6 md:px-10 md:py-8">

          {/* Header */}
          <header className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg shadow-sm md:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div>
              <h2 className="text-lg font-semibold sm:text-xl">
                Ninu AI
              </h2>
              <p className="text-xs text-gray-500">
                Your all-in-one AI workspace
              </p>
            </div>
          </header>

          {/* Chat */}
          <section className="flex flex-1 flex-col">
            <div className="flex-1 py-6 sm:py-8">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500">
                  {activeChat?.title || "New conversation"}
                </p>
              </div>

              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[75%] ${
                        message.role === "user"
                          ? "rounded-2xl rounded-br-md bg-black px-4 py-3 text-white"
                          : "px-1 py-1 text-gray-800"
                      }`}
                    >
                      {message.role === "ai" && (
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
                            N
                          </span>
                          Ninu AI
                        </div>
                      )}

                      <div
                        className={`whitespace-pre-wrap break-words text-[15px] leading-7 ${
                          message.role === "user"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {message.text ? (
                          formatAIText(message.text)
                        ) : (
                          <span className="animate-pulse text-gray-400">
                            Ninu is thinking...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-[#f7f7f8] pb-3 pt-2">
              <div className="rounded-2xl border border-gray-300 bg-white p-2 shadow-sm">
                <div className="flex items-end gap-2">
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
                    className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 disabled:opacity-50"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {isLoading ? "..." : "Send"}
                  </button>
                </div>
              </div>

              <p className="mt-2 text-center text-[11px] text-gray-400">
                Ninu AI can make mistakes. Check important information.
              </p>
            </div>

            {/* Tools */}
            <div className="grid grid-cols-1 gap-3 pb-4 pt-5 sm:grid-cols-3">
              <Link
                href="/image-generator"
                className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="mb-1 text-sm font-semibold">
                  🎨 Image Generator
                </div>
                <p className="text-xs text-gray-500">
                  Create images with AI.
                </p>
              </Link>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="mb-1 text-sm font-semibold">
                  💻 Code Assistant
                </div>
                <p className="text-xs text-gray-500">
                  Build and debug code faster.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="mb-1 text-sm font-semibold">
                  ⚡ Automation
                </div>
                <p className="text-xs text-gray-500">
                  Automate daily workflows.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
