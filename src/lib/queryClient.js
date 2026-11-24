import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute: data considered fresh, instant 0ms renders
      gcTime: 1000 * 60 * 10, // 10 minutes: inactive queries kept in memory then garbage collected
      refetchOnWindowFocus: true, // auto-revalidate in background when returning to tab
      retry: 1, // 1 retry on network failures
    },
  },
});
