'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Newspaper, FileText, LogOut, Database, MessageCircleQuestionMark, ChevronDown, ChevronRight, Menu, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { isLoggedIn, getUserRole } from '@/lib/auth';

function PakarSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  // State untuk mengontrol dropdown Manajemen Basis Pengetahuan
  const [isBasisDataOpen, setIsBasisDataOpen] = useState(pathname.includes('/pakar/basisdata'));

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
            <span className="font-bold text-lg text-slate-900">Pakar Panel</span>
          </div>
          <button className="lg:hidden text-slate-500 hover:text-slate-900" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">

            {/* Navigasi Utama */}
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-all font-medium ${(!pathname.includes('/pakar/basisdata') && !pathname.includes('/pakar/faq') && pathname === item.href)
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${pathname === item.href ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Menu Dropdown: Manajemen Basis Pengetahuan */}
            <li>
              <button
                onClick={() => setIsBasisDataOpen(!isBasisDataOpen)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all font-medium ${pathname.includes('/pakar/basisdata') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <div className="flex items-center">
                  <Database className={`w-5 h-5 mr-3 shrink-0 ${pathname.includes('/pakar/basisdata') ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>Basis Pengetahuan</span>
                </div>
                {isBasisDataOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
              </button>

              {/* Sub-menu Items */}
              {isBasisDataOpen && (
                <ul className="mt-2 ml-8 space-y-1">
                  {basisDataSubItems.map((subItem) => (
                    <li key={subItem.label}>
                      <Link
                        href={subItem.href}
                        onClick={() => setIsOpen(false)}
                        className={`block text-left p-2 text-sm rounded-md transition-colors ${pathname === subItem.href ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Menu Tanya Jawab FAQ */}
            <li className="pt-2 mt-2 border-t border-slate-100">
              <Link
                href="/pakar/faq"
                onClick={() => setIsOpen(false)}
                className={`flex items-center p-3 rounded-xl transition-all font-medium ${pathname.includes('/pakar/faq') ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
              >
                <MessageCircleQuestionMark className={`w-5 h-5 mr-3 ${pathname.includes('/pakar/faq') ? 'text-white' : 'text-slate-400'}`} />
                Tanya Jawab
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

function PakarHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState('Pakar');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchApi('/api/profilePakars', { method: 'GET' });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.Data && json.Data.nama_lengkap) {
          setUserName(json.Data.nama_lengkap);
        }
      } catch (err) {
        console.warn('Gagal memuat profil', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Panggil endpoint backend
      await fetchApi('/auth/logout', { method: 'POST' }).catch(() => { });
    } finally {
      // Pastikan membersihkan localStorage baik request berhasil ato error timeout internet
      localStorage.removeItem('token');
      setIsLoggingOut(false);
      toast.success('Berhasil logout dari sistem');
      router.push('/auth/login');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between lg:justify-end px-4 lg:px-6 shadow-sm z-30 relative">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-50 transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center space-x-3 lg:space-x-4">
        <span className="text-xs lg:text-sm font-semibold text-slate-700 hidden sm:block">Welcome, {userName}!</span>
        <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" size="sm" className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
          Keluar Sesi
        </Button>
        {/* Tombol log out minimalis utuk mobile yg super sempit */}
        <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" size="icon" className="sm:hidden border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  );
}

export default function PakarLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Blokir Akses Jika Belum Login
    if (!isLoggedIn()) {
      toast.error('Akses terlarang. Anda harus login sebagai Pakar terlebih dahulu.', { id: 'unauthorized-pakar' });
      router.push('/auth/login/pakar');
      return;
    }

    // Blokir Akses Jika Bukan Pakar
    const role = getUserRole();
    if (role !== 'pakar') {
      toast.error('Akses ditolak. Layar ini khusus Akun Pakar.', { id: 'forbidden-pakar' });
      router.push('/auth/login/pakar');
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  // Loading Screen mencegah flashing sekejap sblm router action redirect jalan sepenuhnya
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <PakarSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <PakarHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content dibungkus rapi dengan auto-scroll dan padding disesuaikan untuk layar kecil */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
