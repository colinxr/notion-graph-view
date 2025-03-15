import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiErrorResponse } from '@/types/api';

// Default API configuration
const DEFAULT_API_CONFIG: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API Client class for making HTTP requests to the backend
 */
class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: AxiosRequestConfig = {}) {
    this.client = axios.create({
      ...DEFAULT_API_CONFIG,
      ...config,
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access (token expired, etc.)
          this.clearAuthToken();
          // Redirect to login or handle as needed
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
        }
        return Promise.reject(error);
      }
    );

    // Initialize token from localStorage if in browser
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        this.setAuthToken(savedToken);
      }
    }
  }

  /**
   * Set the authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Clear the authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Check if user is authenticated (has a token)
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

export default apiClient; 