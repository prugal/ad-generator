import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { authService, type OAuthProvider } from './authService';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth actions
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithYandex: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
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
      isInitialized: false,
      error: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      signInWithOAuth: async (provider) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signInWithOAuth(provider);

          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return;
          }

          // The OAuth flow will redirect, so we don't need to set user/session here
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to sign in with OAuth provider',
            isLoading: false
          });
        }
      },

      signInWithGoogle: async () => {
        await useAuthStore.getState().signInWithOAuth('google');
      },

      signInWithYandex: async () => {
        await useAuthStore.getState().signInWithOAuth('yandex');
      },

      sendMagicLink: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.sendMagicLink(email);
          if (result.error) {
            set({ error: result.error.message, isLoading: false });
            return;
          }

          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send magic link',
            isLoading: false,
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

          set({ user: null, session: null, isLoading: false, isInitialized: true });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to sign out',
            isLoading: false
          });
        }
      },

      initializeAuth: async () => {
        // If already initialized, don't do it again
        if (useAuthStore.getState().isInitialized) return;

        set({ isLoading: true });
        try {
          const [user, session] = await Promise.all([
            authService.getCurrentUser(),
            authService.getCurrentSession()
          ]);

          set({
            user,
            session,
            isLoading: false,
            isInitialized: true
          });
        } catch (error) {
          const isInvalidRefreshToken =
            error instanceof Error && error.message.includes('Invalid Refresh Token');

          if (isInvalidRefreshToken && typeof window !== 'undefined') {
            try {
              localStorage.removeItem('auth-storage');
            } catch (storageError) {
              console.error('Failed to clear auth storage:', storageError);
            }
          }

          set({
            user: null,
            session: null,
            error: isInvalidRefreshToken
              ? 'Сессия истекла. Войдите снова.'
              : error instanceof Error
                ? error.message
                : 'Failed to initialize auth',
            isLoading: false,
            isInitialized: true
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
        useAuthStore.setState({ isInitialized: true });
        break;
      case 'SIGNED_OUT':
        setUser(null);
        setSession(null);
        useAuthStore.setState({ isInitialized: true });
        break;
      case 'USER_UPDATED':
        setUser(session?.user ?? null);
        useAuthStore.setState({ isInitialized: true });
        break;
    }
  });
}
