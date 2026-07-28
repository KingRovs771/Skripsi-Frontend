'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, ShieldAlert, Search, FileText, GraduationCap, ClipboardList, Calendar } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface StudentSummary {
  students_uid: string;
  nama_lengkap: string;
  nisn: string;
  kelas: string;
  last_test_date: string | null;
  total_scorephq9: number | null;
  total_scoregad7: number | null;
  kategori_depresi: string;
  kategori_cemas: string;
  status_validasi_depresi: string;
  is_urgent: boolean;
}

interface SchoolStudentsResponse {
  npsn: string;
  nama_sekolah: string;
  siswa: StudentSummary[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const label: Record<string, string> = { URGENT_INTERVENTION: 'URGENT', CONFIRMED: 'Confirmed', ADJUSTED: 'Adjusted' };
  const cls: Record<string, string> = {
    URGENT_INTERVENTION: 'bg-red-100 text-red-800 border-red-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    ADJUSTED: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${cls[status] ?? 'bg-slate-50 text-slate-500 border-slate-100'}`}>{label[status] ?? status}</span>;
};

const ScoreBadge = ({ score, type }: { score: number | null; type: 'phq9' | 'gad7' }) => {
  if (score === null) return <span className="text-slate-300 text-xs">—</span>;
  const max = type === 'phq9' ? 27 : 21;
  const pct = (score / max) * 100;
  const color = pct < 20 ? 'text-emerald-600' : pct < 50 ? 'text-amber-600' : 'text-red-600';
  return <span className={`font-black text-sm ${color}`}>{score}</span>;
};

export default function SchoolStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const npsn = params.npsn as string;
  const [data, setData] = useState<SchoolStudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!npsn) return;
    const doFetch = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/api/admin/monitoring/sekolah/${npsn}/siswa`);
        const json = await res.json().catch(() => ({}));
        if (res.ok) { setData(json.Data || json.data || null); }
        else { toast.error(json.Message || 'Gagal memuat data siswa'); router.push('/admin/monitoring'); }
      } catch { toast.error('Gagal terhubung ke server'); router.push('/admin/monitoring'); }
      finally { setLoading(false); }
    };
    doFetch();
  }, [npsn, router]);

  const filtered = useMemo(() => {
    if (!data?.siswa) return [];
    const q = search.toLowerCase().trim();
    if (!q) return data.siswa;
    return data.siswa.filter((s) => s.nama_lengkap.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q) || s.kelas.toLowerCase().includes(q));
  }, [data, search]);

  const urgentCount = data?.siswa?.filter((s) => s.is_urgent).length ?? 0;
  const testedCount = data?.siswa?.filter((s) => s.last_test_date !== null).length ?? 0;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Link href="/admin/monitoring" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />Kembali ke Monitoring
        </Link>
        {loading ? <div className="h-8 w-64 bg-slate-100 animate-pulse rounded-lg" /> : (
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{data?.nama_sekolah ?? `NPSN ${npsn}`}</h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">NPSN {npsn} — Daftar siswa & ringkasan diagnosis</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[{ icon: Users, label: 'Total Siswa', value: data?.siswa?.length ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' }, { icon: ClipboardList, label: 'Sudah Tes', value: testedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' }, { icon: ShieldAlert, label: 'URGENT INTERVENTION', value: urgentCount, color: 'text-red-600', bg: 'bg-red-50' }].map((item) => (
          <div key={item.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${item.bg}`}><item.icon className={`w-5 h-5 ${item.color}`} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{item.label}</p>
              {loading ? <div className="h-7 w-8 bg-slate-100 animate-pulse rounded mt-0.5" /> : <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>}
            </div>
          </div>
        ))}
      </div>

      {!loading && urgentCount > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0 animate-pulse" />
          <div>
            <p className="font-black text-red-700 text-sm">{urgentCount} siswa membutuhkan intervensi segera</p>
            <p className="text-red-500 text-xs mt-0.5">Jawaban PHQ-9 butir 9 (pikiran menyakiti diri) {'>='} 1. Segera koordinasikan dengan Guru BK dan Pakar.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-black text-slate-900">Daftar Siswa</h2>
            <p className="text-xs text-slate-400 mt-0.5">Klik Riwayat untuk melihat seluruh histori tes siswa</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama / NISN / kelas..." className="pl-9 pr-4 py-2.5 text-sm bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-slate-900 transition-all w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Siswa</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">NISN</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Kelas</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Tes Terakhir</th>
                <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/50">PHQ-9</th>
                <th className="p-4 text-[10px] font-black text-purple-600 uppercase tracking-widest text-center bg-purple-50/50">GAD-7</th>
                <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Depresi</th>
                <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Kecemasan</th>
                <th className="p-4 text-[10px] font-black text-red-600 uppercase tracking-widest text-center bg-red-50/50">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={10} className="p-4"><div className="h-5 bg-slate-100 animate-pulse rounded-lg" /></td></tr>))
              : filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-20 text-center"><div className="flex flex-col items-center gap-3 text-slate-300"><FileText className="w-10 h-10 opacity-30" /><p className="font-medium text-sm text-slate-400">{search ? 'Tidak ada siswa yang cocok' : 'Belum ada siswa terdaftar'}</p></div></td></tr>
              ) : filtered.map((s) => (
                <tr key={s.students_uid} className={`transition-colors hover:bg-slate-50/70 ${s.is_urgent ? 'bg-red-50/30 hover:bg-red-50/60' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.is_urgent ? 'bg-red-100' : 'bg-slate-100'}`}>
                        {s.is_urgent ? <ShieldAlert className="w-4 h-4 text-red-600" /> : <GraduationCap className="w-4 h-4 text-slate-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{s.nama_lengkap}</p>
                        {s.is_urgent && <span className="text-[10px] font-black text-red-600 animate-pulse">URGENT INTERVENTION</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center"><span className="text-xs font-mono text-slate-600">{s.nisn || '—'}</span></td>
                  <td className="p-4 text-center"><span className="text-xs font-semibold text-slate-700">{s.kelas || '—'}</span></td>
                  <td className="p-4 text-center">
                    {s.last_test_date ? (
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.last_test_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    ) : <span className="text-slate-300 text-xs">Belum tes</span>}
                  </td>
                  <td className="p-4 text-center bg-blue-50/20"><ScoreBadge score={s.total_scorephq9} type="phq9" /></td>
                  <td className="p-4 text-center bg-purple-50/20"><ScoreBadge score={s.total_scoregad7} type="gad7" /></td>
                  <td className="p-4 text-center"><span className="text-xs text-slate-700 font-medium">{s.kategori_depresi || '—'}</span></td>
                  <td className="p-4 text-center"><span className="text-xs text-slate-700 font-medium">{s.kategori_cemas || '—'}</span></td>
                  <td className="p-4 text-center bg-red-50/10">{s.status_validasi_depresi ? <StatusBadge status={s.status_validasi_depresi} /> : <span className="text-slate-300 text-xs">—</span>}</td>
                  <td className="p-4 text-right">
                    {s.last_test_date
                      ? <Link href={`/admin/monitoring/siswa/${s.students_uid}`} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors">Riwayat</Link>
                      : <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed">Belum Tes</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}