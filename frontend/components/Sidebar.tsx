'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Settings, MessageSquare, Trash2, Edit2, Check, X, Menu, Search } from 'lucide-react';
import { Conversation } from '@/types';
import { cn, groupConversationsByDate } from '@/lib/utils';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = groupConversationsByDate(filtered);

  const startEdit = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEdit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-muted border-r border-border transition-transform duration-300 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-500">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center font-bold">
              π
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-foreground">PiLLM</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Local AI</p>
            </div>
          </div>
          <button className="md:hidden text-muted-foreground" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {Object.entries(grouped).map(([group, convs]) => (
            convs.length > 0 && (
              <div key={group} className="mb-4">
                <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                  {group}
                </div>
                {convs.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      'group relative flex items-center gap-2 px-3 py-2.5 my-0.5 rounded-lg cursor-pointer transition-colors',
                      activeId === c.id
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-foreground hover:bg-background'
                    )}
                  >
                    <MessageSquare size={16} className="shrink-0" />
                    {editingId === c.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(e);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-background text-sm border border-border px-1 rounded outline-none"
                        />
                        <button onClick={saveEdit} className="text-green-500 hover:bg-background rounded p-1">
                          <Check size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-muted-foreground hover:bg-background rounded p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 truncate text-sm">{c.title}</span>
                        <div className="hidden group-hover:flex items-center gap-1 absolute right-2 bg-gradient-to-l from-muted via-muted to-transparent pl-4">
                          <button
                            onClick={(e) => startEdit(c, e)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete chat?')) onDelete(c.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-red-500 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg transition-colors"
          >
            <Settings size={18} /> Settings
          </Link>
        </div>
      </div>
    </>
  );
}
