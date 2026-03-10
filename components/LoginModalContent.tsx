
'use client';

import React from 'react';
import AuthButton from './AuthButton';
import { Mail } from 'lucide-react';

interface LoginModalContentProps {
  onClose?: () => void;
}

export default function LoginModalContent({ onClose }: LoginModalContentProps) {
  // In a real application, you would pass the onLoginSuccess to the AuthButton 
  // and call it after a successful login.

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Вход в аккаунт</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Выберите удобный способ для входа.
        </p>
      </div>

      <div className="w-full space-y-4">
        <AuthButton className="w-full" onLoginSuccess={onClose} />
        
        <button
          disabled
          className="
            w-full inline-flex items-center justify-center
            px-4 py-2 text-sm font-medium
            text-gray-700 dark:text-gray-300
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-lg transition-colors duration-200
          "
        >
          <Mail className="w-4 h-4 mr-2" />
          Войти по E-mail (скоро)
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-xs">
        Нажимая кнопку, вы даете согласие на обработку персональных данных и соглашаетесь с нашей{' '}
        <a href="/offer" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
          политикой конфиденциальности
        </a>
        .
      </p>
    </div>
  );
}
