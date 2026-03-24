'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // Do not retry 401 Unauthorized – the response interceptor in api.ts
        // already handles it by clearing auth and redirecting to /login.
        // Retrying would fire the interceptor twice and delay the redirect.
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 401) return false;
          return failureCount < 1;
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
