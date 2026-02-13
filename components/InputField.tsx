import React from 'react';

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'textarea';
  rows?: number;
  error?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  rows = 3,
  error = false
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 ml-1 flex justify-between dark:text-gray-300">
        {label}
        {error && <span className="text-red-500 text-xs font-normal dark:text-red-400">Обязательное поле</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`
            w-full px-4 py-2.5 rounded-lg border transition-all outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900
            ${error 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:bg-red-900/10 dark:border-red-800' 
              : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 dark:focus:border-primary-500'
            }
          `}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-lg border transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900
            ${error 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:bg-red-900/10 dark:border-red-800' 
              : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 dark:focus:border-primary-500'
            }
          `}
        />
      )}
    </div>
  );
};