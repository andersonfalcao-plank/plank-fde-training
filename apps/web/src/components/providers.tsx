"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

// One retry for a failed query. The TanStack default is 3 retries with
// backoff, so the error state showed only after about 7 seconds.
export const queryClientOptions = {
  defaultOptions: { queries: { retry: 1 } },
};

// The client providers of the app. The root layout uses them.
// Each browser tab gets one QueryClient. On the server, each request gets one.
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
