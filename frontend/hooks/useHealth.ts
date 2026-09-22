import { useState, useEffect } from 'react';
import { HealthStatus } from '@/types';
import { api } from '@/lib/api';

export function useHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchHealth = async () => {
      try {
        const res = await api.getHealth();
        if (mounted) setHealth(res);
      } catch (e) {
        if (mounted) setHealth(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { health, loading };
}
