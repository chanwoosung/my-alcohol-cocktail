'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";

export const QueryClientProviderLayout = ({children}:PropsWithChildren) => {
    const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 60 * 24 * 2,
          gcTime: 1000 * 60 * 60 * 24 * 7,
        },
      },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export default QueryClientProviderLayout