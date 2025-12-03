import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Configure TanStack Query with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Public data (medical terms, categories) - cache for longer since it rarely changes
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus for static data
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: 2, // Retry failed requests twice
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
