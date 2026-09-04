import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from './Badge';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');

  if (normalized === 'completed' || normalized === 'verified') {
    return (
      <Badge variant="emerald" size={size} icon={<CheckCircle2 className="w-3.5 h-3.5" />} className={className}>
        Completed
      </Badge>
    );
  }

  if (normalized === 'awaiting_handover' || normalized === 'pending') {
    return (
      <Badge variant="amber" size={size} icon={<Clock className="w-3.5 h-3.5" />} className={className}>
        {normalized === 'awaiting_handover' ? 'Awaiting Handover' : 'Pending'}
      </Badge>
    );
  }

  if (normalized === 'authorized') {
    return (
      <Badge variant="emerald" size={size} icon={<CheckCircle2 className="w-3.5 h-3.5" />} className={className}>
        ✓ Authorized
      </Badge>
    );
  }

  return (
    <Badge variant="slate" size={size} icon={<AlertCircle className="w-3.5 h-3.5" />} className={className}>
      {status}
    </Badge>
  );
};
