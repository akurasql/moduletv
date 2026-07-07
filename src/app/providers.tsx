"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileProvider } from "@/context/ProfileContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-black min-h-screen text-white" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </QueryClientProvider>
  );
}
export { queryClient };
