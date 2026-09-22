import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '@/types';
import { api } from '@/lib/api';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getChats();
      setConversations(
        (res.conversations || []).sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = async (title?: string, model?: string) => {
    const newConv = await api.createChat(title, model);
    setConversations((prev) => [newConv, ...prev]);
    return newConv;
  };

  const renameConversation = async (id: string, title: string) => {
    const updated = await api.updateChat(id, title);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );
  };

  const deleteConversation = async (id: string) => {
    await api.deleteChat(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    loadConversations,
    createConversation,
    renameConversation,
    deleteConversation,
  };
}
