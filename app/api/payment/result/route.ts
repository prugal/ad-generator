import { NextResponse } from 'next/server';
import { verifyResultSignature } from '@/services/robokassaService';
import { supabase } from '@/services/supabase';

/**
 * Robokassa ResultURL handler
 * Called by Robokassa server-to-server when payment is confirmed.
 * Must respond with "OK{InvId}" on success.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const outSum = formData.get('OutSum') as string;
        const invId = formData.get('InvId') as string;
        const signatureValue = formData.get('SignatureValue') as string;

        // Collect Shp_ params
        const shpParams: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
            if (key.toLowerCase().startsWith('shp_')) {
                shpParams[key] = value as string;
            }
        }

        console.log(`[Robokassa ResultURL] InvId=${invId}, OutSum=${outSum}, Shp_credits=${shpParams['Shp_credits']}, Shp_userId=${shpParams['Shp_userId']}`);

        // Verify signature
        if (!verifyResultSignature(outSum, invId, signatureValue, shpParams)) {
            console.error(`[Robokassa ResultURL] Invalid signature for InvId=${invId}`);
            return new Response('Invalid signature', { status: 400 });
        }

        const userId = shpParams['Shp_userId'];
        const credits = parseInt(shpParams['Shp_credits'] || '0', 10);

        if (!userId || !credits) {
            console.error(`[Robokassa ResultURL] Missing userId or credits for InvId=${invId}`);
            return new Response('Missing parameters', { status: 400 });
        }

        // Update payment intent status
        await supabase
            .from('payment_intents')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('inv_id', parseInt(invId, 10));

        // Add credits to user account
        const { data, error } = await supabase.rpc('update_user_credits', {
            p_user_id: userId,
            p_amount: credits,
            p_type: 'purchase',
            p_description: `Покупка ${credits} кредитов (InvId: ${invId})`,
            p_reference_id: `robokassa_${invId}`,
        });

        if (error) {
            console.error(`[Robokassa ResultURL] Failed to add credits for InvId=${invId}:`, error);
            // Don't return error to Robokassa — log and investigate manually
            // Still respond OK to prevent retries
        }

        console.log(`[Robokassa ResultURL] Success: +${credits} credits for user ${userId}, InvId=${invId}`);

        // Robokassa expects "OK{InvId}" response
        return new Response(`OK${invId}`, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (error) {
        console.error('[Robokassa ResultURL] Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Robokassa may also send GET requests
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const outSum = searchParams.get('OutSum') || '';
    const invId = searchParams.get('InvId') || '';
    const signatureValue = searchParams.get('SignatureValue') || '';

    const shpParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
        if (key.toLowerCase().startsWith('shp_')) {
            shpParams[key] = value;
        }
    }

    // Reuse POST logic by creating a FormData-like object
    if (!verifyResultSignature(outSum, invId, signatureValue, shpParams)) {
        return new Response('Invalid signature', { status: 400 });
    }

    const userId = shpParams['Shp_userId'];
    const credits = parseInt(shpParams['Shp_credits'] || '0', 10);

    if (!userId || !credits) {
        return new Response('Missing parameters', { status: 400 });
    }

    await supabase
        .from('payment_intents')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('inv_id', parseInt(invId, 10));

    await supabase.rpc('update_user_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_type: 'purchase',
        p_description: `Покупка ${credits} кредитов (InvId: ${invId})`,
        p_reference_id: `robokassa_${invId}`,
    });

    return new Response(`OK${invId}`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
    });
}
