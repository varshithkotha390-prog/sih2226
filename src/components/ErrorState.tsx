import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error processing your request. Please try again.',
  onRetry,
  retryLabel = 'Try Again'
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white rounded-3xl border-2 border-rose-200/80 shadow-xs my-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3.5 border border-rose-100">
        <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
      </div>
      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-600 font-medium max-w-sm mt-1.5 mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          fullWidth={false}
          className="min-w-[160px] py-3 text-sm font-bold"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
