'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Link2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface Penyakit {
  penyakit_uid: string;
  kode_penyakit: string;
  nama_penyakit: string;
}

interface Pertanyaan {
  pertanyaan_uid: string;
  kode_pertanyaan: string;
  pertanyaan: string;
}

export default function CreateAturanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPenyakit, resPertanyaan] = await Promise.all([
          fetchApi('/api/penyakit/getAllPenyakits'),
          fetchApi('/api/pertanyaan/getAllPertanyaans')
        ]);
        
        const jsonPenyakit = await resPenyakit.json().catch(() => ({}));
        if (resPenyakit.ok) {
          setPenyakitList(jsonPenyakit.Data || jsonPenyakit.data || []);
        }

        const jsonPertanyaan = await resPertanyaan.json().catch(() => ({}));
        if (resPertanyaan.ok) {
          setPertanyaanList(jsonPertanyaan.Data || jsonPertanyaan.data || []);
        }
      } catch (e) {
        toast.error('Gagal memuat data penyakit atau pertanyaan');
      }
    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    kode_penyakit: '',
    kode_pertanyaan: '',
    min_value: 0,
    is_mandatory: 1, // 1 = Wajib, 0 = Opsional
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        kode_penyakit: formData.kode_penyakit,
        kode_pertanyaan: formData.kode_pertanyaan,
        min_value: Number(formData.min_value),
        is_mandatory: Number(formData.is_mandatory),
      };

      const res = await fetchApi('/api/aturan/createAturan', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Aturan basis pengetahuan berhasil ditambahkan!');
        router.push('/pakar/basisdata/aturan');
      } else {
        toast.error(json.Message || json.error || 'Gagal menyimpan aturan.');
      }
    } catch (error) {
      toast.error('Kesalahan jaringan, gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData((f) => ({ ...f, [field]: e.target.value }));

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-base";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/pakar/basisdata/aturan" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Aturan
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Aturan Diagnosis</h1>
        <p className="text-slate-500 text-base mt-2">Buat relasi baru antara Penyakit dan Pertanyaan gejala.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">

          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Link2 className="w-5 h-5 text-blue-600" /> Relasi Pengetahuan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kode Penyakit</label>
                <select
                  className={inputClass}
                  required
                  value={formData.kode_penyakit}
                  onChange={set('kode_penyakit')}
                >
                  <option value="" disabled>Pilih Penyakit</option>
                  {penyakitList.map(p => (
                    <option key={p.penyakit_uid} value={p.kode_penyakit}>
                      {p.kode_penyakit} - {p.nama_penyakit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kode Pertanyaan</label>
                <select
                  className={inputClass}
                  required
                  value={formData.kode_pertanyaan}
                  onChange={set('kode_pertanyaan')}
                >
                  <option value="" disabled>Pilih Pertanyaan</option>
                  {pertanyaanList.map(p => (
                    <option key={p.pertanyaan_uid} value={p.kode_pertanyaan}>
                      {p.kode_pertanyaan} - {p.pertanyaan.substring(0, 50)}{p.pertanyaan.length > 50 ? '...' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Minimal Jawaban (Skor/Nilai)</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="0"
                  min="0"
                  required
                  value={formData.min_value}
                  onChange={set('min_value')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Sifat Pertanyaan</label>
                <select
                  className={inputClass}
                  value={formData.is_mandatory}
                  onChange={set('is_mandatory')}
                  required
                >
                  <option value={1}>Wajib Dijawab (Mandatory)</option>
                  <option value={0}>Opsional</option>
                </select>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/pakar/basisdata/aturan" className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Aturan
          </button>
        </div>
      </form>
    </div>
  );
}
