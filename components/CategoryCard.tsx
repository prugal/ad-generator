import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ label, icon: Icon, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 w-full aspect-square sm:aspect-auto sm:h-32
        focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30
        active:scale-95
        ${isSelected 
          ? 'border-primary-600 bg-primary-50/50 text-primary-700 shadow-xl shadow-primary-500/10 ring-2 ring-primary-600 ring-offset-2 scale-105 -translate-y-1 z-10 dark:bg-primary-900/20 dark:border-primary-400 dark:text-primary-300 dark:ring-primary-400 dark:ring-offset-gray-800 dark:shadow-primary-900/20' 
          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] z-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-750 dark:hover:border-gray-600'
        }
      `}
    >
      <Icon 
        className={`w-8 h-8 mb-2 transition-transform duration-300 ${
          isSelected ? 'text-primary-600 dark:text-primary-400 scale-110 drop-shadow-sm' : 'text-gray-400 dark:text-gray-500'
        }`} 
      />
      <span className="text-sm font-medium">{label}</span>
      {isSelected && (
        <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 dark:bg-primary-500"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500 dark:bg-primary-400"></span>
        </span>
      )}
    </button>
  );
};