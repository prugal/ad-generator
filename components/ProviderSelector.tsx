'use client';

import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import type { LlmProvider } from '../types';

interface ProviderSelectorProps {
  selectedProvider: LlmProvider;
  onChange: (provider: LlmProvider) => void;
}

export function ProviderSelector({ selectedProvider, onChange }: ProviderSelectorProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        AI Провайдер:
      </label>
      <div className="relative flex-1 max-w-xs">
        <select
          value={selectedProvider}
          onChange={(e) => onChange(e.target.value as LlmProvider)}
          className="w-full appearance-none px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all pr-10"
        >
          <option value="gemini">Gemini (Бесплатно)</option>
          <option value="polza">Polza.ai (Платно)</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
          {selectedProvider === 'gemini' ? (
            <Sparkles className="w-4 h-4 text-gray-400" />
          ) : (
            <Zap className="w-4 h-4 text-amber-500" />
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {selectedProvider === 'gemini' 
          ? '🆓 Бесплатный тариф' 
          : '💰 Платный API'}
      </div>
    </div>
  );
}
