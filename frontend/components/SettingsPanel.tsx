'use client';

import { useSettings } from '@/hooks/useSettings';
import { useState } from 'react';

export function SettingsPanel() {
  const { settings, updateSetting, resetToDefaults } = useSettings();
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    setSaveMessage('Settings saved!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">AI Settings</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            type="text"
            value={settings.model}
            onChange={(e) => updateSetting('model', e.target.value)}
            className="w-full max-w-md bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Temperature: {settings.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
            className="w-full max-w-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Tokens</label>
          <input
            type="number"
            value={settings.maxTokens}
            onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
            className="w-32 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">System Prompt</label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => updateSetting('systemPrompt', e.target.value)}
            rows={4}
            className="w-full max-w-2xl bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 resize-y"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-xl font-semibold">UI Settings</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value as any)}
            className="w-48 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoScroll"
            checked={settings.autoScroll}
            onChange={(e) => updateSetting('autoScroll', e.target.checked)}
            className="rounded border-border text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="autoScroll" className="text-sm">Auto-scroll to bottom</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="compactMode"
            checked={settings.compactMode}
            onChange={(e) => updateSetting('compactMode', e.target.checked)}
            className="rounded border-border text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="compactMode" className="text-sm">Compact mode</label>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex items-center gap-4">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          Save Settings
        </button>
        {saveMessage && <span className="text-sm text-green-500">{saveMessage}</span>}
      </div>
    </div>
  );
}
