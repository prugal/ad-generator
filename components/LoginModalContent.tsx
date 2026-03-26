
'use client';

import React, { useState } from 'react';
import AuthButton from './AuthButton';
import { Mail } from 'lucide-react';
import { useAuthStore } from '@/services/authStore';

interface LoginModalContentProps {
  onClose?: () => void;
}

export default function LoginModalContent({ onClose }: LoginModalContentProps) {
  const [email, setEmail] = useState('');
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const { sendMagicLink, isLoading, error, clearError } = useAuthStore();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    clearError();

    if (!email.trim()) {
      setLocalMessage('Введите email.');
      return;
    }

    await sendMagicLink(email.trim());
    if (!useAuthStore.getState().error) {
      setLocalMessage('Проверьте почту: мы отправили ссылку для входа.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Вход в аккаунт</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Войдите через Google/Яндекс или получите ссылку на email.
        </p>
      </div>

      <div className="w-full space-y-4">
        <AuthButton className="w-full" onLoginSuccess={onClose} provider="google" />
        <AuthButton className="w-full" onLoginSuccess={onClose} provider="yandex" />

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          <span className="px-3 text-xs text-gray-500 dark:text-gray-400">или</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <label className="block text-xs text-gray-600 dark:text-gray-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              autoComplete="email"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Обработка...
              </span>
            ) : (
              <span className="inline-flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Отправить ссылку на email
              </span>
            )}
          </button>
        </form>

        {(error || localMessage) && (
          <div className={`text-xs text-center ${error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {error || localMessage}
          </div>
        )}
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
