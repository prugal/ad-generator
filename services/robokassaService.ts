import crypto from 'crypto';

export interface RobokassaConfig {
    merchantLogin: string;
    password1: string; // For payment URL generation
    password2: string; // For result URL verification
    isTest: boolean;
}

export interface PaymentParams {
    outSum: number;       // Amount in RUB
    invId: number;        // Invoice ID (unique)
    description: string;  // Payment description
    email?: string;       // Customer email
    userId?: string;      // Custom field: user ID
    credits?: number;     // Custom field: credits count
}

function getConfig(): RobokassaConfig {
    return {
        merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || '',
        password1: process.env.ROBOKASSA_PASSWORD1 || '',
        password2: process.env.ROBOKASSA_PASSWORD2 || '',
        isTest: process.env.ROBOKASSA_TEST_MODE === 'true',
    };
}

/**
 * Generate MD5 hash for Robokassa signature
 */
function md5(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Generate payment URL for redirecting user to Robokassa
 * Signature format: MerchantLogin:OutSum:InvId:Password1:Shp_credits=X:Shp_userId=Y
 * 
 * IMPORTANT: All Shp_ parameters must be included in the signature in sorted order
 */
export function generatePaymentUrl(params: PaymentParams): string {
    const config = getConfig();
    const { outSum, invId, description, email, userId, credits } = params;

    // Build Shp_ params object and sort alphabetically by key
    const shpParams: Record<string, string> = {};
    if (credits) shpParams['Shp_credits'] = credits.toString();
    if (userId) shpParams['Shp_userId'] = userId;

    // Sort Shp_ params alphabetically and format as "key=value"
    const sortedShpEntries = Object.entries(shpParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => `${key}=${val}`);

    // Signature: MerchantLogin:OutSum:InvId:Password1[:Shp_key=value:...]
    const signatureBase = [
        config.merchantLogin,
        outSum,
        invId,
        config.password1,
        ...sortedShpEntries
    ].join(':');

    const signatureValue = md5(signatureBase);

    // Build URL
    const baseUrl = config.isTest
        ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
        : 'https://auth.robokassa.ru/Merchant/Index.aspx';

    const urlParams = new URLSearchParams({
        MerchantLogin: config.merchantLogin,
        OutSum: outSum.toString(),
        InvId: invId.toString(),
        Description: description,
        SignatureValue: signatureValue,
        Culture: 'ru',
        Encoding: 'utf-8',
        ...(email ? { Email: email } : {}),
        ...(config.isTest ? { IsTest: '1' } : {}),
    });

    // Add custom params
    if (credits) urlParams.append('Shp_credits', credits.toString());
    if (userId) urlParams.append('Shp_userId', userId);

    return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Verify signature from Robokassa ResultURL callback
 * Signature format: OutSum:InvId:Password2:Shp_key=value:Shp_key2=value2
 * 
 * IMPORTANT: All Shp_ parameters must be included in the signature in sorted order
 */
export function verifyResultSignature(
    outSum: string,
    invId: string,
    signatureValue: string,
    shpParams: Record<string, string>
): boolean {
    const config = getConfig();

    // Sort Shp_ params alphabetically and format as "key=value"
    const sortedShpEntries = Object.entries(shpParams)
        .filter(([key]) => key.toLowerCase().startsWith('shp_'))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => `${key}=${val}`);

    // Signature: OutSum:InvId:Password2:Shp_key=value:...
    const signatureBase = [
        outSum,
        invId,
        config.password2,
        ...sortedShpEntries
    ].join(':');

    const expectedSignature = md5(signatureBase);

    console.log(`[Robokassa Verify Result] Signature base: ${signatureBase}`);
    console.log(`[Robokassa Verify Result] Expected: ${expectedSignature}, Received: ${signatureValue}`);

    return expectedSignature.toUpperCase() === signatureValue.toUpperCase();
}

/**
 * Verify signature for SuccessURL
 * Signature format: OutSum:InvId:Password1:Shp_key=value:Shp_key2=value2
 * 
 * IMPORTANT: All Shp_ parameters must be included in the signature in sorted order
 */
export function verifySuccessSignature(
    outSum: string,
    invId: string,
    signatureValue: string,
    shpParams: Record<string, string>
): boolean {
    const config = getConfig();

    // Sort Shp_ params alphabetically and format as "key=value"
    const sortedShpEntries = Object.entries(shpParams)
        .filter(([key]) => key.toLowerCase().startsWith('shp_'))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => `${key}=${val}`);

    // Signature: OutSum:InvId:Password1:Shp_key=value:...
    const signatureBase = [
        outSum,
        invId,
        config.password1,
        ...sortedShpEntries
    ].join(':');

    const expectedSignature = md5(signatureBase);

    console.log(`[Robokassa Verify Success] Signature base: ${signatureBase}`);
    console.log(`[Robokassa Verify Success] Expected: ${expectedSignature}, Received: ${signatureValue}`);

    return expectedSignature.toUpperCase() === signatureValue.toUpperCase();
}
