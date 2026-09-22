'use client';

import { useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { StatusBar } from './StatusBar';
import { useChat } from '@/hooks/useChat';
import { useSettings } from '@/hooks/useSettings';
import { Message } from '@/types';

interface ChatAreaProps {
  conversationId: string | null;
  onMenuClick: () => void;
}

export function ChatArea({ conversationId, onMenuClick }: ChatAreaProps) {
  const { settings } = useSettings();
  const {
    messages,
    isStreaming,
    error,
    streamingContent,
    loadMessages,
    sendMessage,
    stopGeneration,
    regenerate,
    editAndResend,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  useEffect(() => {
    if (settings.autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, settings.autoScroll]);

  const handleSend = (content: string) => {
    if (conversationId) {
      sendMessage(conversationId, content, settings);
    }
  };

  const handleEdit = (index: number, newContent: string) => {
    if (conversationId) {
      editAndResend(conversationId, index, newContent, settings);
    }
  };

  const handleRegenerate = (index: number) => {
    if (conversationId) {
      regenerate(conversationId, index, settings);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background relative">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg">
            <Menu size={20} />
          </button>
          <span className="font-medium text-foreground">
            {settings.model}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto w-full scroll-smooth">
        <div className="max-w-3xl mx-auto w-full pb-32 pt-8">
          {!conversationId || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-20">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 shadow-sm">
                <span className="text-primary-500 font-bold text-4xl leading-none">π</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground mb-8">Your AI. Your Raspberry Pi. Your Data.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  'Write a Python script to monitor CPU temp',
                  'Explain quantum computing simply',
                  'Help me plan a healthy meal for the week',
                  'Translate hello to 10 different languages',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="p-4 text-left rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <p className="text-sm font-medium text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onEdit={(content) => handleEdit(idx, content)}
                  onRegenerate={() => handleRegenerate(idx)}
                  compactMode={settings.compactMode}
                />
              ))}
              
              {isStreaming && streamingContent && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: streamingContent,
                    created_at: new Date().toISOString(),
                  }}
                  isStreaming={true}
                  compactMode={settings.compactMode}
                />
              )}
              
              {error && (
                <div className="mx-4 md:mx-0 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4">
        <div className="px-4 w-full">
          {conversationId ? (
            <ChatInput
              onSend={handleSend}
              onStop={() => stopGeneration(conversationId)}
              isStreaming={isStreaming}
            />
          ) : (
            <div className="max-w-3xl mx-auto text-center text-sm text-muted-foreground">
              Select or create a chat to start messaging
            </div>
          )}
          <div className="max-w-3xl mx-auto text-center mt-3">
            <span className="text-[10px] text-muted-foreground">
              PiLLM can make mistakes. Consider verifying important information.
            </span>
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
