'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  School, CalendarDays, RefreshCcw, ChevronDown, ChevronUp,
  Loader2, FileText, X, TrendingUp, Users, AlertTriangle,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeverityCount {
  normal: number;
  ringan: number;
  sedang: number;
  berat: number;
}

interface SchoolMonitoring {
  npsn: number;
  nama_sekolah: string;
  total_diagnoses: number;
  depresi: SeverityCount;
  cemas: SeverityCount;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  normal: '#10b981',  // emerald-500
  ringan: '#3b82f6',  // blue-500
  sedang: '#f59e0b',  // amber-500
  berat:  '#ef4444',  // red-500
};

const SEVERITY_LABELS: Record<string, string> = {
  normal: 'Normal/Minimal',
  ringan: 'Ringan',
  sedang: 'Sedang',
  berat:  'Berat',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SeverityBadge = ({
  level,
  count,
}: {
  level: keyof typeof SEVERITY_COLORS;
  count: number;
}) => {
  const colorMap: Record<string, string> = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    ringan: 'bg-blue-50 text-blue-700 border-blue-100',
    sedang: 'bg-amber-50 text-amber-700 border-amber-100',
    berat:  'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${colorMap[level]}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: SEVERITY_COLORS[level] }}
      />
      {count}
    </span>
  );
};

const MiniBar = ({
  data,
  type,
}: {
  data: SeverityCount;
  type: 'depresi' | 'cemas';
}) => {
  const total = data.normal + data.ringan + data.sedang + data.berat;
  if (total === 0) return <span className="text-slate-300 text-xs">—</span>;

  const chartData = [
    { name: 'Normal', value: data.normal, color: SEVERITY_COLORS.normal },
    { name: 'Ringan', value: data.ringan, color: SEVERITY_COLORS.ringan },
    { name: 'Sedang', value: data.sedang, color: SEVERITY_COLORS.sedang },
    { name: 'Berat',  value: data.berat,  color: SEVERITY_COLORS.berat  },
  ];

  return (
    <div className="flex gap-0.5 h-5 rounded overflow-hidden min-w-[64px]">
      {chartData.map((item) =>
        item.value > 0 ? (
          <div
            key={item.name}
            title={`${item.name}: ${item.value}`}
            className="transition-all hover:opacity-80"
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color,
            }}
          />
        ) : null,
      )}
    </div>
  );
};

// ─── Detail Modal ──────────────────────────────────────────────────────────────

function SchoolDetailModal({
  school,
  onClose,
}: {
  school: SchoolMonitoring;
  onClose: () => void;
}) {
  const makeChartData = (d: SeverityCount) => [
    { name: 'Normal/Minimal', value: d.normal, fill: SEVERITY_COLORS.normal },
    { name: 'Ringan',         value: d.ringan, fill: SEVERITY_COLORS.ringan },
    { name: 'Sedang',         value: d.sedang, fill: SEVERITY_COLORS.sedang },
    { name: 'Berat',          value: d.berat,  fill: SEVERITY_COLORS.berat  },
  ];

  const depresiData = makeChartData(school.depresi);
  const cemasData   = makeChartData(school.cemas);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-slate-900 px-8 py-6 flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              NPSN {school.npsn}
            </p>
            <h2 className="text-xl font-black text-white">{school.nama_sekolah}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {school.total_diagnoses} total diagnosis tercatat
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-8 space-y-8">
          {/* Depresi Chart */}
          <div>
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">
              Tingkat Keparahan — Depresi (PHQ-9)
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depresiData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,.1)' }}
                  />
                  <Bar dataKey="value" name="Jumlah Siswa" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {depresiData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cemas Chart */}
          <div>
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">
              Tingkat Keparahan — Kecemasan (GAD-7)
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cemasData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,.1)' }}
                  />
                  <Bar dataKey="value" name="Jumlah Siswa" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {cemasData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
            {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[key] }}
                />
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Aggregate Bar Chart (semua sekolah) ──────────────────────────────────────

