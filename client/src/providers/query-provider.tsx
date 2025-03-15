'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider component to provide React Query functionality to the application.
 * Creates a new QueryClient instance for server-side rendering compatibility.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each render cycle in SSR
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Default query options
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 