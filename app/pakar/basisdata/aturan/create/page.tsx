'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Link2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import SimulationModal from '@/components/SimulationModal';

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
    tipe_aturan: 'GEJALA_INTI', // GEJALA_INTI / RED_FLAG
    berlaku_untuk_semua_tingkat: false,
  });

  const [openSim, setOpenSim] = useState(false);

  const handleTipeAturanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData((f) => ({
      ...f,
      tipe_aturan: val,
      ...(val === 'RED_FLAG'
        ? { kode_penyakit: 'ALL', berlaku_untuk_semua_tingkat: true }
        : { kode_penyakit: f.kode_penyakit === 'ALL' ? '' : f.kode_penyakit, berlaku_untuk_semua_tingkat: false }),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode_penyakit || !formData.kode_pertanyaan) {
      toast.error('Silakan pilih penyakit/kategori dan pertanyaan terlebih dahulu');
      return;
    }
    setOpenSim(true);
  };

  const handleSaveRule = async () => {
    setOpenSim(false);
    setLoading(true);

    try {
      const payload = {
        kode_penyakit: formData.kode_penyakit,
        kode_pertanyaan: formData.kode_pertanyaan,
        min_value: Number(formData.min_value),
        is_mandatory: Number(formData.is_mandatory),
        tipe_aturan: formData.tipe_aturan,
        berlaku_untuk_semua_tingkat: formData.berlaku_untuk_semua_tingkat,
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

  const setCheckbox = (field: 'berlaku_untuk_semua_tingkat') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((f) => ({ ...f, [field]: e.target.checked }));

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
              {/* Tipe Aturan */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tipe Aturan</label>
                <select
                  className={inputClass}
                  value={formData.tipe_aturan}
                  onChange={handleTipeAturanChange}
                  required
                >
                  <option value="GEJALA_INTI">Gejala Inti (Satu Kelas Penyakit)</option>
                  <option value="RED_FLAG">Red Flag (Lintas Semua Tingkat)</option>
                </select>
              </div>

              {/* Kode Penyakit */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kode Penyakit</label>
                {formData.tipe_aturan === 'RED_FLAG' ? (
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold"
                    value="ALL (Berlaku untuk semua penyakit)"
                  />
                ) : (
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
                )}
              </div>

              {/* Kode Pertanyaan */}
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

              {/* Minimal Jawaban */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Minimal Jawaban (Skor/Nilai)</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="0"
                  min="0"
                  max="3"
                  required
                  value={formData.min_value}
                  onChange={set('min_value')}
                />
              </div>

              {/* Sifat Pertanyaan */}
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

              {/* Berlaku untuk Semua Tingkat (Tampil hanya jika bukan RED_FLAG, karena RED_FLAG otomatis true) */}
              {formData.tipe_aturan !== 'RED_FLAG' && (
                <div className="flex items-center space-x-3 pt-8">
                  <input
                    id="berlaku_semua"
                    type="checkbox"
                    checked={formData.berlaku_untuk_semua_tingkat}
                    onChange={setCheckbox('berlaku_untuk_semua_tingkat')}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="berlaku_semua" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    Berlaku untuk Semua Tingkat
                  </label>
                </div>
              )}
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

      {/* Simulasi Modal (Fitur 4) */}
      <SimulationModal
        isOpen={openSim}
        onClose={() => setOpenSim(false)}
        onConfirm={handleSaveRule}
        draftRule={{
          kode_penyakit: formData.kode_penyakit,
          kode_pertanyaan: formData.kode_pertanyaan,
          min_value: Number(formData.min_value),
          is_mandatory: Number(formData.is_mandatory),
          tipe_aturan: formData.tipe_aturan,
          berlaku_untuk_semua_tingkat: formData.berlaku_untuk_semua_tingkat,
        }}
      />
    </div>
  );
}