function AggregateChart({ data }: { data: SchoolMonitoring[] }) {
  const chartData = data.map((s) => ({
    name:
      s.nama_sekolah.length > 18
        ? s.nama_sekolah.substring(0, 18) + '…'
        : s.nama_sekolah,
    fullName: s.nama_sekolah,
    'Depresi Berat': s.depresi.berat,
    'Depresi Sedang': s.depresi.sedang,
    'Cemas Berat': s.cemas.berat,
    'Cemas Sedang': s.cemas.sedang,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,.1)', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: '12px' }}
        />
        <Bar dataKey="Depresi Berat"  fill="#ef4444" radius={[4,4,0,0]} maxBarSize={24} />
        <Bar dataKey="Depresi Sedang" fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={24} />
        <Bar dataKey="Cemas Berat"    fill="#be123c" radius={[4,4,0,0]} maxBarSize={24} />
        <Bar dataKey="Cemas Sedang"   fill="#d97706" radius={[4,4,0,0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminMonitoringPage() {
  const [data, setData] = useState<SchoolMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolMonitoring | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchData = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    try {
      let endpoint = '/api/admin/monitoring/sekolah';
      const params = new URLSearchParams();
      if (start) params.set('start_date', start);
      if (end)   params.set('end_date', end);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const res  = await fetchApi(endpoint, { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setData(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.message || 'Gagal memuat data monitoring');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error('Tanggal mulai tidak boleh lebih dari tanggal akhir');
      return;
    }
    fetchData(startDate, endDate);
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchData();
  };

  // Summary stats
  const totalSekolah    = data.length;
  const totalDiagnoses  = data.reduce((s, d) => s + d.total_diagnoses, 0);
  const totalButuhPerhatian = data.reduce(
    (s, d) => s + d.depresi.berat + d.depresi.sedang + d.cemas.berat + d.cemas.sedang,
    0,
  );

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Monitoring Kesehatan Mental
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Distribusi tingkat keparahan depresi & kecemasan per sekolah
          </p>
        </div>
        <button
          onClick={() => fetchData(startDate || undefined, endDate || undefined)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm self-start md:self-auto"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* ── Filter Tanggal ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <CalendarDays className="w-5 h-5" />
          <span className="text-sm font-bold text-slate-600">Filter Periode:</span>
        </div>
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleApplyFilter}
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            Terapkan Filter
          </button>
          {(startDate || endDate) && (
            <button
              onClick={handleResetFilter}
              className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: School,
            label: 'Total Sekolah',
            value: totalSekolah,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgLight: 'bg-blue-50',
          },
          {
            icon: Users,
            label: 'Total Diagnosis',
            value: totalDiagnoses,
            color: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            bgLight: 'bg-emerald-50',
          },
          {
            icon: AlertTriangle,
            label: 'Butuh Perhatian (Sedang–Berat)',
            value: totalButuhPerhatian,
            color: 'bg-red-500',
            textColor: 'text-red-600',
            bgLight: 'bg-red-50',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl ${item.bgLight}`}>
              <item.icon className={`w-6 h-6 ${item.textColor}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {item.label}
              </p>
              {loading ? (
                <div className="h-7 w-12 bg-slate-100 animate-pulse rounded mt-1" />
              ) : (
                <p className={`text-2xl font-black ${item.textColor}`}>{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Aggregate Chart ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <div>
            <h2 className="font-black text-slate-900">
              Grafik Kasus Prioritas per Sekolah
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Menampilkan kategori Sedang & Berat untuk depresi dan kecemasan
            </p>
          </div>
        </div>
        <div className="h-80 px-2 py-4">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
          ) : data.length > 0 ? (
            <AggregateChart data={data} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
              <FileText className="w-12 h-12 opacity-30" />
              <p className="font-medium text-sm">Belum ada data diagnosis tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabel Semua Sekolah ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-black text-slate-900">Rincian per Sekolah</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Klik baris untuk melihat grafik detail, atau klik{' '}
            <span className="text-slate-600 font-bold">Lihat Detail</span> untuk analisis lengkap
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Sekolah
                </th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Total Tes
                </th>
                {/* Depresi */}
                <th className="p-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center bg-emerald-50/50">
                  Depresi Normal
                </th>
                <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/50">
                  Depresi Ringan
                </th>
                <th className="p-4 text-[10px] font-black text-amber-600 uppercase tracking-widest text-center bg-amber-50/50">
                  Depresi Sedang
                </th>
                <th className="p-4 text-[10px] font-black text-red-600 uppercase tracking-widest text-center bg-red-50/50">
                  Depresi Berat
                </th>
                {/* Cemas */}
                <th className="p-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center bg-emerald-50/50">
                  Cemas Normal
                </th>
                <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/50">
                  Cemas Ringan
                </th>
                <th className="p-4 text-[10px] font-black text-amber-600 uppercase tracking-widest text-center bg-amber-50/50">
                  Cemas Sedang
                </th>
                <th className="p-4 text-[10px] font-black text-red-600 uppercase tracking-widest text-center bg-red-50/50">
                  Cemas Berat
                </th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={11} className="p-4">
                      <div className="h-5 bg-slate-100 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <FileText className="w-12 h-12 opacity-30" />
                      <p className="font-medium text-sm">
                        Belum ada data monitoring tersedia
                      </p>
                      <p className="text-xs text-slate-400">
                        Data akan muncul setelah siswa menyelesaikan tes diagnosis
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((school) => (
                  <React.Fragment key={school.npsn}>
                    <tr
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() =>
                        setExpandedRow(expandedRow === school.npsn ? null : school.npsn)
                      }
                    >
                      {/* Sekolah */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            <School className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">
                              {school.nama_sekolah}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              NPSN {school.npsn}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-4 text-center">
                        <span className="font-black text-slate-900">{school.total_diagnoses}</span>
                      </td>

                      {/* Depresi */}
                      <td className="p-4 text-center bg-emerald-50/30">
                        <SeverityBadge level="normal" count={school.depresi.normal} />
                      </td>
                      <td className="p-4 text-center bg-blue-50/30">
                        <SeverityBadge level="ringan" count={school.depresi.ringan} />
                      </td>
                      <td className="p-4 text-center bg-amber-50/30">
                        <SeverityBadge level="sedang" count={school.depresi.sedang} />
                      </td>
                      <td className="p-4 text-center bg-red-50/30">
                        <SeverityBadge level="berat" count={school.depresi.berat} />
                      </td>

                      {/* Cemas */}
                      <td className="p-4 text-center bg-emerald-50/30">
                        <SeverityBadge level="normal" count={school.cemas.normal} />
                      </td>
                      <td className="p-4 text-center bg-blue-50/30">
                        <SeverityBadge level="ringan" count={school.cemas.ringan} />
                      </td>
                      <td className="p-4 text-center bg-amber-50/30">
                        <SeverityBadge level="sedang" count={school.cemas.sedang} />
                      </td>
                      <td className="p-4 text-center bg-red-50/30">
                        <SeverityBadge level="berat" count={school.cemas.berat} />
                      </td>

                      {/* Aksi */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSchool(school);
                            }}
                            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            Lihat Detail
                          </button>
                          <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                            {expandedRow === school.npsn ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row — Mini Charts */}
                    {expandedRow === school.npsn && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={11} className="px-6 py-5">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Depresi Mini Bar */}
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                Distribusi Depresi
                              </p>
                              <div className="flex flex-col gap-2">
                                {(['normal', 'ringan', 'sedang', 'berat'] as const).map((lvl) => {
                                  const count = school.depresi[lvl];
                                  const total = school.total_diagnoses || 1;
                                  const pct = Math.round((count / total) * 100);
                                  return (
                                    <div key={lvl} className="flex items-center gap-3">
                                      <span className="w-24 text-xs font-medium text-slate-600 capitalize">
                                        {SEVERITY_LABELS[lvl]}
                                      </span>
                                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-500"
                                          style={{
                                            width: `${pct}%`,
                                            backgroundColor: SEVERITY_COLORS[lvl],
                                          }}
                                        />
                                      </div>
                                      <span className="w-10 text-xs text-right font-bold text-slate-500">
                                        {count} ({pct}%)
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Cemas Mini Bar */}
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                Distribusi Kecemasan
                              </p>
                              <div className="flex flex-col gap-2">
                                {(['normal', 'ringan', 'sedang', 'berat'] as const).map((lvl) => {
                                  const count = school.cemas[lvl];
                                  const total = school.total_diagnoses || 1;
                                  const pct = Math.round((count / total) * 100);
                                  return (
                                    <div key={lvl} className="flex items-center gap-3">
                                      <span className="w-24 text-xs font-medium text-slate-600 capitalize">
                                        {SEVERITY_LABELS[lvl]}
                                      </span>
                                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-500"
                                          style={{
                                            width: `${pct}%`,
                                            backgroundColor: SEVERITY_COLORS[lvl],
                                          }}
                                        />
                                      </div>
                                      <span className="w-10 text-xs text-right font-bold text-slate-500">
                                        {count} ({pct}%)
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend Warna ── */}
      {data.length > 0 && !loading && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 px-1">
          {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[key] }}
              />
              <span className="text-xs font-medium text-slate-500">{label}</span>
            </div>
          ))}
          <span className="text-xs text-slate-300 ml-2">
            — berdasarkan klasifikasi akhir sistem pakar
          </span>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedSchool && (
        <SchoolDetailModal
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
        />
      )}
    </div>
  );
}
