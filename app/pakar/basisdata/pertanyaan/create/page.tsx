'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface TypeTes {
  category_penyakit_uid: string;
  nama_category: string;
}

export default function CreatePertanyaanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [typeTesList, setTypeTesList] = useState<TypeTes[]>([]);

  React.useEffect(() => {
    const fetchTypeTes = async () => {
      try {
        const res = await fetchApi('/api/tesType/getAllTypeTes');
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setTypeTesList(json.Data || json.data || []);
        }
      } catch (e) {
        toast.error('Gagal memuat kategori tes dari server');
      }
    };
    fetchTypeTes();
  }, []);

  const [formData, setFormData] = useState({
    kode_pertanyaan: '',
    kategori_pertanyaan: '',
    pertanyaan: '',
    bobot: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        kode_pertanyaan: formData.kode_pertanyaan,
        kategori_pertanyaan: formData.kategori_pertanyaan,
        pertanyaan: formData.pertanyaan,
        bobot: Number(formData.bobot),
      };

      // API Golang menggunakan controller SavePertanyaan
      const res = await fetchApi('/api/pertanyaan/createPertanyaan', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Pertanyaan berhasil ditambahkan!');
        router.push('/pakar/basisdata/pertanyaan');
      } else {
        toast.error(json.Message || json.error || 'Gagal menyimpan pertanyaan.');
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

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-base";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/pakar/basisdata/pertanyaan" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Pertanyaan
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Pertanyaan Baru</h1>
        <p className="text-slate-500 text-base mt-2">Buat kuesioner gejala atau parameter ukur sistem pakar.</p>
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
                  placeholder="Contoh: G01"
                  required
                  value={formData.kode_pertanyaan}
                  onChange={set('kode_pertanyaan')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori Pertanyaan</label>
                <select
                  className={inputClass}
                  required
                  value={formData.kategori_pertanyaan}
                  onChange={(e) => setFormData(f => ({ ...f, kategori_pertanyaan: e.target.value }))}
                >
                  <option value="" disabled>Pilih Kategori Tes</option>
                  {typeTesList.map(t => (
                    <option key={t.category_penyakit_uid} value={t.nama_category}>
                      {t.nama_category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Isi Pertanyaan (Gejala Khusus)</label>
                <textarea
                  className={`${inputClass} min-h-[100px] resize-y`}
                  placeholder="Tuliskan pertanyaan kuisioner gejala di sini..."
                  required
                  value={formData.pertanyaan}
                  onChange={set('pertanyaan')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Bobot (Desimal)</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  placeholder="Contoh: 0.8"
                  required
                  value={formData.bobot}
                  onChange={set('bobot')}
                />
                <p className="text-xs text-slate-500 font-medium">Nilai kepastian CF pakar dalam rentang (0.01 - 1.00)</p>
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
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pertanyaan
          </button>
        </div>
      </form>
    </div>
  );
}
