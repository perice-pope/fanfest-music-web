"use client";

import { createContext, useContext, useState, useCallback } from "react";
import ChatDrawer from "@/components/ChatDrawer";

const ChatContext = createContext({ isOpen: false, openChat: () => {}, closeChat: () => {} });

export function useChat() {
  return useContext(ChatContext);
}

export default function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  return (
    <ChatContext.Provider value={{ isOpen, openChat, closeChat }}>
      {children}
      <ChatDrawer />
    </ChatContext.Provider>
  );
}
