"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../services/authStore';

export default function AuthCallback() {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash parameters from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          setStatus('error');
          setError(errorDescription || error || 'Authentication failed');
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session manually
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          // Initialize auth state
          await initializeAuth();
          setStatus('success');
          
          // Redirect to home after a short delay
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          // Check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            await initializeAuth();
            setStatus('success');
            setTimeout(() => {
              router.push('/');
            }, 1500);
          } else {
            setStatus('error');
            setError('No authentication tokens found');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [router, initializeAuth]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Обработка входа...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Подождите, идет проверка вашей учетной записи
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Успешный вход!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Перенаправление на главную страницу...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ошибка входа
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error || 'Произошла ошибка при входе в систему'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}