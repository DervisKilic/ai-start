import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`p-10 text-center ${className}`}>
      <div className="w-20 h-20 mx-auto rounded-full bg-dark-800/60 backdrop-blur-sm flex items-center justify-center mb-5 border border-dark-700/50 shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-dark-300 text-sm mb-6 font-medium">{message}</p>
      {action && action}
    </div>
  );
}

