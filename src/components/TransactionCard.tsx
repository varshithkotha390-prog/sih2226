import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowUpRight, Calendar, Building2 } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Transaction } from '../types';
import { formatINR } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';

export interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const displayName = language === 'hi' ? transaction.materialHi : transaction.material;

  const handleCardClick = () => {
    navigate(`/lot/${transaction.lotId}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      variant="default"
      padding="sm"
      className="cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 flex-shrink-0">
            <Package className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-base">{displayName}</h4>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {transaction.weightKg} kg
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>{transaction.recyclerName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-mono text-[11px] font-bold">{transaction.lotId}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-black text-emerald-700 block">
            +{formatINR(transaction.amount)}
          </span>
          <StatusBadge status={transaction.status} size="sm" />
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {transaction.date}
        </span>
        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
          View Receipt <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
};
