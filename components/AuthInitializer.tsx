"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../services/authStore';

export default function AuthInitializer() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null;
}