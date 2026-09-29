import { useState, useCallback } from 'react';
import { Loan, LoanFilters, CreateLoanRequest } from '../types';
import { loanApi } from '../api/endpoints';

interface UseLoanReturn {
  loans: Loan[];
  myLoans: Loan[];
  pendingLoans: Loan[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchLoans: (filters?: LoanFilters) => Promise<void>;
  fetchMyLoans: () => Promise<void>;
  fetchPendingLoans: () => Promise<void>;
  fetchLoanById: (id: string) => Promise<Loan>;
  createLoan: (data: CreateLoanRequest) => Promise<Loan>;
  approveLoan: (id: string, approvedBy: string) => Promise<Loan>;
  rejectLoan: (id: string, approvedBy: string) => Promise<Loan>;
  returnLoan: (id: string) => Promise<Loan>;
  cancelLoan: (id: string) => Promise<Loan>;
  setPage: (page: number) => void;
}

export function useLoan(): UseLoanReturn {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchLoans = useCallback(async (filters?: LoanFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await loanApi.list(params);
      setLoans(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching loans');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchMyLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanApi.myLoans({ page: pagination.page, limit: pagination.limit });
      setMyLoans(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching my loans');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchPendingLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanApi.pendingLoans({ page: pagination.page, limit: pagination.limit });
      setPendingLoans(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching pending loans');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchLoanById = useCallback(async (id: string): Promise<Loan> => {
    setLoading(true);
    setError(null);
    try {
      const result = await loanApi.getById(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoan = useCallback(async (data: CreateLoanRequest): Promise<Loan> => {
    setLoading(true);
    setError(null);
    try {
      const result = await loanApi.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveLoan = useCallback(async (id: string, approvedBy: string): Promise<Loan> => {
    setLoading(true);
    setError(null);
    try {
      const result = await loanApi.approve(id, { approved_by: approvedBy });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectLoan = useCallback(async (id: string, approvedBy: string): Promise<Loan> => {
    setLoading(true);
    setError(null);
    try {
      const result = await loanApi.reject(id, { approved_by: approvedBy });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const returnLoan = useCallback(async (id: string): Promise<Loan> => {
    setLoading(true);
    setError(null);
    try {
      const result = await loanApi.return(id, { loan_id: id });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error returning loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelLoan = useCallback(async (id: string): Promise<Loan> => {
    setLoading(true);
    setError(null);
    try {
      const result = await loanApi.cancel(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelling loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    loans,
    myLoans,
    pendingLoans,
    loading,
    error,
    pagination,
    fetchLoans,
    fetchMyLoans,
    fetchPendingLoans,
    fetchLoanById,
    createLoan,
    approveLoan,
    rejectLoan,
    returnLoan,
    cancelLoan,
    setPage,
  };
}