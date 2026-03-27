'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Newspaper, FileText, Users, LogOut, School, ShieldCheck, ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

function AdminSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isUserOpen, setIsUserOpen] = useState(pathname.includes('/admin/users'));

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/profile', icon: Users, label: 'Profile' },
    { href: '/admin/sekolah', icon: School, label: 'Manajemen Sekolah' },
    { href: '/admin/article', icon: Newspaper, label: 'Manajemen Artikel' },
    { href: '/admin/tes', icon: FileText, label: 'Monitoring Tes' },
  ];

  const userSubItems = [
    { href: '/admin/users/students', label: 'Data Siswa' },
    { href: '/admin/users/teachers', label: 'Data Guru BK' },
    { href: '/admin/users/pakar', label: 'Data Pakar' },
  ];

  return (
    <>
      {/* Overlay untuk mobile / tablet saat sidebar terbuka */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-4 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between space-x-2 mb-8 px-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
              <path d="M12 2a5 5 0 0 0-5 5c0 1.84.95 3.5 2.43 4.44a5 5 0 0 0 5.14 0C16.05 10.5 17 8.84 17 7a5 5 0 0 0-5-5z" />
              <path d="M20 10c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.04.2-2.04.57-2.95" />
              <path d="M12 18c-2.67 0-5-1.34-5-3s2.33-3 5-3 5 1.34 5 3-2.33 3-5 3z" />
            </svg>
            <span className="font-bold text-lg text-slate-900">Admin Panel</span>
          </div>
          {/* Tombol Close untuk mobile */}
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
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

            {/* Dropdown Manajemen Pengguna */}
            <li>
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-medium text-left ${pathname.includes('/admin/users') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <div className="flex items-center">
                  <Users className={`w-5 h-5 mr-3 shrink-0 ${pathname.includes('/admin/users') ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>Manajemen Pengguna</span>
                </div>
                {isUserOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
              </button>
              {isUserOpen && (
                <ul className="mt-2 ml-8 space-y-1">
                  {userSubItems.map((sub) => (
                    <li key={sub.label}>
                      <Link
                        href={sub.href}
                        onClick={() => setIsOpen(false)}
                        className={`block text-left p-2 text-sm rounded-md transition-colors ${pathname === sub.href ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Menu Hak Akses / Role */}
            <li>
              <Link
                href="/admin/role"
                onClick={() => setIsOpen(false)}
                className={`flex items-center p-3 rounded-xl transition-all font-medium ${pathname.includes('/admin/role') ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
              >
                <ShieldCheck className={`w-5 h-5 mr-3 ${pathname.includes('/admin/role') ? 'text-white' : 'text-slate-400'}`} />
                Manajemen Role
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetchApi('/auth/logoutAdmin', { method: 'POST' }).catch((err) => {
        console.warn('Gagal memanggil API logout backend, lanjut hapus sesi lokal.', err);
      });

      localStorage.removeItem('token');
      toast.success('Berhasil logout.');
      router.push('/auth/login/admin');
    } catch (error) {
      toast.error('Terjadi kesalahan saat logout.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-6 shadow-sm z-30 relative shrink-0">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-50 transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center space-x-3 lg:space-x-4 ml-auto">
        <span className="text-xs lg:text-sm font-semibold text-slate-700 hidden sm:block">Welcome, Admin!</span>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-slate-50">
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? 'Keluar...' : 'Logout'}
        </Button>
        <Button variant="outline" size="icon" onClick={handleLogout} disabled={isLoggingOut} className="sm:hidden border-slate-200 text-slate-600">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Akses ditolak. Silakan login terlebih dahulu.', { id: 'auth-error' });
      router.push('/auth/login/admin');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Memverifikasi Sesi Akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
