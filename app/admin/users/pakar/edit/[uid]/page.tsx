'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Stethoscope, Lock, UserCircle, Trash2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function EditPakar() {
  const router = useRouter();
  const params = useParams();
  const pakarUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form State (field name sesuai backend struct) ──────────────────────────
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nomor_sip: '',       // json:"nomor_sip"
    jenis_spesialis: '', // json:"jenis_spesialis"
    phone: '',           // json:"phone"
    alamat: '',
    email: '',
    password: '',        // kosong = tidak ganti
  });

  // ── Foto State ─────────────────────────────────────────────────────────────
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);

  // ── Pre-fill dari API ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!pakarUid) return;
    const fetchPakar = async () => {
      try {
        const res = await fetchApi(`/api/users/getPakarById/${pakarUid}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          const d = json.Data || json.data || json;
          setFormData({
            nama_lengkap: d.nama_lengkap ?? '',
            nomor_sip: d.nomor_sip ?? d.no_sip ?? '',
            jenis_spesialis: d.jenis_spesialis ?? d.spesialisasi ?? '',
            phone: d.phone ?? d.no_hp ?? '',
            alamat: d.alamat ?? '',
            email: d.email ?? '',
            password: '',
          });
          // Jika ada foto yang sudah tersimpan
          if (d.photo_url || d.foto) {
            setExistingPhotoUrl(d.photo_url || d.foto);
          }
        } else {
          toast.error(json.Message || 'Gagal memuat data pakar');
          router.push('/admin/users/pakar');
        }
      } catch {
        toast.error('Koneksi ke server gagal');
        router.push('/admin/users/pakar');
      } finally {
        setLoadingPage(false);
      }
    };
    fetchPakar();
  }, [pakarUid, router]);

  // ── Handler Foto ───────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB');
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setRemoveExistingPhoto(false);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setExistingPhotoUrl(null);
    setRemoveExistingPhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Foto akan dihapus saat disimpan');
  };

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((f) => ({ ...f, [field]: e.target.value }));

  // ── Submit Update ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      const payload: any = {
        nama_lengkap: formData.nama_lengkap,
        nomor_sip: formData.nomor_sip,
        jenis_spesialis: formData.jenis_spesialis,
        phone: formData.phone,
        alamat: formData.alamat,
        email: formData.email,
      };

      // Password hanya kirim jika diisi
      if (formData.password) payload.password = formData.password;

      // Foto baru → kirim sebagai base64
      if (photoBase64) payload.photo_file = photoBase64;

      const res = await fetchApi(`/api/users/updatePakar/${pakarUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Data pakar berhasil diperbarui!');
        router.push('/admin/users/pakar');
      } else {
        toast.error(json.error || json.Message || json.message || 'Gagal memperbarui data pakar');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ── Tentukan foto yang ditampilkan di preview ──────────────────────────────
  const displayPhoto = photoPreview ?? existingPhotoUrl;

  const inputClass =
    'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all text-base';

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Memuat data pakar...</p>
        </div>
      </div>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <Link href="/admin/users/pakar" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Pakar
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Data Pakar</h1>
        <p className="text-slate-500 text-base mt-2">Perbarui informasi pakar. Kosongkan password jika tidak ingin menggantinya.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-10 space-y-10">

          {/* ── FOTO PROFIL ── */}
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCircle className="w-5 h-5 text-purple-600" /> Foto Profil
            </h2>
            <div className="flex items-center gap-6">
              {/* Preview */}
              <div className="w-28 h-28 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative">
                {displayPhoto ? (
                  <img
                    src={displayPhoto.startsWith('http') ? displayPhoto : `${API_BASE}${displayPhoto}`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <UserCircle className="w-12 h-12 text-slate-300" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Foto dokter / pakar</p>
                <p className="text-xs text-slate-400">
                  {existingPhotoUrl && !photoPreview
                    ? 'Foto saat ini sudah ada. Upload baru untuk menggantinya.'
                    : 'Format JPG, PNG. Maks. 2MB.'}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer px-4 py-2 bg-purple-50 text-purple-700 text-sm font-semibold rounded-xl hover:bg-purple-100 transition-all border border-purple-200"
                  >
                    {displayPhoto ? 'Ganti Foto' : 'Upload Foto'}
                  </label>
                  <input
                    id="photo-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {displayPhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 transition-all flex items-center gap-1.5 border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                    </button>
                  )}
                </div>
                {photoPreview && (
                  <p className="text-xs text-green-600 font-medium">✓ Foto baru dipilih, akan disimpan saat submit</p>
                )}
              </div>
            </div>
          </section>

          {/* ── PROFIL PROFESIONAL ── */}
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Stethoscope className="w-5 h-5 text-purple-600" /> Informasi Profesional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap &amp; Gelar</label>
                <input className={inputClass} placeholder="Dr. Sarah Smith, M.Psi" required value={formData.nama_lengkap} onChange={set('nama_lengkap')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nomor SIP (Izin Praktik)</label>
                <input className={inputClass} placeholder="SIP/2026/XXX" required value={formData.nomor_sip} onChange={set('nomor_sip')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Jenis Spesialisasi</label>
                <select className={inputClass} required value={formData.jenis_spesialis} onChange={set('jenis_spesialis')}>
                  <option value="">Pilih Spesialisasi</option>
                  <option value="Psikolog Klinis">Psikolog Klinis</option>
                  <option value="Psikiater (Sp.KJ)">Psikiater (Sp.KJ)</option>
                  <option value="Konselor Kesehatan Mental">Konselor Kesehatan Mental</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">No. Telepon Aktif</label>
                <input className={inputClass} type="tel" placeholder="0812xxxxxxxx" required value={formData.phone} onChange={set('phone')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Alamat</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all text-base resize-none"
                  placeholder="Jl. Kesehatan No. 1, Sragen"
                  value={formData.alamat}
                  onChange={set('alamat')}
                />
              </div>
            </div>
          </section>

          {/* ── AKSES SISTEM ── */}
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-purple-600" /> Akses Sistem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Alamat Email</label>
                <input className={inputClass} type="email" placeholder="sarah@pakar.com" required value={formData.email} onChange={set('email')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password Baru
                  <span className="ml-1 text-xs text-slate-400 font-normal">(kosongkan jika tidak diganti)</span>
                </label>
                <input className={inputClass} type="password" placeholder="••••••••" value={formData.password} onChange={set('password')} />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/admin/users/pakar" className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loadingSubmit}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-sm"
          >
            {loadingSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
