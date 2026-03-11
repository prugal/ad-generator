import { NextResponse } from 'next/server';
import { verifySuccessSignature } from '@/services/robokassaService';

const DEFAULT_SITE_URL = 'https://profit-text.ru';

function getBaseSiteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

function buildRedirect(path: '/payment/success' | '/payment/fail', params?: Record<string, string>): string {
    const url = new URL(path, getBaseSiteUrl());

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            }
        });
    }

    return url.toString();
}

function extractShpFromSearchParams(searchParams: URLSearchParams): Record<string, string> {
    const shpParams: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
        if (key.toLowerCase().startsWith('shp_')) {
            shpParams[key] = value;
        }
    }

    return shpParams;
}

function extractShpFromFormData(formData: FormData): Record<string, string> {
    const shpParams: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
        if (key.toLowerCase().startsWith('shp_') && typeof value === 'string') {
            shpParams[key] = value;
        }
    }

    return shpParams;
}

function handleSuccessValidation(
    outSum: string,
    invId: string,
    signatureValue: string,
    shpParams: Record<string, string>
) {
    if (!outSum || !invId || !signatureValue) {
        console.error('[Robokassa SuccessURL] Missing required params');
        return NextResponse.redirect(buildRedirect('/payment/fail', { reason: 'missing-params' }));
    }

    const isValid = verifySuccessSignature(outSum, invId, signatureValue, shpParams);
    if (!isValid) {
        console.error(`[Robokassa SuccessURL] Invalid signature for InvId=${invId}`);
        return NextResponse.redirect(buildRedirect('/payment/fail', { reason: 'invalid-signature', invId }));
    }

    console.log(`[Robokassa SuccessURL] Signature valid for InvId=${invId}`);
    return NextResponse.redirect(buildRedirect('/payment/success', { invId }));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const outSum = searchParams.get('OutSum') || '';
    const invId = searchParams.get('InvId') || '';
    const signatureValue = searchParams.get('SignatureValue') || '';
    const shpParams = extractShpFromSearchParams(searchParams);

    return handleSuccessValidation(outSum, invId, signatureValue, shpParams);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const outSum = (formData.get('OutSum') as string) || '';
        const invId = (formData.get('InvId') as string) || '';
        const signatureValue = (formData.get('SignatureValue') as string) || '';
        const shpParams = extractShpFromFormData(formData);

        return handleSuccessValidation(outSum, invId, signatureValue, shpParams);
    } catch (error) {
        console.error('[Robokassa SuccessURL] Error:', error);
        return NextResponse.redirect(buildRedirect('/payment/fail', { reason: 'internal-error' }));
    }
}