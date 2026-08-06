'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export default function EditPenyakitPage() {
  const router = useRouter();
  const params = useParams();
  const penyakitUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Disease list for dropdown
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

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  // ── PREFILL DATA DARI API ──
  useEffect(() => {
    if (!penyakitUid) return;

    const fetchPenyakit = async () => {
      try {
        const [resDetail, resList] = await Promise.all([
          fetchApi(`/api/penyakit/getPenyakitsByUID/${penyakitUid}`),
          fetchApi('/api/penyakit/getAllPenyakits'),
        ]);

        const jsonDetail = await resDetail.json().catch(() => ({}));
        const jsonList = await resList.json().catch(() => ({}));

        if (resDetail.ok) {
          const d = jsonDetail.Data || jsonDetail.data || jsonDetail;
          setFormData({
            kode_penyakit: d.kode_penyakit ?? '',
            nama_penyakit: d.nama_penyakit ?? '',
            kode_turunan: d.kode_turunan ?? '',
            description: d.description ?? '',
            saran_penanganan: d.saran_penanganan ?? '',
            min_skor: d.min_skor !== undefined && d.min_skor !== null ? Number(d.min_skor) : 0,
            max_skor: d.max_skor !== undefined && d.max_skor !== null ? Number(d.max_skor) : 27,
          });
        } else {
          toast.error(jsonDetail.Message || jsonDetail.error || 'Gagal memuat data penyakit.', { id: 'fetch-error' });
          router.push('/pakar/basisdata/penyakit');
        }

        if (resList.ok) {
          const list: { kode_penyakit: string; nama_penyakit: string }[] = jsonList.Data || jsonList.data || [];
          setPenyakitList(list);
        }
      } catch {
        toast.error('Koneksi ke server terputus.', { id: 'fetch-error' });
        router.push('/pakar/basisdata/penyakit');
      } finally {
        setLoadingPage(false);
      }
    };

    fetchPenyakit();
  }, [penyakitUid, router]);

  // ── VALIDASI CLIENT-SIDE ──
  const validate = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

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

  // ── SUBMIT PERUBAHAN ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoadingSubmit(true);
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

      const res = await fetchApi(`/api/penyakit/updatePenyakit/${penyakitUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Penyakit berhasil diperbarui!');
        router.push('/pakar/basisdata/penyakit');
      } else {
        toast.error(json.Message || json.message || json.error || 'Gagal mengubah penyakit.');
      }
    } catch {
      toast.error('Kesalahan jaringan, gagal menghubungi server.');
    } finally {
      setLoadingSubmit(false);
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
    `${inputBase} ${errors[field]
      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20 focus:border-red-500'
      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
    }`;

  // ── LOADING STATE ──
  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Memuat data penyakit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link
        href="/pakar/basisdata/penyakit"
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Penyakit
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ubah Penyakit</h1>
        <p className="text-slate-500 text-base mt-2">
          Perbarui data detail penyakit/gangguan psikososial.
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
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  Kode Penyakit <Lock className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-mono font-bold uppercase"
                  value={formData.kode_penyakit}
                />
                <p className="text-xs text-slate-400">Kode penyakit tidak dapat diubah setelah disimpan.</p>
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
                  {penyakitList
                    .filter((p) => p.kode_penyakit !== formData.kode_penyakit)
                    .map((p) => (
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
              disabled={loadingSubmit}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-sm"
            >
              {loadingSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loadingSubmit ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
