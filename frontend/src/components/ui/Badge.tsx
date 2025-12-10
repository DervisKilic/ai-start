import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'warm';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-dark-700/80 backdrop-blur-sm text-dark-200 border border-dark-600/50',
    warm: 'bg-warm-500/15 backdrop-blur-sm text-warm-400 border border-warm-500/30 shadow-md shadow-warm-950/20',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

