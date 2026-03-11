"use client";

import { useState } from 'react';
import { useAuthStore } from '../services/authStore';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';

interface AuthButtonProps {
  className?: string;
  onLoginSuccess?: () => void;
}

export default function AuthButton({ className = '', onLoginSuccess }: AuthButtonProps) {
  const { user, isLoading, signInWithGoogle, error, clearError } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    clearError();

    // Save current path for redirect after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_redirect_path', window.location.pathname);
    }

    try {
      await signInWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (user) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleGoogleSignIn}
        disabled={isProcessing || isLoading}
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
        ) : (
          <FcGoogle className="w-4 h-4 mr-2" />
        )}
        Войти через Google
      </button>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}