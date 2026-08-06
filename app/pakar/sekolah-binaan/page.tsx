'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  School, Users, FileText, Loader2, RefreshCcw,
  MapPin, Hash, GraduationCap, ChevronRight,
  BarChart3, AlertTriangle, CheckCircle2, X
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SekolahBinaan {
  npsn: number;
  sekolah_uid: string;
  nama_sekolah: string;
  jenjang: string;
  alamat_sekolah: string;
  // Statistik ringkasan (dari join ke students & hasil_diagnoses)
  total_siswa: number;
  total_tes_selesai: number;
  butuh_perhatian: number; // siswa dengan kategori Sedang atau Berat
  depresi_normal: number;
  depresi_ringan: number;
  depresi_sedang: number;
  depresi_berat: number;
  cemas_normal: number;
  cemas_ringan: number;
  cemas_sedang: number;
  cemas_berat: number;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatPill = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'amber' | 'red';
}) => {
  const colorMap = {
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber:   'bg-amber-50 text-amber-700 border-amber-100',
    red:     'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${colorMap[color]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}: <strong>{value}</strong></span>
    </div>
  );
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
        <School className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-500 mb-2">Belum Ada Sekolah Binaan</h3>
      <p className="text-sm text-slate-400 text-center max-w-sm">
        Anda belum ditugaskan untuk membina sekolah manapun. Hubungi Administrator untuk
        penetapan sekolah binaan.
      </p>
    </div>
  );
}

// ─── School Detail Modal ───────────────────────────────────────────────────────

