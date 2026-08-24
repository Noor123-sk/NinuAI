"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Chat } from "@/types/chat";

type ChatContextType = {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
  createNewChat: () => void;
  renameChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateChat: (updatedChat: Chat) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChatState] = useState<Chat | null>(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("ninu-chats");

    if (savedChats) {
      try {
        const parsed: Chat[] = JSON.parse(savedChats);

        if (parsed.length > 0) {
          setChats(parsed);
          setActiveChatState(parsed[0]);
          return;
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    }

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
    setActiveChatState(newChat);
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("ninu-chats", JSON.stringify(chats));
    }
  }, [chats]);

  function setActiveChat(chat: Chat) {
    setActiveChatState(chat);
  }

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
    setActiveChatState(newChat);
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
      setActiveChatState(updatedChat);
    }
  }

  function deleteChat(chatId: string) {
    const remainingChats = chats.filter(
      (chat) => chat.id !== chatId
    );

    if (remainingChats.length === 0) {
      createNewChat();
      return;
    }

    setChats(remainingChats);

    if (activeChat?.id === chatId) {
      setActiveChatState(remainingChats[0]);
    }
  }

  function updateChat(updatedChat: Chat) {
    setActiveChatState(updatedChat);

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === updatedChat.id
          ? updatedChat
          : chat
      )
    );
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        setActiveChat,
        createNewChat,
        renameChat,
        deleteChat,
        updateChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChat must be used inside ChatProvider"
    );
  }

  return context;
}
