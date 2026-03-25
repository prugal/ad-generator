import { NextResponse } from 'next/server';
import { generatePaymentForm } from '@/services/robokassaService';
import { supabaseAdmin } from '@/services/supabaseAdmin';

// Pricing plans
const PLANS: Record<string, { credits: number; price: number; name: string }> = {
    start: { credits: 15, price: 99, name: 'Старт (15 кредитов)' },
    pro: { credits: 60, price: 390, name: 'Профи (60 кредитов)' },
    business: { credits: 200, price: 990, name: 'Бизнес (200 кредитов)' },
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
        const { error: dbError } = await supabaseAdmin
            .from('payment_intents')
            .insert({
                inv_id: invId,
                user_id: userId,
                plan_id: planId,
                credits: plan.credits,
                amount: plan.price,
                status: 'pending',
            });

        if (dbError) {
            console.error('Failed to store payment intent:', dbError);
            return NextResponse.json(
                { error: 'Failed to create payment intent', details: dbError.message },
                { status: 500 }
            );
        }

        // Generate Robokassa payment form data (POST)
        const paymentForm = generatePaymentForm({
            outSum: plan.price,
            invId,
            description: `ProfitText.AI — ${plan.name}`,
            receiptItemName: `Пакет кредитов: ${plan.name}`,
            email,
            userId,
            credits: plan.credits,
        });

        return NextResponse.json({
            paymentForm,
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
