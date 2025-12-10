import { useState, useRef, useEffect } from 'react';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { LoadingSpinner } from './ui';

export default function BackendStatus() {
  const { isOnline, lastChecked, isLoading, error, checkStatus } = useBackendStatus();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded]);

  const formatLastChecked = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Status Icon Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-2.5 text-dark-300 hover:text-white hover:bg-dark-800/70 backdrop-blur-sm rounded-xl transition-all duration-200 hover:translate-y-[-1px] border border-transparent hover:border-dark-700/50"
        title="Backend Status"
        aria-label="Backend Status"
        aria-expanded={isExpanded}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : isOnline ? (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Expanded Status Details */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-dark-800/90 backdrop-blur-xl border border-dark-700/60 rounded-xl shadow-2xl shadow-dark-950/40 p-5 z-50">
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Backend Status</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkStatus();
                }}
                disabled={isLoading}
                className="text-xs text-warm-400 hover:text-warm-300 disabled:opacity-50 transition-colors duration-200 font-semibold"
              >
                {isLoading ? 'Checking...' : 'Refresh'}
              </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full shadow-lg ${
                  isOnline ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
                }`}
              />
              <span className="text-sm text-dark-200 font-semibold">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Last Checked */}
            {lastChecked && (
              <div className="text-xs text-dark-300 font-medium">
                Last checked: {formatLastChecked(lastChecked)}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-xs text-red-400 font-medium bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            {/* Timestamp */}
            {lastChecked && (
              <div className="text-xs text-dark-400 pt-3 border-t border-dark-700/60">
                {lastChecked.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
