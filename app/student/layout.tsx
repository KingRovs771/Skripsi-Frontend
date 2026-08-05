'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileCheck, LogOut, FlaskConical, MessageCircleQuestionMark, Menu, X, Loader2, ShieldAlert, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/student/home', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/student/test', icon: FlaskConical, label: 'Test Diagnosis' },
    { href: '/student/history', icon: FileCheck, label: 'History Diagnosis Siswa' },
    { href: '/student/lapor-bully', icon: ShieldAlert, label: 'Laporan Bully' },
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
  const router = useRouter();
  const [userName, setUserName]       = useState('Siswa');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ── Notifikasi ──────────────────────────────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifs, setNotifs]           = useState<Array<{notif_uid:string; title:string; message:string; is_read:boolean; related_uid:string; created_at:string}>>([]);
  const [showNotif, setShowNotif]     = useState(false);
  const notifRef                      = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const res  = await fetchApi('/api/siswa/notifications/unread-count', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) setUnreadCount(json.unread_count || 0);
    } catch { /* silent */ }
  };

  const fetchNotifs = async () => {
    try {
      const res  = await fetchApi('/api/siswa/notifications', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotifs(json.Data || []);
        setUnreadCount(json.unread_count || 0);
      }
    } catch { /* silent */ }
  };

  const markRead = async (notifUID: string) => {
    await fetchApi(`/api/siswa/notifications/${notifUID}/read`, { method: 'POST' });
    setNotifs((prev) => prev.map((n) => n.notif_uid === notifUID ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetchApi('/api/siswa/notifications/read-all', { method: 'POST' });
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Close dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // Fetch profil
    const fetchProfile = async () => {
      try {
        const res = await fetchApi('/api/profileStudents', { method: 'GET' });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.Data && json.Data.nama_lengkap) setUserName(json.Data.nama_lengkap);
      } catch (err) { console.warn('Gagal memuat profil', err); }
    };
    fetchProfile();
    fetchUnread();
    // Polling unread count setiap 60 detik
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    toast.success('Berhasil logout.');
    router.push('/auth/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between lg:justify-end px-4 lg:px-6 shadow-sm z-30 relative">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-50">
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center space-x-2 lg:space-x-3">
        <span className="text-xs lg:text-sm font-semibold text-slate-700 hidden sm:block">Welcome, {userName}!</span>

        {/* Bell Notifikasi */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); if (!showNotif) fetchNotifs(); }}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Notifikasi */}
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-900 text-sm">Notifikasi</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors">
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifs.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-sm">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.notif_uid}
                      onClick={() => {
                        if (!n.is_read) markRead(n.notif_uid);
                        if (n.related_uid) router.push(`/student/lapor-bully/riwayat`);
                        setShowNotif(false);
                      }}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />}
                        <div className={!n.is_read ? '' : 'pl-4'}>
                          <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" size="sm" className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">
          {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
          Logout
        </Button>
        <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" size="icon" className="sm:hidden border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">
          {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
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
