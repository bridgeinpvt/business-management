"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      // Redirect authenticated users directly to dashboard
      router.replace("/dashboard");
    } else {
      // Redirect unauthenticated users to auth-service login
      window.location.href = `http://localhost:3001/login?callbackUrl=${encodeURIComponent('http://localhost:3004/dashboard')}`;
    }
  }, [status, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
