
import React from 'react';
import { X, Coins, Zap, ShieldCheck, Image as ImageIcon, Search, MessageSquare } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            Правила и Тарифы
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: Economy */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              Стоимость действий
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mb-2">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="font-bold text-gray-900 dark:text-white">1 Кредит</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Текст объявления</div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="font-bold text-gray-900 dark:text-white">2 Кредита</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Анализ фото + Текст</div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 mb-2">
                  <Search className="w-5 h-5" />
                </div>
                <div className="font-bold text-gray-900 dark:text-white">1 Кредит</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">SEO Оптимизация</div>
              </div>
            </div>
          </section>

          {/* Section 2: Pricing Packages */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Пакеты пополнения
            </h3>
            <div className="space-y-3">
              {/* Starter */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer group">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Starter</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">10 кредитов (~10 объявлений)</div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">99 ₽</div>
              </div>

              {/* Seller (Popular) */}
              <div className="relative flex items-center justify-between p-4 rounded-xl border-2 border-primary-500 bg-primary-50/10 dark:bg-primary-900/10 cursor-pointer">
                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Популярный
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Seller</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">50 кредитов (~50 объявлений)</div>
                </div>
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">390 ₽</div>
              </div>

              {/* Pro Business */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors cursor-pointer">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Pro Business</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">300 кредитов + Bulk API</div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">1 490 ₽</div>
              </div>
            </div>
          </section>

          {/* Section 3: Terms Text */}
          <section className="text-sm text-gray-600 dark:text-gray-400 space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white">Условия использования</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Сервис использует нейросеть Google Gemini для генерации контента. Мы не гарантируем 100% достоверность фактов (AI hallucinations).</li>
              <li>Кредиты списываются только за успешную генерацию. Если сервис выдал ошибку, баланс сохраняется.</li>
              <li>Запрещено генерировать контент, нарушающий законодательство РФ или правила площадок (Авито/Юла).</li>
              <li>Возврат средств за купленные пакеты не предусмотрен (цифровой товар), но мы начислим бонусные кредиты в случае технических проблем.</li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Всё понятно
          </button>
        </div>
      </div>
    </div>
  );
};
