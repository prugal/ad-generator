'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';

const TABS = [
  { id: 'profile', label: 'Профиль', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { id: 'balance', label: 'Баланс', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
  { id: 'generations', label: 'Генерации', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
  { id: 'transactions', label: 'Транзакции', icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' },
  { id: 'payments', label: 'Платежи', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const TYPE_LABELS: Record<string, string> = {
  first_login: 'Регистрация',
  purchase: 'Покупка кредитов',
  usage: 'Генерация объявления',
  refund: 'Возврат',
  bonus: 'Бонус',
  ad_generation: 'Генерация объявления',
  ad_regeneration: 'Оптимизация объявления',
};

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export default function CabinetPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setIsAuthenticated(true);
      fetchData();
    };
    checkAuth();
  }, [router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const headers = await authHeaders();
      const [profileRes, creditsRes] = await Promise.all([
        fetch('/api/cabinet/profile', { headers }),
        fetch('/api/cabinet/credits', { headers }),
      ]);

      if (!profileRes.ok || !creditsRes.ok) {
        setApiError('Не удалось загрузить данные. Попробуйте обновить страницу.');
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
      }

      if (creditsRes.ok) {
        const data = await creditsRes.json();
        setCredits(data.credits);
      }
    } catch {
      setApiError('Ошибка сети. Проверьте подключение и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          На главную
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-700/50 p-4">
              <div className="mb-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg shadow-blue-500/25">
                  {profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {profile?.full_name || profile?.email}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Баланс: <span className="font-semibold text-blue-600 dark:text-blue-400">{credits?.balance ?? 0}</span> кредитов
                </p>
              </div>

              <nav className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Выйти
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-700/50 p-6">
              {apiError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
                  <span>{apiError}</span>
                  <button
                    onClick={fetchData}
                    className="ml-4 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                  >
                    Повторить
                  </button>
                </div>
              )}

              {activeTab === 'profile' && <ProfileTab profile={profile} />}
              {activeTab === 'balance' && <BalanceTab credits={credits} />}
              {activeTab === 'generations' && <GenerationsTab />}
              {activeTab === 'transactions' && <TransactionsTab />}
              {activeTab === 'payments' && <PaymentsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ profile }: { profile: any }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Профиль</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700/80 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium shadow-sm">
            {profile?.email || '—'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Имя</label>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700/80 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium shadow-sm">
            {profile?.full_name || 'Не указано'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Дата регистрации</label>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700/80 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium shadow-sm">
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('ru-RU')
              : 'Неизвестно'}
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceTab({ credits }: { credits: any }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Баланс кредитов</h3>
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="text-sm font-medium text-blue-100 mb-1">Текущий баланс</div>
        <div className="text-5xl font-extrabold mb-4">
          {credits?.balance ?? 0}
        </div>
        <div className="flex gap-8 text-sm text-blue-100">
          <div>
            <div className="text-blue-200 text-xs uppercase tracking-wider mb-1">Заработано</div>
            <div className="text-lg font-bold">{credits?.total_earned ?? 0}</div>
          </div>
          <div>
            <div className="text-blue-200 text-xs uppercase tracking-wider mb-1">Потрачено</div>
            <div className="text-lg font-bold">{credits?.total_spent ?? 0}</div>
          </div>
        </div>
        {credits?.updated_at && (
          <div className="text-xs text-blue-200 mt-4">
            Обновлено: {new Date(credits.updated_at).toLocaleString('ru-RU')}
          </div>
        )}
      </div>
    </div>
  );
}

function GenerationsTab() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchGenerations = useCallback(
    async (offset: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = await authHeaders();
        const res = await fetch(`/api/cabinet/generations?limit=${limit}&offset=${offset}`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setGenerations(data.generations || []);
        setTotal(data.total || 0);
      } catch (e: any) {
        setError(`Не удалось загрузить: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchGenerations(page * limit);
  }, [page, fetchGenerations]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (isLoading) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">История генераций</h3>
      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm">
          {error}
          <button onClick={() => fetchGenerations(page * limit)} className="ml-2 underline hover:no-underline">Повторить</button>
        </div>
      ) : generations.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">У вас пока нет генераций.</p>
          <Link href="/generator" className="inline-block mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all">
            Создать первое объявление
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {generations.map((gen: any) => (
              <div
                key={gen.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-gray-50/50 dark:bg-gray-900/30"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(gen.created_at).toLocaleString('ru-RU')}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg">
                    {gen.category || 'Объявление'}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap line-clamp-3 text-sm leading-relaxed">
                  {gen.output_text}
                </p>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
              >
                Назад
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchTransactions = useCallback(
    async (offset: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = await authHeaders();
        const res = await fetch(`/api/cabinet/transactions?limit=${limit}&offset=${offset}`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      } catch (e: any) {
        setError(`Не удалось загрузить: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactions(page * limit);
  }, [page, fetchTransactions]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (isLoading) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">История транзакций</h3>
      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm">
          {error}
          <button onClick={() => fetchTransactions(page * limit)} className="ml-2 underline hover:no-underline">Повторить</button>
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">У вас пока нет транзакций.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Дата</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Тип</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Сумма</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Описание</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/30">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${Number(tx.amount) > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                        {TYPE_LABELS[tx.type] || tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 text-sm font-bold whitespace-nowrap ${Number(tx.amount) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {Number(tx.amount) > 0 ? '+' : ''}{tx.amount}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                      {tx.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
              >
                Назад
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchPayments = useCallback(
    async (offset: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = await authHeaders();
        const res = await fetch(`/api/cabinet/payments?limit=${limit}&offset=${offset}`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPayments(data.payments || []);
        setTotal(data.total || 0);
      } catch (e: any) {
        setError(`Не удалось загрузить: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPayments(page * limit);
  }, [page, fetchPayments]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Ожидает',
      completed: 'Оплачен',
      succeeded: 'Оплачен',
      failed: 'Ошибка',
      cancelled: 'Отменён',
    };
    return map[status] || status;
  };

  const statusClass = (status: string) => {
    if (status === 'succeeded' || status === 'completed')
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (status === 'pending') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Платежи</h3>
      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm">
          {error}
          <button onClick={() => fetchPayments(page * limit)} className="ml-2 underline hover:no-underline">Повторить</button>
        </div>
      ) : payments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">У вас пока нет платежей.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Дата</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Сумма</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Кредиты</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/30">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {payment.amount} {payment.currency || 'RUB'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
                      {payment.credits}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${statusClass(payment.status)}`}>
                        {statusLabel(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
              >
                Назад
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
