import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthTokens, ApiError } from '../types';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private axiosInstance: AxiosInstance;
  private tokens: AuthTokens | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.tokens?.access_token) {
          config.headers.Authorization = `Bearer ${this.tokens.access_token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearTokens();
          window.location.href = '/login';
        }
        
        const apiError: ApiError = {
          message: error.response?.data?.detail || error.message || 'An unexpected error occurred',
          status: error.response?.status || 500,
          detail: error.response?.data?.detail
        };
        
        return Promise.reject(apiError);
      }
    );

    // Load tokens from localStorage on initialization
    this.loadTokens();
  }

  // Token management
  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    localStorage.setItem('crm_tokens', JSON.stringify(tokens));
  }

  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  clearTokens(): void {
    this.tokens = null;
    localStorage.removeItem('crm_tokens');
  }

  private loadTokens(): void {
    const stored = localStorage.getItem('crm_tokens');
    if (stored) {
      try {
        this.tokens = JSON.parse(stored);
      } catch {
        this.clearTokens();
      }
    }
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.get('/health');
  }

  // Services health check
  async servicesHealthCheck(): Promise<any> {
    return this.get('/health/services');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;