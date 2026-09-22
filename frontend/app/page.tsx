'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { useConversations } from '@/hooks/useConversations';
import { useSettings } from '@/hooks/useSettings';

export default function Home() {
  const { conversations, createConversation, deleteConversation, renameConversation } = useConversations();
  const { settings } = useSettings();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const handleNewChat = async () => {
    const chat = await createConversation('New Chat', settings.model);
    setActiveId(chat.id);
    setSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (id: string) => {
    await deleteConversation(id);
    if (activeId === id) {
      setActiveId(conversations.find((c) => c.id !== id)?.id || null);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectChat}
        onNew={handleNewChat}
        onDelete={handleDeleteChat}
        onRename={renameConversation}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <ChatArea
        conversationId={activeId}
        onMenuClick={() => setSidebarOpen(true)}
      />
    </div>
  );
}
