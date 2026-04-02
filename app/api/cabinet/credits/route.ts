import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createServerClient(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Cookie: cookieHeader } },
  });
}

export async function GET(request: Request) {
  try {
    const supabase = createServerClient(request);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('balance, updated_at')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching credits:', error);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }

    return NextResponse.json({ credits: credits || { balance: 0 } });
  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
