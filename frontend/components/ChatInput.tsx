'use client';

import { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) return;
    const val = textareaRef.current?.value.trim();
    if (val && onSend) {
      onSend(val);
      if (textareaRef.current) {
        textareaRef.current.value = '';
        adjustHeight();
      }
    }
  };

  useEffect(() => {
    adjustHeight();
  }, []);

  return (
    <div className="relative flex items-end w-full max-w-3xl mx-auto bg-background/50 backdrop-blur border border-border rounded-2xl shadow-sm p-2 transition-all focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500">
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="Message PiLLM..."
        disabled={disabled || isStreaming}
        onKeyDown={handleKeyDown}
        onChange={adjustHeight}
        className="w-full max-h-[200px] bg-transparent resize-none overflow-y-auto px-3 py-2 outline-none text-foreground disabled:opacity-50"
      />
      
      <div className="flex-shrink-0 mb-1 ml-2">
        {isStreaming ? (
          <button
            onClick={onStop}
            className="p-2 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
            title="Stop generation"
          >
            <Square size={18} className="fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
            title="Send message"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
