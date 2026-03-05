import { NextResponse } from 'next/server';
import { generatePaymentUrl } from '@/services/robokassaService';
import { supabase } from '@/services/supabase';

// Pricing plans
const PLANS: Record<string, { credits: number; price: number; name: string }> = {
    start: { credits: 10, price: 99, name: 'Старт (10 кредитов)' },
    pro: { credits: 30, price: 249, name: 'Профи (30 кредитов)' },
    business: { credits: 75, price: 499, name: 'Бизнес (75 кредитов)' },
};

export async function POST(request: Request) {
    try {
        const { planId, userId, email } = await request.json();

        if (!planId || !userId) {
            return NextResponse.json(
                { error: 'Missing required parameters: planId, userId' },
                { status: 400 }
            );
        }

        const plan = PLANS[planId];
        if (!plan) {
            return NextResponse.json(
                { error: `Invalid plan: ${planId}. Available: ${Object.keys(PLANS).join(', ')}` },
                { status: 400 }
            );
        }

        // Generate unique invoice ID
        // In production, store this in the database for tracking
        const invId = Date.now() % 2147483647; // Robokassa requires int32

        // Store payment intent in database
        const { error: dbError } = await supabase
            .from('payment_intents')
            .insert({
                inv_id: invId,
                user_id: userId,
                plan_id: planId,
                credits: plan.credits,
                amount: plan.price,
                status: 'pending',
                created_at: new Date().toISOString(),
            });

        if (dbError) {
            console.error('Failed to store payment intent:', dbError);
            // Continue anyway - we can reconcile later
        }

        // Generate Robokassa payment URL
        const paymentUrl = generatePaymentUrl({
            outSum: plan.price,
            invId,
            description: `AdGenius.AI — ${plan.name}`,
            email,
            userId,
            credits: plan.credits,
        });

        return NextResponse.json({
            paymentUrl,
            invId,
            plan: plan.name,
            amount: plan.price,
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
