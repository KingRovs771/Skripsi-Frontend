'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Pencil, Trash2, ArrowLeft, Save, ChevronRight, Lock, Settings2, Loader2, UserCircle } from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'list' | 'create' | 'edit';

interface RoleData {
  id: number;
  name: string;
  description: string;
  user_count: number;
}

export default function ManajemenRolePage() {
  const [view, setView] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Mock Data Lengkap (Termasuk SISWA)
  const [roles, setRoles] = useState<RoleData[]>([
    { id: 1, name: 'ADMIN', description: 'Akses penuh ke konfigurasi sistem, manajemen sekolah, dan kontrol seluruh pengguna.', user_count: 3 },
    { id: 2, name: 'PAKAR', description: 'Mengelola instrumen tes diagnosis, membuat artikel edukasi, dan menjawab konsultasi klinis.', user_count: 12 },
    { id: 3, name: 'GURU_BK', description: 'Memantau hasil diagnosis siswa di sekolah masing-masing dan memberikan tindak lanjut awal.', user_count: 45 },
    { id: 4, name: 'SISWA', description: 'Mengakses instrumen tes kesehatan mental, melihat riwayat diagnosis pribadi, dan membaca artikel.', user_count: 850 },
  ]);

  // Masuk ke Mode Edit
  const handleEditClick = (role: RoleData) => {
    setSelectedRole(role);
    setFormData({ name: role.name, description: role.description });
    setView('edit');
  };

  // Reset Form
  const resetForm = () => {
    setView('list');
    setFormData({ name: '', description: '' });
    setSelectedRole(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi integrasi API
    setTimeout(() => {
      if (view === 'create') {
        const newRole = {
          id: roles.length + 1,
          name: formData.name.toUpperCase(),
          description: formData.description,
          user_count: 0,
        };
        setRoles([...roles, newRole]);
        alert('Role baru berhasil ditambahkan!');
      } else {
        setRoles(roles.map((r) => (r.id === selectedRole?.id ? { ...r, name: formData.name, description: formData.description } : r)));
        alert('Perubahan role berhasil disimpan!');
      }
      setLoading(false);
      resetForm();
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {view === 'list' ? (
        <>
          {/* HEADER LIST */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Pengaturan Hak Akses</h1>
              <p className="text-slate-500 text-sm">Kelola peran pengguna untuk membatasi akses fitur sesuai otoritas.</p>
            </div>
            <button onClick={() => setView('create')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Tambah Role
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input placeholder="Cari role..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(role)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{role.name}</h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{role.user_count} Pengguna</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* FORM CREATE & EDIT */
        <div className="max-w-2xl mx-auto space-y-6">
          <button onClick={resetForm} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-xl font-semibold text-slate-900">{view === 'create' ? 'Buat Role Baru' : 'Perbarui Role'}</h2>
              <p className="text-slate-500 text-sm">Sesuaikan nama dan deskripsi tanggung jawab peran tersebut.</p>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Role (ID)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold uppercase transition-all"
                    placeholder="Contoh: SISWA_REGULER"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Deskripsi Role</label>
                <textarea
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[140px] resize-none text-sm text-slate-600 leading-relaxed"
                  placeholder="Jelaskan otoritas dari role ini secara singkat..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                <Settings2 className="w-5 h-5 text-slate-400 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed italic">Catatan: Nama role akan digunakan oleh sistem untuk memetakan akses halaman. Harap berhati-hati saat mengubah nama role yang sudah aktif.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:bg-slate-300">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> {view === 'create' ? 'Simpan Role' : 'Simpan Perubahan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
