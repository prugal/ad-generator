"use client";

import { useState } from 'react';
import { useAuthStore } from '../services/authStore';
import { FcGoogle } from 'react-icons/fc';
import { isOAuthProviderEnabled, type OAuthProvider } from '@/services/authService';

interface AuthButtonProps {
  className?: string;
  onLoginSuccess?: () => void;
  provider?: OAuthProvider;
  label?: string;
}

export default function AuthButton({ className = '', onLoginSuccess, provider = 'google', label }: AuthButtonProps) {
  const { user, isLoading, signInWithOAuth, error, clearError } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const isProviderEnabled = isOAuthProviderEnabled(provider);

  const handleOAuthSignIn = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    clearError();

    // Save current path for redirect after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_redirect_path', window.location.pathname);
    }

    try {
      await signInWithOAuth(provider);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('OAuth sign-in error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (user) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleOAuthSignIn}
        disabled={isProcessing || isLoading || !isProviderEnabled || provider === 'yandex'}
        title={provider === 'yandex' ? 'Яндекс OAuth скоро будет доступен' : (!isProviderEnabled ? 'Провайдер пока не настроен' : undefined)}
        className={`
          inline-flex items-center justify-center
          px-4 py-2 text-sm font-medium
          text-gray-700 dark:text-gray-300
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-lg transition-colors duration-200
          ${className}
        `}
      >
        {isProcessing || isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white mr-2" />
        ) : provider === 'google' ? (
          <FcGoogle className="w-4 h-4 mr-2" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.88,2h-4c-4,0-8.07,3-8.07,9.62a8.33,8.33,0,0,0,4.14,7.66L9,28.13A1.25,1.25,0,0,0,9,29.4a1.21,1.21,0,0,0,1,.6h2.49a1.24,1.24,0,0,0,1.2-.75l4.59-9h.34v8.62A1.14,1.14,0,0,0,19.82,30H22a1.12,1.12,0,0,0,1.16-1.06V3.22A1.19,1.19,0,0,0,22,2ZM18.7,16.28h-.59c-2.3,0-3.66-1.87-3.66-5,0-3.9,1.73-5.29,3.34-5.29h.94Z" fill="#d61e3b" />
          </svg>
        )}
        {label ?? (provider === 'google' ? 'Войти через Google' : 'Войти через Яндекс (скоро)')}
      </button>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
