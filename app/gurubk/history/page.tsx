'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, FileClock, Loader2, User, Hash } from 'lucide-react';

interface StudentHistory {
  id: number;
  nisn: string;
  nama: string;
  terakhir_tes: string;
  total_tes: number;
}

export default function StudentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8080/pakar/history');
      const data = await response.json();
      setStudents(data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logika Filter: Cari berdasarkan Nama atau NISN
  const filteredStudents = students.filter((s) => s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Tes Siswa</h1>
        <p className="text-slate-500">Pantau hasil diagnosis dan perkembangan kesehatan mental siswa.</p>
      </div>

      {/* Bar Pencarian */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan Nama atau NISN..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-700">NISN</th>
              <th className="p-4 font-semibold text-slate-700">Nama Lengkap</th>
              <th className="p-4 font-semibold text-slate-700">Jumlah Tes</th>
              <th className="p-4 font-semibold text-slate-700">Terakhir Tes</th>
              <th className="p-4 font-semibold text-slate-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Data siswa tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-600">{s.nisn}</td>
                  <td className="p-4 font-medium text-slate-900">{s.nama}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold border border-slate-200">{s.total_tes} Kali</span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{s.terakhir_tes}</td>
                  <td className="p-4 text-center">
                    <Link href={`/pakar/history/${s.nisn}`}>
                      <button className="inline-flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
                        <Eye className="w-3 h-3 mr-1.5" /> Lihat Detail
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
