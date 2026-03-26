'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export default function CreateKategoriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name_category: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name_category: formData.name_category,
        description: formData.description,
      };

      const res = await fetchApi('/api/category/createCategory', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Kategori tes berhasil ditambahkan!');
        router.push('/pakar/typeTes');
      } else {
        toast.error(json.Message || json.error || 'Gagal menyimpan kategori.');
      }
    } catch (error) {
      toast.error('Kesalahan jaringan, gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 fade-in slide-in-from-bottom-4">
      <Link href="/pakar/typeTes" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Kategori
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Input Kategori Tes Baru</h2>
          <p className="text-slate-500 text-sm mt-1">Tambahkan atau sesuaikan deskripsi kategori agar lebih dipahami pengguna.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nama Kategori</label>
            <input 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-base font-semibold transition-colors" 
              placeholder="Contoh: Kecemasan, Depresi..." 
              required 
              value={formData.name_category}
              onChange={set('name_category')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Deskripsi Singkat</label>
            <textarea
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none min-h-[140px] resize-y text-sm text-slate-600 leading-relaxed transition-colors"
              placeholder="Jelaskan tujuan atau pengertian kategori tes ini..."
              value={formData.description}
              onChange={set('description')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/pakar/typeTes" className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={loading} className="px-8 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-all disabled:bg-slate-300">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
