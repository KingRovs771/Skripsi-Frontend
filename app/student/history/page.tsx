'use client';
import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Calendar, ArrowRight, Loader2, Trophy, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface MyTestHistory {
  id: number;
  nama_tes: string;
  skor: number;
  kategori: string;
  tanggal: string;
  rekomendasi: string;
}

export default function StudentHistoryPage() {
  const [history, setHistory] = useState<MyTestHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi fetch data history milik siswa yang sedang login
    const fetchMyHistory = async () => {
      try {
        const response = await fetch('http://localhost:8080/siswa/my-history');
        const data = await response.json();
        setHistory(data.data || []);
      } catch (error) {
        console.error('Gagal memuat riwayat:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Tes Saya</h1>
          <p className="text-slate-500">Lihat perkembangan kesehatan mental kamu dari waktu ke waktu.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-bold text-sm">
          <Trophy className="w-4 h-4" />
          Total Tes: {history.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium">Mengambil catatan tes kamu...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">Kamu belum pernah melakukan tes diagnosis.</p>
          <Link href="/siswa/tes">
            <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all">Mulai Tes Sekarang</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              {/* Status Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${item.skor > 15 ? 'bg-amber-400' : 'bg-green-400'}`}></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900">{item.nama_tes}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" /> {item.tanggal}
                      </p>
                    </div>
                  </div>

                  {/* Bagian Rekomendasi */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Catatan Pakar</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{item.rekomendasi}"</p>
                  </div>
                </div>

                {/* Badge Skor & Kategori */}
                <div className="flex items-center gap-6 md:border-l border-slate-100 md:pl-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Skor Kamu</p>
                    <div className="text-5xl font-black text-slate-900 leading-none">{item.skor}</div>
                  </div>
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Hasil Analisis</p>
                    <div className={`px-4 py-2 rounded-xl text-xs font-black border text-center ${item.skor > 15 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{item.kategori}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card Bawah */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <AlertCircle className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
        <h4 className="text-lg font-bold mb-2 flex items-center gap-2">Butuh teman bercerita?</h4>
        <p className="text-slate-300 text-sm max-w-md leading-relaxed">
          Jangan ragu untuk menghubungi Guru BK atau Pakar Psikologi melalui menu <span className="text-white font-bold underline">Tanya Jawab</span> jika kamu merasa butuh bantuan lebih lanjut.
        </p>
      </div>
    </div>
  );
}
