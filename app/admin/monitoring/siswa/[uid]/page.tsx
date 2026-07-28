'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface StudentInfo {
  students_uid: string;
  nama_lengkap: string;
  nisn: string;
  kelas: string;
  nama_sekolah: string;
  npsn: string;
}

interface HistoryRow {
  test_session_id: string;
  created_at: string;
  total_scorephq9: number;
  total_scoregad7: number;
  kategori_depresi: string;
  kategori_cemas: string;
  final_depresi_kode: string;
  final_cemas_kode: string;
  status_validasi_depresi: string;
  status_validasi_cemas: string;
  nn_depresi_confidence: number;
  nn_cemas_confidence: number;
  reviewed_by_gurubk: boolean;
}

interface ApiResponse {
  siswa: StudentInfo;
  riwayat: HistoryRow[];
  has_urgent: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  URGENT_INTERVENTION: {
    label: 'URGENT',
    cls: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
    icon: <ShieldAlert className="w-3 h-3" />,
  },
  CONFIRMED: {
    label: 'Confirmed',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  ADJUSTED: {
    label: 'Adjusted',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status || '—', cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const ScoreBar = ({ score, max, label }: { score: number; max: number; label: string }) => {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color = pct < 20 ? 'bg-emerald-500' : pct < 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <span className="text-xs font-mono font-black w-5 text-right">{score}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 w-8">{label}</span>
    </div>
  );
};

export default function StudentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const doFetch = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/api/admin/monitoring/siswa/${uid}/riwayat`);
        const json = await res.json().catch(() => ({}));
        if (res.ok) { setData(json.Data || json.data || null); }
        else { toast.error(json.Message || 'Gagal memuat riwayat'); router.back(); }
      } catch { toast.error('Gagal terhubung ke server'); router.back(); }
      finally { setLoading(false); }
    };
    doFetch();
  }, [uid, router]);

  const siswa = data?.siswa;
  const riwayat = data?.riwayat ?? [];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />Kembali
        </button>

        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-56 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-4 w-40 bg-slate-100 animate-pulse rounded" />
          </div>
        ) : siswa ? (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{siswa.nama_lengkap}</h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                NISN {siswa.nisn} · Kelas {siswa.kelas} ·{' '}
                <Link href={`/admin/monitoring/sekolah/${siswa.npsn}`} className="text-blue-600 hover:underline">
                  {siswa.nama_sekolah}
                </Link>
              </p>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {riwayat.length} sesi tes tercatat
            </div>
          </div>
        ) : null}
      </div>

      {/* Urgent Alert */}
      {!loading && data?.has_urgent && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0 animate-pulse" />
          <div>
            <p className="font-black text-red-700 text-sm">Siswa ini pernah memiliki status URGENT INTERVENTION</p>
            <p className="text-red-500 text-xs mt-0.5">
              Terdapat riwayat jawaban PHQ-9 butir 9 (pikiran menyakiti diri sendiri) &ge; 1. Pastikan sudah ada tindak lanjut dari Guru BK.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500 font-medium">
          Sesuai prinsip <em>least privilege</em> UU PDP No. 27/2022, narasi siswa (cerita_siswa) tidak ditampilkan pada akun Admin.
          Detail klinis penuh hanya dapat diakses oleh Guru BK dan Pakar.
        </p>
      </div>

      {/* Riwayat Tes */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          <div>
            <h2 className="font-black text-slate-900">Riwayat Sesi Tes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Diurutkan dari terbaru — skor & kategori tanpa narasi siswa</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : riwayat.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">Belum ada sesi tes yang selesai</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {riwayat.map((r, idx) => {
              const isUrgent = r.status_validasi_depresi === 'URGENT_INTERVENTION';
              const isFirst = idx === 0;
              return (
                <div key={r.test_session_id} className={`px-6 py-5 transition-colors hover:bg-slate-50/50 ${isUrgent ? 'bg-red-50/30' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: tanggal + badge */}
                    <div className="flex items-start gap-4">
                      <div className="text-center shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-red-100' : 'bg-slate-100'}`}>
                          {isFirst ? (
                            <span className="text-[10px] font-black text-blue-600">NEW</span>
                          ) : (
                            <span className="text-xs font-black text-slate-500">#{riwayat.length - idx}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(r.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <StatusBadge status={r.status_validasi_depresi} />
                          {r.reviewed_by_gurubk && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border bg-blue-50 text-blue-700 border-blue-200">
                              <CheckCircle2 className="w-3 h-3" />Ditinjau GBK
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: scores + categories */}
                    <div className="flex flex-col gap-3 md:items-end">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PHQ-9 (Depresi)</p>
                          <ScoreBar score={r.total_scorephq9} max={27} label="/27" />
                          <p className="text-[11px] text-slate-600 font-semibold mt-1">{r.kategori_depresi || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GAD-7 (Cemas)</p>
                          <ScoreBar score={r.total_scoregad7} max={21} label="/21" />
                          <p className="text-[11px] text-slate-600 font-semibold mt-1">{r.kategori_cemas || '—'}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Confidence AI — Depresi: {(r.nn_depresi_confidence * 100).toFixed(0)}% · Cemas: {(r.nn_cemas_confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}