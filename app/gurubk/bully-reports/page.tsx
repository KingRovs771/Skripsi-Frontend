'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, Loader2, AlertCircle, Filter, X,
  ChevronRight, WifiOff, BellOff, Clock, CheckCheck, Ban, RefreshCw
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface BullyReport {
  report_uid: string;
  jenis_bully: string;
  nama_terlapor: string;
  kelas_terlapor: string;
  deskripsi_kejadian: string;
  is_anonim: boolean;
  nama_pelapor: string;
  tingkat_urgensi: string;
  status: string;
  notifikasi_terkirim: boolean;
  created_at: string;
}

// ─── Badge helpers ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    BARU:             { label: 'Baru',             color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: <Clock className="w-3 h-3" /> },
    DITINDAKLANJUTI:  { label: 'Ditindaklanjuti',  color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <RefreshCw className="w-3 h-3" /> },
    SELESAI:          { label: 'Selesai',           color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCheck className="w-3 h-3" /> },
    DITOLAK:          { label: 'Ditolak',           color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Ban className="w-3 h-3" /> },
  };
  const s = map[status] || { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

function UrgensiBadge({ urgensi }: { urgensi: string }) {
  const map: Record<string, string> = {
    'Rendah':         'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Sedang':         'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Tinggi/Darurat': 'bg-red-100 text-red-700 border-red-200 animate-pulse',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${map[urgensi] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {urgensi === 'Tinggi/Darurat' ? '🔴' : urgensi === 'Sedang' ? '🟡' : '🟢'} {urgensi}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BullyReportsPage() {
  const [reports, setReports]         = useState<BullyReport[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const LIMIT = 20;

  // Filters
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterUrgensi, setFilterUrgensi] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(filterStatus  ? { status:  filterStatus  } : {}),
        ...(filterUrgensi ? { urgensi: filterUrgensi } : {}),
      });
      const res  = await fetchApi(`/api/gurubk/bully-reports?${params}`, { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setReports(json.Data || []);
        setTotal(json.total || 0);
      } else {
        setError(json.error || 'Gagal memuat laporan.');
      }
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterUrgensi]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const totalPages   = Math.max(1, Math.ceil(total / LIMIT));
  const hasFilter    = filterStatus || filterUrgensi;
  const clearFilters = () => { setFilterStatus(''); setFilterUrgensi(''); setPage(1); };

  // Hitung laporan yang belum dapat notifikasi (jaring pengaman)
  const missingNotif = useMemo(() => reports.filter(r => !r.notifikasi_terkirim).length, [reports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Manajemen</p>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Laporan Bully
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola laporan perundungan dari siswa di sekolah Anda.
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          {loading ? '...' : `${total} laporan`}
        </div>
      </div>

      {/* Peringatan notifikasi tidak terkirim */}
      {missingNotif > 0 && !loading && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl p-4">
          <BellOff className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">
              {missingNotif} laporan belum terkirim notifikasinya via WhatsApp/Email
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              Laporan ini ditandai ⚠️. Pastikan Anda tetap memeriksa dashboard secara rutin.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filter:</span>
        </div>

        <select
          id="filter-status"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
        >
          <option value="">Semua Status</option>
          <option value="BARU">Baru</option>
          <option value="DITINDAKLANJUTI">Ditindaklanjuti</option>
          <option value="SELESAI">Selesai</option>
          <option value="DITOLAK">Ditolak</option>
        </select>

        <select
          id="filter-urgensi"
          value={filterUrgensi}
          onChange={(e) => { setFilterUrgensi(e.target.value); setPage(1); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
        >
          <option value="">Semua Urgensi</option>
          <option value="Tinggi/Darurat">🔴 Tinggi / Darurat</option>
          <option value="Sedang">🟡 Sedang</option>
          <option value="Rendah">🟢 Rendah</option>
        </select>

        {hasFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors font-medium"
          >
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 font-semibold text-slate-500 text-xs uppercase tracking-widest">#</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Tanggal</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Pelapor</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Jenis</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Urgensi</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest">Status</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-300" />
                    <p className="text-slate-400 mt-3 text-sm font-medium">Memuat laporan...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <ShieldAlert className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 font-semibold">
                      {hasFilter ? 'Tidak ada laporan yang cocok.' : 'Belum ada laporan bully masuk.'}
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((r, idx) => (
                  <tr
                    key={r.report_uid}
                    className={`hover:bg-slate-50 transition-colors group
                      ${r.tingkat_urgensi === 'Tinggi/Darurat' && r.status === 'BARU'
                        ? 'bg-red-50/40'
                        : ''}`}
                  >
                    <td className="p-4 pl-6 text-slate-400 text-sm">
                      <div className="flex items-center gap-1.5">
                        {(page - 1) * LIMIT + idx + 1}
                        {!r.notifikasi_terkirim && (
                          <span title="Notifikasi WhatsApp/Email belum terkirim">
                            <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 text-sm">{r.nama_pelapor}</p>
                      {r.is_anonim && (
                        <span className="text-xs text-indigo-500 font-medium">🔒 Anonim</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{r.jenis_bully}</td>
                    <td className="p-4"><UrgensiBadge urgensi={r.tingkat_urgensi} /></td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 text-center">
                      <Link href={`/gurubk/bully-reports/${r.report_uid}`}>
                        <button
                          id={`btn-detail-${r.report_uid.slice(0, 8)}`}
                          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all active:scale-95 shadow-sm gap-1.5"
                        >
                          Tinjau <ChevronRight className="w-3.5 h-3.5" />
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
            <div className="p-8 text-center"><Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-300" /></div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              {hasFilter ? 'Tidak ada laporan yang cocok.' : 'Belum ada laporan bully.'}
            </div>
          ) : (
            reports.map((r) => (
              <Link key={r.report_uid} href={`/gurubk/bully-reports/${r.report_uid}`} className="block">
                <div className={`p-4 hover:bg-slate-50 transition-colors ${r.tingkat_urgensi === 'Tinggi/Darurat' && r.status === 'BARU' ? 'bg-red-50/40' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <UrgensiBadge urgensi={r.tingkat_urgensi} />
                        <StatusBadge status={r.status} />
                        {!r.notifikasi_terkirim && (
                          <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5">
                            <WifiOff className="w-3 h-3" /> Notif gagal
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900">{r.nama_pelapor}</p>
                      <p className="text-sm text-slate-500">{r.jenis_bully} · {new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.deskripsi_kejadian}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
