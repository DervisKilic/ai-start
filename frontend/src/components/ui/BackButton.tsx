import { Link } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  className?: string;
}

export default function BackButton({ to, className = '' }: BackButtonProps) {
  return (
    <Link
      to={to}
      className={`p-2.5 text-dark-300 hover:text-white hover:bg-dark-800/70 backdrop-blur-sm rounded-xl transition-all duration-200 hover:translate-x-[-2px] border border-transparent hover:border-dark-700/50 ${className}`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}

