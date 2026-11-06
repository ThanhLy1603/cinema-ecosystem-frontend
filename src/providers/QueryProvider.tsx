import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactElement, type ReactNode } from "react";

interface QueryProviderProps {
   children: ReactNode;
}

function createQueryClient(): QueryClient {
   return new QueryClient({
      defaultOptions: {
         queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
         },
      },
   });
}

export function QueryProvider({ children }: QueryProviderProps): ReactElement {
   const [queryClient] = useState<QueryClient>(createQueryClient);

   return (
      <QueryClientProvider client={queryClient}>
         {children}
         {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
   );
}

export default QueryProvider;
