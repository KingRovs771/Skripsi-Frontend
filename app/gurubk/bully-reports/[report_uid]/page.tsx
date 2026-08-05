'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldAlert, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  WifiOff, User, MapPin, Calendar, Clock, Save, ImageIcon, X
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Attachment {
  attachment_id: number;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface ReportDetail {
  report_uid: string;
  jenis_bully: string;
  nama_terlapor: string;
  kelas_terlapor: string;
  deskripsi_kejadian: string;
  lokasi_kejadian: string;
  tanggal_kejadian: string | null;
  is_anonim: boolean;
  nama_pelapor: string;
  tingkat_urgensi: string;
  status: string;
  ditangani_oleh: string;
  catatan_penanganan: string;
  notifikasi_terkirim: boolean;
  created_at: string;
  attachments: Attachment[];
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Bukti laporan"
        className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function UrgensiBadge({ urgensi }: { urgensi: string }) {
  const map: Record<string, string> = {
    'Rendah':         'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Sedang':         'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Tinggi/Darurat': 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold border ${map[urgensi] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {urgensi === 'Tinggi/Darurat' ? '🔴' : urgensi === 'Sedang' ? '🟡' : '🟢'} {urgensi}
    </span>
  );
}

const STATUS_OPTIONS = ['BARU', 'DITINDAKLANJUTI', 'SELESAI', 'DITOLAK'] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BullyReportDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const reportUID = params.report_uid as string;

  const [report, setReport]           = useState<ReportDetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Form update status
  const [newStatus, setNewStatus]     = useState('');
  const [catatan, setCatatan]         = useState('');
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError]     = useState('');

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetchApi(`/api/gurubk/bully-reports/${reportUID}`, { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const d: ReportDetail = json.Data;
        setReport(d);
        setNewStatus(d.status);
        setCatatan(d.catatan_penanganan || '');
      } else {
        setError(json.error || 'Laporan tidak ditemukan.');
      }
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, [reportUID]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleSaveStatus = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetchApi(`/api/gurubk/bully-reports/${reportUID}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, catatan_penanganan: catatan }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaveSuccess(true);
        setReport((prev) => prev ? { ...prev, status: newStatus, catatan_penanganan: catatan } : prev);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(json.error || 'Gagal menyimpan.');
      }
    } catch {
      setSaveError('Tidak dapat terhubung ke server.');
    } finally {
      setSaving(false);
    }
  };

  const openAttachment = (attachmentId: number) => {
    const src = `/api/gurubk/bully-reports/${reportUID}/attachments/${attachmentId}`;
    setLightboxSrc(src);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
        <p className="text-slate-700 font-semibold">{error || 'Laporan tidak ditemukan.'}</p>
        <button onClick={() => router.back()} className="text-slate-500 underline text-sm">← Kembali</button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc('')} />}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back + Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Detail Laporan</p>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                Laporan Bully
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">{report.report_uid}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <UrgensiBadge urgensi={report.tingkat_urgensi} />
              {!report.notifikasi_terkirim && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold">
                  <WifiOff className="w-3.5 h-3.5" /> Notif belum terkirim
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pelapor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Pelapor
            </p>
            <p className="font-bold text-slate-900">{report.nama_pelapor}</p>
            {report.is_anonim && (
              <p className="text-xs text-indigo-500 font-medium">🔒 Identitas disembunyikan dari Guru BK</p>
            )}
          </div>

          {/* Terlapor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Terlapor</p>
            <p className="font-bold text-slate-900">{report.nama_terlapor || <span className="text-slate-400 font-normal italic">Tidak disebutkan</span>}</p>
            {report.kelas_terlapor && (
              <p className="text-sm text-slate-500">{report.kelas_terlapor}</p>
            )}
          </div>

          {/* Lokasi */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Lokasi
            </p>
            <p className="font-semibold text-slate-900">{report.lokasi_kejadian || <span className="text-slate-400 font-normal italic">Tidak dicantumkan</span>}</p>
          </div>

          {/* Tanggal */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Tanggal Kejadian
            </p>
            <p className="font-semibold text-slate-900">
              {report.tanggal_kejadian
                ? new Date(report.tanggal_kejadian).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                : <span className="text-slate-400 font-normal italic">Tidak dicantumkan</span>}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Dilaporkan: {new Date(report.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Jenis Bully */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Jenis Bully</p>
          <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm">
            {report.jenis_bully}
          </span>
        </div>

        {/* Deskripsi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Deskripsi Kejadian</p>
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{report.deskripsi_kejadian}</p>
        </div>

        {/* Lampiran Foto */}
        {report.attachments && report.attachments.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Foto Bukti ({report.attachments.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {report.attachments.map((att) => (
                <button
                  key={att.attachment_id}
                  onClick={() => openAttachment(att.attachment_id)}
                  className="aspect-square rounded-xl border-2 border-slate-200 bg-slate-100 hover:border-slate-400 transition-all overflow-hidden flex items-center justify-center group"
                >
                  {/* Placeholder thumbnail — gambar akan di-load saat diklik */}
                  <div className="flex flex-col items-center gap-1 p-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <ImageIcon className="w-6 h-6" />
                    <p className="text-xs text-center">{Math.round(att.file_size / 1024)} KB</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">Klik thumbnail untuk melihat foto ukuran penuh.</p>
          </div>
        )}

        {/* Panel Update Status */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-4">
          <p className="font-bold text-slate-900">Tindak Lanjut</p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status Laporan</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewStatus(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                    ${newStatus === s
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {s === 'BARU' ? '🔵 Baru' :
                   s === 'DITINDAKLANJUTI' ? '🟠 Ditindaklanjuti' :
                   s === 'SELESAI' ? '🟢 Selesai' : '⚫ Ditolak'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="catatan-penanganan" className="block text-sm font-semibold text-slate-700 mb-2">
              Catatan Penanganan
            </label>
            <textarea
              id="catatan-penanganan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              placeholder="Tuliskan langkah tindak lanjut yang sudah atau akan dilakukan..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          {saveError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Status berhasil diperbarui.
            </div>
          )}

          <button
            id="btn-save-status"
            onClick={handleSaveStatus}
            disabled={saving}
            className="w-full py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </>
  );
}
