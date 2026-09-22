'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      className="prose prose-slate dark:prose-invert max-w-none break-words
                 prose-p:leading-relaxed prose-pre:p-0
                 prose-a:text-primary-600 dark:prose-a:text-primary-400
                 prose-headings:font-semibold"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre({ node, children, ...props }) {
          return <CodeBlock>{children}</CodeBlock>;
        },
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !className?.includes('hljs');
          if (isInline) {
            return (
              <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>
                {children}
              </code>
            );
          }
          return <code className={cn(className, "text-sm font-mono block overflow-x-auto p-4")} {...props}>{children}</code>;
        },
        table({ children }) {
          return <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-border">{children}</table></div>;
        },
        th({ children }) {
          return <th className="px-3 py-2 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</th>;
        },
        td({ children }) {
          return <td className="px-3 py-2 whitespace-nowrap text-sm border-b border-border">{children}</td>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  
  // Extract text content for copying
  let textContent = '';
  if (children && typeof children === 'object' && 'props' in (children as any)) {
    textContent = (children as any).props.children || '';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-[#0d1117] my-4 border border-border/50">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs text-gray-400 font-mono">code</span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="m-0 bg-transparent">
        {children}
      </pre>
    </div>
  );
}
