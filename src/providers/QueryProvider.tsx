import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
   children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  retry: 1,
                  refetchOnWindowFocus: false,
                  staleTime: 1000 * 60 * 5, // 5 minutes
               },
            },
         }),
   );

   return (
      <QueryClientProvider client={queryClient}>
         {children}
         {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
   );
}

export default QueryProvider;
