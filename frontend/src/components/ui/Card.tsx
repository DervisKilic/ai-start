import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-dark-900/60 backdrop-blur-xl border border-dark-700/50 rounded-xl shadow-xl shadow-dark-950/20 hover:shadow-2xl hover:shadow-dark-950/30 transition-all duration-300 ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

