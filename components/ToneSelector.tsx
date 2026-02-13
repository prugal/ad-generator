import React from 'react';
import { Tone } from '../types';
import { Zap, Coffee, FileText, Scale, MessageCircle } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: Tone;
  onChange: (tone: Tone) => void;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onChange }) => {
  const tones: { id: Tone; label: string; icon: any }[] = [
    { id: 'aggressive', label: 'Продающий', icon: Zap },
    { id: 'polite', label: 'Вежливый', icon: Coffee },
    { id: 'brief', label: 'Краткий', icon: FileText },
    { id: 'restrained', label: 'Сдержанный', icon: Scale },
    { id: 'natural', label: 'Человечный', icon: MessageCircle },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">Желаемый тон</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {tones.map((t, index) => {
          const Icon = t.icon;
          const isSelected = selectedTone === t.id;
          // Span 2 columns on mobile for the last item (5th item, index 4) to fill the row
          const spanClass = index === 4 ? 'col-span-2 sm:col-span-1' : '';

          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`
                flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border transition-all duration-200 h-full
                ${spanClass}
                ${isSelected 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-[1.02] dark:bg-primary-600 dark:border-primary-500' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="text-xs font-medium text-center leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};