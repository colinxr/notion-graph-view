import { useApiQuery, useApiMutation } from './use-api';
import { AxiosError } from 'axios';
import { NotionDatabaseDto, DatabaseSyncResultDto, ApiErrorResponse } from '@/types/api';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';

/**
 * Hook for fetching all databases accessible to the user
 */
export function useDatabases(workspaceId?: string) {
  const addToast = useUIStore((state) => state.addToast);
  const addRecentDatabase = useUserStore((state) => state.addRecentDatabase);

  const queryKey = workspaceId ? `/notion/databases?workspace=${workspaceId}` : '/notion/databases';

  return useApiQuery<NotionDatabaseDto[]>(queryKey, {
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to fetch databases',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for fetching a specific database by ID
 */
export function useDatabase(databaseId: string, options?: { enabled?: boolean }) {
  const addToast = useUIStore((state) => state.addToast);
  const addRecentDatabase = useUserStore((state) => state.addRecentDatabase);

  return useApiQuery<NotionDatabaseDto>(`/notion/databases/${databaseId}`, {
    enabled: options?.enabled !== false && !!databaseId,
    onSuccess: (data: NotionDatabaseDto) => {
      // Add to recent databases
      addRecentDatabase(data.id);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to fetch database',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for syncing a database with Notion
 */
export function useDatabaseSync() {
  const addToast = useUIStore((state) => state.addToast);

  return useApiMutation<DatabaseSyncResultDto, string>(`/notion/databases/:id/sync`, {
    onSuccess: (data: DatabaseSyncResultDto) => {
      addToast({
        type: 'success',
        title: 'Database synced',
        description: data.message,
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to sync database',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for searching databases
 */
export function useSearchDatabases(query: string, options?: { enabled?: boolean }) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiQuery<NotionDatabaseDto[]>(`/notion/databases/search?q=${encodeURIComponent(query)}`, {
    enabled: options?.enabled !== false && !!query && query.length > 2,
    staleTime: 1000 * 60, // 1 minute
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to search databases',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for fetching database properties
 */
export function useDatabaseProperties(databaseId: string, options?: { enabled?: boolean }) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiQuery<Record<string, any>>(`/notion/databases/${databaseId}/properties`, {
    enabled: options?.enabled !== false && !!databaseId,
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to fetch database properties',
        description: error.response?.data?.message || error.message,
      });
    },
  });
} 