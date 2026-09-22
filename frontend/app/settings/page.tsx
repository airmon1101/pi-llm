'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SystemInfo } from '@/components/SystemInfo';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 border-b border-border flex items-center px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Chat</span>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your local AI environment and UI preferences.</p>
          </div>

          <SettingsPanel />

          <div className="pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-6">System Information</h2>
            <SystemInfo />
          </div>
        </div>
      </main>
    </div>
  );
}
