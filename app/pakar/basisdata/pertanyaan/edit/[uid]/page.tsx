'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export default function EditPertanyaanPage() {
  const router = useRouter();
  const params = useParams();
  const pertanyaanUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    kode_pertanyaan: '',
    kategori_pertanyaan: '',
    pertanyaan: '',
    bobot: 0,
  });

  // ── PREFILL DATA DARI API ──
  useEffect(() => {
    if (!pertanyaanUid) return;
    const loadPertanyaan = async () => {
      try {
        const res = await fetchApi(`/api/pertanyaan/getPertanyaanByUID/${pertanyaanUid}`);
        const json = await res.json().catch(() => ({}));
        
        if (res.ok) {
          const d = json.Data || json.data || json;
          setFormData({
            kode_pertanyaan: d.kode_pertanyaan ?? '',
            kategori_pertanyaan: d.kategori_pertanyaan ?? '',
            pertanyaan: d.pertanyaan ?? '',
            bobot: Number(d.bobot ?? 0),
          });
        } else {
          toast.error(json.Message || json.error || 'Gagal memuat pertanyaan', { id: 'fetch-error' });
          router.push('/pakar/basisdata/pertanyaan');
        }
      } catch {
        toast.error('Koneksi ke server terputus', { id: 'fetch-error' });
        router.push('/pakar/basisdata/pertanyaan');
      } finally {
        setLoadingPage(false);
      }
    };
    loadPertanyaan();
  }, [pertanyaanUid, router]);

  // ── SUBMIT PERUBAHAN ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const payload = {
        kode_pertanyaan: formData.kode_pertanyaan,
        kategori_pertanyaan: formData.kategori_pertanyaan,
        pertanyaan: formData.pertanyaan,
        bobot: Number(formData.bobot),
      };

      const res = await fetchApi(`/api/pertanyaan/updatePertanyaan/${pertanyaanUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Menangkap error JSON jika backend ada return response JSON
      const json = await res.json().catch(() => ({}));

      // Mengambil ok meskipun json kosong karena bug API Golang (c.JSON missing di UpdatePertanyaan)
      if (res.ok || json.Status === 'OK') {
        toast.success('Pertanyaan berhasil diperbarui!');
        router.push('/pakar/basisdata/pertanyaan');
      } else {
        toast.error(json.Message || json.error || 'Gagal mengubah pertanyaan.');
      }
    } catch (error) {
      toast.error('Gagal menghubungi server. Apakah backend sudah diperbaiki?');
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
          <p className="text-sm text-slate-500">Memuat data pertanyaan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/pakar/basisdata/pertanyaan" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Pertanyaan
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ubah Pertanyaan</h1>
        <p className="text-slate-500 text-base mt-2">Perbarui keterangan kuesioner atau sesuaikan nilai bobot CF Pakar.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-5 h-5 text-blue-600" /> Detail Pertanyaan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kode Pertanyaan</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  required 
                  value={formData.kode_pertanyaan}
                  onChange={set('kode_pertanyaan')}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori Pertanyaan</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  required 
                  value={formData.kategori_pertanyaan}
                  onChange={set('kategori_pertanyaan')}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Isi Pertanyaan (Gejala Khusus)</label>
                <textarea 
                  className={`${inputClass} min-h-[100px] resize-y`} 
                  required 
                  value={formData.pertanyaan}
                  onChange={set('pertanyaan')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Bobot (Rentang 0.01 - 1.00)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className={inputClass} 
                  required 
                  value={formData.bobot}
                  onChange={set('bobot')}
                />
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/pakar/basisdata/pertanyaan" className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
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
