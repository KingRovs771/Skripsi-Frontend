'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

// Helper to auto-generate next code
function generateNextKode(existingKodes: string[]): string {
  const nums = existingKodes
    .map((k) => {
      const match = k.toUpperCase().match(/^P(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `P${String(next).padStart(2, '0')}`;
}

export default function CreatePenyakitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingKode, setLoadingKode] = useState(true);

  // Disease list for kode_turunan dropdown
  const [penyakitList, setPenyakitList] = useState<{ kode_penyakit: string; nama_penyakit: string }[]>([]);

  const [formData, setFormData] = useState({
    kode_penyakit: '',
    nama_penyakit: '',
    kode_turunan: '',
    description: '',
    saran_penanganan: '',
    min_skor: 0,
    max_skor: 27,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // AUTO-GENERATE KODE PENYAKIT
  const generateKode = async () => {
    setLoadingKode(true);
    try {
      const res = await fetchApi('/api/penyakit/getAllPenyakits');
      const json = await res.json().catch(() => ({}));
      const list: { kode_penyakit: string; nama_penyakit: string }[] = json.Data || json.data || [];
      setPenyakitList(list);
      const kodes = list.map((p) => p.kode_penyakit).filter(Boolean);
      const nextKode = generateNextKode(kodes);
      setFormData((f) => ({ ...f, kode_penyakit: nextKode }));
    } catch {
      setFormData((f) => ({ ...f, kode_penyakit: '' }));
    } finally {
      setLoadingKode(false);
    }
  };

  useEffect(() => {
    generateKode();
  }, []);

  // CLIENT-SIDE VALIDATION
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.kode_penyakit.trim()) {
      newErrors.kode_penyakit = 'Kode penyakit wajib diisi.';
    } else if (!/^[A-Za-z0-9]+$/.test(formData.kode_penyakit)) {
      newErrors.kode_penyakit = 'Kode hanya boleh berisi huruf dan angka, tanpa spasi.';
    }

    if (!formData.nama_penyakit.trim()) {
      newErrors.nama_penyakit = 'Nama penyakit wajib diisi.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi singkat wajib diisi.';
    }

    if (!formData.saran_penanganan.trim()) {
      newErrors.saran_penanganan = 'Saran penanganan wajib diisi.';
    }

    if (formData.min_skor < 0) {
      newErrors.min_skor = 'Minimal skor tidak boleh kurang dari 0.';
    }

    if (formData.max_skor < formData.min_skor) {
      newErrors.max_skor = 'Maksimal skor tidak boleh kurang dari minimal skor.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT CREATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        kode_penyakit: formData.kode_penyakit.toUpperCase().trim(),
        nama_penyakit: formData.nama_penyakit.trim(),
        kode_turunan: formData.kode_turunan.toUpperCase().trim(),
        description: formData.description.trim(),
        saran_penanganan: formData.saran_penanganan.trim(),
        min_skor: Number(formData.min_skor),
        max_skor: Number(formData.max_skor),
      };

      const res = await fetchApi('/api/penyakit/createPenyakit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Penyakit berhasil ditambahkan!');
        router.push('/pakar/basisdata/penyakit');
      } else {
        toast.error(json.Message || json.message || json.error || 'Gagal menyimpan penyakit.');
      }
    } catch {
      toast.error('Kesalahan jaringan, gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setFormData((f) => ({ ...f, [field]: val }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const inputBase =
    'w-full px-4 py-3 bg-white border rounded-xl outline-none transition-all text-base placeholder:text-slate-400';
  const inputClass = (field: keyof typeof formData) =>
    `${inputBase} ${
      errors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-400/20 focus:border-red-500'
        : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
    }`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link
        href="/pakar/basisdata/penyakit"
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Penyakit
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Penyakit Baru</h1>
        <p className="text-slate-500 text-base mt-2">
          Daftarkan penyakit atau gangguan psikososial beserta deskripsi dan saran penanganannya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-emerald-600" /> Detail Penyakit
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Kode Penyakit */}
              <div className="space-y-2">
                <label htmlFor="kode_penyakit" className="text-sm font-semibold text-slate-700">
                  Kode Penyakit <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    {loadingKode && (
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    )}
                    <input
                      id="kode_penyakit"
                      type="text"
                      className={`${inputClass('kode_penyakit')} ${loadingKode ? 'pl-10' : ''} uppercase`}
                      placeholder={loadingKode ? 'Membuat kode...' : 'Contoh: P01'}
                      value={formData.kode_penyakit}
                      onChange={handleChange('kode_penyakit')}
                      disabled={loadingKode}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateKode}
                    disabled={loadingKode}
                    title="Regenerate kode otomatis"
                    className="shrink-0 w-11 h-11 flex items-center justify-center border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingKode ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  Kode di-generate otomatis. Anda tetap bisa mengubahnya secara manual.
                </p>
                {errors.kode_penyakit && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.kode_penyakit}
                  </p>
                )}
              </div>

              {/* Nama Penyakit */}
              <div className="space-y-2">
                <label htmlFor="nama_penyakit" className="text-sm font-semibold text-slate-700">
                  Nama Penyakit / Gangguan <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama_penyakit"
                  type="text"
                  className={inputClass('nama_penyakit')}
                  placeholder="Contoh: Depresi Sedang"
                  value={formData.nama_penyakit}
                  onChange={handleChange('nama_penyakit')}
                />
                {errors.nama_penyakit && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.nama_penyakit}
                  </p>
                )}
              </div>

              {/* Rentang Skor - Min */}
              <div className="space-y-2">
                <label htmlFor="min_skor" className="text-sm font-semibold text-slate-700">
                  Minimal Skor Validasi <span className="text-red-500">*</span>
                </label>
                <input
                  id="min_skor"
                  type="number"
                  min="0"
                  className={inputClass('min_skor')}
                  placeholder="0"
                  value={formData.min_skor}
                  onChange={handleChange('min_skor')}
                />
                <p className="text-xs text-slate-400">
                  PHQ-9: 0–27 &bull; GAD-7: 0–21. Sesuaikan dengan skala tes yang digunakan.
                </p>
                {errors.min_skor && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.min_skor}
                  </p>
                )}
              </div>

              {/* Rentang Skor - Max */}
              <div className="space-y-2">
                <label htmlFor="max_skor" className="text-sm font-semibold text-slate-700">
                  Maksimal Skor Validasi <span className="text-red-500">*</span>
                </label>
                <input
                  id="max_skor"
                  type="number"
                  min="0"
                  className={inputClass('max_skor')}
                  placeholder="27"
                  value={formData.max_skor}
                  onChange={handleChange('max_skor')}
                />
                <p className="text-xs text-slate-400">
                  Contoh: PHQ-9 maks = 27, GAD-7 maks = 21. Harus &ge; Minimal Skor.
                </p>
                {errors.max_skor && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.max_skor}
                  </p>
                )}
              </div>

              {/* Kode Turunan */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="kode_turunan" className="text-sm font-semibold text-slate-700">
                  Kode Turunan{' '}
                  <span className="text-slate-400 font-normal text-xs">(opsional — pilih penyakit induk jika ini adalah sub-penyakit)</span>
                </label>
                <select
                  id="kode_turunan"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                  value={formData.kode_turunan}
                  onChange={handleChange('kode_turunan')}
                >
                  <option value="">— Tidak ada (penyakit utama) —</option>
                  {penyakitList.map((p) => (
                    <option key={p.kode_penyakit} value={p.kode_penyakit}>
                      {p.kode_penyakit} — {p.nama_penyakit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-semibold text-slate-700">
                  Deskripsi Singkat <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  className={`${inputClass('description')} min-h-[120px] resize-y`}
                  placeholder="Jelaskan gambaran umum mengenai penyakit atau gangguan ini..."
                  value={formData.description}
                  onChange={handleChange('description')}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.description}
                  </p>
                )}
              </div>

              {/* Saran Penanganan */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="saran_penanganan" className="text-sm font-semibold text-slate-700">
                  Saran Penanganan <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="saran_penanganan"
                  className={`${inputClass('saran_penanganan')} min-h-[120px] resize-y`}
                  placeholder="Tuliskan rekomendasi atau langkah penanganan yang diberikan sistem kepada siswa..."
                  value={formData.saran_penanganan}
                  onChange={handleChange('saran_penanganan')}
                />
                {errors.saran_penanganan && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.saran_penanganan}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            <span className="text-red-500">*</span> Wajib diisi
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/pakar/basisdata/penyakit"
              className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || loadingKode}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Menyimpan...' : 'Simpan Penyakit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
