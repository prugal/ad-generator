"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/services/authStore';
import { authService } from '@/services/authService';
import { creditService } from '@/services/creditService';
import { useCreditStore } from '@/services/creditStore';

export default function AuthInitializer() {
  const { setUser, setSession } = useAuthStore();
  const { setBalance } = useCreditStore();

  useEffect(() => {
    const handleAuthChange = async (user: any, session: any) => {
      setUser(user);
      setSession(session);

      if (user) {
        const credits = await creditService.getCredits();
        if (credits && credits.credits) {
          setBalance(credits.credits.balance);
        }
      }
    };

    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      const session = await authService.getCurrentSession();
      handleAuthChange(user, session);
    };

    checkUser();

    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      handleAuthChange(user, session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser, setSession, setBalance]);

  return null;
}