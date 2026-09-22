import { useState, useEffect } from 'react';
import { ChatSettings } from '@/types';

const defaultSettings: ChatSettings = {
  model: 'gemma4:e2b',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are PiLLM, a helpful AI assistant.',
  theme: 'dark',
  autoScroll: true,
  compactMode: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pillm-settings');
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setLoaded(true);
  }, []);

  const updateSetting = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('pillm-settings', JSON.stringify(newSettings));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem('pillm-settings', JSON.stringify(defaultSettings));
  };

  return { settings, updateSetting, resetToDefaults, loaded };
}
