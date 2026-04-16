'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export default function EditPenyakitPage() {
  const router = useRouter();
  const params = useParams();
  const penyakitUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Default state form
  const [formData, setFormData] = useState({
    kode_penyakit: '',
    nama_penyakit: '',
    description: '',
    saran_penanganan: '',
  });

  // ── PREFILL DATA DARI API ──
  useEffect(() => {
    if (!penyakitUid) return;
    const fetchPenyakit = async () => {
      try {
        const res = await fetchApi(`/api/penyakit/getPenyakitsByUID/${penyakitUid}`);
        const json = await res.json().catch(() => ({}));

        if (res.ok) {
          const d = json.Data || json.data || json;
          setFormData({
            kode_penyakit: d.kode_penyakit ?? '',
            nama_penyakit: d.nama_penyakit ?? '',
            description: d.description ?? '',
            saran_penanganan: d.saran_penanganan ?? '',
          });
        } else {
          toast.error(json.Message || json.error || 'Gagal memuat penyakit', { id: 'fetch-error' });
          router.push('/pakar/basisdata/penyakit');
        }
      } catch {
        toast.error('Koneksi ke server terputus', { id: 'fetch-error' });
        router.push('/pakar/basisdata/penyakit');
      } finally {
        setLoadingPage(false);
      }
    };
    fetchPenyakit();
  }, [penyakitUid, router]);

  // ── SUBMIT PERUBAHAN ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const payload = {
        kode_penyakit: formData.kode_penyakit,
        nama_penyakit: formData.nama_penyakit,
        description: formData.description,
        saran_penanganan: formData.saran_penanganan,
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
        toast.error(json.Message || json.error || 'Gagal mengubah penyakit.');
      }
    } catch (error) {
      toast.error('Kesalahan jaringan, gagal menghubungi server.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((f) => ({ ...f, [field]: e.target.value }));

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-base";

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
      <Link href="/pakar/basisdata/penyakit" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Penyakit
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ubah Penyakit</h1>
        <p className="text-slate-500 text-base mt-2">Perbarui deskripsi atau solusi dari penyakit terkait.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">

          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-emerald-600" /> Detail Penyakit
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kode Penyakit</label>
                <input
                  type="text"
                  className={inputClass}
                  required
                  value={formData.kode_penyakit}
                  onChange={set('kode_penyakit')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Penyakit</label>
                <input
                  type="text"
                  className={inputClass}
                  required
                  value={formData.nama_penyakit}
                  onChange={set('nama_penyakit')}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Deskripsi Singkat</label>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y`}
                  required
                  value={formData.description}
                  onChange={set('description')}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Saran Penanganan</label>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y`}
                  required
                  value={formData.saran_penanganan}
                  onChange={set('saran_penanganan')}
                />
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/pakar/basisdata/penyakit" className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
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
