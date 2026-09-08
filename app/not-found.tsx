'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, ArrowLeft, Search, Brain } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-6">

      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(168,85,247,0.3) 50%, transparent 80%)',
          }}
        />
        {/* Floating orbs */}
        <div
          className="absolute top-[15%] left-[10%] w-48 h-48 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: 'rgba(99,102,241,0.8)', animationDuration: '4s' }}
        />
        <div
          className="absolute bottom-[10%] right-[8%] w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: 'rgba(168,85,247,0.8)', animationDuration: '6s' }}
        />
        <div
          className="absolute top-[60%] left-[75%] w-32 h-32 rounded-full opacity-10 blur-2xl animate-pulse"
          style={{ background: 'rgba(59,130,246,0.8)', animationDuration: '5s' }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div
        className={`relative z-10 text-center max-w-lg w-full transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Logo / Brand mark */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Brain className="w-10 h-10 text-white" />
            </div>
            {/* Ping effect */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
            </span>
          </div>
        </div>

        {/* 404 display */}
        <div className="mb-4">
          <p className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase mb-2">
            Error 404
          </p>
          <h1
            className="font-black text-slate-100 leading-none select-none"
            style={{
              fontSize: 'clamp(5rem, 18vw, 10rem)',
              background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.05em',
            }}
          >
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-xl font-black text-slate-200 mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 max-w-sm mx-auto">
          Sepertinya halaman yang Anda cari tidak ada atau sudah dipindahkan.
          Coba kembali ke halaman sebelumnya atau menu utama.
        </p>

        {/* Loading dots hint */}
        <p className="text-xs text-slate-600 mb-8 font-mono">
          Menganalisis rute{dots}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 w-full sm:w-auto justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl text-sm font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-500/25 w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-white/5">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-4">
            Halaman Populer
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Login Siswa', href: '/auth/login' },
              { label: 'Login Guru BK', href: '/auth/login/gurubk' },
              { label: 'Login Pakar', href: '/auth/login/pakar' },
              { label: 'Artikel Publik', href: '/public/article' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 font-medium hover:bg-white/10 hover:text-slate-200 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-[11px] text-slate-700 font-medium">
          Mental Care &copy; {new Date().getFullYear()} &mdash; We Together Health
        </p>
      </div>
    </div>
  );
}
