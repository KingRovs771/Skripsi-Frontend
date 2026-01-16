'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, FileText, Users, LogOut, Database, MessageCircleQuestionMark, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AdminSidebar() {
  const pathname = usePathname();
  // State untuk mengontrol dropdown Manajemen Basis Pengetahuan
  const [isBasisDataOpen, setIsBasisDataOpen] = useState(false);
  const [isQuestionOpen, setIsQuestion] = useState(false);

  const navItems = [
    { href: '/pakar/home', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/pakar/article', icon: Newspaper, label: 'Manajemen Artikel' },
    { href: '/pakar/typeTes', icon: FileText, label: 'Kategori Tes' },
  ];

  // Data untuk sub-menu Basis Pengetahuan
  const basisDataSubItems = [
    { href: '/pakar/basisdata/penyakit', label: 'Data Penyakit' },
    { href: '/pakar/basisdata/pertanyaan', label: 'Data Pertanyaan' },
    { href: '/pakar/basisdata/aturan', label: 'Aturan (Rules)' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-8 px-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
          <path d="M12 2a5 5 0 0 0-5 5c0 1.84.95 3.5 2.43 4.44a5 5 0 0 0 5.14 0C16.05 10.5 17 8.84 17 7a5 5 0 0 0-5-5z" />
          <path d="M20 10c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.04.2-2.04.57-2.95" />
          <path d="M12 18c-2.67 0-5-1.34-5-3s2.33-3 5-3 5 1.34 5 3-2.33 3-5 3z" />
        </svg>
        <span className="font-bold text-lg">Pakar Panel</span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {/* Menu Biasa */}
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={`flex items-center p-2 rounded-lg transition-colors ${pathname === item.href ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}

          {/* Menu Dropdown: Manajemen Basis Pengetahuan */}
          <li>
            <button
              onClick={() => setIsBasisDataOpen(!isBasisDataOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${pathname.includes('/pakar/basisdata') ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-3" />
                <span>Basis Pengetahuan</span>
              </div>
              {isBasisDataOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Sub-menu Items */}
            {isBasisDataOpen && (
              <ul className="mt-2 ml-8 space-y-1">
                {basisDataSubItems.map((subItem) => (
                  <li key={subItem.label}>
                    <Link href={subItem.href} className={`block p-2 text-sm rounded-md transition-colors ${pathname === subItem.href ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                      {subItem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Menu Tanya Jawab */}
          <li>
            <Link href="/pakar/faq" className={`flex items-center p-2 rounded-lg transition-colors ${pathname === '/pakar/faq' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
              <MessageCircleQuestionMark className="w-5 h-5 mr-3" />
              Tanya Jawab
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

function AdminHeader() {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-end px-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Welcome, Pakar!</span>
        <Button variant="outline" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">{children}</main>
      </div>
    </div>
  );
}
