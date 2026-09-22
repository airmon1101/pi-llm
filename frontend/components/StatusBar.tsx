'use client';

import { useHealth } from '@/hooks/useHealth';
import { Server, Cpu, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBar() {
  const { health } = useHealth();

  const isOnline = health?.status === 'ok';

  return (
    <div className="h-8 border-t border-border bg-muted flex items-center px-4 text-xs text-muted-foreground justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isOnline ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          <span>{isOnline ? 'System Online' : 'Offline'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <Server size={12} />
          <span>PiLLM Core {health?.version || 'v1.0'}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5">
          <Wifi size={12} />
          <span>LAN Only</span>
        </div>
      </div>
    </div>
  );
}
