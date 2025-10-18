"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingThemeToggle } from "@/components/ui/floating-theme-toggle";
import { api } from "@/trpc/react";
import { logger } from "@/lib/logger";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Middleware already handles authentication, just get user data
  const { data: user, isLoading: userLoading, error: userError } = api.user.getCurrentUser.useQuery(
    undefined,
    {
      retry: false,
    }
  );

  // Check if user has businesses and redirect to create-business if they don't
  useEffect(() => {
    if (user && !userLoading) {
      const businessCount = user.counts?.businesses || 0;

      // Only redirect if user has no businesses and is not already on the create-business or business page
      if (businessCount === 0 && pathname !== '/create-business' && pathname !== '/business') {
        router.push('/create-business');
      }
    }
  }, [user, userLoading, pathname, router]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userError) {
    logger.error("Error fetching current user:", userError);
    // DEBUG MODE: Show error instead of redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error (Debug Mode)</h2>
          <pre className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(userError, null, 2)}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">
            Check browser console and cookies in DevTools
          </p>
        </div>
      </div>
    );
  }

  // Show floating toggle only on dashboard and settings pages
  const showFloatingToggle = pathname === '/dashboard' || pathname === '/settings';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar
        className="hidden md:flex"
        onCollapseChange={setIsSidebarCollapsed}
      />
      <main className={`pt-20 md:pt-24 pb-20 md:pb-8 ${
        isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
      }`}>
        <div className="px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <BottomNav className="md:hidden" />
      {showFloatingToggle && <FloatingThemeToggle />}
    </div>
  );
}
