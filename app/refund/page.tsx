import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
    title: 'Возврат средств — ProfitText.AI',
    description: 'Политика возврата средств сервиса ProfitText.AI. Условия, сроки и порядок возврата за неиспользованные кредиты.',
    robots: { index: true, follow: true },
};

export default function RefundPage() {
    return (
        <>
            <Header />
            <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href="/" className="text-sm text-blue-600 hover:underline">← На главную</Link>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Возврат средств</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Дата последнего обновления: 01 марта 2026 г.</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">

                        {/* Quick summary */}
                        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                                Краткая информация
                            </h2>
                            <ul className="list-disc pl-6 space-y-1 text-blue-800 dark:text-blue-200 text-sm">
                                <li>Возврат возможен в течение <strong>14 дней</strong> с момента оплаты</li>
                                <li>Возвращаются только <strong>неиспользованные</strong> кредиты</li>
                                <li>Срок обработки — до <strong>10 рабочих дней</strong></li>
                                <li>Обращение через <strong>rugal.pavel@yandex.ru</strong></li>
                            </ul>
                        </div>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">1. Общие условия возврата</h2>
                            <p>
                                1.1. Настоящая Политика возврата регулирует порядок и условия возврата денежных средств, уплаченных
                                за приобретение кредитов в сервисе ProfitText.AI.
                            </p>
                            <p>
                                1.2. Политика разработана в соответствии с Законом РФ «О защите прав потребителей» от 07.02.1992 № 2300-1
                                и Правилами продажи товаров дистанционным способом.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">2. Условия возврата</h2>
                            <p>2.1. Возврат денежных средств осуществляется при соблюдении следующих условий:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Срок обращения:</strong> Заявление на возврат подано в течение 14 (четырнадцати) календарных
                                    дней с момента оплаты.
                                </li>
                                <li>
                                    <strong>Неиспользованные кредиты:</strong> Возврату подлежат только неиспользованные кредиты.
                                    Стоимость использованных кредитов не возвращается.
                                </li>
                            </ul>
                            <p className="mt-4">
                                2.2. Если часть кредитов была использована, возврату подлежит сумма, пропорциональная количеству
                                оставшихся неиспользованных кредитов.
                            </p>
                            <p>
                                <strong>Пример:</strong> Вы приобрели тариф «Профи» (60 кредитов за 390 ₽) и использовали 20 кредитов.
                                Возврату подлежит: (390 / 60) × 40 = 260 ₽.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">3. Порядок оформления возврата</h2>
                            <p>Для оформления возврата выполните следующие действия:</p>
                            <ol className="list-decimal pl-6 space-y-3 mt-4">
                                <li>
                                    <strong>Направьте заявление</strong> на электронную почту{' '}
                                    <a href="mailto:rugal.pavel@yandex.ru" className="text-blue-600 hover:underline">rugal.pavel@yandex.ru</a>{' '}
                                    с темой «Возврат средств».
                                </li>
                                <li>
                                    <strong>В заявлении укажите:</strong>
                                    <ul className="list-disc pl-6 space-y-1 mt-2">
                                        <li>ФИО</li>
                                        <li>Email, привязанный к аккаунту</li>
                                        <li>Дату и сумму платежа</li>
                                        <li>Причину возврата</li>
                                        <li>Реквизиты для возврата (если отличаются от способа оплаты)</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Ожидайте ответа.</strong> Мы рассмотрим заявление в течение 3 рабочих дней
                                    и уведомим вас о результате.
                                </li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">4. Сроки возврата</h2>
                            <p>
                                4.1. Рассмотрение заявления — до 3 (трёх) рабочих дней.
                            </p>
                            <p>
                                4.2. Возврат денежных средств — до 10 (десяти) рабочих дней с момента одобрения заявления.
                            </p>
                            <p>
                                4.3. Возврат осуществляется тем же способом, которым была произведена оплата, если иное
                                не согласовано с пользователем.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">5. Случаи отказа в возврате</h2>
                            <p>Возврат средств не производится в следующих случаях:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Превышен срок обращения (более 14 дней с момента оплаты).</li>
                                <li>Все приобретённые кредиты были использованы.</li>
                                <li>Аккаунт пользователя заблокирован за нарушение правил использования Сервиса.</li>
                                <li>Бесплатные (бонусные) кредиты, полученные при регистрации или по акциям.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">6. Особые случаи</h2>
                            <p>
                                6.1. <strong>Технический сбой:</strong> Если генерация не была выполнена из-за технического сбоя на стороне
                                Сервиса, списанные кредиты восстанавливаются автоматически. Если восстановление не произошло — обратитесь
                                в поддержку.
                            </p>
                            <p>
                                6.2. <strong>Двойное списание:</strong> В случае двойного списания средств из-за ошибки платёжной системы,
                                излишне уплаченная сумма возвращается в полном объёме.
                            </p>
                        </section>

                        <section className="mt-10 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Контакты для возврата</h2>
                            <p className="text-sm">
                                <strong>Email:</strong>{' '}
                                <a href="mailto:rugal.pavel@yandex.ru" className="text-blue-600 hover:underline">rugal.pavel@yandex.ru</a>
                            </p>
                            <p className="text-sm"><strong>Время работы поддержки:</strong> Пн-Пт, 10:00–19:00 (МСК)</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
