"use client";

import { useState } from 'react';
import { useAuthStore } from '../services/authStore';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';

interface AuthButtonProps {
  variant?: 'login' | 'logout';
  className?: string;
}

export default function AuthButton({ variant = 'login', className = '' }: AuthButtonProps) {
  const { user, isLoading, signInWithGoogle, signOut, error, clearError } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    clearError();
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    clearError();
    
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (variant === 'logout' && user) {
    return (
      <button
        onClick={handleSignOut}
        disabled={isProcessing || isLoading}
        className={`
          inline-flex items-center justify-center
          px-4 py-2 text-sm font-medium
          text-white bg-red-600 hover:bg-red-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-lg transition-colors duration-200
          ${className}
        `}
      >
        {isProcessing || isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
        ) : null}
        Выйти
      </button>
    );
  }

  if (user) {
    return (
      <div className={`inline-flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          {user.user_metadata?.avatar_url && (
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.full_name || user.email || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isProcessing || isLoading}
          className="
            inline-flex items-center justify-center
            px-3 py-1 text-xs font-medium
            text-gray-700 dark:text-gray-300
            bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-md transition-colors duration-200
          "
        >
          Выйти
        </button>
      </div>
    );
  }

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