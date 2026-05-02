import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';


export default function AppQueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5min
        cacheTime: 10 * 60 * 1000, // 10min
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}

    </QueryClientProvider>
  );
}
