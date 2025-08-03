"use client";
import React from "react";
import Link from "next/link";
import { Home, Newspaper, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Menggunakan alias path

export default function Navbar() {
  const isLoggedIn = false; // Ganti dengan state autentikasi asli

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            {/* Ganti dengan SVG atau komponen Logo Anda */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-900"
            >
              <path d="M12 2a5 5 0 0 0-5 5c0 1.84.95 3.5 2.43 4.44a5 5 0 0 0 5.14 0C16.05 10.5 17 8.84 17 7a5 5 0 0 0-5-5z" />
              <path d="M20 10c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.04.2-2.04.57-2.95" />
              <path d="M12 18c-2.67 0-5-1.34-5-3s2.33-3 5-3 5 1.34 5 3-2.33 3-5 3z" />
            </svg>
            <span className="font-bold text-lg">MentalCare</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="link" asChild>
              <Link href="/public">
                <Home className="w-4 h-4 mr-2" />
                Beranda
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="/public/article">
                <Newspaper className="w-4 h-4 mr-2" />
                Artikel
              </Link>
            </Button>
          </nav>
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <Button>Logout</Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
