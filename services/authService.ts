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
      const rawEnvSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
      const browserOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

      let siteUrl = browserOrigin;

      if (rawEnvSiteUrl) {
        try {
          const envUrl = new URL(rawEnvSiteUrl);
          const isEnvLocalhost = envUrl.hostname === 'localhost' || envUrl.hostname === '127.0.0.1';
          const isBrowserLocalhost = typeof window !== 'undefined'
            ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            : true;

          siteUrl = isEnvLocalhost && !isBrowserLocalhost
            ? browserOrigin
            : envUrl.origin;
        } catch {
          siteUrl = browserOrigin;
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
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
