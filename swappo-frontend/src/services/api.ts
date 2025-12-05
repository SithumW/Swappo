import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';
import { config } from '@/config/env';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.endpoint,
      timeout: 10000,
      withCredentials: true, // Enable cookies for Better Auth
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Session management for Better Auth (cookie-based)
  clearUserData() {
    localStorage.removeItem('auth_user');
    console.log('[API] User data cleared from localStorage');
  }

  saveUserData(user: any) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    console.log('[API] User data saved to localStorage');
  }

  getUserData() {
    const userData = localStorage.getItem('auth_user');
    return userData ? JSON.parse(userData) : null;
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        // Better Auth uses cookies, no need to check Authorization header
        console.log('[API] Request with credentials (cookies)');
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`[API] Response:`, response.data);
        return response;
      },
      (error: AxiosError<ApiError>) => {
        console.error('[API] Response error:', error.response?.data || error.message);
        
        // Handle common errors
        if (error.response?.status === 401) {
          // Unauthorized - session expired, clear user data
          console.log('[API] Unauthorized - clearing user data');
          this.clearUserData();
          // Don't automatically redirect here - let the app handle routing
          // window.location.href = '/auth';
        } else if (error.response?.status >= 500) {
          console.error('[API] Server error - please try again later');
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // Special method for Better-Auth endpoints that return data directly
  async postAuth<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, {
      ...config,
      withCredentials: true, // Ensure cookies are sent
    });
    return response.data;
  }

  // Session-related methods for Better Auth
  async getSession(): Promise<any> {
    try {
      const response = await this.client.get('/auth/session');
      return response.data;
    } catch (error) {
      console.log('[API] No valid session found');
      return null;
    }
  }

  // File upload method
  async uploadFile<T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get the raw client for custom requests
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
