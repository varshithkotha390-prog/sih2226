import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Filter, PackageOpen } from 'lucide-react';
import { Header } from '../components/Header';
import { TransactionCard } from '../components/TransactionCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { useLanguage } from '../i18n/LanguageContext';
import { getTransactions } from '../services/recyclingService';
import { Transaction } from '../types';

export const TransactionsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getTransactions().then((data) => {
      setTransactions(data);
      setIsLoading(false);
    });
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'All') return true;
    return tx.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <Header
        title={t('transactionsTitle')}
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Filter Pills: All | Completed | Pending */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Completed', 'Pending'] as const).map((tab) => {
            const isSelected = filter === tab;
            const label =
              tab === 'All'
                ? t('filterAll')
                : tab === 'Completed'
                ? t('filterCompleted')
                : t('filterPending');

            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0F3D2E] text-white shadow-sm border border-[#0F3D2E]'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <LoadingState message="Loading transactions..." />
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('emptyTransactions')}
            description="Start selling e-waste to generate verified manifests and digital earnings."
            actionLabel={t('sellEWastePrimaryBtn')}
            onAction={() => navigate('/sell')}
          />
        )}
      </main>
    </div>
  );
};
