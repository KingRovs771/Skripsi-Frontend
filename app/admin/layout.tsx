"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Users,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function AdminSidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/artikel", icon: Newspaper, label: "Manajemen Artikel" },
    { href: "/admin/tes", icon: FileText, label: "Manajemen Tes" },
    { href: "/admin/pengguna", icon: Users, label: "Manajemen Pengguna" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-8 px-2">
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
        <span className="font-bold text-lg">Admin Panel</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function AdminHeader() {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-end px-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Welcome, Admin!</span>
        <Button variant="outline" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
