import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiErrorResponse } from '@/types/api';

// Default API configuration
const DEFAULT_API_CONFIG: AxiosRequestConfig = {
  baseURL: '/api/v1', // Use the relative URL to go through Next.js proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is crucial to send cookies with requests
};

/**
 * API Client class for making HTTP requests to the backend
 */
class ApiClient {
  private client: AxiosInstance;

  constructor(config: AxiosRequestConfig = {}) {
    this.client = axios.create({
      ...DEFAULT_API_CONFIG,
      ...config,
    });

    // Request interceptor for debugging
    this.client.interceptors.request.use(
      (config) => {
        console.log('Request Headers:', config.headers);
        console.log('Request URL:', config.url);
        console.log('Cookies being sent:', document.cookie);
        // Do not try to manually set cookies, just log them
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          // Handle unauthorized access (session expired, etc.)
          // Redirect to login or handle as needed
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if response status indicates the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.get('/auth/status');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    console.log(response.data);
    
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