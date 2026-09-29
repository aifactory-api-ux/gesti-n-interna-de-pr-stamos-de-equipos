import { useState, useCallback } from 'react';
import { ManagerStats } from '../types';
import { managerApi } from '../api/endpoints';

interface UseManagerReturn {
  stats: ManagerStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  exportReport: (format: 'csv' | 'pdf', startDate: string, endDate: string) => Promise<void>;
}

export function useManager(): UseManagerReturn {
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await managerApi.stats();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching manager stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'pdf', startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      managerApi.exportReport(format, startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error exporting report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
    exportReport,
  };
}