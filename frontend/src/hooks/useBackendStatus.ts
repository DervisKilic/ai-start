import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '../api/health';

export interface BackendStatus {
  isOnline: boolean;
  lastChecked: Date | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to check backend status
 * Checks on mount and provides manual refresh function
 * Does not poll automatically - checks on demand
 */
export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    isOnline: false,
    lastChecked: null,
    isLoading: true,
    error: null,
  });

  const checkStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await checkBackendHealth();
      
      setStatus({
        isOnline: true,
        lastChecked: new Date(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Error handling is done in checkBackendHealth, just pass it through
      setStatus({
        isOnline: false,
        lastChecked: new Date(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Backend unavailable',
      });
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    ...status,
    checkStatus,
  };
}
