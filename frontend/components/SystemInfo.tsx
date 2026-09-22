'use client';

import { useEffect, useState } from 'react';
import { SystemInfo as SysInfoType } from '@/types';
import { api } from '@/lib/api';
import { formatBytes } from '@/lib/utils';
import { Cpu, HardDrive, LayoutDashboard, Monitor, Network } from 'lucide-react';

export function SystemInfo() {
  const [info, setInfo] = useState<SysInfoType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getSystemInfo().then(data => {
      if (mounted) {
        setInfo(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse">Loading system info...</div>;
  if (!info) return <div className="text-sm text-red-500">Failed to load system information.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-muted p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-primary-500 mb-3">
          <Monitor size={18} />
          <h3 className="font-semibold text-foreground">System</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Hostname:</span> <span>{info.hostname}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">OS:</span> <span>{info.os}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Version:</span> <span>{info.version}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Architecture:</span> <span>{info.architecture}</span></div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-primary-500 mb-3">
          <Cpu size={18} />
          <h3 className="font-semibold text-foreground">Hardware</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">CPU:</span> <span>{info.cpu_model}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cores:</span> <span>{info.cpu_cores}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">RAM (Total):</span> <span>{info.ram_total_gb.toFixed(1)} GB</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">RAM (Avail):</span> <span>{info.ram_available_gb.toFixed(1)} GB</span></div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-primary-500 mb-3">
          <HardDrive size={18} />
          <h3 className="font-semibold text-foreground">Storage</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Total:</span> <span>{info.storage.total_gb.toFixed(1)} GB</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Used:</span> <span>{info.storage.used_gb.toFixed(1)} GB</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Free:</span> <span>{info.storage.free_gb.toFixed(1)} GB</span></div>
          <div className="w-full bg-background rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${info.storage.warning ? 'bg-red-500' : 'bg-primary-500'}`} 
              style={{ width: `${info.storage.usage_percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-primary-500 mb-3">
          <Network size={18} />
          <h3 className="font-semibold text-foreground">Network</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">LAN IP:</span> <span>{info.lan_ip}</span></div>
        </div>
      </div>
    </div>
  );
}
