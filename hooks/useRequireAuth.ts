"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/**
 * Hook to handle authentication requirements for protected routes
 * @param redirectTo - Path to redirect to if user is not authenticated
 * @returns Object containing auth state and user session
 */
export function useRequireAuth(redirectTo: string = "/login") {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          // No session found, redirect to login
          router.push(redirectTo);
          return;
        }
        
        setSession(currentSession);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setIsAuthenticated(!!currentSession);
        
        if (!currentSession) {
          // User signed out, redirect to login
          router.push(redirectTo);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  return {
    isLoading,
    isAuthenticated,
    session,
    user: session?.user || null
  };
}
