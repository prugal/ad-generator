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

export type OAuthProvider = 'google' | 'yandex';

export function isOAuthProviderEnabled(provider: OAuthProvider): boolean {
  void provider;
  return true;
}

function buildSiteUrl(): string {
  const rawEnvSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  if (!rawEnvSiteUrl) {
    return browserOrigin;
  }

  try {
    const envUrl = new URL(rawEnvSiteUrl);
    const isEnvLocalhost = envUrl.hostname === 'localhost' || envUrl.hostname === '127.0.0.1';
    const isBrowserLocalhost =
      typeof window !== 'undefined'
        ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        : true;

    return isEnvLocalhost && !isBrowserLocalhost ? browserOrigin : envUrl.origin;
  } catch {
    return browserOrigin;
  }
}

export const authService = {
  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResponse> {
    try {
      if (!isOAuthProviderEnabled(provider)) {
        return {
          user: null,
          session: null,
          error: {
            message: 'OAuth-провайдер временно отключен в конфигурации приложения.',
            code: 'oauth_provider_disabled',
          },
        };
      }

      const siteUrl = buildSiteUrl();
      const supabaseProvider = provider === 'yandex' ? 'custom:yandex' : provider;

      const oauthOptions: Record<string, unknown> = {
        redirectTo: `${siteUrl}/auth/callback`,
      };

      const { error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider as never,
        options: oauthOptions,
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
          message: error instanceof Error ? error.message : 'OAuth authentication failed',
        },
      };
    }
  },

  async sendMagicLink(email: string): Promise<{ error: AuthError | null }> {
    try {
      const siteUrl = buildSiteUrl();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          shouldCreateUser: true,
        },
      });

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
          message: error instanceof Error ? error.message : 'Magic link failed',
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
