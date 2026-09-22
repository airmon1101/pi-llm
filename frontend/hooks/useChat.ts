import { useState, useCallback, useRef } from 'react';
import { Message, ChatSettings } from '@/types';
import { api } from '@/lib/api';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await api.getMessages(conversationId);
      setMessages(res.messages || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    }
  }, []);

  const sendMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      settings: ChatSettings
    ) => {
      try {
        setIsStreaming(true);
        setError(null);
        setStreamingContent('');

        // Optimistic UI update for user message
        const userMsg: Message = {
          id: Date.now().toString(),
          conversation_id: conversationId,
          role: 'user',
          content,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        abortControllerRef.current = new AbortController();

        const res = await api.sendMessage(
          {
            conversation_id: conversationId,
            message: content,
            model: settings.model,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            system_prompt: settings.systemPrompt,
          },
          abortControllerRef.current.signal
        );

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantContent = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'token' && data.content) {
                    assistantContent += data.content;
                    setStreamingContent(assistantContent);
                  } else if (data.type === 'error') {
                    throw new Error(data.error);
                  }
                } catch (e) {
                  // Ignore parse errors on incomplete chunks
                }
              }
            }
          }
        }

        // Finalize message
        const finalMsg: Message = {
          id: Date.now().toString(),
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, finalMsg]);
        setStreamingContent('');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to send message');
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const stopGeneration = useCallback(async (conversationId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    try {
      await api.stopGeneration(conversationId);
    } catch (e) {
      console.error('Failed to stop generation on server', e);
    }
    setIsStreaming(false);
  }, []);

  const regenerate = useCallback(
    async (conversationId: string, messageIndex: number, settings: ChatSettings) => {
      // Find the last user message before this index
      let userContent = '';
      const newMessages = [...messages];
      
      for (let i = messageIndex; i >= 0; i--) {
        if (newMessages[i].role === 'user') {
          userContent = newMessages[i].content;
          break;
        }
      }
      
      if (!userContent) return;

      // Remove the assistant message and everything after
      const truncatedMessages = newMessages.slice(0, messageIndex);
      setMessages(truncatedMessages);
      
      // Resend the last user message content implicitly via new request 
      // (The backend needs context, but according to API it's stateless per /api/chat so we just resend the user message for now. Ideally backend handles history based on conversation_id)
      await sendMessage(conversationId, userContent, settings);
      
      // Since sendMessage optimistically adds user msg again, we should slice it out if we just want to regenerate. 
      // Wait, if backend uses conversation_id, it might have it in DB. Let's just resend.
    },
    [messages, sendMessage]
  );

  const editAndResend = useCallback(
    async (
      conversationId: string,
      messageIndex: number,
      newContent: string,
      settings: ChatSettings
    ) => {
      const truncated = messages.slice(0, messageIndex);
      setMessages(truncated);
      await sendMessage(conversationId, newContent, settings);
    },
    [messages, sendMessage]
  );

  const clearError = () => setError(null);

  return {
    messages,
    isStreaming,
    error,
    streamingContent,
    loadMessages,
    sendMessage,
    stopGeneration,
    regenerate,
    editAndResend,
    clearError,
  };
}
