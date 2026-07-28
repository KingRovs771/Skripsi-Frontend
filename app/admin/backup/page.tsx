'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Database, AlertTriangle, CheckCircle2, XCircle, Play, RefreshCcw, Download, Calendar, ShieldCheck, HelpCircle, HardDrive } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface BackupJob {
  job_uid: string;
  type: string;
  status: string;
  triggered_by: string | null;
  triggered_by_name: string;
  file_size: string | null;
  has_file: boolean;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  created_at: string;
  duration_seconds: number | null;
}

interface JobsResponse {
  jobs: BackupJob[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function BackupManagementPage() {
  // State trigger & active job
  const [activeJobUid, setActiveJobUid] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<BackupJob | null>(null);
  const [triggerType, setTriggerType] = useState<'weekly' | 'annual'>('weekly');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // State list & pagination
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Load history
  const fetchJobs = async (p: number) => {
    setIsLoadingList(true);
    try {
      const res = await fetchApi(`/api/admin/backup/jobs?page=${p}&limit=10`);
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.Data) {
        setJobs(json.Data.jobs || []);
        setTotalJobs(json.Data.total || 0);
        setTotalPages(json.Data.total_pages || 1);
      } else {
        toast.error(json.Message || 'Gagal memuat riwayat backup');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchJobs(page);
  }, [page]);

  // Polling logic
  const startPolling = (uid: string) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
      try {
        const res = await fetchApi(`/api/admin/backup/jobs/${uid}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.Data) {
          const job = json.Data as BackupJob;
          setActiveJob(job);
          if (job.status === 'SUCCESS' || job.status === 'FAILED') {
            stopPolling();
            fetchJobs(page); // Reload list
            if (job.status === 'SUCCESS') {
              toast.success('Backup selesai dengan sukses!');
            } else {
              toast.error(`Backup gagal: ${job.error_message || 'Terjadi kesalahan'}`);
            }
          }
        }
      } catch {
        console.warn('Gagal polling status backup');
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleTriggerBackup = async () => {
    setIsTriggering(true);
    setShowConfirmModal(false);
    try {
      const res = await fetchApi('/api/admin/backup/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: triggerType }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.Data) {
        const initialJob = json.Data as BackupJob;
        setActiveJobUid(initialJob.job_uid);
        setActiveJob(initialJob);
        startPolling(initialJob.job_uid);
        toast.success('Backup berhasil dipicu! Silakan pantau status berjalan.');
      } else {
        toast.error(json.Message || 'Gagal memicu backup');
      }
    } catch {
      toast.error('Gagal memicu backup. Hubungi sistem administrator.');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleDownload = async (jobUid: string, type: string, dateStr: string) => {
    try {
      toast.info('Menyiapkan download backup terenkripsi...');
      const res = await fetchApi(`/api/admin/backup/download/${jobUid}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.Message || 'Gagal mendownload backup');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_sindas_${type}_${dateStr.split('T')[0]}.dump.gpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download file backup berhasil dimulai');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mendownload file backup');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Database className="w-7 h-7 text-slate-800" />
          Manajemen &amp; Backup Basis Data
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">
          Kelola pencadangan basis data PostgreSQL, pantau job asinkron, dan unduh arsip terenkripsi.
        </p>
      </div>

      {/* Grid: Trigger + Active Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trigger Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-black text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              Picu Pencadangan Manual
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Jalankan backup langsung dari server tanpa SSH. File dump PostgreSQL akan dienkripsi dengan sandi GPG (AES256).
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Pilih Tipe Backup</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTriggerType('weekly')}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${
                  triggerType === 'weekly'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Weekly (Mingguan)
                <span className="block text-[10px] font-medium opacity-80 mt-0.5">Retensi 3 Bulan</span>
              </button>
              <button
                onClick={() => setTriggerType('annual')}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${
                  triggerType === 'annual'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Annual (Tahunan)
                <span className="block text-[10px] font-medium opacity-80 mt-0.5">Retensi 5 Tahun</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isTriggering || (activeJob ? (activeJob.status === 'PENDING' || activeJob.status === 'RUNNING') : false)}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/10"
          >
            {isTriggering ? 'Memproses...' : 'Mulai Backup Sekarang'}
          </button>
        </div>

        {/* Monitoring Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="font-black text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              Status Backup Terakhir / Berjalan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau status pencadangan yang baru saja dipicu secara real-time.
            </p>
          </div>

          {activeJob ? (
            <div className="my-auto py-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">TIPE BACKUP</span>
                  <span className="block text-sm font-black text-slate-800 capitalize">{activeJob.type}</span>
                </div>
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">STATUS JOB</span>
                  <div className="mt-1 flex items-center">
                    {activeJob.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Pending
                      </span>
                    )}
                    {activeJob.status === 'RUNNING' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Running
                      </span>
                    )}
                    {activeJob.status === 'SUCCESS' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    )}
                    {activeJob.status === 'FAILED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-600">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Mulai</span>
                  <span>{activeJob.started_at ? new Date(activeJob.started_at).toLocaleTimeString('id-ID') : '—'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Durasi</span>
                  <span>{activeJob.duration_seconds !== null ? `${activeJob.duration_seconds} detik` : '—'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Ukuran</span>
                  <span>{activeJob.file_size || '—'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Dipicu Oleh</span>
                  <span>{activeJob.triggered_by ? activeJob.triggered_by_name : 'Otomatis (Cron)'}</span>
                </div>
              </div>

              {activeJob.status === 'FAILED' && activeJob.error_message && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black text-red-700 uppercase tracking-wider">Pesan Kesalahan</span>
                    <span className="text-xs text-red-600 leading-relaxed font-semibold">{activeJob.error_message}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto py-10 text-center text-slate-400 text-sm font-medium flex flex-col items-center justify-center gap-2">
              <Database className="w-10 h-10 opacity-20" />
              <span>Belum ada backup yang dipicu pada sesi ini.</span>
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Keamanan Terjamin: File backup dienkripsi dengan GPG AES256.
            </span>
          </div>
        </div>
      </div>

      {/* Riwayat Backup */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-black text-slate-900">Riwayat &amp; Log Backup</h2>
            <p className="text-xs text-slate-400 mt-0.5">Catatan seluruh pencadangan otomatis (cron) maupun manual.</p>
          </div>
          <button
            onClick={() => fetchJobs(page)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu Backup</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Tipe</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Ukuran</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Durasi</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Dipicu Oleh</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoadingList ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="p-4">
                      <div className="h-5 bg-slate-100 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm font-medium">
                    Belum ada riwayat backup database.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.job_uid} className="transition-colors hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {new Date(job.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(job.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-semibold text-slate-700 capitalize">{job.type}</span>
                    </td>
                    <td className="p-4 text-center">
                      {job.status === 'SUCCESS' && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Success
                        </span>
                      )}
                      {job.status === 'FAILED' && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-red-50 text-red-700 border border-red-100">
                          Failed
                        </span>
                      )}
                      {job.status === 'RUNNING' && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 animate-pulse">
                          Running
                        </span>
                      )}
                      {job.status === 'PENDING' && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-semibold text-xs text-slate-700">{job.file_size || '—'}</td>
                    <td className="p-4 text-center font-semibold text-xs text-slate-700">
                      {job.duration_seconds !== null ? `${job.duration_seconds}s` : '—'}
                    </td>
                    <td className="p-4 text-center font-semibold text-xs text-slate-700">
                      {job.triggered_by ? (
                        <span className="text-blue-600">{job.triggered_by_name}</span>
                      ) : (
                        <span className="text-slate-400">Otomatis (Cron)</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {job.status === 'SUCCESS' && job.has_file ? (
                        <button
                          onClick={() => handleDownload(job.job_uid, job.type, job.created_at)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      ) : job.status === 'FAILED' && job.error_message ? (
                        <button
                          onClick={() => toast.error(job.error_message || 'Gagal tanpa detail')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Lihat Error
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Menampilkan halaman {page} dari {totalPages} ({totalJobs} total data)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 h-fit">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Konfirmasi Backup Manual</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                  Anda yakin ingin memulai pencadangan database manual tipe <span className="font-bold text-slate-800 capitalize">{triggerType}</span> sekarang? 
                  Proses ini akan berjalan di background dan mungkin memakan waktu beberapa menit tergantung beban server.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleTriggerBackup}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-600/10"
              >
                Ya, Mulai Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}