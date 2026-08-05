'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import {
  AlertTriangle, ShieldAlert, Loader2, RefreshCw, School,
  Calendar, CheckCircle2, Inbox, Flag, BarChart3, TrendingUp
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface BullyStatsBySchool {
  npsn: string;
  nama_sekolah: string;
  total: number;
  total_baru: number;
  total_selesai: number;
  total_darurat: number;
}

interface BullyStatsByMonth {
  bulan: string; // "2026-08"
  total: number;
  baru: number;
  selesai: number;
}

interface BullyGlobalSummary {
  total_all: number;
  total_baru: number;
  total_darurat: number;
  total_selesai: number;
}

export default function AdminBullyStatsPage() {
  const [summary, setSummary] = useState<BullyGlobalSummary | null>(null);
  const [bySchool, setBySchool] = useState<BullyStatsBySchool[]>([]);
  const [byMonth, setByMonth] = useState<BullyStatsByMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedSchool) params.append('npsn', selectedSchool);
      if (selectedYear) params.append('year', selectedYear);

      const res = await fetchApi(`/api/admin/bully-reports/stats?${params}`, {
        method: 'GET',
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.Data) {
        setSummary(json.Data.summary);
        setBySchool(json.Data.by_school || []);
        setByMonth(json.Data.by_month || []);
      } else {
        setError(json.error || 'Gagal memuat data statistik.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Derived school options from the data itself to keep it simple, or we can use bySchool list
  const schoolOptions = useMemo(() => {
    // If we filtered by school, we don't want the dropdown options list to shrink to just 1 school.
    // So we only update schoolOptions when selectedSchool is empty.
    return bySchool.map(s => ({ npsn: s.npsn, name: s.nama_sekolah }));
  }, [bySchool]);

  const yearOptions = ['2024', '2025', '2026', '2027'];

  // Formatter for Monthly Chart
  const formattedMonthlyData = useMemo(() => {
    return [...byMonth].reverse().map(m => {
      const [year, month] = m.bulan.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return {
        ...m,
        label: `${months[parseInt(month) - 1]} ${year}`,
      };
    });
  }, [byMonth]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Analitik Keamanan
          </p>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Statistik Bullying
          </h1>
          <p className="text-slate-500 mt-1">
            Monitoring data & tren pelaporan kasus perundungan antar sekolah secara terpusat.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold shadow-sm transition-colors active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <span>Filter Data:</span>
        </div>

        {/* Dropdown Sekolah */}
        <select
          id="filter-stats-school"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm min-w-[200px]"
        >
          <option value="">Semua Sekolah</option>
          {schoolOptions.map((s) => (
            <option key={s.npsn} value={s.npsn}>{s.name}</option>
          ))}
        </select>

        {/* Dropdown Tahun */}
        <select
          id="filter-stats-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
        >
          <option value="">Semua Tahun</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {(selectedSchool || selectedYear) && (
          <button
            onClick={() => { setSelectedSchool(''); setSelectedYear(''); }}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors font-medium"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Total */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Laporan</p>
              <p className="text-3xl font-black text-slate-900">{summary.total_all}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Inbox className="w-6 h-6" />
            </div>
          </div>

          {/* Card Baru */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Kasus Baru</p>
              <p className="text-3xl font-black text-blue-600">{summary.total_baru}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Flag className="w-6 h-6" />
            </div>
          </div>

          {/* Card Darurat */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Darurat / Tinggi</p>
              <p className="text-3xl font-black text-red-600">{summary.total_darurat}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card Selesai */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Terselesaikan</p>
              <p className="text-3xl font-black text-emerald-600">{summary.total_selesai}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bulanan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              Tren Laporan Bulanan
            </h3>
            <span className="text-xs text-slate-400 font-medium">24 bulan terakhir</span>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : formattedMonthlyData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data bulanan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedMonthlyData} margin={{ left: -15, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="total" name="Total Kasus" stroke="#475569" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="selesai" name="Selesai" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Laporan Per Sekolah */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <School className="w-5 h-5 text-slate-500" />
              Kasus per Sekolah
            </h3>
            <span className="text-xs text-slate-400 font-medium">Berdasarkan total kasus</span>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : bySchool.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data sekolah.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySchool} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="nama_sekolah" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,.1)' }}
                  />
                  <Bar dataKey="total" name="Total Laporan" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={24} />
                  <Bar dataKey="total_darurat" name="Kasus Darurat" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-500" />
            Tabel Rincian Sekolah
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 font-semibold text-slate-500 text-xs uppercase tracking-widest">NPSN</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Nama Sekolah</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center">Total Kasus</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center text-blue-600">Baru</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center text-red-600">Darurat</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center text-emerald-600">Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                  </td>
                </tr>
              ) : bySchool.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    Tidak ada rincian data tersedia.
                  </td>
                </tr>
              ) : (
                bySchool.map((s) => (
                  <tr key={s.npsn} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-sm text-slate-600 font-semibold">{s.npsn}</td>
                    <td className="p-4 font-semibold text-slate-900">{s.nama_sekolah}</td>
                    <td className="p-4 text-center font-bold text-slate-800">{s.total}</td>
                    <td className="p-4 text-center font-semibold text-blue-600">{s.total_baru}</td>
                    <td className="p-4 text-center font-semibold text-red-600">{s.total_darurat}</td>
                    <td className="p-4 text-center font-semibold text-emerald-600">{s.total_selesai}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


