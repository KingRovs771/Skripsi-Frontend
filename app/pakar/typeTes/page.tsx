'use client';
import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, ArrowLeft, Save, Loader2, LayoutGrid, Activity } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type ViewMode = 'list' | 'form';

export default function KategoriTesPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Mock Data Kategori
  const [categories, setCategories] = useState([
    { id: 1, nama: 'Kecemasan (Anxiety)', kode: 'GAD7', deskripsi: 'Tes untuk mengukur tingkat kecemasan berlebih.' },
    { id: 2, nama: 'Depresi', kode: 'PHQ9', deskripsi: 'Tes indikasi gejala depresi pada siswa.' },
    { id: 3, nama: 'Stress Akademik', kode: 'STR', deskripsi: 'Tes tekanan mental terkait beban belajar.' },
  ]);

  const [formData, setFormData] = useState({ nama: '', kode: '', deskripsi: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulasi API Call
    setTimeout(() => {
      toast.success('Kategori tes berhasil disimpan');
      setLoading(false);
      setView('list');
    }, 800);
  };

  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const handleDelete = () => {
    setCategories(categories.filter((c) => c.id !== selectedId));
    toast.success('Kategori telah dihapus');
    setOpenConfirm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {view === 'list' ? (
        <>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Kategori Tes Diagnosis</h1>
              <p className="text-slate-500 text-sm">Kelola pengelompokan jenis tes kesehatan mental.</p>
            </div>
            <button
              onClick={() => {
                setFormData({ nama: '', kode: '', deskripsi: '' });
                setView('form');
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Kategori
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input placeholder="Cari kategori..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" />
          </div>

          {/* GRID LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:border-blue-500 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-slate-900">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900">{cat.nama}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{cat.kode}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">{cat.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* FORM CREATE / EDIT */
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <button onClick={() => setView('list')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-xl font-semibold text-slate-900">Input Kategori Tes</h2>
              <p className="text-slate-500 text-sm">Tambahkan kategori baru untuk mengelompokkan instrumen tes.</p>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama Kategori</label>
                  <input className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-semibold" placeholder="Contoh: Kecemasan" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Kode Singkat</label>
                  <input className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-bold uppercase" placeholder="ANX" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Deskripsi Singkat</label>
                <textarea
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[120px] resize-none text-sm text-slate-600"
                  placeholder="Jelaskan tujuan kategori tes ini..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setView('list')} className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Simpan Kategori
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALERT DIALOG DELETE */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-white rounded-2xl max-w-sm border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>Kategori yang dihapus akan hilang dari pilihan saat membuat tes baru.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
