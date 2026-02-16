import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (for server-side operations only)
// Requires SERVICE_ROLE_KEY to bypass RLS if needed, or just standard key if RLS allows
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for server security service');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

export interface RateLimitResult {
  success: boolean;
  message?: string;
  status?: number;
}

export interface SecurityContext {
  ip: string;
  referer: string | null;
  path: string;
}

const ALLOWED_DOMAINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'https://localhost:3000',
  'https://ai-ad-generator.vercel.app', // Example Vercel domain
].filter(Boolean) as string[];

/**
 * Validates the Referer header to prevent CSRF/unauthorized usage
 */
export function validateReferer(referer: string | null): boolean {
  if (!referer) return false; // Strict mode: referer required
  
  try {
    const refererUrl = new URL(referer);
    return ALLOWED_DOMAINS.some(domain => {
      const allowedUrl = new URL(domain);
      return refererUrl.hostname === allowedUrl.hostname;
    });
  } catch (e) {
    return false;
  }
}

/**
 * Checks rate limit for a given IP
 * Default: 10 requests per 10 minutes (600 seconds)
 */
export async function checkRateLimit(ip: string, limit = 10, windowSeconds = 600): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_ip_address: ip,
      p_limit: limit,
      p_window_seconds: windowSeconds
    });

    if (error) {
      console.error('Rate limit RPC error:', error);
      // Fail open if DB is down? Or fail closed? 
      // Let's fail open to not block users if monitoring is broken, but log it.
      return { success: true }; 
    }

    if (data === false) {
      return {
        success: false,
        status: 429,
        message: 'Too Many Requests. Please try again later.'
      };
    }

    return { success: true };
  } catch (e) {
    console.error('Rate limit exception:', e);
    return { success: true };
  }
}

/**
 * Logs errors to Supabase
 */
export async function logError(
  context: SecurityContext, 
  errorType: string, 
  error: any, 
  params?: any
) {
  try {
    await supabaseAdmin.from('error_logs').insert({
      error_type: errorType,
      message: error.message || String(error),
      stack_trace: error.stack,
      user_ip: context.ip,
      request_path: context.path,
      request_params: params,
    });
  } catch (e) {
    console.error('Failed to log error to Supabase:', e);
  }
}
