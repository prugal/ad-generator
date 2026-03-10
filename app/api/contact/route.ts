import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const CONTACT_EMAIL = 'rugal.pavel@yandex.ru';
const FROM_EMAIL = 'ProfitText.AI <onboarding@resend.dev>'; // Для production: используйте ваш верифицированный домен
const TESTING_EMAIL = 'pn.rugal@gmail.com'; // Email для тестирования в бесплатном тарифе Resend

const subjectLabels: Record<string, string> = {
    general: 'Общий вопрос',
    payment: 'Оплата и тарифы',
    technical: 'Техническая поддержка',
    refund: 'Возврат средств',
    partnership: 'Сотрудничество',
};

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        // Валидация
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Все обязательные поля должны быть заполнены' },
                { status: 400 }
            );
        }

        // Инициализация Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        
        if (!resendApiKey) {
            // Если ключ не настроен, используем fallback на mailto
            const subjectText = subjectLabels[subject] || 'Общий вопрос';
            const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[ProfitText.AI] ${subjectText} от ${name}`)}&body=${encodeURIComponent(`Имя: ${name}\nEmail: ${email}\nТема: ${subjectText}\n\n${message}`)}`;
            
            return NextResponse.json({
                success: true,
                message: 'Письмо сформировано',
                mailtoLink,
                warning: 'RESEND_API_KEY не настроен, используется mailto',
            });
        }

        const resend = new Resend(resendApiKey);

        const subjectText = subjectLabels[subject] || 'Общий вопрос';

        // В режиме тестирования отправляем на TESTING_EMAIL (требование бесплатного тарифа Resend)
        // Для production нужно верифицировать домен и использовать email на этом домене
        const isTestingMode = resendApiKey.startsWith('re_');
        const sendToEmail = isTestingMode ? TESTING_EMAIL : CONTACT_EMAIL;

        // Отправка письма через Resend
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [sendToEmail],
            replyTo: email,
            subject: `[ProfitText.AI] ${subjectText} от ${name}`,
            html: `
                <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb; margin-bottom: 20px;">Новое сообщение с сайта ProfitText.AI</h2>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 8px 0;"><strong>Имя:</strong> ${name}</p>
                        <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p style="margin: 8px 0;"><strong>Тема:</strong> ${subjectText}</p>
                    </div>
                    
                    <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h3 style="margin-top: 0;">Сообщение:</h3>
                        <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        <p>Отправлено через форму обратной связи на сайте</p>
                        <p>Дата: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}</p>
                        ${isTestingMode && sendToEmail !== CONTACT_EMAIL ? `<p style="color: #f59e0b;"><strong>⚠ Тестовый режим:</strong> Письмо отправлено на ${TESTING_EMAIL}. Для отправки на ${CONTACT_EMAIL} верифицируйте домен в Resend.</p>` : ''}
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Сообщение успешно отправлено',
            emailId: data?.id,
        });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Ошибка при отправке сообщения' },
            { status: 500 }
        );
    }
}
