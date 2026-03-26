'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileCheck, LogOut, FlaskConical, MessageCircleQuestionMark, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/student/home', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/student/test', icon: FlaskConical, label: 'Test Diagnosis' },
    { href: '/student/history', icon: FileCheck, label: 'History Diagnosis Siswa' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`w-64 bg-white border-r border-slate-200 p-4 flex flex-col fixed inset-y-0 left-0 z-50 lg:static transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
              <path d="M12 2a5 5 0 0 0-5 5c0 1.84.95 3.5 2.43 4.44a5 5 0 0 0 5.14 0C16.05 10.5 17 8.84 17 7a5 5 0 0 0-5-5z" />
              <path d="M20 10c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.04.2-2.04.57-2.95" />
              <path d="M12 18c-2.67 0-5-1.34-5-3s2.33-3 5-3 5 1.34 5 3-2.33 3-5 3z" />
            </svg>
            <span className="font-bold text-lg text-slate-900">Students Panel</span>
          </div>
          <button className="lg:hidden text-slate-500 hover:text-slate-900" onClick={() => setIsOpen(false)}>
             <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {/* Menu Biasa */}
            {navItems.map((item) => (
              <li key={item.label}>
                <Link 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-all font-medium ${pathname === item.href ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${pathname === item.href ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Menu Tanya Jawab FAQ */}
            <li className="pt-2 mt-2 border-t border-slate-100">
              <Link 
                href="/student/faq" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center p-3 rounded-xl transition-all font-medium ${pathname === '/student/faq' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
              >
                <MessageCircleQuestionMark className={`w-5 h-5 mr-3 ${pathname === '/student/faq' ? 'text-white' : 'text-slate-400'}`} />
                Tanya Jawab
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between lg:justify-end px-4 lg:px-6 shadow-sm z-30 relative">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-50">
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center space-x-3 lg:space-x-4">
        <span className="text-xs lg:text-sm font-semibold text-slate-700 hidden sm:block">Welcome, Students!</span>
        <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-slate-50">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
        {/* Tombol icon log out minimalis utuk mobile yg super sempit */}
        <Button variant="outline" size="icon" className="sm:hidden border-slate-200 text-slate-600">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Mode Fullscreen khusus kuis / ujian
  if (pathname === '/student/test/quiz') {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Main Content dibungkus rapi dengan auto-scroll dan padding disesuaikan untuk layar kecil */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
