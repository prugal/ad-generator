import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Missing Supabase environment variables. Using placeholder client. API calls will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        cookieOptions: {
            name: 'sb-auth-token', // Follow Supabase convention
            sameSite: 'none',
            secure: true,
        },
    },
});
