'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';

const TABS = [
  { id: 'profile', label: 'Профиль' },
  { id: 'balance', label: 'Баланс' },
  { id: 'generations', label: 'История генераций' },
  { id: 'transactions', label: 'История транзакций' },
  { id: 'payments', label: 'Платежи' },
] as const;

type TabId = (typeof TABS)[number]['id'];

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="mb-6 text-center">
                <div className="h-20 w-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 text-2xl font-bold mb-2">
                  {profile?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h2 className="text-lg font-medium text-gray-900 truncate">
                  {profile?.full_name || profile?.email}
                </h2>
                <p className="text-sm text-gray-500">
                  Баланс: {credits?.balance ?? 0} кредитов
                </p>
              </div>

              <nav className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {apiError}
                  <button
                    onClick={fetchData}
                    className="ml-2 underline hover:no-underline"
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Профиль</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
            {profile?.email || '—'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Имя</label>
          <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
            {profile?.full_name || 'Не указано'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Дата регистрации</label>
          <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Баланс кредитов</h3>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {credits?.balance ?? 0}
        </div>
        <div className="text-sm text-gray-600">
          Заработано: {credits?.total_earned ?? 0} | Потрачено:{' '}
          {credits?.total_spent ?? 0}
        </div>
        {credits?.updated_at && (
          <div className="text-xs text-gray-400 mt-2">
            Обновлено:{' '}
            {new Date(credits.updated_at).toLocaleString('ru-RU')}
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
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setGenerations(data.generations || []);
        setTotal(data.total || 0);
      } catch {
        setError('Не удалось загрузить историю генераций.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchGenerations(page * limit);
  }, [page, fetchGenerations]);

  const totalPages = Math.ceil(total / limit);

  if (isLoading) return <div className="text-center py-4">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">История генераций</h3>
      {error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : generations.length === 0 ? (
        <p className="text-gray-500">У вас пока нет генераций.</p>
      ) : (
        <>
          <div className="space-y-4">
            {generations.map((gen: any) => (
              <div
                key={gen.id}
                className="border border-gray-200 rounded-md p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {new Date(gen.created_at).toLocaleString('ru-RU')}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {gen.category || 'Объявление'}
                  </span>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap line-clamp-3">
                  {gen.output_text}
                </p>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Назад
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
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
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      } catch {
        setError('Не удалось загрузить транзакции.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactions(page * limit);
  }, [page, fetchTransactions]);

  const totalPages = Math.ceil(total / limit);

  if (isLoading) return <div className="text-center py-4">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">История транзакций</h3>
      {error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">У вас пока нет транзакций.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.created_at).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.type}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        Number(tx.amount) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {Number(tx.amount) > 0 ? '+' : ''}
                      {tx.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tx.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Назад
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
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
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPayments(data.payments || []);
        setTotal(data.total || 0);
      } catch {
        setError('Не удалось загрузить платежи.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPayments(page * limit);
  }, [page, fetchPayments]);

  const totalPages = Math.ceil(total / limit);

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
      return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) return <div className="text-center py-4">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Платежи</h3>
      {error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500">У вас пока нет платежей.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Кредиты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.amount} {payment.currency || 'RUB'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass(payment.status)}`}
                      >
                        {statusLabel(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Назад
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
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
