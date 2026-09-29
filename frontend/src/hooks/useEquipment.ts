import { useState, useCallback } from 'react';
import { Equipment, EquipmentFilters, CreateEquipmentRequest, UpdateEquipmentRequest } from '../types';
import { equipmentApi } from '../api/endpoints';

interface UseEquipmentReturn {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: EquipmentFilters;
  fetchEquipment: (filters?: EquipmentFilters) => Promise<void>;
  fetchEquipmentById: (id: string) => Promise<Equipment>;
  createEquipment: (data: CreateEquipmentRequest) => Promise<Equipment>;
  updateEquipment: (id: string, data: UpdateEquipmentRequest) => Promise<Equipment>;
  deleteEquipment: (id: string) => Promise<void>;
  setFilters: (filters: EquipmentFilters) => void;
  setPage: (page: number) => void;
}

export function useEquipment(): UseEquipmentReturn {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState<EquipmentFilters>({});

  const fetchEquipment = useCallback(async (newFilters?: EquipmentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = newFilters ?? filters;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...activeFilters,
      };
      const response = await equipmentApi.list(params);
      setEquipment(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
      if (newFilters) {
        setFiltersState(newFilters);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching equipment');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchEquipmentById = useCallback(async (id: string): Promise<Equipment> => {
    setLoading(true);
    setError(null);
    try {
      const result = await equipmentApi.getById(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching equipment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEquipment = useCallback(async (data: CreateEquipmentRequest): Promise<Equipment> => {
    setLoading(true);
    setError(null);
    try {
      const result = await equipmentApi.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating equipment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEquipment = useCallback(async (id: string, data: UpdateEquipmentRequest): Promise<Equipment> => {
    setLoading(true);
    setError(null);
    try {
      const result = await equipmentApi.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating equipment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEquipment = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await equipmentApi.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting equipment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setFilters = useCallback((newFilters: EquipmentFilters) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    equipment,
    loading,
    error,
    pagination,
    filters,
    fetchEquipment,
    fetchEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    setFilters,
    setPage,
  };
}
