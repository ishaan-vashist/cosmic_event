"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut, Menu, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-950 to-indigo-950 text-white shadow-lg backdrop-blur-sm bg-opacity-90">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="stars-sm"></div>
      </div>
      <div className="container mx-auto py-3 px-4 relative z-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Star className="w-5 h-5 md:w-6 md:h-6 text-blue-300 group-hover:text-blue-200 transition-colors" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
              Cosmic Event Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              <li>
                <Link 
                  href="/" 
                  className={`transition-all duration-200 hover:text-blue-300 relative group ${pathname === "/" ? "text-blue-300 font-medium" : ""}`}
                >
                  <span>Home</span>
                  {pathname === "/" && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></span>}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 rounded-full group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              {!loading && (
                <>
                  {user ? (
                    <>
                      <li>
                        <Link 
                          href="/feed" 
                          className={`transition-all duration-200 hover:text-blue-300 relative group ${pathname === "/feed" ? "text-blue-300 font-medium" : ""}`}
                        >
                          <span>Feed</span>
                          {pathname === "/feed" && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></span>}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 rounded-full group-hover:w-full transition-all duration-300"></span>
                        </Link>
                      </li>
                      <li>
                        <Button 
                          onClick={handleSignOut}
                          variant="ghost"
                          className="text-white hover:text-blue-300 hover:bg-blue-900/50 flex items-center gap-1 border border-transparent hover:border-blue-500/20"
                          size="sm"
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Logout
                        </Button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Button asChild variant="secondary" size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-none shadow-md hover:shadow-blue-500/30">
                        <Link href="/login">
                          Login
                        </Link>
                      </Button>
                    </li>
                  )}
                </>
              )}
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none bg-blue-900/30 p-2 rounded-md border border-blue-800/30 hover:bg-blue-800/40 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 animate-fade-in-down">
            <div className="bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-800/30 p-4">
              <ul className="flex flex-col space-y-4">
                <li>
                  <Link 
                    href="/" 
                    className={`block transition-all duration-200 hover:text-blue-300 px-3 py-2 rounded-md ${pathname === "/" ? "bg-blue-900/30 text-blue-300 font-medium" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <li>
                          <Link 
                            href="/feed" 
                            className={`block transition-all duration-200 hover:text-blue-300 px-3 py-2 rounded-md ${pathname === "/feed" ? "bg-blue-900/30 text-blue-300 font-medium" : ""}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Feed
                          </Link>
                        </li>
                        <li>
                          <button 
                            onClick={() => {
                              handleSignOut();
                              setMobileMenuOpen(false);
                            }}
                            className="flex items-center w-full text-white hover:text-blue-300 px-3 py-2 rounded-md hover:bg-blue-900/30 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Button asChild variant="secondary" size="sm" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-none shadow-md hover:shadow-blue-500/30">
                          <Link 
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Login
                          </Link>
                        </Button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
