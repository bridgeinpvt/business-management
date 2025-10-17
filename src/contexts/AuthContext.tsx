"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";

type User = RouterOutputs["user"]["getCurrentUser"];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = api.user.getCurrentUser.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to replace useSession
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  // Return in NextAuth session format for compatibility
  return {
    data: context.user ? { user: context.user } : null,
    status: context.isLoading ? "loading" : context.user ? "authenticated" : "unauthenticated",
  };
}

// Logout function to replace signOut from next-auth
export function signOut() {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001";
  const businessUrl = process.env.NEXT_PUBLIC_BUSINESS_URL || "http://localhost:3004";
  // Clear cookies and redirect to auth-service logout
  window.location.href = `${authUrl}/api/auth/signout?callbackUrl=${encodeURIComponent(businessUrl)}`;
}

export { AuthContext };
