'use client';
import React, { useState, useEffect } from 'react';
import { School, PlusCircle, Search, Pencil, Trash2, ArrowLeft, Save, Loader2, MapPin, Hash, GraduationCap } from 'lucide-react';

interface SchoolData {
  id: number;
  npsn: string;
  nama: string;
  jenjang: string;
  alamat: string;
}

export default function ManajemenSekolahPage() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    npsn: '',
    nama: '',
    jenjang: '',
    alamat: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      // Ganti dengan API Go Anda: http://localhost:8080/api/admin/sekolah
      const response = await fetch('http://localhost:8080/api/admin/sekolah');
      const data = await response.json();
      setSchools(data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data sekolah');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/sekolah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Sekolah berhasil ditambahkan!');
        setFormData({ npsn: '', nama: '', jenjang: '', alamat: '' });
        setView('list');
        fetchSchools();
      }
    } catch (error) {
      alert('Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSchools = schools.filter((s) => s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.npsn.includes(searchTerm));

  return (
    <div className="space-y-6">
      {view === 'list' ? (
        <>
          {/* HEADER LIST */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Sekolah</h1>
              <p className="text-slate-500">Kelola daftar instansi pendidikan yang terintegrasi dalam sistem.</p>
            </div>
            <button onClick={() => setView('create')} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
              <PlusCircle className="w-5 h-5" /> Tambah Sekolah
            </button>
          </div>

          {/* SEARCH & FILTER */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan NPSN atau Nama Sekolah..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABEL SEKOLAH */}
          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">NPSN</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">Nama Sekolah</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">Jenjang</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">Alamat</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-slate-300">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 font-mono text-sm text-slate-500 font-bold">{school.npsn}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                            <School className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-900">{school.nama}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">{school.jenjang}</span>
                      </td>
                      <td className="p-5 text-sm text-slate-500 max-w-xs truncate">{school.alamat}</td>
                      <td className="p-5 text-right space-x-2">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* FORM CREATE SECTION */
        <div className="max-w-3xl mx-auto space-y-6">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
          </button>

          <div className="bg-white border-2 border-slate-900 rounded-[32px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <PlusCircle className="w-6 h-6 text-green-400" /> Daftarkan Sekolah Baru
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Lengkapi data NPSN dan Jenjang dengan benar untuk validasi siswa.</p>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="w-3 h-3" /> NPSN Sekolah
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 transition-all font-bold"
                    placeholder="Contoh: 20311xxx"
                    required
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" /> Jenjang Pendidikan
                  </label>
                  <select
                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 transition-all font-bold"
                    required
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                  >
                    <option value="">Pilih Jenjang</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <School className="w-3 h-3" /> Nama Lengkap Sekolah
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 transition-all font-bold"
                    placeholder="Contoh: SMP Negeri 1 Sragen"
                    required
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Alamat Lengkap
                  </label>
                  <textarea
                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 transition-all font-medium min-h-[120px] resize-none"
                    placeholder="Alamat lengkap instansi..."
                    required
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Simpan Data
                    </>
                  )}
                </button>
                <button type="button" onClick={() => setView('list')} className="flex-1 bg-white border-2 border-slate-200 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
