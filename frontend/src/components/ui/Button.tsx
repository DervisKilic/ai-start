import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-[3px] focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-warm-500 to-warm-600 hover:from-warm-400 hover:to-warm-500 text-white shadow-lg shadow-warm-500/30 hover:shadow-xl hover:shadow-warm-500/40 focus:ring-warm-500/50 hover:translate-y-[-2px] active:translate-y-0 backdrop-blur-sm',
    secondary:
      'bg-dark-700/80 backdrop-blur-sm hover:bg-dark-600/90 text-white border border-dark-600/60 focus:ring-dark-500/50 hover:translate-y-[-1px] shadow-md shadow-dark-950/20',
    danger:
      'bg-red-500/15 backdrop-blur-sm hover:bg-red-500/25 text-red-400 border border-red-500/30 focus:ring-red-500/50 hover:translate-y-[-1px] shadow-md shadow-red-950/20',
    ghost:
      'hover:bg-dark-800/70 backdrop-blur-sm text-dark-300 hover:text-white focus:ring-dark-500/50 hover:translate-y-[-1px]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

