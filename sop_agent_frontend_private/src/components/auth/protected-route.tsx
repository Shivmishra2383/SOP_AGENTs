"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview A wrapper component that redirects unauthenticated users to the login page.
 * Implements a mounting check to eliminate server/client hydration mismatches.
 */

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, token, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect logic only runs on the client once initialization is complete
    if (mounted && !loading && !user && !token) {
      router.push("/login");
    }
  }, [user, token, loading, router, mounted]);

  // Show a unified loading state during hydration or auth verification
  if (!mounted || loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Securing your session...
        </p>
      </div>
    );
  }

  // If we aren't loading and have no user, don't render children to prevent flicker
  if (!user && !token) return null;

  return <>{children}</>;
}
