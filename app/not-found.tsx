'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, ArrowLeft } from 'lucide-react';

// SVG logo sesuai favicon aplikasi (app/icon.svg)
function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2a5 5 0 0 0-5 5c0 1.84.95 3.5 2.43 4.44a5 5 0 0 0 5.14 0C16.05 10.5 17 8.84 17 7a5 5 0 0 0-5-5z" />
      <path d="M20 10c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.04.2-2.04.57-2.95" />
      <path d="M12 18c-2.67 0-5-1.34-5-3s2.33-3 5-3 5 1.34 5 3-2.33 3-5 3z" />
    </svg>
  );
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div
        className={`w-full max-w-md transition-all duration-500 space-y-3 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* ── Kotak 1: Pesan utama 404 ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/20">
              <AppLogo className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Error label + heading */}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Error 404
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            Halaman Tidak<br />Ditemukan
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
            Halaman yang Anda cari tidak ada, sudah dipindahkan,
            atau Anda tidak memiliki akses ke sana.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95 flex-1 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all duration-200 active:scale-95 shadow-md shadow-slate-900/20 flex-1"
            >
              <Home className="w-4 h-4" />
              Beranda
            </Link>
          </div>
        </div>

        {/* ── Kotak 2: Quick links ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
            Halaman yang Sering Dikunjungi
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Login Siswa',   href: '/auth/login',        desc: 'Masuk sebagai siswa' },
              { label: 'Login Guru BK', href: '/auth/login/gurubk', desc: 'Panel Guru BK' },
              { label: 'Login Pakar',   href: '/auth/login/pakar',  desc: 'Panel Pakar' },
              { label: 'Artikel',       href: '/public/article',    desc: 'Baca artikel kesehatan' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-200 group"
              >
                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-700 leading-tight">
                  {link.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-tight">
                  {link.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
