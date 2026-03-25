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
    receiptItemName?: string; // Item name for fiscal receipt
}

type TaxType =
    | 'none'
    | 'vat0'
    | 'vat10'
    | 'vat110'
    | 'vat20'
    | 'vat22'
    | 'vat120'
    | 'vat122'
    | 'vat5'
    | 'vat7'
    | 'vat105'
    | 'vat107';

interface ReceiptItem {
    name: string;
    quantity: number;
    sum: number;
    payment_method: 'full_payment';
    payment_object: 'service' | 'commodity';
    tax: TaxType;
}

interface ReceiptPayload {
    sno?: 'osn' | 'usn_income' | 'usn_income_outcome' | 'esn' | 'patent';
    items: ReceiptItem[];
}

export interface RobokassaPaymentForm {
    actionUrl: string;
    fields: Record<string, string>;
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
 * Signature format: MerchantLogin:OutSum:InvId:Receipt:Password1:Shp_credits=X:Shp_userId=Y
 * 
 * IMPORTANT: All Shp_ parameters must be included in the signature in sorted order
 */
export function generatePaymentUrl(params: PaymentParams): string {
    const form = generatePaymentForm(params);
    const { Receipt, ...rest } = form.fields;
    const query = new URLSearchParams(rest).toString();

    if (Receipt) {
        return query
            ? `${form.actionUrl}?${query}&Receipt=${Receipt}`
            : `${form.actionUrl}?Receipt=${Receipt}`;
    }

    return query ? `${form.actionUrl}?${query}` : form.actionUrl;
}

/**
 * Generate payment form data for POST redirect to Robokassa.
 * POST is recommended by Robokassa for fiscal Receipt payload.
 */
export function generatePaymentForm(params: PaymentParams): RobokassaPaymentForm {
    const config = getConfig();
    const { outSum, invId, description, email, userId, credits, receiptItemName } = params;

    // Build fiscal receipt payload (required by 54-FZ)
    const receipt: ReceiptPayload = {
        items: [
            {
                name: (receiptItemName || description).slice(0, 128),
                quantity: 1,
                sum: outSum,
                payment_method: 'full_payment',
                payment_object: 'service',
                tax: 'none',
            },
        ],
    };

    const receiptJson = JSON.stringify(receipt);
    const receiptEncoded = encodeURIComponent(receiptJson);

    // Build Shp_ params object and sort alphabetically by key
    const shpParams: Record<string, string> = {};
    if (credits) shpParams['Shp_credits'] = credits.toString();
    if (userId) shpParams['Shp_userId'] = userId;

    // Sort Shp_ params alphabetically and format as "key=value"
    const sortedShpEntries = Object.entries(shpParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => `${key}=${val}`);

    // Signature: MerchantLogin:OutSum:InvId:Receipt:Password1[:Shp_key=value:...]
    const signatureBase = [
        config.merchantLogin,
        outSum,
        invId,
        receiptEncoded,
        config.password1,
        ...sortedShpEntries
    ].join(':');

    const signatureValue = md5(signatureBase);

    const baseUrl = config.isTest
        ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
        : 'https://auth.robokassa.ru/Merchant/Index.aspx';

    const fields: Record<string, string> = {
        MerchantLogin: config.merchantLogin,
        OutSum: outSum.toString(),
        InvId: invId.toString(),
        Description: description,
        SignatureValue: signatureValue,
        Culture: 'ru',
        Encoding: 'utf-8',
        Receipt: receiptEncoded,
    };

    if (email) fields.Email = email;
    if (config.isTest) fields.IsTest = '1';

    // Add custom params
    if (credits) fields.Shp_credits = credits.toString();
    if (userId) fields.Shp_userId = userId;

    return {
        actionUrl: baseUrl,
        fields,
    };
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
