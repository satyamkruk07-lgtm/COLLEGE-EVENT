"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, getUserRole } from "@/lib/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRole = await getUserRole(currentUser.uid);
        setRole(userRole);
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-black/20 backdrop-blur-lg border-b border-white/10 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6 sm:px-10">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg uppercase tracking-widest text-white">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M4.8 5.6A9 9 0 0 0 4.8 18.4"/>
            <path d="M19.2 5.6a9 9 0 0 1 0 12.8"/>
          </svg>
          Evora
        </Link>

        {/* Center: Dynamic Navigation Links based on Login State */}
        <div className="hidden lg:flex items-center gap-8 font-medium text-[0.75rem] uppercase tracking-widest text-white/80">
          {user && role === "student" && (
            <>
              <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
              <Link href="/dashboard#events" className="hover:text-cyan-400 transition-colors">Upcoming Events</Link>
              <Link href="/dashboard#registrations" className="hover:text-cyan-400 transition-colors">My Registrations</Link>
            </>
          )}
          {user && role === "admin" && (
            <>
              <Link href="/admin-dashboard" className="hover:text-cyan-400 transition-colors">Admin Panel</Link>
            </>
          )}
          {/* If NOT logged in, the user requested to remove Events, Features, Impact, so we show nothing here */}
        </div>

        {/* Right: Actionables */}
        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/login" className="hidden sm:inline-flex bg-white text-black text-[0.75rem] font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-sm hover:bg-cyan-400">
              Access Portal
            </Link>
          ) : (
            <button 
              onClick={handleLogout}
              className="hidden sm:inline-flex bg-transparent border border-white/20 text-white text-[0.75rem] font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-sm hover:bg-white/10"
            >
              Logout
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
