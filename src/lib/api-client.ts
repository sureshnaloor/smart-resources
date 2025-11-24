import type { ApiResponse } from './models';

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'An error occurred',
                };
            }

            return {
                success: true,
                data: data.data || data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    // Generic CRUD methods
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();

// Specific API methods for each resource type
export const employeesApi = {
    getAll: (filters?: Record<string, string>) => {
        const params = new URLSearchParams(filters);
        return apiClient.get(`/api/employees?${params}`);
    },
    getById: (id: string) => apiClient.get(`/api/employees/${id}`),
    create: (data: any) => apiClient.post('/api/employees', data),
    update: (id: string, data: any) => apiClient.put(`/api/employees/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/employees/${id}`),
};

export const equipmentApi = {
    getAll: (filters?: Record<string, string>) => {
        const params = new URLSearchParams(filters);
        return apiClient.get(`/api/equipment?${params}`);
    },
    getById: (id: string) => apiClient.get(`/api/equipment/${id}`),
    create: (data: any) => apiClient.post('/api/equipment', data),
    update: (id: string, data: any) => apiClient.put(`/api/equipment/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/equipment/${id}`),
};

export const projectsApi = {
    getAll: (filters?: Record<string, string>) => {
        const params = new URLSearchParams(filters);
        return apiClient.get(`/api/projects?${params}`);
    },
    getById: (id: string) => apiClient.get(`/api/projects/${id}`),
    create: (data: any) => apiClient.post('/api/projects', data),
    update: (id: string, data: any) => apiClient.put(`/api/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/projects/${id}`),
};

export const businessCentersApi = {
    getAll: () => apiClient.get('/api/business-centers'),
    getById: (id: string) => apiClient.get(`/api/business-centers/${id}`),
    create: (data: any) => apiClient.post('/api/business-centers', data),
    update: (id: string, data: any) => apiClient.put(`/api/business-centers/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/business-centers/${id}`),
};

export const resourceGroupsApi = {
    getAll: (filters?: Record<string, string>) => {
        const params = new URLSearchParams(filters);
        return apiClient.get(`/api/resource-groups?${params}`);
    },
    getById: (id: string) => apiClient.get(`/api/resource-groups/${id}`),
    create: (data: any) => apiClient.post('/api/resource-groups', data),
    update: (id: string, data: any) => apiClient.put(`/api/resource-groups/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/resource-groups/${id}`),
};
