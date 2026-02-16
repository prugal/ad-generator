import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export const authService = {
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: {
            message: error.message,
            code: error.name,
          },
        };
      }

      return {
        user: null,
        session: null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: {
          message: error instanceof Error ? error.message : 'Authentication failed',
        },
      };
    }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          error: {
            message: error.message,
            code: error.name,
          },
        };
      }

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Sign out failed',
        },
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};