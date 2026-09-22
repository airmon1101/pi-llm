'use client';

import { useState } from 'react';
import { Copy, Edit2, RotateCw, Check } from 'lucide-react';
import { Message } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onEdit?: (content: string) => void;
  onRegenerate?: () => void;
  compactMode?: boolean;
}

export function MessageBubble({
  message,
  isStreaming,
  onEdit,
  onRegenerate,
  compactMode,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={cn('group flex gap-4 py-6 px-4 md:px-0', compactMode ? 'py-4' : 'py-6')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white font-bold text-lg leading-none">π</span>
        </div>
      )}
      {isUser && <div className="w-8 shrink-0 md:hidden" />}

      <div className={cn('flex-1 space-y-2 overflow-hidden', isUser ? 'flex flex-col items-end' : '')}>
        <div className={cn(
          'max-w-3xl w-full',
          isUser ? 'bg-muted/50 rounded-2xl px-5 py-3.5 inline-block w-auto' : ''
        )}>
          {isEditing ? (
            <div className="w-full space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary-500 resize-y min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-sm hover:bg-muted rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save & Submit
                </button>
              </div>
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {isStreaming && !isUser && (
            <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse ml-1 align-middle" />
          )}
        </div>

        {!isEditing && (
          <div className={cn(
            'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'justify-end pr-2' : 'pl-0'
          )}>
            <button
              onClick={handleCopy}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            {isUser && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Edit message"
              >
                <Edit2 size={14} />
              </button>
            )}
            {!isUser && onRegenerate && !isStreaming && (
              <button
                onClick={onRegenerate}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Regenerate response"
              >
                <RotateCw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
