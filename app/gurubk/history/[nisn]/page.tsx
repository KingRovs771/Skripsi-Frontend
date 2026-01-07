'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TestResult {
  id: number;
  nama_tes: string;
  skor: number;
  kategori: string;
  tanggal: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    // Ganti dengan API Detail Anda berdasarkan NISN
    const fetchDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8080/pakar/history/${params.nisn}`);
        const data = await response.json();
        setResults(data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.nisn]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/pakar/history" className="p-2 hover:bg-white rounded-full transition-colors border border-slate-200 shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Rincian Hasil Tes</h1>
      </div>

      {/* Info Siswa Sederhana */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">{params.nisn.toString().slice(-2)}</div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Siswa dengan NISN</p>
            <p className="text-xl font-mono">{params.nisn}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Tes</p>
          <p className="text-2xl font-bold">{results.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center">
          <ClipboardList className="w-5 h-5 mr-2 text-slate-400" /> Riwayat Nilai
        </h3>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((test) => (
              <div key={test.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-slate-400 transition-colors flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${test.skor > 15 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{test.nama_tes}</h4>
                    <p className="text-sm text-slate-500">{test.tanggal}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Skor</p>
                    <p className="text-xl font-black text-slate-900">{test.skor}</p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-xs font-bold text-slate-400 uppercase">Kategori</p>
                    <p className={`text-sm font-bold ${test.skor > 15 ? 'text-red-500' : 'text-green-500'}`}>{test.kategori}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
