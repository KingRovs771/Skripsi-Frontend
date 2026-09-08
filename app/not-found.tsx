'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, ArrowLeft, Brain, Frown } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-16">

      {/* Content Card */}
      <div
        className={`w-full max-w-md transition-all duration-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex justify-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          {/* Error illustration */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Frown className="w-10 h-10 text-slate-400" />
            </div>
          </div>

          {/* Error number */}
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Error 404
          </p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">
            Halaman Tidak<br />Ditemukan
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
            Maaf, halaman yang Anda cari tidak ada, sudah dipindahkan,
            atau Anda tidak memiliki akses ke sana.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95 flex-1 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all duration-200 active:scale-95 shadow-md shadow-slate-900/20 flex-1"
            >
              <Home className="w-4 h-4" />
              Beranda
            </Link>
          </div>
        </div>

        {/* Quick links section */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">
            Halaman yang Sering Dikunjungi
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Login Siswa',   href: '/auth/login',          desc: 'Masuk sebagai siswa' },
              { label: 'Login Guru BK', href: '/auth/login/gurubk',   desc: 'Panel Guru BK' },
              { label: 'Login Pakar',   href: '/auth/login/pakar',    desc: 'Panel Pakar' },
              { label: 'Artikel',       href: '/public/article',       desc: 'Baca artikel kesehatan' },
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

        {/* Footer */}
        <p className="mt-6 text-xs text-slate-400 font-medium text-center">
          Mental Care &copy; {new Date().getFullYear()} &mdash; We Together Health
        </p>
      </div>
    </div>
  );
}
