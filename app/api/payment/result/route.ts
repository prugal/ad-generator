import { verifyResultSignature } from '@/services/robokassaService';
import { supabaseAdmin } from '@/services/supabaseAdmin';

function isNoRowsError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'PGRST116'
    );
}

/**
 * Robokassa ResultURL handler
 * Called by Robokassa server-to-server when payment is confirmed.
 * Must respond with "OK{InvId}" on success.
 * 
 * Idempotency: Returns OK{InvId} even for already processed payments to prevent retries.
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

        // Check if payment intent exists and get current status
        const { data: existingIntent, error: fetchError } = await supabaseAdmin
            .from('payment_intents')
            .select('status, user_id, credits')
            .eq('inv_id', parseInt(invId, 10))
            .single();

        if (fetchError && !isNoRowsError(fetchError)) {
            console.error(`[Robokassa ResultURL] Failed to fetch payment intent for InvId=${invId}:`, fetchError);
            return new Response('Internal Server Error', { status: 500 });
        }

        // If already completed, return OK immediately (idempotency)
        if (existingIntent?.status === 'completed') {
            console.log(`[Robokassa ResultURL] Already processed: InvId=${invId}`);
            return new Response(`OK${invId}`, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        // If intent doesn't exist, create it (edge case: callback before create)
        if (!existingIntent) {
            console.log(`[Robokassa ResultURL] Creating missing intent for InvId=${invId}`);
            const { error: insertError } = await supabaseAdmin
                .from('payment_intents')
                .insert({
                    inv_id: parseInt(invId, 10),
                    user_id: userId,
                    plan_id: 'unknown',
                    credits,
                    amount: parseFloat(outSum),
                    status: 'pending',
                });

            if (insertError) {
                console.error(`[Robokassa ResultURL] Failed to create missing intent for InvId=${invId}:`, insertError);
                return new Response('Internal Server Error', { status: 500 });
            }
        }

        // Atomic update: only transition from 'pending' to 'completed'
        const { data: updateResult, error: updateError } = await supabaseAdmin
            .from('payment_intents')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('inv_id', parseInt(invId, 10))
            .eq('status', 'pending')
            .select();

        if (updateError) {
            console.error(`[Robokassa ResultURL] Failed to update payment intent for InvId=${invId}:`, updateError);
            return new Response('Internal Server Error', { status: 500 });
        }

        // If no rows updated, it means another concurrent request already processed it
        if (!updateResult || updateResult.length === 0) {
            console.log(`[Robokassa ResultURL] Concurrent processing detected for InvId=${invId}, returning OK`);
            return new Response(`OK${invId}`, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        // Add credits to user account (RPC has built-in idempotency check via reference_id)
        const { data, error } = await supabaseAdmin.rpc('update_user_credits', {
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
        } else if (data?.duplicate) {
            console.log(`[Robokassa ResultURL] Duplicate transaction detected for InvId=${invId}`);
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

    console.log(`[Robokassa ResultURL GET] InvId=${invId}, OutSum=${outSum}`);

    // Verify signature
    if (!verifyResultSignature(outSum, invId, signatureValue, shpParams)) {
        console.error(`[Robokassa ResultURL GET] Invalid signature for InvId=${invId}`);
        return new Response('Invalid signature', { status: 400 });
    }

    const userId = shpParams['Shp_userId'];
    const credits = parseInt(shpParams['Shp_credits'] || '0', 10);

    if (!userId || !credits) {
        console.error(`[Robokassa ResultURL GET] Missing userId or credits for InvId=${invId}`);
        return new Response('Missing parameters', { status: 400 });
    }

    // Check if payment intent exists and get current status
    const { data: existingIntent, error: fetchError } = await supabaseAdmin
        .from('payment_intents')
        .select('status')
        .eq('inv_id', parseInt(invId, 10))
        .single();

    if (fetchError && !isNoRowsError(fetchError)) {
        console.error(`[Robokassa ResultURL GET] Failed to fetch payment intent for InvId=${invId}:`, fetchError);
        return new Response('Internal Server Error', { status: 500 });
    }

    // If already completed, return OK immediately (idempotency)
    if (existingIntent?.status === 'completed') {
        console.log(`[Robokassa ResultURL GET] Already processed: InvId=${invId}`);
        return new Response(`OK${invId}`, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    // If intent doesn't exist, create it
    if (!existingIntent) {
        const { error: insertError } = await supabaseAdmin
            .from('payment_intents')
            .insert({
                inv_id: parseInt(invId, 10),
                user_id: userId,
                plan_id: 'unknown',
                credits,
                amount: parseFloat(outSum),
                status: 'pending',
            });

        if (insertError) {
            console.error(`[Robokassa ResultURL GET] Failed to create missing intent for InvId=${invId}:`, insertError);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    // Atomic update: only transition from 'pending' to 'completed'
    const { data: updateResult, error: updateError } = await supabaseAdmin
        .from('payment_intents')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('inv_id', parseInt(invId, 10))
        .eq('status', 'pending')
        .select();

    if (updateError) {
        console.error(`[Robokassa ResultURL GET] Failed to update payment intent for InvId=${invId}:`, updateError);
        return new Response('Internal Server Error', { status: 500 });
    }

    // If no rows updated, concurrent request already processed it
    if (!updateResult || updateResult.length === 0) {
        console.log(`[Robokassa ResultURL GET] Concurrent processing detected for InvId=${invId}`);
        return new Response(`OK${invId}`, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    // Add credits (RPC has built-in idempotency check)
    await supabaseAdmin.rpc('update_user_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_type: 'purchase',
        p_description: `Покупка ${credits} кредитов (InvId: ${invId})`,
        p_reference_id: `robokassa_${invId}`,
    });

    console.log(`[Robokassa ResultURL GET] Success: +${credits} credits for user ${userId}, InvId=${invId}`);

    return new Response(`OK${invId}`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
    });
}
