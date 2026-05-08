'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, FileClock, Loader2, Users, AlertCircle, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface StudentHistory {
  nisn: string;
  nama: string;
  terakhir_tes: string;
  total_tes: number;
}

export default function GurubkHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi('/api/gurubk/history', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStudents(json.Data || json.data || []);
      } else {
        setError(json.message || 'Gagal memuat data riwayat siswa.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredStudents = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Manajemen</p>
          <h1 className="text-3xl font-bold text-slate-900">Riwayat Tes Siswa</h1>
          <p className="text-slate-500 mt-1">
            Pantau hasil diagnosis dan tinjau ulang visibilitas hasil kepada siswa.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 text-sm font-semibold shadow-sm">
          <Users className="w-4 h-4 text-slate-400" />
          {loading ? '...' : `${students.length} Siswa`}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="search-siswa"
          type="text"
          placeholder="Cari berdasarkan Nama atau NISN siswa..."
          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white shadow-sm text-slate-800 placeholder:text-slate-400 transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 font-semibold text-slate-500 text-xs uppercase tracking-widest">#</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">NISN</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Nama Lengkap</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Jumlah Tes</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Terakhir Tes</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-300" />
                    <p className="text-slate-400 mt-3 text-sm font-medium">Memuat data siswa...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <FileClock className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 font-semibold">
                      {searchTerm ? 'Siswa tidak ditemukan.' : 'Belum ada data riwayat tes.'}
                    </p>
                    {searchTerm && (
                      <p className="text-slate-400 text-sm mt-1">
                        Coba kata kunci atau NISN yang berbeda.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.nisn} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 text-slate-400 text-sm font-medium">{idx + 1}</td>
                    <td className="p-4 font-mono text-sm text-slate-600 font-semibold">{s.nisn}</td>
                    <td className="p-4 font-semibold text-slate-900">{s.nama}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
                        {s.total_tes} Kali
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {s.terakhir_tes ? new Date(s.terakhir_tes).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/gurubk/history/${s.nisn}`}>
                        <button
                          id={`btn-detail-${s.nisn}`}
                          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all active:scale-95 shadow-sm gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Tinjau Detail
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-300" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              {searchTerm ? 'Siswa tidak ditemukan.' : 'Belum ada data riwayat tes.'}
            </div>
          ) : (
            filteredStudents.map((s) => (
              <Link key={s.nisn} href={`/gurubk/history/${s.nisn}`} className="block">
                <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{s.nama}</p>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">{s.nisn}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold border border-slate-200">
                        {s.total_tes} Tes
                      </span>
                      {s.terakhir_tes && (
                        <span className="text-slate-400 text-xs">
                          {new Date(s.terakhir_tes).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
