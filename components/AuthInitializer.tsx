'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/services/authStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return <>{children}</>;
}