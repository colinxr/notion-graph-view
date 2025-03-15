import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosRequestConfig } from 'axios';
import apiClient from '@/lib/api-client';
import { ApiErrorResponse } from '@/types/api';

// Type for query options excluding the queryKey and queryFn which we manage internally
export type UseApiQueryOptions<TData, TError> = Omit<
  UseQueryOptions<TData, AxiosError<TError>, TData, string[]>,
  'queryKey' | 'queryFn'
>;

// Type for useApiMutation options
type UseApiMutationOptions<TData, TVariables, TError> = Omit<
  UseMutationOptions<TData, AxiosError<TError>, TVariables, unknown>,
  'mutationFn'
>;

/**
 * Custom hook for making API GET requests with React Query
 */
export function useApiQuery<TData = unknown, TError = ApiErrorResponse>(
  url: string,
  options?: {
    config?: AxiosRequestConfig;
    enabled?: boolean;
    onError?: (error: AxiosError<TError>) => void;
    onSuccess?: (data: TData) => void;
    staleTime?: number;
  } & UseApiQueryOptions<TData, TError>
) {
  const { config, enabled = true, ...queryOptions } = options || {};
  
  return useQuery<TData, AxiosError<TError>, TData, string[]>({
    queryKey: [url, JSON.stringify(config?.params || {})],
    queryFn: async () => apiClient.get<TData>(url, config),
    enabled,
    ...queryOptions,
  });
}

/**
 * Custom hook for making API POST requests with React Query
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiErrorResponse>(
  url: string,
  options?: {
    config?: AxiosRequestConfig;
  } & UseApiMutationOptions<TData, TVariables, TError>
) {
  const { config, ...mutationOptions } = options || {};
  
  return useMutation<TData, AxiosError<TError>, TVariables>({
    mutationFn: (data) => apiClient.post<TData>(url, data, config),
    ...mutationOptions,
  });
}

/**
 * Custom hook for making API PUT requests with React Query
 */
export function useApiPutMutation<TData = unknown, TVariables = unknown, TError = ApiErrorResponse>(
  url: string,
  options?: {
    config?: AxiosRequestConfig;
  } & UseApiMutationOptions<TData, TVariables, TError>
) {
  const { config, ...mutationOptions } = options || {};
  
  return useMutation<TData, AxiosError<TError>, TVariables>({
    mutationFn: (data) => apiClient.put<TData>(url, data, config),
    ...mutationOptions,
  });
}

/**
 * Custom hook for making API PATCH requests with React Query
 */
export function useApiPatchMutation<TData = unknown, TVariables = unknown, TError = ApiErrorResponse>(
  url: string,
  options?: {
    config?: AxiosRequestConfig;
  } & UseApiMutationOptions<TData, TVariables, TError>
) {
  const { config, ...mutationOptions } = options || {};
  
  return useMutation<TData, AxiosError<TError>, TVariables>({
    mutationFn: (data) => apiClient.patch<TData>(url, data, config),
    ...mutationOptions,
  });
}

/**
 * Custom hook for making API DELETE requests with React Query
 */
export function useApiDeleteMutation<TData = unknown, TError = ApiErrorResponse>(
  url: string,
  options?: {
    config?: AxiosRequestConfig;
  } & UseApiMutationOptions<TData, void, TError>
) {
  const { config, ...mutationOptions } = options || {};
  
  return useMutation<TData, AxiosError<TError>, void>({
    mutationFn: () => apiClient.delete<TData>(url, config),
    ...mutationOptions,
  });
}

/**
 * Helper function to create dynamic endpoint URLs with parameters
 */
export function createEndpoint(baseUrl: string, params: Record<string, string | number>): string {
  let endpoint = baseUrl;
  Object.entries(params).forEach(([key, value]) => {
    endpoint = endpoint.replace(`:${key}`, String(value));
  });
  return endpoint;
} 