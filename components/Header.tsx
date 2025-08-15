"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Cosmic Event Tracker
        </Link>

        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/" 
                className={`hover:underline ${pathname === "/" ? "font-bold" : ""}`}
              >
                Home
              </Link>
            </li>
            {!loading && (
              <>
                {user ? (
                  <li>
                    <button 
                      onClick={handleSignOut}
                      className="hover:underline"
                    >
                      Sign Out
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link 
                      href="/login" 
                      className={`hover:underline ${pathname === "/login" ? "font-bold" : ""}`}
                    >
                      Sign In
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
