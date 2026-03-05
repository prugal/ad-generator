import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
    title: 'Условия использования — ProfitText.AI',
    description: 'Условия предоставления услуг сервиса ProfitText.AI. Описание процесса оказания услуг, обязательства сторон и правила использования.',
    robots: { index: true, follow: true },
};

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href="/" className="text-sm text-blue-600 hover:underline">← На главную</Link>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Условия использования</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Дата последнего обновления: 01 марта 2026 г.</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">1. Описание сервиса</h2>
                            <p>
                                ProfitText.AI — это онлайн-сервис для автоматической генерации текстовых описаний товаров и услуг
                                с использованием технологий искусственного интеллекта. Сервис предназначен для создания продающих
                                объявлений для площадок Авито, Юла, OLX и других досок объявлений.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">2. Процесс оказания услуг</h2>
                            <p>2.1. Процесс оказания услуг включает следующие этапы:</p>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>Регистрация:</strong> Пользователь авторизуется через учётную запись Google.</li>
                                <li><strong>Выбор категории:</strong> Пользователь выбирает категорию товара (электроника, авто, услуги, одежда).</li>
                                <li><strong>Заполнение характеристик:</strong> Пользователь вводит информацию о товаре: модель, состояние, цену и другие характеристики.</li>
                                <li><strong>Загрузка фото (опционально):</strong> Пользователь может загрузить фотографию товара для анализа нейросетью.</li>
                                <li><strong>Генерация:</strong> ИИ создаёт продающее описание на основе предоставленных данных.</li>
                                <li><strong>Результат:</strong> Пользователь получает готовый текст, который можно скопировать, отредактировать или оптимизировать.</li>
                            </ol>
                            <p className="mt-4">
                                2.2. Время генерации одного описания составляет в среднем 2–10 секунд в зависимости от объёма данных.
                            </p>
                            <p>
                                2.3. Услуга считается оказанной в момент отображения сгенерированного текста пользователю.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">3. Стоимость услуг</h2>
                            <p>3.1. Актуальные тарифы:</p>
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">Тариф</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">Кредиты</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">Стоимость</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">Цена за 1 кредит</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">Старт</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">15</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">99 ₽</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">6.60 ₽</td>
                                        </tr>
                                        <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">Профи</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">60</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">390 ₽</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">6.50 ₽</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">Бизнес</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">200</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">990 ₽</td>
                                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">4.95 ₽</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                3.2. Цены указаны в российских рублях и включают все применимые налоги.
                            </p>
                            <p>
                                3.3. Исполнитель оставляет за собой право изменять тарифы. Изменение не затрагивает ранее приобретённые кредиты.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">4. Оплата</h2>
                            <p>
                                4.1. Оплата производится через платёжную систему Robokassa, обеспечивающую безопасную обработку
                                платежей в соответствии с международными стандартами PCI DSS.
                            </p>
                            <p>4.2. Доступные способы оплаты:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Банковские карты: Visa, Mastercard, МИР</li>
                                <li>Система быстрых платежей (СБП)</li>
                                <li>Электронные кошельки (ЮMoney, QIWI)</li>
                                <li>Мобильные платежи</li>
                            </ul>
                            <p className="mt-4">
                                4.3. Кредиты зачисляются на счёт пользователя автоматически после подтверждения оплаты.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">5. Ограничения использования</h2>
                            <p>Пользователям запрещается:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Использовать Сервис для создания мошеннических, вводящих в заблуждение или незаконных объявлений.</li>
                                <li>Пытаться обойти систему кредитов или получить несанкционированный доступ к Сервису.</li>
                                <li>Перепродавать или передавать кредиты третьим лицам.</li>
                                <li>Использовать автоматизированные средства для массового доступа к Сервису.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">6. Интеллектуальная собственность</h2>
                            <p>
                                6.1. Тексты, сгенерированные Сервисом, передаются в полное распоряжение Заказчика.
                                Заказчик может использовать их без ограничений.
                            </p>
                            <p>
                                6.2. Дизайн, логотипы и программное обеспечение Сервиса являются интеллектуальной собственностью Исполнителя.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">7. Связанные документы</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><Link href="/offer" className="text-blue-600 hover:underline">Публичная оферта</Link></li>
                                <li><Link href="/privacy" className="text-blue-600 hover:underline">Политика конфиденциальности</Link></li>
                                <li><Link href="/refund" className="text-blue-600 hover:underline">Политика возврата средств</Link></li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
