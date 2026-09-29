import { AuthUser, Equipment, Loan, PaginatedResponse, Collaborator } from '../types';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(path, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.pathname + url.search;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
      ...options,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async post<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(path, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async put<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(path, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async patch<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(path, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(path, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
      ...options,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();

export const authApi = {
  me: (): Promise<AuthUser> => apiClient.get('/api/auth/me'),
  logout: (): Promise<{ success: boolean }> => apiClient.post('/api/auth/logout'),
  login: () => {
    window.location.href = '/api/auth/azure/login';
  },
};

export const equipmentApi = {
  list: (params?: { page?: number; limit?: number; type?: string; status?: string; search?: string }) =>
    apiClient.get<PaginatedResponse<Equipment>>('/api/equipment', { params }),
  getById: (id: string) => apiClient.get<Equipment>(`/api/equipment/${id}`),
  create: (data: { name: string; type: string; serial_number?: string }) =>
    apiClient.post<Equipment>('/api/equipment', data),
  update: (id: string, data: { name?: string; type?: string; status?: string; serial_number?: string }) =>
    apiClient.patch<Equipment>(`/api/equipment/${id}`, data),
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/equipment/${id}`),
  getTypes: (): Promise<string[]> => apiClient.get('/api/equipment/types'),
};

export const loanApi = {
  list: (params?: { page?: number; limit?: number; status?: string; approval_status?: string }) =>
    apiClient.get<PaginatedResponse<Loan>>('/api/loans', { params }),
  myLoans: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Loan>>('/api/loans/my', { params }),
  pendingLoans: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Loan>>('/api/loans/pending', { params }),
  overdueLoans: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Loan>>('/api/loans/overdue', { params }),
  getById: (id: string) => apiClient.get<Loan>(`/api/loans/${id}`),
  create: (data: { equipment_id: string; due_date?: string }) => apiClient.post<Loan>('/api/loans', data),
  approve: (id: string, data: { approved_by: string }) => apiClient.post<Loan>(`/api/loans/${id}/approve`, data),
  reject: (id: string, data: { approved_by: string }) => apiClient.post<Loan>(`/api/loans/${id}/reject`, data),
  return: (id: string, data: { loan_id: string }) => apiClient.post<Loan>(`/api/loans/${id}/return`, data),
  cancel: (id: string) => apiClient.post<Loan>(`/api/loans/${id}/cancel`),
};

export const collaboratorApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<Collaborator>>('/api/collaborators', { params }),
  getById: (id: string) => apiClient.get<Collaborator>(`/api/collaborators/${id}`),
  me: (): Promise<Collaborator> => apiClient.get('/api/collaborators/me'),
};

export const managerApi = {
  stats: (): Promise<any> => apiClient.get('/api/manager/stats'),
  reportLoans: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<any[]>('/api/manager/reports/loans', { params }),
  exportReport: (format: 'csv' | 'pdf', startDate: string, endDate: string) => {
    const url = `/api/manager/reports/export?format=${format}&start_date=${startDate}&end_date=${endDate}`;
    window.open(url, '_blank');
  },
};

export const auditLogApi = {
  list: (params?: { page?: number; limit?: number; entity_type?: string; entity_id?: string; user_id?: string }) =>
    apiClient.get<PaginatedResponse<any>>('/api/audit-logs', { params }),
  byLoan: (loanId: string): Promise<any[]> => apiClient.get(`/api/audit-logs/loan/${loanId}`),
};
