'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export default function EditKategoriPage() {
  const router = useRouter();
  const params = useParams();
  const categoryUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    kode_category: '',
    nama_category: '',
    deskripsi: '',
  });

  // ── PREFILL DATA DARI API ──
  useEffect(() => {
    if (!categoryUid) return;
    const loadCategory = async () => {
      try {
        const res = await fetchApi(`/api/tesType/getTypeTesByUID/${categoryUid}`);
        const json = await res.json().catch(() => ({}));
        
        if (res.ok) {
          const d = json.Data || json.data || json;
          setFormData({
            kode_category: d.kode_category ?? '',
            nama_category: d.nama_category ?? '',
            deskripsi: d.Deskripsi ?? d.deskripsi ?? '',
          });
        } else {
          toast.error(json.Message || json.error || 'Gagal memuat kategori', { id: 'fetch-category' });
          router.push('/pakar/typeTes');
        }
      } catch {
        toast.error('Koneksi ke server terputus', { id: 'fetch-category' });
        router.push('/pakar/typeTes');
      } finally {
        setLoadingPage(false);
      }
    };
    loadCategory();
  }, [categoryUid, router]);

  // ── SUBMIT PERUBAHAN ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      // Pada backend Golang UpdateCategory, struct input menggunakan nama json "deskripsi", "nama_category", "kode_category"
      const payload = {
        kode_category: formData.kode_category,
        nama_category: formData.nama_category,
        deskripsi: formData.deskripsi,
      };

      const res = await fetchApi(`/api/tesType/updateTypeTes/${categoryUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      // Memanfaatkan toleransi ok dari res karena respon update bervariasi
      if (res.ok || json.Status === 'Success') {
        toast.success('Kategori tes berhasil diperbarui!');
        router.push('/pakar/typeTes');
      } else {
        toast.error(json.Message || json.error || 'Gagal mengubah kategori.');
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

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Memuat data kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 fade-in slide-in-from-bottom-4">
      <Link href="/pakar/typeTes" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Kategori
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Ubah Kategori Tes</h2>
          <p className="text-slate-500 text-sm mt-1">Tambahkan atau sesuaikan deskripsi kategori agar lebih dipahami pengguna.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Kode Kategori</label>
            <input 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-base font-semibold transition-colors" 
              placeholder="Contoh: TYTES-01" 
              required 
              value={formData.kode_category}
              onChange={set('kode_category')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nama Kategori</label>
            <input 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-base font-semibold transition-colors" 
              placeholder="Contoh: PHQ9, Kecemasan..." 
              required 
              value={formData.nama_category}
              onChange={set('nama_category')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Deskripsi Singkat</label>
            <textarea
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none min-h-[140px] resize-y text-sm text-slate-600 leading-relaxed transition-colors"
              placeholder="Jelaskan tujuan atau pengertian kategori tes ini..."
              value={formData.deskripsi}
              onChange={set('deskripsi')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/pakar/typeTes" className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={loadingSubmit} className="px-8 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-all disabled:bg-slate-300">
              {loadingSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              Perbarui Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
