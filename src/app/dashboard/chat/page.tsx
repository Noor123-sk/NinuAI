"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Plus,
  Paperclip,
  Image as ImageIcon,
  Search,
  Palette,
  X,
} from "lucide-react";

import type { Chat, Message } from "@/types/chat";
import { useChat } from "@/context/ChatContext";
import ChatHistory from "@/components/chat/ChatHistory";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  type LibraryImage = {
    id: string;
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  };

  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [showTools, setShowTools]= useState(false);
  const [feedback, setFeedback] =useState<Record<string, "like" | "dislike">>({});

  const {
    chats,
    activeChat,
    setActiveChat,
    createNewChat,
    renameChat,
    deleteChat,
    updateChat,
  } = useChat();

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedLibrary = localStorage.getItem("ninu-library");

    if (savedLibrary) {
      try {
        const parsed: LibraryImage[] = JSON.parse(savedLibrary);
        setLibraryImages(parsed);
      } catch (error) {
        console.error("Failed to load library:", error);
      }
    }

    setLibraryLoaded(true);
  }, []);

  useEffect(() => {
    if (!libraryLoaded) {
      return;
    }

    localStorage.setItem("ninu-library", JSON.stringify(libraryImages));
  }, [libraryImages, libraryLoaded]);



  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat, loading]);

  async function sendMessage() {
    if ((!message.trim() && !uploadedImage) || !activeChat || loading) {
      return;
    }

    const userText = message.trim();

    const userMessage: Message = {
      role: "user",
      text: userText,
      ...(uploadedImage
        ? {
            image: {
              name: uploadedImage.name,
              type: uploadedImage.type,
              dataUrl: uploadedImage.dataUrl,
            },
          }
        : {}),
    };

    const updatedMessages: Message[] = [
      ...activeChat.messages,
      userMessage,
    ];

    const updatedChat: Chat = {
      ...activeChat,
      title:
        activeChat.title === "New Chat"
          ? (userText || uploadedImage?.name || "Image Chat").slice(0, 25)
          : activeChat.title,
      messages: updatedMessages,
    };

    setActiveChat(updatedChat);
    updateChat(updatedChat);

    setMessage("");
    setUploadedImage(null);
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
      updateChat(finalChat);
    } catch (error) {
      console.error("Chat Error:", error);

      const errorMessages: Message[] = [
        ...updatedMessages,
        {
          role: "ai",
          text:
            error instanceof Error
              ? error.message
              : "Ninu AI is temporarily unavailable.",
        },
      ];

      const errorChat: Chat = {
        ...updatedChat,
        messages: errorMessages,
      };

      setActiveChat(errorChat);
      updateChat(errorChat);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateResponse(messageIndex: number) {
    if (!activeChat || loading) {
      return;
    }

    const previousUserMessage = activeChat.messages
      .slice(0, messageIndex)
      .reverse()
      .find((msg) => msg.role === "user");

    if (!previousUserMessage) {
      return;
    }

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

    const messagesBeforeResponse = activeChat.messages.slice(
      0,
      messageIndex
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesBeforeResponse,
          language,
          responseStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || "API request failed");
      }

      const regeneratedMessages = [
        ...messagesBeforeResponse,
        {
          role: "ai" as const,
          text:
            data.reply ||
            "Sorry, I couldn't generate a response.",
        },
      ];

      const regeneratedChat: Chat = {
        ...activeChat,
        messages: regeneratedMessages,
      };

      setActiveChat(regeneratedChat);

      updateChat(regeneratedChat);
    } catch (error) {
      console.error("Regenerate Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function copyMessage(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy message:", error);
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
                  ? "flex flex-col items-end"
                  : "flex flex-col items-start"
              }
            >
              <div
                className={
                  msg.role === "user"
                    ? "bg-black text-white p-4 rounded-2xl max-w-lg"
                    : "bg-gray-100 text-black p-4 rounded-2xl max-w-lg"
                }
              >
                <div className="whitespace-pre-wrap">
                  {msg.image && (
                    <img
                      src={msg.image.dataUrl}
                      alt={msg.image.name}
                      className="mb-3 max-w-xs max-h-80 rounded-xl object-contain border border-gray-200"
                    />
                  )}

                  {msg.text}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="mt-1 flex items-center justify-end">
                  <button
                    onClick={() => copyMessage(msg.text)}
                    className="text-xs text-gray-400 hover:text-black transition"
                    title="Copy message"
                    aria-label="Copy message"
                  >
                    📋 Copy
                  </button>
                </div>
              )}

              {msg.role === "ai" && (
                <div className="mt-1 flex items-center gap-3">
                  <button
                    onClick={() => copyMessage(msg.text)}
                    className="text-xs text-gray-500 hover:text-black transition"
                    title="Copy response"
                    aria-label="Copy response"
                  >
                    📋 Copy
                  </button>

                  {index > 0 && (
                    <button
                      onClick={() => regenerateResponse(index)}
                      disabled={loading}
                      className="text-xs text-gray-500 hover:text-black transition disabled:opacity-50"
                      title="Regenerate response"
                      aria-label="Regenerate response"
                    >
                      🔄 Regenerate
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setFeedback((prev) => ({
                        ...prev,
                        [`${activeChat.id}-${index}`]: "like",
                      }))
                    }
                    className={`text-xs px-2 py-1 rounded-lg transition ${
                      feedback[`${activeChat.id}-${index}`] === "like"
                        ? "bg-black text-white"
                        : "text-gray-500 hover:bg-gray-200 hover:text-black"
                    }`}
                    title="Like response"
                    aria-label="Like response"
                  >
                    👍
                  </button>

                  <button
                    onClick={() =>
                      setFeedback((prev) => ({
                        ...prev,
                        [`${activeChat.id}-${index}`]: "dislike",
                      }))
                    }
                    className={`text-xs px-2 py-1 rounded-lg transition ${
                      feedback[`${activeChat.id}-${index}`] === "dislike"
                        ? "bg-black text-white"
                        : "text-gray-500 hover:bg-gray-200 hover:text-black"
                    }`}
                    title="Dislike response"
                    aria-label="Dislike response"
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="bg-gray-100 text-black p-4 rounded-2xl max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">🤖 Ninu AI</span>

                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

          <div className="border-t p-4">
            <div className="relative flex items-end gap-3">

              <button
                type="button"
                onClick={() => setToolsOpen((prev) => !prev)}
                className="w-11 h-11 shrink-0 rounded-full border border-gray-200 bg-white text-xl flex items-center justify-center hover:bg-gray-100 transition"
                title="Add tools"
                aria-label="Add tools"
              >
                +
              </button>

              {toolsOpen && (
                <div className="absolute bottom-14 left-0 z-50 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-3">

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-left transition"
                  >
                    <span className="text-xl">📎</span>
                    <span>
                      <span className="block font-medium">Add photos & files</span>
                      <span className="block text-xs text-gray-500">
                        Upload from computer
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
   onClick={() => {
     setLibrarySearch("");
     setLibraryOpen(true);
   }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-left transition"
                  >
                    <span className="text-xl">🗂️</span>
                    <span>
                      <span className="block font-medium">Add from library</span>
                      <span className="block text-xs text-gray-500">
                        Browse and search your files
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Create image tool coming next.")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-left transition"
                  >
                    <span className="text-xl">🎨</span>
                    <span>
                      <span className="block font-medium">Create image</span>
                      <span className="block text-xs text-gray-500">
                        Visualize anything
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Deep research tool coming next.")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-left transition"
                  >
                    <span className="text-xl">🔎</span>
                    <span>
                      <span className="block font-medium">Deep research</span>
                      <span className="block text-xs text-gray-500">
                        Get a detailed report
                      </span>
                    </span>
                  </button>

                  <div className="my-2 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={() => alert("OpenAI Platform connection coming soon.")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-left transition"
                  >
                    <span className="text-xl">🔑</span>
                    <span>
                      <span className="block font-medium">OpenAI Platform</span>
                      <span className="block text-xs text-gray-500">
                        Create an OpenAI API key after connecting Platform
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("GitHub connection coming soon.")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-left transition"
                  >
                    <span className="text-xl">🐙</span>
                    <span>
                      <span className="block font-medium">GitHub</span>
                      <span className="block text-xs text-gray-500">
                        Triage PRs, issues, CI, and publish flows
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Canva connection coming soon.")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-left transition"
                  >
                    <span className="text-xl">🎨</span>
                    <span>
                      <span className="block font-medium">Canva</span>
                      <span className="block text-xs text-gray-500">
                        Create, review, edit designs
                      </span>
                    </span>
                  </button>

                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      🔍 Type to search plugins, files, folders & skills
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("Connect a service")}
                      className="w-full mt-1 text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
                    >
                      🔗 Connect
                    </button>
                  </div>
                </div>
              )}

            {uploadedImage && (
              <div className="px-4 pt-3">
                <div className="relative inline-block">
                  <img
                    src={uploadedImage.dataUrl}
                    alt={uploadedImage.name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  />

                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);

                  if (files.length === 0) {
                    return;
                  }

                  try {
                    setLoading(true);

                    for (const file of files) {
                      const formData = new FormData();
                      formData.append("file", file);

                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(
                          data.error || "Failed to upload image."
                        );
                      }

                      setUploadedImage(data.file);

        setLibraryImages((prev) => [
          ...prev.filter((item) => item.dataUrl !== data.file.dataUrl),
          {
            id: crypto.randomUUID(),
            name: data.file.name,
            type: data.file.type,
            size: data.file.size,
            dataUrl: data.file.dataUrl,
          },
        ]);
                      console.log("Image uploaded:", data.file);
                    }

                    alert(
                      `${files.length} image${files.length > 1 ? "s" : ""} uploaded successfully.`
                    );
                  } catch (error) {
                    console.error("Image upload failed:", error);

                    alert(
                      error instanceof Error
                        ? error.message
                        : "Failed to upload image."
                    );
                  } finally {
                    setLoading(false);
                    event.target.value = "";
                    setToolsOpen(false);
                  }
                }}
              />

{libraryOpen && (
  <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b">
        <div>
          <h3 className="text-lg font-bold">Ninu Library</h3>
          <p className="text-sm text-gray-500">Browse your uploaded images</p>
        </div>

        <button
          type="button"
          onClick={() => setLibraryOpen(false)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Close library"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5">
        <div className="relative mb-5">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={librarySearch}
            onChange={(event) => setLibrarySearch(event.target.value)}
            placeholder="Search your library..."
            className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-black transition"
          />
        </div>

        {libraryImages.filter((image) =>
          image.name.toLowerCase().includes(librarySearch.toLowerCase())
        ).length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🗂️</div>
            <p className="font-medium">Your library is empty</p>
            <p className="text-sm text-gray-500 mt-1">Upload an image to add it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
            {libraryImages
              .filter((image) =>
                image.name.toLowerCase().includes(librarySearch.toLowerCase())
              )
              .map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    setUploadedImage(image);
                    setLibraryOpen(false);
                    setToolsOpen(false);
                  }}
                  className="text-left border border-gray-200 rounded-2xl overflow-hidden hover:border-black hover:shadow-md transition group"
                >
                  <img
                    src={image.dataUrl}
                    alt={image.name}
                    className="w-full h-36 object-cover group-hover:scale-[1.02] transition"
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(image.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

              <input
                value={message}
                disabled={loading}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="flex-1 min-w-0 border border-gray-200 rounded-2xl px-5 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
              />

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send"}
              </button>

            </div>
          </div>
      </section>
    </div>
  );
}
