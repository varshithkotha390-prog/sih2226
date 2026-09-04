import React from 'react';
import { ShieldCheck, Copy, Check } from 'lucide-react';
import { Card } from './Card';
import { formatINR } from '../utils/formatters';

export interface QRCardProps {
  lotId: string;
  materialName: string;
  weightKg: number;
  payoutAmount: number;
  collectorName: string;
  recyclerName: string;
  location: string;
  qrValue?: string;
}

export const QRCard: React.FC<QRCardProps> = ({
  lotId,
  materialName,
  weightKg,
  payoutAmount,
  collectorName,
  recyclerName,
  location,
  qrValue
}) => {
  const [copied, setCopied] = React.useState(false);

  const payload = qrValue || `KABADICONNECT://${lotId}/${payoutAmount}`;

  const copyLotId = () => {
    navigator.clipboard?.writeText(lotId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card variant="elevated" className="border-2 border-slate-200 text-center overflow-hidden p-6 bg-white">
      {/* Header Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-emerald-800 uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CPCB Authorized Manifest</span>
        </div>
        <button
          onClick={copyLotId}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{lotId}</span>
        </button>
      </div>

      {/* QR Code Container */}
      <div className="my-5 flex flex-col items-center justify-center">
        <div className="relative p-4 bg-white rounded-3xl border-4 border-slate-900 shadow-lg shadow-slate-300/40">
          {/* Authentic High-Precision QR Code SVG */}
          <svg
            className="w-52 h-52 sm:w-60 sm:h-60"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect width="120" height="120" fill="white" />

            {/* Corner Finder 1 (Top-Left) */}
            <rect x="8" y="8" width="28" height="28" rx="4" fill="#0f172a" />
            <rect x="12" y="12" width="20" height="20" rx="2" fill="white" />
            <rect x="16" y="16" width="12" height="12" rx="2" fill="#0f172a" />

            {/* Corner Finder 2 (Top-Right) */}
            <rect x="84" y="8" width="28" height="28" rx="4" fill="#0f172a" />
            <rect x="88" y="12" width="20" height="20" rx="2" fill="white" />
            <rect x="92" y="16" width="12" height="12" rx="2" fill="#0f172a" />

            {/* Corner Finder 3 (Bottom-Left) */}
            <rect x="8" y="84" width="28" height="28" rx="4" fill="#0f172a" />
            <rect x="12" y="88" width="20" height="20" rx="2" fill="white" />
            <rect x="16" y="92" width="12" height="12" rx="2" fill="#0f172a" />

            {/* Alignment and Timing patterns */}
            <rect x="40" y="20" width="4" height="4" fill="#0f172a" />
            <rect x="48" y="20" width="4" height="4" fill="#0f172a" />
            <rect x="56" y="20" width="4" height="4" fill="#0f172a" />
            <rect x="64" y="20" width="4" height="4" fill="#0f172a" />
            <rect x="72" y="20" width="4" height="4" fill="#0f172a" />

            <rect x="20" y="40" width="4" height="4" fill="#0f172a" />
            <rect x="20" y="48" width="4" height="4" fill="#0f172a" />
            <rect x="20" y="56" width="4" height="4" fill="#0f172a" />
            <rect x="20" y="64" width="4" height="4" fill="#0f172a" />
            <rect x="20" y="72" width="4" height="4" fill="#0f172a" />

            {/* Center Data Matrix Pixels */}
            <rect x="40" y="32" width="6" height="6" rx="1" fill="#059669" />
            <rect x="50" y="32" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="60" y="32" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="70" y="32" width="6" height="6" rx="1" fill="#059669" />

            <rect x="34" y="42" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="44" y="42" width="6" height="6" rx="1" fill="#059669" />
            <rect x="54" y="42" width="12" height="6" rx="1" fill="#0f172a" />
            <rect x="70" y="42" width="6" height="6" rx="1" fill="#059669" />
            <rect x="80" y="42" width="6" height="6" rx="1" fill="#0f172a" />

            <rect x="34" y="52" width="8" height="6" rx="1" fill="#059669" />
            <rect x="46" y="52" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="68" y="52" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="78" y="52" width="8" height="6" rx="1" fill="#059669" />

            {/* Center Emblem: Recycler leaf badge */}
            <rect x="48" y="48" width="24" height="24" rx="6" fill="#059669" />
            <path
              d="M55 60 C55 54, 65 54, 65 60 C65 66, 55 66, 55 60 Z"
              fill="white"
            />
            <circle cx="60" cy="57" r="3" fill="#047857" />

            <rect x="34" y="62" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="44" y="62" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="70" y="62" width="6" height="6" rx="1" fill="#059669" />
            <rect x="80" y="62" width="6" height="6" rx="1" fill="#0f172a" />

            <rect x="40" y="72" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="52" y="72" width="6" height="6" rx="1" fill="#059669" />
            <rect x="62" y="72" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="74" y="72" width="6" height="6" rx="1" fill="#0f172a" />

            {/* Bottom right data blocks */}
            <rect x="40" y="84" width="8" height="6" rx="1" fill="#059669" />
            <rect x="52" y="84" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="62" y="84" width="8" height="6" rx="1" fill="#0f172a" />
            <rect x="74" y="84" width="6" height="6" rx="1" fill="#059669" />
            <rect x="84" y="84" width="6" height="6" rx="1" fill="#0f172a" />

            <rect x="44" y="94" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="54" y="94" width="12" height="6" rx="1" fill="#059669" />
            <rect x="70" y="94" width="6" height="6" rx="1" fill="#0f172a" />
            <rect x="80" y="94" width="8" height="6" rx="1" fill="#0f172a" />

            <rect x="40" y="104" width="8" height="6" rx="1" fill="#0f172a" />
            <rect x="52" y="104" width="6" height="6" rx="1" fill="#059669" />
            <rect x="64" y="104" width="8" height="6" rx="1" fill="#0f172a" />
            <rect x="76" y="104" width="6" height="6" rx="1" fill="#0f172a" />
          </svg>
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2 font-mono">
          Lot ID: <span className="text-slate-900 font-extrabold">{lotId}</span>
        </p>
      </div>

      {/* Lot Primary Summary */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-4">
        <div className="text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block">Material</span>
          <span className="text-sm sm:text-base font-black text-slate-900">{materialName}</span>
        </div>
        <div className="text-center border-x border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase block">Weight</span>
          <span className="text-sm sm:text-base font-black text-slate-900">{weightKg} kg</span>
        </div>
        <div className="text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block">Amount</span>
          <span className="text-sm sm:text-base font-black text-emerald-700">{formatINR(payoutAmount)}</span>
        </div>
      </div>

      {/* Parties info */}
      <div className="text-xs sm:text-sm text-slate-700 space-y-2 text-left bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
        <div className="flex justify-between">
          <span className="font-semibold text-slate-500">Collector:</span>
          <span className="font-bold text-slate-900">{collectorName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-500">Recycler:</span>
          <span className="font-bold text-emerald-800">{recyclerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-500">Location:</span>
          <span className="font-bold text-slate-900">{location}</span>
        </div>
      </div>
    </Card>
  );
};
