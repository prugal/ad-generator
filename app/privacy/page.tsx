import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
    title: 'Политика конфиденциальности — ProfitText.AI',
    description: 'Политика конфиденциальности сервиса ProfitText.AI. Как мы собираем, используем и защищаем ваши персональные данные.',
    robots: { index: true, follow: true },
};

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href="/" className="text-sm text-blue-600 hover:underline">← На главную</Link>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Политика конфиденциальности</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Дата последнего обновления: 01 марта 2026 г.</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">1. Введение</h2>
                            <p>
                                Настоящая Политика конфиденциальности описывает порядок сбора, использования, хранения и защиты
                                персональных данных пользователей сервиса ProfitText.AI (далее — «Сервис»), принадлежащего
                                ИП Ругаль Павел Николаевич (ИНН: 420537607410, ОГРНИП: 324420500058634).
                            </p>
                            <p>
                                Используя Сервис, вы соглашаетесь с условиями данной Политики. Если вы не согласны с какими-либо
                                положениями, пожалуйста, воздержитесь от использования Сервиса.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">2. Какие данные мы собираем</h2>
                            <p>2.1. Данные, предоставляемые при регистрации через Google OAuth:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Имя и фамилия</li>
                                <li>Адрес электронной почты</li>
                                <li>Аватар (фото профиля)</li>
                            </ul>
                            <p className="mt-4">2.2. Данные, собираемые автоматически:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>IP-адрес</li>
                                <li>Тип и версия браузера</li>
                                <li>Дата и время доступа к Сервису</li>
                                <li>Информация об устройстве</li>
                                <li>Файлы cookie</li>
                            </ul>
                            <p className="mt-4">2.3. Данные о платежах:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Сумма и дата платежа</li>
                                <li>Идентификатор транзакции</li>
                            </ul>
                            <p className="mt-2">
                                <strong>Важно:</strong> Мы не собираем и не храним данные банковских карт. Обработка платежей
                                осуществляется через защищённую платёжную систему Robokassa.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">3. Цели обработки данных</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Предоставление доступа к функциональности Сервиса</li>
                                <li>Обработка платежей и управление балансом кредитов</li>
                                <li>Обеспечение техничской поддержки</li>
                                <li>Улучшение качества Сервиса и пользовательского опыта</li>
                                <li>Отправка уведомлений о работе Сервиса (при согласии пользователя)</li>
                                <li>Выполнение требований законодательства РФ</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">4. Хранение и защита данных</h2>
                            <p>
                                4.1. Персональные данные хранятся на защищённых серверах с использованием шифрования.
                            </p>
                            <p>
                                4.2. Доступ к данным имеют только авторизованные сотрудники.
                            </p>
                            <p>
                                4.3. Мы применяем технические и организационные меры для защиты данных от несанкционированного доступа,
                                утраты, изменения или уничтожения.
                            </p>
                            <p>
                                4.4. Данные хранятся в течение всего срока использования Сервиса и ещё 3 года после удаления аккаунта
                                (в соответствии с требованиями законодательства).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">5. Передача данных третьим лицам</h2>
                            <p>
                                Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением следующих случаев:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Платёжная система Robokassa:</strong> для обработки платежей.</li>
                                <li><strong>Supabase:</strong> для аутентификации и хранения данных аккаунта.</li>
                                <li><strong>Google Analytics:</strong> для анализа использования Сервиса (обезличенные данные).</li>
                                <li><strong>По требованию закона:</strong> в случаях, предусмотренных законодательством РФ.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">6. Права пользователей</h2>
                            <p>Вы имеете право:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Запросить информацию о хранимых персональных данных.</li>
                                <li>Потребовать исправления неточных данных.</li>
                                <li>Потребовать удаления ваших данных (право на забвение).</li>
                                <li>Отозвать согласие на обработку данных.</li>
                            </ul>
                            <p className="mt-2">
                                Для реализации этих прав направьте запрос на <strong>rugal.pavel@yandex.ru</strong>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">7. Файлы cookie</h2>
                            <p>
                                Сервис использует файлы cookie для обеспечения аутентификации, сохранения пользовательских
                                настроек и анализа трафика. Вы можете отключить cookie в настройках браузера, однако это может
                                повлиять на функциональность Сервиса.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">8. Контактная информация</h2>
                            <p>
                                По вопросам, связанным с обработкой персональных данных, обращайтесь:
                            </p>
                            <ul className="list-none space-y-1">
                                <li><strong>Email:</strong> rugal.pavel@yandex.ru</li>
                                <li><strong>Телефон:</strong> +7 905 915-55-59</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
