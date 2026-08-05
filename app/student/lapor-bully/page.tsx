'use client';
import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, Eye, EyeOff, Upload, X, CheckCircle2,
  AlertTriangle, ChevronRight, Loader2, ImageIcon, FileWarning
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilePreview {
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const JENIS_BULLY_OPTIONS = [
  { value: 'Verbal',           label: '💬 Verbal', desc: 'Kata-kata kasar, hinaan, ancaman lisan' },
  { value: 'Fisik',            label: '👊 Fisik',  desc: 'Pemukulan, tendangan, menyakiti secara fisik' },
  { value: 'Cyberbullying',    label: '💻 Cyberbullying', desc: 'Perundungan via media sosial, pesan, atau platform online' },
  { value: 'Sosial/Pengucilan',label: '🚫 Sosial / Pengucilan', desc: 'Dikucilkan, dipermalukan di depan banyak orang' },
  { value: 'Lainnya',          label: '❓ Lainnya', desc: 'Bentuk perundungan lain yang tidak tercantum' },
];

const URGENSI_OPTIONS = [
  {
    value: 'Rendah',
    label: '🟢 Rendah',
    desc: 'Kejadian tidak mendesak, tidak ada ancaman fisik langsung. Perlu ditindaklanjuti dalam beberapa hari ke depan.',
    color: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    activeColor: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-100',
  },
  {
    value: 'Sedang',
    label: '🟡 Sedang',
    desc: 'Kejadian berulang atau cukup serius. Perlu segera ditindaklanjuti.',
    color: 'border-yellow-300 bg-yellow-50 text-yellow-800',
    activeColor: 'ring-2 ring-yellow-500 border-yellow-500 bg-yellow-100',
  },
  {
    value: 'Tinggi/Darurat',
    label: '🔴 Tinggi / Darurat',
    desc: 'Gunakan HANYA untuk kejadian yang membahayakan keselamatan fisik saat ini juga. Notifikasi akan dikirim segera ke Guru BK.',
    color: 'border-red-300 bg-red-50 text-red-800',
    activeColor: 'ring-2 ring-red-500 border-red-500 bg-red-100',
  },
];

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function LaporBullyPage() {
  const router = useRouter();

  // Form state
  const [isAnonim, setIsAnonim]                   = useState(false);
  const [jenisBully, setJenisBully]               = useState('');
  const [namaTerlapor, setNamaTerlapor]           = useState('');
  const [kelasTerlapor, setKelasTerlapor]         = useState('');
  const [deskripsi, setDeskripsi]                 = useState('');
  const [lokasi, setLokasi]                       = useState('');
  const [tanggalKejadian, setTanggalKejadian]     = useState('');
  const [tingkatUrgensi, setTingkatUrgensi]       = useState('');

  // UI state
  const [step, setStep]             = useState<'form' | 'upload' | 'done'>('form');
  const [reportUID, setReportUID]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  // Upload state
  const [files, setFiles]           = useState<FilePreview[]>([]);
  const [uploadingAll, setUploadingAll] = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // ── Submit laporan utama ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!jenisBully)      { setError('Pilih jenis bully terlebih dahulu.'); return; }
    if (!tingkatUrgensi)  { setError('Pilih tingkat urgensi terlebih dahulu.'); return; }
    if (deskripsi.trim().length < 20) { setError('Deskripsi kejadian minimal 20 karakter.'); return; }

    setSubmitting(true);
    try {
      const res = await fetchApi('/api/siswa/bully-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_bully:        jenisBully,
          nama_terlapor:      namaTerlapor,
          kelas_terlapor:     kelasTerlapor,
          deskripsi_kejadian: deskripsi.trim(),
          lokasi_kejadian:    lokasi,
          tanggal_kejadian:   tanggalKejadian || undefined,
          is_anonim:          isAnonim,
          tingkat_urgensi:    tingkatUrgensi,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setReportUID(json.report_uid);
        setStep('upload');
      } else {
        setError(json.error || 'Gagal mengirim laporan. Coba lagi.');
      }
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── File picker ───────────────────────────────────────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const remaining = MAX_FILES - files.length;

    let newFiles: FilePreview[] = [];
    for (const file of selected.slice(0, remaining)) {
      // Validasi tipe (frontend saja, backend re-validates via magic bytes)
      if (!ALLOWED_TYPES.includes(file.type)) {
        continue; // skip, akan ditampilkan sebagai error di UI jika perlu
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        continue;
      }
      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [files.length]);

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // ── Upload semua foto ─────────────────────────────────────────────────────
  const handleUploadAll = async () => {
    if (files.length === 0) {
      setStep('done');
      return;
    }
    setUploadingAll(true);

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'done') continue;
      updated[i] = { ...updated[i], status: 'uploading' };
      setFiles([...updated]);

      try {
        const formData = new FormData();
        formData.append('file', updated[i].file);
        const res = await fetchApi(`/api/siswa/bully-report/${reportUID}/attachments`, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          updated[i] = { ...updated[i], status: 'done' };
        } else {
          updated[i] = { ...updated[i], status: 'error', errorMsg: json.error || 'Gagal upload' };
        }
      } catch {
        updated[i] = { ...updated[i], status: 'error', errorMsg: 'Tidak dapat terhubung' };
      }
      setFiles([...updated]);
    }

    setUploadingAll(false);
    setStep('done');
  };

  // ─── RENDER: Langkah Selesai ──────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan Berhasil Dikirim</h1>
        <p className="text-slate-500 leading-relaxed">
          Laporanmu telah diterima dan akan ditindaklanjuti oleh Guru BK sekolahmu.
          Kamu tidak perlu khawatir — laporanmu aman.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
          <p className="text-xs text-slate-400 font-mono mb-1">Nomor Referensi Laporan</p>
          <p className="font-mono text-sm text-slate-700 break-all">{reportUID}</p>
        </div>
        <button
          onClick={() => router.push('/student/home')}
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  // ─── RENDER: Langkah Upload Foto ──────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Opsional</p>
          <h1 className="text-3xl font-bold text-slate-900">Lampirkan Foto Bukti</h1>
          <p className="text-slate-500 mt-1">
            Foto bukti memperkuat laporanmu. Hanya Guru BK sekolahmu yang bisa melihat foto ini.
            Kamu bisa melewati langkah ini jika tidak ada foto.
          </p>
        </div>

        {/* Upload Area */}
        <div
          onClick={() => files.length < MAX_FILES && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer
            ${files.length >= MAX_FILES
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
        >
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <p className="font-semibold text-slate-700">
            {files.length >= MAX_FILES ? 'Batas 5 foto tercapai' : 'Klik untuk memilih foto'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPEG, PNG, WebP · Maks {MAX_FILE_SIZE_MB} MB per foto · Maks {MAX_FILES} foto
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((f, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.previewUrl} alt="preview" className="w-full h-full object-cover" />

                {/* Status overlay */}
                {f.status === 'uploading' && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                  </div>
                )}
                {f.status === 'done' && (
                  <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                )}
                {f.status === 'error' && (
                  <div className="absolute inset-0 bg-red-900/40 flex flex-col items-center justify-center p-2">
                    <FileWarning className="w-6 h-6 text-white mb-1" />
                    <p className="text-white text-xs text-center">{f.errorMsg}</p>
                  </div>
                )}

                {/* Remove button */}
                {f.status === 'pending' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep('done')}
            disabled={uploadingAll}
            className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Lewati
          </button>
          <button
            onClick={handleUploadAll}
            disabled={uploadingAll || files.length === 0}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadingAll ? 'Mengupload...' : `Upload ${files.length} Foto`}
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: Form Utama ───────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Siswa</p>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Laporkan Bully
        </h1>
        <p className="text-slate-500 mt-2 leading-relaxed">
          Laporanmu akan diterima oleh Guru BK sekolahmu. Kamu bisa memilih untuk tetap anonim
          — identitasmu tidak akan ditampilkan kepada siapa pun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Toggle Anonim ─────────────────────────────────────────────── */}
        <div className={`p-5 rounded-2xl border-2 transition-all ${isAnonim
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-slate-200 bg-white'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 flex items-center gap-2">
                {isAnonim ? <EyeOff className="w-4 h-4 text-indigo-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                Laporkan Secara Anonim
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {isAnonim
                  ? '✅ Namamu TIDAK akan ditampilkan ke Guru BK. Laporan tetap dicatat sistem untuk keamanan.'
                  : 'Guru BK akan melihat namamu sebagai pelapor. Ini memudahkan tindak lanjut jika diperlukan.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonim(!isAnonim)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 mt-0.5
                ${isAnonim ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${isAnonim ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* ── Jenis Bully ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <label className="block font-semibold text-slate-900">
            Jenis Bully <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {JENIS_BULLY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setJenisBully(opt.value)}
                className={`text-left p-3 rounded-xl border-2 transition-all
                  ${jenisBully === opt.value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}
              >
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className={`text-xs mt-0.5 ${jenisBully === opt.value ? 'text-slate-300' : 'text-slate-400'}`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Data Terlapor (Opsional) ────────────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-slate-700 text-sm">Data Terlapor <span className="text-slate-400 font-normal">(Opsional — isi jika diketahui)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Nama Terlapor</label>
              <input
                id="nama-terlapor"
                type="text"
                value={namaTerlapor}
                onChange={(e) => setNamaTerlapor(e.target.value)}
                placeholder="Nama pelaku (jika diketahui)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Kelas Terlapor</label>
              <input
                id="kelas-terlapor"
                type="text"
                value={kelasTerlapor}
                onChange={(e) => setKelasTerlapor(e.target.value)}
                placeholder="Misal: X IPA 2"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
              />
            </div>
          </div>
        </div>

        {/* ── Deskripsi Kejadian ──────────────────────────────────────────── */}
        <div className="space-y-2">
          <label htmlFor="deskripsi" className="block font-semibold text-slate-900">
            Deskripsi Kejadian <span className="text-red-500">*</span>
          </label>
          <textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={5}
            placeholder="Ceritakan kejadian secara kronologis. Semakin detail, semakin mudah Guru BK menindaklanjuti. (minimal 20 karakter)"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none bg-white"
          />
          <p className={`text-xs text-right ${deskripsi.length < 20 ? 'text-red-400' : 'text-slate-400'}`}>
            {deskripsi.length} karakter {deskripsi.length < 20 ? `(minimal 20)` : '✓'}
          </p>
        </div>

        {/* ── Lokasi & Tanggal ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lokasi" className="block font-semibold text-slate-900 mb-2">Lokasi Kejadian</label>
            <input
              id="lokasi"
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Misal: Kantin, toilet lantai 2"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            />
          </div>
          <div>
            <label htmlFor="tanggal-kejadian" className="block font-semibold text-slate-900 mb-2">Tanggal Kejadian</label>
            <input
              id="tanggal-kejadian"
              type="date"
              value={tanggalKejadian}
              onChange={(e) => setTanggalKejadian(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            />
          </div>
        </div>

        {/* ── Tingkat Urgensi ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <label className="block font-semibold text-slate-900">
            Tingkat Urgensi <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {URGENSI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTingkatUrgensi(opt.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all
                  ${tingkatUrgensi === opt.value ? opt.activeColor : `${opt.color} opacity-70 hover:opacity-100`}`}
              >
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-xs mt-0.5 opacity-80">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <button
          id="btn-submit-laporan"
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-base transition-all active:scale-95 shadow-lg shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim Laporan...</>
          ) : (
            <><ShieldAlert className="w-5 h-5" /> Kirim Laporan<ChevronRight className="w-4 h-4" /></>
          )}
        </button>

        <p className="text-center text-xs text-slate-400">
          Dengan mengirim laporan, kamu menyetujui bahwa informasi yang disampaikan adalah benar.
          Laporan palsu dapat merugikan orang lain.
        </p>
      </form>
    </div>
  );
}
