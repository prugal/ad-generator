import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from './authService';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signInWithGoogle();
          
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return;
          }
          
          // The OAuth flow will redirect, so we don't need to set user/session here
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to sign in with Google',
            isLoading: false 
          });
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.signOut();
          
          if (result.error) {
            set({ error: result.error.message, isLoading: false });
            return;
          }
          
          set({ user: null, session: null, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to sign out',
            isLoading: false 
          });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const [user, session] = await Promise.all([
            authService.getCurrentUser(),
            authService.getCurrentSession()
          ]);
          
          set({ 
            user, 
            session, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize auth',
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Subscribe to auth state changes
if (typeof window !== 'undefined') {
  authService.onAuthStateChange((event, session) => {
    const { setUser, setSession } = useAuthStore.getState();
    
    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
        setUser(session?.user ?? null);
        setSession(session);
        break;
      case 'SIGNED_OUT':
        setUser(null);
        setSession(null);
        break;
      case 'USER_UPDATED':
        setUser(session?.user ?? null);
        break;
    }
  });
}