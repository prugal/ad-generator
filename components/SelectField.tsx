import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, error = false }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 ml-1 flex justify-between dark:text-gray-300">
        {label}
        {error && <span className="text-red-500 text-xs font-normal dark:text-red-400">Обязательное поле</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full appearance-none px-4 py-2.5 rounded-lg border transition-all outline-none cursor-pointer
            ${error 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:bg-red-900/10 dark:border-red-800' 
              : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-750'
            }
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 dark:text-gray-400">
          <svg suppressHydrationWarning className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path suppressHydrationWarning d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};