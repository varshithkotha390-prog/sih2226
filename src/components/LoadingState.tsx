import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  isAiScanning?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  submessage,
  isAiScanning = false
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-8 text-center min-h-[240px]"
    >
      <div className="relative mb-4">
        {isAiScanning ? (
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs border border-emerald-200">
            <Sparkles className="w-8 h-8 stroke-[2.2]" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{message}</h3>
      {submessage && (
        <p className="text-sm text-slate-600 font-medium max-w-sm mt-1.5 leading-relaxed">
          {submessage}
        </p>
      )}
    </div>
  );
};
