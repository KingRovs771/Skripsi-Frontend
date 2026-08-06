'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  School, Users, FileText, Loader2, RefreshCcw,
  MapPin, Hash, GraduationCap, ChevronRight,
  BarChart3, AlertTriangle, CheckCircle2,
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {selectedSchoolNpsn && activeSchool
                  ? `Analisis Detail: ${activeSchool.nama_sekolah}`
                  : 'Analisis Kumulatif Sekolah Binaan'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedSchoolNpsn && activeSchool
                  ? `Menampilkan distribusi tingkat keparahan siswa di ${activeSchool.nama_sekolah}.`
                  : 'Klik salah satu kartu sekolah di bawah untuk melihat grafik detail sekolah tersebut.'}
              </p>
            </div>
            {selectedSchoolNpsn && (
              <button
                type="button"
                onClick={() => setSelectedSchoolNpsn(null)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                Tampilkan Semua Sekolah
              </button>
            )}
          </div>

          {selectedSchoolNpsn && activeSchool ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Depresi Chart */}
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Tingkat Keparahan — Depresi (PHQ-9)</h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={depresiData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" name="Jumlah Siswa" radius={[4, 4, 0, 0]}>
                        {depresiData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cemas Chart */}
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Tingkat Keparahan — Kecemasan (GAD-7)</h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cemasData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" name="Jumlah Siswa" radius={[4, 4, 0, 0]}>
                        {cemasData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
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
          )}
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

      {!loading && totalButuhPerhatian === 0 && schools.length > 0 && (
        <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-800 text-sm">Semua sekolah binaan dalam kondisi baik</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Tidak ada siswa yang terdeteksi membutuhkan intervensi mendesak saat ini.
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
              onSelect={() => setSelectedSchoolNpsn(school.npsn === selectedSchoolNpsn ? null : school.npsn)}
              isSelected={school.npsn === selectedSchoolNpsn}
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
    </div>
  );
}
