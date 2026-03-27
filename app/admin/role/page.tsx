'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Pencil, Trash2, ArrowLeft, Save, ChevronRight, Lock, Settings2, Loader2, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type ViewMode = 'list' | 'create' | 'edit';

interface RoleData {
  id: number;
  role_id: number;
  role_uid: string;
  role_name: string;
  description: string;
  user_count?: number; // Backend tak return ini secara langsung sbg agregat, tp bisa diabaikan atau diset 0.
}

export default function ManajemenRolePage() {
  const [view, setView] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete State
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch Roles ──
  const fetchRoles = async () => {
    setIsFetching(true);
    try {
      const res = await fetchApi('/api/role/getRole');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setRoles(json.Data || json.data || []);
      } else {
        toast.error(json.Message || 'Gagal memuat data role');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Masuk ke Mode Edit
  const handleEditClick = (role: RoleData) => {
    setSelectedRole(role);
    setFormData({ name: role.role_name, description: role.description });
    setView('edit');
  };

  // Reset Form
  const resetForm = () => {
    setView('list');
    setFormData({ name: '', description: '' });
    setSelectedRole(null);
  };

  // ── Save or Update ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        role_name: formData.name.toUpperCase(),
        description: formData.description,
      };

      if (view === 'create') {
        const res = await fetchApi('/api/role/createRole', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));

        if (res.ok) {
          toast.success('Role baru berhasil ditambahkan!');
          fetchRoles();
          resetForm();
        } else {
          toast.error(json.Message || 'Gagal menambahkan role');
        }
      } else if (view === 'edit' && selectedRole) {
        const res = await fetchApi(`/api/role/updateRole/${selectedRole.role_uid}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));

        if (res.ok) {
          toast.success('Perubahan role berhasil disimpan!');
          fetchRoles();
          resetForm();
        } else {
          toast.error(json.Message || 'Gagal memperbarui role');
        }
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete Role ──
  const onClickDelete = (uid: string) => {
    setDeletingUid(uid);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUid) return;
    setIsDeleting(true);
    try {
      const res = await fetchApi(`/api/role/deleteRole/${deletingUid}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Role berhasil dihapus!');
        setRoles((prev) => prev.filter((r) => r.role_uid !== deletingUid));
      } else {
        toast.error(json.Message || 'Gagal menghapus role');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setIsDeleting(false);
      setOpenConfirm(false);
      setDeletingUid(null);
    }
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
            <button onClick={() => setView('create')} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Tambah Role
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Cari role..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-sm transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Memuat data role...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-200 rounded-3xl border-dashed">
              <ShieldCheck className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-sm font-medium">{searchQuery ? 'Tidak ada role yang cocok' : 'Belum ada data role'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRoles.map((role) => (
                <div key={role.role_uid || role.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-all">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(role)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onClickDelete(role.role_uid)} className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{role.role_name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{role.description || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dialog Konfirmasi Hapus */}
          <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
            <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold text-slate-900">
                  Hapus Role?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 leading-relaxed">
                  Tindakan ini tidak dapat dibatalkan. Role akan dihapus secara permanen dari sistem.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 gap-3">
                <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 transition-all"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
              <p className="text-slate-500 text-sm mt-1">Sesuaikan nama dan deskripsi tanggung jawab peran tersebut.</p>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Role (Akses ID)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none font-bold uppercase transition-all shadow-sm"
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
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none min-h-[140px] resize-none text-sm text-slate-700 leading-relaxed shadow-sm"
                  placeholder="Jelaskan otoritas dari role ini secara singkat..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <Settings2 className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[12px] text-amber-700 leading-relaxed font-medium">Catatan: Nama role akan digunakan oleh sistem untuk memetakan akses halaman. Harap berhati-hati saat mengubah nama role yang sudah aktif karena bisa menyebabkan masalah otorisasi.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-300">
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
