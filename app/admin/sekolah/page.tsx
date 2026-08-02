'use client';
import React, { useState, useEffect } from 'react';
import { School, PlusCircle, Search, Pencil, Trash2, ArrowLeft, Save, Loader2, MapPin, Hash, GraduationCap, UserCheck, X, ChevronDown } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface SchoolData {
  sekolah_id: number;
  sekolah_uid: string;
  npsn: number;
  nama_sekolah: string;
  jenjang: string;
  alamat_sekolah: string;
  created_at: string;
  update_at: string;
  // Pakar yang diberi tanggung jawab (null jika belum ditugaskan)
  pakar_uid?: string | null;
  pakar_nama?: string | null;
}

interface PakarOption {
  pakar_uid: string;
  user_uid?: string;
  nama_lengkap: string;
  spesialisasi?: string;
  jenis_spesialis?: string;
}

// ─── Modal Assign Pakar ──────────────────────────────────────────────────────

function PakarAssignModal({
  school,
  pakars,
  onClose,
  onSaved,
}: {
  school: SchoolData;
  pakars: PakarOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selectedPakarUid, setSelectedPakarUid] = useState<string>(
    school.pakar_uid ?? ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchApi(`/api/admin/sekolah/${school.sekolah_uid}/assign-pakar`, {
        method: 'PUT',
        body: JSON.stringify({ pakar_uid: selectedPakarUid || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(`Pakar berhasil ditugaskan ke ${school.nama_sekolah}`);
        onSaved();
        onClose();
      } else {
        toast.error(json.Message || json.message || 'Gagal menyimpan penugasan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="font-black text-white text-lg">Tugaskan Pakar</h2>
            <p className="text-slate-400 text-sm mt-0.5">{school.nama_sekolah}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Pilih Pakar Penanggung Jawab
            </label>
            <div className="relative">
              <select
                value={selectedPakarUid}
                onChange={(e) => setSelectedPakarUid(e.target.value)}
                className="w-full p-3.5 pr-10 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none focus:outline-none focus:border-slate-900 transition-all font-medium text-slate-900"
              >
                <option value="">— Tidak Ada (Lepas Penugasan) —</option>
                {pakars.map((p) => (
                  <option
                    key={p.pakar_uid || p.user_uid}
                    value={p.pakar_uid || p.user_uid || ''}
                  >
                    {p.nama_lengkap}
                    {(p.spesialisasi || p.jenis_spesialis)
                      ? ` — ${p.spesialisasi || p.jenis_spesialis}`
                      : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {school.pakar_nama && (
            <p className="text-xs text-slate-500">
              Saat ini ditugaskan ke:{' '}
              <strong className="text-slate-900">{school.pakar_nama}</strong>
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex justify-center items-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Penugasan
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-500 py-3.5 rounded-2xl font-black hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManajemenSekolahPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State untuk modal assign pakar
  const [assignTarget, setAssignTarget] = useState<SchoolData | null>(null);
  const [pakars, setPakars] = useState<PakarOption[]>([]);
  const [pakarsLoading, setPakarsLoading] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    npsn: '',
    nama_sekolah: '',
    jenjang: '',
    alamat_sekolah: '',
  });

  useEffect(() => {
    fetchSchools();
    fetchPakars();
  }, []);

  const fetchPakars = async () => {
    setPakarsLoading(true);
    try {
      const res  = await fetchApi('/api/admin/users/pakars', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setPakars(json.Data || json.data || []);
      }
    } catch {
      console.warn('Gagal memuat daftar pakar');
    } finally {
      setPakarsLoading(false);
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await fetchApi('/school/getSchool', {
        method: 'GET',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil data');
      }

      // Sama seperti di profile, Golang cenderung mengembalikan response di property "Data" dengan huruf kapital
      const schoolsData = data.Data || data.data || [];
      setSchools(schoolsData);

      console.log('Data Sekolah dari API:', schoolsData);
    } catch (error) {
      console.error('Gagal mengambil data sekolah:', error);
      // Agar errornya tidak tersembunyi, kita bisa tambahkan toast.error disini jika import 'sonner' ada.
      // toast.error('Gagal memuat data sekolah dari server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Pastikan npsn dikonversi ke angka yang valid
      const parsedNpsn = parseInt(formData.npsn, 10);
      if (isNaN(parsedNpsn)) {
        alert("NPSN harus berupa angka!");
        return;
      }

      const payload = {
        npsn: parsedNpsn,
        nama_sekolah: formData.nama_sekolah,
        jenjang: formData.jenjang,
        alamat_sekolah: formData.alamat_sekolah,
      };

      console.log("Mengirim payload sekolah ke Go:", payload);

      const response = await fetchApi('/school/createSchool', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      console.log("Respon Create GOlang:", data);

      if (response.ok) {
        alert('Sekolah berhasil ditambahkan!');
        setFormData({ npsn: '', nama_sekolah: '', jenjang: '', alamat_sekolah: '' });
        setView('list');
        fetchSchools();
      } else {
        // Sesuaikan dengan respon c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        alert(data.error || data.message || 'Terjadi kesalahan saat menambahkan sekolah');
      }
    } catch (error) {
      alert('Terjadi kesalahan konektivitas.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMode = (school: SchoolData) => {
    setFormData({
      npsn: school.npsn.toString(),
      nama_sekolah: school.nama_sekolah,
      jenjang: school.jenjang,
      alamat_sekolah: school.alamat_sekolah,
    });
    setEditingId(school.sekolah_uid);
    setView('edit');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      const parsedNpsn = parseInt(formData.npsn, 10);
      if (isNaN(parsedNpsn)) {
        alert("NPSN harus berupa angka!");
        return;
      }

      const payload = {
        npsn: parsedNpsn,
        nama_sekolah: formData.nama_sekolah,
        jenjang: formData.jenjang,
        alamat_sekolah: formData.alamat_sekolah,
      };

      // Catatan: Jika endpoint GOlang Anda bernama lain, silakan ubah string dibawah (misal `/school/update/${editingId}`)
      const response = await fetchApi(`/school/updateSchool/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert('Sekolah berhasil diperbarui!');
        setFormData({ npsn: '', nama_sekolah: '', jenjang: '', alamat_sekolah: '' });
        setView('list');
        fetchSchools();
      } else {
        alert(data.error || data.message || 'Terjadi kesalahan saat memperbarui sekolah');
      }
    } catch (error) {
      alert('Terjadi kesalahan konektivitas.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data sekolah ini?')) return;
    try {
      // Catatan: Jika endpoint GOlang Anda bernama lain, silakan ubah (misal `/school/delete/${id}`)
      const response = await fetchApi(`/school/deleteSchool/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Sekolah berhasil dihapus!');
        fetchSchools();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || data.message || 'Gagal menghapus sekolah');
      }
    } catch (error) {
      alert('Terjadi kesalahan konektivitas.');
    }
  };

  const filteredSchools = schools.filter(
    (s) =>
      s.nama_sekolah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.npsn?.toString().includes(searchTerm)
  );

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
            <button
              onClick={() => {
                setView('create');
                setEditingId(null);
                setFormData({ npsn: '', nama_sekolah: '', jenjang: '', alamat_sekolah: '' });
              }}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
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
          <div className="bg-white border border-slate-200 rounded-[32px] overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">NPSN</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">Nama Sekolah</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">Jenjang</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">Alamat</th>
                  <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-widest">Pakar Binaan</th>
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
                    <tr key={school.sekolah_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 font-mono text-sm text-slate-500 font-bold">{school.npsn}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                            <School className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-900">{school.nama_sekolah}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">{school.jenjang}</span>
                      </td>
                      <td className="p-5 text-sm text-slate-500 max-w-xs truncate">{school.alamat_sekolah}</td>
                      {/* Kolom Pakar Binaan */}
                      <td className="p-5">
                        {school.pakar_nama ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <UserCheck className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{school.pakar_nama}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 font-medium italic">Belum ditugaskan</span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setAssignTarget(school)}
                            title="Tugaskan Pakar"
                            className="p-2 text-blue-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditMode(school)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(school.sekolah_uid)} className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* FORM CREATE & EDIT SECTION */
        <div className="max-w-3xl mx-auto space-y-6">
          <button onClick={() => { setView('list'); setEditingId(null); setFormData({ npsn: '', nama_sekolah: '', jenjang: '', alamat_sekolah: '' }); }} className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
          </button>

          <div className="bg-white border-2 border-slate-900 rounded-[32px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black flex items-center gap-3">
                {view === 'edit' ? <Pencil className="w-6 h-6 text-blue-400" /> : <PlusCircle className="w-6 h-6 text-green-400" />}
                {view === 'edit' ? 'Edit Data Sekolah' : 'Daftarkan Sekolah Baru'}
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                {view === 'edit' ? 'Perbarui informasi sekolah di bawah ini.' : 'Lengkapi data NPSN dan Jenjang dengan benar untuk validasi siswa.'}
              </p>
            </div>

            <form onSubmit={view === 'edit' ? handleUpdate : handleCreate} className="p-8 space-y-6">
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
                    value={formData.npsn}
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
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                  >
                    <option value="">Pilih Jenjang</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA / SMK</option>
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
                    value={formData.nama_sekolah}
                    onChange={(e) => setFormData({ ...formData, nama_sekolah: e.target.value })}
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
                    value={formData.alamat_sekolah}
                    onChange={(e) => setFormData({ ...formData, alamat_sekolah: e.target.value })}
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

      {/* Modal Assign Pakar */}
      {assignTarget && (
        <PakarAssignModal
          school={assignTarget}
          pakars={pakars}
          onClose={() => setAssignTarget(null)}
          onSaved={fetchSchools}
        />
      )}
    </div>
  );
}