function SchoolDetailModal({
  school,
  onClose,
}: {
  school: SekolahBinaan;
  onClose: () => void;
}) {
  const depresiData = [
    { name: 'Normal/Minimal', value: school.depresi_normal, fill: '#10b981' },
    { name: 'Ringan',         value: school.depresi_ringan, fill: '#3b82f6' },
    { name: 'Sedang',         value: school.depresi_sedang, fill: '#f59e0b' },
    { name: 'Berat',          value: school.depresi_berat, fill: '#ef4444' },
  ];

  const cemasData = [
    { name: 'Normal/Minimal', value: school.cemas_normal, fill: '#10b981' },
    { name: 'Ringan',         value: school.cemas_ringan, fill: '#3b82f6' },
    { name: 'Sedang',         value: school.cemas_sedang, fill: '#f59e0b' },
    { name: 'Berat',          value: school.cemas_berat, fill: '#ef4444' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-slate-900 px-8 py-6 flex items-start justify-between shrink-0">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              NPSN {school.npsn}
            </p>
            <h2 className="text-xl font-black text-white">{school.nama_sekolah}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {school.total_tes_selesai} total diagnosis tercatat
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
        <div className="p-8 overflow-y-auto space-y-8 flex-1">
          {/* Depresi Chart */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
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
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
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
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 shrink-0">
            {[
              { color: '#10b981', label: 'Normal/Minimal' },
              { color: '#3b82f6', label: 'Ringan' },
              { color: '#f59e0b', label: 'Sedang' },
              { color: '#ef4444', label: 'Berat' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── School Card ───────────────────────────────────────────────────────────────

function SchoolCard({ school, onSelect, isSelected }: { school: SekolahBinaan; onSelect: () => void; isSelected: boolean }) {
  const urgencyLevel =
    school.butuh_perhatian > 5
      ? 'high'
      : school.butuh_perhatian > 0
      ? 'medium'
      : 'low';

  const urgencyConfig = {
    high:   { text: 'Perlu Perhatian', cls: 'bg-red-50 text-red-600 border-red-200',     dot: 'bg-red-500' },
    medium: { text: 'Pantau Terus',    cls: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' },
    low:    { text: 'Kondisi Baik',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  }[urgencyLevel];

  return (
    <div 
      onClick={onSelect}
      className={`bg-white border rounded-3xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer
        ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200'}`}
    >
      {/* Header Card */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors">
            <School className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base leading-tight">{school.nama_sekolah}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-bold">
                <Hash className="w-2.5 h-2.5" /> {school.npsn}
              </span>
              <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
                {school.jenjang}
              </span>
            </div>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider shrink-0 ${urgencyConfig.cls}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${urgencyConfig.dot} ${urgencyLevel === 'high' ? 'animate-pulse' : ''}`} />
          {urgencyConfig.text}
        </div>
      </div>

      {/* Alamat */}
      <div className="flex items-start gap-2 text-xs text-slate-500 font-medium mb-5 pb-5 border-b border-slate-50">
        <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{school.alamat_sekolah || 'Alamat belum tersedia'}</span>
      </div>

      {/* Statistik */}
      <div className="flex flex-wrap gap-2">
        <StatPill icon={Users}      label="Siswa"            value={school.total_siswa}      color="blue"    />
        <StatPill icon={FileText}   label="Tes Selesai"      value={school.total_tes_selesai} color="emerald" />
        {school.butuh_perhatian > 0 && (
          <StatPill icon={AlertTriangle} label="Butuh Perhatian" value={school.butuh_perhatian}  color="red"     />
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PakarSekolahBinaanPage() {
  const [schools, setSchools]   = useState<SekolahBinaan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selectedSchoolNpsn, setSelectedSchoolNpsn] = useState<number | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetchApi('/api/pakar/sekolah-binaan', { method: 'GET' });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setSchools(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.message || 'Gagal memuat data sekolah binaan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // ── Summary stats ─────────────────────────────────────────────────────────────
  const totalSiswa         = schools.reduce((s, d) => s + d.total_siswa, 0);
  const totalTes           = schools.reduce((s, d) => s + d.total_tes_selesai, 0);
  const totalButuhPerhatian = schools.reduce((s, d) => s + d.butuh_perhatian, 0);

  const activeSchool = schools.find((s) => s.npsn === selectedSchoolNpsn);

  const depresiData = activeSchool
    ? [
        { name: 'Normal/Minimal', value: activeSchool.depresi_normal, fill: '#10b981' },
        { name: 'Ringan',         value: activeSchool.depresi_ringan, fill: '#3b82f6' },
        { name: 'Sedang',         value: activeSchool.depresi_sedang, fill: '#f59e0b' },
        { name: 'Berat',          value: activeSchool.depresi_berat, fill: '#ef4444' },
      ]
    : [];

  const cemasData = activeSchool
    ? [
        { name: 'Normal/Minimal', value: activeSchool.cemas_normal, fill: '#10b981' },
        { name: 'Ringan',         value: activeSchool.cemas_ringan, fill: '#3b82f6' },
        { name: 'Sedang',         value: activeSchool.cemas_sedang, fill: '#f59e0b' },
        { name: 'Berat',          value: activeSchool.cemas_berat, fill: '#ef4444' },
      ]
    : [];

  return (
    <div className="space-y-8 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sekolah Binaan</h1>
          <p className="text-slate-500 font-medium mt-1">
            Daftar sekolah yang Anda bina beserta ringkasan statistik siswa
          </p>
        </div>
        <button
          onClick={fetchSchools}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm self-start md:self-auto"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: School,
            label: 'Total Sekolah Binaan',
            value: schools.length,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            icon: Users,
            label: 'Total Siswa',
            value: totalSiswa,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            icon: FileText,
            label: 'Total Tes Selesai',
            value: totalTes,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            icon: AlertTriangle,
            label: 'Butuh Perhatian',
            value: totalButuhPerhatian,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {item.label}
            </p>
            {loading ? (
              <div className="h-7 w-10 bg-slate-100 animate-pulse rounded" />
            ) : (
              <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Grafik Sekolah Binaan ── */}
      {!loading && schools.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-900 font-sans tracking-tight">Analisis Kumulatif Sekolah Binaan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Berikut perbandingan keaktifan siswa dan sebaran kasus. Klik kartu sekolah di bawah untuk analisis detail.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Partisipasi */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Partisipasi &amp; Total Siswa</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schools.map(s => ({
                    name: s.nama_sekolah.length > 15 ? s.nama_sekolah.substring(0, 15) + '...' : s.nama_sekolah,
                    "Total Siswa": s.total_siswa,
                    "Tes Selesai": s.total_tes_selesai,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Total Siswa" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Tes Selesai" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Butuh Perhatian */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Kasus Butuh Perhatian (Skor &gt; 75)</h3>
              </div>
              <div className="h-64 w-full">
                {totalButuhPerhatian > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={schools.map(s => ({
                      name: s.nama_sekolah.length > 15 ? s.nama_sekolah.substring(0, 15) + '...' : s.nama_sekolah,
                      "Butuh Perhatian": s.butuh_perhatian,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Butuh Perhatian" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Tidak ada kasus yang butuh perhatian di seluruh sekolah binaan Anda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Alert jika ada yang butuh perhatian ── */}
      {!loading && totalButuhPerhatian > 0 && (
        <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm">
              {totalButuhPerhatian} siswa membutuhkan perhatian khusus
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Terdapat siswa dengan tingkat keparahan Sedang atau Berat pada tes diagnosis terbaru.
              Pertimbangkan untuk berkoordinasi dengan Guru BK masing-masing sekolah.
            </p>
          </div>
        </div>
      )}

      {/* ── Grid Sekolah ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-100 animate-pulse rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 animate-pulse rounded-lg w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 animate-pulse rounded-lg" />
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-xl" />
                <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : schools.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl">
          <EmptyState />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {schools.map((school) => (
            <SchoolCard
              key={school.npsn}
              school={school}
              onSelect={() => setSelectedSchoolNpsn(school.npsn)}
              isSelected={selectedSchoolNpsn === school.npsn}
            />
          ))}
        </div>
      )}

      {/* ── Catatan kaki ── */}
      {!loading && schools.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          Statistik diperbarui secara real-time berdasarkan seluruh riwayat tes siswa •
          Butuh Perhatian = siswa dengan diagnosis Sedang atau Berat
        </p>
      )}

      {/* ── Detail Modal ── */}
      {selectedSchoolNpsn && activeSchool && (
        <SchoolDetailModal
          school={activeSchool}
          onClose={() => setSelectedSchoolNpsn(null)}
        />
      )}
    </div>
  );
}
