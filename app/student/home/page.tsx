'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Quote, Sparkles, Lightbulb, Heart } from 'lucide-react';

// Daftar kata-kata harian (Mental Health & Education Focus)
const dailyQuotes = [
  {
    text: 'Kesehatan mental siswa bukan hanya tentang ketiadaan penyakit, tapi tentang kehadiran dukungan dan penerimaan.',
    author: 'Tim Pakar Panel',
    icon: Heart,
    color: 'text-red-500',
  },
  {
    text: 'Setiap anak adalah bunga yang mekar dengan waktunya masing-masing. Tugas kita adalah menjaga iklim lingkungannya.',
    author: 'Inspirasi Pendidikan',
    icon: Sparkles,
    color: 'text-amber-500',
  },
  {
    text: 'Mendengarkan tanpa menghakimi adalah bentuk penyembuhan paling sederhana yang bisa kita berikan kepada siswa.',
    author: 'Prinsip Konseling',
    icon: Lightbulb,
    color: 'text-blue-500',
  },
  {
    text: 'Perubahan besar dimulai dari langkah-langkah kecil yang konsisten dalam memahami perasaan mereka.',
    author: 'Pakar Psikologi',
    icon: Quote,
    color: 'text-slate-900',
  },
];

export default function StudentsDashboardPage() {
  const [quote, setQuote] = useState(dailyQuotes[0]);

  // Efek untuk mengambil kutipan acak setiap kali load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
    setQuote(dailyQuotes[randomIndex]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Statistik</h1>
          <p className="text-slate-500 font-medium">SMP Negeri 1 Sragen • ID: 201312960</p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Kartu Kata-Kata Harian Menggantikan Grafik */}
      <Card className="overflow-hidden border-none shadow-2xl bg-slate-900 text-white min-h-[400px] flex flex-col justify-center relative">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <quote.icon className="w-64 h-64 rotate-12" />
        </div>

        <CardContent className="relative z-10 p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className={`p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 ${quote.color}`}>
              <quote.icon className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-serif italic leading-tight tracking-wide">"{quote.text}"</h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-[1px] w-8 bg-white/30"></div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">{quote.author}</p>
              <div className="h-[1px] w-8 bg-white/30"></div>
            </div>
          </div>
        </CardContent>

        <div className="absolute bottom-6 w-full text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Daily Insight for SMPN 1 Sragen</p>
        </div>
      </Card>

      {/* Card Kecil di bawahnya (Opsional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Status Sistem</p>
          <p className="text-slate-900 font-bold">Server Terhubung</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Update Terakhir</p>
          <p className="text-slate-900 font-bold">Hari ini, 17:40</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Lokasi Sesi</p>
          <p className="text-slate-900 font-bold">Sragen, Indonesia</p>
        </div>
      </div>
    </div>
  );
}
