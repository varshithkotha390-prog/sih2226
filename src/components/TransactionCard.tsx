import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowUpRight, Calendar, Building2 } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Transaction } from '../types';
import { formatINR } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';
import { getMaterialName } from '../services/mockData';

export interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const displayName = getMaterialName(transaction.material, language);

  const handleCardClick = () => {
    navigate(`/lot/${transaction.lotId}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      variant="default"
      padding="sm"
      className="cursor-pointer hover:border-[#0F3D2E]/40 hover:shadow-md transition-all active:scale-[0.99] border-slate-200/90 rounded-2xl bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-950/5 text-[#0F3D2E] flex items-center justify-center border border-emerald-800/20 flex-shrink-0">
            <Package className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-[#121820] text-base">{displayName}</h4>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                {transaction.weightKg} kg
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>{transaction.recyclerName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#0F3D2E] font-mono text-[11px] font-black bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">{transaction.lotId}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-black text-[#0F3D2E] block font-mono tracking-tight">
            +{formatINR(transaction.amount)}
          </span>
          <StatusBadge status={transaction.status} size="sm" />
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
          <Calendar className="w-3 h-3 text-slate-400" />
          {transaction.date}
        </span>
        <span className="text-[#0F3D2E] font-bold flex items-center gap-0.5 hover:underline">
          View Receipt <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
};
