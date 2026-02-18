import { authService } from './authService';
import { supabase } from './supabase';

// Using supabase.rpc() directly from the client ensures the user's
// authenticated session (auth.uid()) is available for RLS policies.
// The previous approach via /api/credits used a server-side client
// without a user session, causing RLS to block all queries.

export const creditService = {
  async getCredits() {
    const user = await authService.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase.rpc('get_user_credits_with_history', {
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(`Failed to fetch credits: ${error.message}`);
    }

    return data;
  },

  async spendCredits(amount: number, description: string, reference_id?: string) {
    // amount supports decimals (e.g. 0.5 for regeneration)
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('update_user_credits', {
      p_user_id: user.id,
      p_amount: -amount,
      p_type: 'usage',
      p_description: description,
      p_reference_id: reference_id || null,
    });

    if (error) {
      throw new Error(`Failed to spend credits: ${error.message}`);
    }

    if (data && !data.success) {
      throw new Error(data.error || 'Failed to spend credits');
    }

    return data;
  },
};